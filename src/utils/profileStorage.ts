/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClinicGalleryImage, defaultMedicalData, MedicalLandingData, ProfileBackupPackage, SavedClientProfile } from "../types";

const SAVED_PROFILES_STORAGE_KEY = "medical_landing_profiles_catalog_v1";
const ACTIVE_PROFILE_ID_KEY = "medical_landing_active_profile_id_v1";

/**
 * Valida y normaliza cualquier objeto para garantizar que sea un MedicalLandingData seguro y completo
 */
export function validateAndNormalizeMedicalData(raw: any): MedicalLandingData {
  if (!raw || typeof raw !== "object") {
    return { ...defaultMedicalData };
  }

  // Base segura clonada de los valores por defecto
  const base = JSON.parse(JSON.stringify(defaultMedicalData)) as MedicalLandingData;

  // 1. Datos Clínicos Básicos
  const tipoEnfoqueLanding = (raw.tipoEnfoqueLanding === "clinica" || raw.tipoEnfoqueLanding === "medico") ? raw.tipoEnfoqueLanding : (base.tipoEnfoqueLanding || "medico");
  const nombreMedico = typeof raw.nombreMedico === "string" && raw.nombreMedico.trim() ? raw.nombreMedico.trim() : base.nombreMedico;
  const especialidad = typeof raw.especialidad === "string" && raw.especialidad.trim() ? raw.especialidad.trim() : base.especialidad;
  const cedulaProfesional = typeof raw.cedulaProfesional === "string" ? raw.cedulaProfesional : base.cedulaProfesional;
  const registroSenescyt = typeof raw.registroSenescyt === "string" ? raw.registroSenescyt : (base.registroSenescyt || "");
  const codigoAcessMsp = typeof raw.codigoAcessMsp === "string" ? raw.codigoAcessMsp : (base.codigoAcessMsp || "");
  const mostrarRegistroPublico = typeof raw.mostrarRegistroPublico === "boolean" ? raw.mostrarRegistroPublico : Boolean(base.mostrarRegistroPublico);
  const universidad = typeof raw.universidad === "string" ? raw.universidad : base.universidad;
  const anosExperiencia = typeof raw.anosExperiencia === "number" && !isNaN(raw.anosExperiencia) ? raw.anosExperiencia : (parseInt(raw.anosExperiencia, 10) || base.anosExperiencia);
  const fotoUrl = typeof raw.fotoUrl === "string" && raw.fotoUrl.trim() ? raw.fotoUrl.trim() : base.fotoUrl;
  const filosofia = typeof raw.filosofia === "string" ? raw.filosofia : base.filosofia;
  const biografiaCurta = typeof raw.biografiaCurta === "string" ? raw.biografiaCurta : base.biografiaCurta;

  // 2. SEO Local & GBP
  const nombreClinicaGBP = typeof raw.nombreClinicaGBP === "string" ? raw.nombreClinicaGBP : base.nombreClinicaGBP;
  const direccionFisica = typeof raw.direccionFisica === "string" ? raw.direccionFisica : base.direccionFisica;
  const ciudad = typeof raw.ciudad === "string" ? raw.ciudad : base.ciudad;
  const estadoRegion = typeof raw.estadoRegion === "string" ? raw.estadoRegion : base.estadoRegion;
  const codigoPostal = typeof raw.codigoPostal === "string" ? raw.codigoPostal : base.codigoPostal;
  const pais = typeof raw.pais === "string" ? raw.pais : "Ecuador";
  const latitud = typeof raw.latitud === "string" ? raw.latitud : base.latitud;
  const longitud = typeof raw.longitud === "string" ? raw.longitud : base.longitud;
  const telefonoGBP = typeof raw.telefonoGBP === "string" ? raw.telefonoGBP : base.telefonoGBP;
  const whatsappUrl = typeof raw.whatsappUrl === "string" ? raw.whatsappUrl : base.whatsappUrl;
  const facebookUrl = typeof raw.facebookUrl === "string" ? raw.facebookUrl : base.facebookUrl;
  const instagramUrl = typeof raw.instagramUrl === "string" ? raw.instagramUrl : base.instagramUrl;
  const tiktokUrl = typeof raw.tiktokUrl === "string" ? raw.tiktokUrl : base.tiktokUrl;
  const youtubeUrl = typeof raw.youtubeUrl === "string" ? raw.youtubeUrl : (base.youtubeUrl || "");
  const linkedinUrl = typeof raw.linkedinUrl === "string" ? raw.linkedinUrl : (base.linkedinUrl || "");

  let redesSocialesVideos = base.redesSocialesVideos || [];
  if (Array.isArray(raw.redesSocialesVideos)) {
    redesSocialesVideos = raw.redesSocialesVideos.slice(0, 6).map((vid: any, idx: number) => ({
      id: typeof vid.id === "string" && vid.id.trim() ? vid.id : `video-${Date.now()}-${idx}`,
      plataforma: (vid.plataforma === "tiktok" || vid.plataforma === "facebook" || vid.plataforma === "youtube") ? vid.plataforma : "instagram",
      titulo: typeof vid.titulo === "string" && vid.titulo.trim() ? vid.titulo : `Reel / Video ${idx + 1}`,
      videoUrl: typeof vid.videoUrl === "string" ? vid.videoUrl : "",
      thumbnailUrl: typeof vid.thumbnailUrl === "string" ? vid.thumbnailUrl : "",
      descripcion: typeof vid.descripcion === "string" ? vid.descripcion : ""
    }));
  }

  const emailContacto = typeof raw.emailContacto === "string" ? raw.emailContacto : base.emailContacto;
  const doctoraliaUrl = typeof raw.doctoraliaUrl === "string" ? raw.doctoraliaUrl : base.doctoraliaUrl;

  const horarios = raw.horarios && typeof raw.horarios === "object" ? {
    semana: typeof raw.horarios.semana === "string" ? raw.horarios.semana : base.horarios.semana,
    sabado: typeof raw.horarios.sabado === "string" ? raw.horarios.sabado : base.horarios.sabado,
    domingo: typeof raw.horarios.domingo === "string" ? raw.horarios.domingo : base.horarios.domingo,
  } : base.horarios;

  // 3. E-E-A-T
  const aseguradoras = Array.isArray(raw.aseguradoras) 
    ? raw.aseguradoras.filter((item: any) => typeof item === "string" && item.trim()) 
    : base.aseguradoras;

  const hospitalesdondeOpera = Array.isArray(raw.hospitalesdondeOpera) 
    ? raw.hospitalesdondeOpera.filter((item: any) => typeof item === "string" && item.trim()) 
    : base.hospitalesdondeOpera;

  const asociaciones = Array.isArray(raw.asociaciones) 
    ? raw.asociaciones.filter((item: any) => typeof item === "string" && item.trim()) 
    : base.asociaciones;

  let backlinksAutoridad = base.backlinksAutoridad || [];
  if (Array.isArray(raw.backlinksAutoridad)) {
    backlinksAutoridad = raw.backlinksAutoridad.map((blk: any, idx: number) => ({
      id: typeof blk.id === "string" && blk.id.trim() ? blk.id : `backlink-${Date.now()}-${idx}`,
      portalNombre: typeof blk.portalNombre === "string" ? blk.portalNombre : `Portal ${idx + 1}`,
      tipoPortal: blk.tipoPortal || "otro",
      urlDestino: typeof blk.urlDestino === "string" ? blk.urlDestino : "",
      estado: (blk.estado === "verificado" || blk.estado === "pendiente" || blk.estado === "sugerido") ? blk.estado : "sugerido",
      incluirEnSchema: Boolean(blk.incluirEnSchema),
      mostrarEnFooter: Boolean(blk.mostrarEnFooter),
      anchorText: typeof blk.anchorText === "string" ? blk.anchorText : "",
      notas: typeof blk.notas === "string" ? blk.notas : ""
    }));
  }

  // 4. Servicios
  let servicios = base.servicios;
  if (Array.isArray(raw.servicios)) {
    servicios = raw.servicios.map((srv: any, idx: number) => ({
      ...srv,
      id: typeof srv.id === "string" && srv.id.trim() ? srv.id : `srv-${Date.now()}-${idx}`,
      titulo: typeof srv.titulo === "string" ? srv.titulo : `Servicio Clínico ${idx + 1}`,
      descripcion: typeof srv.descripcion === "string" ? srv.descripcion : "Descripción del procedimiento médico.",
      icono: typeof srv.icono === "string" && srv.icono.trim() ? srv.icono : "Stethoscope",
      aplicaReembolso: typeof srv.aplicaReembolso === "boolean" ? srv.aplicaReembolso : true
    }));
  }

  // 5. Casos Antes y Después
  let casosAntesDespues = base.casosAntesDespues;
  if (Array.isArray(raw.casosAntesDespues)) {
    casosAntesDespues = raw.casosAntesDespues.map((caso: any, idx: number) => ({
      id: typeof caso.id === "string" && caso.id.trim() ? caso.id : `caso-${Date.now()}-${idx}`,
      titulo: typeof caso.titulo === "string" ? caso.titulo : `Caso Clínico ${idx + 1}`,
      descripcion: typeof caso.descripcion === "string" ? caso.descripcion : "Evolución clínica satisfactoria.",
      imgBefore: typeof caso.imgBefore === "string" ? caso.imgBefore : "",
      imgAfter: typeof caso.imgAfter === "string" ? caso.imgAfter : ""
    }));
  }

  // 6. FAQs & Asistente Virtual IA
  let faqs = base.faqs;
  if (Array.isArray(raw.faqs)) {
    faqs = raw.faqs.map((faq: any, idx: number) => ({
      id: typeof faq.id === "string" && faq.id.trim() ? faq.id : `faq-${Date.now()}-${idx}`,
      pregunta: typeof faq.pregunta === "string" ? faq.pregunta : "¿Pregunta médica frecuente?",
      respuesta: typeof faq.respuesta === "string" ? faq.respuesta : "Respuesta médica detallada para el paciente."
    }));
  }

  let asistentePreguntas = base.asistentePreguntas || faqs;
  if (Array.isArray(raw.asistentePreguntas)) {
    asistentePreguntas = raw.asistentePreguntas.map((faq: any, idx: number) => ({
      id: typeof faq.id === "string" && faq.id.trim() ? faq.id : `asist-faq-${Date.now()}-${idx}`,
      pregunta: typeof faq.pregunta === "string" ? faq.pregunta : "¿Pregunta para asistente virtual?",
      respuesta: typeof faq.respuesta === "string" ? faq.respuesta : "Respuesta configurada para el asistente virtual."
    }));
  }

  const sincronizarFaqsAsistente = typeof raw.sincronizarFaqsAsistente === "boolean" ? raw.sincronizarFaqsAsistente : (base.sincronizarFaqsAsistente ?? true);
  const asistenteFotoUrl = typeof raw.asistenteFotoUrl === "string" ? raw.asistenteFotoUrl : (base.asistenteFotoUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop");
  const asistenteNombre = typeof raw.asistenteNombre === "string" ? raw.asistenteNombre : (base.asistenteNombre || "Valeria - Asistente");
  const asistenteMensajeBienvenida = typeof raw.asistenteMensajeBienvenida === "string" ? raw.asistenteMensajeBienvenida : (base.asistenteMensajeBienvenida || "¡Hola! Soy la asistente. ¿En qué te puedo ayudar hoy?");
  const asistenteTono = typeof raw.asistenteTono === "string" ? raw.asistenteTono as any : (base.asistenteTono || "empatico");
  const asistenteInstruccionesEspeciales = typeof raw.asistenteInstruccionesEspeciales === "string" ? raw.asistenteInstruccionesEspeciales : (base.asistenteInstruccionesEspeciales || "");

  // 7. Reseñas y Google Reviews
  let resenas = base.resenas;
  if (Array.isArray(raw.resenas)) {
    resenas = raw.resenas.map((r: any, idx: number) => ({
      id: typeof r.id === "string" && r.id.trim() ? r.id : `res-${Date.now()}-${idx}`,
      paciente: typeof r.paciente === "string" ? r.paciente : "Paciente Verificado",
      estrellas: typeof r.estrellas === "number" ? Math.max(1, Math.min(5, r.estrellas)) : 5,
      comentario: typeof r.comentario === "string" ? r.comentario : "Excelente atención médica.",
      fecha: typeof r.fecha === "string" ? r.fecha : "Reciente • Google Maps"
    }));
  }

  const habilitarGoogleReviewsWidget = typeof raw.habilitarGoogleReviewsWidget === "boolean" ? raw.habilitarGoogleReviewsWidget : true;
  const googlePlaceId = typeof raw.googlePlaceId === "string" ? raw.googlePlaceId : base.googlePlaceId;
  const googleMapsApiKey = typeof raw.googleMapsApiKey === "string" ? raw.googleMapsApiKey : "";
  const googleReviewsRating = typeof raw.googleReviewsRating === "number" ? raw.googleReviewsRating : (parseFloat(raw.googleReviewsRating) || 4.9);
  const googleReviewsTotalCount = typeof raw.googleReviewsTotalCount === "number" ? raw.googleReviewsTotalCount : (parseInt(raw.googleReviewsTotalCount, 10) || 148);
  const googleMapsReviewsUrl = typeof raw.googleMapsReviewsUrl === "string" ? raw.googleMapsReviewsUrl : base.googleMapsReviewsUrl;

  // 8. Blog Posts
  let blogPosts = base.blogPosts;
  if (Array.isArray(raw.blogPosts)) {
    blogPosts = raw.blogPosts.map((post: any, idx: number) => ({
      id: typeof post.id === "string" && post.id.trim() ? post.id : `blog-${Date.now()}-${idx}`,
      titulo: typeof post.titulo === "string" ? post.titulo : `Artículo de Salud ${idx + 1}`,
      slug: typeof post.slug === "string" ? post.slug : `articulo-salud-${idx + 1}`,
      extracto: typeof post.extracto === "string" ? post.extracto : "Resumen del artículo médico.",
      contenido: typeof post.contenido === "string" ? post.contenido : "<p>Contenido educativo para pacientes.</p>",
      fecha: typeof post.fecha === "string" ? post.fecha : "Reciente",
      categoria: typeof post.categoria === "string" ? post.categoria : "Salud",
      imagenUrl: typeof post.imagenUrl === "string" ? post.imagenUrl : "",
      tiempoLectura: typeof post.tiempoLectura === "string" ? post.tiempoLectura : "3 min de lectura"
    }));
  }

  // 9. Paleta y Personalización Visual
  const paletaColor = (raw.paletaColor === "verde" || raw.paletaColor === "morado" || raw.paletaColor === "azul") 
    ? raw.paletaColor 
    : "azul";
  const estiloLanding = typeof raw.estiloLanding === "string" ? raw.estiloLanding : base.estiloLanding;
  const estiloCta = typeof raw.estiloCta === "string" ? raw.estiloCta : base.estiloCta;
  const logoUrl = typeof raw.logoUrl === "string" ? raw.logoUrl : (base.logoUrl || "");
  const faviconUrl = typeof raw.faviconUrl === "string" ? raw.faviconUrl : (base.faviconUrl || "");
  const pwaIconUrl = typeof raw.pwaIconUrl === "string" ? raw.pwaIconUrl : (base.pwaIconUrl || "");
  const pwaAppTitle = typeof raw.pwaAppTitle === "string" ? raw.pwaAppTitle : (base.pwaAppTitle || "");
  const pwaShortName = typeof raw.pwaShortName === "string" ? raw.pwaShortName : (base.pwaShortName || "");
  const pwaThemeColor = typeof raw.pwaThemeColor === "string" ? raw.pwaThemeColor : (base.pwaThemeColor || "#1e6fd9");
  const pwaBackgroundColor = typeof raw.pwaBackgroundColor === "string" ? raw.pwaBackgroundColor : (base.pwaBackgroundColor || "#ffffff");
  const pwaStatusBarStyle = (raw.pwaStatusBarStyle === "default" || raw.pwaStatusBarStyle === "black-translucent" || raw.pwaStatusBarStyle === "black")
    ? raw.pwaStatusBarStyle
    : (base.pwaStatusBarStyle || "default");
  const ogImageUrl = typeof raw.ogImageUrl === "string" ? raw.ogImageUrl : (base.ogImageUrl || "");
  const ogImageSource = (raw.ogImageSource === "foto" || raw.ogImageSource === "logo" || raw.ogImageSource === "pwa_icon" || raw.ogImageSource === "custom")
    ? raw.ogImageSource
    : "foto";
  const imagenFondoHero = typeof raw.imagenFondoHero === "string" ? raw.imagenFondoHero : (base.imagenFondoHero || "");
  
  const tipoFondoHero = (raw.tipoFondoHero === "gradiente" || raw.tipoFondoHero === "solido" || raw.tipoFondoHero === "imagen")
    ? raw.tipoFondoHero
    : (base.tipoFondoHero || "gradiente");
  const gradienteFondoHero = typeof raw.gradienteFondoHero === "string" ? raw.gradienteFondoHero : (base.gradienteFondoHero || "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)");
  const colorFondoHero = typeof raw.colorFondoHero === "string" ? raw.colorFondoHero : (base.colorFondoHero || "#0f172a");
  const tipoOverlayHero = (raw.tipoOverlayHero === "claro" || raw.tipoOverlayHero === "oscuro") ? raw.tipoOverlayHero : (base.tipoOverlayHero || "oscuro");
  const overlayOscuroHero = typeof raw.overlayOscuroHero === "number" ? raw.overlayOscuroHero : (base.overlayOscuroHero ?? 0.8);
  const fotoFormaHero = (raw.fotoFormaHero === "circular" || raw.fotoFormaHero === "rectangular" || raw.fotoFormaHero === "sin_borde") ? raw.fotoFormaHero : (base.fotoFormaHero || "circular");
  const fotoTamanoMobile = typeof raw.fotoTamanoMobile === "number" ? raw.fotoTamanoMobile : (base.fotoTamanoMobile || 176);
  const fotoTamanoTablet = typeof raw.fotoTamanoTablet === "number" ? raw.fotoTamanoTablet : (base.fotoTamanoTablet || 240);
  const fotoTamanoDesktop = typeof raw.fotoTamanoDesktop === "number" ? raw.fotoTamanoDesktop : (base.fotoTamanoDesktop || 320);
  const disenoHeroDesktop = (raw.disenoHeroDesktop === "estandar" || raw.disenoHeroDesktop === "invertido" || raw.disenoHeroDesktop === "centrado")
    ? raw.disenoHeroDesktop
    : (base.disenoHeroDesktop || "estandar");
  const logoTamanoMobile = typeof raw.logoTamanoMobile === "number" ? raw.logoTamanoMobile : (base.logoTamanoMobile || 36);
  const logoTamanoTablet = typeof raw.logoTamanoTablet === "number" ? raw.logoTamanoTablet : (base.logoTamanoTablet || 48);
  const logoTamanoDesktop = typeof raw.logoTamanoDesktop === "number" ? raw.logoTamanoDesktop : (base.logoTamanoDesktop || 60);

  const precioConsulta = typeof raw.precioConsulta === "string" ? raw.precioConsulta : base.precioConsulta;
  const metodosPago = Array.isArray(raw.metodosPago) ? raw.metodosPago.filter((m: any) => typeof m === "string") : base.metodosPago;
  const habilitarTeleconsulta = typeof raw.habilitarTeleconsulta === "boolean" ? raw.habilitarTeleconsulta : (base.habilitarTeleconsulta ?? true);
  const precioTeleconsulta = typeof raw.precioTeleconsulta === "string" ? raw.precioTeleconsulta : (base.precioTeleconsulta || "$40 USD");
  const plataformasTeleconsulta = Array.isArray(raw.plataformasTeleconsulta) ? raw.plataformasTeleconsulta.filter((p: any) => typeof p === "string") : (base.plataformasTeleconsulta || ["Zoom", "Google Meet", "WhatsApp Video"]);
  const requisitosTeleconsulta = typeof raw.requisitosTeleconsulta === "string" ? raw.requisitosTeleconsulta : (base.requisitosTeleconsulta || "Conexión a internet estable, espacio privado y documentos/estudios médicos previos digitales en PDF o fotos.");
  const coberturaTeleconsulta = typeof raw.coberturaTeleconsulta === "string" ? raw.coberturaTeleconsulta : (base.coberturaTeleconsulta || "Atención para pacientes de todo el Ecuador y el exterior");
  const beneficiosTeleconsulta = Array.isArray(raw.beneficiosTeleconsulta) ? raw.beneficiosTeleconsulta.filter((b: any) => typeof b === "string") : (base.beneficiosTeleconsulta || [
    "Receta Médica Digital con firma electrónica oficial autorizada",
    "Órdenes de laboratorio y exámenes de diagnóstico en PDF",
    "Informe clínico de valoración y plan de tratamiento",
    "Revisión posterior de exámenes sin costo adicional"
  ]);
  const subtituloInstalaciones = typeof raw.subtituloInstalaciones === "string" ? raw.subtituloInstalaciones : (base.subtituloInstalaciones || "Instalaciones & Tecnología");
  const tituloInstalaciones = typeof raw.tituloInstalaciones === "string" ? raw.tituloInstalaciones : (base.tituloInstalaciones || "Espacios Diseñados para tu Bienestar");
  const descripcionInstalaciones = typeof raw.descripcionInstalaciones === "string" ? raw.descripcionInstalaciones : (base.descripcionInstalaciones || "Conoce nuestro consultorio, salas de atención e instrumental médico preparado bajo los más estrictos protocolos de bioseguridad, privacidad y confort.");

  let fotosConsultorio = base.fotosConsultorio || [];
  if (Array.isArray(raw.fotosConsultorio)) {
    fotosConsultorio = raw.fotosConsultorio.map((f: any, idx: number) => {
      if (typeof f === "string") {
        return {
          id: `foto-cons-${Date.now()}-${idx}`,
          url: f,
          titulo: `Instalación Médica ${idx + 1}`,
          descripcion: "Espacios diseñados para tu bienestar y confort."
        };
      }
      if (typeof f === "object" && f !== null) {
        return {
          id: typeof f.id === "string" && f.id.trim() ? f.id : `foto-cons-${Date.now()}-${idx}`,
          url: typeof f.url === "string" ? f.url : "",
          titulo: typeof f.titulo === "string" ? f.titulo : `Instalación Médica ${idx + 1}`,
          descripcion: typeof f.descripcion === "string" ? f.descripcion : ""
        };
      }
      return null;
    }).filter((f: any): f is ClinicGalleryImage => Boolean(f && f.url));
  }
  const ordenSecciones = Array.isArray(raw.ordenSecciones) ? raw.ordenSecciones.filter((s: any) => typeof s === "string") : base.ordenSecciones;
  const designVersion = typeof raw.designVersion === "number" ? raw.designVersion : 1;

  let guiasPacientes = base.guiasPacientes || [];
  if (Array.isArray(raw.guiasPacientes)) {
    guiasPacientes = raw.guiasPacientes.map((guia: any, idx: number) => ({
      id: typeof guia.id === "string" && guia.id.trim() ? guia.id : `guia-${Date.now()}-${idx}`,
      titulo: typeof guia.titulo === "string" ? guia.titulo : `Guía Médica ${idx + 1}`,
      descripcion: typeof guia.descripcion === "string" ? guia.descripcion : "",
      categoria: typeof guia.categoria === "string" ? guia.categoria : "Guía Clínica",
      formato: (guia.formato === "PDF" || guia.formato === "Ficha Imprimible" || guia.formato === "Checklist" || guia.formato === "Documento") ? guia.formato : "PDF",
      tamano: typeof guia.tamano === "string" ? guia.tamano : "1.8 MB",
      archivoUrl: typeof guia.archivoUrl === "string" ? guia.archivoUrl : "",
      requiereRegistro: typeof guia.requiereRegistro === "boolean" ? guia.requiereRegistro : true
    }));
  }

  // 15. Saludo Personalizado & Popup de Bienvenida (deshabilitado por defecto)
  const habilitarPopupBienvenida = typeof raw.habilitarPopupBienvenida === "boolean" ? raw.habilitarPopupBienvenida : false;
  const popupBienvenidaIcono = typeof raw.popupBienvenidaIcono === "string" ? raw.popupBienvenidaIcono : (base.popupBienvenidaIcono || "😊");
  const popupBienvenidaTitulo = typeof raw.popupBienvenidaTitulo === "string" ? raw.popupBienvenidaTitulo : (base.popupBienvenidaTitulo || "¡Bienvenido(a) a mi consulta!");
  const popupBienvenidaSubtitulo = typeof raw.popupBienvenidaSubtitulo === "string" ? raw.popupBienvenidaSubtitulo : (base.popupBienvenidaSubtitulo || "Me encantaría conocerte. ¿Cuál es tu nombre para brindarte una mejor atención?");
  const popupBienvenidaBoton = typeof raw.popupBienvenidaBoton === "string" ? raw.popupBienvenidaBoton : (base.popupBienvenidaBoton || "Comenzar recorrido");
  const popupBienvenidaPlaceholder = typeof raw.popupBienvenidaPlaceholder === "string" ? raw.popupBienvenidaPlaceholder : (base.popupBienvenidaPlaceholder || "Ingresa tu nombre aquí...");
  const franjaSaludoHeroTexto = typeof raw.franjaSaludoHeroTexto === "string" ? raw.franjaSaludoHeroTexto : (base.franjaSaludoHeroTexto || "¡Hola {nombre}, te muestro un poco de mi!");

  return {
    tipoEnfoqueLanding,
    nombreMedico,
    especialidad,
    cedulaProfesional,
    registroSenescyt,
    codigoAcessMsp,
    mostrarRegistroPublico,
    universidad,
    anosExperiencia,
    fotoUrl,
    imagenFondoHero,
    tipoFondoHero,
    gradienteFondoHero,
    colorFondoHero,
    tipoOverlayHero,
    overlayOscuroHero,
    fotoFormaHero,
    fotoTamanoMobile,
    fotoTamanoTablet,
    fotoTamanoDesktop,
    disenoHeroDesktop,
    logoUrl,
    logoTamanoMobile,
    logoTamanoTablet,
    logoTamanoDesktop,
    faviconUrl,
    pwaIconUrl,
    pwaAppTitle,
    pwaShortName,
    pwaThemeColor,
    pwaBackgroundColor,
    pwaStatusBarStyle,
    ogImageUrl,
    ogImageSource,
    filosofia,
    biografiaCurta,
    nombreClinicaGBP,
    direccionFisica,
    ciudad,
    estadoRegion,
    codigoPostal,
    pais,
    latitud,
    longitud,
    telefonoGBP,
    whatsappUrl,
    facebookUrl,
    instagramUrl,
    tiktokUrl,
    youtubeUrl,
    linkedinUrl,
    redesSocialesVideos,
    emailContacto,
    doctoraliaUrl,
    horarios,
    aseguradoras,
    hospitalesdondeOpera,
    asociaciones,
    backlinksAutoridad,
    servicios,
    casosAntesDespues,
    faqs,
    asistenteFotoUrl,
    asistentePreguntas,
    sincronizarFaqsAsistente,
    asistenteNombre,
    asistenteMensajeBienvenida,
    asistenteTono,
    asistenteInstruccionesEspeciales,
    resenas,
    habilitarGoogleReviewsWidget,
    googlePlaceId,
    googleMapsApiKey,
    googleReviewsRating,
    googleReviewsTotalCount,
    googleMapsReviewsUrl,
    blogPosts,
    paletaColor,
    estiloLanding,
    estiloCta,
    precioConsulta,
    metodosPago,
    habilitarTeleconsulta,
    precioTeleconsulta,
    plataformasTeleconsulta,
    requisitosTeleconsulta,
    coberturaTeleconsulta,
    beneficiosTeleconsulta,
    subtituloInstalaciones,
    tituloInstalaciones,
    descripcionInstalaciones,
    fotosConsultorio,
    ordenSecciones,
    designVersion,
    guiasPacientes,
    habilitarPopupBienvenida,
    popupBienvenidaIcono,
    popupBienvenidaTitulo,
    popupBienvenidaSubtitulo,
    popupBienvenidaBoton,
    popupBienvenidaPlaceholder,
    franjaSaludoHeroTexto
  };
}

/**
 * Parsea e interpreta cualquier archivo subido (.json o .html)
 */
export function parseImportFile(fileContent: string, fileName?: string): {
  success: boolean;
  tipo: "individual" | "lote" | "desconocido";
  data?: MedicalLandingData;
  profiles?: SavedClientProfile[];
  message: string;
  doctorDetectado?: string;
  especialidadDetectada?: string;
  ciudadDetectada?: string;
  totalPerfiles?: number;
} {
  try {
    const trimmed = fileContent.trim();
    
    // 1. Caso: Es un archivo JSON
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);

      // 1.1 Si es un paquete de backup de múltiples perfiles
      if (parsed && parsed.tipoExportacion === "lote_completo" && Array.isArray(parsed.perfiles)) {
        const validProfiles: SavedClientProfile[] = parsed.perfiles.map((p: any) => {
          const esp = p.data?.especialidad || p.especialidad || "Medicina General";
          return {
            id: p.id || `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            nombreCliente: p.nombreCliente || p.data?.nombreMedico || "Cliente Médico",
            nombreMedico: p.data?.nombreMedico || p.nombreMedico || "Médico Especialista",
            especialidad: esp,
            ciudad: p.data?.ciudad || p.ciudad || "Ecuador",
            clinica: p.data?.nombreClinicaGBP || p.clinica || "Consultorio Médico",
            fechaCreacion: p.fechaCreacion || p.fechaActualizacion || new Date().toISOString(),
            fechaActualizacion: p.fechaActualizacion || p.fechaCreacion || new Date().toISOString(),
            notasInternas: p.notasInternas || "",
            etiquetaEspecialidad: p.etiquetaEspecialidad || esp,
            data: validateAndNormalizeMedicalData(p.data || p)
          };
        });

        return {
          success: true,
          tipo: "lote",
          profiles: validProfiles,
          totalPerfiles: validProfiles.length,
          message: `¡Se detectó un paquete con ${validProfiles.length} perfiles médicos!`
        };
      }

      // 1.2 Si es un array directo de perfiles o datos
      if (Array.isArray(parsed)) {
        const validProfiles: SavedClientProfile[] = parsed.map((p: any) => {
          const actualData = p.data || p;
          const normalized = validateAndNormalizeMedicalData(actualData);
          const esp = normalized.especialidad || p.especialidad || "Medicina General";
          return {
            id: p.id || `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            nombreCliente: p.nombreCliente || `${normalized.nombreMedico} - ${normalized.especialidad}`,
            nombreMedico: normalized.nombreMedico,
            especialidad: esp,
            ciudad: normalized.ciudad,
            clinica: normalized.nombreClinicaGBP,
            fechaCreacion: p.fechaCreacion || p.fechaActualizacion || new Date().toISOString(),
            fechaActualizacion: p.fechaActualizacion || p.fechaCreacion || new Date().toISOString(),
            notasInternas: p.notasInternas || "",
            etiquetaEspecialidad: p.etiquetaEspecialidad || esp,
            data: normalized
          };
        });

        return {
          success: true,
          tipo: "lote",
          profiles: validProfiles,
          totalPerfiles: validProfiles.length,
          message: `¡Se importaron exitosamente ${validProfiles.length} perfiles médicos en lote!`
        };
      }

      // 1.3 Si es un SavedClientProfile envuelto
      if (parsed.data && (parsed.data.nombreMedico || parsed.data.servicios)) {
        const normalized = validateAndNormalizeMedicalData(parsed.data);
        return {
          success: true,
          tipo: "individual",
          data: normalized,
          doctorDetectado: normalized.nombreMedico,
          especialidadDetectada: normalized.especialidad,
          ciudadDetectada: normalized.ciudad,
          message: `Perfil de cliente "${normalized.nombreMedico}" importado correctamente.`
        };
      }

      // 1.4 Si es un MedicalLandingData directo
      const normalized = validateAndNormalizeMedicalData(parsed);
      return {
        success: true,
        tipo: "individual",
        data: normalized,
        doctorDetectado: normalized.nombreMedico,
        especialidadDetectada: normalized.especialidad,
        ciudadDetectada: normalized.ciudad,
        message: `Configuración de "${normalized.nombreMedico}" importada correctamente.`
      };
    }

    // 2. Caso: Es un archivo HTML (Intento de extraer datos estructurados Schema JSON-LD)
    if (trimmed.includes("<html") || trimmed.includes("<!DOCTYPE html>")) {
      const jsonLdMatch = trimmed.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const schemaObj = JSON.parse(jsonLdMatch[1].trim());
          const physician = Array.isArray(schemaObj) 
            ? schemaObj.find(x => x["@type"] === "Physician" || x["@type"] === "MedicalBusiness")
            : (schemaObj["@type"] === "Physician" || schemaObj["@type"] === "MedicalBusiness" ? schemaObj : null);

          if (physician) {
            const data = validateAndNormalizeMedicalData({
              nombreMedico: physician.name,
              especialidad: physician.medicalSpecialty || physician.description,
              direccionFisica: physician.address?.streetAddress,
              ciudad: physician.address?.addressLocality,
              estadoRegion: physician.address?.addressRegion,
              codigoPostal: physician.address?.postalCode,
              telefonoGBP: physician.telephone,
              fotoUrl: physician.image,
              filosofia: physician.description
            });

            return {
              success: true,
              tipo: "individual",
              data,
              doctorDetectado: data.nombreMedico,
              especialidadDetectada: data.especialidad,
              ciudadDetectada: data.ciudad,
              message: `Datos recuperados del HTML para ${data.nombreMedico}.`
            };
          }
        } catch {
          // Ignorar y caer en error controlado
        }
      }
    }

    return {
      success: false,
      tipo: "desconocido",
      message: "El formato del archivo no es reconocido. Asegúrate de subir un archivo .json de configuración médica."
    };
  } catch (err: any) {
    return {
      success: false,
      tipo: "desconocido",
      message: `Error al leer el archivo: ${err.message || "Estructura JSON inválida."}`
    };
  }
}

