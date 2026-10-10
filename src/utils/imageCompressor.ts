/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 - 1.0
  format?: "image/webp" | "image/jpeg" | "image/png";
  squareCrop?: boolean; // Para forzar relación de aspecto 1:1 si es foto de perfil
}

export interface CompressResult {
  dataUrl: string;
  originalSize: number; // en bytes
  compressedSize: number; // en bytes
  savingsPercent: number; // ej. 85.5
  format: string; // ej. "WebP"
  width: number;
  height: number;
  originalName?: string;
}

/**
 * Convierte y comprime una imagen (File o DataURL) al formato WebP de alto rendimiento SEO.
 * Preserva 100% la relación de aspecto original sin recortar (a menos que squareCrop sea true).
 */
export async function compressAndConvertToWebP(
  input: File | string,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.80,
    format = "image/webp",
    squareCrop = false
  } = options;

  let originalSize = 0;
  let originalName = "";
  let dataUrlSrc = "";

  if (typeof input === "string") {
    dataUrlSrc = input;
    // Estimar tamaño desde base64
    originalSize = Math.round((input.length * 3) / 4);
  } else {
    originalName = input.name;
    originalSize = input.size;
    dataUrlSrc = await readFileAsDataURL(input);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let { width, height } = img;
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = width;
        let sourceHeight = height;

        // Recorte cuadrado opcional (solo para foto de perfil 1:1 si se solicita explícitamente)
        if (squareCrop) {
          const minDim = Math.min(width, height);
          sourceX = (width - minDim) / 2;
          sourceY = (height - minDim) / 2;
          sourceWidth = minDim;
          sourceHeight = minDim;
          width = minDim;
          height = minDim;
        } else {
          // Escalado proporcional perfecto que NUNCA recorta la imagen
          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del canvas"));
          return;
        }

        // Renderizado con máxima calidad de suavizado bicúbico
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Si es transparente y convertimos a JPEG, rellenar fondo blanco
        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }

        // Dibujar en canvas preservando la imagen completa
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          width,
          height
        );

        // Convertir a WebP
        let compressedDataUrl = canvas.toDataURL(format, quality);

        // Si el navegador no soporta webp en toDataURL, reintenta con JPEG
        if (format === "image/webp" && !compressedDataUrl.startsWith("data:image/webp")) {
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
        const savingsPercent = Math.max(
          0,
          Math.round(((originalSize - compressedSize) / Math.max(1, originalSize)) * 100)
        );

        const formatLabel = compressedDataUrl.startsWith("data:image/webp") ? "WebP" : "JPEG";

        resolve({
          dataUrl: compressedDataUrl,
          originalSize,
          compressedSize,
          savingsPercent,
          format: formatLabel,
          width,
          height,
          originalName
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(new Error("Error al cargar la imagen para procesamiento"));
    };

    img.src = dataUrlSrc;
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Formatea bytes a cadena legible KB/MB.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Recorre recursivamente cualquier objeto de datos médicos y comprime todas las imágenes
 * en formato Base64 (DataURL) a WebP optimizado para cumplir con el límite estricto
 * de 1 MiB (1,048,576 bytes) de Google Cloud Firestore.
 */
export async function optimizeMedicalDataImages(
  rawData: any,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<any> {
  if (!rawData || typeof rawData !== "object") return rawData;

  const maxDimension = options.maxDimension || 900;
  const quality = options.quality || 0.75;

  let cloned: any;
  try {
    cloned = JSON.parse(JSON.stringify(rawData));
  } catch {
    return rawData;
  }

  const tasks: Promise<void>[] = [];

  function walk(node: any) {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        const item = node[i];
        if (
          typeof item === "string" &&
          item.startsWith("data:image/") &&
          !item.startsWith("data:image/svg+xml") &&
          item.length > 15000
        ) {
          tasks.push(
            (async () => {
              try {
                const res = await compressAndConvertToWebP(item, {
                  maxWidth: maxDimension,
                  maxHeight: maxDimension,
                  quality,
                  format: "image/webp"
                });
                if (res.dataUrl && res.dataUrl.length < item.length) {
                  node[i] = res.dataUrl;
                }
              } catch {
                // Conservar original si falla la conversión en canvas
              }
            })()
          );
        } else if (typeof item === "object") {
          walk(item);
        }
      }
    } else {
      for (const key of Object.keys(node)) {
        const item = node[key];
        if (
          typeof item === "string" &&
          item.startsWith("data:image/") &&
          !item.startsWith("data:image/svg+xml") &&
          item.length > 15000
        ) {
          tasks.push(
            (async () => {
              try {
                const res = await compressAndConvertToWebP(item, {
                  maxWidth: maxDimension,
                  maxHeight: maxDimension,
                  quality,
                  format: "image/webp"
                });
                if (res.dataUrl && res.dataUrl.length < item.length) {
                  node[key] = res.dataUrl;
                }
              } catch {
                // Conservar original si falla la conversión en canvas
              }
            })()
          );
        } else if (typeof item === "object") {
          walk(item);
        }
      }
    }
  }

  walk(cloned);

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }

  return cloned;
}

/**
 * Prepara y comprime un perfil de médico asegurando que el tamaño del documento Firestore
 * quede cómodamente por debajo del límite duro de 1,048,576 bytes (1 MiB).
 * Aplica reducción progresiva si el JSON supera los umbrales seguros.
 */
export async function prepareProfileForCloudStorage(profileData: any): Promise<any> {
  if (!profileData) return profileData;

  // Paso 1: Optimización estándar (900px, 0.75 WebP)
  let optimized = await optimizeMedicalDataImages(profileData, { maxDimension: 900, quality: 0.75 });
  let jsonString = JSON.stringify(optimized);

  // Si aún supera los 750 KB, Paso 2: Reducción más agresiva (650px, 0.65 WebP)
  if (jsonString.length > 750000) {
    optimized = await optimizeMedicalDataImages(optimized, { maxDimension: 650, quality: 0.65 });
    jsonString = JSON.stringify(optimized);
  }

  // Si aún supera los 850 KB, Paso 3: Reducción ultra-compacta (480px, 0.55 WebP)
  if (jsonString.length > 850000) {
    optimized = await optimizeMedicalDataImages(optimized, { maxDimension: 480, quality: 0.55 });
  }

  return optimized;
}
