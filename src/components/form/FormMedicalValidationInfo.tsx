/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  MedicalLandingData,
  ECUADOR_ASOCIACIONES
} from "../../types";
import { 
  Award, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Search, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Building2, 
  FileCode2, 
  TrendingUp, 
  Zap, 
  BrainCircuit, 
  Globe2, 
  HeartHandshake, 
  Layers, 
  ArrowRight,
  MessageSquare,
  Stethoscope,
  HelpCircle,
  Cpu,
  Plus,
  Trash2,
  GraduationCap,
  Medal,
  BookOpen,
  FileCheck,
  CheckCheck
} from "lucide-react";

interface FormMedicalValidationInfoProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData | ((prev: MedicalLandingData) => MedicalLandingData)) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
  updateFields?: (fields: Partial<MedicalLandingData>) => void;
}

const PRESET_CERTIFICADOS = [
  "Certificación Internacional en Procedimientos Quirúrgicos y Clínicos Avanzados",
  "Soporte Vital Cardiovascular Avanzado (ACLS / BLS) - Certificación Oficial",
  "Diplomado en Actualización Continua y Seguridad del Paciente",
  "Certificación en Diagnóstico por Imagen y Ultrasonografía Aplicada",
  "Acreditación Internacional en Buenas Prácticas Clínicas (GCP)",
  "Certificado de Especialización en Manejo de Urgencias y Cuidados Críticos"
];

const PRESET_RECONOCIMIENTOS = [
  "Reconocimiento al Mérito Profesional en Salud y Atención Médica de Excelencia",
  "Miembro de Honor por Aportes a la Investigación y Docencia Médica",
  "Distinción a la Excelencia Clínica Quirúrgica y Práctica Ética",
  "Premio Anual a la Trayectoria y Compromiso con la Comunidad Sanitaria",
  "Reconocimiento Institucional al Liderazgo en Innovación Médica"
];

