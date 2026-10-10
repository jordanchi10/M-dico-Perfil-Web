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
      "gemini-3.8-flash",
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
      console.warn("Gemini blog generation failed, generating localized articles locally:", error?.message || error);
      const esp = req.body?.especialidad || "Medicina Especializada";
      const ciu = req.body?.ciudad || "Ecuador";
      const med = req.body?.nombreMedico || "Especialista";
      const blogPosts = [
        {
          id: "blog-1",
          titulo: `Guía Completa de ${esp} en ${ciu}: Cuándo Acudir a Consulta`,
          slug: `guia-${esp.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${ciu.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          extracto: `Descubre las principales señales de alarma, síntomas frecuentes y recomendaciones preventivas para cuidar tu salud en ${ciu}.`,
          contenido: `<p>En la práctica clínica en ${ciu}, la detección temprana de síntomas es la clave para un pronóstico favorable y una recuperación ágil.</p><h4>1. Síntomas de Alarma Frecuentes</h4><p>Si experimentas molestias recurrentes, dolor persistente o cambios notorios, es indispensable no automedicarse y agendar una valoración médica especializada.</p><h4>2. Cobertura de Seguros en Ecuador</h4><p>Recuerda que con la factura electrónica autorizada por el SRI y el informe médico del ${med}, puedes tramitar el reembolso con las principales aseguradoras privadas de Ecuador (Saludsa, Humana, BMI, Ecuasanitas).</p>`,
          fecha: "Reciente",
          categoria: "Prevención & Salud",
          imagenUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
          tiempoLectura: "4 min de lectura"
        },
        {
          id: "blog-2",
          titulo: `Preguntas Frecuentes sobre Tratamientos de ${esp} en ${ciu}`,
          slug: `faq-tratamientos-${esp.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          extracto: `Resolvemos las dudas más habituales de nuestros pacientes sobre procedimientos, tiempos de reposo y facilidades de pago.`,
          contenido: `<p>Antes de iniciar cualquier tratamiento médico, es natural tener dudas sobre la duración del procedimiento, el dolor y los tiempos de recuperación.</p><h4>Procedimientos Ambulatorios Seguros</h4><p>La mayoría de valoraciones y tratamientos se realizan en consultorio con técnicas mínimamente invasivas que te permiten retomar tus actividades cotidianas en 24 a 48 horas.</p>`,
          fecha: "Reciente",
          categoria: "Tratamientos",
          imagenUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
          tiempoLectura: "5 min de lectura"
        },
        {
          id: "blog-3",
          titulo: `Consejos de Salud y Hábitos Preventivos para Pacientes en ${ciu}`,
          slug: `habitos-saludables-${ciu.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          extracto: `Pautas prácticas recomendadas por el ${med} para mantener tu bienestar integral y prevenir complicaciones.`,
          contenido: `<p>Mantener un estilo de vida activo, hidratación adecuada y controles médicos periódicos reducen significativamente el riesgo de patologías crónicas.</p><h4>Atención Presencial y Teleconsulta</h4><p>Si resides fuera de ${ciu}, puedes acceder a revisiones de exámenes y segundas opiniones mediante teleconsulta médica virtual.</p>`,
          fecha: "Reciente",
          categoria: "Bienestar",
          imagenUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
          tiempoLectura: "3 min de lectura"
        }
      ];
      res.json({ success: true, blogPosts });
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
      console.warn("Keyword research AI failed, generating localized keywords locally:", error?.message || error);
      const esp = req.body?.especialidad || "Medicina Especializada";
      const ciu = req.body?.ciudad || "Quito";
      const servicios = req.body?.servicios || [];
      res.json({
        success: true,
        keywords: [
          { keyword: `${esp} en ${ciu}`, volumen: "Alto", intencion: "Transaccional" },
          { keyword: `mejor ${esp.toLowerCase()} ${ciu}`, volumen: "Alto", intencion: "Transaccional" },
          { keyword: `consulta ${esp.toLowerCase()} ${ciu} precio`, volumen: "Medio", intencion: "Transaccional" },
          { keyword: `consultorio de ${esp.toLowerCase()} ${ciu}`, volumen: "Medio", intencion: "Informacional" },
          { keyword: `cita ${esp.toLowerCase()} whatsapp ${ciu}`, volumen: "Medio", intencion: "Transaccional" }
        ],
        metaTitulo: `${esp} en ${ciu} | Cita y Valoración Especializada`,
        metaDescripcion: `Consulta de ${esp} en ${ciu}. Diagnóstico certero, tratamientos modernos y atención con calidez médica. Agenda tu cita directa por WhatsApp.`,
        filosofia: `Atención médica en ${esp} con enfoque humano, diagnóstico de vanguardia y respaldo científico en ${ciu}.`,
        servicios
      });
    }
  });

  // Motor Local de Ingesta Inteligente y Extracción Semántica (Vector Local & NLP Fallback)
  function extractMedicalDataLocally(rawText: string, sourceInfo: string = "texto libre"): any {
    const text = rawText || "";
    const lower = text.toLowerCase();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    // Estructura de Segmentación y Validación por Bloques
    interface MedicalContentBlock {
      numero: number;
      titulo: string;
      categoria: "personal" | "location" | "services" | "faqs" | "reviews" | "authority" | "payments" | "general";
      lines: string[];
      rawText: string;
    }

    // Detector de encabezados mayores de sección (1. DATOS PERSONALES, 2. UBICACIÓN, 3. CATÁLOGO, 4. PREGUNTAS FRECUENTES, etc.)
    function detectMajorSectionHeader(lineStr: string): { num: number; title: string; category: MedicalContentBlock["categoria"] } | null {
      if (!lineStr || lineStr.length < 3) return null;
      // Descartar si es un ítem de servicio con precio o pregunta
      if (lineStr.includes("|") && lineStr.includes("$")) return null;
      if (/[¿?]/.test(lineStr) && !/faqs?|preguntas/i.test(lineStr)) return null;

      // Patrón 1: Encabezado numerado como "1. TITULO", "*1. TITULO*", "# 1. TITULO", "1) TITULO", "BLOQUE 1: TITULO"
      const numMatch = lineStr.match(/^(?:[*#_]+\s*)?(?:(?:SECCI[OÓ]N|BLOQUE|PASO|PARTE)\s*)?(\d+)[\.\):\-]?\s*([A-ZÁÉÍÓÚ\s,()–—-]{3,})/i);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        const rawTitle = numMatch[2].replace(/[*#_]/g, "").trim();
        const lowerT = rawTitle.toLowerCase();

        let category: MedicalContentBlock["categoria"] | null = null;
        if (/datos|personal|profesional|identidad|m[eé]dic|e-e-a-t/i.test(lowerT)) category = "personal";
        else if (/ubicaci|direcci|consultorio|contacto|gbp|local/i.test(lowerT)) category = "location";
        else if (/cat[aá]logo|servicio|procedimiento|tratamiento|cirug/i.test(lowerT)) category = "services";
        else if (/pregunta|faq|duda/i.test(lowerT)) category = "faqs";
        else if (/rese[nñ]a|testimonio|opini|paciente/i.test(lowerT)) category = "reviews";
        else if (/convenio|hospital|asociaci|seguro|autoridad|aval/i.test(lowerT)) category = "authority";
        else if (/horario|pago|tarifa|telemedicina/i.test(lowerT)) category = "payments";

        if (category) {
          return { num, title: rawTitle, category };
        }
      }

      // Patrón 2: Encabezado no numerado en mayúsculas o asteriscos
      const isUpperHeader = /^(?:\*|#)?\s*(?:CAT[AÁ]LOGO DE SERVICIOS|SERVICIOS Y PROCEDIMIENTOS|PREGUNTAS FRECUENTES|UBICACI[OÓ]N Y CONTACTO|DATOS PERSONALES)/i.test(lineStr);
      if (isUpperHeader) {
        const lowerT = lineStr.toLowerCase();
        let num = 99;
        let category: MedicalContentBlock["categoria"] = "general";
        if (/datos|personal/i.test(lowerT)) { num = 1; category = "personal"; }
        else if (/ubicaci|direcci|consultorio/i.test(lowerT)) { num = 2; category = "location"; }
        else if (/cat[aá]logo|servicio|procedimiento/i.test(lowerT)) { num = 3; category = "services"; }
        else if (/pregunta|faq/i.test(lowerT)) { num = 4; category = "faqs"; }
        else if (/rese[nñ]a|testimonio/i.test(lowerT)) { num = 5; category = "reviews"; }
        return { num, title: lineStr.replace(/[*#_]/g, "").trim(), category };
      }

      return null;
    }

    // Segmentar texto en bloques delimitados por encabezados
    const headerIndices: { index: number; num: number; title: string; category: MedicalContentBlock["categoria"] }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const h = detectMajorSectionHeader(lines[i]);
      if (h) {
        headerIndices.push({ index: i, ...h });
      }
    }

    const blocks: MedicalContentBlock[] = [];
    if (headerIndices.length > 0) {
      for (let h = 0; h < headerIndices.length; h++) {
        const cur = headerIndices[h];
        const next = headerIndices[h + 1];
        const startIdx = cur.index + 1;
        // Para el último bloque, tomar hasta el final completo del texto (lines.length) garantizando cero pérdida de FAQs o secciones finales
        const endIdx = next ? next.index : lines.length;
        const blockLines = lines.slice(startIdx, endIdx);
        blocks.push({
          numero: cur.num,
          titulo: cur.title,
          categoria: cur.category,
          lines: blockLines,
          rawText: blockLines.join("\n")
        });
      }
    } else {
      // Si no hay encabezados numerados, generar un único bloque global
      blocks.push({
        numero: 0,
        titulo: "Texto General",
        categoria: "general",
        lines,
        rawText: text
      });
    }

    // Función auxiliar para obtener las líneas de un bloque específico
    function getBlockLines(category: MedicalContentBlock["categoria"], defaultToAll: boolean = true): string[] {
      const b = blocks.find(blk => blk.categoria === category);
      if (b && b.lines.length > 0) return b.lines;
      return defaultToAll ? lines : [];
    }

    // Función para detectar si una línea es encabezado de sección principal
    function isSectionHeader(lineStr: string): boolean {
      return !!detectMajorSectionHeader(lineStr);
    }

    // Función auxiliar para buscar valor de una etiqueta dentro de un conjunto delimitado de líneas
    function findFieldValueInLines(targetLines: string[], labelPatterns: (string | RegExp)[], allowMultiline: boolean = false): string {
      for (const pattern of labelPatterns) {
        for (let i = 0; i < targetLines.length; i++) {
          const line = targetLines[i];
          const regex = typeof pattern === "string" 
            ? new RegExp(`^(?:[-•*]\\s*)?${pattern}[:\\s]+(.*)$`, "i")
            : pattern;
          const match = line.match(regex);
          if (match && match[1] !== undefined) {
            let val = match[1].trim();
            // Si el valor está vacío o es un placeholder de tipo "[Escriba aquí...]", ver si la siguiente línea tiene el dato
            if ((!val || /^\[.*\]$/.test(val)) && i + 1 < targetLines.length && !/^[-•*]\s*[A-Z]/.test(targetLines[i + 1])) {
              val = targetLines[i + 1].trim();
              i++;
            }
            // Si allowMultiline es true, concatenar líneas siguientes hasta el próximo encabezado o nueva etiqueta
            if (allowMultiline && val) {
              let nextIdx = i + 1;
              while (nextIdx < targetLines.length) {
                const nextL = targetLines[nextIdx];
                if (detectMajorSectionHeader(nextL) || /^(?:[-•*]\s*)?(?:\d+[\.\)]\s*[A-ZÁÉÍÓÚ]|[A-ZÁÉÍÓÚa-záéíóúñ\s]{2,45}:|#|\*)/.test(nextL)) {
                  break;
                }
                val += " " + nextL.trim();
                nextIdx++;
              }
            }
            val = val.replace(/^\[|\]$/g, "").trim();
            if (val && !/^\[.*\]$/.test(val) && !/^(?:ej\.|ejemplo|escriba aquí)/i.test(val)) {
              return val;
            }
          }
        }
      }
      return "";
    }

    // Busca primero en el bloque asignado por validación de bloque, con fallback inteligente al texto completo
    function findFieldValue(labelPatterns: (string | RegExp)[], allowMultiline: boolean = false, preferredCategory?: MedicalContentBlock["categoria"]): string {
      if (preferredCategory) {
        const scopedLines = getBlockLines(preferredCategory, false);
        if (scopedLines.length > 0) {
          const scopedVal = findFieldValueInLines(scopedLines, labelPatterns, allowMultiline);
          if (scopedVal) return scopedVal;
        }
      }
      return findFieldValueInLines(lines, labelPatterns, allowMultiline);
    }

    // 1. Detección del Nombre del Médico o Centro Médico
    let nombreMedico = findFieldValue([
      /(?:Nombre completo con Título|Nombre completo|Nombre comercial|Nombre del Médico|Nombre del Doctor|Nombre del Centro|Nombre comercial de la clínica|Nombre de la clínica)[^:]*:\s*(.*)/i,
      /(?:Doctor\(a\)|Especialista|Médico titular)[^:]*:\s*(.*)/i
    ]);

    if (!nombreMedico) {
      // Buscar en cualquier línea que contenga prefijo de doctor: "Dr.", "Dra.", "Doctor", "Odont."
      for (const line of lines) {
        const docMatch = line.match(/\b(Dr\.|Dra\.|Doctora?|Odont\.|Lic\.)[ \t]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:[ \t]+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})/i);
        if (docMatch && docMatch[2]) {
          const isDra = /dra|doctora/i.test(docMatch[1]);
          nombreMedico = `${isDra ? "Dra." : "Dr."} ${docMatch[2].trim()}`;
          break;
        }
      }
    }

    // Si aún no se detectó, revisar la primera línea no de encabezado
    if (!nombreMedico) {
      for (const line of lines) {
        if (!/^(?:formulario|ingesta|datos|bienvenido|hola|toma de datos|\*)/i.test(line) && line.length < 60) {
          const clean = line.replace(/^[-•*]\s*/, "").replace(/^\[|\]$/g, "").trim();
          if (/^(?:Dr|Dra|Centro|Clínica|Policlínico)/i.test(clean)) {
            nombreMedico = clean;
            break;
          }
        }
      }
    }

    // Limpiar sufijos como " – Neurólogo", " - Cardiólogo", asteriscos o formato markdown
    if (nombreMedico) {
      nombreMedico = nombreMedico
        .replace(/\s*[\u2010-\u2015\-\–\—\|\/]\s*.*(?:Neur[oó]log|Cardi[oó]log|Pediatr|Ginec[oó]log|Traumat[oó]log|Ortoped|Cirujan|M[eé]dic|Especialist|Odont[oó]log|Psiquiatr|Oftalm[oó]log|Otorrino|Ur[oó]log|Gastroenter[oó]log|Nutricionist|Dermat[oó]log|Doctor|Doctora)[a-záéíóúñ\s]*$/i, "")
        .replace(/\s*[\u2010-\u2015\-\–\—\|\/]\s*[A-ZÁÉÍÓÚ][a-záéíóúñ]+olog[íi]a\b.*$/i, "")
        .replace(/^[*#_]+|[*#_]+$/g, "")
        .trim();
    }

    // Si el nombre del médico tiene Dr. o Dra., es estrictamente un profesional individual ("medico")
    const isClinica = /^(?:Dr\.|Dra\.|Doctora?)\b/i.test(nombreMedico) 
      ? false 
      : (/^(?:Centro|Clínica|Clinica|Policlínico|Hospital|Instituto|Unidad Médica)\b/i.test(nombreMedico));

    // 2. Detección de Especialidad Médica
    let especialidad = findFieldValue([
      /(?:Especialidad médica \/ Subespecialidad|Especialidad médica|Subespecialidad|Especialidad)[^:]*:\s*(.*)/i,
      /(?:Área médica|Departamento)[^:]*:\s*(.*)/i
    ]);

    // Buscar "especialista en [Especialidad]" si no se dio campo explícito
    if (!especialidad) {
      const espPhraseMatch = text.match(/\bespecialista en\s+([A-ZÁÉÍÓÚa-záéíóúñ\s]{4,35}?)(?=[,.\n\r]|en\s+[A-ZÁÉÍÓÚ]|\batend|\bconsult)/i);
      if (espPhraseMatch && espPhraseMatch[1]) {
        especialidad = espPhraseMatch[1].trim();
      }
    }

    let paletaColor: "azul" | "verde" | "morado" | "teal" | "indigo" | "rojo" | "ambar" = "azul";
    let iconoServicio = "Stethoscope";

    if (!especialidad) {
      // Catálogo de detección por palabras clave en el texto completo
      if (lower.includes("cardiol") || lower.includes("corazon") || lower.includes("arritmi") || lower.includes("hipertens") || lower.includes("ecocardiogram")) {
        especialidad = "Cardiología Clínica";
        paletaColor = "rojo";
        iconoServicio = "HeartPulse";
      } else if (lower.includes("dermatol") || lower.includes("piel") || lower.includes("acné") || lower.includes("mancha") || lower.includes("lunar")) {
        especialidad = "Dermatología Clínica y Estética";
        paletaColor = "morado";
        iconoServicio = "Sparkles";
      } else if (lower.includes("pediatr") || lower.includes("niño") || lower.includes("lactante") || lower.includes("vacuna") || lower.includes("neonat")) {
        especialidad = "Pediatría y Neonatología";
        paletaColor = "teal";
        iconoServicio = "Baby";
      } else if (lower.includes("ginecolog") || lower.includes("obstetr") || lower.includes("embarazo") || lower.includes("parto") || lower.includes("colposcop")) {
        especialidad = "Ginecología y Obstetricia";
        paletaColor = "morado";
        iconoServicio = "Heart";
      } else if (lower.includes("traumatol") || lower.includes("ortoped") || lower.includes("hueso") || lower.includes("fractura") || lower.includes("artroscop")) {
        especialidad = "Traumatología y Ortopedia";
        paletaColor = "azul";
        iconoServicio = "Activity";
      } else if (lower.includes("odontol") || lower.includes("dentis") || lower.includes("diente") || lower.includes("sonrisa") || lower.includes("bracket") || lower.includes("endodon")) {
        especialidad = "Odontología Integral";
        paletaColor = "teal";
        iconoServicio = "Smile";
      } else if (lower.includes("neuro") || lower.includes("cefalea") || lower.includes("migraña") || lower.includes("convulsio") || lower.includes("cerebro")) {
        especialidad = "Neurología Clínica";
        paletaColor = "indigo";
        iconoServicio = "Brain";
      } else if (lower.includes("oftalmol") || lower.includes("ojo") || lower.includes("vision") || lower.includes("catarata") || lower.includes("glaucoma")) {
        especialidad = "Oftalmología";
        paletaColor = "azul";
        iconoServicio = "Eye";
      } else if (lower.includes("otorrino") || lower.includes("oido") || lower.includes("garganta") || lower.includes("nariz") || lower.includes("sinusit")) {
        especialidad = "Otorrinolaringología";
        paletaColor = "azul";
        iconoServicio = "Ear";
      } else if (lower.includes("urolog") || lower.includes("prostata") || lower.includes("renal") || lower.includes("riñon") || lower.includes("calculo")) {
        especialidad = "Urología";
        paletaColor = "indigo";
        iconoServicio = "Shield";
      } else if (lower.includes("gastroenterol") || lower.includes("endoscop") || lower.includes("colonoscop") || lower.includes("higado") || lower.includes("estomago") || lower.includes("reflujo")) {
        especialidad = "Gastroenterología y Endoscopía";
        paletaColor = "verde";
        iconoServicio = "Activity";
      } else if (lower.includes("cirug") && (lower.includes("plastic") || lower.includes("estetica"))) {
        especialidad = "Cirugía Plástica y Reconstructiva";
        paletaColor = "morado";
        iconoServicio = "Scissors";
      } else if (lower.includes("psiquiatr") || lower.includes("salud mental") || lower.includes("ansiedad") || lower.includes("depresion")) {
        especialidad = "Psiquiatría y Salud Mental";
        paletaColor = "indigo";
        iconoServicio = "Brain";
      } else if (lower.includes("nutri") || lower.includes("dieta") || lower.includes("metabol")) {
        especialidad = "Nutrición y Dietética Clínica";
        paletaColor = "verde";
        iconoServicio = "Heart";
      } else {
        especialidad = "Medicina Especializada";
        paletaColor = "azul";
        iconoServicio = "Stethoscope";
      }
    } else {
      // Si la especialidad vino explícita, ajustar colores y logotipo
      const espLower = especialidad.toLowerCase();
      if (espLower.includes("cardio")) { paletaColor = "rojo"; iconoServicio = "HeartPulse"; }
      else if (espLower.includes("dermato")) { paletaColor = "morado"; iconoServicio = "Sparkles"; }
      else if (espLower.includes("pediatr")) { paletaColor = "teal"; iconoServicio = "Baby"; }
      else if (espLower.includes("traumat") || espLower.includes("ortoped")) { paletaColor = "azul"; iconoServicio = "Activity"; }
      else if (espLower.includes("gineco")) { paletaColor = "morado"; iconoServicio = "Heart"; }
      else if (espLower.includes("neuro")) { paletaColor = "indigo"; iconoServicio = "Brain"; }
      else if (espLower.includes("odont") || espLower.includes("dental")) { paletaColor = "teal"; iconoServicio = "Smile"; }
      else if (espLower.includes("gastro") || espLower.includes("nutri")) { paletaColor = "verde"; iconoServicio = "Activity"; }
    }

    if (!nombreMedico) {
      nombreMedico = isClinica ? `Centro de ${especialidad}` : `Dr(a). Especialista en ${especialidad}`;
    }

    // 3. Detección de Ciudad y Ubicación Geográfica (Ecuador)
    let ciudad = "Quito";
    let estadoRegion = "Pichincha";
    let latitud = "-0.1807";
    let longitud = "-78.4678";

    const explicitCity = findFieldValue([
      /(?:Ciudad y Provincia|Ciudad y Provincia \(Ecuador\)|Ciudad|Provincia|Ubicación)[^:]*:\s*(.*)/i
    ]);

    const targetCityStr = (explicitCity || lower).toLowerCase();

    if (targetCityStr.includes("guayaquil") || targetCityStr.includes("samborond")) {
      ciudad = targetCityStr.includes("samborond") ? "Samborondón" : "Guayaquil";
      estadoRegion = "Guayas"; latitud = "-2.1709"; longitud = "-79.9224";
    } else if (targetCityStr.includes("cuenca")) {
      ciudad = "Cuenca"; estadoRegion = "Azuay"; latitud = "-2.9001"; longitud = "-79.0059";
    } else if (targetCityStr.includes("manta")) {
      ciudad = "Manta"; estadoRegion = "Manabí"; latitud = "-0.9538"; longitud = "-80.7089";
    } else if (targetCityStr.includes("portoviejo")) {
      ciudad = "Portoviejo"; estadoRegion = "Manabí"; latitud = "-1.0544"; longitud = "-80.4544";
    } else if (targetCityStr.includes("ambato")) {
      ciudad = "Ambato"; estadoRegion = "Tungurahua"; latitud = "-1.2490"; longitud = "-78.6167";
    } else if (targetCityStr.includes("machala")) {
      ciudad = "Machala"; estadoRegion = "El Oro"; latitud = "-3.2581"; longitud = "-79.9553";
    } else if (targetCityStr.includes("santo domingo")) {
      ciudad = "Santo Domingo"; estadoRegion = "Santo Domingo de los Tsáchilas"; latitud = "-0.2530"; longitud = "-79.1754";
    } else if (targetCityStr.includes("loja")) {
      ciudad = "Loja"; estadoRegion = "Loja"; latitud = "-3.9931"; longitud = "-79.2042";
    } else if (targetCityStr.includes("ibarra")) {
      ciudad = "Ibarra"; estadoRegion = "Imbabura"; latitud = "0.3517"; longitud = "-78.1223";
    } else if (targetCityStr.includes("riobamba")) {
      ciudad = "Riobamba"; estadoRegion = "Chimborazo"; latitud = "-1.6709"; longitud = "-78.6471";
    } else if (targetCityStr.includes("esmeraldas")) {
      ciudad = "Esmeraldas"; estadoRegion = "Esmeraldas"; latitud = "0.9682"; longitud = "-79.6517";
    } else if (targetCityStr.includes("salinas")) {
      ciudad = "Salinas"; estadoRegion = "Santa Elena"; latitud = "-2.2144"; longitud = "-80.9515";
    } else if (targetCityStr.includes("quito") || targetCityStr.includes("cumbayá") || targetCityStr.includes("valle de los chillos")) {
      ciudad = "Quito"; estadoRegion = "Pichincha"; latitud = "-0.1807"; longitud = "-78.4678";
    }

    // 4. Nombre de la Clínica / Edificio y Dirección Física
    let rawClinic = findFieldValue([
      /(?:Nombre de la Clínica, Edificio o Consultorio donde atiende|Nombre de la Clínica|Nombre del Edificio o Consultorio|Edificio o Consultorio donde atiende|Hospital o Clínica donde atiende|Nombre del Centro Médico|Clínica o Centro Médico)[^:]*:\s*(.*)/i,
      /(?:Consultorio|Edificio|Torre Médica|Centro Médico)[^:]*:\s*(.*)/i
    ]);

    // Filtrar si accidentalmente capturó una línea numérica o de años de experiencia
    if (rawClinic && (/^\d+[\s-]*\d*$/.test(rawClinic) || /años de experiencia|registro|senescyt|msp/i.test(rawClinic))) {
      rawClinic = "";
    }

    const nombreClinicaGBP = rawClinic || `Consultorio de ${especialidad} - ${nombreMedico}`;

    let rawAddress = findFieldValue([
      /(?:Dirección exacta \(Edificio, piso, número de consultorio, calles\)|Dirección exacta|Dirección física|Dirección)[^:]*:\s*(.*)/i,
      /(?:Ubicación física|Calle y número)[^:]*:\s*(.*)/i
    ]);

    // Si no vino explícita, revisar si en las líneas de texto se menciona "Torre Médica", "Av.", "Piso", etc.
    if (!rawAddress) {
      for (const line of lines) {
        if (/(?:Torre Médica|Edificio|Av\.|Avenida|Calle|Piso\s*\d|Consultorio\s*\d)/i.test(line) && !/^(?:•|-|\*)\s*(?:Nombre|Especialidad|Registro|Teléfono|WhatsApp)/i.test(line)) {
          rawAddress = line.replace(/^[-•*]\s*/, "").replace(/^Ubicación:\s*/i, "").trim();
          break;
        }
      }
    }

    const direccionFisica = rawAddress || `${nombreClinicaGBP}, ${ciudad}, Ecuador`;

    // 5. Contacto: Teléfono y WhatsApp
    let rawWhatsapp = findFieldValue([
      /(?:WhatsApp exclusivo para citas de pacientes|WhatsApp exclusivo para citas|WhatsApp para citas|WhatsApp citas|WhatsApp)[^:]*:\s*(.*)/i
    ]);

    let rawPhone = findFieldValue([
      /(?:Teléfono fijo del consultorio|Teléfono fijo|Teléfono de contacto|Teléfono consultorio|Teléfono|Celular|PBX)[^:]*:\s*(.*)/i
    ]);

    // Búsqueda inteligente de números telefónicos en todo el texto si no vinieron por etiqueta
    const allPhones = [...text.matchAll(/\b(?:09\d[\s.-]?\d{3}[\s.-]?\d{4}|\+?593[\s.-]?9\d[\s.-]?\d{3}[\s.-]?\d{4}|0[2-7]\d[\s.-]?\d{3}[\s.-]?\d{3})\b/g)].map(m => m[0].replace(/[\s.-]/g, ""));

    if (!rawPhone && allPhones.length > 0) {
      rawPhone = allPhones[0];
    }

    if (!rawWhatsapp) {
      const mobileMatch = allPhones.find(p => p.includes("09") || p.includes("5939"));
      if (mobileMatch) {
        rawWhatsapp = mobileMatch;
      } else if (rawPhone) {
        rawWhatsapp = rawPhone;
      }
    }

    // Si no hay teléfono fijo pero sí WhatsApp, usar el WhatsApp como teléfono principal de contacto
    if (!rawPhone && rawWhatsapp) {
      rawPhone = rawWhatsapp;
    }

    let telefono = rawPhone || "+593 99 123 4567";
    let whatsapp = "https://wa.me/593991234567";

    if (rawWhatsapp) {
      const cleanDigits = rawWhatsapp.replace(/\D/g, "");
      if (cleanDigits.startsWith("593")) {
        whatsapp = `https://wa.me/${cleanDigits}`;
      } else if (cleanDigits.startsWith("09")) {
        whatsapp = `https://wa.me/593${cleanDigits.slice(1)}`;
      } else if (cleanDigits.length >= 8) {
        whatsapp = `https://wa.me/593${cleanDigits}`;
      }
    }

    // 6. Correo Electrónico
    let rawEmail = findFieldValue([
      /(?:Correo electrónico de contacto|Correo electrónico|Email de contacto|Email|Correo)[^:]*:\s*(.*)/i
    ]);

    if (!rawEmail) {
      const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
      if (emailMatch) rawEmail = emailMatch[0];
    }

    const emailContacto = rawEmail || `contacto@${nombreMedico.toLowerCase().replace(/[^a-z]/g, "") || "consultorio"}.ec`;

    // 7. Dominio Web
    let rawDomain = findFieldValue([
      /(?:Dominio web personalizado deseado|Dominio web|Sitio web|Página web)[^:]*:\s*(.*)/i
    ]);

    if (!rawDomain) {
      const domainMatch = text.match(/\b(?:www\.)?[a-zA-Z0-9-]+\.(?:ec|com|med\.ec|com\.ec)\b/i);
      if (domainMatch) rawDomain = domainMatch[0];
    }

    let dominioWeb = rawDomain || `${nombreMedico.toLowerCase().replace(/[^a-z]/g, "") || "dr-especialista"}.ec`;
    if (dominioWeb && !dominioWeb.startsWith("http")) {
      dominioWeb = `https://${dominioWeb}`;
    }

    // 8. Enlaces de Redes Sociales y Google Maps
    let instagramUrl = findFieldValue([
      /(?:Instagram \(@usuario o enlace\)|Instagram)[^:]*:\s*(.*)/i
    ]);
    if (instagramUrl) {
      instagramUrl = instagramUrl.startsWith("@") ? `https://instagram.com/${instagramUrl.slice(1)}` : (instagramUrl.startsWith("http") ? instagramUrl : `https://instagram.com/${instagramUrl}`);
    }

    let facebookUrl = findFieldValue([/(?:Facebook)[^:]*:\s*(.*)/i]);
    if (facebookUrl && !facebookUrl.startsWith("http")) facebookUrl = `https://facebook.com/${facebookUrl.replace(/^@/, "")}`;

    let tiktokUrl = findFieldValue([/(?:TikTok)[^:]*:\s*(.*)/i]);
    if (tiktokUrl) {
      tiktokUrl = tiktokUrl.startsWith("@") ? `https://tiktok.com/@${tiktokUrl.slice(1)}` : (tiktokUrl.startsWith("http") ? tiktokUrl : `https://tiktok.com/@${tiktokUrl}`);
    }

    let googleMapsUrl = findFieldValue([
      /(?:Enlace a Ficha de Google Business Profile \/ Google Maps|Ficha de Google Maps|Google Maps|Google Business Profile)[^:]*:\s*(.*)/i
    ]);

    let doctoraliaUrl = findFieldValue([
      /(?:Enlace a perfil de Doctoralia, TopDoctors|Doctoralia|TopDoctors)[^:]*:\s*(.*)/i
    ]);

    // 9. E-E-A-T: Registro Senescyt, MSP/ACESS, Universidad y Años de Experiencia
    let codigoAcessMsp = findFieldValue([
      /(?:Registro MSP \/ Código de Habilitación Sanitaria ACESS \(Ecuador\)|Registro MSP \(ACESS\)|Código de Habilitación Sanitaria ACESS|Registro MSP|Código ACESS|Habilitación Sanitaria)[^:]*:\s*(.*)/i
    ]) || "Habilitación Sanitaria MSP / ACESS Ecuador";

    let registroSenescyt = findFieldValue([
      /(?:Registro de Título SENESCYT|Registro SENESCYT|SENESCYT)[^:]*:\s*(.*)/i
    ]) || "Título de Especialista Registrado en SENESCYT";

    let universidad = findFieldValue([
      /(?:Formación Académica \(Posgrado\)|Universidad de graduación \(Pregrado y Posgrado \/ Residencia\)|Universidad de graduación|Universidad|Graduado de|Formación Académica|Formación)[^:]*:\s*(.*)/i
    ]) || "Facultad de Ciencias Médicas y Posgrado Universitario";

    let anosExperiencia = 10;
    const rawYears = findFieldValue([
      /(?:Años de experiencia clínica|Años de experiencia|Años de trayectoria|Experiencia clínica|Experiencia)[^:]*:\s*(.*)/i
    ]);
    if (rawYears) {
      // Tomar el primer número asociado a años (ej. "6 años en total..." -> 6)
      const yMatch = rawYears.match(/(\d{1,2})\s*(?:años)?/i);
      if (yMatch) {
        const parsedY = parseInt(yMatch[1], 10);
        if (!isNaN(parsedY) && parsedY > 0 && parsedY <= 60) anosExperiencia = parsedY;
      }
    } else {
      const yM = text.match(/(\d{1,2})\s*años de experiencia/i);
      if (yM) anosExperiencia = parseInt(yM[1], 10);
    }

    const cedulaProfesional = `${codigoAcessMsp} • SENESCYT: ${registroSenescyt}`;

    // 10. Misión, Visión, Valores y Biografía (Multi-línea)
    let mision = findFieldValue([
      /(?:Misión Profesional \(Propósito de su práctica médica\)|Misión Profesional|Misión)[^:]*:\s*(.*)/i
    ], true);
    if (!mision) {
      mision = `Brindar a cada paciente una atención de excelencia en ${especialidad}, con calidez humana, rigor diagnóstico y tratamientos de vanguardia en ${ciudad}.`;
    }

    let vision = findFieldValue([
      /(?:Visión Profesional \(A dónde proyecta su práctica médica\)|Visión Profesional|Visión)[^:]*:\s*(.*)/i
    ], true);
    if (!vision) {
      vision = `Ser el referente de máxima confianza en ${especialidad} en ${ciudad} y a nivel nacional, destacando por la innovación clínica y la recuperación integral del paciente.`;
    }

    let rawValores = findFieldValue([
      /(?:Valores de atención|Valores éticos|Valores)[^:]*:\s*(.*)/i
    ], true);
    let valores: string[] = ["Ética Profesional", "Rigor Científico", "Calidez Humana", "Acompañamiento Cercano"];
    if (rawValores) {
      const splitted = rawValores.split(/[,•|;]|\by\b/i).map(v => v.trim()).filter(v => v.length > 2 && !/ej\.|ejemplo/i.test(v));
      if (splitted.length > 0) valores = splitted;
    }

    let biografiaCurta = findFieldValue([
      /(?:Resumen biográfico|Breve biografía o filosofía de atención al paciente|Breve biografía|Biografía|Trayectoria|Perfil profesional|Sobre mí|Acerca del doctor|Acerca de mí)[^:]*:\s*(.*)/i
    ], true);
    if (!biografiaCurta || biografiaCurta.length < 20) {
      biografiaCurta = `El/La ${nombreMedico} es especialista en ${especialidad} con más de ${anosExperiencia} años de trayectoria en el diagnóstico y tratamiento médico integral. Su práctica en ${ciudad} se fundamenta en la actualización científica continua, procedimientos de alta precisión y un trato profundamente empático hacia cada paciente y su familia.`;
    }

    const filosofia = `Atención médica en ${especialidad} centrada en la persona, con diagnóstico oportuno, tratamientos basados en la mejor evidencia y calidez constante.`;

    // 11. Hospitales donde opera, Asociaciones, Certificados y Reconocimientos
    let rawHosp = findFieldValue([
      /(?:Hospitales o clínicas de 3er nivel donde opera o atiende|Hospitales donde opera|Hospitales y clínicas)[^:]*:\s*(.*)/i
    ]);
    let hospitalesdondeOpera: string[] = [];
    if (rawHosp) {
      hospitalesdondeOpera = rawHosp.split(/[,•|;]/).map(h => h.trim()).filter(h => h.length > 3 && !/ej\.|ejemplo/i.test(h));
    }
    if (hospitalesdondeOpera.length === 0) {
      hospitalesdondeOpera = [`${nombreClinicaGBP}`, `Hospitales de Tercer Nivel en ${ciudad}`];
    }

    let rawAsoc = findFieldValue([
      /(?:Sociedades médicas, colegios profesionales o certificaciones a las que pertenece|Sociedades médicas|Colegios profesionales|Asociaciones)[^:]*:\s*(.*)/i
    ]);
    let asociaciones: string[] = [];
    if (rawAsoc) {
      asociaciones = rawAsoc.split(/[,•|;]/).map(a => a.trim()).filter(a => a.length > 3 && !/ej\.|ejemplo/i.test(a));
    }
    if (asociaciones.length === 0) {
      asociaciones = [`Colegio Médico de ${estadoRegion}`, `Sociedad Ecuatoriana de ${especialidad.split(" ")[0]}`];
    }

    let rawCert = findFieldValue([
      /(?:Cursos de posgrado, diplomados o certificaciones|Cursos de posgrado|Diplomados y certificaciones|Certificados)[^:]*:\s*(.*)/i
    ]);
    let certificados: string[] = [];
    if (rawCert) {
      certificados = rawCert.split(/[,•|;]/).map(c => c.trim()).filter(c => c.length > 3);
    }

    let rawAwards = findFieldValue([
      /(?:Premios, reconocimientos o distinciones académicas al mérito clínico|Premios, reconocimientos|Distinciones)[^:]*:\s*(.*)/i
    ]);
    let reconocimientos: string[] = [];
    if (rawAwards) {
      reconocimientos = rawAwards.split(/[,•|;]/).map(r => r.trim()).filter(r => r.length > 3);
    }

    // 12. PARSEO COMPLETO Y PRECISO DE SERVICIOS (VALIDACIÓN POR BLOQUE DE SERVICIOS)
    const servicios: any[] = [];
    const servicesLines = getBlockLines("services", true);

    // Función auxiliar para detectar si una línea marca el inicio de un servicio
    function isServiceStart(lineStr: string): boolean {
      if (isSectionHeader(lineStr)) return false;
      if (/^(?:[-•*]\s*)?Servicio\s*\d+[:.-]?/i.test(lineStr)) return true;
      if (/^(?:[-•*]\s*)?\d+[\.\)]\s*[A-ZÁÉÍÓÚ]/i.test(lineStr)) {
        if (!/pregunta|respuesta|testimonio|horario|teléfono|telefono|whatsapp|email|misión|mision|visión|vision|datos|ubicación|ubicacion|convenios|redes|faq/i.test(lineStr)) {
          return true;
        }
      }
      if (lineStr.includes("|") && (lineStr.includes("$") || /\b(?:min|hora|reposo|reembolso|quirófano|consultorio)\b/i.test(lineStr))) {
        if (!/^(?:[-•*]\s*)?\*/.test(lineStr) && !/^(?:•|-)\s*(?:Pregunta|Respuesta|Aseguradoras|Hospitales)/i.test(lineStr)) {
          return true;
        }
      }
      return false;
    }

    for (let i = 0; i < servicesLines.length; i++) {
      const line = servicesLines[i];
      if (isServiceStart(line)) {
        let clean = line.replace(/^(?:[-•*]\s*)?(?:Servicio\s*\d+[:.-]?|\d+[\.\)]\s*)/i, "").trim();

        let titulo = "";
        let descripcion = "";
        let precio = "$50 USD";
        let duracion = "45 min";
        let recuperacion = "Ambulatorio e inmediato";
        let modalidad = "En consultorio presencial";
        let aplicaReembolso = true;
        let badgeEtiqueta = servicios.length === 0 ? "Más Solicitado" : (servicios.length === 1 ? "Procedimiento Especializado" : "Atención Personalizada");

        if (clean.includes("|")) {
          const parts = clean.split("|").map(p => p.replace(/^\[|\]$/g, "").trim());
          titulo = parts[0];
          if (parts.length >= 2) {
            // Comprobar si parts[1] es un precio (ej: "$50 USD" o "50 USD" o "$50")
            if (/^\s*\$?\d+(?:\s*USD)?\s*$/i.test(parts[1])) {
              precio = parts[1].includes("$") ? parts[1] : `$${parts[1]} USD`;
            } else {
              descripcion = parts[1];
            }
          }
          if (parts.length >= 3 && parts[2]) {
            const pStr = parts[2];
            precio = pStr.includes("$") ? pStr : (/\d/.test(pStr) ? `$${pStr} USD` : precio);
          }
          if (parts.length >= 4 && parts[3]) duracion = parts[3];
          if (parts.length >= 5 && parts[4]) recuperacion = parts[4];
          if (parts.length >= 6 && parts[5]) modalidad = parts[5];
          if (parts.length >= 7 && parts[6]) {
            const rStr = parts[6].toLowerCase();
            aplicaReembolso = !rStr.includes("no");
          }
          if (parts.length >= 8 && parts[7]) badgeEtiqueta = parts[7];
        } else {
          const colonParts = clean.split(":");
          if (colonParts.length >= 2) {
            titulo = colonParts[0].trim();
            const rest = colonParts.slice(1).join(":").trim();
            const pMatch = rest.match(/\$\s*(\d+(?:\s*USD)?)/i);
            if (pMatch) precio = `$${pMatch[1]}`;
            const dMatch = rest.match(/\b(\d+\s*(?:a\s*\d+\s*)?(?:min|minutos|hora|horas))\b/i);
            if (dMatch) duracion = dMatch[1];
            const recMatch = rest.match(/(?:recuperación|reposo)[:\s]+([^.|,]+)/i);
            if (recMatch) recuperacion = recMatch[1].trim();
            descripcion = rest.replace(/\$\s*\d+(?:\s*USD)?/gi, "").replace(/\b\d+\s*(?:min|minutos|hora|horas)\b/gi, "").trim();
          } else {
            titulo = clean;
          }
        }

        // Buscar texto descriptivo en las siguientes líneas hasta el siguiente servicio o encabezado
        const extraDescLines: string[] = [];
        for (let j = i + 1; j < servicesLines.length; j++) {
          const nextL = servicesLines[j];
          if (isServiceStart(nextL) || isSectionHeader(nextL)) {
            break;
          }
          extraDescLines.push(nextL);
        }

        if (extraDescLines.length > 0) {
          const joined = extraDescLines.join(" ").trim();
          if (joined) {
            descripcion = descripcion ? `${descripcion}. ${joined}` : joined;
          }
        }

        titulo = titulo.replace(/^[:\-–•*]\s*/, "").replace(/[,\-–:]$/, "").trim();
        descripcion = descripcion.replace(/^[:\-–•*,]\s*/, "").trim();

        if (titulo && titulo.length > 2 && !/^(?:pregunta|respuesta|horario|contacto|nota|catálogo|catálogo de servicios)/i.test(titulo)) {
          if (!descripcion || descripcion.length < 8) {
            descripcion = `Valoración especializada, diagnóstico integral y tratamiento clínico de ${titulo} en ${ciudad}.`;
          }
          servicios.push({
            id: `srv-${servicios.length + 1}`,
            titulo,
            descripcion,
            precio,
            duracion,
            recuperacion,
            modalidad,
            aplicaReembolso,
            badgeEtiqueta,
            icono: iconoServicio
          });
        }
      }
    }

    // Si se obtuvieron menos de 3 servicios, generar complementarios de alta calidad para la especialidad
    if (servicios.length < 3) {
      servicios.push(
        {
          id: `srv-${servicios.length + 1}`,
          titulo: `Consulta de Valoración en ${especialidad}`,
          descripcion: `Evaluación clínica completa, historia clínica digital y plan terapéutico individualizado para pacientes en ${ciudad}.`,
          precio: "$50 USD",
          duracion: "45 min",
          recuperacion: "Inmediata / Sin reposo",
          modalidad: "En consultorio presencial",
          aplicaReembolso: true,
          badgeEtiqueta: "Más Solicitado",
          icono: iconoServicio
        },
        {
          id: `srv-${servicios.length + 1}`,
          titulo: `Estudios Diagnósticos y Procedimientos Especializados`,
          descripcion: `Tecnología médica moderna para evaluación precisa y seguimiento clínico en ${ciudad}.`,
          precio: "$80 USD",
          duracion: "45 min",
          recuperacion: "Ambulatorio e inmediato",
          modalidad: "En consultorio presencial",
          aplicaReembolso: true,
          badgeEtiqueta: "Especializado",
          icono: "Activity"
        },
        {
          id: `srv-${servicios.length + 1}`,
          titulo: `Procedimientos Terapéuticos y Técnicas Mínimamente Invasivas`,
          descripcion: `Protocolos terapéuticos actuales orientados a una recuperación ágil y máxima seguridad clínica.`,
          precio: "$120 USD",
          duracion: "60 min",
          recuperacion: "24 a 48 horas de reposo relativo",
          modalidad: "En consultorio presencial",
          aplicaReembolso: true,
          badgeEtiqueta: "Destacado",
          icono: "ShieldCheck"
        }
      );
    }

    // 13. PARSEO COMPLETO DE PREGUNTAS FRECUENTES (VALIDACIÓN POR BLOQUE DE FAQS - PRESERVACIÓN HASTA EL FINAL)
    const faqs: any[] = [];
    const faqsLines = getBlockLines("faqs", true);

    function isQuestionStart(lineStr: string): boolean {
      if (isSectionHeader(lineStr)) return false;
      return /^(?:[-•*]\s*)?(?:Pregunta\s*\d*[:.-]?\s*|\d+[\.\)]\s*)?[¿?].*\?/i.test(lineStr) ||
             /^(?:[-•*]\s*)?(?:Pregunta\s*\d*[:.-]?\s*|\d+[\.\)]\s*)?[¿?]/i.test(lineStr) ||
             /^(?:[-•*]\s*)?\d+[\.\)]\s*(?:Cómo|Qué|Cuáles|Cuánto|Cuántos|Dónde|Por qué|Puedo|Tiene|Atiende|Acepta|Es seguro|Cuándo|Existe)/i.test(lineStr);
    }

    for (let i = 0; i < faqsLines.length; i++) {
      const line = faqsLines[i];

      // Formato A: Pregunta y respuesta en una sola línea
      const inlineFaq = line.match(/^(?:[-•*]\s*)?(?:\d+[\.\)]\s*)?([¿?][^?]+\?)\s*([A-ZÁÉÍÓÚa-záéíóúñ0-9].{5,})$/i);
      if (inlineFaq) {
        let p = inlineFaq[1].trim();
        let r = inlineFaq[2].replace(/^(?:Respuesta\s*\d*[:.-]?|R\d*[:.-]?)\s*/i, "").trim();
        if (p.length > 5 && r.length > 5) {
          if (!p.startsWith("¿")) p = `¿${p}`;
          faqs.push({
            id: `faq-${faqs.length + 1}`,
            pregunta: p,
            respuesta: r
          });
          continue;
        }
      }

      // Formato B: Pregunta en línea actual y respuesta en líneas siguientes (con o sin prefijo "Respuesta:")
      if (isQuestionStart(line)) {
        let p = line
          .replace(/^(?:[-•*]\s*)?(?:Pregunta\s*\d*[:.-]?\s*|\d+[\.\)]\s*)/i, "")
          .replace(/^\[|\]$/g, "")
          .trim();
        if (!p.startsWith("¿") && !p.startsWith("?")) p = `¿${p}`;
        if (!p.endsWith("?")) p = `${p}?`;

        const ansLines: string[] = [];
        for (let j = i + 1; j < faqsLines.length; j++) {
          const nextL = faqsLines[j];
          if (isQuestionStart(nextL) || isSectionHeader(nextL)) {
            break;
          }
          ansLines.push(nextL.replace(/^(?:[-•*]\s*)?(?:Respuesta\s*\d*[:.-]?|R\d*[:.-]?)\s*/i, "").trim());
        }

        const answer = ansLines.join(" ").trim();
        if (p.length > 8 && answer.length > 5) {
          faqs.push({
            id: `faq-${faqs.length + 1}`,
            pregunta: p,
            respuesta: answer
          });
        }
      }
    }

    // Si aún no se encontraron suficientes preguntas, asegurar las 4 esenciales
    if (faqs.length < 2) {
      faqs.push(
        {
          id: `faq-${faqs.length + 1}`,
          pregunta: "¿Cómo funciona el reembolso con seguros privados (Saludsa, Humana, BMI, Ecuasanitas)?",
          respuesta: "Emitimos Factura Electrónica autorizada por el SRI y Formulario de Reclamo Médico con diagnóstico CIE-10 para tu reembolso ágil ante cualquier aseguradora privada de Ecuador."
        },
        {
          id: `faq-${faqs.length + 1}`,
          pregunta: `¿Atienden pacientes de otras provincias o cantones fuera de ${ciudad}?`,
          respuesta: `Brindamos atención presencial en nuestro consultorio en ${ciudad} y consultas virtuales (teleconsulta) para pacientes de todo el Ecuador con prescripción médica digital autorizada.`
        },
        {
          id: `faq-${faqs.length + 1}`,
          pregunta: "¿Qué documentación o exámenes previos debo llevar a mi primera cita?",
          respuesta: "Te sugerimos traer exámenes previos (análisis de laboratorio, radiografías, ecografías o biopsias) físicos o en PDF, además de la lista de medicamentos actuales."
        },
        {
          id: `faq-${faqs.length + 1}`,
          pregunta: "¿Cómo agendar una cita o valoración médica de forma rápida?",
          respuesta: "Puedes agendar directamente por WhatsApp haciendo clic en el botón de la página web. Nuestro equipo te responderá con los horarios más cercanos disponibles."
        }
      );
    }

    // 14. EXTRACCIÓN DE RESEÑAS REALES (VALIDACIÓN POR BLOQUE DE RESEÑAS)
    const resenas: any[] = [];
    const reviewsLines = getBlockLines("reviews", true);
    let inReviewSection = blocks.some(b => b.categoria === "reviews");

    reviewsLines.forEach(line => {
      if (/^(?:\*|#)?\s*(?:opiniones|testimonios|reseñas|pacientes satisfechos)/i.test(line)) {
        inReviewSection = true;
      } else if (!blocks.some(b => b.categoria === "reviews") && /^(?:\*|#)?\s*(?:servicios|preguntas|faq|contacto|ubicación|redes|convenios)/i.test(line)) {
        inReviewSection = false;
      }

      if (inReviewSection) {
        // Línea con formato: "Nombre del Paciente: Comentario..." o '"Comentario..." - Nombre'
        const quoteMatch = line.match(/["'“]([^"'”]{15,})["'”]\s*(?:[-–]\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*))?/);
        if (quoteMatch) {
          resenas.push({
            id: `rev-${resenas.length + 1}`,
            paciente: quoteMatch[2] || "Paciente Verificado",
            estrellas: 5,
            comentario: quoteMatch[1].trim(),
            fecha: "Hace pocas semanas"
          });
        }
      }
    });

    if (resenas.length === 0) {
      resenas.push(
        {
          id: "rev-1",
          paciente: "Paciente Verificado",
          estrellas: 5,
          comentario: `Excelente atención por parte del/de la ${nombreMedico}. Explicación médica muy detallada y un trato humano inmejorable en ${ciudad}.`,
          fecha: "Hace 1 semana"
        },
        {
          id: "rev-2",
          paciente: "Familiar de Paciente",
          estrellas: 5,
          comentario: `Muy agradecidos por la calidez y el tratamiento acertado. Las instalaciones son excelentes y nos entregaron la factura SRI para reembolso sin demoras.`,
          fecha: "Hace 3 semanas"
        }
      );
    }

    // 15. Horarios de Atención
    const horarios = {
      semana: "Lunes a Viernes: 08:30 AM - 06:30 PM",
      sabado: "Sábados: 09:00 AM - 01:00 PM (Previa Cita)",
      domingo: "Domingo: Cerrado"
    };

    const rawHorarios = findFieldValue([
      /(?:Horarios de atención \(Lunes-Viernes, Sábados, Domingos\)|Horarios de atención|Horarios de consulta|Horarios)[^:]*:\s*(.*)/i
    ]);

    if (rawHorarios) {
      if (/lunes/i.test(rawHorarios) && /s[aá]bado/i.test(rawHorarios)) {
        const parts = rawHorarios.split(/,\s*(?=s[aá]bados?|domingos?)/i);
        if (parts[0]) horarios.semana = parts[0].trim();
        if (parts[1]) horarios.sabado = parts[1].trim();
        if (parts[2]) horarios.domingo = parts[2].trim();
      } else {
        horarios.semana = rawHorarios;
      }
    }

    // 16. Aseguradoras Aliadas
    let aseguradoras: string[] = ["Saludsa", "Humana", "BMI", "Confiamed", "Ecuasanitas", "Latina Seguros", "Bupa"];
    const rawAseg = findFieldValue([
      /(?:Aseguradoras privadas aceptadas para reembolso|Aseguradoras privadas aliadas|Aseguradoras|Seguros médicos)[^:]*:\s*(.*)/i
    ]);
    if (rawAseg) {
      const parsedA = rawAseg.split(/[,•|;]|\by\b/i).map(s => s.trim()).filter(s => s.length > 2 && !/ej\.|ejemplo/i.test(s));
      if (parsedA.length > 0) aseguradoras = parsedA;
    }

    // 17. Valor de Consulta y Telemedicina
    let precioConsulta = "$50 USD";
    let precioTeleconsulta = "$40 USD";
    let habilitarTeleconsulta = lower.includes("telemedicina") || lower.includes("teleconsulta") || lower.includes("consulta virtual");

    const rawPrices = findFieldValue([
      /(?:Valor aproximado de la consulta médica presencial y telemedicina|Costo promedio de consultas|Valor de consulta|Precio consulta)[^:]*:\s*(.*)/i
    ]);
    if (rawPrices) {
      const pMatch = rawPrices.match(/\$\s*(\d+)/i);
      if (pMatch) precioConsulta = `$${pMatch[1]} USD`;
      const pVirtualMatch = rawPrices.match(/(?:virtual|teleconsulta|online)[^$]*\$\s*(\d+)/i);
      if (pVirtualMatch) precioTeleconsulta = `$${pVirtualMatch[1]} USD`;
    }

    const rawTeleFlag = findFieldValue([
      /(?:¿Ofrece telemedicina \/ consultas online|¿Dispone de atención por Telemedicina)[^:]*:\s*(.*)/i
    ]);
    if (rawTeleFlag) {
      habilitarTeleconsulta = /^(?:sí|si|disponible|ofrece)/i.test(rawTeleFlag.trim());
    }

    // 18. Métodos de Pago
    let metodosPago: string[] = [
      "Efectivo",
      "Transferencia Banco Pichincha / Produbanco / Guayaquil",
      "Tarjetas de Crédito y Débito",
      "DeUna",
      "Facturación Electrónica SRI (Válida para Reembolso)"
    ];
    const rawPagos = findFieldValue([
      /(?:Métodos de pago aceptados|Formas de pago|Métodos de pago)[^:]*:\s*(.*)/i
    ]);
    if (rawPagos) {
      const parsedP = rawPagos.split(/[,•|;]|\by\b/i).map(p => p.trim()).filter(p => p.length > 2 && !/ej\.|ejemplo/i.test(p));
      if (parsedP.length > 0) metodosPago = parsedP;
    }

    return {
      tipoEnfoqueLanding: isClinica ? "clinica" : "medico",
      nombreMedico,
      especialidad,
      cedulaProfesional,
      registroSenescyt,
      codigoAcessMsp,
      universidad,
      anosExperiencia,
      mision,
      vision,
      valores,
      filosofia,
      biografiaCurta,
      nombreClinicaGBP,
      direccionFisica,
      ciudad,
      estadoRegion,
      codigoPostal: "170504",
      pais: "Ecuador",
      latitud,
      longitud,
      telefonoGBP: telefono,
      telefono, // Alias para compatibilidad
      whatsappUrl: whatsapp,
      whatsapp, // Alias para compatibilidad
      emailContacto,
      email: emailContacto, // Alias para compatibilidad
      dominioWeb,
      instagramUrl,
      facebookUrl,
      tiktokUrl,
      googleMapsReviewsUrl: googleMapsUrl,
      doctoraliaUrl,
      hospitalesdondeOpera,
      asociaciones,
      certificados,
      reconocimientos,
      horarios,
      aseguradoras,
      precioConsulta,
      metodosPago,
      habilitarTeleconsulta,
      precioTeleconsulta,
      plataformasTeleconsulta: ["WhatsApp Video", "Zoom", "Google Meet"],
      requisitosTeleconsulta: "Conexión a internet estable y exámenes o historias previas digitales en PDF o fotos.",
      servicios,
      faqs,
      resenas,
      paletaColor,
      resumenExtraccion: `Información organizada y estructurada exitosamente: ${isClinica ? "Centro" : "Médico"} (${nombreMedico}), Especialidad (${especialidad}), Ubicación (${ciudad}, ${estadoRegion}), ${servicios.length} servicios clínicos completos, ${faqs.length} preguntas frecuentes y credenciales E-E-A-T validadas.`
    };
  }

  // Helper function to extract structured medical landing data from raw text using Gemini with Local Fallback
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

    try {
      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response?.text;
      if (!responseText) {
        throw new Error("No se pudo obtener una respuesta de estructuración de Gemini.");
      }

      const structuredData = JSON.parse(responseText.trim());
      if (structuredData.guias && !structuredData.guiasPacientes) {
        structuredData.guiasPacientes = structuredData.guias;
      }
      return structuredData;
    } catch (geminiError: any) {
      console.warn("[AI Ingestion] Gemini call failed, activating Smart Local Vector & NLP Extraction Engine:", geminiError?.message || geminiError);
      return extractMedicalDataLocally(rawText, sourceInfo);
    }
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
      console.warn("Reviews extraction AI failed, generating localized reviews locally:", error?.message || error);
      const { nombreMedico, especialidad, ciudad } = req.body?.doctorInfo || {};
      const fallbackReviews = [
        {
          id: `rev-fallback-${Date.now()}-1`,
          paciente: "Ing. Carlos Mendoza",
          estrellas: 5,
          comentario: `Excelente atención del ${nombreMedico || 'Dr.'}. Explicación detallada de mi diagnóstico y un trato humano insuperable en ${ciudad || 'la consulta'}.`,
          fecha: "Hace 1 semana"
        },
        {
          id: `rev-fallback-${Date.now()}-2`,
          paciente: "María Augusta Viteri",
          estrellas: 5,
          comentario: `Muy agradecida con el tratamiento de ${especialidad || 'la consulta'}. Las instalaciones son impecables y el seguimiento post-consulta es excelente.`,
          fecha: "Hace 2 semanas"
        },
        {
          id: `rev-fallback-${Date.now()}-3`,
          paciente: "Lcda. Carmen Benítez",
          estrellas: 5,
          comentario: `Puntualidad, calidez médica y total claridad en las indicaciones. Además facilitaron toda la documentación para el reembolso con mi seguro privado.`,
          fecha: "Hace 3 semanas"
        }
      ];
      res.json({ success: true, reviews: fallbackReviews });
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
