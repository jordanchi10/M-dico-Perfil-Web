/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LandingStyleType = "profesional" | "minimalista" | "vibrante" | "elegante" | "academico" | "tecnologico" | "humanitario";

export type CtaStyleType = "flotante" | "estatico_pulso" | "barra_fija_dual";

export type DesktopHeaderStyleType = "capsula" | "minimalista" | "ejecutivo" | "modern_dock" | "split_centrado" | "institucional";

export type MedicalSectionId = 
  | "hero"
  | "eeat"
  | "servicios"
  | "redes_sociales"
  | "casos"
  | "opiniones"
  | "galeria"
  | "faqs"
  | "tarifas"
  | "horarios_ubicacion"
  | "blog"
  | "guias";

export interface SectionOrderItem {
  id: MedicalSectionId;
  label: string;
  visible: boolean;
}

export const DEFAULT_SECTION_ORDER: SectionOrderItem[] = [
  { id: "hero", label: "Cabecera & Presentación (Hero)", visible: true },
  { id: "eeat", label: "Sobre el Médico / Nosotros (E-E-A-T & Galería)", visible: true },
  { id: "servicios", label: "Servicios & Procedimientos Clínicos", visible: true },
  { id: "redes_sociales", label: "Redes Sociales & Reels / Videos (Instagram, TikTok, Facebook)", visible: true },
  { id: "casos", label: "Casos Clínicos & Evolución Médica", visible: true },
  { id: "opiniones", label: "Opiniones de Pacientes & Google Reviews", visible: true },
  { id: "blog", label: "Blog Médico & Artículos de Salud", visible: true },
  { id: "guias", label: "Guías & Fichas para Pacientes (PDF Lead Magnet)", visible: true },
  { id: "horarios_ubicacion", label: "Horarios de Atención, Ubicación & Citas", visible: true },
  { id: "tarifas", label: "Valor de Consulta & Métodos de Pago", visible: true },
  { id: "faqs", label: "Preguntas Frecuentes & Asistente Virtual (FAQs)", visible: true },
  { id: "galeria", label: "Galería de Instalaciones & Consultorio", visible: true },
];

export interface PatientGuideItem {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: string;
  formato: "PDF" | "Ficha Imprimible" | "Checklist" | "Documento" | "Ebook" | "Libro";
  tamano?: string;
  archivoUrl?: string; // URL externa o relativa ej: "/descargas/guia-postoperatoria.pdf"
  rutaCpanel?: string; // Ruta personalizada alojada en la raíz al subir a cPanel (ej. "/descargas/mi-libro.pdf")
  metodoEntrega?: "descarga_directa" | "whatsapp" | "email" | "todos" | "registro_lead";
  requiereRegistro?: boolean;
  slug?: string; // Enlace propio personalizable (ej. "guia-gastritis" o "cuidados-postquirurgicos")
  tipoEnlace?: "Ebook" | "Descargar" | "Libro"; // Prefijo de enlace (Ebook/Descargar/Libro)
  imagenPortadaUrl?: string;
}

export interface FAQItem {
  id: string;
  pregunta: string;
  respuesta: string;
  enlaceUrl?: string; // URL o ancla interna (ej. "#preview-landing-services", "#servicios", "https://wa.me/...")
  enlaceTexto?: string; // Texto del botón de acción (ej. "Ver Servicios y Precios", "Agendar por WhatsApp")
  enlaceTipo?: "interno" | "externo" | "whatsapp" | "servicio";
  categoria?: string; // Categoría (ej. "Consultas", "Precios", "Ubicación", "Seguros", "Horarios")
}

export interface QuickQuestionItem {
  id: string;
  label: string;
  query: string;
  icon?: string;
}

export const DEFAULT_QUICK_QUESTIONS: QuickQuestionItem[] = [
  { id: "qq-1", label: "Tarifas de consulta", query: "¿Cuál es el valor de la consulta médica y qué formas de pago aceptan?", icon: "CreditCard" },
  { id: "qq-2", label: "Ubicación & cómo llegar", query: "¿Dónde queda el consultorio y cuál es la dirección exacta?", icon: "MapPin" },
  { id: "qq-3", label: "Seguros & reembolso", query: "¿Cómo funciona la facturación SRI para el reembolso con mi seguro?", icon: "ShieldCheck" },
  { id: "qq-4", label: "Horarios de atención", query: "¿Cuáles son los horarios de atención y días disponibles?", icon: "Clock" },
  { id: "qq-5", label: "Qué llevar a la cita", query: "¿Qué documentos o exámenes previos debo llevar a mi consulta?", icon: "Stethoscope" },
  { id: "qq-6", label: "Agendar por WhatsApp", query: "¿Cómo puedo coordinar una cita médica de forma ágil?", icon: "Calendar" }
];

