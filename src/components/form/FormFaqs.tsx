/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formulario de Gestión de Preguntas Frecuentes & Configuración del Asistente Virtual
 * Permite administrar preguntas, respuestas detalladas, enlaces de redirección a servicios/secciones,
 * y personalizar el avatar y mensaje de bienvenida del robot humanoide femenino.
 */

import React, { useState } from "react";
import { MedicalLandingData, FAQItem } from "../../types";
import { generateJsonLd } from "../../utils/generators";
import { compressAndConvertToWebP, formatBytes, CompressResult } from "../../utils/imageCompressor";
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Check, 
  MessageSquare, 
  UserCheck, 
  Link as LinkIcon, 
  ExternalLink,
  Layers,
  MapPin,
  Calendar,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Tag,
  Sparkles,
  Bot,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Copy,
  Code2,
  FileCode,
  FileText,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  X
} from "lucide-react";

interface FormFaqsProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormFaqs({
  data,
  onChange,
  updateField
}: FormFaqsProps) {
  // Lista de preguntas frecuentes
  const faqs = data.faqs || [];
  const [showJsonLdPreview, setShowJsonLdPreview] = useState(false);
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);
  const [isCompressingAssistantPhoto, setIsCompressingAssistantPhoto] = useState(false);
  const [assistantPhotoStats, setAssistantPhotoStats] = useState<CompressResult | null>(null);

  const handleAssistantPhotoUpload = async (file: File) => {
    try {
      setIsCompressingAssistantPhoto(true);
      const result = await compressAndConvertToWebP(file, {
        maxWidth: 1000,
        maxHeight: 550,
        quality: 0.85
      });
      updateField("asistenteFotoUrl", result.dataUrl);
      setAssistantPhotoStats(result);
    } catch (err) {
      console.error("Error comprimiendo foto del asistente:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateField("asistenteFotoUrl", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingAssistantPhoto(false);
    }
  };

  // Mantiene sincronizadas las FAQs
  const handleFaqChange = (index: number, field: keyof FAQItem, value: any) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index] = {
      ...updatedFaqs[index],
      [field]: value
    };
    updateField("faqs", updatedFaqs);
    updateField("asistentePreguntas", updatedFaqs);
  };

  const addFaq = (customFaq?: Partial<FAQItem>) => {
    const newFaqItem: FAQItem = {
      id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pregunta: customFaq?.pregunta || "¿Cuáles son los requisitos y preparación para la consulta médica?",
      respuesta: customFaq?.respuesta || "Para su cita, le sugerimos traer exámenes previos de laboratorio o imagen, lista de medicamentos habituales y documento de identidad.",
      enlaceUrl: customFaq?.enlaceUrl || "#preview-landing-services",
      enlaceTexto: customFaq?.enlaceTexto || "Ver Servicios Disponibles",
      enlaceTipo: customFaq?.enlaceTipo || "interno",
      categoria: customFaq?.categoria || "General"
    };

    const updated = [...faqs, newFaqItem];
    updateField("faqs", updated);
    updateField("asistentePreguntas", updated);
  };

  const duplicateFaq = (index: number) => {
    const orig = faqs[index];
    if (!orig) return;
    const duplicated: FAQItem = {
      ...orig,
      id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pregunta: `${orig.pregunta} (Copia)`
    };
    const updated = [...faqs.slice(0, index + 1), duplicated, ...faqs.slice(index + 1)];
    updateField("faqs", updated);
    updateField("asistentePreguntas", updated);
  };

  const removeFaq = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    updateField("faqs", updated);
    updateField("asistentePreguntas", updated);
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === faqs.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...faqs];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateField("faqs", updated);
    updateField("asistentePreguntas", updated);
  };

  const handleCopyJsonLd = () => {
    try {
      const jsonLdStr = generateJsonLd(data);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonLdStr);
        setCopiedJsonLd(true);
        setTimeout(() => setCopiedJsonLd(false), 2000);
      }
    } catch (e) {
      console.error("Error al copiar JSON-LD:", e);
    }
  };

  // Plantillas rápidas de preguntas frecuentes con enlaces listos
  const quickTemplates = [
    {
      label: "+ Precios y Pagos",
      pregunta: "¿Cuáles son las formas de pago aceptadas y el costo de la consulta?",
      respuesta: `La consulta médica presencial tiene un valor referencial de ${data.precioConsulta || "tarifa establecida"}. Aceptamos efectivo, transferencias bancarias directas y tarjetas de crédito o débito con opción a diferidos.`,
      enlaceUrl: "#preview-landing-services",
      enlaceTexto: "Ver Tarifas de Servicios",
      enlaceTipo: "interno" as const,
      categoria: "Costos & Pagos"
    },
    {
      label: "+ Ubicación y Mapa",
      pregunta: "¿Dónde queda ubicado el consultorio y cuentan con parqueadero?",
      respuesta: `Nos encontramos ubicados en ${data.direccionFisica || "la zona médica central"}, en la ciudad de ${data.ciudad || "la ciudad"}. Contamos con estacionamiento seguro y cómodo acceso para personas con movilidad reducida.`,
      enlaceUrl: "#preview-landing-map",
      enlaceTexto: "Ver Ubicación en Google Maps",
      enlaceTipo: "interno" as const,
      categoria: "Ubicación"
    },
    {
      label: "+ Seguros y Facturación SRI",
      pregunta: "¿Cómo funciona el trámite de reembolso con seguro médico privado?",
      respuesta: "Emitimos la Factura Electrónica SRI oficial y el formulario de reclamo médico completo con código diagnóstico CIE-10 para tu reembolso ágil en todas las aseguradoras del país.",
      enlaceUrl: "#preview-landing-eeat",
      enlaceTexto: "Ver Aseguradoras Aceptadas",
      enlaceTipo: "interno" as const,
      categoria: "Seguros & SRI"
    },
    {
      label: "+ Agendamiento WhatsApp",
      pregunta: "¿Cómo puedo coordinar o reprogramar una cita médica?",
      respuesta: "Puedes coordinar o modificar tu turno de forma inmediata escribiéndonos directamente a nuestro WhatsApp oficial de recepción médica.",
      enlaceTexto: "Agendar por WhatsApp",
      enlaceTipo: "whatsapp" as const,
      categoria: "Citas & Horarios"
    },
    {
      label: "+ Preparación y Exámenes",
      pregunta: "¿Qué documentos o exámenes previos debo llevar a mi primera cita?",
      respuesta: "Le sugerimos traer su cédula de identidad, resultados de exámenes o estudios recientes (laboratorio, radiografías o ecografías) y el detalle de los medicamentos que toma en la actualidad.",
      enlaceUrl: "#preview-landing-booking",
      enlaceTexto: "Reservar Turno",
      enlaceTipo: "interno" as const,
      categoria: "Preparación"
    },
    {
      label: "+ Reposo y Recetas Médicas",
      pregunta: "¿Emiten certificados de reposo médico y recetas electrónicas autorizadas?",
      respuesta: "Sí. Durante la consulta se emite la receta médica oficial con indicaciones farmacológicas precisas y, de ser justificado clínicamente, el certificado de reposo avalado.",
      enlaceUrl: "#preview-landing-services",
      enlaceTexto: "Ver Servicios",
      enlaceTipo: "interno" as const,
      categoria: "Certificados"
    }
  ];

  // Cálculo de FAQs válidas para Schema JSON-LD
  const validFaqsCount = faqs.filter(f => f.pregunta?.trim() && f.respuesta?.trim()).length;

  return (
    <div id="form-faqs-section" className="space-y-6">
      
      {/* CABECERA PRINCIPAL */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
            Preguntas Frecuentes & JSON-LD FAQPage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Añade, edita y organiza las preguntas frecuentes. Cada respuesta se refleja en la landing page y en el marcado Schema.org JSON-LD para Google SERP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            {faqs.length} {faqs.length === 1 ? "Pregunta Activa" : "Preguntas Activas"}
          </span>
          <button
            type="button"
            onClick={() => setShowJsonLdPreview(!showJsonLdPreview)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            title="Ver marcado JSON-LD generado"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-600" />
            <span>{showJsonLdPreview ? "Ocultar JSON-LD" : "Ver JSON-LD"}</span>
          </button>
        </div>
      </div>

      {/* PANEL EXPANDIBLE DE VISTA PREVIA JSON-LD */}
      {showJsonLdPreview && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                Schema.org FAQPage JSON-LD ({validFaqsCount} preguntas sincronizadas)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyJsonLd}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
            >
              {copiedJsonLd ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copiedJsonLd ? "¡Copiado!" : "Copiar JSON-LD"}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Este bloque JSON-LD se inserta automáticamente en la etiqueta <code className="text-emerald-300">&lt;script type="application/ld+json"&gt;</code> de tu landing page para indexar snippets enriquecidos en Google.
          </p>
          <pre className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 border border-slate-800/80 leading-relaxed">
            {JSON.stringify(
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "@id": `${data.dominioWeb || "https://tu-consultorio-medico.ec"}/#faq`,
                "mainEntity": faqs
                  .filter(f => f.pregunta?.trim() && f.respuesta?.trim())
                  .map(f => ({
                    "@type": "Question",
                    "name": f.pregunta.trim(),
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": f.respuesta.trim(),
                      ...(f.enlaceUrl?.trim() ? {
                        "url": f.enlaceUrl.startsWith("#") 
                          ? `${data.dominioWeb || "https://tu-consultorio-medico.ec"}/${f.enlaceUrl}` 
                          : f.enlaceUrl
                      } : {})
                    }
                  }))
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* TARJETA DE FOTO DE LA SECCIÓN (1000x550px) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-cyan-400/30 shrink-0">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Foto de la Sección Preguntas Frecuentes</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  1000 x 550 px
                </span>
              </h4>
              <p className="text-[11px] text-indigo-200/80 mt-0.5">
                Sube la imagen panorámica (1000x550px) que encabezará la sección de preguntas frecuentes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUMNA FOTO 1000x550 PREVIEW */}
          <div className="lg:col-span-7 space-y-3">
            <label className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                Vista Previa (Formato 1000x550px)
              </span>
              <span className="text-[9px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                Panorámica
              </span>
            </label>

            {/* CONTENEDOR DE PREVISUALIZACIÓN CON RATIO 1000:550 */}
            <div className="relative w-full aspect-[1000/550] rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/40 shadow-inner group">
              <img
                src={data.asistenteFotoUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop"}
                alt="Preguntas frecuentes"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
              
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 flex items-end justify-between">
                <span className="text-[11px] font-bold text-slate-200">
                  Formato optimizado: 1000 × 550 px
                </span>
                {data.asistenteFotoUrl && (
                  <button
                    type="button"
                    onClick={() => updateField("asistenteFotoUrl", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop")}
                    title="Restablecer imagen por defecto"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restablecer</span>
                  </button>
                )}
              </div>

              {isCompressingAssistantPhoto && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-200">Optimizando a 1000x550 en WebP...</span>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA SUBIDA & OPCIONES */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* BOTONES DE CARGA Y SELECCIÓN */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  Subir o Cambiar Foto
                </label>

                <div className="flex items-center gap-2">
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold cursor-pointer transition-all shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>Subir Foto (1000x550px)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAssistantPhotoUpload(file);
                      }}
                    />
                  </label>
                </div>

                {/* URL directa */}
                <input
                  type="text"
                  value={data.asistenteFotoUrl || ""}
                  onChange={(e) => updateField("asistenteFotoUrl", e.target.value)}
                  placeholder="O pega URL de imagen (https://...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-indigo-500/40 text-indigo-100 text-[11px] focus:border-cyan-400 outline-none"
                />

                {/* Estadísticas de compresión si existen */}
                {assistantPhotoStats && (
                  <p className="text-[10px] text-emerald-300 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Optimizado: {formatBytes(assistantPhotoStats.sizeBytes)} ({Math.round(assistantPhotoStats.compressionRatio * 100)}% ahorro WebP)
                  </p>
                )}
              </div>

              {/* FOTOS PRECONFIGURADAS EN FORMATO PANORÁMICO */}
              <div className="pt-2 border-t border-indigo-800/40">
                <span className="text-[10px] font-bold text-indigo-300 block mb-2">Fotos recomendadas (1000x550):</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Atención Clínica", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop" },
                    { label: "Consulta Médica", url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop" },
                    { label: "Especialista", url: "https://images.unsplash.com/photo-1594824813627-89758f86f7b1?q=80&w=1000&auto=format&fit=crop" },
                    { label: "Equipo Médico", url: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop" }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateField("asistenteFotoUrl", preset.url)}
                      className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 hover:border-cyan-400 transition-all cursor-pointer group text-left"
                    >
                      <div className="w-12 aspect-[1000/550] rounded-md overflow-hidden bg-slate-800 shrink-0">
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-200 group-hover:text-white truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PLANTILLAS RÁPIDAS DE PREGUNTAS FRECUENTES */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Plantillas Rápidas con Enlaces Preconfigurados:
          </span>
          <span className="text-[10px] text-blue-700 font-bold">Haz clic para agregar a tu catálogo</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickTemplates.map((tmpl, tIdx) => (
            <button
              key={tIdx}
              type="button"
              onClick={() => addFaq(tmpl)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-600 text-blue-900 hover:text-white border border-blue-200 hover:border-blue-600 text-xs font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span>{tmpl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO DE PREGUNTAS Y RESPUESTAS EDITABLES */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>Listado de Preguntas Frecuentes ({faqs.length})</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Cada pregunta se muestra en el acordeón interactivo y se sincroniza automáticamente con el JSON-LD.
            </p>
          </div>
          <button
            type="button"
            onClick={() => addFaq()}
            className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Pregunta</span>
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No has registrado preguntas frecuentes aún.</p>
            <button
              type="button"
              onClick={() => addFaq()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-white border border-slate-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear mi primera pregunta
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={faq.id || idx} 
                className="p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-slate-50 space-y-3.5 transition-all shadow-2xs"
              >
                {/* BARRA SUPERIOR DE LA TARJETA */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-[11px] font-black flex items-center justify-center font-mono shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Pregunta #{idx + 1}
                    </span>
                    {faq.categoria && (
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {faq.categoria}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Botón Duplicar */}
                    <button
                      type="button"
                      onClick={() => duplicateFaq(idx)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      title="Duplicar pregunta"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {/* Botones Mover Arriba / Abajo */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveFaq(idx, "up")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
                      title="Mover arriba"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === faqs.length - 1}
                      onClick={() => moveFaq(idx, "down")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
                      title="Mover abajo"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      title="Eliminar pregunta"
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CAMPO 1: PREGUNTA */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase flex items-center justify-between" htmlFor={`faq-p-${idx}`}>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-blue-600" />
                      Pregunta del Paciente (Schema: name)
                    </span>
                    <span className="text-[9px] font-medium text-slate-400">Requerido</span>
                  </label>
                  <input
                    id={`faq-p-${idx}`}
                    type="text"
                    value={faq.pregunta ?? ""}
                    onChange={(e) => handleFaqChange(idx, "pregunta", e.target.value)}
                    placeholder="ej. ¿Cuál es el costo de la consulta médica y qué incluye?"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white font-bold text-slate-900"
                  />
                </div>

                {/* CAMPO 2: RESPUESTA */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase flex items-center justify-between" htmlFor={`faq-r-${idx}`}>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      Respuesta Clara (Schema: acceptedAnswer)
                    </span>
                    <span className="text-[9px] font-medium text-slate-400">Requerido</span>
                  </label>
                  <textarea
                    id={`faq-r-${idx}`}
                    rows={2.5}
                    value={faq.respuesta ?? ""}
                    onChange={(e) => handleFaqChange(idx, "respuesta", e.target.value)}
                    placeholder="Escribe la respuesta detallada que resolverá la duda del paciente..."
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none bg-white text-slate-800 leading-relaxed"
                  />
                </div>

                {/* CAMPO 3: ENLACE OPCIONAL & BOTÓN DE ACCIÓN */}
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-blue-600" />
                      Enlace Opcional & Botón de Acción
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                    {/* Texto del botón */}
                    <div>
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block mb-0.5">
                        Texto del Botón (Opcional)
                      </label>
                      <input
                        type="text"
                        value={faq.enlaceTexto ?? ""}
                        onChange={(e) => handleFaqChange(idx, "enlaceTexto", e.target.value)}
                        placeholder="ej. Ver Servicios y Tarifas"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    {/* URL o Destino */}
                    <div>
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block mb-0.5">
                        Enlace Opcional (URL o #ancla)
                      </label>
                      <input
                        type="text"
                        value={faq.enlaceUrl ?? ""}
                        onChange={(e) => handleFaqChange(idx, "enlaceUrl", e.target.value)}
                        placeholder="ej. #preview-landing-services o https://..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            ))}

            {/* BOTÓN INFERIOR PARA AÑADIR OTRA PREGUNTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => addFaq()}
                className="w-full py-3 rounded-xl border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 text-blue-700 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Añadir Otra Pregunta Frecuente</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

