/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Link as LinkIcon, 
  FileText, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  RotateCcw,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  Copy,
  ExternalLink,
  ClipboardList,
  Sliders,
  Terminal,
  Clock,
  DollarSign,
  Heart,
  Layers,
  Database,
  Star,
  BookOpen,
  Activity,
  CheckCircle2,
  Zap,
  FolderTree,
  FileCode,
  Tag,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageSquare,
  Edit3,
  Plus,
  Trash2,
  Globe,
  Share2
} from "lucide-react";
import { MedicalLandingData, FAQItem } from "../types";
import { 
  DEFAULT_ASSISTANT_SYSTEM_PROMPT, 
  LocalVectorNode, 
  LocalContextVector, 
  buildHierarchicalContextVector 
} from "../services/aiContextService";

export { 
  DEFAULT_ASSISTANT_SYSTEM_PROMPT, 
  buildHierarchicalContextVector 
};
export type { 
  LocalVectorNode, 
  LocalContextVector 
};

interface AiIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: MedicalLandingData;
  onApplyData: (newData: Partial<MedicalLandingData>, mergeMode: boolean) => void;
  onOpenIntakeForm?: () => void;
  onOpenFaqsTab?: () => void;
}

const SAMPLE_RAW_TEXT = `Dra. Valentina Proaño Salgado
Especialista en Dermatología Clínica y Estética
Atención en Quito, Ecuador.
Consultorio: Torre Médica Axxis, Piso 5, Consultorio 508. Av. 10 de Agosto y Mariana de Jesús.
Teléfono y WhatsApp: 098 765 4321
Email: contacto@dravproano-dermato.ec

Graduada de Medicina en la Pontificia Universidad Católica del Ecuador (PUCE) con posgrado en Dermatología en la Universidad de Buenos Aires (UBA).
Más de 11 años de experiencia clínica.
Registro MSP: 171829401-2 | SENESCYT: 1005-2015-884920

Servicios y Tiempos de Recuperación:
1. Consulta Dermatológica Integral: $50 USD | Duración: 45 min | Recuperación: Inmediata sin reposo.
2. Mapeo Digital de Lunares (Dermatoscopía): $80 USD | Duración: 60 min | Recuperación: Ambulatoria.
3. Tratamiento Láser para Cicatrices y Manchas: $120 USD por sesión | Duración: 45 min | Recuperación: 24 a 48 horas de eritema leve.
4. Extirpación de Quistes y Biopsias: Desde $180 USD | Duración: 60 min | Recuperación: 3 a 5 días con retiro de puntos.

Preguntas Frecuentes y Respuestas Clínicas:
1. ¿Cuál es el valor de la consulta médica y qué incluye?
R: La consulta dermatológica integral tiene un valor de $50 USD e incluye examen dermatoscópico detallado, diagnóstico clínico, receta médica y emisión de factura electrónica autorizada SRI.
2. ¿Aceptan seguros médicos privados o emiten factura para reembolso?
R: Sí, emitimos factura electrónica válida para reembolso con todas las aseguradoras privadas de Ecuador (Saludsa, Humana, Ecuasanitas, Confiamed, BMI, Bupa, etc.).
3. ¿Cómo prepararme para la consulta o tratamiento láser?
R: Se recomienda acudir con el rostro limpio sin maquillaje ni cremas densas y traer exámenes dermatológicos o biopsias previas si dispone de ellos.

Testimonios de Pacientes:
- María Augusta Viteri (5 estrellas): "Excelente atención de la Dra. Valentina. Me realizó tratamiento láser para manchas de acné con una recuperación rapidísima en solo 2 días."
- Ing. Carlos Mendoza (5 estrellas): "El mapeo de lunares fue sumamente exhaustivo. Muy profesional y me entregó factura para Saludsa."

Artículos del Blog Educativo:
- "Cuidados de la Piel en el Clima de Quito: Protección UV en la Sierra Ecuatoriana"
- "Tratamiento Efectivo del Acné Juvenil y Adulto: Mitos y Verdades"

Horarios y Pagos:
Lunes a Viernes: 08:30 a 18:30. Sábados: 09:00 a 13:00 previa cita.
Aceptamos efectivo, transferencias Banco Pichincha/Produbanco/DeUna y tarjetas de crédito con factura SRI.
Aseguradoras por reembolso: Saludsa, Humana, Ecuasanitas, Confiamed, BMI.`;