export interface ServiceItem {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string; // Nombre del icono de Lucide
  imagenUrl?: string; // URL o fotografía clínica de alta resolución
  mostrarImagen?: boolean; // Habilitar o deshabilitar imagen para este servicio
  slug?: string; // Slug amigable para SEO (ej. "consulta-diagnostica-especialidad")
  precio?: string; // ej. "$50 USD" o "Desde $450"
  duracion?: string; // ⏳ Duración de la Cita: ej. "30 min", "1 hora", "45 a 60 min"
  recuperacion?: string; // ⏱️ Tiempo de Recuperación: ej. "Ambulatorio", "24 horas", "3-5 días"
  modalidad?: string; // 🏥 Modalidad: ej. "En consultorio", "Quirófano", "Online / Telemedicina"
  aplicaReembolso?: boolean; // 🛡️ Aplica reembolso con seguros privados (Factura SRI y Formulario CIE-10). Por defecto true.
  badgeEtiqueta?: string; // Badges de Destacado / Conversión (Superior Derecha): ej. "Novedad", "Más Solicitado", "Técnica Mínimamente Invasiva", "Procedimiento de Un Día"
  destacado?: boolean; // Marcar como servicio destacado
  galeriaFotos?: string[]; // Fotografías clínicas adicionales del procedimiento (hasta 6)
  videoUrl?: string; // URL de video explicativo (YouTube, Vimeo, MP4)
  codigoEmbed?: string; // Código iframe/embed o enlace de reel (Instagram, TikTok, YouTube, Facebook)
  reelUrl?: string; // URL directa de reel o video de redes sociales
  codigosEmbed?: string[]; // Hasta 8 códigos embed o enlaces de video/reels
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

export interface ClinicGalleryImage {
  id: string;
  url: string;
  titulo: string; // ej. "Recepción y Sala de Espera"
  descripcion?: string; // ej. "Instalaciones climatizadas y diseñadas para el confort del paciente."
}

export interface SocialVideoItem {
  id: string;
  plataforma: "instagram" | "tiktok" | "facebook" | "youtube";
  titulo: string; // ej. "Reel: Explicación de Síntomas y Diagnóstico"
  videoUrl: string; // URL del Reel, Post, Video o Embed
  thumbnailUrl?: string; // Imagen opcional de portada
  descripcion?: string; // Breve descripción
}

export interface BacklinkAuthorityItem {
  id: string;
  portalNombre: string; // ej. "Colegio Médico de Pichincha", "Google Business Profile", "Hospital Metropolitano", "Sociedad Ecuatoriana de la Especialidad"
  tipoPortal: "colegio_medico" | "hospital_clinica" | "sociedad_cientifica" | "directorio_local" | "perfil_google" | "universidad_investigacion" | "prensa_salud" | "otro";
  urlDestino: string; // ej. "https://www.colegiomedicopichincha.org/directorio/dr-ruiz"
  estado: "verificado" | "pendiente" | "sugerido";
  incluirEnSchema: boolean; // Si true, se incluye en sameAs del JSON-LD en el código
  mostrarEnFooter?: boolean; // Si true, muestra distintivo institucional en footer (GBP, Colegio Médico, Hospitales)
  anchorText?: string; // Texto ancla recomendado (ej. "Dr. Alejandro Ruiz - Cardiólogo Quito")
  notas?: string;
}

export interface MedicalLandingData {
  // 1. Datos Personales / Clínicos
  tipoEnfoqueLanding?: "medico" | "clinica"; // Enfoque de presentación: "medico" (Especialista / Doctor Individual) o "clinica" (Centro Médico / Clínica / Policlínico / Empresa)
  nombreMedico: string; // ej. "Dr. Alejandro Ruiz" o "Clínica Santa Ana"
  especialidad: string; // ej. "Cardiólogo Pediatra"
  cedulaProfesional: string; // ej. "MSP Reg. 171485921-0 / SENESCYT 1005-2012-1148292"
  registroSenescyt?: string; // ej. "1005-2012-1148292" (Número de título SENESCYT Ecuador)
  codigoAcessMsp?: string; // ej. "171485921-0" (Código Habilitación Sanitaria MSP / ACESS Ecuador)
  mostrarRegistroPublico?: boolean; // Si es false (por defecto), se mantiene oculto a simple vista y solo en metadatos indexables E-E-A-T/Schema.org. If true, muestra un distintivo discreto.
  universidad: string; // ej. "Universidad Nacional Autónoma de México"
  anosExperiencia: number; // ej. 15
  fotoUrl: string; // URL de la foto profesional
  fotoFormaHero?: "circular" | "rectangular" | "sin_borde"; // Forma visual en Hero: circular (1:1), rectangular (3:4), o sin_borde (recorte flotante 3:4)
  fotoTamanoMobile?: number; // Tamaño en px para vista móvil (ej. 176, min 100, max 340)
  fotoTamanoTablet?: number; // Tamaño en px para vista tablet (ej. 240, min 150, max 500)
  fotoTamanoDesktop?: number; // Tamaño en px para vista desktop (ej. 320, min 200, max 640)
  disenoHeroDesktop?: "estandar" | "invertido" | "centrado"; // Estructura de Hero únicamente en versión Desktop (estandar = info izq / foto der, invertido = foto izq / info der, centrado = sin foto / centrado)
  tipoFondoHero?: "gradiente" | "solido" | "imagen"; // Tipo de fondo del Hero
  colorFondoHero?: string; // Color sólido hexadecimal (ej. "#0f172a")
  gradienteFondoHero?: string; // CSS Gradiente o preset (ej. "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)")
  imagenFondoHero?: string; // URL o Base64 de la imagen de fondo personalizada para el Hero (100% ancho, 80% alto)
  overlayOscuroHero?: number; // Opacidad del overlay (0.4 a 0.9, default 0.8)
  tipoOverlayHero?: "oscuro" | "claro"; // Tipo de overlay de contraste (oscuro = fondo oscuro / texto blanco, claro = fondo claro / texto oscuro)
  logoUrl?: string; // URL o Base64 del logotipo con fondo transparente
  logoTamanoMobile?: number; // Alto en px del logotipo para vista móvil (ej. 36, min 20, max 120)
  logoTamanoTablet?: number; // Alto en px del logotipo para vista tablet (ej. 48, min 24, max 160)
  logoTamanoDesktop?: number; // Alto en px del logotipo para vista desktop (ej. 60, min 28, max 200)
  filosofia: string; // Filosofía de atención al paciente
  biografiaCurta: string; // Biografía resumida
  mision?: string; // Misión del especialista / centro médico
  vision?: string; // Visión institucional o del especialista
  valores?: string[]; // Lista de valores (ej. ["Excelencia Médica", "Ética & Transparencia", "Calidez Humana", "Innovación Tecnológica"])