/**
 * Obtiene todos los perfiles médicos guardados en el navegador
 */
export function getSavedProfiles(): SavedClientProfile[] {
  try {
    const raw = localStorage.getItem(SAVED_PROFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(p => {
        const esp = p.data?.especialidad || p.especialidad || "Medicina General";
        return {
          ...p,
          etiquetaEspecialidad: (p.etiquetaEspecialidad || esp).trim(),
          fechaCreacion: p.fechaCreacion || p.fechaActualizacion || new Date().toISOString(),
          fechaActualizacion: p.fechaActualizacion || p.fechaCreacion || new Date().toISOString(),
          data: validateAndNormalizeMedicalData(p.data)
        };
      });
    }
    return [];
  } catch (err) {
    console.error("Error al leer catálogo de perfiles médicos:", err);
    return [];
  }
}

/**
 * Guarda o actualiza un perfil de cliente médico en el catálogo local
 */
export function saveProfile(
  profileData: MedicalLandingData, 
  customNombreCliente?: string,
  existingId?: string,
  notas?: string,
  etiquetaEspecialidad?: string
): SavedClientProfile {
  const profiles = getSavedProfiles();
  const now = new Date().toISOString();
  
  const id = existingId || `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const doctorName = profileData.nombreMedico.trim() || "Dr. Médico Especialista";
  const especialidad = profileData.especialidad.trim() || "Medicina General";
  const ciudad = profileData.ciudad.trim() || "Ecuador";
  const defaultClientName = `${doctorName} - ${especialidad} (${ciudad})`;

  const existingProfile = existingId ? profiles.find(p => p.id === existingId) : undefined;
  const finalTag = etiquetaEspecialidad?.trim() || existingProfile?.etiquetaEspecialidad?.trim() || especialidad;

  const newProfile: SavedClientProfile = {
    id,
    nombreCliente: customNombreCliente?.trim() || defaultClientName,
    nombreMedico: doctorName,
    especialidad,
    ciudad,
    clinica: profileData.nombreClinicaGBP.trim() || "Consultorio Médico",
    fechaCreacion: existingProfile?.fechaCreacion || now,
    fechaActualizacion: now,
    notasInternas: notas !== undefined ? notas : (existingProfile?.notasInternas || ""),
    etiquetaEspecialidad: finalTag,
    data: validateAndNormalizeMedicalData(profileData)
  };

  const existingIndex = profiles.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    profiles[existingIndex] = newProfile;
  } else {
    profiles.unshift(newProfile); // Colocar al principio
  }

  try {
    localStorage.setItem(SAVED_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
  } catch (err) {
    console.error("Error al persistir perfil médico:", err);
  }

  return newProfile;
}

/**
 * Actualiza directamente la etiqueta de especialidad de un perfil sin alterar el resto de sus datos
 */
export function updateProfileTag(id: string, nuevaEtiqueta: string): SavedClientProfile | null {
  const profiles = getSavedProfiles();
  const index = profiles.findIndex(p => p.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const cleanTag = nuevaEtiqueta.trim() || profiles[index].especialidad || "Medicina General";
  
  profiles[index] = {
    ...profiles[index],
    etiquetaEspecialidad: cleanTag,
    fechaActualizacion: now
  };

  try {
    localStorage.setItem(SAVED_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error("Error al actualizar etiqueta de especialidad:", err);
  }

  return profiles[index];
}

/**
 * Actualiza los datos médicos (data) de un perfil existente en localStorage
 */
export function updateProfileMedicalData(id: string, updatedData: MedicalLandingData): boolean {
  try {
    const profiles = getSavedProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return false;

    const normalized = validateAndNormalizeMedicalData(updatedData);
    profiles[index] = {
      ...profiles[index],
      data: normalized,
      nombreMedico: normalized.nombreMedico || profiles[index].nombreMedico,
      especialidad: normalized.especialidad || profiles[index].especialidad,
      ciudad: normalized.ciudad || profiles[index].ciudad,
      clinica: normalized.nombreClinicaGBP || profiles[index].clinica,
      fechaActualizacion: new Date().toISOString()
    };

    localStorage.setItem(SAVED_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    return true;
  } catch (err) {
    console.warn("No se pudo actualizar profile en localStorage:", err);
    return false;
  }
}

/**
 * Elimina un perfil por ID
 */
export function deleteProfile(id: string): boolean {
  const profiles = getSavedProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  try {
    localStorage.setItem(SAVED_PROFILES_STORAGE_KEY, JSON.stringify(filtered));
    const activeId = getActiveProfileId();
    if (activeId === id) {
      localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Clona / duplica un perfil existente
 */
export function duplicateProfile(id: string): SavedClientProfile | null {
  const profiles = getSavedProfiles();
  const target = profiles.find(p => p.id === id);
  if (!target) return null;

  const duplicatedData = JSON.parse(JSON.stringify(target.data));
  const newProfile = saveProfile(
    duplicatedData,
    `${target.nombreCliente} (Copia)`,
    undefined,
    target.notasInternas,
    target.etiquetaEspecialidad
  );

  return newProfile;
}

/**
 * Importa múltiples perfiles reemplazando o fusionando
 */
export function importBatchProfiles(newProfiles: SavedClientProfile[], mergeMode: boolean = true): number {
  const current = mergeMode ? getSavedProfiles() : [];
  const map = new Map<string, SavedClientProfile>();

  current.forEach(p => map.set(p.id, p));
  newProfiles.forEach(p => {
    // Si ya existe id igual, regenerar id único para no pisar sin querer
    const safeId = map.has(p.id) ? `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` : p.id;
    const esp = p.data?.especialidad || p.especialidad || "Medicina General";
    map.set(safeId, {
      ...p,
      id: safeId,
      etiquetaEspecialidad: p.etiquetaEspecialidad || esp,
      fechaCreacion: p.fechaCreacion || new Date().toISOString(),
      fechaActualizacion: p.fechaActualizacion || new Date().toISOString(),
      data: validateAndNormalizeMedicalData(p.data)
    });
  });

  const merged = Array.from(map.values());
  try {
    localStorage.setItem(SAVED_PROFILES_STORAGE_KEY, JSON.stringify(merged));
    return newProfiles.length;
  } catch (err) {
    console.error("Error al guardar lote de perfiles:", err);
    return 0;
  }
}

/**
 * Obtiene el ID del perfil actualmente activo
 */
export function getActiveProfileId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Establece el perfil activo
 */
export function setActiveProfileId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
    }
  } catch {
    //
  }
}

/**
 * Exporta un perfil individual como archivo .json descargable
 */
export function downloadProfileAsJson(
  data: MedicalLandingData, 
  customFilename?: string,
  etiquetaEspecialidad?: string
): void {
  const sanitizedDoctor = (data.nombreMedico || "medico")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const filename = customFilename || `perfil-cliente-${sanitizedDoctor || "medico"}.json`;
  const tag = (etiquetaEspecialidad || data.especialidad || "Medicina General").trim();
  
  const payload = {
    version: "1.1",
    tipoExportacion: "individual",
    fechaExportacion: new Date().toISOString(),
    cliente: {
      nombreMedico: data.nombreMedico,
      especialidad: data.especialidad,
      etiquetaEspecialidad: tag,
      ciudad: data.ciudad,
      clinica: data.nombreClinicaGBP
    },
    data: validateAndNormalizeMedicalData(data)
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta TODO el catálogo de perfiles (Backup completo para migración, respaldo y organización por especialidad)
 * Permite opcionalmente exportar el lote completo o filtrado por una etiqueta de especialidad específica
 */
export function downloadAllProfilesBackup(filtroEtiqueta?: string): void {
  const allProfiles = getSavedProfiles();
  const isFiltered = Boolean(filtroEtiqueta && filtroEtiqueta !== "todas" && filtroEtiqueta !== "todos");
  
  const profiles = isFiltered
    ? allProfiles.filter(p => (p.etiquetaEspecialidad || p.especialidad || "").toLowerCase().trim() === filtroEtiqueta!.toLowerCase().trim())
    : allProfiles;

  const dateStr = new Date().toISOString().split("T")[0];
  const tagSlug = isFiltered
    ? `-${filtroEtiqueta!.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`
    : "";
  const filename = `backup-clientes-medicos${tagSlug}-${dateStr}-${profiles.length}-perfiles.json`;

  // Resumen estadístico agrupado por especialidad / etiqueta
  const resumenPorEspecialidad: Record<string, number> = {};
  allProfiles.forEach(p => {
    const tag = (p.etiquetaEspecialidad || p.especialidad || "Medicina General").trim();
    resumenPorEspecialidad[tag] = (resumenPorEspecialidad[tag] || 0) + 1;
  });

  const backupPackage: ProfileBackupPackage = {
    version: "1.1",
    tipoExportacion: "lote_completo",
    fechaExportacion: new Date().toISOString(),
    perfilesCount: profiles.length,
    etiquetaFiltro: isFiltered ? filtroEtiqueta : undefined,
    resumenPorEspecialidad,
    perfiles: profiles.map(p => ({
      ...p,
      etiquetaEspecialidad: (p.etiquetaEspecialidad || p.especialidad || "Medicina General").trim()
    }))
  };

  const jsonStr = JSON.stringify(backupPackage, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera una plantilla de datos médicos limpia desde cero (en blanco / placeholder limpio)
 * lista para que el usuario construya un nuevo médico o clínica sin datos precargados.
 */
export function createBlankMedicalData(options?: {
  nombreMedico?: string;
  especialidad?: string;
  ciudad?: string;
  tipoEnfoque?: "medico" | "clinica";
}): MedicalLandingData {
  const base = JSON.parse(JSON.stringify(defaultMedicalData)) as MedicalLandingData;

  const doctorName = options?.nombreMedico?.trim() || "Dr. Nuevo Médico";
  const especialidad = options?.especialidad?.trim() || "Medicina General";
  const ciudad = options?.ciudad?.trim() || "Quito";
  const tipoEnfoque = options?.tipoEnfoque || "medico";

  return {
    ...base,
    tipoEnfoqueLanding: tipoEnfoque,
    nombreMedico: doctorName,
    especialidad: especialidad,
    cedulaProfesional: "",
    registroSenescyt: "",
    codigoAcessMsp: "",
    mostrarRegistroPublico: false,
    universidad: "",
    anosExperiencia: 5,
    fotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
    logoUrl: "",
    faviconUrl: "",
    pwaIconUrl: "",
    filosofia: "Compromiso absoluto con la salud, bienestar y atención cálida de nuestros pacientes.",
    biografiaCurta: `${tipoEnfoque === "clinica" ? "Centro médico especializado" : "Médico especialista"} dedicado a la atención integral y diagnósticos precisos en ${ciudad}, Ecuador.`,
    mision: `Proporcionar atención médica de excelencia en ${especialidad}, priorizando la seguridad y salud del paciente.`,
    vision: `Ser un referente de confianza y calidad médica en ${ciudad} y el Ecuador.`,
    valores: ["Ética & Confianza", "Atención Humana", "Calidad Médica", "Seguridad del Paciente"],
    dominioWeb: "",
    nombreClinicaGBP: tipoEnfoque === "clinica" ? `Centro Médico ${ciudad}` : `Consultorio Dr. ${doctorName}`,
    direccionFisica: `Av. Principal y Secundaria, Edificio Médico, ${ciudad}`,
    ciudad: ciudad,
    estadoRegion: ciudad === "Guayaquil" ? "Guayas" : ciudad === "Cuenca" ? "Azuay" : "Pichincha",
    codigoPostal: "",
    pais: "Ecuador",
    latitud: "-0.1807",
    longitud: "-78.4678",
    telefonoGBP: "+593 99 000 0000",
    whatsappUrl: "https://wa.me/593990000000",
    whatsappMensajePlantilla: "Hola Dr(a). {{medico}}, deseo consultar información para {{servicio}} en {{ciudad}}.",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
    redesSocialesVideos: [],
    emailContacto: "contacto@consultoriomedico.ec",
    doctoraliaUrl: "",
    horarios: {
      semana: "Lunes a Viernes: 09:00 AM - 06:00 PM",
      sabado: "Sábados: 09:00 AM - 01:00 PM",
      domingo: "Domingos: Cerrado (Previa Cita)"
    },
    aseguradoras: ["Saludsa", "Humana", "Ecuasanitas", "IESS (Reembolso)"],
    hospitalesdondeOpera: [],
    asociaciones: ["Colegio de Médicos", "Ministerio de Salud Pública del Ecuador (MSP)"],
    certificados: ["Título Profesional Registrado", "Actualización Médica Continua"],
    reconocimientos: [],
    backlinksAutoridad: [],
    servicios: [
      {
        id: `srv-${Date.now()}-1`,
        titulo: `Consulta Especializada de ${especialidad}`,
        slug: "consulta-especializada",
        descripcion: `Evaluación clínica integral, anamnesis y diagnóstico especializado enfocado en ${especialidad}.`,
        icono: "Stethoscope",
        imagenUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
        precio: "$40 USD",
        duracion: "45 min",
        recuperacion: "Inmediata",
        modalidad: "Presencial y Online",
        badgeEtiqueta: "Servicio Principal",
        destacado: true
      },
      {
        id: `srv-${Date.now()}-2`,
        titulo: "Evaluación Diagnóstica y Control Preventivo",
        slug: "evaluacion-diagnostica-control-preventivo",
        descripcion: "Revisión clínica exhaustiva y plan de tratamiento personalizado preventivo.",
        icono: "Activity",
        imagenUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
        precio: "A consultar",
        duracion: "30 min",
        recuperacion: "Inmediata",
        modalidad: "Presencial",
        badgeEtiqueta: "Frecuente",
        destacado: false
      }
    ],
    casosAntesDespues: [],
    resenas: [
      {
        id: `res-${Date.now()}-1`,
        paciente: "Paciente Verificado",
        comentario: "Excelente atención médica, puntualidad y calidez humana. Explicación muy detallada del diagnóstico.",
        estrellas: 5,
        fecha: "Hace 1 semana • Google Review"
      }
    ],
    blogPosts: [],
    faqs: [
      {
        id: `faq-${Date.now()}-1`,
        pregunta: "¿Cómo puedo agendar una consulta médica?",
        respuesta: `Puedes agendar tu cita rápidamente haciendo clic en el botón de WhatsApp o llamando directamente al número de atención ${ciudad}.`
      },
      {
        id: `faq-${Date.now()}-2`,
        pregunta: "¿Qué formas de pago aceptan?",
        respuesta: "Aceptamos efectivo, transferencias bancarias directas, tarjetas de débito/crédito y emitimos factura para reembolso con aseguradoras privadas."
      }
    ],
    fotosConsultorio: [
      {
        id: `foto-cons-${Date.now()}-1`,
        url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
        titulo: "Área de Atención y Consultorio",
        descripcion: "Instalaciones diseñadas para la comodidad y privacidad de los pacientes."
      }
    ],
    guiasPacientes: []
  };
}

/**
 * Crea y guarda directamente en el catálogo un cliente nuevo en blanco listo para editar
 */
export function createNewBlankProfile(options?: {
  nombreMedico?: string;
  especialidad?: string;
  etiquetaEspecialidad?: string;
  ciudad?: string;
  tipoEnfoque?: "medico" | "clinica";
  notas?: string;
}): SavedClientProfile {
  const blankData = createBlankMedicalData(options);
  const clientName = `${blankData.nombreMedico} - ${blankData.especialidad} (${blankData.ciudad})`;
  
  const saved = saveProfile(
    blankData,
    clientName,
    undefined,
    options?.notas || "Cliente nuevo creado desde cero listo para personalizar.",
    options?.etiquetaEspecialidad || options?.especialidad || blankData.especialidad
  );

  return saved;
}
