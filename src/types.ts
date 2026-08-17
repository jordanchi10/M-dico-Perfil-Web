/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LandingStyleType = "profesional" | "minimalista" | "vibrante" | "elegante";

export interface FAQItem {
  id: string;
  pregunta: string;
  respuesta: string;
}

export interface ServiceItem {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string; // Nombre del icono de Lucide
}

export interface ReviewItem {
  id: string;
  paciente: string;
  estrellas: number;
  comentario: string;
  fecha: string;
}

export interface BeforeAfterCase {
  id: string;
  titulo: string;
  descripcion: string;
  imgBefore: string;
  imgAfter: string;
}

export interface BlogPostItem {
  id: string;
  titulo: string;
  slug: string;
  extracto: string;
  contenido: string; // Contenido completo estructurado en HTML o Markdown
  fecha: string;
  categoria: string;
  imagenUrl: string;
  tiempoLectura: string;
}

export interface MedicalLandingData {
  // 1. Datos Personales / Clínicos
  nombreMedico: string; // ej. "Dr. Alejandro Ruiz"
  especialidad: string; // ej. "Cardiólogo Pediatra"
  cedulaProfesional: string; // ej. "12345678"
  universidad: string; // ej. "Universidad Nacional Autónoma de México"
  anosExperiencia: number; // ej. 15
  fotoUrl: string; // URL de la foto profesional (1:1)
  logoUrl?: string; // URL o Base64 del logotipo con fondo transparente
  filosofia: string; // Filosofía de atención al paciente
  biografiaCurta: string; // Biografía resumida

  // 2. SEO Local & Google Business Profile (GBP)
  nombreClinicaGBP: string; // ej. "Pediatría Integral Monterrey"
  direccionFisica: string; // ej. "Av. Universidad 123, Colonia Centro"
  ciudad: string; // ej. "Monterrey"
  estadoRegion: string; // ej. "Nuevo León"
  codigoPostal: string; // ej. "64000"
  pais: string; // ej. "México"
  latitud: string; // ej. "25.6866"
  longitud: string; // ej. "-100.3161"
  telefonoGBP: string; // ej. "+528112345678"
  whatsappUrl: string; // Enlace de WhatsApp
  whatsappMensajePlantilla?: string; // Plantilla personalizable del mensaje de WhatsApp del paciente
  facebookUrl: string; // Enlace de Facebook
  instagramUrl: string; // Enlace de Instagram
  tiktokUrl: string; // Enlace de TikTok
  emailContacto: string; // Correo electrónico de contacto
  doctoraliaUrl: string; // Enlace de agenda (Doctoralia, Saluspot, etc.)
  metaTitulo?: string; // Título SEO para Google
  metaDescripcion?: string; // Descripción SEO para Google
  horarios: {
    semana: string; // ej. "Lunes a Viernes: 09:00 - 18:00"
    sabado: string; // ej. "Sábado: 09:00 - 14:00"
    domingo: string; // ej. "Domingo: Cerrado"
  };

  // 3. Señales E-E-A-T (Autoridad)
  aseguradoras: string[]; // Aseguradoras asociadas
  hospitalesdondeOpera: string[]; // Hospitales donde opera
  asociaciones: string[]; // Certificaciones / Consejos / Asociaciones médicas

  // 4. Servicios y Casos de Éxito
  servicios: ServiceItem[];
  casosAntesDespues: BeforeAfterCase[];

  // 5. FAQs
  faqs: FAQItem[];

  // 6. Reseñas de Pacientes & Integración Google Reviews / Maps
  resenas: ReviewItem[];
  habilitarGoogleReviewsWidget?: boolean;
  googlePlaceId?: string; // ID de lugar de Google Maps (Place ID)
  googleMapsApiKey?: string; // API Key de Google Maps (opcional)
  googleReviewsRating?: number; // Calificación en Google Maps (ej. 4.9)
  googleReviewsTotalCount?: number; // Total de opiniones en Google Maps (ej. 142)
  googleMapsReviewsUrl?: string; // Enlace directo a reseñas de Google Maps / GBP

