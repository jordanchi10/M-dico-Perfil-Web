/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  Building,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  HelpCircle,
  Share2,
  Copy,
  ExternalLink
} from "lucide-react";
import { MedicalLandingData } from "../types";

interface AiIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: MedicalLandingData;
  onApplyData: (newData: Partial<MedicalLandingData>, mergeMode: boolean) => void;
}

const SAMPLE_RAW_TEXT = `Dra. Valentina Proaño Salgado
Especialista en Dermatología Clínica y Estética
Atención en Quito, Ecuador.
Consultorio: Torre Médica Axxis, Piso 5, Consultorio 508. Av. 10 de Agosto y Mariana de Jesús.
Teléfono y WhatsApp: 098 765 4321
Email: contacto@dravproano-dermato.ec
Instagram: @dra.valentina.dermatologa
Facebook: Dra. Valentina Proano Dermatologia Quito

Graduada de Medicina en la Pontificia Universidad Católica del Ecuador (PUCE) con posgrado en Dermatología en la Universidad de Buenos Aires (UBA).
Más de 11 años de experiencia clínica.
Registro MSP: 171829401-2 | SENESCYT: 1005-2015-884920

Servicios que realizo:
1. Consulta Dermatológica Integral: Diagnóstico de acné, rosácea, dermatitis, psoriasis y lunares sospechosos.
2. Mapeo Digital de Lunares (Dermatoscopía): Detección temprana y prevención de melanoma y cáncer de piel.
3. Tratamiento Láser para Cicatrices y Manchas: Tecnología de vanguardia para rejuvenecimiento y marcas de acné.
4. Procedimientos Menores: Extirpación de quistes, biopsias cutáneas y cauterización de verrugas.

Hospitales y Afiliaciones:
- Hospital Metropolitano de Quito
- Hospital de los Valles
- Sociedad Ecuatoriana de Dermatología (SED)
- Colegio de Médicos de Pichincha

Aseguradoras privadas por reembolso:
Saludsa, Humana, Ecuasanitas, Confiamed, BMI, Seguros Equinoccial.
Horarios de atención:
Lunes a Viernes: 08:30 a 18:30. Sábados: 09:00 a 13:00 previa cita.
Aceptamos efectivo, transferencias Banco Pichincha / Produbanco / DeUna y tarjetas de crédito con factura electrónica SRI.`;

const SAMPLE_URL = "https://www.doctoralia.com.ec/especialistas/pediatria/quito";

