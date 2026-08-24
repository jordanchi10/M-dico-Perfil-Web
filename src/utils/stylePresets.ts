/**
 * Presets de Estilo de Landing Page Médica
 * Define presets de fuentes, bordes, radios y espaciados mediante variables CSS dinámicas
 */

import { LandingStyleType } from "../types";

export interface LandingStylePreset {
  id: LandingStyleType;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  specialtyFit: string;
  fontDisplay: string;
  fontDisplayName: string;
  fontBody: string;
  fontBodyName: string;
  googleFontsUrl: string;
  variables: {
    "--landing-font-display": string;
    "--landing-font-body": string;
    "--landing-radius": string;
    "--landing-radius-sm": string;
    "--landing-radius-lg": string;
    "--landing-radius-xl": string;
    "--landing-radius-btn": string;
    "--landing-section-py": string;
    "--landing-card-p": string;
    "--landing-gap": string;
    "--landing-border-width": string;
    "--landing-shadow": string;
    "--landing-card-bg": string;
    "--landing-badge-radius": string;
    "--landing-letter-spacing": string;
  };
  sampleRadius: string;
  sampleSpacing: string;
}

export const LANDING_STYLE_PRESETS: Record<LandingStyleType, LandingStylePreset> = {
  profesional: {
    id: "profesional",
    name: "Profesional Clínico",
    badge: "Equilibrado & Confiable",
    tagline: "Estructura formal, sobria y de máxima autoridad médica",
    description: "Combina tipografía display serif de prestigio con sans-serif contemporánea, bordes con curvatura estándar balanceada (14px) y sombras sutiles que inspiran rigor científico.",
    specialtyFit: "Cardiología, Neurología, Cirugía General, Medicina Interna, Pediatría",
    fontDisplay: "'Playfair Display', Georgia, serif",
    fontDisplayName: "Playfair Display",
    fontBody: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontBodyName: "Plus Jakarta Sans",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
    variables: {
      "--landing-font-display": "'Playfair Display', Georgia, serif",
      "--landing-font-body": "'Plus Jakarta Sans', system-ui, sans-serif",
      "--landing-radius": "14px",
      "--landing-radius-sm": "8px",
      "--landing-radius-lg": "20px",
      "--landing-radius-xl": "28px",
      "--landing-radius-btn": "9999px",
      "--landing-section-py": "4.5rem",
      "--landing-card-p": "1.5rem",
      "--landing-gap": "1.5rem",
      "--landing-border-width": "1px",
      "--landing-shadow": "0 4px 20px -2px rgba(15, 23, 42, 0.06)",
      "--landing-card-bg": "#ffffff",
      "--landing-badge-radius": "9999px",
      "--landing-letter-spacing": "-0.01em"
    },
    sampleRadius: "14px (Equilibrado)",
    sampleSpacing: "Medio / Estándar"
  },
  minimalista: {
    id: "minimalista",
    name: "Minimalista Editorial",
    badge: "Limpio & Vanguardista",
    tagline: "Bordes casi rectos, máxima pureza geométrica y abundante espacio negativo",
    description: "Estética limpia y arquitectónica con la tipografía geométrica 'Outfit', bordes rectos y nítidos (6px), micro-sombras y espaciado generoso que otorga ligereza visual y enfoque absoluto en el contenido.",
    specialtyFit: "Oftalmología, Odontología Moderna, Traumatología, Telemedicina, Centros de Diagnóstico",
    fontDisplay: "'Outfit', system-ui, sans-serif",
    fontDisplayName: "Outfit Sans (Geométrica)",
    fontBody: "'Outfit', system-ui, sans-serif",
    fontBodyName: "Outfit Sans",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap",
    variables: {
      "--landing-font-display": "'Outfit', system-ui, sans-serif",
      "--landing-font-body": "'Outfit', system-ui, sans-serif",
      "--landing-radius": "6px",
      "--landing-radius-sm": "3px",
      "--landing-radius-lg": "8px",
      "--landing-radius-xl": "12px",
      "--landing-radius-btn": "6px",
      "--landing-section-py": "6rem",
      "--landing-card-p": "1.75rem",
      "--landing-gap": "2rem",
      "--landing-border-width": "1px",
      "--landing-shadow": "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
      "--landing-card-bg": "#fafbfc",
      "--landing-badge-radius": "4px",
      "--landing-letter-spacing": "-0.025em"
    },
    sampleRadius: "6px (Recto Minimal)",
    sampleSpacing: "Amplio / Aireado"
  },
  vibrante: {
    id: "vibrante",
    name: "Vibrante & Dinámico",
    badge: "Cálido & Orgánico",
    tagline: "Curvas suaves pronunciadas, elevación visual y tipografía de alto impacto",
    description: "Curvaturas amplias (24px) que transmiten cercanía y calidez humana, combinadas con tipografía 'DM Sans' de lectura fluida, sombras difusas acogedoras y espaciados dinámicos.",
    specialtyFit: "Pediatría, Fisioterapia, Nutrición, Psicología, Medicina Familiar, Bienestar Integral",
    fontDisplay: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontDisplayName: "Plus Jakarta Sans 800",
    fontBody: "'DM Sans', system-ui, sans-serif",
    fontBodyName: "DM Sans",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..800;1,9..40,400..700&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap",
    variables: {
      "--landing-font-display": "'Plus Jakarta Sans', system-ui, sans-serif",
      "--landing-font-body": "'DM Sans', system-ui, sans-serif",
      "--landing-radius": "24px",
      "--landing-radius-sm": "14px",
      "--landing-radius-lg": "32px",
      "--landing-radius-xl": "40px",
      "--landing-radius-btn": "9999px",
      "--landing-section-py": "3.75rem",
      "--landing-card-p": "1.5rem",
      "--landing-gap": "1.25rem",
      "--landing-border-width": "1.5px",
      "--landing-shadow": "0 12px 36px -6px rgba(15, 23, 42, 0.09)",
      "--landing-card-bg": "#ffffff",
      "--landing-badge-radius": "9999px",
      "--landing-letter-spacing": "0.005em"
    },
    sampleRadius: "24px (Curvo Amigable)",
    sampleSpacing: "Dinámico / Enérgico"
  },
  elegante: {
    id: "elegante",
    name: "Elegante & Boutique",
    badge: "Refinado & Exclusivo",
    tagline: "Tipografía serif de alta costura, detalles sutiles y acabados estéticos",
    description: "Inspirada en clínicas estéticas y consultorios privados boutique con la majestuosa tipografía 'Cormorant Garamond', bordes finamente calculados (10px) y espaciados generosos.",
    specialtyFit: "Dermatología Estética, Cirugía Plástica, Medicina Antienvejecimiento, Ginecoestética",
    fontDisplay: "'Cormorant Garamond', Georgia, serif",
    fontDisplayName: "Cormorant Garamond",
    fontBody: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontBodyName: "Plus Jakarta Sans",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
    variables: {
      "--landing-font-display": "'Cormorant Garamond', Georgia, serif",
      "--landing-font-body": "'Plus Jakarta Sans', system-ui, sans-serif",
      "--landing-radius": "10px",
      "--landing-radius-sm": "6px",
      "--landing-radius-lg": "16px",
      "--landing-radius-xl": "22px",
      "--landing-radius-btn": "9999px",
      "--landing-section-py": "5.5rem",
      "--landing-card-p": "1.65rem",
      "--landing-gap": "1.75rem",
      "--landing-border-width": "1px",
      "--landing-shadow": "0 8px 28px -4px rgba(28, 25, 23, 0.07)",
      "--landing-card-bg": "#ffffff",
      "--landing-badge-radius": "9999px",
      "--landing-letter-spacing": "-0.015em"
    },
    sampleRadius: "10px (Estilizado Boutique)",
    sampleSpacing: "Editorial Generoso"
  },
  academico: {
    id: "academico",
    name: "Académico & Científico",
    badge: "Formal & Riguroso",
    tagline: "Serif clásica estructurada para universidades, centros docentes e investigación",
    description: "Diseñado para profesionales con un fuerte perfil docente o académico. Combina la prestigiosa tipografía serif 'Lora' para títulos con la neutralidad de 'Inter' para el cuerpo del texto, transmitiendo rigor e investigación.",
    specialtyFit: "Inmunología, Oncología, Neurocirugía, Reumatología, Genética Médica, Medicina Interna Docente",
    fontDisplay: "'Lora', Georgia, serif",
    fontDisplayName: "Lora (Serif)",
    fontBody: "'Inter', system-ui, sans-serif",
    fontBodyName: "Inter",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap",
    variables: {
      "--landing-font-display": "'Lora', Georgia, serif",
      "--landing-font-body": "'Inter', system-ui, sans-serif",
      "--landing-radius": "4px",
      "--landing-radius-sm": "2px",
      "--landing-radius-lg": "6px",
      "--landing-radius-xl": "10px",
      "--landing-radius-btn": "4px",
      "--landing-section-py": "5rem",
      "--landing-card-p": "1.5rem",
      "--landing-gap": "1.5rem",
      "--landing-border-width": "1px",
      "--landing-shadow": "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      "--landing-card-bg": "#ffffff",
      "--landing-badge-radius": "2px",
      "--landing-letter-spacing": "-0.01em"
    },
    sampleRadius: "4px (Rectangular Riguroso)",
    sampleSpacing: "Estructurado / Simétrico"
  },
  tecnologico: {
    id: "tecnologico",
    name: "Tecnológico & Futuro",
    badge: "Innovador & Alta Precisión",
    tagline: "Bordes ultra-definidos, fuentes geométricas nítidas y estética de innovación médica",
    description: "Ideal para clínicas que utilizan tecnología láser, robótica o diagnóstico avanzado. Emplea la tipografía 'Space Grotesk' de alto impacto junto con 'Inter', ofreciendo una presencia digital nítida, limpia y futurista.",
    specialtyFit: "Oftalmología Láser, Cirugía Robótica, Medicina Reproductiva, Cardiología Intervencionista, Dermatología Láser",
    fontDisplay: "'Space Grotesk', system-ui, sans-serif",
    fontDisplayName: "Space Grotesk (Geométrica)",
    fontBody: "'Inter', system-ui, sans-serif",
    fontBodyName: "Inter",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
    variables: {
      "--landing-font-display": "'Space Grotesk', system-ui, sans-serif",
      "--landing-font-body": "'Inter', system-ui, sans-serif",
      "--landing-radius": "8px",
      "--landing-radius-sm": "4px",
      "--landing-radius-lg": "14px",
      "--landing-radius-xl": "20px",
      "--landing-radius-btn": "8px",
      "--landing-section-py": "4.5rem",
      "--landing-card-p": "1.5rem",
      "--landing-gap": "1.5rem",
      "--landing-border-width": "1px",
      "--landing-shadow": "0 4px 18px -4px rgba(59, 130, 246, 0.08)",
      "--landing-card-bg": "#ffffff",
      "--landing-badge-radius": "6px",
      "--landing-letter-spacing": "-0.02em"
    },
    sampleRadius: "8px (Precisión Nítida)",
    sampleSpacing: "Tecnológico Equilibrado"
  },
  humanitario: {
    id: "humanitario",
    name: "Cercano & Humanitario",
    badge: "Cálido & Empático",
    tagline: "Tipografía redondeada, espaciados sumamente acogedores y curvas amigables",
    description: "Enfoque centrado enteramente en el paciente y la salud integrativa. Con la tipografía 'Plus Jakarta Sans' optimizada, bordes perfectamente curvados (18px) y un aire humano de profunda confianza, amabilidad y cercanía.",
    specialtyFit: "Geriatría, Medicina Familiar, Psicoterapia, Cuidados Paliativos, Ginecología de Acompañamiento, Pediatría del Desarrollo",
    fontDisplay: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontDisplayName: "Plus Jakarta Sans",
    fontBody: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontBodyName: "Plus Jakarta Sans",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
    variables: {
      "--landing-font-display": "'Plus Jakarta Sans', system-ui, sans-serif",
      "--landing-font-body": "'Plus Jakarta Sans', system-ui, sans-serif",
      "--landing-radius": "18px",
      "--landing-radius-sm": "10px",
      "--landing-radius-lg": "24px",
      "--landing-radius-xl": "32px",
      "--landing-radius-btn": "9999px",
      "--landing-section-py": "4rem",
      "--landing-card-p": "1.5rem",
      "--landing-gap": "1.25rem",
      "--landing-border-width": "1px",
      "--landing-shadow": "0 6px 24px -4px rgba(15, 23, 42, 0.05)",
      "--landing-card-bg": "#ffffff",
      "--landing-badge-radius": "9999px",
      "--landing-letter-spacing": "0.005em"
    },
    sampleRadius: "18px (Curva Suave Humana)",
    sampleSpacing: "Acogedor / Fluido"
  }
};

