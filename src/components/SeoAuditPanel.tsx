/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  Terminal
} from "lucide-react";
import { generateJsonLd } from "../utils/generators";

interface SeoAuditPanelProps {
  data: MedicalLandingData;
}

interface AuditRule {
  id: string;
  category: "seo" | "eeat" | "local" | "accessibility";
  title: string;
  description: string;
  status: "pass" | "warning" | "error";
  feedback: string;
}

export default function SeoAuditPanel({ data }: SeoAuditPanelProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "jsonld">("rules");
  const [copied, setCopied] = useState(false);
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
  const jsonLdString = generateJsonLd(data, "https://consulta-medica.example.com");

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

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
            activeTab === "rules"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Auditoría de Conversión y SEO
        </button>
        <button
          onClick={() => setActiveTab("jsonld")}
          className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
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