  // 2. SEO Local & Google Business Profile (GBP)
  dominioWeb?: string; // Dominio personalizado oficial (ej. "https://dralejandroruiz.ec" o "dralejandroruiz.com")
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
  youtubeUrl?: string; // Enlace de YouTube / Canal
  linkedinUrl?: string; // Enlace de LinkedIn
  redesSocialesVideos?: SocialVideoItem[]; // Lista de hasta 6 reels o videos destacados
  emailContacto: string; // Correo electrónico de contacto
  doctoraliaUrl: string; // Enlace de agenda previa (opcional)
  metaTitulo?: string; // Título SEO para Google
  metaDescripcion?: string; // Descripción SEO para Google
  metaKeywords?: string; // Palabras clave SEO locales para indexación
  googleSiteVerification?: string; // Código o metaetiqueta de verificación de Google Search Console (ej: "abcdef1234567890" o `<meta name="google-site-verification" content="..." />`)
  googleVerificationFileCode?: string; // Código para archivo HTML de verificación google[código].html (ej: "google1234567890abcdef.html" o "1234567890abcdef")
  googleAnalyticsId?: string; // ID de Medición de Google Analytics 4 (ej: "G-XXXXXXXXXX" o script gtag.js completo)
  horarios: {
    semana: string; // ej. "Lunes a Viernes: 09:00 - 18:00"
    sabado: string; // ej. "Sábado: 09:00 - 14:00"
    domingo: string; // ej. "Domingo: Cerrado"
    lunes?: string;
    martes?: string;
    miercoles?: string;
    jueves?: string;
    viernes?: string;
    feriados?: string;
    emergencias24h?: boolean;
    previaCita?: boolean;
    [key: string]: any;
  };

  // 3. Señales E-E-A-T (Autoridad & Backlinks)
  aseguradoras: string[]; // Aseguradoras asociadas
  hospitalesdondeOpera: string[]; // Hospitales donde opera
  asociaciones: string[]; // Certificaciones / Consejos / Asociaciones médicas
  certificados?: string[]; // Certificados y cursos de especialización / actualización médica
  reconocimientos?: string[]; // Premios, distinciones académicas y reconocimientos al mérito
  backlinksAutoridad?: BacklinkAuthorityItem[]; // Enlaces de autoridad para Schema sameAs y citaciones local E-E-A-T

  // 4. Servicios y Casos de Éxito
  servicios: ServiceItem[];
  casosAntesDespues: BeforeAfterCase[];

  // 5. FAQs & Configuración del Asistente
  faqs: FAQItem[];
  asistenteFotoUrl?: string; // Foto del Asistente en formato 5:4
  asistentePreguntas?: FAQItem[]; // Lista de preguntas y respuestas opcionales para el Asistente
  asistentePreguntasRapidas?: QuickQuestionItem[]; // Preguntas rápidas sugeridas editables para los chips del asistente virtual
  sincronizarFaqsAsistente?: boolean; // Mantiene sincronizadas las FAQs de landing y el Asistente
  asistenteNombre?: string; // Nombre personalizado del Asistente (ej. "Valeria - Asistente")
  asistenteMensajeBienvenida?: string; // Saludo inicial cuando el paciente abre el chat
  asistenteTono?: "empatico" | "formal" | "directo" | "calido"; // Tono de voz del asistente
  asistenteInstruccionesEspeciales?: string; // Indicaciones y conocimiento adicional para la IA (ej. reglas de preparación, urgencias)

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
  estiloMenuDesktop?: DesktopHeaderStyleType; // ej. "capsula" | "minimalista" | "ejecutivo"
  paletaColor: "azul" | "verde" | "morado" | "teal" | "indigo" | "rojo" | "ambar" | "personalizado";
  colorPrimarioHex?: string; // Código hexadecimal personalizado (ej. "#1e6fd9")
  colorSecundarioHex?: string; // Código hexadecimal secundario personalizado (ej. "#10b981")
  colorAcentoHex?: string; // Código hexadecimal de acentos personalizado (ej. "#f59e0b")
  fuenteTitulos?: string; // Tipografía personalizada para títulos (h1, h2)
  fuenteParrafos?: string; // Tipografía personalizada para párrafos (p, body)
  faviconUrl?: string; // URL del favicon personalizado
  pwaIconUrl?: string; // Ícono adaptado e independiente para Favicon y PWA (instalación de aplicación)
  pwaAppTitle?: string; // Nombre completo de la aplicación PWA para la pantalla de inicio y splash screen
  pwaShortName?: string; // Nombre corto para la etiqueta debajo del icono en la pantalla de inicio del teléfono (ej. "Dr. Ruiz")
  pwaThemeColor?: string; // Color hexadecimal de tema para la barra de dirección del navegador móvil y marco PWA
  pwaBackgroundColor?: string; // Color de fondo para la pantalla de carga (splash screen) de la PWA
  pwaStatusBarStyle?: "default" | "black-translucent" | "black"; // Estilo de la barra de estado móvil (iOS/Android)
  ogImageUrl?: string; // URL de la imagen personalizada para previsualización en Redes Sociales (WhatsApp, Facebook, Twitter, Open Graph)
  ogImageSource?: "foto" | "logo" | "pwa_icon" | "custom"; // Origen de la imagen para compartir en redes sociales

  // 9. Tarifas & Formas de Pago
  precioConsulta?: string; // ej. "$50 USD"
  metodosPago?: string[]; // ej. ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"]

