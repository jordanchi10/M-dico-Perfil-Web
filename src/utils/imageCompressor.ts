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
 */
export async function compressAndConvertToWebP(
  input: File | string,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82,
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

        // Recorte cuadrado opcional (para foto de perfil 1:1)
        if (squareCrop) {
          const minDim = Math.min(width, height);
          sourceX = (width - minDim) / 2;
          sourceY = (height - minDim) / 2;
          sourceWidth = minDim;
          sourceHeight = minDim;
          width = minDim;
          height = minDim;
        }

        // Escalado proporcional si excede límites máximos
        if (width > maxWidth || height > maxHeight) {
          const aspect = width / height;
          if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspect);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspect);
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

        // Renderizado con máxima calidad de suavizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Si es transparente y convertimos a JPEG, rellenar fondo blanco
        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }

        // Dibujar en canvas
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