export const AiIngestionModal: React.FC<AiIngestionModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onApplyData,
}) => {
  const [activeTab, setActiveTab] = useState<"text" | "url">("text");
  const [rawText, setRawText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<any | null>(null);
  const [extractionSummary, setExtractionSummary] = useState<string | null>(null);
  const [mergeMode, setMergeMode] = useState(false);

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
      setLoadingStep("Analizando texto libre y deduciendo entidades médicas...");
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
      setExtractionSummary(json.summary || "Información extraída y organizada exitosamente.");
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar el texto.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleScanUrl = async () => {
    if (!urlInput || !urlInput.trim()) {
      setErrorMessage("Por favor escribe o pega una URL válida.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Rastreando y descargando contenido de la página web...");

    try {
      setLoadingStep("Extrayendo metadatos, JSON-LD y texto de la página...");
      const res = await fetch("/api/ai/scan-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "No se pudo extraer la información del enlace.");
      }

      setExtractedResult(json.data);
      setExtractionSummary(json.summary || "Página web escaneada y datos organizados con éxito.");
    } catch (err: any) {
      setErrorMessage(err.message || "Error al escanear la URL. Prueba copiando y pegando el texto directamente.");
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
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* ENCABEZADO */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/30 border border-blue-400/40 text-blue-100 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              Asistente de Ingesta Inteligente con IA
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Organizador Automático de Datos Médicos
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Pega información desorganizada (notas, CV, folletos) o ingresa un enlace web para que Gemini organice automáticamente todos los campos del panel.
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
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
          
          {/* SI YA HAY RESULTADO EXTRAÍDO: MOSTRAR VISTA PREVIA Y CONFIRMACIÓN */}
          {extractedResult ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-extrabold text-emerald-950">
                    ¡Información extraída y estructurada con éxito!
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {extractionSummary}
                  </p>
                </div>
              </div>

              {/* RESUMEN DE CAMPOS CLAVE ENCONTRADOS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
                  <span>Resumen de datos listos para transferir</span>
                  <span className="text-[11px] font-extrabold text-blue-600">Contexto Ecuador 🇪🇨</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <Stethoscope className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Médico & Especialidad</span>
                      <strong className="text-slate-900 text-sm block font-extrabold">{extractedResult.nombreMedico || "No especificado"}</strong>
                      <span className="text-blue-700 font-medium">{extractedResult.especialidad}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Ubicación y Ciudad</span>
                      <strong className="text-slate-900 block font-bold">{extractedResult.ciudad}, {extractedResult.estadoRegion}</strong>
                      <span className="text-slate-500 text-[11px] line-clamp-1">{extractedResult.direccionFisica}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Contacto Directo</span>
                      <span className="text-slate-900 font-bold block">{extractedResult.telefonoGBP || "Teléfono extraído"}</span>
                      <span className="text-emerald-600 text-[11px] font-medium block">
                        {extractedResult.whatsappUrl ? "WhatsApp verificado" : "Sin WhatsApp"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Avales y Registro</span>
                      <span className="text-slate-900 font-bold block line-clamp-1">{extractedResult.cedulaProfesional || "MSP / SENESCYT"}</span>
                      <span className="text-purple-700 text-[11px] font-medium block">
                        {extractedResult.anosExperiencia ? `${extractedResult.anosExperiencia} años de experiencia` : "Experiencia clínica"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PILLS DE ELEMENTOS SECUNDARIOS */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  {extractedResult.servicios && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                      ✓ {extractedResult.servicios.length} Servicios estructurados
                    </span>
                  )}
                  {extractedResult.faqs && (
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                      ✓ {extractedResult.faqs.length} FAQs generadas
                    </span>
                  )}
                  {extractedResult.aseguradoras && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      ✓ {extractedResult.aseguradoras.length} Aseguradoras asignadas
                    </span>
                  )}
                  {extractedResult.hospitalesdondeOpera && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-[11px]">
                      ✓ {extractedResult.hospitalesdondeOpera.length} Hospitales vinculados
                    </span>
                  )}
                  {extractedResult.horarios && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">
                      ✓ Horarios de consulta configurados
                    </span>
                  )}
                </div>
              </div>

              {/* OPCIONES DE APLICACIÓN */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={mergeMode}
                    onChange={(e) => setMergeMode(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Modo Fusión (Conservar datos actuales si no están presentes en el texto)</span>
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
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4" />
                  Aplicar Todo al Generador de Landing Page
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO DE INGESTA */
            <div className="space-y-4">
              
              {/* SELECTOR DE PESTAÑAS (TEXTO vs URL) */}
              <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab("text"); setErrorMessage(null); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "text"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>1. Pegar Información sin Organizar</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("url"); setErrorMessage(null); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "url"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>2. Escanear Enlace Web del Médico</span>
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
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Pega aquí cualquier información sobre el médico o clínica
                    </label>
                    <button
                      type="button"
                      onClick={() => setRawText(SAMPLE_RAW_TEXT)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Cargar texto de prueba
                    </button>
                  </div>

                  <textarea
                    id="raw-text-input"
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Ejemplo:
Dra. Ana López, Ginecóloga en Guayaquil. Atiende en Torre Médica Kennedy.
Teléfono 0991234567. 15 años de experiencia.
Tratamientos: Control prenatal, ecografía 4D, colposcopía.
Seguros: Saludsa y Humana. Horarios de 9am a 6pm..."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono leading-relaxed bg-slate-50/50"
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
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || "Organizando datos con Gemini..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Organizar y Estructurar con IA</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* PESTAÑA 2: ESCANEAR ENLACE */}
              {activeTab === "url" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="url-input" className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                      Enlace o URL del Médico (Doctoralia, Clínica, Sitio Web)
                    </label>
                    <button
                      type="button"
                      onClick={() => setUrlInput(SAMPLE_URL)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Cargar URL de ejemplo
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="url-input"
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://www.doctoralia.com.ec/..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                    />
                    <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>

                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      💡 ¿Cómo funciona el escaneo de enlace?
                    </p>
                    <p className="text-blue-800/90">
                      El servidor rastreará la página web, extraerá los textos clínicos, metadatos y esquemas JSON-LD, y Gemini 3.7 Flash los organizará en los campos correspondientes de la plantilla.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || !urlInput.trim()}
                    onClick={handleScanUrl}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || "Escaneando enlace..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Escanear y Extraer Datos con IA</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Potenciado por Google Gemini 3.7 Flash & E-E-A-T Engine</span>
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
