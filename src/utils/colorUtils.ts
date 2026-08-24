/**
 * Utilidades para cálculo y generación de paletas cromáticas médicas y variables CSS
 */

export interface ColorScale {
  "50": string;
  "100": string;
  "200": string;
  "300": string;
  "400": string;
  "500": string;
  "600": string;
  "700": string;
  "800": string;
  "900": string;
  "950": string;
}

export interface PresetPalette {
  id: string;
  name: string;
  specialties: string;
  primaryHex: string;
  scale: ColorScale;
}

// Paletas predefinidas por especialidad médica
export const PRESET_PALETTES: Record<string, PresetPalette> = {
  azul: {
    id: "azul",
    name: "Azul Clínico",
    specialties: "Cardiología, Medicina Interna, Pediatría",
    primaryHex: "#1e6fd9",
    scale: generateScaleFromHex("#1e6fd9")
  },
  verde: {
    id: "verde",
    name: "Verde Esmeralda",
    specialties: "Nutrición, Fisioterapia, Traumatología, Bienestar",
    primaryHex: "#059669",
    scale: generateScaleFromHex("#059669")
  },
  morado: {
    id: "morado",
    name: "Morado Médico",
    specialties: "Dermatología, Ginecología, Medicina Estética",
    primaryHex: "#7c3aed",
    scale: generateScaleFromHex("#7c3aed")
  },
  teal: {
    id: "teal",
    name: "Verde Azulado / Teal",
    specialties: "Odontología, Oftalmología, Neumología",
    primaryHex: "#0d9488",
    scale: generateScaleFromHex("#0d9488")
  },
  indigo: {
    id: "indigo",
    name: "Índigo Zafiro",
    specialties: "Neurología, Psiquiatría, Cirugía General",
    primaryHex: "#4f46e5",
    scale: generateScaleFromHex("#4f46e5")
  },
  rojo: {
    id: "rojo",
    name: "Borgoña / Rubí",
    specialties: "Cardiovascular, Hematología, Urgencias",
    primaryHex: "#e11d48",
    scale: generateScaleFromHex("#e11d48")
  },
  ambar: {
    id: "ambar",
    name: "Ámbar Cálido",
    specialties: "Geriatría, Pediatría, Medicina Familiar",
    primaryHex: "#d97706",
    scale: generateScaleFromHex("#d97706")
  }
};

/**
 * Convierte un código hexadecimal a RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16)
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16)
    };
  }
  return null;
}

/**
 * Convierte RGB a Hexadecimal
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`;
}

/**
 * Garantiza un código HEX de 7 caracteres válido (#RRGGBB) para controles HTML y procesamiento de color
 */
export function ensureValid7CharHex(hex?: string, fallback: string = "#1e6fd9"): string {
  if (!hex || !hex.trim()) return fallback;
  let clean = hex.trim();
  if (!clean.startsWith("#")) clean = `#${clean}`;
  const rgb = hexToRgb(clean);
  if (!rgb) return fallback;
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Mezcla un color base con blanco o negro para derivar escalas tonales
 */
export function mixColor(hex: string, targetHex: string, weight: number): string {
  const rgb1 = hexToRgb(hex);
  const rgb2 = hexToRgb(targetHex);
  if (!rgb1 || !rgb2) return hex;

  const w = Math.max(0, Math.min(1, weight));
  const r = rgb1.r * (1 - w) + rgb2.r * w;
  const g = rgb1.g * (1 - w) + rgb2.g * w;
  const b = rgb1.b * (1 - w) + rgb2.b * w;

  return rgbToHex(r, g, b);
}

/**
 * Genera una escala completa de tonalidades a partir de un único color HEX principal
 */
export function generateScaleFromHex(primaryHex: string, fallback: string = "#1e6fd9"): ColorScale {
  const normalizedHex = ensureValid7CharHex(primaryHex, fallback);

  return {
    "50": mixColor(normalizedHex, "#ffffff", 0.94),
    "100": mixColor(normalizedHex, "#ffffff", 0.86),
    "200": mixColor(normalizedHex, "#ffffff", 0.72),
    "300": mixColor(normalizedHex, "#ffffff", 0.55),
    "400": mixColor(normalizedHex, "#ffffff", 0.35),
    "500": mixColor(normalizedHex, "#ffffff", 0.15),
    "600": normalizedHex,
    "700": mixColor(normalizedHex, "#000000", 0.18),
    "800": mixColor(normalizedHex, "#000000", 0.32),
    "900": mixColor(normalizedHex, "#000000", 0.46),
    "950": mixColor(normalizedHex, "#000000", 0.60)
  };
}

/**
 * Obtiene la escala de colores actual de los datos médicos
 */
export function getActiveColorScale(paletaColor: string = "azul", customHex?: string): ColorScale {
  if (customHex && customHex.trim().length >= 3) {
    const norm = ensureValid7CharHex(customHex, "");
    if (norm) {
      if (paletaColor === "personalizado") {
        return generateScaleFromHex(norm);
      }
      const preset = PRESET_PALETTES[paletaColor];
      if (preset && norm.toLowerCase() !== preset.primaryHex.toLowerCase()) {
        return generateScaleFromHex(norm);
      }
    }
  }
  const preset = PRESET_PALETTES[paletaColor];
  if (preset) {
    return preset.scale;
  }
  if (customHex && customHex.trim().length >= 3) {
    return generateScaleFromHex(customHex);
  }
  return PRESET_PALETTES.azul.scale;
}

/**
 * Genera las variables CSS como bloque de texto
 */
export function generateCssVariablesString(scale: ColorScale): string {
  return `:root {
  --clinical-50: ${scale["50"]};
  --clinical-100: ${scale["100"]};
  --clinical-200: ${scale["200"]};
  --clinical-500: ${scale["500"]};
  --clinical-600: ${scale["600"]};
  --clinical-700: ${scale["700"]};
  --clinical-800: ${scale["800"]};
  --clinical-900: ${scale["900"]};
}`;
}
