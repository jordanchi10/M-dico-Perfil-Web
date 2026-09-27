/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalLandingData } from "../types";

/**
 * Convierte un DataURL (base64 o texto codificado como SVG/XML) a un Blob de JavaScript
 * de forma completamente segura, soportando emojis, caracteres multibyte UTF-8 y SVG en texto plano.
 */
export function dataUrlToBlob(dataUrl: string): { blob: Blob; extension: string } | null {
  try {
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return null;
    }

    // Un DataURL cumple el formato: data:[<mediatype>][;base64],<data>
    const commaIndex = dataUrl.indexOf(",");
    if (commaIndex === -1) return null;

    const header = dataUrl.slice(0, commaIndex);
    const rawData = dataUrl.slice(commaIndex + 1);

    // Extraer MIME type eliminando el prefijo "data:"
    const headerParts = header.slice(5).split(";");
    let mimeType = headerParts[0]?.trim().toLowerCase() || "image/webp";
    if (!mimeType) mimeType = "image/webp";

    const isBase64 = headerParts.some((p) => p.trim().toLowerCase() === "base64");

    let extension = "webp";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) extension = "jpg";
    else if (mimeType.includes("png")) extension = "png";
    else if (mimeType.includes("svg")) extension = "svg";
    else if (mimeType.includes("webp")) extension = "webp";
    else if (mimeType.includes("gif")) extension = "gif";
    else if (mimeType.includes("ico") || mimeType.includes("icon")) extension = "ico";

    // CASO 1: Data URL en texto plano o percent-encoded (ej: data:image/svg+xml,<svg>🩺</svg>)
    // Nunca debe ejecutarse atob() sobre contenido que no sea Base64
    if (!isBase64) {
      let decodedText: string;
      try {
        decodedText = decodeURIComponent(rawData);
      } catch {
        try {
          decodedText = unescape(rawData);
        } catch {
          decodedText = rawData;
        }
      }
      return {
        blob: new Blob([decodedText], { type: mimeType.includes("svg") ? "image/svg+xml;charset=utf-8" : mimeType }),
        extension
      };
    }

    // CASO 2: Data URL codificado en Base64
    let cleanBase64 = rawData.trim();
    if (cleanBase64.includes("%")) {
      try {
        cleanBase64 = decodeURIComponent(cleanBase64);
      } catch {
        // Mantener tal como está
      }
    }
    // Remover espacios y saltos de línea incidentales
    cleanBase64 = cleanBase64.replace(/[\s\r\n]+/g, "");
    // Reemplazar caracteres de Base64 URL-safe (- y _) a Base64 estándar (+ y /)
    cleanBase64 = cleanBase64.replace(/-/g, "+").replace(/_/g, "/");
    // Completar relleno con '=' si es necesario
    while (cleanBase64.length % 4 !== 0) {
      cleanBase64 += "=";
    }

    try {
      const byteString = atob(cleanBase64);
      const len = byteString.length;
      const ia = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return {
        blob: new Blob([ia], { type: mimeType }),
        extension
      };
    } catch {
      // Si atob falla por caracteres fuera de Latin-1 o estructura no estándar:
      if (mimeType.includes("svg") || mimeType.includes("xml") || mimeType.includes("text")) {
        const encoder = new TextEncoder();
        return {
          blob: new Blob([encoder.encode(rawData)], { type: mimeType }),
          extension
        };
      }

      // Decodificación binaria resiliente alternativa para caracteres multibyte
      try {
        const binaryStr = unescape(encodeURIComponent(cleanBase64));
        const ia = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          ia[i] = binaryStr.charCodeAt(i);
        }
        return {
          blob: new Blob([ia], { type: mimeType }),
          extension
        };
      } catch {
        return null;
      }
    }
  } catch (err) {
    console.error("Error al convertir dataUrl a Blob:", err);
    return null;
  }
}

/**
 * Descarga una imagen externa y la devuelve como Blob
 */
export async function fetchExternalImageAsBlob(url: string): Promise<{ blob: Blob; extension: string } | null> {
  try {
    if (!url || !url.startsWith("http")) return null;
    
    // Primero intentar fetch directo
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    
    let extension = "webp";
    if (blob.type.includes("jpeg") || blob.type.includes("jpg")) extension = "jpg";
    else if (blob.type.includes("png")) extension = "png";
    else if (blob.type.includes("svg")) extension = "svg";
    else if (blob.type.includes("webp")) extension = "webp";
    else {
      // Intentar deducir de la URL
      const cleanUrl = url.split("?")[0].toLowerCase();
      if (cleanUrl.endsWith(".png")) extension = "png";
      else if (cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg")) extension = "jpg";
      else if (cleanUrl.endsWith(".svg")) extension = "svg";
      else if (cleanUrl.endsWith(".webp")) extension = "webp";
    }

    return { blob, extension };
  } catch {
    // Si fetch directo falla por CORS, intentar dibujar a través de Image y Canvas
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve({ blob, extension: "webp" });
            } else {
              resolve(null);
            }
          }, "image/webp", 0.85);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = url;
    });
  }
}

export interface PreparedExportAsset {
  filename: string; // ej: "img/medico-principal.webp"
  blob: Blob;
  originalUrl: string;
}

export interface ProcessedExportData {
  exportedData: MedicalLandingData;
  assets: PreparedExportAsset[];
}

