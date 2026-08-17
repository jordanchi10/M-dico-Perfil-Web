/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MedicalIconDefinition {
  id: string;
  name: string;
  category: "General y Consulta" | "Órganos y Anatomía" | "Especialidades" | "Instrumental y Tratamientos";
  description: string;
  svgPath: string;
}

export const PREDEFINED_MEDICAL_ICONS: MedicalIconDefinition[] = [
  // General y Consulta
  {
    id: "Stethoscope",
    name: "Estetoscopio",
    category: "General y Consulta",
    description: "Medicina General, Consulta & Diagnóstico",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 0v4m0 0a3 3 0 01-3 3H7.5a2.5 2.5 0 000 5h9a2.5 2.5 0 000-5H15a3 3 0 01-3-3z" />`
  },
  {
    id: "Cross",
    name: "Cruz Médica",
    category: "General y Consulta",
    description: "Hospital, Urgencias & Clínica",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v16m8-8H4" />`
  },
  {
    id: "ShieldCheck",
    name: "Escudo / Chequeo",
    category: "General y Consulta",
    description: "Medicina Preventiva & Certificación",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />`
  },
  {
    id: "FileText",
    name: "Expediente / Receta",
    category: "General y Consulta",
    description: "Telemedicina, Segunda Opinión & Informes",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />`
  },
  {
    id: "Award",
    name: "Galardón / Excelencia",
    category: "General y Consulta",
    description: "Especialista Certificado & Distinciones",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`
  },

  // Órganos y Anatomía
  {
    id: "Heart",
    name: "Corazón",
    category: "Órganos y Anatomía",
    description: "Cardiología & Salud Cardiovascular",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />`
  },
  {
    id: "HeartPulse",
    name: "Pulso Cardíaco",
    category: "Órganos y Anatomía",
    description: "Electrocardiograma & Salud Cardíaca",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6l-2 4l3 3l-2 3" />`
  },
  {
    id: "Bone",
    name: "Hueso",
    category: "Órganos y Anatomía",
    description: "Ortopedia, Traumatología & Articulaciones",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 10c.7-.7 1.6-1 2.5-1a3.5 3.5 0 1 0-3.5 3.5c0 .9-.3 1.8-1 2.5l-6 6c-.7.7-1.6 1-2.5 1a3.5 3.5 0 1 0 3.5-3.5c0-.9.3-1.8 1-2.5l6-6z" />`
  },
  {
    id: "Smile",
    name: "Diente / Sonrisa",
    category: "Órganos y Anatomía",
    description: "Odontología, Ortodoncia & Estética Dental",
    svgPath: `<circle cx="12" cy="12" r="10" stroke-width="1.8" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" stroke-width="2.5" stroke-linecap="round" /><line x1="15" y1="9" x2="15.01" y2="9" stroke-width="2.5" stroke-linecap="round" />`
  },
  {
    id: "Brain",
    name: "Cerebro",
    category: "Órganos y Anatomía",
    description: "Neurología, Neurocirugía & Salud Mental",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />`
  },
  {
    id: "Eye",
    name: "Ojo / Visión",
    category: "Órganos y Anatomía",
    description: "Oftalmología, Optometría & Diagnóstico Visual",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`
  },

  // Especialidades
  {
    id: "Sparkles",
    name: "Destellos / Láser",
    category: "Especialidades",
    description: "Dermatología, Medicina Estética & Láser",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />`
  },
  {
    id: "Baby",
    name: "Bebé / Maternidad",
    category: "Especialidades",
    description: "Pediatría, Ginecología & Neonatología",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />`
  },
  {
    id: "Activity",
    name: "Monitor / Vitales",
    category: "Especialidades",
    description: "Medicina Interna, Cuidados Críticos & Ritmo",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h2l2 9l4-18l3 9h2" />`
  },
  {
    id: "Dna",
    name: "ADN / Genética",
    category: "Especialidades",
    description: "Genética, Oncología & Medicina Molecular",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m8 8 8 8M9 5l6 6M5 9l6 6M19 15l-6-6M15 19l-6-6" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6" />`
  },

  // Instrumental y Tratamientos
  {
    id: "Syringe",
    name: "Jeringa / Infiltración",
    category: "Instrumental y Tratamientos",
    description: "Infiltraciones, Anestesia, Vacunas & Procedimientos",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M18 6l-6 6m2-8l2 2m-8 4l2 2m-4 0l-4 4v2h2l4-4m-1-5l2 2" />`
  },
  {
    id: "Pill",
    name: "Píldora / Farmaco",
    category: "Instrumental y Tratamientos",
    description: "Farmacoterapia & Tratamientos Médicos",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.5 20.5l10-10a4.95 4.95 0 10-7-7l-10 10a4.95 4.95 0 107 7z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8.5 8.5l7 7" />`
  },
  {
    id: "Microscope",
    name: "Microscopio",
    category: "Instrumental y Tratamientos",
    description: "Laboratorio, Análisis Clínico & Patología",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />`
  },
  {
    id: "Scissors",
    name: "Tijeras Quirúrgicas",
    category: "Instrumental y Tratamientos",
    description: "Cirugía General & Reconstrucción",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 9a3 3 0 100-6 3 3 0 000 6zm0 12a3 3 0 100-6 3 3 0 000 6zm2-9l10-7m0 14L8 12" />`
  },
  {
    id: "Thermometer",
    name: "Termómetro",
    category: "Instrumental y Tratamientos",
    description: "Control de Síntomas, Fiebre & Monitoreo",
    svgPath: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />`
  }
];

export const getMedicalIconSvg = (iconId: string): string => {
  const icon = PREDEFINED_MEDICAL_ICONS.find(i => i.id.toLowerCase() === iconId.toLowerCase());
  if (icon) return icon.svgPath;
  return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 0v4m0 0a3 3 0 01-3 3H7.5a2.5 2.5 0 000 5h9a2.5 2.5 0 000-5H15a3 3 0 01-3-3z" />`;
};
