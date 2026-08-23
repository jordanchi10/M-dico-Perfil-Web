/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper function to call generateContent with automatic model fallback
  async function generateContentWithFallback(params: {
    contents: any;
    config?: any;
  }) {
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Intentando generar contenido con el modelo: ${modelName}`);
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        return response;
      } catch (error: any) {
        console.error(`Error con el modelo ${modelName}:`, error.message || error);
        lastError = error;
        // Proceed to retry on another model
        continue;
      }
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
  async function extractMedicalDataFromText(rawText: string, sourceInfo: string = "texto libre") {
    const prompt = `Eres un asistente de inteligencia artificial especializado en marketing médico y estructuración de datos clínicos para el Ecuador y Latinoamérica.
Tu misión es analizar el siguiente texto de origen ("${sourceInfo}"), que puede ser desorganizado, un resumen de currículum, un perfil de Doctoralia/sitio web, notas de WhatsApp, etc., y estructurar todos los datos relevantes para completar automáticamente una Landing Page Médica de Alta Conversión.

TEXTO DE ORIGEN A ANALIZAR:
"""
${rawText}
"""

INSTRUCCIONES DE EXTRACCIÓN Y REGLAS DE NEGOCIO:
1. Extrae con precisión todos los datos encontrados.
2. Si algún dato no se encuentra explícito en el texto, deduce un valor profesional y coherente con la especialidad y el contexto ecuatoriano (por ejemplo: si la ciudad es Quito, deduce provincia Pichincha, país Ecuador, coordenadas -0.1807 / -78.4678 si aplican; si se menciona teléfono de Ecuador como 0991234567, genera el link de WhatsApp https://wa.me/593991234567).
3. Para los servicios (mínimo 3 a 5), extrae nombre, descripción concisa y un nombre de icono válido de Lucide (ej: "Stethoscope", "Heart", "Activity", "ShieldCheck", "UserCheck", "Brain", "Eye", "Syringe", "Award", "Clock", "MapPin", "Calendar").
4. Para las FAQs (mínimo 3 a 4), formula preguntas frecuentes y respuestas que resuelvan las dudas más comunes de los pacientes sobre esa especialidad, formas de pago (SRI, efectivo, transferencias, aseguradoras de Ecuador como Saludsa, Humana, Ecuasanitas, etc.).
5. Para los horarios, estructura semana, sábado y domingo de forma clara.
6. Si detectas redes sociales (Instagram, Facebook, TikTok, WhatsApp, email), extráelas o estandarízalas.
7. Retorna un objeto JSON estrictamente válido con la siguiente estructura:

{
  "nombreMedico": "ej. Dr. Juan Pérez",
  "especialidad": "ej. Traumatología y Ortopedia",
  "cedulaProfesional": "ej. MSP Reg. 171485921-0 / SENESCYT 1005-2012-1148292",
  "universidad": "ej. Universidad Central del Ecuador",
  "anosExperiencia": 12,
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
  "emailContacto": "contacto@...",
  "doctoraliaUrl": "https://www.doctoralia.com.ec/...",
  "horarios": {
    "semana": "Lunes a Viernes: 09:00 AM - 07:00 PM",
    "sabado": "Sábados: 09:00 AM - 01:00 PM",
    "domingo": "Domingo: Cerrado / Previa Cita"
  },
  "aseguradoras": ["Saludsa", "Humana", "Ecuasanitas", "Confiamed"],
  "hospitalesdondeOpera": ["Hospital Metropolitano", "Hospital Vozandes"],
  "asociaciones": ["Colegio de Médicos de Pichincha", "Federación Médica Ecuatoriana (FME)"],
  "servicios": [
    {
      "id": "srv-1",
      "titulo": "Nombre del servicio",
      "descripcion": "Descripción concisa del servicio y beneficios",
      "icono": "Stethoscope"
    }
  ],
  "faqs": [
    {
      "id": "faq-1",
      "pregunta": "¿Qué incluye la primera consulta?",
      "respuesta": "Evaluación física integral..."
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
    return structuredData;
  }

  // API route 2: Parse raw unorganized text
  app.post("/api/ai/parse-raw-text", async (req: express.Request, res: express.Response) => {
    try {
      const { rawText } = req.body;
      if (!rawText || typeof rawText !== "string" || rawText.trim().length < 10) {
        return res.status(400).json({ 
          success: false, 
          error: "Por favor ingresa un texto con al menos 10 caracteres para que la IA pueda estructurarlo." 
        });
      }

      const structured = await extractMedicalDataFromText(rawText, "Texto libre ingresado por el usuario");
      res.json({ success: true, data: structured, summary: structured.resumenExtraccion || "Información extraída y organizada exitosamente." });
    } catch (error: any) {
      console.error("Error parsing raw text:", error);
      res.status(500).json({ success: false, error: error.message || "Error al procesar el texto con IA." });
    }
  });

  // API route 3: Scan and extract content from a medical website URL
  app.post("/api/ai/scan-url", async (req: express.Request, res: express.Response) => {
    try {
      let { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ success: false, error: "Debes proporcionar una URL válida para escanear." });
      }

      url = url.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({ success: false, error: "El formato de la URL no es válido." });
      }

      // Fetch webpage content with custom headers and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const fetchResponse = await fetch(parsedUrl.toString(), {
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
        throw new Error(`El servidor de la URL respondió con estado ${fetchResponse.status}: ${fetchResponse.statusText}`);
      }

      const htmlContent = await fetchResponse.text();

      // Extract title, meta tags, JSON-LD, and text
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";

      const metaMatches = [...htmlContent.matchAll(/<meta\s+(?:name|property)=["']([^"']+)["']\s+content=["']([^"']+)["']/gi)];
      const metaTags = metaMatches
        .map(m => `${m[1]}: ${m[2]}`)
        .filter(m => /description|title|keywords|doctor|medical|specialty|og:|twitter:/i.test(m))
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

      // Limit length to avoid blowing prompt limit
      if (cleanedHtml.length > 12000) {
        cleanedHtml = cleanedHtml.slice(0, 12000) + "... [contenido truncado]";
      }

      const combinedText = `
URL ESCANEADA: ${parsedUrl.toString()}
TÍTULO DE LA PÁGINA: ${title}

METADATOS:
${metaTags}

DATOS ESTRUCTURADOS (JSON-LD):
${jsonLdText}

TEXTO EXTRAÍDO DE LA PÁGINA WEB:
${cleanedHtml}
      `.trim();

      const structured = await extractMedicalDataFromText(combinedText, `Sitio web escaneado: ${parsedUrl.toString()}`);
      
      // Preservar la URL de Doctoralia o sitio si aplica
      if (!structured.doctoraliaUrl && /doctoralia/i.test(parsedUrl.hostname)) {
        structured.doctoraliaUrl = parsedUrl.toString();
      }

      res.json({
        success: true,
        url: parsedUrl.toString(),
        summary: structured.resumenExtraccion || `Se extrajo y organizó la información de ${parsedUrl.hostname} con éxito.`,
        data: structured,
        extractedTextPreview: cleanedHtml.slice(0, 300) + "..."
      });
    } catch (error: any) {
      console.error("Error scanning URL:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "No se pudo extraer la información del enlace. Intenta copiar y pegar el texto en el campo de texto libre." 
      });
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