  // 7. Blog Médico (Tráfico Long-Tail)
  blogPosts: BlogPostItem[];

  // 8. Identidad Visual, Estilo de Landing & Paleta Cromática
  estiloLanding?: LandingStyleType; // ej. "profesional" | "minimalista" | "vibrante" | "elegante"
  paletaColor: "azul" | "verde" | "morado" | "teal" | "indigo" | "rojo" | "ambar" | "personalizado";
  colorPrimarioHex?: string; // Código hexadecimal personalizado (ej. "#1e6fd9")

  // 9. Tarifas & Formas de Pago
  precioConsulta?: string; // ej. "$50 USD"
  metodosPago?: string[]; // ej. ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"]
}

export interface SavedClientProfile {
  id: string;
  nombreCliente: string; // ej. "Dr. Alejandro Ruiz - Cardiología Pediatra (Quito)"
  nombreMedico: string;
  especialidad: string;
  ciudad: string;
  clinica: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  notasInternas?: string; // Para control de agencia (ej. "Cliente Plan Anual - Dominio: doctor-ruiz.ec")
  data: MedicalLandingData;
}

export interface ProfileBackupPackage {
  version: string;
  tipoExportacion: "individual" | "lote_completo";
  fechaExportacion: string;
  perfilesCount: number;
  perfiles: SavedClientProfile[];
}

export interface EcuadorCityPreset {
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  latitud: string;
  longitud: string;
  ejemploDireccion: string;
  ejemploHospital: string;
}

export const ECUADOR_CITIES: EcuadorCityPreset[] = [
  {
    ciudad: "Quito",
    provincia: "Pichincha",
    codigoPostal: "170504",
    latitud: "-0.1807",
    longitud: "-78.4678",
    ejemploDireccion: "Av. Mariana de Jesús y Calle Nicolás Arteta, Edificio Meditrópoli, Piso 4, Cons. 402",
    ejemploHospital: "Hospital Metropolitano"
  },
  {
    ciudad: "Guayaquil",
    provincia: "Guayas",
    codigoPostal: "090150",
    latitud: "-2.1709",
    longitud: "-79.9224",
    ejemploDireccion: "Av. Juan Tanca Marengo y Agustín Freire, Torre Médica Omni Hospital, Cons. 508",
    ejemploHospital: "Omni Hospital"
  },
  {
    ciudad: "Cuenca",
    provincia: "Azuay",
    codigoPostal: "010107",
    latitud: "-2.9001",
    longitud: "-79.0059",
    ejemploDireccion: "Av. Paucarbamba y Manuel J. Calle, Edificio Santa Inés, Cons. 301",
    ejemploHospital: "Hospital Santa Inés"
  },
  {
    ciudad: "Samborondón",
    provincia: "Guayas",
    codigoPostal: "092301",
    latitud: "-2.1469",
    longitud: "-79.8654",
    ejemploDireccion: "Km 2.5 Vía a Samborondón, Clínica Kennedy Samborondón, Torre Beta",
    ejemploHospital: "Clínica Kennedy Samborondón"
  },
  {
    ciudad: "Cumbayá (Quito)",
    provincia: "Pichincha",
    codigoPostal: "170901",
    latitud: "-0.2039",
    longitud: "-78.4358",
    ejemploDireccion: "Av. Francisco de Orellana y Chimborazo, Cumbayá Medical Center, Cons. 204",
    ejemploHospital: "Hospital de los Valles"
  },
  {
    ciudad: "Santo Domingo",
    provincia: "Santo Domingo de los Tsáchilas",
    codigoPostal: "230101",
    latitud: "-0.2530",
    longitud: "-79.1754",
    ejemploDireccion: "Av. Quito y Av. Río Toachi, Centro Médico Los Tsáchilas, Cons. 102",
    ejemploHospital: "Clínica Cuba Center"
  },
  {
    ciudad: "Machala",
    provincia: "El Oro",
    codigoPostal: "070102",
    latitud: "-3.2581",
    longitud: "-79.9553",
    ejemploDireccion: "Av. 25 de Junio y Junín, Edificio Médico Oro Plaza, Cons. 405",
    ejemploHospital: "Clínica La Cigüeña"
  },
  {
    ciudad: "Manta",
    provincia: "Manabí",
    codigoPostal: "130801",
    latitud: "-0.9677",
    longitud: "-80.7089",
    ejemploDireccion: "Av. Malecón y Calle 15, Torre Médica Manta Beach, Cons. 303",
    ejemploHospital: "Clínica del Sol Manta"
  },
  {
    ciudad: "Portoviejo",
    provincia: "Manabí",
    codigoPostal: "130101",
    latitud: "-1.0546",
    longitud: "-80.4545",
    ejemploDireccion: "Av. Manabí y Calle Los Nardos, Edificio Médico San Antonio, Cons. 201",
    ejemploHospital: "Hospital de Especialidades Portoviejo"
  },
  {
    ciudad: "Ambato",
    provincia: "Tungurahua",
    codigoPostal: "180103",
    latitud: "-1.2491",
    longitud: "-78.6168",
    ejemploDireccion: "Av. Cevallos y Montalvo, Edificio Centro Médico Tungurahua, Cons. 304",
    ejemploHospital: "Hospital Municipal Ambato"
  },
  {
    ciudad: "Loja",
    provincia: "Loja",
    codigoPostal: "110101",
    latitud: "-3.9931",
    longitud: "-79.2042",
    ejemploDireccion: "Calle 10 de Agosto y Bernardo Valdivieso, Edificio Médico Loja, Cons. 202",
    ejemploHospital: "Clínica San Agustín Loja"
  },
  {
    ciudad: "Riobamba",
    provincia: "Chimborazo",
    codigoPostal: "060101",
    latitud: "-1.6732",
    longitud: "-78.6487",
    ejemploDireccion: "Av. Daniel León Borja y Brasil, Centro de Especialidades Médicas Riobamba",
    ejemploHospital: "Clínica San Juan Riobamba"
  },
  {
    ciudad: "Ibarra",
    provincia: "Imbabura",
    codigoPostal: "100101",
    latitud: "0.3517",
    longitud: "-78.1223",
    ejemploDireccion: "Av. Pérez Guerrero y Bolívar, Edificio Medisan, Cons. 104",
    ejemploHospital: "Clínica Moderna Ibarra"
  }
];

