/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Componente Asistente Virtual & Preguntas Frecuentes Interactivas en Acordeón
 * Presentado por el Avatar Robot Humanoide Femenino con diseño de borde neón,
 * tarjetas interactivas desplegables y enlaces directos de navegación y redirección.
 */

import React, { useState, useMemo } from "react";
import { 
  ChevronDown, 
  ExternalLink, 
  ArrowRight, 
  MessageCircle, 
  Layers, 
  MapPin, 
  Calendar, 
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MedicalLandingData, FAQItem } from "../types";

interface MedicalAiAssistantFaqProps {
  data: MedicalLandingData;
  colorName?: string;
  isInsidePreview?: boolean;
}

export const MedicalAiAssistantFaq: React.FC<MedicalAiAssistantFaqProps> = ({
  data,
  colorName = "blue",
  isInsidePreview = true
}) => {
  // Lista de FAQs directamente de data.faqs
  const faqsList: FAQItem[] = useMemo(() => {
    return data.faqs && data.faqs.length > 0 ? data.faqs : [];
  }, [data.faqs]);

  // Estado para acordeón desplegado (por ID de pregunta)
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    return faqsList.length > 0 ? faqsList[0].id : null;
  });

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Manejo de navegación / redirección de enlaces
  const handleLinkClick = (e: React.MouseEvent, faq: FAQItem) => {
    if (!faq.enlaceUrl && !faq.enlaceTipo) return;

    // Si es WhatsApp
    if (faq.enlaceTipo === "whatsapp" || (!faq.enlaceUrl && faq.enlaceTexto?.toLowerCase().includes("whatsapp"))) {
      e.preventDefault();
      const waBaseUrl = data.whatsappUrl || (data.telefonoGBP ? `https://wa.me/${data.telefonoGBP.replace(/\D/g, '')}` : 'https://wa.me/593999999999');
      const text = encodeURIComponent(`Hola Dr(a). ${data.nombreMedico || ""}, tengo una consulta sobre: "${faq.pregunta}".`);
      const waUrl = waBaseUrl.includes("?") ? `${waBaseUrl}&text=${text}` : `${waBaseUrl}?text=${text}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const url = faq.enlaceUrl?.trim() || "";

    // Enlace ancla interno (#servicios, #preview-landing-services, etc.)
    if (url.startsWith("#")) {
      e.preventDefault();
      const targetId = url.substring(1);
      const elem = document.getElementById(targetId) || 
                   document.getElementById(`preview-landing-${targetId}`) ||
                   document.getElementById(targetId.replace("preview-landing-", ""));
      
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback genérico por nombre de sección
        const genericElem = document.querySelector(`[id*="${targetId}"]`);
        if (genericElem) {
          genericElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      return;
    }

    // Enlace externo (http / https)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      e.preventDefault();
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
  };

  // Obtener icono acorde al tipo de enlace
  const getLinkIcon = (faq: FAQItem) => {
    if (faq.enlaceTipo === "whatsapp" || faq.enlaceTexto?.toLowerCase().includes("whatsapp")) {
      return <MessageCircle className="w-4 h-4" />;
    }
    if (faq.enlaceUrl?.includes("servicios") || faq.enlaceUrl?.includes("services") || faq.enlaceTipo === "servicio") {
      return <Layers className="w-4 h-4" />;
    }
    if (faq.enlaceUrl?.includes("map") || faq.enlaceUrl?.includes("ubicacion") || faq.enlaceUrl?.includes("maps")) {
      return <MapPin className="w-4 h-4" />;
    }
    if (faq.enlaceUrl?.includes("booking") || faq.enlaceUrl?.includes("agenda") || faq.enlaceUrl?.includes("cita")) {
      return <Calendar className="w-4 h-4" />;
    }
    if (faq.enlaceUrl?.startsWith("http")) {
      return <ExternalLink className="w-4 h-4" />;
    }
    return <ArrowRight className="w-4 h-4" />;
  };

  return (
    <div 
      className="my-6 assistant-neon-card-wrapper"
      style={{
        position: 'relative',
        overflow: 'hidden',
        contain: 'paint',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        borderRadius: '24px',
        WebkitBorderRadius: '24px',
        clipPath: 'inset(0 round 24px)',
        WebkitClipPath: 'inset(0 round 24px)',
        backgroundColor: '#ffffff',
        padding: '3px',
        isolation: 'isolate'
      }}
    >
      {/* Recorrido animado de borde neón (Azul, Amarillo, Rojo) estilo Google AI Studio */}
      <div 
        className="assistant-neon-spinner" 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'conic-gradient(from 0deg, #3b82f6 0deg, #f59e0b 120deg, #ef4444 240deg, #3b82f6 360deg)',
          animation: 'assistantNeonSpin 5s linear infinite',
          WebkitAnimation: 'assistantNeonSpin 5s linear infinite',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      <div 
        id="asistente-medico-ia-widget" 
        className="relative z-10 rounded-[21px] bg-white p-5 sm:p-6 md:p-7 text-left transition-all"
        style={{ borderRadius: '21px', backgroundColor: '#ffffff', position: 'relative', zIndex: 10 }}
      >
        {/* Detalle visual sutil de fondo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-50/60 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 opacity-80" />

        <div className="relative z-10 space-y-5">
          
          {/* FOTO DE LA SECCIÓN EN FORMATO 1000x550px */}
          <div className="relative w-full aspect-[1000/550] rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 bg-slate-900 group">
            <img
              src={data.asistenteFotoUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop"}
              alt="Preguntas frecuentes"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* LISTADO DE PREGUNTAS FRECUENTES EN ACORDEÓN / TARJETAS INTERACTIVAS */}
          <div className="space-y-3 pt-1">
            {faqsList.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">
                  No hay preguntas frecuentes registradas.
                </p>
              </div>
            ) : (
              faqsList.map((faq, idx) => {
                const isOpen = expandedId === faq.id;

                return (
                  <div
                    key={faq.id || idx}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "bg-slate-50/90 border-blue-300 shadow-xs ring-1 ring-blue-400/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    {/* ENCABEZADO DEL ACORDEÓN CON DISEÑO UX MEJORADO */}
                    <button
                      type="button"
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none transition-colors group"
                      aria-expanded={isOpen}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm sm:text-[15.5px] font-bold tracking-tight leading-snug transition-colors ${
                          isOpen ? "text-blue-900" : "text-slate-800 group-hover:text-slate-950"
                        }`}>
                          {faq.pregunta}
                        </h4>
                      </div>

                      <div className="shrink-0 flex items-center pl-2">
                        <span 
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200 border ${
                            isOpen 
                              ? "rotate-180 bg-blue-50 text-blue-600 border-blue-200 shadow-2xs" 
                              : "bg-slate-50 text-slate-400 border-slate-200/80 group-hover:bg-slate-100 group-hover:text-slate-700 group-hover:border-slate-300"
                          }`}
                        >
                          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                        </span>
                      </div>
                    </button>

                    {/* CUERPO EXPANDIBLE CON ANIMACIÓN */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3 border-t border-slate-200/70">
                            
                            {/* Texto de la respuesta */}
                            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                              <p className="text-xs sm:text-sm md:text-[14.5px] text-slate-700 font-normal leading-relaxed whitespace-pre-line">
                                {faq.respuesta}
                              </p>
                            </div>

                            {/* BOTÓN DE ACCIÓN / ENLACE OPCIONAL CONFIGURADO */}
                            {(faq.enlaceUrl || faq.enlaceTexto) && (
                              <div className="pt-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleLinkClick(e, faq)}
                                  className={`px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-white text-xs font-black inline-flex items-center gap-2 shadow-xs hover:shadow transition-all cursor-pointer ${
                                    faq.enlaceTipo === "whatsapp" || (!faq.enlaceUrl && faq.enlaceTexto?.toLowerCase().includes("whatsapp"))
                                      ? "bg-emerald-600 hover:bg-emerald-700"
                                      : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                                  }`}
                                >
                                  {getLinkIcon(faq)}
                                  <span>{faq.enlaceTexto || "Ver más detalles"}</span>
                                </button>
                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* PIE CON GARANTÍA CLÍNICA Y CONTACTO DIRECTO */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2.5 pt-3 border-t border-slate-100 font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              Respuestas oficiales de la consulta de {data.nombreMedico || "el especialista"}.
            </span>
            
            {(data.whatsappUrl || data.telefonoGBP) && (
              <a
                href={
                  data.whatsappUrl
                    ? `${data.whatsappUrl}${data.whatsappUrl.includes('?') ? '&' : '?'}text=${encodeURIComponent(`Hola Dr(a). ${data.nombreMedico || ""}, tengo una consulta médica que no encontré en las preguntas frecuentes.`)}`
                    : `https://wa.me/${(data.telefonoGBP || '').replace(/\D/g, "")}?text=${encodeURIComponent(`Hola Dr(a). ${data.nombreMedico || ""}, tengo una consulta médica que no encontré en las preguntas frecuentes.`)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>¿Otra pregunta? Escríbenos</span>
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
