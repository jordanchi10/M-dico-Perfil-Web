/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Servicio Puro de Gestión de Contexto IA y System Prompt
 * Centraliza la extracción, jerarquización y vectorización de datos clínicos de la landing page.
 */

import { MedicalLandingData, ServiceItem, ReviewItem, BlogPostItem, BeforeAfterCase } from "../types";

export const DEFAULT_ASSISTANT_SYSTEM_PROMPT = `Eres el Asistente Virtual IA del consultorio médico. Tu misión principal es orientar a los pacientes con calidez, empatía y el más alto rigor clínico (E-E-A-T) en Ecuador y Latinoamérica.

BASE DE CONOCIMIENTO PRIMARIA - LISTADO DE PREGUNTAS FRECUENTES (FAQS):
Al iniciar sesión y en cada interacción, tu fuente primaria de datos y de la verdad es el "Listado de Preguntas Frecuentes y Respuestas Clínicas Verificadas" configurado por el consultorio médico.
• Cuando el paciente pregunte sobre cualquier duda, política o procedimiento abordado en el Listado de FAQs, DEBES basar tu explicación directa en la respuesta oficial registrada en el sistema.
• Las actualizaciones o ediciones realizadas en las FAQs tienen efecto inmediato sobre tus respuestas.

REGLA DE ORO: ESTRUCTURA OBLIGATORIA DE 4 PASOS EN TODA RESPUESTA:
En cada interacción donde el paciente consulte sobre tratamientos, procedimientos, precios, citas o dudas clínicas, DEBES estructurar tu respuesta siguiendo estrictamente estos 4 pasos consecutivos:

1. BREVE SALUDO EMPÁTICO:
   - Inicia con un saludo cálido, respetuoso y personalizado mencionando al especialista o consultorio (ej. "¡Hola! Con mucho gusto te oriento sobre [tratamiento/servicio] con el/la Dr(a). [Nombre]...").
   - Transmite empatía, tranquilidad y profesionalismo desde la primera línea.

2. RESPUESTA DIRECTA BASADA EN EL CONTEXTO DEL TRATAMIENTO O FAQ SOLICITADA:
   - Responde de manera inmediata y concisa a la inquietud específica del paciente utilizando los datos indexados del procedimiento y la base de FAQs.
   - Especifica explícitamente cuando aplique:
     • Duración del procedimiento o consulta.
     • Inversión referencial o precio en dólares ($ USD).
     • Tiempo estimado de recuperación, reposo o cuidados postoperatorios/postratamiento.
   - Prohibido dar respuestas genéricas o evasivas cuando los datos existen en el contexto clínico.

3. TABLA O LISTA CON DETALLES CLAVE:
   - Presenta un resumen visualmente claro y estructurado utilizando una tabla Markdown o una lista con viñetas destacadas (•):
     | Procedimiento / Servicio | Inversión Referencial ($ USD) | Tiempo de Recuperación / Reposo | Duración | Modalidad |
   - Incluye cualquier detalle relevante adicional (ej. requerimientos previos, exámenes o modalidad en consultorio/quirófano).

4. CIERRE PROFESIONAL INVITANDO A LA ACCIÓN (WHATSAPP):
   - Concluye con una nota cordial recordando que la valoración médica diagnóstica definitiva se realiza de forma personalizada en la consulta presencial.
   - Invita activamente al paciente a dar el siguiente paso para agendar su cita o recibir asistencia inmediata vía WhatsApp con mensaje prellenado.

DIRECTIVAS ADICIONALES DE CONTEXTO CLÍNICO LOCAL (ECUADOR / LATAM):
• FACTURACIÓN & SEGUROS: Menciona que se emite factura electrónica autorizada por el SRI válida para deducción de gastos de salud y trámite de reembolso con aseguradoras privadas (Saludsa, Humana, Ecuasanitas, BMI, Confiamed, Bupa, etc.).
• EMERGENCIAS GRAVES: Ante síntomas de urgencia médica vital, indica acudir de inmediato al área de emergencias hospitalarias más cercana.`;