export const ECUADOR_ASEGURADORAS: string[] = [
  "Saludsa",
  "Humana",
  "Ecuasanitas",
  "Confiamed",
  "Latina Seguros",
  "Seguros Equinoccial",
  "Best Doctors Ecuador",
  "BMI del Ecuador",
  "Bupa Ecuador",
  "Asisken",
  "Sweaden Seguros",
  "IESS (Reembolso / Prestador Externo)"
];

export const ECUADOR_HOSPITALES: string[] = [
  "Hospital Metropolitano (Quito)",
  "Hospital Vozandes Quito",
  "Omni Hospital (Guayaquil)",
  "Clínica Kennedy (Guayaquil)",
  "Hospital de los Valles (Cumbayá)",
  "Hospital Santa Inés (Cuenca)",
  "Hospital Monte Sinaí (Cuenca)",
  "Clínica Guayaquil",
  "Hospital Novaclínica Santa Cecilia",
  "Clínica Pasteur (Quito)",
  "Clínica San Agustín (Loja)",
  "Clínica del Sol (Manta)"
];

export const ECUADOR_ASOCIACIONES: string[] = [
  "Colegio de Médicos de Pichincha",
  "Colegio de Médicos del Guayas",
  "Colegio de Médicos del Azuay",
  "Federación Médica Ecuatoriana (FME)",
  "Sociedad Ecuatoriana de la Especialidad",
  "Ministerio de Salud Pública del Ecuador (MSP)",
  "Registro Nacional de Profesionales SENESCYT"
];

