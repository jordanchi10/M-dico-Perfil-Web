/**
 * Utilidades para cálculo y generación de paletas cromáticas médicas y variables CSS
 */

export interface ColorScale {
  "50": string;
  "100": string;
  "200": string;
  "500": string;
  "600": string;
  "700": string;
  "800": string;
  "900": string;
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
    scale: {
      "50": "#f0f7ff",
      "100": "#e0efff",
      "200": "#bae0ff",
      "500": "#2b82f6",
      "600": "#1e6fd9",
      "700": "#1756ab",
      "800": "#13478d",
      "900": "#113c75"
    }
  },
  verde: {
    id: "verde",
    name: "Verde Esmeralda",
    specialties: "Nutrición, Fisioterapia, Traumatología, Bienestar",
    primaryHex: "#059669",
    scale: {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "500": "#10b981",
      "600": "#059669",
      "700": "#047857",
      "800": "#065f46",
      "900": "#064e3b"
    }
  },
  morado: {
    id: "morado",
    name: "Morado Médico",
    specialties: "Dermatología, Ginecología, Medicina Estética",
    primaryHex: "#7c3aed",
    scale: {
      "50": "#faf5ff",
      "100": "#f3e8ff",
      "200": "#e9d5ff",
      "500": "#8b5cf6",
      "600": "#7c3aed",
      "700": "#6d28d9",
      "800": "#5b21b6",
      "900": "#4c1d95"
    }
  },
  teal: {
    id: "teal",
    name: "Verde Azulado / Teal",
    specialties: "Odontología, Oftalmología, Neumología",
    primaryHex: "#0d9488",
    scale: {
      "50": "#f0fdfa",
      "100": "#ccfbf1",
      "200": "#99f6e4",
      "500": "#14b8a6",
      "600": "#0d9488",
      "700": "#0f766e",
      "800": "#115e59",
      "900": "#134e4a"
    }
  },
  indigo: {
    id: "indigo",
    name: "Índigo Zafiro",
    specialties: "Neurología, Psiquiatría, Cirugía General",
    primaryHex: "#4f46e5",
    scale: {
      "50": "#eef2ff",
      "100": "#e0e7ff",
      "200": "#c7d2fe",
      "500": "#6366f1",
      "600": "#4f46e5",
      "700": "#4338ca",
      "800": "#3730a3",
      "900": "#312e81"
    }
  },
  rojo: {
    id: "rojo",
    name: "Borgoña / Rubí",
    specialties: "Cardiovascular, Hematología, Urgencias",
    primaryHex: "#e11d48",
    scale: {
      "50": "#fff1f2",
      "100": "#ffe4e6",
      "200": "#fecdd3",
      "500": "#f43f5e",
      "600": "#e11d48",
      "700": "#be123c",
      "800": "#9f1239",
      "900": "#881337"
    }
  },
  ambar: {
    id: "ambar",
    name: "Ámbar Cálido",
    specialties: "Geriatría, Pediatría, Medicina Familiar",
    primaryHex: "#d97706",
    scale: {
      "50": "#fffbeb",
      "100": "#fef3c7",
      "200": "#fde68a",
      "500": "#f59e0b",
      "600": "#d97706",
      "700": "#b45309",
      "800": "#92400e",
      "900": "#78350f"
    }
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
 * Genera una escala completa de 8 tonalidades a partir de un único color HEX principal
 */
export function generateScaleFromHex(primaryHex: string): ColorScale {
  const validHex = primaryHex.startsWith("#") ? primaryHex : `#${primaryHex}`;
  const rgb = hexToRgb(validHex);
  if (!rgb) {
    return PRESET_PALETTES.azul.scale;
  }

  return {
    "50": mixColor(validHex, "#ffffff", 0.94),
    "100": mixColor(validHex, "#ffffff", 0.86),
    "200": mixColor(validHex, "#ffffff", 0.72),
    "500": mixColor(validHex, "#ffffff", 0.15),
    "600": validHex,
    "700": mixColor(validHex, "#000000", 0.18),
    "800": mixColor(validHex, "#000000", 0.32),
    "900": mixColor(validHex, "#000000", 0.46)
  };
}

/**
 * Obtiene la escala de colores actual de los datos médicos
 */
export function getActiveColorScale(paletaColor: string = "azul", customHex?: string): ColorScale {
  if (paletaColor === "personalizado" && customHex) {
    return generateScaleFromHex(customHex);
  }
  const preset = PRESET_PALETTES[paletaColor];
  if (preset) {
    return preset.scale;
  }
  if (customHex) {
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