/**
 * Procesa la data completa del médico para preparar los assets locales /img/ del hosting.
 * Convierte DataURLs y URLs externas descargables en archivos físicos relativos en 'img/',
 * garantizando la máxima solidez, velocidad y autonomía en cPanel/Hosting.
 */
export async function prepareDataForHostingExport(data: MedicalLandingData): Promise<ProcessedExportData> {
  // Clon profundo de la estructura de datos
  const exportedData: MedicalLandingData = JSON.parse(JSON.stringify(data));
  const assets: PreparedExportAsset[] = [];

  // Helper para procesar una imagen y obtener su ruta local
  async function processImage(
    url: string | undefined, 
    baseName: string, 
    forceLocal: boolean = true
  ): Promise<string> {
    if (!url || !url.trim()) return url || "";
    const trimmed = url.trim();

    // Caso 1: Es DataURL (Base64 generado por el conversor WebP o carga local)
    if (trimmed.startsWith("data:")) {
      const converted = dataUrlToBlob(trimmed);
      if (converted) {
        const filename = `img/${baseName}.${converted.extension}`;
        assets.push({
          filename,
          blob: converted.blob,
          originalUrl: trimmed
        });
        return filename;
      }
      return trimmed;
    }

    // Caso 2: Es una URL externa HTTP/HTTPS
    if (trimmed.startsWith("http")) {
      if (forceLocal) {
        const fetched = await fetchExternalImageAsBlob(trimmed);
        if (fetched) {
          const filename = `img/${baseName}.${fetched.extension}`;
          assets.push({
            filename,
            blob: fetched.blob,
            originalUrl: trimmed
          });
          return filename;
        }
      }
      // Si no se pudo descargar o no se pudo convertir, mantener la URL externa intacta
      return trimmed;
    }

    // Caso 3: Ya es una ruta relativa (ej: "img/foto.webp")
    return trimmed;
  }

  // 1. FOTO PRINCIPAL DEL MÉDICO
  if (data.fotoUrl) {
    exportedData.fotoUrl = await processImage(data.fotoUrl, "medico-principal");
  }

  // 2. LOGOTIPO OFICIAL
  if (data.logoUrl) {
    exportedData.logoUrl = await processImage(data.logoUrl, "logo-medico");
  }

  // 3. FAVICON E ÍCONO PWA
  if (data.faviconUrl) {
    exportedData.faviconUrl = await processImage(data.faviconUrl, "favicon");
  }
  if (data.pwaIconUrl) {
    exportedData.pwaIconUrl = await processImage(data.pwaIconUrl, "pwa-icon");
  }

  // 4. IMAGEN OPEN GRAPH PARA REDES SOCIALES
  if (data.ogImageUrl) {
    exportedData.ogImageUrl = await processImage(data.ogImageUrl, "og-share-banner");
  }

  // 5. FONDO PANORÁMICO DEL HERO (si es imagen)
  if (data.imagenFondoHero) {
    exportedData.imagenFondoHero = await processImage(data.imagenFondoHero, "hero-background");
  }

  // 6. GALERÍA DE FOTOS DEL CONSULTORIO / INSTALACIONES
  if (data.fotosConsultorio && data.fotosConsultorio.length > 0) {
    exportedData.fotosConsultorio = await Promise.all(
      data.fotosConsultorio.map(async (foto, index) => {
        const localUrl = await processImage(foto.url, `consultorio-${index + 1}`);
        return {
          ...foto,
          url: localUrl
        };
      })
    );
  }

  // 7. CASOS ANTES Y DESPUÉS
  if (data.casosAntesDespues && data.casosAntesDespues.length > 0) {
    exportedData.casosAntesDespues = await Promise.all(
      data.casosAntesDespues.map(async (caso, index) => {
        const imgBeforeLocal = caso.imgBefore ? await processImage(caso.imgBefore, `caso-${index + 1}-antes`) : caso.imgBefore;
        const imgAfterLocal = caso.imgAfter ? await processImage(caso.imgAfter, `caso-${index + 1}-despues`) : caso.imgAfter;
        return {
          ...caso,
          imgBefore: imgBeforeLocal,
          imgAfter: imgAfterLocal
        };
      })
    );
  }

  // 8. FOTOS DE TRATAMIENTOS / SERVICIOS (si tienen)
  if (data.servicios && data.servicios.length > 0) {
    exportedData.servicios = await Promise.all(
      data.servicios.map(async (srv, index) => {
        if (srv.imagenUrl) {
          const srvImgLocal = await processImage(srv.imagenUrl, `servicio-${index + 1}`);
          return {
            ...srv,
            imagenUrl: srvImgLocal
          };
        }
        return srv;
      })
    );
  }

  // 9. GUÍAS Y RECURSOS EN PDF / EBOOKS (portadas si tienen)
  if (data.guiasPacientes && data.guiasPacientes.length > 0) {
    exportedData.guiasPacientes = await Promise.all(
      data.guiasPacientes.map(async (guia, index) => {
        if (guia.imagenPortadaUrl) {
          const portadaLocal = await processImage(guia.imagenPortadaUrl, `guia-${index + 1}-portada`);
          return {
            ...guia,
            imagenPortadaUrl: portadaLocal
          };
        }
        return guia;
      })
    );
  }

  return {
    exportedData,
    assets
  };
}
