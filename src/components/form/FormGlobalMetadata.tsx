/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData } from "../../types";
import { 
  Globe, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Upload, 
  Sliders, 
  Info, 
  CheckCircle,
  Eye,
  ArrowRight,
  BarChart3,
  Activity,
  CheckCircle2
} from "lucide-react";
import { compressAndConvertToWebP } from "../../utils/imageCompressor";
import { 
  getActiveFaviconUrl, 
  getActiveOgImageUrl, 
  normalizeDomainUrl,
  extractGoogleAnalyticsId,
  generateGoogleAnalyticsScript 
} from "../../utils/generators";

interface FormGlobalMetadataProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormGlobalMetadata({
  data,
  onChange,
  updateField
}: FormGlobalMetadataProps) {
  const [seoPreviewTab, setSeoPreviewTab] = useState<'serp' | 'social'>('serp');
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedGaScript, setCopiedGaScript] = useState(false);
  const [copiedGaId, setCopiedGaId] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState<string | null>(null);

  const isClinica = data.tipoEnfoqueLanding === "clinica";
  const activeFavicon = getActiveFaviconUrl(data);
  const activeOgImage = getActiveOgImageUrl(data);

  // Generadores de sugerencias rápidas de SEO
  const generateSuggestedTitle = () => {
    let title = "";
    const ciudad = data.ciudad || "Quito";
    if (isClinica) {
      const nombre = data.nombreMedico || "Centro Médico Familiar";
      const especialidad = data.especialidad || "Especialidades Médicas";
      title = `${nombre} | ${especialidad} en ${ciudad}, Ecuador`;
    } else {
      const nombre = data.nombreMedico || "Dr. Alejandro Ruiz";
      const especialidad = data.especialidad || "Cardiólogo Pediatra";
      title = `${nombre} | ${especialidad} en ${ciudad}, Ecuador`;
    }
    // Truncar para SEO óptimo
    if (title.length > 60) {
      title = title.substring(0, 57) + "...";
    }
    updateField("metaTitulo", title);
    triggerSuggestionNotification("Título optimizado sugerido");
  };

  const generateSuggestedDesc = () => {
    let desc = "";
    const ciudad = data.ciudad || "Quito";
    const direccion = data.direccionFisica || "Av. Principal";
    if (isClinica) {
      const nombre = data.nombreMedico || "Centro Médico Familiar";
      const especialidad = data.especialidad || "Especialidades Médicas";
      desc = `Visite ${nombre} en ${ciudad}. Ofrecemos servicios líderes en ${especialidad} con equipos de vanguardia. Ubicados en ${direccion}. ¡Separe su turno hoy!`;
    } else {
      const nombre = data.nombreMedico || "Dr. Alejandro Ruiz";
      const especialidad = data.especialidad || "Cardiólogo Pediatra";
      desc = `¿Busca un especialista de confianza? Agende una consulta con el ${nombre}, experto en ${especialidad} en la ciudad de ${ciudad}. Atención integral de alta calidad.`;
    }
    // Truncar para SEO óptimo
    if (desc.length > 160) {
      desc = desc.substring(0, 157) + "...";
    }
    updateField("metaDescripcion", desc);
    triggerSuggestionNotification("Meta descripción sugerida");
  };

  const triggerSuggestionNotification = (msg: string) => {
    setSuggestionSuccess(msg);
    setTimeout(() => {
      setSuggestionSuccess(null);
    }, 2500);
  };

  const titleLength = data.metaTitulo?.length || 0;
  const descLength = data.metaDescripcion?.length || 0;

  // Calculadores de color del medidor de caracteres
  const getTitleMeterColor = () => {
    if (titleLength === 0) return "bg-slate-200";
    if (titleLength >= 45 && titleLength <= 65) return "bg-emerald-500";
    if (titleLength > 65) return "bg-amber-500";
    return "bg-blue-500";
  };

  const getDescMeterColor = () => {
    if (descLength === 0) return "bg-slate-200";
    if (descLength >= 110 && descLength <= 160) return "bg-emerald-500";
    if (descLength > 160) return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600" />
          Metadatos Globales SEO
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configura el título de la pestaña del navegador y la descripción que Google muestra en los resultados de búsqueda para maximizar las visitas de pacientes.
        </p>
      </div>

      {/* CONTENEDOR VERTICAL - STACK (UNA ABAJO DE OTRA) */}
      <div className="space-y-6 max-w-full">
        {/* BLOQUE 1: CONFIGURACIÓN DE METATAGS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Configuración de Metatags
          </h4>

          {/* Input: Meta Título */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="global-meta-titulo">
                Meta Título de la Página (Title Tag)
                <span className="text-slate-400 font-normal text-[10px]">(Recomendado: 45-60 caracteres)</span>
              </label>
              <button
                type="button"
                onClick={generateSuggestedTitle}
                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Sugerir con IA
              </button>
            </div>

            <div className="relative">
              <input
                id="global-meta-titulo"
                type="text"
                value={data.metaTitulo ?? ""}
                onChange={(e) => updateField("metaTitulo", e.target.value)}
                placeholder={isClinica ? "ej. Clínica Médica Santa Lucía | Especialidades en Guayaquil" : "ej. Dr. Alejandro Ruiz | Cardiólogo Pediatra en Quito, Ecuador"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 shadow-2xs"
              />
            </div>

            {/* Medidor de caracteres */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
              <div className="flex-1 mr-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getTitleMeterColor()}`}
                  style={{ width: `${Math.min(100, (titleLength / 80) * 100)}%` }}
                />
              </div>
              <span className={titleLength >= 45 && titleLength <= 65 ? "text-emerald-600 font-bold" : titleLength > 65 ? "text-amber-600" : ""}>
                {titleLength} / 60 recomendados
              </span>
            </div>
          </div>

          {/* Input: Meta Descripción */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="global-meta-desc">
                Meta Descripción de la Página (Description Tag)
                <span className="text-slate-400 font-normal text-[10px]">(Recomendado: 120-160 caracteres)</span>
              </label>
              <button
                type="button"
                onClick={generateSuggestedDesc}
                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Sugerir con IA
              </button>
            </div>

            <textarea
              id="global-meta-desc"
              rows={3}
              value={data.metaDescripcion ?? ""}
              onChange={(e) => updateField("metaDescripcion", e.target.value)}
              placeholder="Escribe una breve descripción para convencer a los pacientes de agendar una cita al encontrarte en Google..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 resize-none shadow-2xs leading-relaxed"
            />

            {/* Medidor de caracteres */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
              <div className="flex-1 mr-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getDescMeterColor()}`}
                  style={{ width: `${Math.min(100, (descLength / 200) * 100)}%` }}
                />
              </div>
              <span className={descLength >= 110 && descLength <= 160 ? "text-emerald-600 font-bold" : descLength > 160 ? "text-amber-600" : ""}>
                {descLength} / 160 recomendados
              </span>
            </div>
          </div>

          {/* Alerta de sugerencia exitosa */}
          {suggestionSuccess && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg flex items-center gap-1.5 animate-fade-in font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{suggestionSuccess} cargado con éxito.</span>
            </div>
          )}
        </div>

        {/* BLOQUE 2: TARJETA DE IMAGEN COMPARTIDO SOCIAL */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-widest">
              <Share2 className="w-4 h-4 text-emerald-600" />
              Imagen de Compartido (og:image)
            </span>
            <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Open Graph</span>
          </div>
          
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Elige la imagen predeterminada que se adjuntará cuando tú o tus pacientes compartan el enlace web por chats de WhatsApp, publicaciones en redes sociales o perfiles profesionales.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "foto", label: "📷 Foto Perfil", subtitle: "Recomendado" },
              { id: "logo", label: "🏥 Logotipo", subtitle: "Identidad Marca" },
              { id: "pwa_icon", label: "🎨 Ícono PWA", subtitle: "Favicon Adaptado" },
              { id: "custom", label: "🖼️ Personalizada", subtitle: "Subir Imagen" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField("ogImageSource", opt.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  (data.ogImageSource || "foto") === opt.id
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold shadow-2xs"
                    : "border-slate-200 bg-white hover:bg-slate-100/70 text-slate-700 font-medium"
                }`}
              >
                <span className="text-xs leading-none">{opt.label}</span>
                <span className="text-[9px] text-slate-400 font-normal mt-1 block">{opt.subtitle}</span>
              </button>
            ))}
          </div>

          {/* Custom URL o File Upload */}
          {data.ogImageSource === "custom" && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={data.ogImageUrl || ""}
                  onChange={(e) => updateField("ogImageUrl", e.target.value)}
                  placeholder="Enlace o URL de la imagen personalizada..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white outline-none focus:border-emerald-500"
                />
                
                <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const res = await compressAndConvertToWebP(file, {
                            maxWidth: 1200,
                            maxHeight: 630,
                            quality: 0.85
                          });
                          updateField("ogImageUrl", res.dataUrl);
                          updateField("ogImageSource", "custom");
                        } catch (err) {
                          console.error("Error compressing OG image:", err);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* BLOQUE 3: SIMULADOR DE BÚSQUEDA Y COMPARTIDO (PREVIEW ABAJO) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                Simulador de Visualización Real
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Revisa en tiempo real la apariencia visual que tendrá tu landing page en los buscadores e interfaces de chat.
              </p>
            </div>

            {/* Pestañas de previsualización */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto gap-1">
              <button
                type="button"
                onClick={() => setSeoPreviewTab('serp')}
                className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  seoPreviewTab === 'serp'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => setSeoPreviewTab('social')}
                className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  seoPreviewTab === 'social'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* CONTENIDO GOOGLE SERP */}
          {seoPreviewTab === 'serp' && (
            <div className="p-4 rounded-xl border border-slate-150 bg-slate-50/70 space-y-2 max-w-full overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-5 h-5 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {activeFavicon ? (
                      <img src={activeFavicon} alt="Favicon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px]">🩺</span>
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs text-slate-800 font-medium leading-none truncate">
                      {data.dominioWeb || "https://tu-consultorio-medico.ec"}
                    </span>
                    <span className="text-[9px] text-slate-400 leading-none mt-0.5 truncate">
                      {data.ciudad || "Ecuador"} &gt; {data.especialidad || "Especialidad Médica"}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0 font-bold">
                  Buscador Google
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 pt-2">
                <div className="flex-1 space-y-1 overflow-hidden">
                  <h5 className="text-sm sm:text-base text-blue-800 font-semibold hover:underline cursor-pointer leading-tight truncate">
                    {data.metaTitulo || `${data.nombreMedico || 'Especialista'} | ${data.especialidad || 'Medicina'} en ${data.ciudad || 'Ecuador'}`}
                  </h5>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {data.metaDescripcion || `Consulte servicios médicos con ${data.nombreMedico || 'especialista'}, experto en ${data.especialidad || 'Medicina'} en ${data.ciudad || 'Ecuador'}. Reserve su cita ahora.`}
                  </p>
                </div>

                {activeOgImage && (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 shadow-2xs">
                    <img src={activeOgImage} alt="SERP" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTENIDO SOCIAL / WHATSAPP */}
          {seoPreviewTab === 'social' && (
            <div className="space-y-3">
              <div className="max-w-sm mx-auto rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                {/* Banner social */}
                <div className="w-full h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {activeOgImage ? (
                    <img src={activeOgImage} alt="Og" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 p-3 text-center">
                      <Share2 className="w-6 h-6 opacity-40" />
                      <span className="text-[10px] font-semibold">Sin imagen asignada</span>
                    </div>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white">
                    {data.ogImageSource === "logo" ? "Logo" : data.ogImageSource === "pwa_icon" ? "PWA" : data.ogImageSource === "custom" ? "Subido" : "Foto"}
                  </span>
                </div>

                {/* Detalle social */}
                <div className="p-3 border-t border-slate-150 bg-slate-50 space-y-1">
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block truncate">
                    {(data.dominioWeb || "TU-CONSULTORIO-MEDICO.EC").replace(/^https?:\/\//i, "").toUpperCase()}
                  </span>
                  <h6 className="text-xs font-bold text-slate-950 leading-snug truncate">
                    {data.metaTitulo || `${data.nombreMedico || 'Especialista'} | ${data.especialidad || 'Medicina'}`}
                  </h6>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                    {data.metaDescripcion || `Agende su consulta médica hoy.`}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center italic leading-tight">
                Simulación de la tarjeta interactiva que se desplegará al compartir el enlace del consultorio por WhatsApp.
              </p>
            </div>
          )}
        </div>

        {/* BLOQUE 4: GOOGLE ANALYTICS 4 (GA4) */}
        {(() => {
          const cleanGaId = extractGoogleAnalyticsId(data.googleAnalyticsId);
          const gaScriptContent = generateGoogleAnalyticsScript(data.googleAnalyticsId);
          const isGaConfigured = Boolean(cleanGaId);

          return (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      Google Analytics 4 (GA4)
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wide">
                        Métricas de Pacientes
                      </span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-9">
                    Mide en tiempo real las visitas de pacientes, canales de captación (Google, WhatsApp, Instagram) y conversiones de agendamiento.
                  </p>
                </div>

                <div className="pl-9 sm:pl-0 shrink-0">
                  {isGaConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      GA4 Activo ({cleanGaId})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Info className="w-3.5 h-3.5 text-amber-600" />
                      Sin Configurar
                    </span>
                  )}
                </div>
              </div>

              {/* Formulario de Entrada GA4 */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label htmlFor="metaGoogleAnalyticsId" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    ID de Medición de Google Analytics (Flujo Web)
                    <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Formato: G-XXXXXXXXXX
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Inyección automática en &lt;head&gt;
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="metaGoogleAnalyticsId"
                    type="text"
                    value={data.googleAnalyticsId ?? ""}
                    onChange={(e) => updateField("googleAnalyticsId", e.target.value)}
                    placeholder='ej: G-1A2B3C4D5E o pega la etiqueta completa <!-- Google tag (gtag.js) -->...'
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-white"
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pega tu <strong>ID de Medición</strong> de Google Analytics 4 o el bloque de código <code>gtag.js</code> completo. El sistema detecta y extrae automáticamente tu identificador para compilar el script con el formato oficial optimizado.
                </p>

                {isGaConfigured && (
                  <div className="space-y-2.5 p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-amber-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Script gtag.js generado e inyectado en el &lt;head&gt;:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(cleanGaId);
                            setCopiedGaId(true);
                            setTimeout(() => setCopiedGaId(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-amber-300 shadow-2xs shrink-0"
                        >
                          {copiedGaId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedGaId ? "¡ID Copiado!" : "Copiar ID"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(gaScriptContent);
                            setCopiedGaScript(true);
                            setTimeout(() => setCopiedGaScript(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
                        >
                          {copiedGaScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedGaScript ? "¡Script Copiado!" : "Copiar Script gtag.js"}</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-2.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
                      {gaScriptContent}
                    </pre>

                    <div className="text-[10px] text-amber-900 flex items-center gap-1.5 pt-0.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Inyectado automáticamente en <code>index.html</code>, en todas las páginas de servicios (<code>/servicios/</code>), exportación ZIP y despliegue FTP.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* BLOQUE 5: TARJETA INFORMATIVA DE BUENAS PRÁCTICAS */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2 text-xs">
          <span className="font-extrabold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            Consejos de Optimización SEO local
          </span>
          <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-[11px] leading-relaxed">
            <li><strong>Incluye tu especialidad y ciudad</strong> en el título de la página (ej: <i>&quot;Cardiólogo Pediatra en Quito&quot;</i>).</li>
            <li><strong>Agrega palabras de conversión</strong> en la descripción como <i>&quot;Agende su cita&quot;</i> o <i>&quot;Consulte costos&quot;</i>.</li>
            <li><strong>Mantén el largo correcto</strong> para evitar que Google trunque el texto en la pantalla del celular.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