  // Modalidad de Atención & Teleconsulta (CRO para pacientes de otras ciudades/provincias)
  habilitarTeleconsulta?: boolean; // true para permitir consultas virtuales
  precioTeleconsulta?: string; // ej. "$40 USD"
  plataformasTeleconsulta?: string[]; // ej. ["Zoom", "Google Meet", "WhatsApp Video"]
  requisitosTeleconsulta?: string; // ej. "Conexión a internet estable, espacio privado y documentos/estudios médicos previos digitales en PDF o fotos."
  coberturaTeleconsulta?: string; // ej. "Atención para pacientes de todo el Ecuador y el exterior"
  beneficiosTeleconsulta?: string[]; // ej. ["Receta Médica Digital con firma electrónica oficial", "Órdenes de laboratorio y exámenes en PDF", "Informe clínico de valoración"]

  // 10. Galería de Fotos del Consultorio / Instalaciones (Hasta 12 fotos)
  subtituloInstalaciones?: string; // ej. "Instalaciones & Tecnología"
  tituloInstalaciones?: string; // ej. "Espacios Diseñados para tu Bienestar"
  descripcionInstalaciones?: string; // ej. "Conoce nuestro consultorio, salas de atención..."
  fotosConsultorio?: ClinicGalleryImage[];

  // 11. Estilo de Llamado a la Acción (CTA Móvil & Agendamiento)
  estiloCta?: CtaStyleType; // ej. "flotante" | "estatico_pulso" | "barra_fija_dual"

  // 12. Organización y Orden de Secciones (Layout Dinámico)
  ordenSecciones?: SectionOrderItem[];

  // 13. Versión de Diseño (Para forzar re-renderizado reactivo global)
  designVersion?: number;

  // 14. Guías Preparatorias y Fichas para Pacientes (Lead Magnet)
  guiasPacientes?: PatientGuideItem[];

  // 15. Saludo Personalizado & Popup de Bienvenida (Engagement & CRO)
  habilitarPopupBienvenida?: boolean; // Activar o desactivar el popup de saludo al ingresar
  popupBienvenidaIcono?: string; // Emoji o icono en 3D ej. "😊", "👋", "🩺", "✨", "🧸", "💙"
  popupBienvenidaTitulo?: string; // ej. "¡Bienvenido(a) a mi consulta médica!"
  popupBienvenidaSubtitulo?: string; // ej. "¿Cómo te llamas? Me encantaría saludarte por tu nombre:"
  popupBienvenidaBoton?: string; // ej. "Continuar", "Ingresar", "Conocer más"
  popupBienvenidaPlaceholder?: string; // ej. "Escribe tu nombre aquí..."
  franjaSaludoHeroTexto?: string; // ej. "¡Hola {nombre}, te muestro un poco de mi!"
}

export type DoctorProfile = MedicalLandingData;

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
  etiquetaEspecialidad?: string; // Etiqueta editable para diferenciar y organizar por especialidad en catálogo y backup
  data: MedicalLandingData;
}

export interface ProfileBackupPackage {
  version: string;
  tipoExportacion: "individual" | "lote_completo";
  fechaExportacion: string;
  perfilesCount: number;
  resumenPorEspecialidad?: Record<string, number>; // Conteo de perfiles por cada especialidad/etiqueta
  etiquetaFiltro?: string; // Especialidad filtrada en caso de exportar lote específico
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
  tipoEnfoqueLanding: "medico",
  nombreMedico: "{{NOMBRE_MEDICO}}",
  especialidad: "{{ESPECIALIDAD}}",
  cedulaProfesional: "MSP Reg. 171485921-0 / SENESCYT 1005-2012-1148292",
  registroSenescyt: "1005-2012-1148292",
  codigoAcessMsp: "171485921-0",
  mostrarRegistroPublico: false,
  universidad: "Universidad Central del Ecuador (UCE) / Posgrado USFQ",
  anosExperiencia: 15,
  fotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
  fotoFormaHero: "circular",
  fotoTamanoMobile: 176,
  fotoTamanoTablet: 240,
  fotoTamanoDesktop: 320,
  disenoHeroDesktop: "estandar",
  estiloLanding: "profesional",
  estiloMenuDesktop: "capsula",
  filosofia: "Brindar una atención médica cálida, humana y basada en la más estricta evidencia científica para mejorar la calidad de vida de cada paciente en el Ecuador.",
  biografiaCurta: "Médico especialista con más de 15 años de trayectoria en el Ecuador. Registrado y avalado por el Ministerio de Salud Pública (MSP) y el SENESCYT, con posgrado y alta especialidad médica en hospitales de tercer nivel.",
  mision: "Proporcionar atención médica y quirúrgica especializada de máxima precisión y calidez humana, garantizando diagnósticos certeros fundamentados en la más estricta evidencia científica y la preservación del bienestar integral del paciente.",
  vision: "Ser el centro médico y especialista de referencia nacional e internacional en Ecuador, distinguido por la constante excelencia clínica, la vanguardia en tecnología y la confianza de nuestras familias.",
  valores: ["Excelencia & Evidencia", "Ética & Transparencia", "Calidez Humana", "Innovación Tecnológica"],
  
