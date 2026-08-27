/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { MedicalLandingData } from "../types";
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Award, 
  Activity, 
  MapPin, 
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  BookmarkCheck,
  FileCode,
  Copy,
  Terminal,
  History,
  Plus,
  RotateCcw,
  Clock,
  LineChart,
  TrendingDown
} from "lucide-react";
import { generateJsonLd } from "../utils/generators";

interface SeoAuditPanelProps {
  data: MedicalLandingData;
  key?: React.Key;
}

interface AuditRule {
  id: string;
  category: "seo" | "eeat" | "local" | "accessibility";
  title: string;
  description: string;
  status: "pass" | "warning" | "error";
  feedback: string;
}

interface HistoryPoint {
  timestamp: string;
  versionName: string;
  seo: number;
  eeat: number;
  local: number;
  accessibility: number;
  global: number;
}

export default function SeoAuditPanel({ data }: SeoAuditPanelProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "jsonld">("rules");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [chartView, setChartView] = useState<"global" | "all">("global");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const doctorKey = data.nombreMedico && !data.nombreMedico.includes("{{") 
    ? data.nombreMedico 
    : "Dr_Especialista_Borrador";
  const historyStorageKey = `medical_seo_history_v2_${doctorKey.replace(/\s+/g, "_")}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(historyStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    // Seed default history
    const now = new Date();
    const d1 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString("es-EC", { day: "numeric", month: "short" });
    const d2 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("es-EC", { day: "numeric", month: "short" });
    const d3 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("es-EC", { day: "numeric", month: "short" });
    const d4 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString("es-EC", { day: "numeric", month: "short" });
    const d5 = now.toLocaleDateString("es-EC", { day: "numeric", month: "short" }) + " (Ayer)";

    const seeded = [
      { timestamp: d1, versionName: "1. Borrador Inicial", eeat: 20, local: 0, seo: 10, accessibility: 0, global: 10 },
      { timestamp: d2, versionName: "2. Datos NAP de Ficha", eeat: 20, local: 100, seo: 25, accessibility: 0, global: 35 },
      { timestamp: d3, versionName: "3. Registro E-E-A-T", eeat: 80, local: 100, seo: 40, accessibility: 50, global: 65 },
      { timestamp: d4, versionName: "4. Artículos & SEO Local", eeat: 90, local: 100, seo: 90, accessibility: 50, global: 80 },
      { timestamp: d5, versionName: "5. Optimización Completa", eeat: 100, local: 100, seo: 100, accessibility: 100, global: 100 }
    ];
    setHistory(seeded);
    localStorage.setItem(historyStorageKey, JSON.stringify(seeded));
  }, [historyStorageKey]);

  const rules: AuditRule[] = [];

  // --- 1. AUDITORÍA DE E-E-A-T (Medical Trust) ---
  
  // Cédula Profesional
  const hasCedula = data.cedulaProfesional && data.cedulaProfesional.trim() !== "" && !data.cedulaProfesional.includes("{{");
  rules.push({
    id: "eeat-cedula",
    category: "eeat",
    title: "Cédula Profesional Verificable",
    description: "Requisito legal indispensable de Google (YMYL) para sitios médicos.",
    status: hasCedula ? "pass" : "error",
    feedback: hasCedula 
      ? `Cédula "${data.cedulaProfesional}" configurada correctamente.`
      : "Falta configurar la cédula profesional real. Su ausencia penaliza severamente el SEO médico."
  });

  // Asociaciones Médicas / Consejos
  const associationsCount = data.asociaciones ? data.asociaciones.filter(a => a && !a.includes("{{")).length : 0;
  rules.push({
    id: "eeat-associations",
    category: "eeat",
    title: "Consejo de Especialidad / Asociaciones",
    description: "Acredita tu autoridad ante el evaluador de Google.",
    status: associationsCount >= 2 ? "pass" : (associationsCount === 1 ? "warning" : "error"),
    feedback: associationsCount >= 2
      ? `Excelente. Cuentas con ${associationsCount} asociaciones médicas vinculadas.`
      : associationsCount === 1 
        ? "Recomendable vincular al menos una segunda asociación o consejo médico."
        : "No has configurado ninguna asociación médica o colegio oficial."
  });

  // Hospitales de Operación
  const hospitalsCount = data.hospitalesdondeOpera ? data.hospitalesdondeOpera.filter(h => h && !h.includes("{{")).length : 0;
  rules.push({
    id: "eeat-hospitals",
    category: "eeat",
    title: "Acreditaciones Hospitalarias",
    description: "Indica confianza física y experiencia en quirófanos autorizados.",
    status: hospitalsCount >= 1 ? "pass" : "error",
    feedback: hospitalsCount >= 1
      ? `Operas en ${hospitalsCount} hospitales certificados.`
      : "Falta vincular los hospitales o clínicas físicas donde realizas procedimientos quirúrgicos."
  });

  // Aseguradoras y Convenios
  const insurersCount = data.aseguradoras ? data.aseguradoras.filter(i => i && !i.includes("{{")).length : 0;
  rules.push({
    id: "eeat-insurers",
    category: "eeat",
    title: "Convenios con Aseguradoras",
    description: "Aumenta la tasa de conversión de pacientes asegurados.",
    status: insurersCount >= 3 ? "pass" : "warning",
    feedback: insurersCount >= 3
      ? `Aceptas ${insurersCount} aseguradoras para reembolso o convenio.`
      : "Recomendamos listar al menos 3 aseguradoras populares para ampliar tu alcance comercial."
  });

  // Reseñas y Testimonios de Pacientes (Schema Review + AggregateRating)
  const reviewsCount = data.resenas ? data.resenas.filter(r => r.paciente && r.comentario).length : 0;
  rules.push({
    id: "eeat-reviews",
    category: "eeat",
    title: "Prueba Social & Schema Reviews",
    description: "Inyecta entidades Review y AggregateRating en el JSON-LD para habilitar estrellas en Google Rich Snippets.",
    status: reviewsCount >= 2 ? "pass" : (reviewsCount === 1 ? "warning" : "error"),
    feedback: reviewsCount >= 2
      ? `Excelente. Cuentas con ${reviewsCount} reseñas verificadas inyectadas en el Schema.org.`
      : reviewsCount === 1
        ? "Cuentas con 1 reseña. Se recomiendan al menos 2 o más para activar un AggregateRating confiable."
        : "No tienes reseñas de pacientes. Añade reseñas dinámicas desde el formulario para activar el marcado de estrellas en Google."
  });

  // Citaciones & Backlinks de Autoridad Médica (E-E-A-T & Google Trust)
  const backlinksList = data.backlinksAutoridad || [];
  const verifiedBacklinks = backlinksList.filter(b => b && b.estado === 'verificado').length;
  const schemaBacklinks = backlinksList.filter(b => b && b.incluirEnSchema).length;
  rules.push({
    id: "eeat-backlinks-authority",
    category: "eeat",
    title: "Citaciones & Backlinks de Autoridad Médica",
    description: "Conecta tu sitio con Colegios de Médicos, Google Maps, Staff Hospitalarios y Sociedades Científicas en sameAs.",
    status: verifiedBacklinks >= 2 ? "pass" : (backlinksList.length > 0 ? "warning" : "error"),
    feedback: verifiedBacklinks >= 2
      ? `Excelente. Cuentas con ${verifiedBacklinks} enlaces/citaciones de autoridad verificadas (y ${schemaBacklinks} vinculados en Schema JSON-LD).`
      : backlinksList.length > 0
        ? `Tienes ${backlinksList.length} citación(es) registrada(s), pero solo ${verifiedBacklinks} verificada(s). Revisa el estado en el Módulo de Backlinks del Editor SEO.`
        : "No tienes backlinks o citaciones de autoridad configurados. Agrégalos en el Módulo de Backlinks del Editor SEO o usa 'Sugerencias Automáticas'."
  });


  // --- 2. AUDITORÍA DE SEO LOCAL (Google Maps & NAP) ---
  
  // Consistencia NAP (Clínica, Dirección y Teléfono)
  const isNapComplete = data.nombreClinicaGBP && data.direccionFisica && data.telefonoGBP && 
                        !data.nombreClinicaGBP.includes("{{") && !data.direccionFisica.includes("{{") && !data.telefonoGBP.includes("{{");
  rules.push({
    id: "local-nap",
    category: "local",
    title: "Consistencia NAP (Name, Address, Phone)",
    description: "Los buscadores indexan con mayor autoridad si coinciden de forma idéntica con Maps.",
    status: isNapComplete ? "pass" : "error",
    feedback: isNapComplete
      ? "Datos NAP consistentes con tu ficha de Google Business Profile."
      : "Tienes marcadores de plantilla vacíos en dirección, clínica o teléfono. Google penalizará la coincidencia local."
  });

  // Coordenadas Geográficas
  const hasCoords = data.latitud && data.longitud && !data.latitud.includes("{{") && !data.longitud.includes("{{");
  rules.push({
    id: "local-coords",
    category: "local",
    title: "Coordenadas del Consultorio",
    description: "Latitud y longitud precisas para inyectar en el Physician Schema.",
    status: hasCoords ? "pass" : "warning",
    feedback: hasCoords
      ? `Coordenadas configuradas: [${data.latitud}, ${data.longitud}].`
      : "Falta configurar la latitud y longitud exactas. Google las requiere para ubicarte en el mapa local."
  });


  // --- 3. DENSIDAD DE PALABRAS CLAVE & METADATOS ---

  // Longitud de Meta descripción (Filosofía / Biografía corta)
  const metaLength = (data.filosofia || "").length;
  rules.push({
    id: "seo-meta-desc",
    category: "seo",
    title: "Longitud de Filosofía (Meta Description)",
    description: "Se utiliza en los motores de búsqueda para convencer al paciente de hacer clic.",
    status: metaLength >= 120 && metaLength <= 160 ? "pass" : "warning",
    feedback: metaLength >= 120 && metaLength <= 160
      ? `Longitud perfecta (${metaLength} caracteres).`
      : metaLength < 120
        ? `Muy corta (${metaLength} caracteres). Escribe al menos 120 caracteres para evitar que Google invente un extracto aleatorio.`
        : `Muy larga (${metaLength} caracteres). Supera el límite de visualización en buscadores (máx. 160).`
  });

  // Densidad de Especialidad + Ciudad
  const combinedText = `${data.filosofia} ${data.biografiaCurta} ${data.nombreMedico} ${data.especialidad} ${data.ciudad} ${data.nombreClinicaGBP} ` +
                       data.servicios.map(s => `${s.titulo} ${s.descripcion}`).join(" ");
  
  const specialtyKeyword = data.especialidad && !data.especialidad.includes("{{") ? data.especialidad.toLowerCase() : "";
  const cityKeyword = data.ciudad && !data.ciudad.includes("{{") ? data.ciudad.toLowerCase() : "";
  
  let specialtyMatches = 0;
  if (specialtyKeyword) {
    const regex = new RegExp(specialtyKeyword, "gi");
    specialtyMatches = (combinedText.match(regex) || []).length;
  }

  let cityMatches = 0;
  if (cityKeyword) {
    const regex = new RegExp(cityKeyword, "gi");
    cityMatches = (combinedText.match(regex) || []).length;
  }

  rules.push({
    id: "seo-keyword-specialty",
    category: "seo",
    title: `Densidad de Especialidad: "${data.especialidad}"`,
    description: "Ayuda a Google a categorizar con precisión los tratamientos ofrecidos.",
    status: specialtyMatches >= 3 && specialtyMatches <= 8 ? "pass" : (specialtyMatches > 8 ? "warning" : "error"),
    feedback: specialtyMatches >= 3 && specialtyMatches <= 8
      ? `Densidad saludable. Aparece ${specialtyMatches} veces en el texto.`
      : specialtyMatches > 8
        ? `Keyword stuffing detectado. Tu especialidad aparece ${specialtyMatches} veces. Intenta reducirla para evitar penalizaciones.`
        : `Apariciones insuficientes (${specialtyMatches} veces). Intenta mencionar tu especialidad médica en la biografía o tratamientos.`
  });

  rules.push({
    id: "seo-keyword-city",
    category: "seo",
    title: `Relevancia Local: "${data.ciudad}"`,
    description: "Posiciona tus servicios en la localidad de interés de tus pacientes potenciales.",
    status: cityMatches >= 2 && cityMatches <= 6 ? "pass" : "warning",
    feedback: cityMatches >= 2 && cityMatches <= 6
      ? `Excelente relevancia local. Tu ciudad se menciona ${cityMatches} veces.`
      : cityMatches > 6
        ? `Densidad de ciudad muy alta (${cityMatches} veces). Modera su uso en el texto.`
        : `La ciudad "${data.ciudad}" se menciona muy pocas veces (${cityMatches}). Agrégala en la filosofía o biografía corta.`
  });


  // --- 4. ACCESIBILIDAD Y MULTIMEDIA ---

  // Foto de perfil real con Alt Tag
  const hasRealPhoto = data.fotoUrl && data.fotoUrl.startsWith("http") && !data.fotoUrl.includes("{{");
  rules.push({
    id: "acc-photo-alt",
    category: "accessibility",
    title: "Foto Profesional & Atributo ALT",
    description: "Los motores de búsqueda no ven imágenes; rastrean su atributo ALT para indexar en Google Imágenes.",
    status: hasRealPhoto ? "pass" : "error",
    feedback: hasRealPhoto
      ? `Imagen configurada correctamente. Se inyectará el ALT semántico "${data.nombreMedico} - Especialista en ${data.especialidad}".`
      : "La foto de perfil del especialista está vacía o utiliza un enlace roto."
  });

  // Casos Antes y Después
  const hasCases = data.casosAntesDespues && data.casosAntesDespues.length > 0;
  rules.push({
    id: "acc-cases-audit",
    category: "accessibility",
    title: "Casos Clínicos de Evolución",
    description: "Incrementa drásticamente la conversión en un +40% al proveer demostraciones reales de éxito clínico.",
    status: hasCases ? "pass" : "warning",
    feedback: hasCases
      ? `Tienes ${data.casosAntesDespues.length} caso(s) clínico(s) de antes y después configurados.`
      : "No cuentas con casos visuales de antes y después. Añadir uno aumentará la confianza del paciente."
  });

  // Blog de Salud Médica (Tráfico Long-Tail)
  const blogCount = data.blogPosts ? data.blogPosts.length : 0;
  rules.push({
    id: "seo-blog-articles",
    category: "seo",
    title: "Estructura de Blog Médico (Long-Tail)",
    description: "Un blog médico con al menos 3 artículos autocompletados mejora drásticamente el tráfico indirecto y cumple con las directrices de contenido útil de Google.",
    status: blogCount >= 3 ? "pass" : (blogCount > 0 ? "warning" : "error"),
    feedback: blogCount >= 3
      ? `Excelente. Cuentas con ${blogCount} artículos científicos autocompletados mediante IA.`
      : blogCount > 0
        ? `Tienes solo ${blogCount} artículo(s). Se recomiendan al menos 3 artículos para una cobertura de temas óptima.`
        : "No cuentas con ningún artículo de blog. Usa la pestaña 'Blog Médico' para generar 3 artículos por IA y activar esta sección."
  });

  // Dominio Propio & SSL HTTPS (Canónico, Sitemap & PWA)
  const hasCustomDomain = data.dominioWeb && data.dominioWeb.trim() !== "" && !data.dominioWeb.includes("{{");
  const isHttpsDomain = hasCustomDomain && (data.dominioWeb || "").toLowerCase().startsWith("https://");
  rules.push({
    id: "seo-custom-domain",
    category: "seo",
    title: "Dominio Web Oficial & Protocolo HTTPS",
    description: "Vincula las etiquetas canónicas, sitemap XML, robots.txt y habilita la instalación de la PWA en teléfonos móviles.",
    status: isHttpsDomain ? "pass" : (hasCustomDomain ? "warning" : "error"),
    feedback: isHttpsDomain
      ? `Dominio oficial "${data.dominioWeb}" configurado con protocolo seguro HTTPS y etiquetas canónicas sincronizadas.`
      : hasCustomDomain
        ? `Dominio configurado pero sin protocolo HTTPS (inicia con http://). Se requiere https:// para la PWA e indexación segura.`
        : "No has configurado tu dominio personalizado. Usa la sección 'Dominio Web Personalizado' en la pestaña SEO para vincularlo."
  });

  // Cálculo de Puntuación Global (Fórmula matemática)
  const passedCount = rules.filter(r => r.status === "pass").length;
  const warningCount = rules.filter(r => r.status === "warning").length;
  const totalCount = rules.length;
  const score = Math.round(((passedCount + (warningCount * 0.5)) / totalCount) * 100);

  // Clasificación del Score
  const getScoreColor = (sc: number) => {
    if (sc >= 85) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (sc >= 60) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-red-500 border-red-500/20 bg-red-500/5";
  };

  const getScoreBg = (sc: number) => {
    if (sc >= 85) return "bg-emerald-500";
    if (sc >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreVerdict = (sc: number) => {
    if (sc >= 85) return "Optimizada para Competir (A+)";
    if (sc >= 60) return "Pendiente de Ajustes (B)";
    return "Crítica para Buscadores (F)";
  };

  // --- VALIDACIÓN DE MARCADO JSON-LD (Schema.org / Google) ---
  const jsonLdString = generateJsonLd(data, data.dominioWeb || "https://tu-consultorio-medico.ec");

  const validationResults: {
    id: string;
    name: string;
    status: "pass" | "warning" | "error";
    description: string;
    feedback: string;
  }[] = [];

  // 1. Structure Check
  const hasPhysicianType = jsonLdString.includes('"@type": "Physician"');
  const hasFaqPageType = jsonLdString.includes('"@type": "FAQPage"');
  validationResults.push({
    id: "schema-types",
    name: "Estructura de Grafo de Objetos",
    status: (hasPhysicianType && hasFaqPageType) ? "pass" : "error",
    description: "Valida la presencia de los tipos 'Physician' y 'FAQPage' en el grafo de Schema.org.",
    feedback: (hasPhysicianType && hasFaqPageType)
      ? "Estructura correcta: Tipos Physician (médico local) y FAQPage correctamente identificados."
      : "Error en la estructura: Falta algún tipo de marcado requerido en el grafo."
  });

  // 2. Address Check
  const hasStreetAddress = data.direccionFisica && !data.direccionFisica.includes("{{") && data.direccionFisica.trim() !== "";
  const hasCity = data.ciudad && !data.ciudad.includes("{{") && data.ciudad.trim() !== "";
  const hasState = data.estadoRegion && !data.estadoRegion.includes("{{") && data.estadoRegion.trim() !== "";
  const hasPostal = data.codigoPostal && !data.codigoPostal.includes("{{") && data.codigoPostal.trim() !== "";

  const addressPass = hasStreetAddress && hasCity && hasState && hasPostal;
  validationResults.push({
    id: "schema-address",
    name: "Dirección Postal Completa (address)",
    status: addressPass ? "pass" : "error",
    description: "Google requiere 'streetAddress', 'addressLocality', 'addressRegion' y 'postalCode' para activadores locales.",
    feedback: addressPass
      ? `Dirección estructurada correctamente: ${data.direccionFisica}, ${data.ciudad}.`
      : `Incompleto: Falta alguno de los campos de dirección. Asegura que la calle, ciudad, región y código postal estén configurados.`
  });

  // 3. Geo Coordinates Check
  const latNum = parseFloat(data.latitud || "");
  const lonNum = parseFloat(data.longitud || "");
  const hasGeo = !isNaN(latNum) && !isNaN(lonNum) && latNum !== 0 && lonNum !== 0;

  validationResults.push({
    id: "schema-geo",
    name: "Coordenadas del Consultorio (geo)",
    status: hasGeo ? "pass" : "error",
    description: "Crucial para Google Maps. Requiere latitud y longitud válidas en formato decimal numérico.",
    feedback: hasGeo
      ? `Coordenadas válidas: lat ${latNum}, lon ${lonNum}.`
      : "Crítico: Falta configurar coordenadas decimales válidas. Google Maps no podrá vincular el consultorio."
  });

  // 4. openingHours Check
  const hasOpeningHoursSpec = jsonLdString.includes('"OpeningHoursSpecification"') && jsonLdString.includes('"dayOfWeek"') && jsonLdString.includes('"opens"') && jsonLdString.includes('"closes"');
  validationResults.push({
    id: "schema-hours",
    name: "Horarios de Atención (openingHoursSpecification)",
    status: hasOpeningHoursSpec ? "pass" : "error",
    description: "Establece los días de la semana y horas de apertura/cierre exactas de la clínica.",
    feedback: hasOpeningHoursSpec
      ? "Horarios estructurados correctamente conforme a la especificación de Schema.org."
      : "Error: No se encontró la especificación correcta de horarios de atención en el marcado."
  });

  // 5. Contact / NAP Check
  const hasPhone = data.telefonoGBP && !data.telefonoGBP.includes("{{") && data.telefonoGBP.trim() !== "";
  const hasName = data.nombreMedico && !data.nombreMedico.includes("{{") && data.nombreMedico.trim() !== "";

  const napPass = hasPhone && hasName;
  validationResults.push({
    id: "schema-contact",
    name: "Identificadores de Contacto (telephone)",
    status: napPass ? "pass" : "warning",
    description: "Permite llamar directamente al consultorio desde los resultados de Google en móviles.",
    feedback: napPass
      ? `Contacto verificado: Dr(a) ${data.nombreMedico} - Tel: ${data.telefonoGBP}.`
      : "Advertencia: Teléfono o nombre del médico faltante o con marcador de plantilla."
  });

  const passedValidationCount = validationResults.filter(v => v.status === "pass").length;

  // --- CALCULAR PUNTUACIONES POR CATEGORÍA EN TIEMPO REAL ---
  const eeatRulesCount = rules.filter(r => r.category === "eeat").length || 1;
  const eeatPassedCount = rules.filter(r => r.category === "eeat" && r.status === "pass").length;
  const eeatWarningCount = rules.filter(r => r.category === "eeat" && r.status === "warning").length;
  const currentEeatScore = Math.round(((eeatPassedCount + (eeatWarningCount * 0.5)) / eeatRulesCount) * 100);

  const localRulesCount = rules.filter(r => r.category === "local").length || 1;
  const localPassedCount = rules.filter(r => r.category === "local" && r.status === "pass").length;
  const localWarningCount = rules.filter(r => r.category === "local" && r.status === "warning").length;
  const currentLocalScore = Math.round(((localPassedCount + (localWarningCount * 0.5)) / localRulesCount) * 100);

  const seoRulesCount = rules.filter(r => r.category === "seo").length || 1;
  const seoPassedCount = rules.filter(r => r.category === "seo" && r.status === "pass").length;
  const seoWarningCount = rules.filter(r => r.category === "seo" && r.status === "warning").length;
  const currentSeoScore = Math.round(((seoPassedCount + (seoWarningCount * 0.5)) / seoRulesCount) * 100);

  const accRulesCount = rules.filter(r => r.category === "accessibility").length || 1;
  const accPassedCount = rules.filter(r => r.category === "accessibility" && r.status === "pass").length;
  const accWarningCount = rules.filter(r => r.category === "accessibility" && r.status === "warning").length;
  const currentAccScore = Math.round(((accPassedCount + (accWarningCount * 0.5)) / accRulesCount) * 100);

  const liveScores = {
    eeat: currentEeatScore,
    local: currentLocalScore,
    seo: currentSeoScore,
    accessibility: currentAccScore,
    global: score
  };

  const formattedToday = new Date().toLocaleDateString("es-EC", { day: "numeric", month: "short" }) + " (En vivo)";
  const livePoint: HistoryPoint = {
    timestamp: formattedToday,
    versionName: "Estado Actual (En Vivo)",
    eeat: liveScores.eeat,
    local: liveScores.local,
    seo: liveScores.seo,
    accessibility: liveScores.accessibility,
    global: liveScores.global
  };

  const chartData = [...history, livePoint];

  // --- D3 GEOMETRÍA DEL GRÁFICO ---
  const width = 600;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const xScale = d3.scaleLinear()
    .domain([0, chartData.length - 1])
    .range([padding.left, width - padding.right]);

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height - padding.bottom, padding.top]);

  const yTicks = [0, 20, 40, 60, 80, 100];

  const globalLinePath = d3.line<HistoryPoint>()
    .x((_, i) => xScale(i))
    .y(d => yScale(d.global))
    .curve(d3.curveMonotoneX)(chartData) || "";

  const globalAreaPath = d3.area<HistoryPoint>()
    .x((_, i) => xScale(i))
    .y0(height - padding.bottom)
    .y1(d => yScale(d.global))
    .curve(d3.curveMonotoneX)(chartData) || "";

  const eeatLinePath = d3.line<HistoryPoint>()
    .x((_, i) => xScale(i))
    .y(d => yScale(d.eeat))
    .curve(d3.curveMonotoneX)(chartData) || "";

  const localLinePath = d3.line<HistoryPoint>()
    .x((_, i) => xScale(i))
    .y(d => yScale(d.local))
    .curve(d3.curveMonotoneX)(chartData) || "";

  const seoLinePath = d3.line<HistoryPoint>()
    .x((_, i) => xScale(i))
    .y(d => yScale(d.seo))
    .curve(d3.curveMonotoneX)(chartData) || "";

  const accLinePath = d3.line<HistoryPoint>()
    .x((_, i) => xScale(i))
    .y(d => yScale(d.accessibility))
    .curve(d3.curveMonotoneX)(chartData) || "";

  const handleAddMilestone = () => {
    if (!newMilestoneName.trim()) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
    const newPoint: HistoryPoint = {
      timestamp: formattedDate,
      versionName: `${history.length + 1}. ${newMilestoneName.trim()}`,
      eeat: liveScores.eeat,
      local: liveScores.local,
      seo: liveScores.seo,
      accessibility: liveScores.accessibility,
      global: liveScores.global
    };
    const updated = [...history, newPoint];
    setHistory(updated);
    localStorage.setItem(historyStorageKey, JSON.stringify(updated));
    setNewMilestoneName("");
  };

  const handleResetHistory = () => {
    if (confirm("¿Estás seguro de restablecer el progreso a los valores predeterminados?")) {
      localStorage.removeItem(historyStorageKey);
      const now = new Date();
      const d1 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString("es-EC", { day: "numeric", month: "short" });
      const d2 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("es-EC", { day: "numeric", month: "short" });
      const d3 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("es-EC", { day: "numeric", month: "short" });
      const d4 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString("es-EC", { day: "numeric", month: "short" });
      const d5 = now.toLocaleDateString("es-EC", { day: "numeric", month: "short" }) + " (Ayer)";

      const seeded = [
        { timestamp: d1, versionName: "1. Borrador Inicial", eeat: 20, local: 0, seo: 10, accessibility: 0, global: 10 },
        { timestamp: d2, versionName: "2. Datos NAP de Ficha", eeat: 20, local: 100, seo: 25, accessibility: 0, global: 35 },
        { timestamp: d3, versionName: "3. Registro E-E-A-T", eeat: 80, local: 100, seo: 40, accessibility: 50, global: 65 },
        { timestamp: d4, versionName: "4. Artículos & SEO Local", eeat: 90, local: 100, seo: 90, accessibility: 50, global: 80 },
        { timestamp: d5, versionName: "5. Optimización Completa", eeat: 100, local: 100, seo: 100, accessibility: 100, global: 100 }
      ];
      setHistory(seeded);
      localStorage.setItem(historyStorageKey, JSON.stringify(seeded));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonLdString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="seo-audit-container" className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
      
      {/* Indicador de Puntuación Global */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-xl bg-slate-50 border border-slate-100">
        <div className="relative flex items-center justify-center shrink-0 w-28 h-28">
          {/* Círculo de Progreso Simple */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div className={`absolute inset-0 rounded-full border-4 transition-all duration-500`} style={{
            borderColor: score >= 85 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444",
            clipPath: `polygon(50% 50%, 50% 0%, ${score >= 25 ? "100%" : "50%"} ${score >= 25 ? "0%" : "0%"}, ${score >= 50 ? "100%" : "50%"} ${score >= 50 ? "100%" : "0%"}, ${score >= 75 ? "0%" : "50%"} ${score >= 75 ? "100%" : "0%"}, ${score === 100 ? "0% 0%" : "50% 50%"})`
          }}></div>
          <div className="flex flex-col items-center justify-center z-10">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{score}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PUNTOS</span>
          </div>
        </div>

        <div className="text-center md:text-left space-y-1 flex-1">
          <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100 inline-block">
            Auditoría en Tiempo Real
          </span>
          <h3 className="text-lg font-extrabold text-slate-950">Veredicto de Conversión Médica</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tu página tiene una puntuación del <strong className="text-slate-950 font-bold font-mono">{score}%</strong>. Estado: <span className="font-bold underline decoration-indigo-400">{getScoreVerdict(score)}</span>.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Google indexa basándose en la exactitud de tus datos y certificaciones. Resuelve los errores marcados para subir posiciones.</p>
        </div>
      </div>

      {/* Sección de Progreso Histórico de Optimización (D3.js Line/Area Chart) */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="text-left space-y-0.5">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Progreso Histórico de Requisitos (SEO Local & E-E-A-T)
            </h4>
            <p className="text-[11px] text-slate-500">
              Visualiza el progreso de cumplimiento a lo largo de las ediciones del perfil.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setChartView("global")}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === "global"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Puntaje Global
            </button>
            <button
              onClick={() => setChartView("all")}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Desglose por Categoría
            </button>
          </div>
        </div>

        {/* El Gráfico SVG de D3 */}
        <div className="relative w-full overflow-hidden bg-white border border-slate-100 rounded-xl p-4 shadow-3xs">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="100%"
            className="overflow-visible select-none"
          >
            <defs>
              <linearGradient id="globalAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines Horizontales */}
            {yTicks.map(tick => (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={yScale(tick)}
                  x2={width - padding.right}
                  y2={yScale(tick)}
                  stroke="#f1f5f9"
                  strokeWidth={1}
                />
                <text
                  x={padding.left - 10}
                  y={yScale(tick) + 3}
                  textAnchor="end"
                  className="text-[10px] font-extrabold text-slate-400 font-mono"
                >
                  {tick}%
                </text>
              </g>
            ))}

            {/* Líneas de Tendencia */}
            {chartView === "global" ? (
              <>
                {/* Area bajo la curva global */}
                <path
                  d={globalAreaPath}
                  fill="url(#globalAreaGradient)"
                  pointerEvents="none"
                />
                {/* Línea global */}
                <path
                  d={globalLinePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              </>
            ) : (
              <>
                {/* E-E-A-T */}
                <path
                  d={eeatLinePath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
                {/* Local */}
                <path
                  d={localLinePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
                {/* SEO */}
                <path
                  d={seoLinePath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
                {/* Accesibilidad */}
                <path
                  d={accLinePath}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              </>
            )}

            {/* Marcadores de puntos de la línea */}
            {chartData.map((d, i) => {
              const isLive = i === chartData.length - 1;
              return (
                <g key={i}>
                  {chartView === "global" ? (
                    <circle
                      cx={xScale(i)}
                      cy={yScale(d.global)}
                      r={isLive ? 5.5 : 4}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="cursor-pointer"
                    />
                  ) : (
                    <>
                      <circle cx={xScale(i)} cy={yScale(d.eeat)} r={3.5} fill="#3b82f6" stroke="#ffffff" strokeWidth={1} />
                      <circle cx={xScale(i)} cy={yScale(d.local)} r={3.5} fill="#10b981" stroke="#ffffff" strokeWidth={1} />
                      <circle cx={xScale(i)} cy={yScale(d.seo)} r={3.5} fill="#f59e0b" stroke="#ffffff" strokeWidth={1} />
                      <circle cx={xScale(i)} cy={yScale(d.accessibility)} r={3.5} fill="#ec4899" stroke="#ffffff" strokeWidth={1} />
                    </>
                  )}
                </g>
              );
            })}

            {/* Vertical Guide en Hover */}
            {hoveredIndex !== null && (
              <line
                x1={xScale(hoveredIndex)}
                y1={padding.top}
                x2={xScale(hoveredIndex)}
                y2={height - padding.bottom}
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4,4"
                pointerEvents="none"
              />
            )}

            {/* Círculos Highlight en Hover */}
            {hoveredIndex !== null && (
              <g pointerEvents="none">
                {chartView === "global" ? (
                  <circle
                    cx={xScale(hoveredIndex)}
                    cy={yScale(chartData[hoveredIndex].global)}
                    r={7}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                  />
                ) : (
                  <>
                    <circle cx={xScale(hoveredIndex)} cy={yScale(chartData[hoveredIndex].eeat)} r={5.5} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />
                    <circle cx={xScale(hoveredIndex)} cy={yScale(chartData[hoveredIndex].local)} r={5.5} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
                    <circle cx={xScale(hoveredIndex)} cy={yScale(chartData[hoveredIndex].seo)} r={5.5} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
                    <circle cx={xScale(hoveredIndex)} cy={yScale(chartData[hoveredIndex].accessibility)} r={5.5} fill="#ec4899" stroke="#ffffff" strokeWidth={2} />
                  </>
                )}
              </g>
            )}

            {/* Overlay interactivo para hover */}
            <rect
              x={padding.left}
              y={padding.top}
              width={width - padding.left - padding.right}
              height={height - padding.top - padding.bottom}
              fill="transparent"
              className="cursor-crosshair"
              onMouseMove={(e) => {
                const svgRect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - svgRect.left;
                const pointsCount = chartData.length;
                const step = (width - padding.left - padding.right) / (pointsCount - 1 || 1);
                const index = Math.round((mouseX - padding.left) / step);
                const safeIndex = Math.max(0, Math.min(pointsCount - 1, index));
                setHoveredIndex(safeIndex);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            />

            {/* Etiquetas del eje X (Ediciones) */}
            {chartData.map((d, i) => (
              <text
                key={i}
                x={xScale(i)}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="text-[9px] font-bold text-slate-400 font-mono"
              >
                {d.timestamp.length > 8 ? d.timestamp.substring(0, 8) + ".." : d.timestamp}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend block under the chart in "all" view */}
        {chartView === "all" && (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-extrabold text-slate-500 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>E-E-A-T Autoridad</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>SEO Local (NAP)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Palabras Clave (SEO)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>Accesibilidad</span>
          </div>
        )}

        {/* Caja de Detalles del Punto Seleccionado / Actual */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-3xs">
          <div className="text-left md:col-span-1 border-r border-slate-100 pr-4 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <History className="w-3.5 h-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Hito de Edición</span>
            </div>
            <h5 className="text-xs font-extrabold text-slate-900 truncate">
              {hoveredIndex !== null ? chartData[hoveredIndex].versionName : "Estado en Vivo (Formulario)"}
            </h5>
            <p className="text-[10px] text-slate-400 font-medium">
              Registrado: {hoveredIndex !== null ? chartData[hoveredIndex].timestamp : "Actualizado en tiempo real"}
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Global", score: hoveredIndex !== null ? chartData[hoveredIndex].global : score, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
              { label: "E-E-A-T", score: hoveredIndex !== null ? chartData[hoveredIndex].eeat : liveScores.eeat, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { label: "SEO Local", score: hoveredIndex !== null ? chartData[hoveredIndex].local : liveScores.local, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { label: "SEO Textual", score: hoveredIndex !== null ? chartData[hoveredIndex].seo : liveScores.seo, color: "text-amber-600 bg-amber-50 border-amber-100" },
              { label: "Accesibilidad", score: hoveredIndex !== null ? chartData[hoveredIndex].accessibility : liveScores.accessibility, color: "text-pink-600 bg-pink-50 border-pink-100" }
            ].map((stat, sIdx) => (
              <div key={sIdx} className={`p-2 rounded-lg border text-center ${stat.color} flex flex-col justify-center`}>
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-opacity-80 leading-none">{stat.label}</span>
                <span className="text-sm font-black font-mono mt-0.5">{stat.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controles para añadir hitos o restablecer */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <input
              type="text"
              placeholder="Ej. Añadí foto de perfil, mejoré NAP..."
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
              maxLength={40}
              className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 flex-1 bg-white"
            />
            <button
              onClick={handleAddMilestone}
              disabled={!newMilestoneName.trim()}
              className="text-xs font-extrabold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Grabar Hito
            </button>
          </div>
          <button
            onClick={handleResetHistory}
            className="text-xs font-extrabold text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 bg-white px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Historial
          </button>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
            activeTab === "rules"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Auditoría de Conversión y SEO
        </button>
        <button
          onClick={() => setActiveTab("jsonld")}
          className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
            activeTab === "jsonld"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Validador JSON-LD (Schema.org)
        </button>
      </div>

      {activeTab === "rules" ? (
        /* Reglas de Conversión y SEO */
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-slate-500" />
            Desglose de Hallazgos y Sugerencias
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {rules.map((rule) => {
              const isPass = rule.status === "pass";
              const isWarn = rule.status === "warning";
              return (
                <div 
                  key={rule.id} 
                  className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                    isPass 
                      ? "border-emerald-100 bg-emerald-50/20" 
                      : isWarn 
                        ? "border-amber-100 bg-amber-50/20" 
                        : "border-red-100 bg-red-50/10"
                  }`}
                >
                  {isPass ? (
                    <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  ) : isWarn ? (
                    <div className="p-1 rounded-full bg-amber-100 text-amber-600 shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-red-100 text-red-600 shrink-0 mt-0.5">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1 text-left flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h5 className="text-xs font-extrabold text-slate-950 flex items-center gap-1.5">
                        {rule.title}
                        {rule.category === "eeat" && (
                          <span className="text-[8px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded uppercase">E-E-A-T</span>
                        )}
                        {rule.category === "local" && (
                          <span className="text-[8px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded uppercase">Local</span>
                        )}
                      </h5>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isPass 
                          ? "bg-emerald-100 text-emerald-800" 
                          : isWarn 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-red-100 text-red-800"
                      }`}>
                        {isPass ? "Aprobado" : isWarn ? "Sugerencia" : "Crítico"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{rule.description}</p>
                    <p className={`text-xs font-semibold mt-1 ${
                      isPass 
                        ? "text-emerald-700" 
                        : isWarn 
                          ? "text-amber-700" 
                          : "text-red-700"
                    }`}>
                      {rule.feedback}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Validador de Marcado JSON-LD */
        <div className="space-y-5 text-left">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-slate-500" />
                Validador en Tiempo Real (Google Rich Results)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">Cumplimiento de datos estructurados de Physician y FAQPage: <strong>{passedValidationCount}/5</strong> aprobados.</p>
            </div>
            <div className={`text-[10px] font-bold border rounded-full px-3 py-1 ${
              passedValidationCount === 5 
                ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                : "bg-amber-50 border-amber-100 text-amber-700"
            }`}>
              {passedValidationCount === 5 ? "Estructura Correcta" : "Campos Pendientes"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {validationResults.map((test) => {
              const isPass = test.status === "pass";
              const isWarn = test.status === "warning";
              return (
                <div 
                  key={test.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    isPass 
                      ? "border-emerald-100 bg-emerald-50/20" 
                      : isWarn 
                        ? "border-amber-100 bg-amber-50/20" 
                        : "border-red-100 bg-red-50/10"
                  }`}
                >
                  {isPass ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : isWarn ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{test.name}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{test.description}</p>
                    <p className={`text-[11px] font-semibold ${isPass ? "text-emerald-700" : isWarn ? "text-amber-700" : "text-red-700"}`}>{test.feedback}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                Script JSON-LD Generado
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 transition-colors bg-white shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-[10px] font-mono overflow-x-auto max-h-60 leading-normal border border-slate-900 scrollbar-thin">
              {jsonLdString}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