const SAMPLE_URLS = [
  "https://www.consultoriomedico.ec/dr-especialista-quito",
  "https://www.doctoralia.ec/valentina-proano-salgado/dermatologo/quito",
  "https://www.instagram.com/dra.valentinadermato"
];

export const AiIngestionModal: React.FC<AiIngestionModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onApplyData,
  onOpenIntakeForm,
}) => {
  const [activeTab, setActiveTab] = useState<"text" | "url" | "vector">("text");
  const [rawText, setRawText] = useState("");
  // 3 campos de URL por defecto (Sitio web, Perfil médico, Redes sociales)
  const [urlInputs, setUrlInputs] = useState<string[]>(["", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<any | null>(null);
  const [extractionSummary, setExtractionSummary] = useState<string | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  // Manejadores para la lista dinámica de URLs
  const handleUrlChange = (index: number, value: string) => {
    setUrlInputs(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleAddUrlField = () => {
    if (urlInputs.length < 5) {
      setUrlInputs(prev => [...prev, ""]);
    }
  };

  const handleRemoveUrlField = (index: number) => {
    if (urlInputs.length > 1) {
      setUrlInputs(prev => prev.filter((_, i) => i !== index));
    } else {
      setUrlInputs([""]);
    }
  };

  const handleLoadSampleUrls = () => {
    setUrlInputs([...SAMPLE_URLS]);
  };

  const validUrls = useMemo(() => {
    return urlInputs.map(u => u.trim()).filter(u => u.length > 0);
  }, [urlInputs]);

  // Calcular el Vector de Contexto Local Jerárquico en tiempo real (Fusionado con FAQs)
  const localVector = useMemo(() => {
    const targetData = extractedResult || currentData;
    return buildHierarchicalContextVector(targetData);
  }, [extractedResult, currentData]);

  if (!isOpen) return null;

  const handleProcessText = async () => {
    if (!rawText || rawText.trim().length < 10) {
      setErrorMessage("Por favor ingresa o pega texto con al menos 10 caracteres.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Conectando con Gemini 3.7 Flash...");

    try {
      setLoadingStep("Extrayendo jerárquicamente servicios, FAQs, precios, recuperación y testimonios...");
      const res = await fetch("/api/ai/parse-raw-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: rawText.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "No se pudo estructurar el texto con IA.");
      }

      setExtractedResult(json.data);
      setExtractionSummary(json.summary || "Estructura de la landing page, servicios, FAQs y datos extraídos con éxito.");
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar el texto.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleScanUrl = async () => {
    if (validUrls.length === 0) {
      setErrorMessage("Por favor escribe o pega al menos una URL válida (sitio web, Doctoralia o red social).");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep(`Rastreando y descargando contenido de ${validUrls.length} página(s) o perfil(es)...`);

    try {
      setLoadingStep(`Consolidando información de ${validUrls.length} fuentes web (servicios, FAQs, redes, precios)...`);
      const res = await fetch("/api/ai/scan-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          urls: validUrls,
          url: validUrls[0] // Compatibilidad
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "No se pudo extraer la información de los enlaces.");
      }

      setExtractedResult(json.data);
      setExtractionSummary(json.summary || `Se escanearon y unificaron ${validUrls.length} fuentes web con éxito.`);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al escanear las URLs. Puedes copiar y pegar el texto directamente.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleApply = () => {
    if (!extractedResult) return;
    onApplyData(extractedResult, mergeMode);
    onClose();
  };

  const handleReset = () => {
    setExtractedResult(null);
    setExtractionSummary(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* ENCABEZADO PRINCIPAL */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              Ingesta Inteligente con IA
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Organizador de Landing Page & Vector Local</span>
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Extrae, estructura y organiza automáticamente toda la información médica, servicios, tiempos de recuperación, testimonios y preguntas frecuentes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto max-h-[72vh]">
          
          {/* RESULTADO EXTRAÍDO Y CONFIRMACIÓN */}
          {extractedResult ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-extrabold text-emerald-950 flex items-center justify-between">
                    <span>¡Estructura Jerárquica, Servicios & FAQs Creados con Éxito!</span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-mono px-2 py-0.5 rounded-full font-bold">
                      {localVector.metadata.totalNodos} Nodos ({localVector.metadata.totalFaqs} FAQs)
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {extractionSummary}
                  </p>
                </div>
              </div>

              {/* INSPECTOR VISUAL DEL VECTOR DE CONTEXTO LOCAL */}
              <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">
                      Vector de Contexto Local & Estructura de Datos
                    </h5>
                  </div>
                  <span className="text-[10px] text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-800 font-mono">
                    ID: {localVector.id}
                  </span>
                </div>

                {/* TARJETAS RESUMEN DE LOS NIVELES JERÁRQUICOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* FUENTE PRIMARIA: FAQS */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/40 space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-300 uppercase flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        0. Preguntas Frecuentes & Respuestas Clínicas
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {localVector.metadata.totalFaqs} FAQs Verificadas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Preguntas frecuentes y respuestas orientativas sincronizadas directamente con el FormPanel.
                    </p>
                  </div>

                  {/* NIVEL 1: SERVICIOS & RECUPERACIÓN */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-indigo-300 uppercase flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                        1. Servicios & Recuperación
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        {localVector.jerarquia.serviciosProcedimientos.length} ítems
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      Precios, duración, tiempos de reposo postoperatorio e indicaciones pre/post-tratamiento.
                    </p>
                  </div>

                  {/* NIVEL 2: TESTIMONIOS & PRUEBA SOCIAL */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-amber-300 uppercase flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        2. Testimonios & Reseñas
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {localVector.jerarquia.testimoniosResenas.length} reseñas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      Calificaciones de pacientes, experiencias reales y resultados reportados.
                    </p>
                  </div>

                  {/* NIVEL 3: BLOG & EDUCACIÓN */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-300 uppercase flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        3. Blog & Educación
                      </span>
                      <span className="text-[10px] font-mono font-bold text-blue-400">
                        {localVector.jerarquia.articulosEducativosBlog.length} artículos
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      Artículos médicos informativos, prevención y guías educativas locales.
                    </p>
                  </div>

                  {/* NIVEL 4: CASOS CLÍNICOS & GARANTÍAS */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-purple-300 uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        4. Casos & Políticas
                      </span>
                      <span className="text-[10px] font-mono font-bold text-purple-400">
                        SRI + Reembolso
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      Aseguradoras, facturación electrónica y seguimiento clínico.
                    </p>
                  </div>
                </div>

                {/* DESPLEGABLE DE MUESTREO DE FAQS Y PROCEDIMIENTOS */}
                {localVector.jerarquia.preguntasFrecuentesFaqs.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Preguntas Frecuentes Indexadas:
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {localVector.jerarquia.preguntasFrecuentesFaqs.map((f, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-950 text-[11px] border border-slate-800 space-y-0.5">
                          <span className="font-bold text-emerald-200 block truncate">P: {f.pregunta}</span>
                          <span className="text-slate-300 line-clamp-1 text-[10px]">R: {f.respuesta}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* OPCIONES DE APLICACIÓN Y MODO FUSIÓN */}
              <div className="p-3.5 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={mergeMode}
                    onChange={(e) => setMergeMode(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>Modo Fusión (Conservar datos actuales de la landing que no estén en el texto extraído)</span>
                </label>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Escanear o ingresar otro texto
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4" />
                  Aplicar Todo a la Landing Page
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO DE INGESTA */
            <div className="space-y-4">

              {/* BANNER A FORMULARIO DE INTAKE DE CLIENTE */}
              {onOpenIntakeForm && (
                <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                    <span className="text-emerald-950 font-bold truncate">
                      ¿Aún no tienes la información de tu médico? Abre el Formulario de Preguntas Clínicas.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenIntakeForm();
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1 hover:scale-102"
                  >
                    <span>Ver Formulario Médico</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              
              {/* SELECTOR DE PESTAÑAS (TEXTO vs URL vs VECTOR) */}
              <div className="flex p-1 bg-slate-100 rounded-2xl gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => { setActiveTab("text"); setErrorMessage(null); }}
                  className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "text"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>1. Pegar Texto</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("url"); setErrorMessage(null); }}
                  className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "url"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>2. Escanear Web</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("vector"); setErrorMessage(null); }}
                  className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "vector"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                      : "text-slate-700 hover:text-amber-700 hover:bg-slate-200/60"
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>3. Vector IA</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-slate-900 text-amber-300 rounded font-mono font-bold">
                    {localVector.metadata.totalNodos}
                  </span>
                </button>
              </div>

              {/* MENSAJE DE ERROR SI OCURRIÓ */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="block font-bold">Aviso:</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* PESTAÑA 1: TEXTO LIBRE */}
              {activeTab === "text" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="raw-text-input" className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Pega aquí información clínica, FAQs, folletos o notas
                    </label>
                    <button
                      type="button"
                      onClick={() => setRawText(SAMPLE_RAW_TEXT)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Cargar texto con FAQs de prueba
                    </button>
                  </div>

                  <textarea
                    id="raw-text-input"
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Ejemplo:
Dra. Ana López, Ginecóloga en Guayaquil. Atiende en Torre Médica Kennedy.
Procedimientos: Ecografía 4D ($60 USD, 30 min), Colposcopía ($90 USD, 45 min, reposo 24h).
Preguntas Frecuentes:
¿Cuánto cuesta la consulta? R: $50 USD con factura SRI y receta médica.
¿Qué seguros aceptan? R: Emitimos factura para reembolso con Saludsa, Humana, Ecuasanitas...
Horarios: Lunes a Viernes 09:00 a 18:00."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono leading-relaxed bg-slate-50/50"
                  />

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Caracteres: {rawText.length}</span>
                    {rawText.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setRawText("")}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Limpiar campo
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || rawText.trim().length < 10}
                    onClick={handleProcessText}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || "Extrayendo información con Gemini..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Extraer Estructura, FAQs & Crear Vector Local</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* PESTAÑA 2: ESCANEAR MÚLTIPLES ENLACES (SITIO WEB, DOCTORALIA, REDES SOCIALES) */}
              {activeTab === "url" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                        Enlaces Web, Perfiles Médicos y Redes Sociales
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ingresa 2 o 3 enlaces distintos para extraer toda la información clínica de varias fuentes.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {validUrls.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {validUrls.length} {validUrls.length === 1 ? "enlace listo" : "enlaces listos"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleLoadSampleUrls}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer bg-indigo-50/60 hover:bg-indigo-100/60 px-2.5 py-1 rounded-lg border border-indigo-200/60 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Cargar 3 URLs de ejemplo
                      </button>
                    </div>
                  </div>

                  {/* LISTA DE ENLACES DINÁMICOS */}
                  <div className="space-y-3">
                    {urlInputs.map((val, idx) => {
                      let fieldTitle = "";
                      let placeholder = "";
                      let IconComponent = Globe;
                      let badgeColor = "bg-blue-50 text-blue-700 border-blue-200";

                      if (idx === 0) {
                        fieldTitle = "1. Sitio Web Oficial o Consultorio Actual";
                        placeholder = "https://www.consultoriomedico.ec/dr-especialista-quito";
                        IconComponent = Globe;
                        badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                      } else if (idx === 1) {
                        fieldTitle = "2. Perfil Médico (Doctoralia / TopDoctors / Directorio)";
                        placeholder = "https://www.doctoralia.ec/dra-valentina-proano/dermatologo/quito";
                        IconComponent = Stethoscope;
                        badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      } else if (idx === 2) {
                        fieldTitle = "3. Red Social o Perfil (Instagram, Facebook, LinkedIn, TikTok)";
                        placeholder = "https://www.instagram.com/dra.valentinadermato";
                        IconComponent = Share2;
                        badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
                      } else {
                        fieldTitle = `${idx + 1}. Enlace Web o Red Social Adicional`;
                        placeholder = "https://...";
                        IconComponent = LinkIcon;
                        badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                      }

                      return (
                        <div key={idx} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5 transition-all hover:border-indigo-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${badgeColor}`}>
                                {idx + 1}
                              </span>
                              <span>{fieldTitle}</span>
                            </span>

                            {urlInputs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveUrlField(idx)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Eliminar este enlace"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="relative">
                            <input
                              type="url"
                              value={val}
                              onChange={(e) => handleUrlChange(idx, e.target.value)}
                              placeholder={placeholder}
                              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-800"
                            />
                            <IconComponent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            {val.trim().length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleUrlChange(idx, "")}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100"
                                title="Limpiar campo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTÓN PARA AGREGAR MÁS ENLACES */}
                  {urlInputs.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddUrlField}
                      className="w-full py-2 px-3 border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Agregar otro enlace URL (hasta 5 fuentes simultáneas)</span>
                    </button>
                  )}

                  {/* CAJA INFORMATIVA */}
                  <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-50/90 rounded-2xl border border-indigo-100 text-[11px] text-indigo-950 leading-relaxed space-y-1.5 shadow-xs">
                    <p className="font-extrabold flex items-center gap-1.5 text-indigo-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Extracción Inteligente Multi-Fuente:
                    </p>
                    <p className="text-indigo-900/90">
                      Rastrearemos en paralelo los sitios web, directorios y perfiles proporcionados, extrayendo y consolidando automáticamente:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5 text-[10px] text-indigo-800 font-medium">
                      <span className="flex items-center gap-1">✓ Servicios, precios y duración</span>
                      <span className="flex items-center gap-1">✓ Redes sociales y contacto</span>
                      <span className="flex items-center gap-1">✓ Preguntas frecuentes (FAQs)</span>
                      <span className="flex items-center gap-1">✓ Reseñas y testimonios</span>
                    </div>
                  </div>

                  {/* BOTÓN PRINCIPAL DE ESCANEO */}
                  <button
                    type="button"
                    disabled={isLoading || validUrls.length === 0}
                    onClick={handleScanUrl}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || "Escaneando enlaces..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>
                          {validUrls.length > 1 
                            ? `Escanear ${validUrls.length} Enlaces & Consolidar Landing Page`
                            : "Escanear Enlace & Construir Vector Local"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* PESTAÑA 3: INSPECTOR DEL VECTOR DE CONTEXTO LOCAL */}
              {activeTab === "vector" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-amber-400" />
                        <div>
                          <h4 className="font-extrabold text-sm text-white">Inspector de Vector de Contexto Local</h4>
                          <p className="text-[11px] text-slate-400">
                            Estructura de nodos contextuales generados dinámicamente para la landing page.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowJsonRaw(!showJsonRaw)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-[10px] font-bold font-mono border border-slate-700 cursor-pointer"
                      >
                        {showJsonRaw ? "Ver Resumen" : "Ver JSON Raw"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs pt-1">
                      <div className="p-2 rounded-xl bg-slate-950 border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-400 block uppercase font-bold">FAQs</span>
                        <strong className="text-emerald-300 text-sm font-extrabold">{localVector.metadata.totalFaqs}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Servicios</span>
                        <strong className="text-emerald-400 text-sm font-extrabold">{localVector.jerarquia.serviciosProcedimientos.length}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Testimonios</span>
                        <strong className="text-amber-400 text-sm font-extrabold">{localVector.jerarquia.testimoniosResenas.length}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Blog</span>
                        <strong className="text-blue-400 text-sm font-extrabold">{localVector.jerarquia.articulosEducativosBlog.length}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Nodos</span>
                        <strong className="text-purple-400 text-sm font-extrabold">{localVector.nodosVectorialesIndexados.length}</strong>
                      </div>
                    </div>
                  </div>

                  {showJsonRaw ? (
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 max-h-72 overflow-y-auto">
                      <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(localVector, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      <span className="text-xs font-extrabold text-slate-700 uppercase block">
                        Muestreo de Nodos Vectoriales Indexados:
                      </span>
                      {localVector.nodosVectorialesIndexados.map((node, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">{node.tituloKey}</span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                              node.categoria === "faq" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}>
                              {node.categoria}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium line-clamp-1">{node.snippet}</p>
                          <div className="flex flex-wrap gap-1 text-[9px] text-slate-400 pt-0.5">
                            {node.tokensContexto.map((tok, ti) => (
                              <span key={ti} className="px-1.5 py-0.2 bg-white rounded border border-slate-200">
                                #{tok}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Motor de Ingesta Inteligente Activo • Gemini 3.7 Flash & Vector Local</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