  dominioWeb: "https://dralejandroruiz.ec",
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
  whatsappMensajePlantilla: "Hola Dr(a). {{medico}}, deseo agendar una valoración médica para {{servicio}} en modalidad {{modalidad}} el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.",
  facebookUrl: "https://facebook.com/drmedicoecuador",
  instagramUrl: "https://instagram.com/dr.medico.ecuador",
  tiktokUrl: "https://tiktok.com/@drmedicoecuador",
  youtubeUrl: "https://youtube.com/@drmedicoecuador",
  linkedinUrl: "https://linkedin.com/company/drmedicoecuador",
  redesSocialesVideos: [
    {
      id: "video-1",
      plataforma: "instagram",
      titulo: "Reel: ¿Cuándo consultar a un especialista de salud?",
      videoUrl: "https://www.instagram.com/reel/C3x90123456",
      thumbnailUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
      descripcion: "Explicación médica rápida sobre síntomas de alerta y prevención oportuna en consulta."
    },
    {
      id: "video-2",
      plataforma: "tiktok",
      titulo: "TikTok: 3 Mitos Comunes sobre los Tratamientos Médicos",
      videoUrl: "https://www.tiktok.com/@drmedicoecuador/video/723456789012",
      thumbnailUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop",
      descripcion: "Aprende a diferenciar información falsa de recomendaciones basadas en evidencia científica."
    },
    {
      id: "video-3",
      plataforma: "facebook",
      titulo: "Facebook: Cuidado Preventivo y Protocolos de Consulta",
      videoUrl: "https://www.facebook.com/watch/?v=1234567890",
      thumbnailUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop",
      descripcion: "Recorrido por las instalaciones de nuestro consultorio y atención con calidez médica."
    },
    {
      id: "video-4",
      plataforma: "instagram",
      titulo: "Reel: Preguntas Frecuentes sobre Intervenciones y Recuperación",
      videoUrl: "https://www.instagram.com/reel/C4y89012345",
      thumbnailUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600&auto=format&fit=crop",
      descripcion: "Respuestas directas a las dudas más recurrentes de nuestros pacientes."
    }
  ],
  emailContacto: "contacto@consultoriomedico.ec",
  doctoraliaUrl: "",
  metaTitulo: "{{ESPECIALIDAD}} en {{CIUDAD}} | {{NOMBRE_MEDICO}}",
  metaDescripcion: "Consulta con {{NOMBRE_MEDICO}}, especialista en {{ESPECIALIDAD}} en {{CIUDAD}}, Ecuador. Atención médica certificada, tecnología de vanguardia y citas inmediatas por WhatsApp.",
  metaKeywords: "{{ESPECIALIDAD}} {{CIUDAD}}, médico {{ESPECIALIDAD}} {{CIUDAD}}, especialista {{CIUDAD}} Ecuador, consulta médica {{CIUDAD}}",
  horarios: {
    semana: "Lunes a Viernes: 09:00 AM - 07:00 PM",
    sabado: "Sábados: 09:00 AM - 02:00 PM",
    domingo: "Domingos: Cerrado (Urgencias 24/7)"
  },

  aseguradoras: ["Saludsa", "Humana", "Ecuasanitas", "Confiamed", "Latina Seguros", "Seguros Equinoccial", "Best Doctors Ecuador", "BMI del Ecuador", "Bupa Ecuador", "IESS (Reembolso)"],
  hospitalesdondeOpera: ["Hospital Metropolitano (Quito)", "Hospital Vozandes Quito", "Omni Hospital (Guayaquil)", "Clínica Kennedy (Guayaquil)", "Hospital Santa Inés (Cuenca)"],
  asociaciones: ["Colegio de Médicos de Pichincha", "Federación Médica Ecuatoriana (FME)", "Sociedad Ecuatoriana de la Especialidad", "Ministerio de Salud Pública del Ecuador (MSP)"],
  certificados: [
    "Certificación Internacional en Procedimientos y Terapias Médicas Avanzadas",
    "Soporte Vital Cardiovascular Avanzado (ACLS / BLS) Certificado",
    "Diplomado en Actualización Continua y Seguridad del Paciente"
  ],
  reconocimientos: [
    "Reconocimiento al Mérito Profesional y Calidad en Atención Médica",
    "Miembro de Honor por Aportes a la Salud y Docencia Universitaria",
    "Distinción a la Excelencia Clínica y Práctica Médica Ética"
  ],
  backlinksAutoridad: [
    {
      id: "backlink-1",
      portalNombre: "Perfil Profesional Google Business Profile (Google Maps)",
      tipoPortal: "perfil_google",
      urlDestino: "https://maps.google.com/?cid=123456789",
      estado: "verificado",
      incluirEnSchema: true,
      mostrarEnFooter: true,
      anchorText: "Google Business Profile - Ficha Médica",
      notas: "Ficha oficial verificada en Google Maps para posicionamiento local E-E-A-T."
    },
    {
      id: "backlink-2",
      portalNombre: "Colegio de Médicos de Pichincha",
      tipoPortal: "colegio_medico",
      urlDestino: "https://www.colegiomedicopichincha.org/directorio",
      estado: "verificado",
      incluirEnSchema: true,
      mostrarEnFooter: true,
      anchorText: "Colegio de Médicos de Pichincha - Directorio",
      notas: "Registro oficial de colegiatura médica provincial."
    },
    {
      id: "backlink-3",
      portalNombre: "Hospital Metropolitano de Quito",
      tipoPortal: "hospital_clinica",
      urlDestino: "https://www.hospitalmetropolitano.org/es/medicos",
      estado: "verificado",
      incluirEnSchema: true,
      mostrarEnFooter: true,
      anchorText: "Staff Médico Acreditado - Hospital Metropolitano",
      notas: "Directorio institucional de facultativos acreditados."
    },
    {
      id: "backlink-4",
      portalNombre: "Sociedad Ecuatoriana de Especialidades Médicas",
      tipoPortal: "sociedad_cientifica",
      urlDestino: "https://www.sociedadmedicaecuador.org",
      estado: "sugerido",
      incluirEnSchema: false,
      mostrarEnFooter: false,
      anchorText: "Miembro Activo Sociedad Médica",
      notas: "Citación sugerida para vinculación externa directa."
    }
  ],