export function FormMedicalValidationInfo({
  data,
  onChange,
  updateField,
  updateFields
}: FormMedicalValidationInfoProps) {
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState<string | null>(null);

  const isClinica = data.tipoEnfoqueLanding === "clinica";
  const doctorName = data.nombreMedico?.trim() || "Dr(a). Especialista";
  const especialidad = data.especialidad?.trim() || "Especialidad Médica";
  const ciudad = data.ciudad?.trim() || "Ciudad, Ecuador";
  const senescyt = data.registroSenescyt?.trim() || "Registro Oficial";
  const acess = data.codigoAcessMsp?.trim() || "Código MSP/ACESS";
  const universidad = data.universidad?.trim() || "Universidad Acreditada";
  const aseguradoras = data.aseguradoras && data.aseguradoras.length > 0 
    ? data.aseguradoras.join(", ") 
    : "Saludsa, Humana, BMI, Bupa, Ecuasanitas, Confiamed";

  const certificados = Array.isArray(data.certificados) ? data.certificados : [];
  const asociaciones = Array.isArray(data.asociaciones) ? data.asociaciones : [];
  const reconocimientos = Array.isArray(data.reconocimientos) ? data.reconocimientos : [];

  // Handlers para modificar arreglos de credenciales
  const handleArrayChange = (field: "certificados" | "asociaciones" | "reconocimientos", index: number, value: string) => {
    const arr = [...(data[field] || [])];
    arr[index] = value;
    onChange((prev) => ({
      ...prev,
      [field]: arr
    }));
  };

  const addArrayItem = (field: "certificados" | "asociaciones" | "reconocimientos", defaultValue = "") => {
    onChange((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultValue]
    }));
  };

  const removeArrayItem = (field: "certificados" | "asociaciones" | "reconocimientos", index: number) => {
    onChange((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  // Argumentario maestro para copiar
  const fullPitchText = `💡 ¿Por qué una Landing Page Médica con Validación E-E-A-T e IA es superior a una página web tradicional?

1. Cumplimiento Estricto de Google YMYL & E-E-A-T (Salud y Vida):
Google no posiciona páginas médicas genéricas sin respaldo. Nuestra landing inyecta microdatos Schema.org de grado médico vinculados a tu registro SENESCYT (${senescyt}), código MSP/ACESS (${acess}), formación en ${universidad} y tus certificaciones oficiales, garantizando máxima credibilidad y blindaje ante penalizaciones algorítmicas.

2. Optimización para Motores de Búsqueda de Inteligencia Artificial (GEO):
Cuando un paciente le pregunta a Google Gemini, ChatGPT o Perplexity "¿Cuál es el mejor ${especialidad} en ${ciudad} que atienda con mi seguro?", los modelos de IA consultan datos estructurados en código limpio. Nuestra arquitectura entrega respuestas semánticas directas para que la IA recomiende tu consulta como primera opción con enlace a tu WhatsApp.

3. Triangulación de Seguros Médicos y Reembolso SRI:
Posicionamiento semántico para pacientes con aseguradoras privadas (${aseguradoras}). Cada procedimiento se indexa indicando disponibilidad de Factura Electrónica SRI y Formulario de Reclamo Médico firmado (CIE-10).

4. SEO Local Hipersegmentado y Google Maps:
Sincronización NAP (Nombre, Dirección, Teléfono), geoetiquetado exacto (GPS) y microformatos de clínica/consultorio para dominar las búsquedas locales en ${ciudad}.

5. Código Puro de Alto Rendimiento (HTML5/Vanilla JS):
Velocidad de carga de 95-100 en Google PageSpeed, cero mantenimiento, cero caídas por plugins de WordPress y conversión directa e inmediata a tu WhatsApp de agendamiento.`;

  const copyToClipboard = (text: string, type: "pitch" | "objection", objectionKey?: string) => {
    navigator.clipboard.writeText(text);
    if (type === "pitch") {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2200);
    } else if (objectionKey) {
      setCopiedResponse(objectionKey);
      setTimeout(() => setCopiedResponse(null), 2200);
    }
  };

  return (
    <div className="space-y-6" id="form-medical-validation-info-section">
      {/* CABECERA PRINCIPAL HERO CON ENFOQUE COMERCIAL Y TÉCNICO */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-900/60 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border border-cyan-300/30">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                  Validación Web & IA Médica
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Google YMYL & E-E-A-T Ready
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Validación de Credenciales Médicas, SEO Local & Motores de IA
              </h2>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl relative z-10">
          En el sector de la salud, <strong>Google y los motores de Inteligencia Artificial (Gemini, ChatGPT, Perplexity, Claude y Apple Intelligence)</strong> no posicionan ni recomiendan sitios web comunes. Exigen validación estricta de credenciales, esquemas médicos estandarizados y geoetiquetado verificado. Esta landing page implementa una arquitectura especializada para posicionar al especialista como la máxima autoridad de su ciudad.
        </p>

        {/* ACCIÓN PRINCIPAL DE VENTA: COPIAR PITCH COMERCIAL */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => copyToClipboard(fullPitchText, "pitch")}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-[0.98] cursor-pointer"
          >
            {copiedPitch ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>¡Argumentario Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>Copiar Argumentario Comercial (Pitch para el Médico)</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-300 font-medium">
            💡 Úsalo para explicarle al doctor o clínica por qué esta landing médica es indispensable frente a un sitio web ordinario.
          </span>
        </div>
      </div>

      {/* SECCIÓN 1: INGRESO DE DATOS - CERTIFICADOS, ASOCIACIONES Y RECONOCIMIENTOS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-start justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Gestión de Certificados, Asociaciones & Reconocimientos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estos datos se integran automáticamente en el código Schema.org JSON-LD (<code className="font-mono text-blue-700 bg-blue-50 px-1 rounded">hasCredential</code>, <code className="font-mono text-blue-700 bg-blue-50 px-1 rounded">memberOf</code>, <code className="font-mono text-blue-700 bg-blue-50 px-1 rounded">award</code>), en la ficha LLM y en la sección visual de trayectoria médica.
            </p>
          </div>
        </div>

        {/* 1.1 CERTIFICADOS MÉDICOS Y CURSOS DE ESPECIALIZACIÓN */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide block">
                  Certificados & Cursos de Especialización Médica
                </label>
                <span className="text-[11px] text-slate-500">
                  Diplomados, certificaciones internacionales y cursos avalados para alimentar el Schema E-E-A-T.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => addArrayItem("certificados", "")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Certificado</span>
            </button>
          </div>

          {/* Lista de certificados */}
          <div className="space-y-2">
            {certificados.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay certificados registrados. Añade uno o selecciona de las sugerencias rápidas abajo.
              </p>
            ) : (
              certificados.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleArrayChange("certificados", idx, e.target.value)}
                    placeholder="ej. Certificación Internacional en Procedimientos Quirúrgicos Avanzados"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("certificados", idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar certificado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Presets / Sugerencias de certificados */}
          <div className="pt-1">
            <span className="text-[10px] font-black uppercase text-slate-500 block mb-1.5 tracking-wider">
              💡 Sugerencias Rápidas de Certificados:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CERTIFICADOS.map((preset, pIdx) => {
                const alreadyAdded = certificados.includes(preset);
                return (
                  <button
                    key={pIdx}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addArrayItem("certificados", preset)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      alreadyAdded 
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-2xs"
                    }`}
                  >
                    {alreadyAdded ? <Check className="w-3 h-3 text-slate-400" /> : <Plus className="w-3 h-3 text-blue-600" />}
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 1.2 SOCIEDADES CIENTÍFICAS Y ASOCIACIONES MÉDICAS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide block">
                  Sociedades Científicas & Asociaciones Médicas
                </label>
                <span className="text-[11px] text-slate-500">
                  Colegios médicos provinciales, federaciones y sociedades de la especialidad.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => addArrayItem("asociaciones", "")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Asociación</span>
            </button>
          </div>

          {/* Lista de asociaciones */}
          <div className="space-y-2">
            {asociaciones.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay asociaciones registradas. Añade una o selecciona de las sugerencias rápidas abajo.
              </p>
            ) : (
              asociaciones.map((asoc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    value={asoc}
                    onChange={(e) => handleArrayChange("asociaciones", idx, e.target.value)}
                    placeholder="ej. Colegio de Médicos de Pichincha"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("asociaciones", idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar asociación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Presets / Sugerencias de asociaciones */}
          <div className="pt-1">
            <span className="text-[10px] font-black uppercase text-slate-500 block mb-1.5 tracking-wider">
              💡 Sugerencias de Asociaciones Médicas de Ecuador:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ECUADOR_ASOCIACIONES.map((preset, aIdx) => {
                const alreadyAdded = asociaciones.includes(preset);
                return (
                  <button
                    key={aIdx}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addArrayItem("asociaciones", preset)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      alreadyAdded 
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                        : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-2xs"
                    }`}
                  >
                    {alreadyAdded ? <Check className="w-3 h-3 text-slate-400" /> : <Plus className="w-3 h-3 text-purple-600" />}
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 1.3 PREMIOS, DISTINCIONES Y RECONOCIMIENTOS MÉDICOS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Medal className="w-4 h-4" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide block">
                  Premios, Distinciones & Reconocimientos
                </label>
                <span className="text-[11px] text-slate-500">
                  Premios al mérito científico, honores gremiales y reconocimientos de excelencia clínica.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => addArrayItem("reconocimientos", "")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Reconocimiento</span>
            </button>
          </div>

          {/* Lista de reconocimientos */}
          <div className="space-y-2">
            {reconocimientos.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay reconocimientos registrados. Añade uno o selecciona de las sugerencias rápidas abajo.
              </p>
            ) : (
              reconocimientos.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    value={rec}
                    onChange={(e) => handleArrayChange("reconocimientos", idx, e.target.value)}
                    placeholder="ej. Reconocimiento al Mérito Profesional en Salud"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("reconocimientos", idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar reconocimiento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Presets / Sugerencias de reconocimientos */}
          <div className="pt-1">
            <span className="text-[10px] font-black uppercase text-slate-500 block mb-1.5 tracking-wider">
              💡 Sugerencias de Distinciones Médicas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_RECONOCIMIENTOS.map((preset, rIdx) => {
                const alreadyAdded = reconocimientos.includes(preset);
                return (
                  <button
                    key={rIdx}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addArrayItem("reconocimientos", preset)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      alreadyAdded 
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                        : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50 hover:border-amber-300 shadow-2xs"
                    }`}
                  >
                    {alreadyAdded ? <Check className="w-3 h-3 text-slate-400" /> : <Plus className="w-3 h-3 text-amber-600" />}
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 1.4 ACREDITACIONES SANITARIAS OFICIALES DE ECUADOR (SENESCYT & MSP / ACESS) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wide block">
                Acreditaciones Sanitarias Oficiales (SENESCYT & MSP / ACESS Ecuador)
              </label>
              <span className="text-[11px] text-slate-600">
                Estos identificadores blindan el SEO ante el algoritmo Google YMYL y validan ante la IA que no es pseudociencia.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="val-senescyt">
                <span>Número Registro Título SENESCYT</span>
                <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">E-E-A-T</span>
              </label>
              <input
                id="val-senescyt"
                type="text"
                value={data.registroSenescyt ?? ""}
                onChange={(e) => updateField("registroSenescyt", e.target.value)}
                placeholder="ej. 1005-2012-1148292"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="val-acess">
                <span>Código Habilitación Sanitaria MSP / ACESS</span>
                <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Sanitario</span>
              </label>
              <input
                id="val-acess"
                type="text"
                value={data.codigoAcessMsp ?? ""}
                onChange={(e) => updateField("codigoAcessMsp", e.target.value)}
                placeholder="ej. 171485921-0"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800" htmlFor="val-univ">
                Universidad de Formación / Especialidad
              </label>
              <input
                id="val-univ"
                type="text"
                value={data.universidad ?? ""}
                onChange={(e) => updateField("universidad", e.target.value)}
                placeholder="ej. Universidad Central del Ecuador / Pontificia Universidad Católica"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800" htmlFor="val-cedula">
                Cédula / Identificador Profesional Global
              </label>
              <input
                id="val-cedula"
                type="text"
                value={data.cedulaProfesional ?? ""}
                onChange={(e) => updateField("cedulaProfesional", e.target.value)}
                placeholder="ej. MSP Reg. 171485921-0 / SENESCYT 1005-2012-1148292"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* COMPARATIVA DE IMPACTO: PÁGINA WEB TRADICIONAL VS NUESTRA LANDING MÉDICA INTELIGENTE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Comparativa Clave: Sitio Web Tradicional vs. Landing Médica Inteligente
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Diferencias técnicas y comerciales que definen si un paciente o una IA encuentra y confía en el médico.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* COLUMNA 1: SITIO WEB TRADICIONAL (EL ERROR COMÚN) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs">
                  ✕
                </div>
                <span className="text-sm font-black text-rose-950">Sitio Web Genérico / WordPress</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                Baja Conversión & Cero IA
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cero Estructura Médica (Schema.org):</strong> Google lo lee como texto plano sin validar si quien escribe es un médico acreditado o un impostor.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Invisible para Gemini y ChatGPT:</strong> Los modelos de IA no encuentran entidades jerárquicas; al preguntar por un especialista, la IA cita a la competencia.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Desconexión de Seguros y Reembolsos:</strong> No indexa los planes médicos (Saludsa, Humana, BMI, etc.) asociados a cada tratamiento ni el desglose SRI / CIE-10.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Lentitud y Caídas Frecuentes:</strong> Constructores pesados (Elementor, Divi) que demoran 4+ segundos en cargar en teléfonos móviles, perdiendo hasta el 60% de los clics.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Sin Geoetiquetado NAP Local:</strong> No se sincroniza con precisión satelital (coordenadas GPS) con Google Maps y búsquedas locales por geolocalización.
                </span>
              </li>
            </ul>
          </div>

          {/* COLUMNA 2: NUESTRA LANDING MÉDICA INTELIGENTE (LA SOLUCIÓN PREMIUM) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-2 border-emerald-400/90 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  ✓
                </div>
                <span className="text-sm font-black text-emerald-950">Nuestra Landing Médica Inteligente</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
                E-E-A-T + GEO IA
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Acreditación Oficial Indexable:</strong> Inyección semántica de Cédula, SENESCYT, Código MSP/ACESS y Universidad en esquemas <code className="text-emerald-800 font-bold bg-emerald-100/60 px-1 rounded font-mono">Physician</code> y <code className="text-emerald-800 font-bold bg-emerald-100/60 px-1 rounded font-mono">MedicalOrganization</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Recomendación Directa en Motores de IA:</strong> Estructura optimizada para que Gemini, ChatGPT y Perplexity citen al doctor como primera opción fidedigna.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Triangulación Semántica de Seguros:</strong> Vincula <span className="font-bold text-emerald-900">[Procedimiento] + [Aseguradora] + [{ciudad}]</span> con microdatos de cobertura y factura SRI para reembolso.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Velocidad Extrema (PageSpeed 95-100):</strong> Código puro estático (HTML5 / Vanilla JS) que carga en menos de 0.8s, maximizando la conversión inmediata a WhatsApp.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>SEO Local & Geoetiquetado NAP:</strong> Coordenadas GPS exactas (<code className="font-mono text-emerald-900 text-[11px]">geo.position</code> e <code className="font-mono text-emerald-900 text-[11px]">ICBM</code>) vinculadas a Google Maps y Google Business Profile.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* LOS 4 PILARES TÉCNICOS & DE NEGOCIO: CÓMO FUNCIONA LA VALIDACIÓN EN INTERNET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PILAR 1: GOOGLE YMYL & E-E-A-T */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            1. El Filtro Google YMYL & E-E-A-T (Salud y Vida)
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Google clasifica la medicina como categoría crítica <strong>YMYL (Your Money or Your Life)</strong>. Para aparecer en los primeros resultados de búsqueda médica, el algoritmo exige señales comprobables de <strong>Experiencia, Especialización, Autoridad y Confianza (E-E-A-T)</strong>.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">¿Qué hace nuestra landing?</span>
            <p>
              Inyecta en el código HTML metadatos oficiales del <strong>Registro SENESCYT</strong>, <strong>Código MSP/ACESS</strong>, <strong>Cédula Profesional</strong> y <strong>Hospitales donde Opera</strong>. Los rastreadores de Google validan al instante la autenticidad profesional del médico.
            </p>
          </div>
        </div>

        {/* PILAR 2: MOTORES DE BÚSQUEDA GENERATIVOS & ASISTENTES DE IA */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            2. Motores de IA Generativa (Gemini, ChatGPT, Perplexity)
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hoy más del 35% de los pacientes consultan a asistentes de IA antes de agendar una cita: <em>"¿Quién es el mejor {especialidad} en {ciudad} para tratar mi caso?"</em>.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">¿Cómo te recomienda la IA?</span>
            <p>
              Los modelos LLM (Gemini 2.5/Flash, GPT-4o, Claude 3.7) leen los microdatos Schema.org estructurados y los FAQ médicos para generar respuestas directas citando al doctor como fuente primaria recomendada y con enlace directo a su WhatsApp.
            </p>
          </div>
        </div>

        {/* PILAR 3: TRIANGULACIÓN DE SEGUROS Y REEMBOLSO EN ECUADOR */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            3. Captación de Pacientes con Seguros Privados
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Los pacientes con pólizas de medicina prepagada buscan activamente médicos que acepten su seguro o faciliten el reembolso con factura oficial.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">Beneficio directo para el consultorio:</span>
            <p>
              La landing indexa combinaciones clave como <em>"{especialidad} con Saludsa en {ciudad}"</em> o <em>"Reembolso BMI {ciudad}"</em>, especificando la entrega de <strong>Factura Electrónica SRI</strong> y <strong>Formulario de Reclamo Médico con código CIE-10</strong>.
            </p>
          </div>
        </div>

        {/* PILAR 4: SEO LOCAL, GEOETIQUETADO & MAPAS */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            4. Posicionamiento Local & Google Maps (NAP)
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            El 78% de las búsquedas médicas en celular terminan en una consulta presencial en menos de 24 horas si la ubicación es clara e inmediata.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">Geoetiquetado de precisión:</span>
            <p>
              Integra metadatos de latitud/longitud GPS, dirección normalizada, horarios de atención y enlaces directos a Google Maps y Waze para que los pacientes lleguen sin extravíos.
            </p>
          </div>
        </div>
      </div>

      {/* INSPECTOR EN VIVO: CÓMO LOS MOTORES DE IA Y GOOGLE LEEN ESTA LANDING ACTUAL */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-mono text-xs">
              &lt;/&gt;
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                Inspector Semántico en Vivo (Datos de esta Landing Page)
              </h3>
              <p className="text-[11px] text-slate-400">
                Así es como los rastreadores de Google y los modelos de IA (Gemini / ChatGPT) reconocen a este profesional:
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Entidad Médica Indexable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Card 1 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
              Entidad Profesional / Especialidad
            </span>
            <p className="font-extrabold text-white truncate text-sm">
              {doctorName}
            </p>
            <p className="text-slate-300 text-xs truncate">
              {especialidad} • {ciudad}
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Acreditación Oficial Ecuador
            </span>
            <p className="font-mono text-emerald-300 font-bold text-xs truncate">
              SENESCYT: {senescyt}
            </p>
            <p className="font-mono text-slate-300 text-xs truncate">
              MSP / ACESS: {acess}
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              Certificados & Honores
            </span>
            <p className="font-bold text-amber-200 text-xs truncate">
              {certificados.length} Certificados • {reconocimientos.length} Reconocimientos
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {asociaciones.length} Sociedades Médicas Vinculadas
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
          <div className="text-cyan-400 font-bold text-[10px] uppercase tracking-wider mb-1">
            // Fragmento JSON-LD Schema.org inyectado automáticamente en el &lt;head&gt;
          </div>
          <p className="text-blue-300">
            {`"@context": "https://schema.org", "@type": "Physician",`}
          </p>
          <p className="text-emerald-300 pl-4">
            {`"name": "${doctorName}", "medicalSpecialty": "${especialidad}", "addressLocality": "${ciudad}",`}
          </p>
          <p className="text-amber-300 pl-4">
            {`"hasCredential": [{ "name": "SENESCYT ${senescyt}" }, { "name": "MSP ACESS ${acess}" }${certificados.length > 0 ? `, { "name": "${certificados[0]}" }` : ''}],`}
          </p>
          <p className="text-purple-300 pl-4">
            {`"memberOf": [${asociaciones.slice(0, 3).map(a => `"${a}"`).join(", ")}]`}
          </p>
        </div>
      </div>

      {/* GUÍA DE VENTAS Y MANEJO DE OBJECIONES PARA EL CLIENTE MÉDICO */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Argumentario de Venta: Respuestas a Objeciones Comunes de Médicos
            </h3>
            <p className="text-xs text-slate-500">
              Copia y envía estas respuestas preparadas cuando presentes la propuesta al doctor:
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Objeción 1 */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-[10px]">1</span>
                El médico dice: "Ya tengo una página web que me hicieron en WordPress"
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(
                  `Doctor, las páginas tradicionales en WordPress están hechas para blogs o tiendas, no para salud. Google tiene un filtro especial llamado YMYL (Your Money or Your Life) y si una web médica no tiene microdatos estructurados de acreditación oficial (SENESCYT/MSP/Certificaciones), no la muestra en los primeros lugares. Además, nuestra landing está optimizada para que motores de Inteligencia Artificial como ChatGPT y Google Gemini recomienden su consulta directamente, y carga en menos de 1 segundo sin riesgo de hackeos ni cobros mensuales de mantenimiento.`,
                  "objection",
                  "obj1"
                )}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-[11px] transition-all cursor-pointer"
              >
                {copiedResponse === "obj1" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedResponse === "obj1" ? "¡Copiado!" : "Copiar Respuesta"}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "Doctor, las páginas en WordPress están hechas para tiendas o blogs, no para medicina. Google aplica el filtro YMYL y exige esquemas médicos estructurados. Nuestra landing inyecta su registro SENESCYT, MSP y certificados en el código, carga en milisegundos y está preparada para que ChatGPT y Gemini lo citen como primera opción."
            </p>
          </div>

          {/* Objeción 2 */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-[10px]">2</span>
                El médico dice: "Yo solo me manejo con mi Instagram o Facebook"
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(
                  `Doctor, Instagram es excelente para entretener o educar, pero los pacientes que tienen una urgencia médica o un síntoma grave no buscan en redes sociales: buscan en Google y en asistentes de Inteligencia Artificial (Gemini / ChatGPT). Al tener su landing médica con validación de credenciales y aseguradoras, captamos a los pacientes con alta intención de consulta que están listos para agendar su cita de inmediato por WhatsApp.`,
                  "objection",
                  "obj2"
                )}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold text-[11px] transition-all cursor-pointer"
              >
                {copiedResponse === "obj2" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedResponse === "obj2" ? "¡Copiado!" : "Copiar Respuesta"}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "Doctor, las redes sociales sirven para visibilidad casual, pero el paciente que realmente necesita un especialista busca en Google y en IA cuando tiene un dolor o necesita operarse. La landing page convierte esa búsqueda de alta intención en un mensaje directo a su WhatsApp."
            </p>
          </div>

          {/* Objeción 3 */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[10px]">3</span>
                El médico dice: "¿Cómo me ayuda esto a captar pacientes con seguro médico privado?"
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(
                  `Doctor, la landing triangula cada uno de sus procedimientos médicos con las aseguradoras más importantes del Ecuador (Saludsa, Humana, BMI, Bupa, etc.) y aclara que usted emite Factura Electrónica SRI y Formulario de Reclamo Médico con código diagnóstico CIE-10 para reembolso o convenio. Esto atrae directamente a pacientes con pólizas activas de medicina prepagada que buscan atenderse con un especialista certificado en su ciudad.`,
                  "objection",
                  "obj3"
                )}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[11px] transition-all cursor-pointer"
              >
                {copiedResponse === "obj3" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedResponse === "obj3" ? "¡Copiado!" : "Copiar Respuesta"}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "La landing asocia cada tratamiento a sus aseguradoras y destaca la emisión de Factura SRI y Formulario de Reclamo Médico CIE-10. Esto le posiciona ante pacientes con seguro privado que desean asegurarse de que su consulta o procedimiento sea reembolsable."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