export const defaultMedicalData: MedicalLandingData = {
  nombreMedico: "{{NOMBRE_MEDICO}}",
  especialidad: "{{ESPECIALIDAD}}",
  cedulaProfesional: "MSP Reg. 171485921-0 / SENESCYT 1005-2012-1148292",
  universidad: "Universidad Central del Ecuador (UCE) / Posgrado USFQ",
  anosExperiencia: 15,
  fotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
  filosofia: "Brindar una atención médica cálida, humana y basada en la más estricta evidencia científica para mejorar la calidad de vida de cada paciente en el Ecuador.",
  biografiaCurta: "Médico especialista con más de 15 años de trayectoria en el Ecuador. Registrado y avalado por el Ministerio de Salud Pública (MSP) y el SENESCYT, con posgrado y alta especialidad médica en hospitales de tercer nivel.",
  
  nombreClinicaGBP: "Centro Médico de Especialidades {{CIUDAD}}",
  direccionFisica: "Av. Mariana de Jesús y Calle Nicolás Arteta, Edificio Meditrópoli, Piso 4, Cons. 402",
  ciudad: "Quito",
  estadoRegion: "Pichincha",
  codigoPostal: "170504",
  pais: "Ecuador",
  latitud: "-0.1807",
  longitud: "-78.4678",
  telefonoGBP: "+593 99 123 4567",
  whatsappUrl: "https://wa.me/593991234567",
  whatsappMensajePlantilla: "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.",
  facebookUrl: "https://facebook.com/drmedicoecuador",
  instagramUrl: "https://instagram.com/dr.medico.ecuador",
  tiktokUrl: "https://tiktok.com/@drmedicoecuador",
  emailContacto: "contacto@consultoriomedico.ec",
  doctoraliaUrl: "https://www.doctoralia.com.ec/{{PERFIL_MEDICO}}",
  horarios: {
    semana: "Lunes a Viernes: 09:00 AM - 07:00 PM",
    sabado: "Sábados: 09:00 AM - 02:00 PM",
    domingo: "Domingos: Cerrado (Urgencias 24/7)"
  },

  aseguradoras: ["Saludsa", "Humana", "Ecuasanitas", "Confiamed", "Latina Seguros", "Seguros Equinoccial", "Best Doctors Ecuador", "BMI del Ecuador", "Bupa Ecuador", "IESS (Reembolso)"],
  hospitalesdondeOpera: ["Hospital Metropolitano (Quito)", "Hospital Vozandes Quito", "Omni Hospital (Guayaquil)", "Clínica Kennedy (Guayaquil)", "Hospital Santa Inés (Cuenca)"],
  asociaciones: ["Colegio de Médicos de Pichincha", "Federación Médica Ecuatoriana (FME)", "Sociedad Ecuatoriana de la Especialidad", "Ministerio de Salud Pública del Ecuador (MSP)"],

  servicios: [
    {
      id: "srv-1",
      titulo: "Consulta Médica de Especialidad & Diagnóstico Digital",
      descripcion: "Valoración clínica minuciosa apoyada en tecnología diagnóstica avanzada para detección temprana y diseño de plan terapéutico a la medida.",
      icono: "Stethoscope"
    },
    {
      id: "srv-2",
      titulo: "Procedimientos Quirúrgicos Mínimamente Invasivos",
      descripcion: "Intervenciones de alta precisión con incisiones milimétricas, menor dolor postoperatorio y rápida reincorporación a tus actividades diarias.",
      icono: "Activity"
    },
    {
      id: "srv-3",
      titulo: "Control Preventivo y Chequeo Clínico Integral",
      descripcion: "Protocolos preventivos exhaustivos para identificar factores de riesgo y patologías asintomáticas antes de que progresen.",
      icono: "HeartPulse"
    },
    {
      id: "srv-4",
      titulo: "Tratamientos de Rejuvenecimiento & Medicina Estética",
      descripcion: "Técnicas seguras y avaladas por la evidencia científica para restauración de armonía facial, volumen y calidad dérmica.",
      icono: "Sparkles"
    },
    {
      id: "srv-5",
      titulo: "Terapia de Rehabilitación y Recuperación Acelerada",
      descripcion: "Planes guiados de fisioterapia médica y seguimiento funcional especializado para optimizar la movilidad y calidad de vida.",
      icono: "ShieldCheck"
    },
    {
      id: "srv-6",
      titulo: "Procedimientos Ambulatorios de Alta Resolución",
      descripcion: "Solución ágil y segura para patologías menores en quirófano ambulatorio certificado con monitoreo continuo y anestesia local.",
      icono: "Syringe"
    },
    {
      id: "srv-7",
      titulo: "Evaluación y Diagnóstico por Ultrasonido Avanzado",
      descripcion: "Estudios de imagen de alta definición en tiempo real directamente en consultorio para corroborar diagnósticos con certeza.",
      icono: "Eye"
    },
    {
      id: "srv-8",
      titulo: "Manejo Integral del Dolor Crónico y Articular",
      descripcion: "Terapias multimodales y bloqueos analgésicos dirigidos al alivio sostenido de molestias osteomusculares y neuropáticas severas.",
      icono: "Thermometer"
    },
    {
      id: "srv-9",
      titulo: "Telemedicina y Consulta de Segunda Opinión",
      descripcion: "Atención médica remota con receta digital verificada y análisis riguroso de expedientes clínicos desde la comodidad de tu hogar.",
      icono: "FileText"
    },
    {
      id: "srv-10",
      titulo: "Farmacoterapia Personalizada y Seguimiento Clínico",
      descripcion: "Ajuste y monitoreo continuo de tratamientos médicos para maximizar la eficacia terapéutica y prevenir interacciones farmacológicas.",
      icono: "Pill"
    },
    {
      id: "srv-11",
      titulo: "Cirugía Reconstructiva y Corrección Funcional",
      descripcion: "Procedimientos especializados para restaurar la anatomía natural, simetría y funciones vitales comprometidas por traumatismos o patologías.",
      icono: "Scissors"
    },
    {
      id: "srv-12",
      titulo: "Atención Prioritaria y Coordinación Hospitalaria 24/7",
      descripcion: "Protocolo de respuesta médica prioritaria y enlace directo con centros hospitalarios de tercer nivel ante urgencias médicas.",
      icono: "Cross"
    }
  ],

  casosAntesDespues: [
    {
      id: "caso-1",
      titulo: "Rinoplastia Ultrasónica & Corrección Septal Funcional",
      descripcion: "Paciente de 29 años con desviación septal obstructiva y giba dorsal pronunciada. Resultado a los 6 meses con perfil armónico y 100% de permeabilidad nasal recuperada.",
      imgBefore: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "caso-2",
      titulo: "Rejuvenecimiento Facial con Bioestimulación de Colágeno",
      descripcion: "Paciente femenina de 48 años con pérdida de volumen en tercio medio y flacidez moderada. Evolución a los 90 días mostrando redensificación dérmica y contorno mandibular definido.",
      imgBefore: "https://images.unsplash.com/photo-1512290900672-1f02a0a0e5b8?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "caso-3",
      titulo: "Ortodoncia Invisible y Corrección de Mordida Cruzada",
      descripcion: "Paciente de 26 años con apiñamiento severo superior e inferior. Evolución a los 14 meses con alineadores transparentes logrando oclusión céntrica y sonrisa simétrica.",
      imgBefore: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "caso-4",
      titulo: "Reconstrucción Dermatológica y Manejo de Cicatrices",
      descripcion: "Paciente con cicatriz hipertrófica postraumática en región frontal. Tras protocolo con láser fraccionado ablativo e infiltración, se logró aplanamiento del 90% y coloración homogénea.",
      imgBefore: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "caso-5",
      titulo: "Blefaroplastia Superior & Elevación Palpebral Mínimamente Invasiva",
      descripcion: "Paciente de 54 años con dermatochalasis bilateral severa. Evaluación a las 8 semanas mostrando mirada descansada, cicatriz imperceptible en pliegue natural y campo visual despejado.",
      imgBefore: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "caso-6",
      titulo: "Diseño de Sonrisa Digital y Microcarillas Cerámicas",
      descripcion: "Paciente con desgaste dental severo y diastemas anteriores. Restauración estética y funcional en 6 piezas anteriores con porcelana de alta translucidez y resistencia.",
      imgBefore: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "caso-7",
      titulo: "Microescleroterapia Guiada y Eliminación de Telangiectasias",
      descripcion: "Paciente femenina de 41 años con insuficiencia venosa superficial grado II. Resultado a los 60 días con desaparición completa de arañas vasculares y desaparición de pesadez.",
      imgBefore: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "caso-8",
      titulo: "Microinjerto Capilar Técnica FUE de Alta Densidad",
      descripcion: "Paciente masculino de 36 años con alopecia androgenética Norwood III. Implantación de 2,800 unidades foliculares en zona frontal con resultado denso y línea anterior natural al mes 10.",
      imgBefore: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop"
    }
  ],

  faqs: [
    {
      id: "faq-1",
      pregunta: "{{PREGUNTA_1}}",
      respuesta: "La primera consulta médica incluye valoración física integral, revisión minuciosa de exámenes previos y diseño del protocolo de tratamiento individualizado en {{CIUDAD}}. Emitimos factura electrónica autorizada por el SRI para deducción de gastos de salud."
    },
    {
      id: "faq-2",
      pregunta: "{{PREGUNTA_2}}",
      respuesta: "Sí, emitimos formularios oficiales de reclamo médico y facturación electrónica válida para el reembolso con las principales aseguradoras privadas en Ecuador (Saludsa, Humana, Ecuasanitas, Confiamed, Latina Seguros, Equinoccial, Best Doctors, BMI, etc.) y derivaciones。"
    },
    {
      id: "faq-3",
      pregunta: "{{PREGUNTA_3}}",
      respuesta: "Aceptamos pagos en dólares (USD) en efectivo, transferencias bancarias directas (Banco Pichincha, Banco Guayaquil, Produbanco, DeUna) y todas las tarjetas de crédito o débito (Visa, Mastercard, Diners Club, American Express) con opción de diferido."
    }
  ],

  resenas: [
    {
      id: "res-1",
      paciente: "María Elena Fuentes",
      estrellas: 5,
      comentario: "Excelente trato humano. El doctor explicó con mucha paciencia cada detalle de mi diagnóstico y el tratamiento fue sumamente efectivo. Totalmente recomendado en Quito.",
      fecha: "Hace 2 semanas • Google Review"
    },
    {
      id: "res-2",
      paciente: "Carlos J. Mendoza",
      estrellas: 5,
      comentario: "Instalaciones impecables y una atención muy profesional. Se nota la experiencia y la preparación. Agendar por WhatsApp fue sumamente rápido y cómodo.",
      fecha: "Hace 1 mes • Google Review"
    },
    {
      id: "res-3",
      paciente: "Dra. Patricia Vinueza",
      estrellas: 5,
      comentario: "Como colega médico, reconozco la gran rigurosidad científica y ética con la que atiende a cada paciente. La recuperación fue impecable.",
      fecha: "Hace 2 meses • Google Review"
    }
  ],
  habilitarGoogleReviewsWidget: true,
  googlePlaceId: "ChIJbXGk0iSa1ZER5uF2q_e3g4M",
  googleMapsApiKey: "",
  googleReviewsRating: 4.9,
  googleReviewsTotalCount: 148,
  googleMapsReviewsUrl: "https://maps.google.com/?cid=1234567890123456789",

  blogPosts: [
    {
      id: "blog-1",
      titulo: "5 Consejos Clave para una Recuperación Rápida y Segura",
      slug: "consejos-recuperacion-rapida-segura",
      extracto: "Descubre las recomendaciones esenciales del especialista para optimizar tu proceso postoperatorio o de tratamiento y volver a tu rutina con total bienestar.",
      contenido: `<p>El éxito de cualquier tratamiento o intervención quirúrgica no termina al salir del consultorio o del quirófano; de hecho, una parte fundamental recae en los cuidados posteriores que realizas en casa.</p>
<h4>1. Sigue al pie de la letra las indicaciones farmacológicas</h4>
<p>No suspendas ni alteres las dosis de los medicamentos recetados. Los analgésicos y antibióticos tienen horarios específicos para mantener niveles óptimos en el cuerpo y prevenir infecciones o dolor agudo.</p>
<h4>2. Mantén reposo relativo y controlado</h4>
<p>Evita realizar esfuerzos físicos intensos, cargar objetos pesados o realizar movimientos bruscos que puedan comprometer la cicatrización. Un reposo bien guiado acelera la regeneración de los tejidos.</p>
<h4>3. Alimentación balanceada e hidratación constante</h4>
<p>Consumir suficientes líquidos y alimentos ricos en proteínas y vitamina C favorece directamente la producción de colágeno y el fortalecimiento del sistema inmunológico durante tu recuperación.</p>`,
      fecha: "12 Ago 2026",
      categoria: "Recuperación",
      imagenUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop",
      tiempoLectura: "4 min de lectura"
    },
    {
      id: "blog-2",
      titulo: "Cuándo Consultar al Especialista: Señales de Alerta que No Debes Ignorar",
      slug: "cuando-consultar-especialista-senales-alerta",
      extracto: "Aprende a diferenciar las molestias cotidianas de los síntomas reales que requieren una valoración médica prioritaria con un especialista certificado.",
      contenido: `<p>A menudo postergamos la visita al médico pensando que ciertos síntomas desaparecerán por sí solos. Sin embargo, la prevención y el diagnóstico oportuno siguen siendo las herramientas más potentes de la medicina moderna.</p>
<h4>1. Dolor persistente que no cede con analgésicos comunes</h4>
<p>Si experimentas dolor localizado por más de 48 horas que interfiere con tus actividades o el sueño, es una señal clara de que tu cuerpo está reportando una anomalía que requiere evaluación profesional.</p>
<h4>2. Cambios repentinos en tus niveles de energía o funciones básicas</h4>
<p>Dificultades respiratorias, fatiga extrema sin causa aparente, o alteraciones súbitas deben ser evaluadas clínicamente para descartar patologías subyacentes.</p>
<h4>3. La importancia de la valoración E-E-A-T</h4>
<p>Asegúrate siempre de acudir con profesionales que cuenten con cédula de especialidad vigente y formen parte de consejos certificados. Tu salud es tu activo más valioso.</p>`,
      fecha: "05 Ago 2026",
      categoria: "Prevención",
      imagenUrl: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600&auto=format&fit=crop",
      tiempoLectura: "5 min de lectura"
    },
    {
      id: "blog-3",
      titulo: "La Medicina Preventiva: Cómo el Estilo de Vida Impacta en tu Salud a Largo Plazo",
      slug: "medicina-preventiva-estilo-vida-salud",
      extracto: "Pequeños hábitos diarios pueden prevenir hasta el 80% de las consultas crónicas. Conoce los pilares recomendados por la evidencia médica científica.",
      contenido: `<p>La medicina del siglo XXI ya no se centra únicamente en curar la enfermedad, sino en mantener la salud. La prevención es la clave para un envejecimiento activo, pleno y libre de complicaciones severas.</p>
<h4>1. Actividad física regular adaptada a tu edad</h4>
<p>Al menos 30 minutos diarios de caminata activa o ejercicio de resistencia ayudan a regular la presión arterial, controlar los niveles de glucosa y mantener un corazón fuerte.</p>
<h4>2. Chequeos médicos anuales de control</h4>
<p>Realizarse estudios básicos de laboratorio y una consulta preventiva al año permite detectar factores de riesgo silenciosos (como la hipertensión o dislipidemia) antes de que causen daños.</p>
<h4>3. Salud mental y gestión del estrés</h4>
<p>El estrés crónico eleva los niveles de cortisol, afectando directamente al sistema inmune y cardiovascular. Incorpora técnicas de respiración o meditación guiada a tu rutina diaria.</p>`,
      fecha: "28 Jul 2026",
      categoria: "Bienestar",
      imagenUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop",
      tiempoLectura: "6 min de lectura"
    }
  ],
  estiloLanding: "profesional",
  paletaColor: "azul",
  logoUrl: "",
  precioConsulta: "$50 USD",
  metodosPago: ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"]
};