export interface LocalVectorNode {
  vectorId: string;
  categoria: "servicio" | "recuperacion" | "precio" | "testimonio" | "blog" | "caso" | "faq" | "doctor" | "politica";
  tituloKey: string;
  tokensContexto: string[];
  snippet: string;
  metadataExtra?: Record<string, any>;
}

export interface LocalContextVector {
  id: string;
  metadata: {
    medico: string;
    especialidad: string;
    ciudad: string;
    generadoEn: string;
    totalNodos: number;
    totalFaqs: number;
  };
  jerarquia: {
    preguntasFrecuentesFaqs: Array<{
      id: string;
      pregunta: string;
      respuesta: string;
      categoria?: string;
    }>;
    serviciosProcedimientos: Array<{
      id: string;
      titulo: string;
      descripcion: string;
      precio: string;
      duracion: string;
      recuperacion: string;
      modalidad: string;
      indicacionesPrePost?: string;
    }>;
    testimoniosResenas: Array<{
      id: string;
      paciente: string;
      estrellas: number;
      comentario: string;
      resultadoTratamiento?: string;
      fecha?: string;
    }>;
    articulosEducativosBlog: Array<{
      id: string;
      titulo: string;
      extracto: string;
      categoria: string;
      conceptosClave: string[];
    }>;
    casosClinicosAntesDespues: Array<{
      id: string;
      titulo: string;
      descripcion: string;
      tiempoEvolucion?: string;
    }>;
    politicasGarantiasAtencion: {
      horarios: string;
      pagosSRI: string;
      segurosReembolso: string[];
      atencionUrgencias: string;
    };
  };
  nodosVectorialesIndexados: LocalVectorNode[];
}

/**
 * Obtiene el System Prompt configurado o el por defecto de forma normalizada.
 */
export function getSystemPrompt(customPrompt?: string): string {
  if (customPrompt && customPrompt.trim().length > 20) {
    return customPrompt.trim();
  }
  return DEFAULT_ASSISTANT_SYSTEM_PROMPT;
}

/**
 * Función pura de servicio que construye un Vector de Contexto Local Jerárquico a partir de cualquier estructura de Landing Page Médica.
 */