  servicios: [
    {
      id: "srv-1",
      titulo: "Consulta Médica de Especialidad & Diagnóstico Digital",
      slug: "consulta-medica-especialidad-diagnostico-digital",
      descripcion: "Valoración clínica minuciosa apoyada en tecnología diagnóstica avanzada para detección temprana y diseño de plan terapéutico a la medida.",
      icono: "Stethoscope",
      imagenUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "$50 USD",
      duracion: "45 min",
      recuperacion: "Inmediato",
      modalidad: "En consultorio",
      badgeEtiqueta: "Más Solicitado",
      destacado: true
    },
    {
      id: "srv-2",
      titulo: "Procedimientos Quirúrgicos Mínimamente Invasivos",
      slug: "procedimientos-quirurgicos-minimamente-invasivos",
      descripcion: "Intervenciones de alta precisión con incisiones milimétricas, menor dolor postoperatorio y rápida reincorporación a tus actividades diarias.",
      icono: "Activity",
      imagenUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "Desde $450 USD",
      duracion: "1 hora",
      recuperacion: "24 horas",
      modalidad: "Quirófano",
      badgeEtiqueta: "Técnica Mínimamente Invasiva",
      destacado: true
    },
    {
      id: "srv-3",
      titulo: "Control Preventivo y Chequeo Clínico Integral",
      slug: "control-preventivo-chequeo-clinico-integral",
      descripcion: "Protocolos preventivos exhaustivos para identificar factores de riesgo y patologías asintomáticas antes de que progresen.",
      icono: "HeartPulse",
      imagenUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "$70 USD",
      duracion: "45 min",
      recuperacion: "Ambulatorio",
      modalidad: "En consultorio",
      badgeEtiqueta: "Procedimiento de Un Día",
      destacado: false
    },
    {
      id: "srv-4",
      titulo: "Tratamientos de Rejuvenecimiento & Medicina Estética",
      slug: "tratamientos-rejuvenecimiento-medicina-estetica",
      descripcion: "Técnicas seguras y avaladas por la evidencia científica para restauración de armonía facial, volumen y calidad dérmica.",
      icono: "Sparkles",
      imagenUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "Desde $120 USD",
      duracion: "30 min",
      recuperacion: "Ambulatorio",
      modalidad: "En consultorio",
      badgeEtiqueta: "Novedad",
      destacado: false
    },
    {
      id: "srv-5",
      titulo: "Terapia de Rehabilitación y Recuperación Acelerada",
      slug: "terapia-rehabilitacion-recuperacion-acelerada",
      descripcion: "Planes guiados de fisioterapia médica y seguimiento funcional especializado para optimizar la movilidad y calidad de vida.",
      icono: "ShieldCheck",
      imagenUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "$40 USD por sesión",
      duracion: "50 min",
      recuperacion: "3-5 días",
      modalidad: "En consultorio",
      badgeEtiqueta: "Alta Inmediata",
      destacado: false
    },
    {
      id: "srv-6",
      titulo: "Procedimientos Ambulatorios de Alta Resolución",
      slug: "procedimientos-ambulatorios-alta-resolucion",
      descripcion: "Solución ágil y segura para patologías menores en quirófano ambulatorio certificado con monitoreo continuo y anestesia local.",
      icono: "Syringe",
      imagenUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "Desde $180 USD",
      duracion: "40 min",
      recuperacion: "24 horas"
    },
    {
      id: "srv-7",
      titulo: "Evaluación y Diagnóstico por Ultrasonido Avanzado",
      slug: "evaluacion-diagnostico-ultrasonido-avanzado",
      descripcion: "Estudios de imagen de alta definición en tiempo real directamente en consultorio para corroborar diagnósticos con certeza.",
      icono: "Eye",
      imagenUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "$60 USD",
      duracion: "30 min",
      recuperacion: "Inmediata"
    },
    {
      id: "srv-8",
      titulo: "Manejo Integral del Dolor Crónico y Articular",
      slug: "manejo-integral-dolor-cronico-articular",
      descripcion: "Terapias multimodales y bloqueos analgésicos dirigidos al alivio sostenido de molestias osteomusculares y neuropáticas severas.",
      icono: "Thermometer",
      imagenUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "$65 USD",
      duracion: "45 min",
      recuperacion: "Inmediata"
    },
    {
      id: "srv-9",
      titulo: "Telemedicina y Consulta de Segunda Opinión",
      slug: "telemedicina-consulta-segunda-opinion",
      descripcion: "Atención médica remota con receta digital verificada y análisis riguroso de expedientes clínicos desde la comodidad de tu hogar.",
      icono: "FileText",
      imagenUrl: "https://images.unsplash.com/photo-1588776813677-77aaf5595b83?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "$40 USD",
      duracion: "30 min",
      recuperacion: "Online / Inmediata"
    },
    {
      id: "srv-10",
      titulo: "Farmacoterapia Personalizada y Seguimiento Clínico",
      slug: "farmacoterapia-personalizada-seguimiento-clinico",
      descripcion: "Ajuste y monitoreo continuo de tratamientos médicos para maximizar la eficacia terapéutica y prevenir interacciones farmacológicas.",
      icono: "Pill",
      imagenUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "$50 USD",
      duracion: "30 min",
      recuperacion: "Inmediata"
    },
    {
      id: "srv-11",
      titulo: "Cirugía Reconstructiva y Corrección Funcional",
      slug: "cirugia-reconstructiva-correccion-funcional",
      descripcion: "Procedimientos especializados para restaurar la anatomía natural, simetría y funciones vitales comprometidas por traumatismos o patologías.",
      icono: "Scissors",
      imagenUrl: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=800&auto=format&fit=crop",
      precio: "Evaluación previa",
      duracion: "90 a 180 min",
      recuperacion: "5 a 10 días"
    },
    {
      id: "srv-12",
      titulo: "Atención Prioritaria y Coordinación Hospitalaria 24/7",
      slug: "atencion-prioritaria-coordinacion-hospitalaria",
      descripcion: "Protocolo de respuesta médica prioritaria y enlace directo con centros hospitalarios de tercer nivel ante urgencias médicas.",
      icono: "Cross",
      imagenUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
      precio: "Urgencias",
      duracion: "Disponibilidad 24h",
      recuperacion: "Según valoración"
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
      pregunta: "¿Cómo agendo mi primera consulta médica?",
      respuesta: "Puedes agendar tu cita en segundos a través de nuestro botón de WhatsApp o llamando a recepción. Te confirmaremos la disponibilidad de fecha y horario de inmediato.",
      enlaceUrl: "#preview-landing-booking",
      enlaceTexto: "Agendar Cita Médica",
      enlaceTipo: "interno",
      categoria: "Citas & Horarios"
    },
    {
      id: "faq-2",
      pregunta: "¿Aceptan seguros médicos privados y trámites de reembolso?",
      respuesta: "Sí, emitimos la Factura Electrónica SRI oficial y entregamos el informe médico firmado para que tramites tu reembolso sin inconvenientes en Saludsa, Humana, Ecuasanitas, BMI, Confiamed y demás aseguradoras.",
      enlaceUrl: "#preview-landing-eeat",
      enlaceTexto: "Ver Aseguradoras Aceptadas",
      enlaceTipo: "interno",
      categoria: "Seguros & SRI"
    },
    {
      id: "faq-3",
      pregunta: "¿Cuáles son los métodos de pago disponibles en el consultorio?",
      respuesta: "Aceptamos efectivo, transferencias bancarias directas (Banco Pichincha, Produbanco, Banco Guayaquil, DeUna) y tarjetas de crédito o débito con opción de diferidos.",
      enlaceUrl: "#preview-landing-services",
      enlaceTexto: "Ver Tarifas de Servicios",
      enlaceTipo: "interno",
      categoria: "Costos & Pagos"
    },
    {
      id: "faq-4",
      pregunta: "¿Qué tratamientos y procedimientos médicos realizan?",
      respuesta: "Ofrecemos una amplia gama de procedimientos especializados, valoraciones preventivas y tratamientos clínicos con tecnología avanzada.",
      enlaceUrl: "#preview-landing-services",
      enlaceTexto: "Explorar Lista de Servicios",
      enlaceTipo: "servicio",
      categoria: "Procedimientos"
    },
    {
      id: "faq-5",
      pregunta: "¿Dónde está ubicado el consultorio y cuenta con parqueadero?",
      respuesta: "Nos encontramos en una zona médica de fácil acceso en {{CIUDAD}}, con instalaciones modernas y parqueadero seguro para la comodidad de nuestros pacientes.",
      enlaceUrl: "#preview-landing-map",
      enlaceTexto: "Ver Ubicación en Google Maps",
      enlaceTipo: "interno",
      categoria: "Ubicación"
    },
    {
      id: "faq-6",
      pregunta: "¿Emiten factura electrónica autorizada por el SRI?",
      respuesta: "Absolutamente. Todas nuestras atenciones incluyen factura electrónica enviada automáticamente a tu correo electrónico para la deducción de tus gastos personales de salud.",
      enlaceTexto: "Consultar Facturación por WhatsApp",
      enlaceTipo: "whatsapp",
      categoria: "Seguros & SRI"
    },
    {
      id: "faq-7",
      pregunta: "¿Atienden urgencias médicas o consultas fuera de horario habitual?",
      respuesta: "Coordinamos atenciones prioritarias previa consulta y confirmación de disponibilidad por WhatsApp. En situaciones de emergencia vital, te recomendamos acudir de inmediato a la sala de urgencias hospitalarias más cercana.",
      enlaceTexto: "Contactar Urgencias por WhatsApp",
      enlaceTipo: "whatsapp",
      categoria: "Citas & Horarios"
    },
    {
      id: "faq-8",
      pregunta: "¿Con cuánta anticipación puedo reprogramar o cancelar una cita?",
      respuesta: "Te solicitamos notificar cualquier cambio o cancelación con al menos 24 horas de anticipación a través de WhatsApp para habilitar el turno a otro paciente que lo requiera.",
      enlaceTexto: "Gestionar Cita por WhatsApp",
      enlaceTipo: "whatsapp",
      categoria: "Citas & Horarios"
    }
  ],
  asistentePreguntas: [
    {
      id: "asist-faq-1",
      pregunta: "¿Cuánto cuesta la consulta médica y qué métodos de pago aceptan?",
      respuesta: "La consulta médica de valoración presencial tiene un costo de {{PRECIO_CONSULTA}}. Aceptamos efectivo, transferencias bancarias directas y tarjetas de crédito o débito con opción a diferidos."
    },
    {
      id: "asist-faq-2",
      pregunta: "¿Dónde queda ubicado el consultorio exactamente?",
      respuesta: "Nos encontramos ubicados en {{DIRECCION}}, en la ciudad de {{CIUDAD}}. Contamos con parqueadero seguro y facilidades de acceso."
    },
    {
      id: "asist-faq-3",
      pregunta: "¿Cómo funciona el reembolso de mi consulta con seguro médico?",
      respuesta: "Al finalizar tu consulta, te entregamos la Factura Electrónica SRI oficial y el Formulario de Reclamo Médico firmado con código CIE-10 para tu reembolso en Saludsa, Humana, Ecuasanitas, BMI, Confiamed y demás aseguradoras."
    },
    {
      id: "asist-faq-4",
      pregunta: "¿Cuáles son los horarios de atención y días disponibles?",
      respuesta: "Atendemos de {{HORARIOS_SEMANA}} mediante previa cita confirmada por WhatsApp para garantizar puntualidad y privacidad."
    },
    {
      id: "asist-faq-5",
      pregunta: "¿Atienden teleconsultas o consultas médicas virtuales?",
      respuesta: "Sí, disponemos de atención médica virtual por Zoom, Google Meet o WhatsApp Video para pacientes de todo el Ecuador y el exterior, con envío de receta digital con firma electrónica autorizada."
    }
  ],
  sincronizarFaqsAsistente: true,
  asistenteFotoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
  asistenteNombre: "Valeria - Asistente",
  asistenteMensajeBienvenida: "¡Hola! Soy la asistente. ¿En qué te puedo ayudar hoy?",
  asistenteTono: "empatico",
  asistenteInstruccionesEspeciales: "Priorizar el agendamiento directo por WhatsApp. Facilitar información clara sobre facturación electrónica SRI, estacionamiento y seguros médicos autorizados.",

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
  paletaColor: "azul",
  logoUrl: "",
  imagenFondoHero: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1600&auto=format&fit=crop",
  faviconUrl: "",
  pwaIconUrl: "",
  pwaAppTitle: "",
  pwaShortName: "",
  pwaThemeColor: "#1e6fd9",
  pwaBackgroundColor: "#ffffff",
  pwaStatusBarStyle: "default",
  ogImageUrl: "",
  ogImageSource: "foto",
  googleSiteVerification: "",
  googleVerificationFileCode: "",
  googleAnalyticsId: "",
  precioConsulta: "$50 USD",
  metodosPago: ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"],
  habilitarTeleconsulta: true,
  precioTeleconsulta: "$40 USD",
  plataformasTeleconsulta: ["Zoom", "Google Meet", "WhatsApp Video"],
  requisitosTeleconsulta: "Conexión a internet estable, espacio privado y documentos/estudios médicos previos digitales en PDF o fotos.",
  coberturaTeleconsulta: "Nacional e Internacional (Todas las provincias del Ecuador y pacientes en el exterior)",
  beneficiosTeleconsulta: [
    "Receta Médica Digital con firma electrónica oficial autorizada",
    "Órdenes de laboratorio y exámenes de diagnóstico en PDF",
    "Informe clínico de valoración y plan de tratamiento",
    "Revisión posterior de exámenes sin costo adicional"
  ],
  subtituloInstalaciones: "Instalaciones & Tecnología",
  tituloInstalaciones: "Espacios Diseñados para tu Bienestar",
  descripcionInstalaciones: "Conoce nuestro consultorio, salas de atención e instrumental médico preparado bajo los más estrictos protocolos de bioseguridad, privacidad y confort.",
  fotosConsultorio: [
    {
      id: "foto-cons-1",
      url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
      titulo: "Recepción y Sala de Espera",
      descripcion: "Espacio moderno, climatizado y diseñado para la comodidad de los pacientes."
    },
    {
      id: "foto-cons-2",
      url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
      titulo: "Consultorio de Atención Privada",
      descripcion: "Ambiente confidencial y confortable para valoraciones médicas detalladas."
    },
    {
      id: "foto-cons-3",
      url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
      titulo: "Área de Evaluación Diagnóstica",
      descripcion: "Tecnología médica avanzada e instrumental clínico de máxima precisión."
    }
  ],
  estiloCta: "flotante",
  ordenSecciones: DEFAULT_SECTION_ORDER,
  designVersion: 1,
  guiasPacientes: [
    {
      id: "guia-1",
      titulo: "Guía de Cuidados Pre y Post Operatorios",
      descripcion: "Recomendaciones esenciales antes y después de una intervención quirúrgica para una recuperación rápida y segura sin complicaciones.",
      categoria: "Cirugía & Procedimientos",
      formato: "PDF",
      tamano: "2.4 MB",
      requiereRegistro: true
    },
    {
      id: "guia-2",
      titulo: "Checklist de Primera Consulta Médica",
      descripcion: "Qué estudios, exámenes de laboratorio y antecedentes médicos llevar a tu cita para optimizar el diagnóstico de especialidad.",
      categoria: "Preparación de Consulta",
      formato: "Checklist",
      tamano: "1.1 MB",
      requiereRegistro: false
    },
    {
      id: "guia-3",
      titulo: "Pautas de Nutrición y Preparación para Exámenes",
      descripcion: "Instrucciones de ayuno, ingesta de líquidos y medicamentos previos a toma de muestras o estudios diagnósticos.",
      categoria: "Diagnóstico & Laboratorio",
      formato: "PDF",
      tamano: "1.8 MB",
      requiereRegistro: true
    }
  ],
  habilitarPopupBienvenida: true,
  popupBienvenidaIcono: "😊",
  popupBienvenidaTitulo: "¡Bienvenido(a) a mi consulta!",
  popupBienvenidaSubtitulo: "Me encantaría conocerte. ¿Cuál es tu nombre para brindarte una mejor atención?",
  popupBienvenidaBoton: "Comenzar recorrido",
  popupBienvenidaPlaceholder: "Ingresa tu nombre aquí...",
  franjaSaludoHeroTexto: "¡Hola {nombre}, te muestro un poco de mi!"
};