export const SYSTEM_FONTS = [
  { id: "system-sans", name: "Sans-Serif del Sistema (Rápido & Limpio)", value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { id: "system-serif", name: "Serif del Sistema (Clásico & Legible)", value: "Georgia, Cambria, 'Times New Roman', Times, serif" },
  { id: "arial", name: "Arial (Estándar & Neutro)", value: "Arial, Helvetica, sans-serif" },
  { id: "georgia", name: "Georgia (Elegante & Tradicional)", value: "Georgia, serif" },
  { id: "times-new-roman", name: "Times New Roman (Formal & Académico)", value: "'Times New Roman', Times, serif" },
  { id: "trebuchet-ms", name: "Trebuchet MS (Corporativo & Amigable)", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { id: "system-mono", name: "Monospace (Técnico & Alta Precisión)", value: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace" }
];

export const GOOGLE_FONTS = [
  { id: "Playfair Display", name: "Playfair Display (Elegante & Serif)", value: "'Playfair Display', Georgia, serif" },
  { id: "Cormorant Garamond", name: "Cormorant Garamond (Boutique & Serif)", value: "'Cormorant Garamond', Georgia, serif" },
  { id: "Lora", name: "Lora (Académica & Serif)", value: "'Lora', Georgia, serif" },
  { id: "Outfit", name: "Outfit (Geométrica & Sans)", value: "'Outfit', system-ui, sans-serif" },
  { id: "Plus Jakarta Sans", name: "Plus Jakarta Sans (Moderna & Sans)", value: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { id: "Space Grotesk", name: "Space Grotesk (Tecnológica & Sans)", value: "'Space Grotesk', system-ui, sans-serif" },
  { id: "Inter", name: "Inter (Limpia & Funcional)", value: "'Inter', system-ui, sans-serif" },
  { id: "DM Sans", name: "DM Sans (Orgánica & Sans)", value: "'DM Sans', system-ui, sans-serif" },
  { id: "Montserrat", name: "Montserrat (Firme & Corporativa)", value: "'Montserrat', system-ui, sans-serif" },
];

export const SUPPORTED_FONTS = [...GOOGLE_FONTS, ...SYSTEM_FONTS];

const GOOGLE_FONTS_MAP: Record<string, string> = {
  "Playfair Display": "family=Playfair+Display:ital,wght@0,600;0,700;1,400",
  "Cormorant Garamond": "family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400",
  "Outfit": "family=Outfit:wght@300;400;500;600;700;800;900",
  "Plus Jakarta Sans": "family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900",
  "DM Sans": "family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400",
  "Montserrat": "family=Montserrat:wght@300;400;500;600;700;800;900",
  "Lora": "family=Lora:ital,wght@0,500;0,600;0,700;1,400",
  "Inter": "family=Inter:wght@300;400;500;600;700;800",
  "Space Grotesk": "family=Space+Grotesk:wght@500;600;700"
};

/**
 * Obtiene la URL de Google Fonts cargando dinámicamente las familias de los presets y/o fuentes personalizadas.
 */
export function getDynamicGoogleFontsUrl(
  preset: LandingStylePreset,
  customFontDisplayValue?: string,
  customFontBodyValue?: string
): string {
  const families = new Set<string>();

  // Agregar fuentes del preset
  if (GOOGLE_FONTS_MAP[preset.fontDisplayName]) {
    families.add(GOOGLE_FONTS_MAP[preset.fontDisplayName]);
  }
  if (GOOGLE_FONTS_MAP[preset.fontBodyName]) {
    families.add(GOOGLE_FONTS_MAP[preset.fontBodyName]);
  }

  // Resolver nombre de fuentes personalizadas si existen en el listado
  if (customFontDisplayValue) {
    const found = SUPPORTED_FONTS.find(f => f.value === customFontDisplayValue);
    if (found && GOOGLE_FONTS_MAP[found.id]) {
      families.add(GOOGLE_FONTS_MAP[found.id]);
    }
  }
  if (customFontBodyValue) {
    const found = SUPPORTED_FONTS.find(f => f.value === customFontBodyValue);
    if (found && GOOGLE_FONTS_MAP[found.id]) {
      families.add(GOOGLE_FONTS_MAP[found.id]);
    }
  }

  if (families.size === 0) {
    return preset.googleFontsUrl;
  }

  return `https://fonts.googleapis.com/css2?${Array.from(families).join("&")}&display=swap`;
}

/**
 * Obtiene el preset de estilo activo según el valor seleccionado
 */
export function getActiveLandingStyle(styleKey?: string): LandingStylePreset {
  if (styleKey && styleKey in LANDING_STYLE_PRESETS) {
    return LANDING_STYLE_PRESETS[styleKey as LandingStyleType];
  }
  return LANDING_STYLE_PRESETS.profesional;
}

/**
 * Genera el string de variables CSS del estilo de la landing
 */
export function generateLandingStyleCssVariables(preset: LandingStylePreset): string {
  const vars = preset.variables;
  return `  /* Preset de Estilo: ${preset.name} */
  --landing-font-display: ${vars["--landing-font-display"]};
  --landing-font-body: ${vars["--landing-font-body"]};
  --landing-radius: ${vars["--landing-radius"]};
  --landing-radius-sm: ${vars["--landing-radius-sm"]};
  --landing-radius-lg: ${vars["--landing-radius-lg"]};
  --landing-radius-xl: ${vars["--landing-radius-xl"]};
  --landing-radius-btn: ${vars["--landing-radius-btn"]};
  --landing-section-py: ${vars["--landing-section-py"]};
  --landing-card-p: ${vars["--landing-card-p"]};
  --landing-gap: ${vars["--landing-gap"]};
  --landing-border-width: ${vars["--landing-border-width"]};
  --landing-shadow: ${vars["--landing-shadow"]};
  --landing-card-bg: ${vars["--landing-card-bg"]};
  --landing-badge-radius: ${vars["--landing-badge-radius"]};
  --landing-letter-spacing: ${vars["--landing-letter-spacing"]};`;
}