export function buildHierarchicalContextVector(data: Partial<MedicalLandingData>): LocalContextVector {
  const medico = data.nombreMedico || "Especialista";
  const especialidad = data.especialidad || "Medicina Especializada";
  const ciudad = data.ciudad || "Ecuador";
  const precioConsulta = data.precioConsulta || "A consultar en valoración";

  // 0. Extraer Preguntas Frecuentes & Respuestas (FUENTE PRIMARIA DE VERDAD)
  const rawFaqs = (data.faqs && data.faqs.length > 0) 
    ? data.faqs 
    : (data.asistentePreguntas || []);

  const preguntasFrecuentesFaqs = rawFaqs.map((f, idx: number) => ({
    id: f.id || `faq-${idx}`,
    pregunta: (f.pregunta || "").replace(/\{\{CIUDAD\}\}/g, ciudad),
    respuesta: (f.respuesta || "").replace(/\{\{CIUDAD\}\}/g, ciudad),
    categoria: "Clínica & Consultorio"
  })).filter(f => f.pregunta.trim().length > 0);

  // 1. Extraer Servicios y Procedimientos
  const serviciosProcedimientos = (data.servicios || []).map((s: ServiceItem, idx: number) => ({
    id: s.id || `srv-${idx}`,
    titulo: s.titulo || "Procedimiento Médico Especializado",
    descripcion: s.descripcion || `Tratamiento clínico y procedimiento especializado en ${especialidad}.`,
    precio: s.precio || `A valorar en consulta presencial (${precioConsulta})`,
    duracion: s.duracion || "45 a 60 min",
    recuperacion: s.recuperacion || "Ambulatorio e inmediato con cuidados generales",
    modalidad: s.modalidad || "En consultorio presencial",
    indicacionesPrePost: "Traer exámenes previos e indicaciones en hoja de indicación médica."
  }));

  // 2. Extraer Testimonios y Reseñas
  const testimoniosResenas = (data.resenas || []).map((r: ReviewItem, idx: number) => ({
    id: r.id || `rev-${idx}`,
    paciente: r.paciente || "Paciente Verificado",
    estrellas: r.estrellas || 5,
    comentario: r.comentario || `Atención médica sumamente profesional y diagnósticos acertados con ${medico}.`,
    resultadoTratamiento: `Recuperación satisfactoria bajo protocolo clínico en ${ciudad}.`,
    fecha: r.fecha || "Reciente"
  }));

  // 3. Extraer Artículos de Blog
  const articulosEducativosBlog = (data.blogPosts || []).map((b: BlogPostItem, idx: number) => ({
    id: b.id || `blog-${idx}`,
    titulo: b.titulo || `Guía Médica: Prevención y Salud en ${especialidad}`,
    extracto: b.extracto || "Recomendaciones esenciales para el cuidado y salud integral del paciente.",
    categoria: b.categoria || "Salud & Prevención",
    conceptosClave: [b.categoria || "Salud", especialidad, ciudad, "Prevención"]
  }));

  // 4. Extraer Casos Clínicos
  const casosClinicosAntesDespues = (data.casosAntesDespues || []).map((c: BeforeAfterCase, idx: number) => ({
    id: c.id || `caso-${idx}`,
    titulo: c.titulo || "Evolución Clínica Favorable",
    descripcion: c.descripcion || "Paciente con recuperación completa y mejoría significativa.",
    tiempoEvolucion: "Seguimiento médico periódico"
  }));

  // 5. Extraer Políticas y Garantías
  const politicasGarantiasAtencion = {
    horarios: data.horarios ? `${data.horarios.semana || ''} ${data.horarios.sabado || ''}` : "Lunes a Viernes previa cita",
    pagosSRI: "Factura electrónica autorizada por el SRI enviada al correo del paciente para deducción de gastos médicos.",
    segurosReembolso: data.aseguradoras || ["Saludsa", "Humana", "Ecuasanitas", "Confiamed", "BMI", "Bupa"],
    atencionUrgencias: data.asistenteInstruccionesEspeciales || "En emergencias médicas graves acudir de inmediato a un centro hospitalario con área de urgencias."
  };

  // 6. Construir Nodos Vectoriales Indexados para Búsqueda Rápida Local Jerárquica
  const nodosVectorialesIndexados: LocalVectorNode[] = [];

  // Indexar Nodos de Preguntas Frecuentes (MÁXIMA PRIORIDAD COMO FUENTE PRIMARIA)
  preguntasFrecuentesFaqs.forEach((faq) => {
    const tokens = faq.pregunta
      .toLowerCase()
      .replace(/[¿?¡!,.:;()"'`´\-_/\\#+*%$&=[\]{}|]/g, " ")
      .split(" ")
      .filter(t => t.length > 2);

    nodosVectorialesIndexados.push({
      vectorId: `vec-${faq.id}`,
      categoria: "faq",
      tituloKey: `FAQ: ${faq.pregunta}`,
      tokensContexto: ["faq", "pregunta", "duda", "respuesta", ...tokens],
      snippet: `¿${faq.pregunta}? → ${faq.respuesta}`,
      metadataExtra: { pregunta: faq.pregunta, respuesta: faq.respuesta, categoria: faq.categoria }
    });
  });

  // Nodo Maestro de Doctor y Consulta
  nodosVectorialesIndexados.push({
    vectorId: "vec-doc-info",
    categoria: "doctor",
    tituloKey: `${medico} - ${especialidad}`,
    tokensContexto: [medico.toLowerCase(), especialidad.toLowerCase(), ciudad.toLowerCase(), "doctor", "medico", "especialista", "consultorio", "cita"],
    snippet: `${medico}, ${especialidad} en ${ciudad}. Valoración presencial: ${precioConsulta}`,
    metadataExtra: { medico, especialidad, ciudad, precioConsulta }
  });

  // Nodo de Precio de Consulta General
  nodosVectorialesIndexados.push({
    vectorId: "vec-prc-consulta",
    categoria: "precio",
    tituloKey: "Consulta Médica Presencial / Valoración Inicial",
    tokensContexto: ["consulta", "cita", "valoracion", "precio de consulta", "costo de cita", "cuanto cuesta la consulta", "honorarios", "tarifa"],
    snippet: `Precio de la consulta médica presencial con ${medico}: ${precioConsulta}`,
    metadataExtra: { procedimiento: "Consulta Médica", precio: precioConsulta }
  });

  serviciosProcedimientos.forEach((s) => {
    // Indexación de Servicios
    nodosVectorialesIndexados.push({
      vectorId: `vec-srv-${s.id}`,
      categoria: "servicio",
      tituloKey: s.titulo,
      tokensContexto: [s.titulo.toLowerCase(), "servicio", "tratamiento", "procedimiento", "cirugia", s.modalidad.toLowerCase()],
      snippet: `${s.titulo}: ${s.descripcion}`,
      metadataExtra: { precio: s.precio, duracion: s.duracion, recuperacion: s.recuperacion }
    });

    // Indexación de Tiempos de Recuperación
    nodosVectorialesIndexados.push({
      vectorId: `vec-rec-${s.id}`,
      categoria: "recuperacion",
      tituloKey: `Tiempo de Recuperación - ${s.titulo}`,
      tokensContexto: [
        "recuperacion", "reposo", "postoperatorio", "dias de reposo", "incapacidad", 
        "tiempo", "cuidados", "postquirurgico", "descanso", "baja medica", s.titulo.toLowerCase()
      ],
      snippet: `Tiempo estimado de recuperación para ${s.titulo}: ${s.recuperacion} (Duración: ${s.duracion})`,
      metadataExtra: { procedimiento: s.titulo, recuperacion: s.recuperacion, duracion: s.duracion }
    });

    // Indexación de Precios e Inversión
    nodosVectorialesIndexados.push({
      vectorId: `vec-prc-${s.id}`,
      categoria: "precio",
      tituloKey: `Precio e Inversión - ${s.titulo}`,
      tokensContexto: [
        "precio", "costo", "valor", "inversion", "cuanto cuesta", "tarifa", 
        "presupuesto", "cotizacion", "honorarios", "dolares", s.titulo.toLowerCase()
      ],
      snippet: `Inversión referencial para ${s.titulo}: ${s.precio}`,
      metadataExtra: { procedimiento: s.titulo, precio: s.precio }
    });
  });

  // Indexación de Testimonios
  testimoniosResenas.forEach((t) => {
    nodosVectorialesIndexados.push({
      vectorId: `vec-rev-${t.id}`,
      categoria: "testimonio",
      tituloKey: `Testimonio de ${t.paciente}`,
      tokensContexto: ["testimonio", "reseña", "opinion", "comentario", "experiencia", "paciente", t.paciente.toLowerCase()],
      snippet: `"${t.comentario}" — ${t.paciente} (${t.estrellas}★)`,
      metadataExtra: { estrellas: t.estrellas, paciente: t.paciente }
    });
  });

  // Indexación de Blog Médico
  articulosEducativosBlog.forEach((b) => {
    nodosVectorialesIndexados.push({
      vectorId: `vec-blog-${b.id}`,
      categoria: "blog",
      tituloKey: b.titulo,
      tokensContexto: ["blog", "articulo", "post", "guia", "consejo", b.categoria.toLowerCase(), b.titulo.toLowerCase()],
      snippet: `${b.titulo}: ${b.extracto}`,
      metadataExtra: { categoria: b.categoria }
    });
  });

  // Indexación de Casos Clínicos
  casosClinicosAntesDespues.forEach((c) => {
    nodosVectorialesIndexados.push({
      vectorId: `vec-case-${c.id}`,
      categoria: "caso",
      tituloKey: c.titulo,
      tokensContexto: ["caso", "evolucion", "resultado", "antes y despues", c.titulo.toLowerCase()],
      snippet: `${c.titulo}: ${c.descripcion}`,
      metadataExtra: {}
    });
  });

  // Indexación de Políticas, Reembolso y SRI
  nodosVectorialesIndexados.push({
    vectorId: "vec-pol-facturacion",
    categoria: "politica",
    tituloKey: "Facturación SRI y Reembolso de Aseguradoras",
    tokensContexto: ["factura", "sri", "seguro", "reembolso", "saludsa", "humana", "ecuasanitas", "bmi", "confiamed", "bupa", "gastos medicos"],
    snippet: `Facturación electrónica autorizada SRI. Cobertura por reembolso con aseguradoras: ${politicasGarantiasAtencion.segurosReembolso.join(", ")}`,
    metadataExtra: { seguros: politicasGarantiasAtencion.segurosReembolso }
  });

  return {
    id: `vec-ctx-${Date.now()}`,
    metadata: {
      medico,
      especialidad,
      ciudad,
      generadoEn: new Date().toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit' }),
      totalNodos: nodosVectorialesIndexados.length,
      totalFaqs: preguntasFrecuentesFaqs.length
    },
    jerarquia: {
      preguntasFrecuentesFaqs,
      serviciosProcedimientos,
      testimoniosResenas,
      articulosEducativosBlog,
      casosClinicosAntesDespues,
      politicasGarantiasAtencion
    },
    nodosVectorialesIndexados
  };
}

/**
 * Formatea un Vector de Contexto en un resumen estructurado apto para inyectar en llamadas a LLM o la exportación a producción.
 */
export function formatContextVectorSummary(vector: LocalContextVector): string {
  const { metadata, jerarquia } = vector;

  const faqsText = (jerarquia.preguntasFrecuentesFaqs || [])
    .map((f, i) => `${i + 1}. P: ${f.pregunta}\n   R: ${f.respuesta}`)
    .join("\n\n");

  const serviciosText = jerarquia.serviciosProcedimientos
    .map(s => `- ${s.titulo}: ${s.precio} | Recuperación: ${s.recuperacion} | Duración: ${s.duracion}`)
    .join("\n");

  const reseñasText = jerarquia.testimoniosResenas
    .map(r => `- ${r.paciente} (${r.estrellas}★): "${r.comentario}"`)
    .join("\n");

  return `
[CONTEXTO CLÍNICO VECTORIZADO]
Médico: ${metadata.medico} (${metadata.especialidad}) - ${metadata.ciudad}

PREGUNTAS FRECUENTES Y RESPUESTAS CLÍNICAS (FUENTE PRIMARIA DE VERDAD):
${faqsText || 'No hay FAQs registradas.'}

SERVICIOS Y RECUPERACIÓN:
${serviciosText || 'No hay servicios registrados.'}

TESTIMONIOS:
${reseñasText || 'No hay testimonios registrados.'}

POLÍTICAS:
Horarios: ${jerarquia.politicasGarantiasAtencion.horarios}
Facturación: ${jerarquia.politicasGarantiasAtencion.pagosSRI}
Aseguradoras por Reembolso: ${jerarquia.politicasGarantiasAtencion.segurosReembolso.join(", ")}
`.trim();
}

/**
 * Construye el System Prompt completo inyectando el Vector de Contexto de la landing médica.
 */
export function buildSystemPromptWithContext(data: Partial<MedicalLandingData>, customPrompt?: string): string {
  const basePrompt = getSystemPrompt(customPrompt);
  const vector = buildHierarchicalContextVector(data);
  const contextSummary = formatContextVectorSummary(vector);

  return `${basePrompt}\n\n${contextSummary}`;
}
