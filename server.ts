/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import * as ftp from "basic-ftp";
import { Readable } from "stream";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Initialize Gemini AI Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper function to call generateContent with automatic model fallback & retry
  async function generateContentWithFallback(params: {
    contents: any;
    config?: any;
  }) {
    // Standard models ordered by recommendation for basic text/JSON tasks
    const modelsToTry = [
      "gemini-3.7-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite"
    ];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[Gemini Request] Intentando con modelo: ${modelName} (intento ${attempt})`);
          const response = await ai.models.generateContent({
            ...params,
            model: modelName,
          });
          return response;
        } catch (error: any) {
          const errMsg = error?.message || String(error);
          console.log(`[Gemini Fallback] Modelo ${modelName} (intento ${attempt}) no disponible: ${error?.status || error?.code || errMsg.slice(0, 120)}`);
          lastError = error;

          const isQuotaOrBusy = errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("UNAVAILABLE") || errMsg.includes("overloaded");

          if (isQuotaOrBusy && attempt === 1) {
            // Breve espera antes de reintentar o cambiar de modelo
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue;
          }
          break; // Pasar al siguiente modelo alternativo
        }
      }
    }

    const lastErrMsg = lastError?.message || String(lastError);
    if (lastErrMsg.includes("429") || lastErrMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("El servicio de IA está experimentando alta demanda o límite de cuota temporal. Por favor espera unos segundos e intenta de nuevo.");
    }

    throw lastError || new Error("Todos los modelos de Gemini fallaron al generar contenido.");
  }

  // API route to generate 3 blog posts via Gemini 3.7 Flash
  app.post("/api/generate-blog", async (req: express.Request, res: express.Response) => {
    try {
      const { nombreMedico, especialidad, ciudad } = req.body;

      const prompt = `Genera exactamente 3 artículos de blog de salud altamente relevantes, profesionales y optimizados para SEO Local en ECUADOR para un sitio web médico.
Médico: "${nombreMedico || 'Un especialista'}"
Especialidad: "${especialidad || 'Medicina General'}"
Ciudad en Ecuador: "${ciudad || 'Quito'}", Ecuador.

Contexto obligatorio:
- El servicio es exclusivo para ECUADOR (ciudades ecuatorianas como Quito, Guayaquil, Cuenca, etc.).
- Los artículos deben resolver dudas reales de pacientes ecuatorianos con intención de búsqueda transaccional e informativa local (SEO Local y Long-tail en Ecuador).
- Considera el contexto de salud en Ecuador: avales del Ministerio de Salud Pública (MSP), SENESCYT, cobertura de aseguradoras privadas ecuatorianas (Saludsa, Humana, Ecuasanitas, Confiamed, etc.), factores geográficos/climáticos cuando aplique (altitud en la sierra, clima costero, etc.).

Debes devolver un JSON que sea una lista con exactamente 3 artículos de blog. Sigue exactamente este esquema de datos:
[
  {
    "id": "blog-1",
    "titulo": "Título atractivo y profesional del artículo centrado en SEO Long-tail para pacientes en Ecuador",
    "slug": "url-amigable-del-articulo",
    "extracto": "Un resumen corto de 2 líneas del artículo para captar al lector local.",
    "contenido": "Contenido completo estructurado y redactado profesionalmente con párrafos en etiquetas <p> y subtítulos usando etiquetas <h4>.",
    "fecha": "Fecha de hoy, ej. '16 Ago 2026'",
    "categoria": "Categoría corta, ej. 'Prevención', 'Tratamientos', 'Bienestar'",
    "imagenUrl": "URL de imagen de Unsplash que encaje perfectamente con el tema (puedes sugerir imágenes médicas genéricas, por ejemplo usando imágenes de salud de Unsplash)",
    "tiempoLectura": "ej. '5 min de lectura'"
  }
]

Para las imágenes de Unsplash, por favor usa URLs reales de imágenes médicas neutras y profesionales con buena estética de estas opciones o similares de Unsplash:
- https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop (Médicos)
- https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600&auto=format&fit=crop (Clínica)
- https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop (Salud)
- https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop (Estetoscopio)
- https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop (Consulta)

Asegúrate de que los artículos estén enfocados en la especialidad de "${especialidad}" en "${ciudad}, Ecuador" para maximizar la conversión local. Redacta en un tono empático, con rigor científico (E-E-A-T) y de máxima utilidad para pacientes ecuatorianos.`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                titulo: { type: Type.STRING },
                slug: { type: Type.STRING },
                extracto: { type: Type.STRING },
                contenido: { type: Type.STRING },
                fecha: { type: Type.STRING },
                categoria: { type: Type.STRING },
                imagenUrl: { type: Type.STRING },
                tiempoLectura: { type: Type.STRING },
              },
              required: ["id", "titulo", "slug", "extracto", "contenido", "fecha", "categoria", "imagenUrl", "tiempoLectura"],
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se obtuvo respuesta de texto por parte de Gemini.");
      }

      const blogPosts = JSON.parse(responseText.trim());
      res.json({ success: true, blogPosts });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ success: false, error: error.message || "Error interno del servidor de IA" });
    }
  });

  // API route to research local high-intent keywords and optimize meta tags/headlines
  app.post("/api/ai/keyword-research", async (req: express.Request, res: express.Response) => {
    try {
      const { especialidad, ciudad, servicios } = req.body;

      const prompt = `Actúa como un experto consultor de SEO Local y copywriting médico para el mercado de ECUADOR.
Tu misión es investigar y sugerir exactamente 5 palabras clave de alta intención de búsqueda local (transaccionales/informativas) para la especialidad de "${especialidad || 'Pediatría'}" en la ciudad de "${ciudad || 'Quito'}", Ecuador.

Además de sugerir las palabras clave, debes realizar una OPTIMIZACIÓN COMPLETA que las integre en la landing page del doctor de forma natural pero sumamente persuasiva:
1. Genera un "metaTitulo" (Meta Title) optimizado para Google (máximo 60 caracteres) que incluya el nombre del doctor (o un marcador como "Dr. Especialista"), la especialidad y la ciudad en Ecuador.
2. Genera una "metaDescripcion" (Meta Description) sumamente atractiva para incentivar el clic (CTR), de entre 110 y 160 caracteres, que incluya palabras clave, la ciudad y un llamado a la acción local (ej. agenda por WhatsApp, facilidades de pago o reembolso de aseguradoras en Ecuador).
3. Optimiza la "filosofia" (que funciona como la descripción/sub-titular de la Hero Section) para que fluya de manera hermosa y profesional pero integre sutilmente una palabra clave local.
4. Toma la siguiente lista de servicios actuales y optimiza el "titulo" y la "descripcion" de al menos los primeros 3 para integrar de forma orgánica y fluida las palabras clave locales recomendadas sin perder el rigor clínico (E-E-A-T).

Servicios actuales proporcionados:
${JSON.stringify(servicios || [], null, 2)}

Devuelve un objeto JSON estructurado que siga estrictamente el esquema de respuesta solicitado:
- "keywords": una lista de 5 palabras clave de SEO local de alta intención. Cada una con "keyword", su nivel de "volumen" estimado ("Alto", "Medio" o "Bajo" para Ecuador), y su "intencion" de búsqueda ("Transaccional" o "Informacional").
- "metaTitulo": El Meta Title sugerido.
- "metaDescripcion": La Meta Description sugerida.
- "filosofia": La filosofía médica optimizada para SEO Local.
- "servicios": La lista completa de servicios actualizada (con los primeros 3 optimizados para incluir keywords locales de forma natural, conservando el resto igual con sus respectivos IDs).`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    volumen: { type: Type.STRING },
                    intencion: { type: Type.STRING }
                  },
                  required: ["keyword", "volumen", "intencion"]
                }
              },
              metaTitulo: { type: Type.STRING },
              metaDescripcion: { type: Type.STRING },
              filosofia: { type: Type.STRING },
              servicios: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    titulo: { type: Type.STRING },
                    descripcion: { type: Type.STRING },
                    icono: { type: Type.STRING }
                  },
                  required: ["id", "titulo", "descripcion", "icono"]
                }
              }
            },
            required: ["keywords", "metaTitulo", "metaDescripcion", "filosofia", "servicios"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se obtuvo respuesta de Gemini para la investigación de palabras clave.");
      }

      const results = JSON.parse(responseText.trim());
      res.json({ success: true, ...results });
    } catch (error: any) {
      console.error("Error in keyword research AI:", error);
      res.status(500).json({ success: false, error: error.message || "Error al procesar la investigación de palabras clave locales." });
    }
  });

  // Helper function to extract structured medical landing data from raw text using Gemini
  async function extractMedicalDataFromText(rawText: string, sourceInfo: string = "texto libre", customSystemPrompt?: string) {
    const defaultSystemDirective = `Eres un asistente de inteligencia artificial especializado en atención al paciente, marketing médico y estructuración de datos clínicos para el Ecuador y Latinoamérica.

DIRECTIVAS DEL SISTEMA DEL ASISTENTE VIRTUAL Y REGLAS DE ESTRUCTURACIÓN:
1. PRIORIDAD EN SERVICIOS, TIEMPOS DE RECUPERACIÓN Y COSTOS:
   - Identifica y prioriza todos los SERVICIOS, TRATAMIENTOS Y CIRUGÍAS de la consulta médica.
   - Para cada servicio, debes extraer o inferir obligatoriamente:
     • "titulo": Nombre formal del procedimiento o consulta.
     • "descripcion": Explicación clínica clara de lo que incluye.
     • "precio": Costo u honorarios referenciales (ej. "$50 USD", "Desde $350 USD", "A valorar en consulta presencial").
     • "duracion": Duración estimada del procedimiento (ej. "30 min", "45 min", "1 hora").
     • "recuperacion": Tiempo estimado de recuperación post-tratamiento o post-quirúrgico (ej. "Ambulatorio e inmediato", "24 a 48 horas", "3 a 5 días de reposo").
     • "modalidad": Modalidad de atención (ej. "En consultorio presencial", "Quirófano / Cirugía", "Telemedicina online").
     • "icono": Nombre de icono Lucide adecuado (Stethoscope, Activity, Heart, ShieldCheck, Syringe, Eye, Scissors, Brain, etc.).
2. ESTRUCTURA EN TABLAS Y LISTAS CLARAS:
   - Estructura la información clínica, faqs y servicios en listas con viñetas o tablas comparativas organizadas de fácil lectura.
3. TONO PROFESIONAL, CORTÉS Y EMPÁTICO:
   - Mantén en todo momento un lenguaje profesional, respetuoso, empático y acogedor, transmitiendo máxima seguridad médica (E-E-A-T) y calidez humana.`;

    const systemHeader = customSystemPrompt && customSystemPrompt.trim().length > 20
      ? customSystemPrompt.trim()
      : defaultSystemDirective;

    const prompt = `${systemHeader}

Tu misión es analizar el siguiente texto de origen ("${sourceInfo}"), que puede ser desorganizado, un resumen de currículum, un perfil de Doctoralia/sitio web, notas de WhatsApp, etc., y estructurar todos los datos relevantes para completar automáticamente una Landing Page Médica de Alta Conversión.

TEXTO DE ORIGEN A ANALIZAR:
"""
${rawText}
"""

INSTRUCCIONES DE EXTRACCIÓN Y REGLAS DE NEGOCIO:
1. Extrae con precisión todos los datos encontrados.
2. Si algún dato no se encuentra explícito en el texto, deduce un valor profesional y coherente con la especialidad y el contexto ecuatoriano (por ejemplo: si la ciudad es Quito, deduce provincia Pichincha, país Ecuador, coordenadas -0.1807 / -78.4678 si aplican; si se menciona teléfono de Ecuador como 0991234567, genera el link de WhatsApp https://wa.me/593991234567).
3. Para los servicios (extrae todos los provistos por el usuario, idealmente entre 8 y 12), extrae nombre, descripción concisa, precio, duración (tiempo estimado de procedimiento), tiempo de recuperación postoperatoria o reposo, modalidad (consultorio/quirófano), reembolso SRI e icono Lucide válido.
4. Para las FAQs (extrae todas las provistas por el usuario, idealmente al menos 8), formula o extrae preguntas frecuentes y respuestas priorizando dudas sobre costos, recuperación postoperatoria, agendamiento y facilidades de pago (SRI, efectivo, transferencias, aseguradoras de Ecuador como Saludsa, Humana, Ecuasanitas, etc.).
5. Para los horarios, estructura semana, sábado y domingo de forma clara.
6. Si detectas redes sociales (Instagram, Facebook, TikTok, WhatsApp, email), extráelas o estandarízalas.
7. Retorna un objeto JSON strictly válido con la siguiente estructura:

{
  "nombreMedico": "ej. Dr. Juan Pérez",
  "especialidad": "ej. Traumatología y Ortopedia",
  "cedulaProfesional": "ej. MSP Reg. 171485921-0 / SENESCYT 1005-2012-1148292",
  "registroSenescyt": "ej. 1005-2012-1148292",
  "codigoAcessMsp": "ej. 171485921-0",
  "universidad": "ej. Universidad Central del Ecuador",
  "anosExperiencia": 12,
  "mision": "Propósito de servicio y salud para los pacientes",
  "vision": "Proyección y compromiso clínico de excelencia",
  "valores": ["Ética", "Calidez Humana", "Rigor Científico"],
  "fotoUrl": "URL de imagen si fue encontrada o URL de Unsplash médica profesional adecuada",
  "filosofia": "Filosofía o lema de atención médica humana y basada en evidencia",
  "biografiaCurta": "Biografía concisa de 2 a 3 líneas destacando trayectoria y avales",
  "nombreClinicaGBP": "Nombre de la clínica o consultorio",
  "direccionFisica": "Dirección completa de la clínica/consultorio",
  "ciudad": "ej. Quito",
  "estadoRegion": "ej. Pichincha",
  "codigoPostal": "ej. 170504",
  "pais": "Ecuador",
  "latitud": "-0.1807",
  "longitud": "-78.4678",
  "telefonoGBP": "+593 99 123 4567",
  "whatsappUrl": "https://wa.me/593991234567",
  "facebookUrl": "https://facebook.com/...",
  "instagramUrl": "https://instagram.com/...",
  "tiktokUrl": "https://tiktok.com/...",
  "youtubeUrl": "https://youtube.com/...",
  "linkedinUrl": "https://linkedin.com/...",
  "emailContacto": "contacto@...",
  "doctoraliaUrl": "https://www.doctoralia.com.ec/...",
  "dominioWeb": "https://drmedico.ec",
  "horarios": {
    "semana": "Lunes a Viernes: 09:00 AM - 07:00 PM",
    "sabado": "Sábados: 09:00 AM - 01:00 PM",
    "domingo": "Domingo: Cerrado / Previa Cita"
  },
  "aseguradoras": ["Saludsa", "Humana", "Ecuasanitas", "Confiamed", "BMI"],
  "hospitalesdondeOpera": ["Hospital Metropolitano", "Hospital Vozandes"],
  "asociaciones": ["Colegio de Médicos de Pichincha", "Federación Médica Ecuatoriana (FME)"],
  "certificados": ["Diplomado en Actualización Médica", "Certificación en Soporte Vital Avanzado"],
  "reconocimientos": ["Mérito Profesional a la Excelencia Médica"],
  "precioConsulta": "$50 USD",
  "metodosPago": ["Efectivo", "Transferencia Banco Pichincha / Guayaquil / Produbanco", "Tarjetas de Crédito", "DeUna", "Facturación SRI"],
  "habilitarTeleconsulta": true,
  "precioTeleconsulta": "$40 USD",
  "plataformasTeleconsulta": ["Zoom", "Google Meet", "WhatsApp Video"],
  "requisitosTeleconsulta": "Conexión a internet estable y exámenes previos en digital",
  "guiasPacientes": [
    {
      "id": "guia-1",
      "titulo": "Guía de Cuidados Postoperatorios",
      "descripcion": "Recomendaciones esenciales para una pronta recuperación en casa.",
      "categoria": "Cuidados",
      "formato": "PDF",
      "metodoEntrega": "descarga_directa",
      "tipoEnlace": "Descargar"
    }
  ],
  "redesSocialesVideos": [
    {
      "id": "vid-1",
      "plataforma": "instagram",
      "titulo": "Reel: Consejos de Salud y Prevención",
      "videoUrl": "https://www.instagram.com/reel/..."
    }
  ],
  "servicios": [
    {
      "id": "srv-1",
      "titulo": "Nombre del servicio o procedimiento",
      "descripcion": "Descripción concisa del servicio y beneficios",
      "precio": "$50 USD",
      "duracion": "45 min",
      "recuperacion": "Ambulatorio / 24 horas",
      "modalidad": "En consultorio",
      "aplicaReembolso": true,
      "badgeEtiqueta": "Más Solicitado",
      "icono": "Stethoscope"
    }
  ],
  "faqs": [
    {
      "id": "faq-1",
      "pregunta": "¿Cómo tramito el reembolso con mi seguro privado (Saludsa, Humana, BMI)?",
      "respuesta": "Al finalizar la consulta o procedimiento, se emite la Factura Electrónica autorizada por el SRI y el Formulario de Reclamo Médico firmado con código CIE-10 para tu reembolso ágil."
    }
  ],
  "resenas": [
    {
      "id": "rev-1",
      "paciente": "Nombre de paciente",
      "estrellas": 5,
      "comentario": "Excelente atención y diagnóstico certero...",
      "fecha": "Hace 2 semanas"
    }
  ],
  "casosAntesDespues": [
    {
      "id": "caso-1",
      "titulo": "Tratamiento y Recuperación Clínica",
      "descripcion": "Evolución favorable del paciente tras protocolo especializado.",
      "imgBefore": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600",
      "imgAfter": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600"
    }
  ],
  "blogPosts": [
    {
      "id": "blog-1",
      "titulo": "Título del artículo médico educativo",
      "slug": "guia-cuidados-salud",
      "extracto": "Resumen de recomendaciones preventivas e información clave...",
      "contenido": "Explicación detallada para orientación del paciente...",
      "fecha": "Reciente",
      "categoria": "Prevención & Salud",
      "imagenUrl": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
      "tiempoLectura": "5 min de lectura"
    }
  ],
  "paletaColor": "azul",
  "resumenExtraccion": "Breve resumen en 2 frases de lo que se extrajo con éxito del texto"
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No se pudo obtener una respuesta de estructuración de Gemini.");
    }

    const structuredData = JSON.parse(responseText.trim());
    if (structuredData.guias && !structuredData.guiasPacientes) {
      structuredData.guiasPacientes = structuredData.guias;
    }
    return structuredData;
  }

  // API route 2: Parse raw unorganized text
  app.post("/api/ai/parse-raw-text", async (req: express.Request, res: express.Response) => {
    try {
      const { rawText, systemPrompt } = req.body;
      if (!rawText || typeof rawText !== "string" || rawText.trim().length < 10) {
        return res.status(400).json({ 
          success: false, 
          error: "Por favor ingresa un texto con al menos 10 caracteres para que la IA pueda estructurarlo." 
        });
      }

      const structured = await extractMedicalDataFromText(rawText, "Texto libre ingresado por el usuario", systemPrompt);
      res.json({ success: true, data: structured, summary: structured.resumenExtraccion || "Información extraída y organizada exitosamente." });
    } catch (error: any) {
      console.error("Error parsing raw text:", error);
      res.status(500).json({ success: false, error: error.message || "Error al procesar el texto con IA." });
    }
  });

  // API route to extract real reviews from URL / raw text / Google Maps or generate realistic reviews
  app.post("/api/ai/extract-reviews", async (req: express.Request, res: express.Response) => {
    try {
      const { rawSource, mode, doctorInfo } = req.body;
      const { nombreMedico, especialidad, ciudad, nombreClinicaGBP } = doctorInfo || {};

      let contentToAnalyze = rawSource || "";

      // Si el origen parece una URL, intentar obtener su contenido HTML
      if (rawSource && /^https?:\/\//i.test(rawSource.trim())) {
        try {
          const fetchUrl = rawSource.trim();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const urlRes = await fetch(fetchUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
              "Accept-Language": "es-EC,es;q=0.9,en;q=0.8"
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (urlRes.ok) {
            const html = await urlRes.text();
            const cleaned = html
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .slice(0, 10000);
            contentToAnalyze = `CONTENIDO WEB Y RESEÑAS EXTRAÍDAS DE LA URL ${fetchUrl}:\n${cleaned}`;
          }
        } catch (err: any) {
          console.warn("No se pudo obtener URL directamente, usando contexto de URL con IA:", err.message);
        }
      }

      const prompt = `Eres un sistema especializado en análisis, extracción y estructuración de reseñas reales de pacientes para páginas web médicas en Ecuador.

DATOS DEL MÉDICO / CONSULTORIO:
- Médico: "${nombreMedico || 'Dr. Especialista'}"
- Especialidad: "${especialidad || 'Medicina General'}"
- Ciudad / Ubicación: "${ciudad || 'Quito'}, Ecuador"
- Nombre de la Clínica / GBP: "${nombreClinicaGBP || 'Consultorio Médico'}"

MODO SOLICITADO: "${mode || 'extract_pasted'}"

${mode === 'search_and_generate'
  ? `Genera entre 4 y 6 reseñas REALES, sumamente creíbles y representativas de pacientes atendidos por ${nombreMedico} (${especialidad}) en ${ciudad}, Ecuador. Los testimonios deben resaltar aspectos clínicos reales (trato empático, explicación clara del diagnóstico, efectividad de tratamiento, seguimiento por WhatsApp, puntualidad, instalaciones limpias y facilidad con aseguradoras de Ecuador). Usa nombres ecuatorianos auténticos (ej: "Ing. Santiago Morales", "Dra. Carmen Benítez", "Sra. Lucía Villacís", "Carlos A. Mendoza", "María Augusta Viteri") y fechas realistas (ej. 'Hace 2 días', 'Hace 1 semana', 'Hace 2 semanas', 'Hace 1 mes').`
  : `Analiza minuciosamente el siguiente texto (que puede contener enlaces de Google Maps/Doctoralia, capturas o chats de WhatsApp, publicaciones de Facebook, reseñas copiadas o texto libre) y EXTRAE TODAS LAS RESEÑAS O TESTIMONIOS DE PACIENTES:

TEXTO FUENTE:
"""
${contentToAnalyze}
"""

Instrucciones:
1. Divide el texto en cada testimonio individual encontrado.
2. Extrae el nombre del paciente, su calificación en estrellas (de 1 a 5, por defecto 5 si es positivo), el comentario detallado y la fecha/tiempo estimado.
3. Si el nombre no está explícito, asígnale un nombre respetuoso como "Paciente de ${ciudad}" o "Paciente Verificado".
4. Si el texto contenía un enlace o resumen general, adáptalo en 3 a 5 reseñas estructuradas coherentes con el contenido.`
}

Retorna un array JSON con los objetos de reseña estructurados según el esquema exigido.`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                paciente: { type: Type.STRING },
                estrellas: { type: Type.NUMBER },
                comentario: { type: Type.STRING },
                fecha: { type: Type.STRING },
              },
              required: ["id", "paciente", "estrellas", "comentario", "fecha"],
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se obtuvo respuesta de texto de la IA para extraer reseñas.");
      }

      const rawReviews = JSON.parse(responseText.trim());
      // Ensure unique IDs
      const reviews = rawReviews.map((rev: any, index: number) => ({
        id: `rev-extracted-${Date.now()}-${index}`,
        paciente: rev.paciente || "Paciente Verificado",
        estrellas: typeof rev.estrellas === "number" && rev.estrellas >= 1 && rev.estrellas <= 5 ? rev.estrellas : 5,
        comentario: rev.comentario || "Excelente atención médica.",
        fecha: rev.fecha || "Hace pocos días"
      }));

      res.json({ success: true, reviews });
    } catch (error: any) {
      console.error("Error al extraer reseñas con IA:", error);
      res.status(500).json({ success: false, error: error.message || "Error interno al procesar la extracción de reseñas." });
    }
  });

  // API route 3: Scan and extract content from multiple medical website URLs / social profiles
  app.post("/api/ai/scan-url", async (req: express.Request, res: express.Response) => {
    try {
      let { url, urls, systemPrompt } = req.body;
      let urlList: string[] = [];

      if (Array.isArray(urls)) {
        urlList = urls
          .map((u) => (typeof u === "string" ? u.trim() : ""))
          .filter((u) => u.length > 0);
      } else if (url && typeof url === "string" && url.trim().length > 0) {
        urlList = [url.trim()];
      }

      if (urlList.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Debes proporcionar al menos una URL válida para escanear." 
        });
      }

      // Max 5 URLs
      urlList = urlList.slice(0, 5);

      const parsedUrls: { original: string; urlObj: URL }[] = [];
      for (const item of urlList) {
        let formatted = item;
        if (!/^https?:\/\//i.test(formatted)) {
          formatted = "https://" + formatted;
        }
        try {
          const parsed = new URL(formatted);
          parsedUrls.push({ original: item, urlObj: parsed });
        } catch {
          console.warn(`[Scan-URL] URL inválida omitida: ${item}`);
        }
      }

      if (parsedUrls.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Ninguna de las URLs ingresadas tiene un formato válido (ej. https://tudominio.com)." 
        });
      }

      console.log(`[Scan-URL] Escaneando en paralelo ${parsedUrls.length} URL(s):`, parsedUrls.map(p => p.urlObj.toString()));

      // Fetch all webpages in parallel with custom timeout and headers
      const fetchResults = await Promise.allSettled(
        parsedUrls.map(async ({ original, urlObj }) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          try {
            const fetchResponse = await fetch(urlObj.toString(), {
              method: "GET",
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "es-EC,es;q=0.9,en;q=0.8",
                "Cache-Control": "no-cache",
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!fetchResponse.ok) {
              return {
                url: urlObj.toString(),
                domain: urlObj.hostname,
                success: false,
                error: `Estado HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`,
                title: "",
                metaTags: "",
                jsonLdText: "",
                cleanedHtml: `(No se pudo descargar el HTML directo: HTTP ${fetchResponse.status}. Analizar dominio y ruta para extraer intención)`
              };
            }

            const htmlContent = await fetchResponse.text();

            // Extract title, meta tags, JSON-LD, and text
            const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : "";

            const metaMatches = [...htmlContent.matchAll(/<meta\s+(?:name|property)=["']([^"']+)["']\s+content=["']([^"']+)["']/gi)];
            const metaTags = metaMatches
              .map(m => `${m[1]}: ${m[2]}`)
              .filter(m => /description|title|keywords|doctor|medical|specialty|og:|twitter:|author|profile/i.test(m))
              .join("\n");

            // Extract JSON-LD if present
            const jsonLdMatches = [...htmlContent.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
            const jsonLdText = jsonLdMatches.map(m => m[1].trim()).join("\n---\n");

            // Clean HTML body text
            let cleanedHtml = htmlContent
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
              .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
              .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
              .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
              .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
              .replace(/<[^>]+>/g, " ")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\s{2,}/g, " ")
              .trim();

            if (cleanedHtml.length > 10000) {
              cleanedHtml = cleanedHtml.slice(0, 10000) + "... [contenido truncado]";
            }

            return {
              url: urlObj.toString(),
              domain: urlObj.hostname,
              success: true,
              title,
              metaTags,
              jsonLdText,
              cleanedHtml
            };
          } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            return {
              url: urlObj.toString(),
              domain: urlObj.hostname,
              success: false,
              error: fetchErr.message || "Timeout o error de red",
              title: "",
              metaTags: "",
              jsonLdText: "",
              cleanedHtml: `(No se pudo descargar directamente la URL ${urlObj.toString()}: ${fetchErr.message || 'Error de conexión'}. Se debe tomar en cuenta el perfil / nombre en la URL).`
            };
          }
        })
      );

      // Build aggregated context text
      const pageSections: string[] = [];
      const successfulUrls: string[] = [];

      fetchResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          const item = result.value;
          if (item.success) successfulUrls.push(item.url);
          pageSections.push(`
================================================================================
FUENTE ${idx + 1} DE ${parsedUrls.length}: ${item.url} (Dominio: ${item.domain})
TÍTULO: ${item.title || "No especificado"}
METADATOS:
${item.metaTags || "Ninguno"}

DATOS ESTRUCTURADOS (JSON-LD):
${item.jsonLdText || "Ninguno"}

TEXTO EXTRAÍDO DE LA PÁGINA WEB O PERFIL:
${item.cleanedHtml}
================================================================================
          `.trim());
        }
      });

      const combinedText = `
MÚLTIPLES PÁGINAS Y PERFILES WEB DEL PROFESIONAL MÉDICO O CLÍNICA (${parsedUrls.length} ENLACES ANALIZADOS):
${pageSections.join("\n\n")}

INSTRUCCIÓN ESPECIAL PARA MÚLTIPLES FUENTES:
- Consolida y fusiona de forma armónica la información de TODAS las fuentes proporcionadas arriba.
- Si una fuente es un perfil de Doctoralia o TopDoctors y otra es Instagram/Facebook o su Sitio Web propio, unifica los servicios clínicos, tiempos de recuperación, testimonios, biografía, redes sociales, horarios y datos de contacto en una sola landing médica de alta conversión.
      `.trim();

      const structured = await extractMedicalDataFromText(
        combinedText, 
        `Múltiples enlaces escaneados: ${parsedUrls.map(p => p.urlObj.hostname).join(", ")}`, 
        systemPrompt
      );

      // Map any specific URLs to structured fields if not already populated
      for (const { urlObj } of parsedUrls) {
        const full = urlObj.toString();
        const host = urlObj.hostname.toLowerCase();

        if (/doctoralia/i.test(host) && !structured.doctoraliaUrl) {
          structured.doctoraliaUrl = full;
        } else if (/instagram\.com/i.test(host) && !structured.instagramUrl) {
          structured.instagramUrl = full;
        } else if (/facebook\.com/i.test(host) && !structured.facebookUrl) {
          structured.facebookUrl = full;
        } else if (/tiktok\.com/i.test(host) && !structured.tiktokUrl) {
          structured.tiktokUrl = full;
        } else if (/linkedin\.com/i.test(host) && !structured.linkedinUrl) {
          structured.linkedinUrl = full;
        } else if (/youtube\.com/i.test(host) && !structured.youtubeUrl) {
          structured.youtubeUrl = full;
        }
      }

      res.json({
        success: true,
        urls: parsedUrls.map(p => p.urlObj.toString()),
        totalUrlsScanned: parsedUrls.length,
        summary: structured.resumenExtraccion || `Se extrajo y consolidó con éxito la información de ${parsedUrls.length} página(s) y perfil(es) web.`,
        data: structured,
        extractedTextPreview: combinedText.slice(0, 400) + "..."
      });
    } catch (error: any) {
      console.error("Error scanning URLs:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "No se pudo extraer la información de los enlaces. Intenta copiar y pegar el texto en el campo de texto libre." 
      });
    }
  });

  // ==========================================
  // FTP / HOSTING DIRECT DEPLOYMENT ENDPOINTS
  // ==========================================

  // Endpoint 1: Probar conexión FTP
  app.post("/api/ftp/test", async (req: express.Request, res: express.Response) => {
    const { host, port, user, password, secure, remotePath } = req.body || {};
    
    if (!host || !host.trim()) {
      return res.status(400).json({ success: false, error: "El Host o Servidor FTP es obligatorio (ej. ftp.tudominio.com o IP)." });
    }
    if (!user || !user.trim()) {
      return res.status(400).json({ success: false, error: "El Usuario FTP es obligatorio (ej. usuario_cpanel o doctor@dominio.com)." });
    }

    const client = new ftp.Client(12000);
    client.ftp.verbose = false;

    try {
      const cleanHost = host.trim().replace(/^ftp:\/\//i, "").replace(/\/.*$/, "");
      const ftpPort = Number(port) || 21;
      const isSecure = secure === true || secure === "implicit" ? secure : false;
      const startTime = Date.now();
      const serverLogs: Array<{ time: string; type: "info" | "success" | "warn" | "error"; message: string }> = [];

      const addLog = (type: "info" | "success" | "warn" | "error", message: string) => {
        serverLogs.push({ time: new Date().toLocaleTimeString("es-EC", { hour12: false }), type, message });
      };

      addLog("info", `Iniciando conexión con socket ${cleanHost}:${ftpPort} (TLS/FTPS: ${isSecure ? 'Activado' : 'Desactivado'})...`);
      console.log(`[FTP Test] Conectando a ${cleanHost}:${ftpPort} con usuario: ${user.trim()} (Secure: ${isSecure})`);
      
      await client.access({
        host: cleanHost,
        port: ftpPort,
        user: user.trim(),
        password: password || "",
        secure: isSecure
      });

      addLog("success", `Autenticación FTP 230: Sesión iniciada como "${user.trim()}".`);

      let currentDir = "/";
      let filesCount = 0;
      const targetDir = remotePath && remotePath.trim() ? remotePath.trim() : "public_html";

      try {
        addLog("info", `Navegando a la carpeta de destino: "${targetDir}"...`);
        await client.cd(targetDir);
        currentDir = await client.pwd();
        addLog("success", `Directorio activo confirmado: ${currentDir}`);
        
        addLog("info", `Leyendo contenido de ${currentDir}...`);
        const list = await client.list();
        filesCount = list.length;
        addLog("success", `Lectura completada: ${filesCount} elementos encontrados en ${currentDir}.`);
      } catch (cdErr: any) {
        addLog("warn", `No se pudo acceder a "${targetDir}": ${cdErr.message || 'Directorio no encontrado'}. Probando directorio raíz...`);
        try {
          currentDir = await client.pwd();
          const list = await client.list();
          filesCount = list.length;
          addLog("info", `Directorio raíz alternativo: ${currentDir} (${filesCount} elementos).`);
        } catch {}
      }

      const responseTimeMs = Date.now() - startTime;
      addLog("success", `Prueba de conectividad completada con éxito en ${responseTimeMs}ms.`);

      res.json({
        success: true,
        message: `¡Conexión FTP exitosa! Autenticado correctamente con ${cleanHost} en ${responseTimeMs}ms.`,
        serverInfo: {
          host: cleanHost,
          user: user.trim(),
          currentDir,
          targetDir,
          filesFound: filesCount,
          secure: Boolean(isSecure),
          responseTimeMs
        },
        serverLogs
      });
    } catch (err: any) {
      console.error("[FTP Test Error]:", err);
      let errorDetail = err.message || String(err);
      let hint = "";

      if (errorDetail.includes("530") || errorDetail.toLowerCase().includes("login incorrect") || errorDetail.toLowerCase().includes("authentication failed")) {
        errorDetail = "Error 530: Usuario o contraseña FTP incorrectos. Verifica las credenciales creadas en cPanel / Hosting.";
        hint = "Revisa en tu panel de hosting (cPanel/Plesk) que la cuenta FTP exista y la contraseña sea exacta.";
      } else if (errorDetail.includes("ECONNREFUSED") || errorDetail.includes("ENOTFOUND")) {
        errorDetail = `No se pudo encontrar o conectar al host "${host}". Verifica que la dirección del servidor sea correcta y que el puerto esté abierto.`;
        hint = "Comprueba que el dominio o IP esté activo y que el puerto 21 no esté bloqueado.";
      } else if (errorDetail.includes("ETIMEDOUT") || errorDetail.includes("Timeout")) {
        errorDetail = `Tiempo de espera agotado al conectar con ${host}. Comprueba si tu hosting requiere conexión segura FTPS o si tu IP no está bloqueada por el firewall del servidor.`;
        hint = "Prueba activando o desactivando la opción 'Conexión Cifrada FTPS/TLS'.";
      }
      res.status(500).json({ success: false, error: errorDetail, hint });
    } finally {
      client.close();
    }
  });

  // Endpoint 2: Subir archivos directamente al hosting por FTP
  app.post("/api/ftp/upload", async (req: express.Request, res: express.Response) => {
    const { ftpConfig, files, cleanBeforeUpload } = req.body || {};
    
    if (!ftpConfig || !ftpConfig.host || !ftpConfig.user) {
      return res.status(400).json({ success: false, error: "Configuración FTP incompleta (Host y Usuario son requeridos)." });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, error: "No se proporcionaron archivos para desplegar." });
    }

    const client = new ftp.Client(60000);
    client.ftp.verbose = false;

    const startTime = Date.now();
    const uploadedFiles: Array<{ path: string; size: number; durationMs: number }> = [];
    const serverLogs: Array<{ time: string; type: "info" | "file" | "success" | "warn" | "error"; message: string; details?: any }> = [];
    let totalBytes = 0;
    let currentlyUploadingFile = "";
    let cleanedItemsCount = 0;

    const addLog = (type: "info" | "file" | "success" | "warn" | "error", message: string, details?: any) => {
      serverLogs.push({ time: new Date().toLocaleTimeString("es-EC", { hour12: false }), type, message, details });
    };

    try {
      const cleanHost = ftpConfig.host.trim().replace(/^ftp:\/\//i, "").replace(/\/.*$/, "");
      const ftpPort = Number(ftpConfig.port) || 21;
      const isSecure = ftpConfig.secure === true || ftpConfig.secure === "implicit" ? ftpConfig.secure : false;
      const rawRemotePath = ftpConfig.remotePath && ftpConfig.remotePath.trim() ? ftpConfig.remotePath.trim() : "public_html";
      const baseRemotePath = rawRemotePath.replace(/^\/+/, "").replace(/\/+$/, "");
      const shouldClean = cleanBeforeUpload === true || ftpConfig.cleanBeforeUpload === true || ftpConfig.cleanRemoteDir === true;

      addLog("info", `Conectando con socket FTP ${cleanHost}:${ftpPort} (Seguridad TLS: ${isSecure ? 'Activa' : 'Estándar'})...`);
      console.log(`[FTP Upload] Iniciando despliegue de ${files.length} archivos a ${cleanHost}:${ftpPort} en "${baseRemotePath}" (Limpiar carpeta previa: ${shouldClean ? 'Sí' : 'No'})`);

      await client.access({
        host: cleanHost,
        port: ftpPort,
        user: ftpConfig.user.trim(),
        password: ftpConfig.password || "",
        secure: isSecure
      });

      addLog("success", `Autenticación FTP verificada con éxito para "${ftpConfig.user.trim()}".`);

      // Navegar a la carpeta base del hosting (ej. public_html o directorio raíz)
      if (baseRemotePath && baseRemotePath !== "." && baseRemotePath !== "") {
        addLog("info", `Verificando y asegurando carpeta remota: "${baseRemotePath}"...`);
        await client.ensureDir(baseRemotePath);
        await client.cd(baseRemotePath);
      }

      // Recordar directorio base en el servidor
      const initialPwd = await client.pwd();
      addLog("info", `Directorio base de trabajo: ${initialPwd}`);

      // Si el usuario activó la opción de limpieza previa del directorio raíz
      if (shouldClean) {
        try {
          addLog("info", `Examinando contenido existente en "${initialPwd}" para limpieza previa...`);
          const existingItems = await client.list();
          if (existingItems && existingItems.length > 0) {
            cleanedItemsCount = existingItems.length;
            addLog("warn", `Directorio no vacío (${cleanedItemsCount} archivos/carpetas detectados). Procediendo a limpiar directorio...`);
            await client.clearWorkingDir();
            addLog("success", `Directorio raíz limpiado con éxito (${cleanedItemsCount} elementos eliminados).`);
          } else {
            addLog("info", `El directorio "${initialPwd}" ya se encuentra completamente vacío. Listo para recibir la nueva versión.`);
          }
        } catch (cleanErr: any) {
          addLog("warn", `No se pudo limpiar completamente el directorio remoto: ${cleanErr.message || 'Permiso restringido'}. Continuando con la sobreescritura de archivos...`);
        }
      }

      addLog("info", `Iniciando transferencia en lote de ${files.length} archivos generados...`);

      // Subir cada archivo recursivamente
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        if (!fileItem.path) continue;

        currentlyUploadingFile = fileItem.path;
        const fileStartTime = Date.now();

        // Limpiar ruta relativa del archivo (ej. "index.html", "servicios/pediatria.html", "img/medico.webp")
        const normalizedRelPath = fileItem.path.replace(/^\/+/, "");
        const parts = normalizedRelPath.split("/");
        const fileName = parts.pop()!;
        const subFolder = parts.join("/");

        // Convertir contenido a Buffer (manejando UTF-8 o Base64 para imágenes)
        let fileBuffer: Buffer;
        if (fileItem.encoding === "base64" || (typeof fileItem.content === "string" && fileItem.content.startsWith("data:"))) {
          const rawBase64 = fileItem.content.includes(",") ? fileItem.content.split(",")[1] : fileItem.content;
          fileBuffer = Buffer.from(rawBase64, "base64");
        } else {
          fileBuffer = Buffer.from(fileItem.content || "", "utf8");
        }

        totalBytes += fileBuffer.length;

        // Volver a la carpeta raíz de despliegue antes de procesar subdirectorios
        await client.cd(initialPwd);

        // Si el archivo está dentro de una subcarpeta (ej. 'servicios' o 'img'), asegurar su existencia y entrar en ella
        if (subFolder) {
          await client.ensureDir(subFolder);
          await client.cd(subFolder);
        }

        // Subir mediante stream con 1 reintento preventivo en caso de micro-corte
        let uploadSuccess = false;
        let lastUploadErr: any = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const readable = Readable.from(fileBuffer);
            await client.uploadFrom(readable, fileName);
            uploadSuccess = true;
            break;
          } catch (upErr: any) {
            lastUploadErr = upErr;
            if (attempt === 1) {
              addLog("warn", `Micro-pausa en socket al subir ${normalizedRelPath}. Reintentando automáticamente...`);
              await new Promise(r => setTimeout(r, 800));
            }
          }
        }

        if (!uploadSuccess && lastUploadErr) {
          throw lastUploadErr;
        }

        const durationMs = Date.now() - fileStartTime;
        uploadedFiles.push({
          path: normalizedRelPath,
          size: fileBuffer.length,
          durationMs
        });

        const sizeKb = (fileBuffer.length / 1024).toFixed(1);
        addLog("file", `[${i + 1}/${files.length}] Subido con éxito: ${normalizedRelPath} (${sizeKb} KB) en ${durationMs}ms`, {
          file: normalizedRelPath,
          bytes: fileBuffer.length,
          durationMs
        });
      }

      const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
      addLog("success", `¡Despliegue completado con éxito! ${uploadedFiles.length} archivos transmitidos (${(totalBytes / 1024).toFixed(1)} KB) en ${elapsedSeconds}s.`);
      console.log(`[FTP Upload] Completado con éxito: ${uploadedFiles.length} archivos subidos (${(totalBytes / 1024).toFixed(1)} KB) en ${elapsedSeconds}s`);

      res.json({
        success: true,
        message: `¡Despliegue completado con éxito! Se publicaron ${uploadedFiles.length} archivos en el hosting en ${elapsedSeconds}s.${cleanedItemsCount > 0 ? ` (Se limpiaron ${cleanedItemsCount} elementos previos)` : ''}`,
        uploadedCount: uploadedFiles.length,
        cleanedCount: cleanedItemsCount,
        totalBytes,
        elapsedSeconds,
        remotePath: initialPwd,
        uploadedFiles: uploadedFiles.map(f => f.path),
        uploadedDetails: uploadedFiles,
        serverLogs
      });
    } catch (err: any) {
      console.error("[FTP Upload Error]:", err);
      let errorDetail = err.message || String(err);
      let hint = "";

      if (errorDetail.includes("530") || errorDetail.toLowerCase().includes("login incorrect") || errorDetail.toLowerCase().includes("authentication failed")) {
        errorDetail = "Error 530: Usuario o contraseña FTP incorrectos en el hosting.";
        hint = "Comprueba que la contraseña sea correcta en la sección Cuentas FTP de tu panel cPanel / Plesk.";
      } else if (errorDetail.includes("550") || errorDetail.toLowerCase().includes("permission denied")) {
        errorDetail = "Error 550: Permiso denegado en el servidor para crear o sobrescribir archivos en la carpeta de destino.";
        hint = "Revisa los permisos CHMOD de la carpeta (deben ser 755 para directorios y 644 para archivos).";
      } else if (errorDetail.includes("553") || errorDetail.toLowerCase().includes("quota exceeded") || errorDetail.toLowerCase().includes("file name not allowed")) {
        errorDetail = "Error 553: Nombre de archivo no permitido o cuota de disco superada en el hosting.";
        hint = "Verifica que el plan de hosting tenga espacio libre en disco suficiente.";
      } else if (errorDetail.includes("ECONNREFUSED") || errorDetail.includes("ENOTFOUND")) {
        errorDetail = `No se pudo conectar al servidor FTP "${ftpConfig?.host}". Verifica que el nombre del host sea correcto.`;
        hint = "Revisa la dirección de servidor FTP proporcionada por tu proveedor de hosting.";
      } else if (errorDetail.includes("ECONNRESET") || errorDetail.includes("ETIMEDOUT") || errorDetail.includes("Timeout")) {
        errorDetail = "La conexión se interrumpió durante la transferencia por tiempo de espera o bloqueo de firewall.";
        hint = "Intenta volver a pulsar 'Subir a Hosting'; si persiste, prueba cambiando el modo de seguridad TLS.";
      }

      addLog("error", `Fallo en el despliegue: ${errorDetail} ${currentlyUploadingFile ? `(al transferir "${currentlyUploadingFile}")` : ''}`);

      res.status(500).json({ 
        success: false, 
        error: errorDetail,
        hint,
        failedFile: currentlyUploadingFile,
        partialUploads: uploadedFiles.map(f => f.path),
        uploadedDetails: uploadedFiles,
        serverLogs
      });
    } finally {
      client.close();
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
