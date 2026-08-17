/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MedicalLandingData, BeforeAfterCase } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, 
  Monitor, 
  Stethoscope, 
  Activity, 
  HeartPulse, 
  Check, 
  ChevronDown, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Award,
  ThumbsUp,
  Sparkles,
  Syringe,
  Eye,
  Thermometer,
  FileText,
  Pill,
  Scissors,
  Cross,
  Brain,
  Smile,
  Microscope,
  Mail,
  Share2,
  Star,
  Calendar,
  Home,
  ExternalLink,
  CheckCircle2,
  Map,
  MessageCircle,
  Banknote,
  CreditCard,
  DollarSign,
  Building2,
  UserCheck
} from "lucide-react";
import { ChatbotWidget } from "./ChatbotWidget";
import { getActiveColorScale } from "../utils/colorUtils";
import { MedicalIconRenderer } from "./MedicalIconRenderer";
import { getLiveConsultationStatus } from "../utils/scheduleUtils";
import { getActiveLandingStyle } from "../utils/stylePresets";

interface PreviewPanelProps {
  data: MedicalLandingData;
}

interface ClinicalBeforeAfterSliderItemProps {
  caso: BeforeAfterCase;
  idx: number;
  primaryColorClass: string;
}

/// Sub-componente interactivo e independiente para cada caso clínico de Antes y Después
const ClinicalBeforeAfterSliderItem: React.FC<ClinicalBeforeAfterSliderItemProps> = ({ 
  caso, 
  idx, 
  primaryColorClass 
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let pos = ((clientX - rect.left) / rect.width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    setSliderPos(pos);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      handleSliderMove(e.clientX);
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5 flex flex-col justify-between shadow-xs">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
            {idx + 1}
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">{caso.titulo}</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{caso.descripcion}</p>
      </div>

      {/* Slider interactivo en React */}
      <div 
        ref={sliderRef}
        onMouseMove={(e) => isDragging.current && handleSliderMove(e.clientX)}
        onTouchMove={handleTouchMove}
        onClick={(e) => handleSliderMove(e.clientX)}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden select-none bg-slate-200 cursor-ew-resize border border-slate-300/70 shadow-sm"
      >
        {/* Imagen Después (Fondo) */}
        <img 
          src={caso.imgAfter} 
          alt={`Resultado Después - ${caso.titulo}`} 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
          referrerPolicy="no-referrer"
        />
        
        {/* Imagen Antes (Superpuesta con clip-path) */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" 
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <img 
            src={caso.imgBefore} 
            alt={`Estado Antes - ${caso.titulo}`} 
            className="absolute inset-0 w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-2.5 left-2.5 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-xs pointer-events-auto">Antes</span>
        </div>

        <span className="absolute top-2.5 right-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-xs pointer-events-auto">Después</span>

        {/* Separador de Arrastre */}
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="absolute top-0 bottom-0 w-0.5 bg-white flex items-center justify-center cursor-ew-resize shadow-md"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-7 h-7 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center border border-slate-300 text-[10px] font-extrabold pointer-events-none">
            &larr;&rarr;
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PreviewPanel({ data }: PreviewPanelProps) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [faqExpanded, setFaqExpanded] = useState<{ [key: number]: boolean }>({});
  
  // Mini formulario de agendamiento interactivo
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [bookingTime, setBookingTime] = useState<string>("10:30 AM");
  const [patientName, setPatientName] = useState<string>("");

  // Helper para generar URL dinámica de WhatsApp con fecha, hora y paciente
  const getDynamicWhatsAppUrl = (): string => {
    const rawUrl = data.whatsappUrl || "https://wa.me/593991234567";
    const baseUrl = rawUrl.split("?")[0];
    let dateFormatted = "los próximos días";
    if (bookingDate) {
      try {
        const parts = bookingDate.split("-");
        if (parts.length === 3) {
          const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          dateFormatted = dateObj.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
      } catch (e) {
        dateFormatted = bookingDate;
      }
    }
    const nameStr = patientName.trim() ? ` Mi nombre es ${patientName.trim()}.` : "";
    const defaultTemplate = "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.";
    let msg = data.whatsappMensajePlantilla && data.whatsappMensajePlantilla.trim() 
      ? data.whatsappMensajePlantilla 
      : defaultTemplate;

    msg = msg
      .replace(/\{\{medico\}\}/gi, data.nombreMedico || "")
      .replace(/\{\{especialidad\}\}/gi, data.especialidad || "")
      .replace(/\{\{ciudad\}\}/gi, data.ciudad || "")
      .replace(/\{\{clinica\}\}/gi, data.nombreClinicaGBP || "")
      .replace(/\{\{fecha\}\}/gi, dateFormatted)
      .replace(/\{\{hora\}\}/gi, bookingTime)
      .replace(/\{\{nombre\}\}/gi, nameStr);

    if (nameStr && !data.whatsappMensajePlantilla?.includes("{{nombre}}") && !msg.includes(nameStr)) {
      msg += nameStr;
    }

    return `${baseUrl}?text=${encodeURIComponent(msg)}`;
  };
  
  // Helper for dynamic coloring in live preview
  const getC = (key: string): string => {
    const colorMap: { [key: string]: { [key: string]: string } } = {
      azul: {
        "50": "blue-50",
        "100": "blue-100",
        "200": "blue-200",
        "500": "blue-500",
        "600": "blue-600",
        "700": "blue-700",
        "850": "blue-600/10",
        "hoverBg": "hover:bg-blue-700",
        "hoverText": "hover:text-blue-600",
        "hoverBorder": "hover:border-blue-600",
        "decoration": "decoration-blue-600/30",
        "bgGradient": "from-blue-50"
      },
      verde: {
        "50": "emerald-50",
        "100": "emerald-100",
        "200": "emerald-200",
        "500": "emerald-500",
        "600": "emerald-600",
        "700": "emerald-700",
        "850": "emerald-600/10",
        "hoverBg": "hover:bg-emerald-700",
        "hoverText": "hover:text-emerald-600",
        "hoverBorder": "hover:border-emerald-600",
        "decoration": "decoration-emerald-600/30",
        "bgGradient": "from-emerald-50"
      },
      morado: {
        "50": "purple-50",
        "100": "purple-100",
        "200": "purple-200",
        "500": "purple-500",
        "600": "purple-600",
        "700": "purple-700",
        "850": "purple-600/10",
        "hoverBg": "hover:bg-purple-700",
        "hoverText": "hover:text-purple-600",
        "hoverBorder": "hover:border-purple-600",
        "decoration": "decoration-purple-600/30",
        "bgGradient": "from-purple-50"
      },
      teal: {
        "50": "teal-50",
        "100": "teal-100",
        "200": "teal-200",
        "500": "teal-500",
        "600": "teal-600",
        "700": "teal-700",
        "850": "teal-600/10",
        "hoverBg": "hover:bg-teal-700",
        "hoverText": "hover:text-teal-600",
        "hoverBorder": "hover:border-teal-600",
        "decoration": "decoration-teal-600/30",
        "bgGradient": "from-teal-50"
      },
      indigo: {
        "50": "indigo-50",
        "100": "indigo-100",
        "200": "indigo-200",
        "500": "indigo-500",
        "600": "indigo-600",
        "700": "indigo-700",
        "850": "indigo-600/10",
        "hoverBg": "hover:bg-indigo-700",
        "hoverText": "hover:text-indigo-600",
        "hoverBorder": "hover:border-indigo-600",
        "decoration": "decoration-indigo-600/30",
        "bgGradient": "from-indigo-50"
      },
      rojo: {
        "50": "rose-50",
        "100": "rose-100",
        "200": "rose-200",
        "500": "rose-500",
        "600": "rose-600",
        "700": "rose-700",
        "850": "rose-600/10",
        "hoverBg": "hover:bg-rose-700",
        "hoverText": "hover:text-rose-600",
        "hoverBorder": "hover:border-rose-600",
        "decoration": "decoration-rose-600/30",
        "bgGradient": "from-rose-50"
      },
      ambar: {
        "50": "amber-50",
        "100": "amber-100",
        "200": "amber-200",
        "500": "amber-500",
        "600": "amber-600",
        "700": "amber-700",
        "850": "amber-600/10",
        "hoverBg": "hover:bg-amber-700",
        "hoverText": "hover:text-amber-600",
        "hoverBorder": "hover:border-amber-600",
        "decoration": "decoration-amber-600/30",
        "bgGradient": "from-amber-50"
      },
      personalizado: {
        "50": "blue-50",
        "100": "blue-100",
        "200": "blue-200",
        "500": "blue-500",
        "600": "blue-600",
        "700": "blue-700",
        "850": "blue-600/10",
        "hoverBg": "hover:bg-blue-700",
        "hoverText": "hover:text-blue-600",
        "hoverBorder": "hover:border-blue-600",
        "decoration": "decoration-blue-600/30",
        "bgGradient": "from-blue-50"
      }
    };
    const palette = data.paletaColor || "azul";
    return colorMap[palette]?.[key] || colorMap.azul[key] || "";
  };

  const toggleFaq = (index: number) => {
    setFaqExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Ayudante para renderizar iconos de Lucide
  const renderIcon = (iconName: string) => {
    return <MedicalIconRenderer name={iconName} className="w-5 h-5 shrink-0" />;
  };

  // Estado de Atención en Tiempo Real
  const liveStatus = getLiveConsultationStatus(data.horarios);
  const activeLandingStyle = getActiveLandingStyle(data.estiloLanding);

  return (
    <div id="preview-panel-container" className="bg-slate-100 rounded-2xl border border-slate-200 p-4 flex flex-col items-center h-full gap-4">
      
      {/* Controles del dispositivo y Badge de Estilo */}
      <div id="preview-controls-container" className="w-full flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Vista Previa
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <span className="text-slate-400 font-normal">Estilo:</span>
            {activeLandingStyle.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="btn-preview-mobile"
            onClick={() => setDevice("mobile")}
            className={`p-2 rounded-lg transition-all ${
              device === "mobile" 
                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            title="Vista Móvil (Enfoque Mobile-First)"
            aria-label="Cambiar a vista móvil"
          >
            <Smartphone className="w-5 h-5" />
          </button>
          <button
            id="btn-preview-desktop"
            onClick={() => setDevice("desktop")}
            className={`p-2 rounded-lg transition-all ${
              device === "desktop" 
                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            title="Vista Escritorio (Desktop)"
            aria-label="Cambiar a vista escritorio"
          >
            <Monitor className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Área de la Vista Previa con Inyección Dinámica de Estilo */}
      <div 
        id="preview-viewport-wrapper"
        style={{
          fontFamily: activeLandingStyle.fontBody,
          letterSpacing: activeLandingStyle.variables["--landing-letter-spacing"]
        }}
        className={`transition-all duration-300 w-full overflow-y-auto bg-[#fafbfc] border border-slate-200/80 shadow-inner rounded-xl relative ${
          device === "mobile" 
            ? "max-w-[375px] h-[650px] scrollbar-thin" 
            : "max-w-full h-[650px]"
        }`}
      >
        {/* Inyección de estilos de tipografía, bordes y sombras para el Preview */}
        <style>{`
          #preview-viewport-wrapper h1, 
          #preview-viewport-wrapper h2, 
          #preview-viewport-wrapper h3, 
          #preview-viewport-wrapper h4, 
          #preview-viewport-wrapper .font-display {
            font-family: ${activeLandingStyle.fontDisplay} !important;
            letter-spacing: ${activeLandingStyle.variables["--landing-letter-spacing"]} !important;
          }
          #preview-viewport-wrapper p,
          #preview-viewport-wrapper span,
          #preview-viewport-wrapper button,
          #preview-viewport-wrapper input,
          #preview-viewport-wrapper label {
            font-family: ${activeLandingStyle.fontBody};
          }
          #preview-viewport-wrapper .rounded-3xl,
          #preview-viewport-wrapper .rounded-2xl,
          #preview-viewport-wrapper .rounded-\\[2\\.5rem\\] {
            border-radius: ${activeLandingStyle.variables["--landing-radius-lg"]} !important;
          }
          #preview-viewport-wrapper .rounded-xl {
            border-radius: ${activeLandingStyle.variables["--landing-radius"]} !important;
          }
          #preview-viewport-wrapper .rounded-lg {
            border-radius: ${activeLandingStyle.variables["--landing-radius-sm"]} !important;
          }
          #preview-viewport-wrapper .shadow-xl,
          #preview-viewport-wrapper .shadow-2xl,
          #preview-viewport-wrapper .shadow-lg {
            box-shadow: ${activeLandingStyle.variables["--landing-shadow"]} !important;
          }
        `}</style>

        <AnimatePresence mode="wait">
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="min-h-full flex flex-col"
          >
            {/* LANDING PAGE MÉDICA INTEGRAL */}
            {/* HEADER / NAV */}
        <header id="preview-landing-header" className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            {data.logoUrl && (
              <img 
                src={data.logoUrl} 
                alt="Logo Especialista" 
                className="max-h-9 max-w-[90px] sm:max-h-10 sm:max-w-[120px] object-contain bg-transparent shrink-0"
              />
            )}
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold text-slate-950 flex items-center gap-1.5 font-display tracking-tight">
                {!data.logoUrl && <span className={`w-2.5 h-2.5 rounded-full bg-${getC("600")}`}></span>}
                {data.nombreMedico}
              </span>
              <span className={`text-[11px] sm:text-xs text-${getC("600")} font-bold uppercase tracking-wider`}>{data.especialidad}</span>
            </div>
          </div>
          <a 
            href="#agendar-preview" 
            aria-label="Agendar Cita"
            title="Agendar Cita"
            className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all text-center shrink-0 hover:scale-105"
          >
            <Calendar className="w-5 h-5 shrink-0" />
          </a>
        </header>

        {/* HERO SECTION - LO PRIMERO TRAS EL MENÚ: LOGO Y FOTO 1:1 */}
        <section id="preview-landing-hero" className={`px-5 sm:px-8 py-8 sm:py-12 bg-gradient-to-br from-${getC("50")} via-white to-[#fcfdfd] border-b border-slate-100 flex flex-col gap-6 text-center sm:text-left`}>
          
          {/* LOGOTIPO CON FONDO TRANSPARENTE (ARRIBA DE LA FOTO) */}
          {data.logoUrl && (
            <div className="flex justify-center items-center w-full pt-1 pb-1">
              <img 
                src={data.logoUrl} 
                alt={`Logotipo ${data.nombreMedico}`} 
                className="max-h-16 sm:max-h-20 max-w-[240px] sm:max-w-[280px] object-contain bg-transparent filter drop-shadow-xs"
              />
            </div>
          )}

          {/* FOTO PROFESIONAL EN RELACIÓN DE ASPECTO 1:1 (CUADRADA) */}
          <div className="relative w-full max-w-[300px] sm:max-w-[360px] mx-auto aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 group">
            <img 
              src={data.fotoUrl} 
              alt={data.nombreMedico} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent text-white flex items-end justify-between text-left">
              <div>
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-${getC("100")}`}>Cédula Profesional</span>
                <p className="text-xs sm:text-sm font-extrabold">{data.cedulaProfesional}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3 h-3" /> Verificado
              </span>
            </div>
          </div>

          {/* Badges de Confianza y Horario de Atención en Tiempo Real */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-${getC("100")}/90 text-${getC("700")} text-xs font-extrabold uppercase tracking-wide shadow-2xs`}>
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Consulta Médica Certificada
            </div>

            {/* Badge de Horario en Vivo (Abierto / Cerrado ahora) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-800">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-400' : liveStatus.dotColor === 'amber' ? 'bg-amber-400' : 'bg-slate-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-500' : liveStatus.dotColor === 'amber' ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
              </span>
              <span>{liveStatus.badgeText}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium text-[11px]">{liveStatus.badgeDetail}</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 leading-tight tracking-tight">
              Atención de primer nivel en <span className={`text-${getC("600")}`}>{data.especialidad}</span> en <span className={`underline ${getC("decoration")}`}>{data.ciudad}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-700 mt-4 leading-relaxed font-normal">
              {data.filosofia} Recupera tu salud de la mano de un especialista con amplia trayectoria clínica.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3.5 w-full">
            <a 
              href="#agendar-preview" 
              className={`w-[80%] max-w-md bg-${getC("600")} text-white py-4 px-6 rounded-2xl text-sm sm:text-base font-extrabold text-center shadow-md hover:bg-${getC("700")} hover:shadow-lg transition-all flex items-center justify-center gap-2.5`}
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Agendar Consulta</span>
            </a>
            <a 
              href={`tel:${data.telefonoGBP}`} 
              className="w-[80%] max-w-md bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 py-4 px-6 rounded-2xl text-sm sm:text-base font-extrabold text-center transition-all flex items-center justify-center gap-2.5 shadow-2xs"
            >
              <Phone className="w-5 h-5 text-slate-600 shrink-0" />
              <span>Llamar al Consultorio</span>
            </a>
          </div>
        </section>

        {/* NOSOTROS / ACERCA DE */}
        <section id="preview-landing-nosotros" className="p-6 sm:p-8 bg-white space-y-6 text-left">
          <div className="space-y-2.5">
            <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} px-2.5 py-1 rounded-md inline-block`}>Sobre el Especialista</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight">Trayectoria Clínica y Formación Científica</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {data.biografiaCurta}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 py-5 border-y border-slate-200/80 text-center bg-slate-50/50 rounded-xl">
            <div>
              <p className={`text-2xl sm:text-3xl font-extrabold text-${getC("600")}`}>+{data.anosExperiencia}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5">Años Exp.</p>
            </div>
            <div>
              <p className={`text-2xl sm:text-3xl font-extrabold text-${getC("600")}`}>100%</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5">Certificado</p>
            </div>
            <div>
              <p className={`text-2xl sm:text-3xl font-extrabold text-${getC("600")}`}>4.9/5</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5">Pacientes</p>
            </div>
          </div>

          {/* Hospitales y Certificaciones */}
          <div className="space-y-4 pt-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Hospitales de Operación & Certificados</h3>
            <div className="space-y-2.5">
              {data.hospitalesdondeOpera.map((hosp, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{hosp}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Asociaciones Médicas</span>
              <ul className="space-y-2">
                {data.asociaciones.map((asoc, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <Award className={`w-4 h-4 text-${getC("600")} shrink-0 mt-0.5`} />
                    <span>{asoc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section id="preview-landing-servicios" className="p-6 sm:p-8 bg-slate-50 space-y-5 text-left">
          <div className="text-center pb-2">
            <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("100")}/80 px-3 py-1 rounded-full`}>Tratamientos ({data.servicios.length})</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2">Procedimientos Especializados</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">Procedimientos diseñados con precisión y el más alto rigor clínico.</p>
          </div>

          <div className={`grid ${device === "desktop" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            {data.servicios.map((srv, idx) => (
              <div key={srv.id || idx} className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex gap-3.5 hover:border-blue-300 hover:shadow-sm transition-all group">
                <div className={`p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0 h-11 w-11 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                  {renderIcon(srv.icono)}
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-950 leading-snug">{srv.titulo}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{srv.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CASOS COMPARATIVOS - SLIDERS INTERACTIVOS */}
        {data.casosAntesDespues && data.casosAntesDespues.length > 0 && (
          <section id="preview-landing-casos" className="p-6 sm:p-8 bg-white space-y-5 text-left">
            <div className="text-center pb-2">
              <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
                {data.casosAntesDespues.length} Casos Clínicos
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2">Evolución Médica Real</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">Arrastra o haz clic en el slider de cualquier caso para comparar resultados:</p>
            </div>

            <div className={`grid ${device === "desktop" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
              {data.casosAntesDespues.map((caso, idx) => (
                <ClinicalBeforeAfterSliderItem
                  key={caso.id || idx}
                  caso={caso}
                  idx={idx}
                  primaryColorClass={getC("600")}
                />
              ))}
            </div>
          </section>
        )}

        {/* FAQs ACORDEÓN */}
        {data.faqs && data.faqs.length > 0 && (
          <section id="preview-landing-faq" className="p-6 sm:p-8 bg-slate-50 space-y-5 text-left">
            <div className="text-center pb-2">
              <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("100")}/80 px-3 py-1 rounded-full`}>
                Preguntas Frecuentes ({data.faqs.length})
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2">Dudas de la Consulta</h2>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {data.faqs.map((faq, i) => {
                const isExpanded = !!faqExpanded[i];
                return (
                  <div key={faq.id || i} className="py-3.5">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="flex items-center justify-between w-full text-left font-bold text-xs sm:text-sm text-slate-950 focus:outline-none cursor-pointer gap-2"
                      aria-expanded={isExpanded}
                      aria-controls={`preview-faq-ans-${i}`}
                    >
                      <span>{faq.pregunta}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isExpanded ? "rotate-180 text-blue-600" : ""}`} />
                    </button>
                    {isExpanded && (
                      <div id={`preview-faq-ans-${i}`} className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                        <p>{faq.respuesta}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* OPINIONES / RESEÑAS & WIDGET GOOGLE MAPS */}
        {((data.resenas && data.resenas.length > 0) || (data.habilitarGoogleReviewsWidget ?? true)) && (
          <section id="resenas" className="p-6 sm:p-8 md:p-10 bg-slate-50/50 space-y-6 text-left border-t border-slate-200/70" aria-label="Opiniones y testimonios de pacientes">
            <div className="text-center max-w-xl mx-auto space-y-2 pb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 uppercase tracking-widest bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                Prueba Social & Reputación
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Qué opinan los pacientes</h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Opiniones y testimonios de pacientes atendidos en <strong>{data.ciudad || "Ecuador"}</strong>.
              </p>
            </div>

            {/* WIDGET GOOGLE REVIEWS (GOOGLE BUSINESS PROFILE / GOOGLE MAPS) */}
            {(data.habilitarGoogleReviewsWidget ?? true) && (
              <div id="google-reviews-widget-preview" className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Bloque Izquierdo: Logotipo Google + Calificación + Contador */}
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">Google Business Profile</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" /> Perfil Verificado
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-slate-950 tabular-nums">{data.googleReviewsRating ?? 4.9}</span>
                        <div className="flex text-amber-400 text-xs sm:text-sm tracking-tighter">
                          {"★★★★★"}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          ({data.googleReviewsTotalCount ?? 148} opiniones verificadas)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción minimalista */}
                  {data.googleMapsReviewsUrl && (
                    <a
                      href={data.googleMapsReviewsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold shadow-2xs hover:border-slate-300 transition-all shrink-0 self-start md:self-auto"
                    >
                      <span>Ver ficha en Google Maps</span>
                      <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    </a>
                  )}
                </div>

                {/* Place ID Badge (si está configurado) */}
                {data.googlePlaceId && (
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 font-mono">
                    <span className="truncate">Place ID: <strong className="text-slate-800">{data.googlePlaceId}</strong></span>
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">Ecuador GBP</span>
                  </div>
                )}
              </div>
            )}

            {/* LISTA DE OPINIONES EN CUADRÍCULA RESPONSIVA OPTIMIZADA CON CSS GRID MINMAX */}
            {data.resenas && data.resenas.length > 0 && (
              <div 
                id="resenas-grid"
                className="grid gap-4 sm:gap-5 items-stretch"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))"
                }}
              >
                {data.resenas.map((res, idx) => {
                  const starsCount = Math.max(1, Math.min(5, Number(res.estrellas) || 5));
                  return (
                    <div 
                      key={res.id || idx} 
                      className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between h-full group"
                    >
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span 
                                key={i} 
                                className={`text-sm font-bold ${i < starsCount ? "text-amber-400" : "text-slate-200"}`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs font-bold text-slate-700 ml-1.5">{starsCount}.0</span>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verificado
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col justify-start my-1">
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic font-normal">"{res.comentario}"</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3.5 border-t border-slate-100 mt-3.5 shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate pr-2">{res.paciente || "Paciente"}</span>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">{res.fecha || "Reciente"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* AGENDAR Y MAPA (Contacto) */}
        <section id="agendar-preview" className="p-6 sm:p-8 bg-white border-t border-slate-200/70 space-y-6 text-left">
          <div className="space-y-1.5">
            <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} px-2.5 py-1 rounded-md inline-block`}>Contacto Directo</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">Agenda tu Valoración</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* NAP Info */}
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-slate-950">Ubicación física (NAP)</p>
                <address className="not-italic text-slate-600 mt-0.5 leading-relaxed text-xs sm:text-sm">
                  <strong>{data.nombreClinicaGBP}</strong><br />
                  {data.direccionFisica}, CP {data.codigoPostal}, {data.ciudad}
                </address>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-slate-950">Teléfono (NAP)</p>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">{data.telefonoGBP}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <p className="font-extrabold text-slate-950">Horarios Clínicos</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : liveStatus.dotColor === 'amber' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-500 animate-pulse' : liveStatus.dotColor === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                    {liveStatus.badgeText}
                  </span>
                </div>
                <ul className="text-slate-600 text-xs space-y-1">
                  <li className="flex items-center justify-between py-0.5 border-b border-slate-100">
                    <span className="font-medium text-slate-500">Lunes a Viernes:</span>
                    <span className="font-bold text-slate-800">{data.horarios.semana.replace(/^Lunes a Viernes:\s*/i, '')}</span>
                  </li>
                  <li className="flex items-center justify-between py-0.5 border-b border-slate-100">
                    <span className="font-medium text-slate-500">Sábados:</span>
                    <span className="font-bold text-slate-800">{data.horarios.sabado.replace(/^Sábado:\s*/i, '')}</span>
                  </li>
                  <li className="flex items-center justify-between py-0.5">
                    <span className="font-medium text-slate-500">Domingos:</span>
                    <span className="font-bold text-slate-800">{data.horarios.domingo.replace(/^Domingo:\s*/i, '')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tarifa de Consulta y Métodos de Pago Aceptados */}
          <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-slate-50 border border-emerald-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">Valor de la Consulta</span>
                  <span className="text-xl font-black text-slate-900">{data.precioConsulta || "$50 USD"}</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                Tarifa Transparente
              </span>
            </div>

            <div className="border-t border-slate-100/90 pt-2.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block mb-1.5">
                Métodos de pago aceptados:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(data.metodosPago || ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"]).map((mp, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    {mp.toLowerCase().includes("efectivo") && <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    {mp.toLowerCase().includes("transferencia") && <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    {mp.toLowerCase().includes("tarjeta") && <CreditCard className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                    <span>{mp}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mini Formulario Interactivo de Agendamiento */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl bg-${getC("100")} text-${getC("700")} flex items-center justify-center shrink-0`}>
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Selecciona el día de tu cita médica</h4>
                <p className="text-[11px] text-slate-500">Elige la fecha y horario preferido para coordinar tu atención.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Selector de Fecha */}
              <div className="flex flex-col gap-1">
                <label htmlFor="preview-booking-date" className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fecha preferida</span>
                </label>
                <input
                  id="preview-booking-date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50/60 font-semibold text-slate-800"
                />
              </div>

              {/* Selector de Horario */}
              <div className="flex flex-col gap-1">
                <label htmlFor="preview-booking-time" className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Horario preferido</span>
                </label>
                <select
                  id="preview-booking-time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50/60 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="09:00 AM">09:00 AM (Mañana)</option>
                  <option value="10:30 AM">10:30 AM (Mañana)</option>
                  <option value="12:00 PM">12:00 PM (Mediodía)</option>
                  <option value="03:00 PM">03:00 PM (Tarde)</option>
                  <option value="04:30 PM">04:30 PM (Tarde)</option>
                  <option value="06:00 PM">06:00 PM (Tarde/Noche)</option>
                </select>
              </div>
            </div>

            {/* Nombre opcional */}
            <div className="flex flex-col gap-1">
              <label htmlFor="preview-booking-name" className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Nombre del paciente (opcional)</span>
              </label>
              <input
                id="preview-booking-name"
                type="text"
                placeholder="ej. María Gómez"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50/60 font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Botones de Agenda */}
          <div className="flex flex-col items-center gap-3.5 pt-1 w-full">
            <a 
              href={getDynamicWhatsAppUrl()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-[80%] max-w-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-extrabold py-4 px-6 rounded-2xl text-center flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>Agendar por WhatsApp</span>
            </a>
            <a 
              href={data.doctoraliaUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`w-[80%] max-w-md bg-${getC("600")} hover:bg-${getC("700")} text-white text-sm sm:text-base font-extrabold py-4 px-6 rounded-2xl text-center flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all`}
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Agendar en Doctoralia</span>
            </a>
          </div>

          {/* Mapa de Mock con Iframe de Google Maps */}
          <div className="w-full h-52 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative shadow-xs">
            <iframe 
              title="Preview Google Map"
              className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-300" 
              src={`https://maps.google.com/maps?q=${data.latitud},${data.longitud}&hl=es&z=14&amp;output=embed`}
              loading="lazy"
            ></iframe>
          </div>
        </section>

        {/* 1. ASEGURADORAS Y CONVENIOS (AL FINAL, ARRIBA DEL PIE DE PÁGINA) */}
        {data.aseguradoras && data.aseguradoras.length > 0 && (
          <section id="preview-landing-eeat" className="py-8 px-5 sm:px-8 bg-slate-50 border-t border-slate-200/80 text-center space-y-4">
            <div className="space-y-1">
              <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("100")} px-3 py-1 rounded-full inline-block`}>
                Cobertura Médica & Convenios
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Aseguradoras y Planes Médicos Aceptados
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Atención con cobertura directa o reembolso con las principales compañías aseguradoras médicas.
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-2 pt-1 max-w-3xl mx-auto">
              {data.aseguradoras.map((aseg, i) => (
                <span key={i} className={`text-xs font-bold px-3.5 py-1.5 rounded-full bg-white text-${getC("700")} border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex items-center gap-1.5`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {aseg}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 2. CANALES PRINCIPALES DE REDES SOCIALES (ABAJO DE ASEGURADORAS Y ARRIBA DEL FOOTER) */}
        <section id="preview-landing-social-channels" className="py-8 px-5 sm:px-8 bg-slate-900 text-white border-t border-slate-800 text-center space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Canales Oficiales del Especialista
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Redes Sociales y Contacto Directo
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Conéctate y sigue las publicaciones médicas, artículos de salud y consultas en nuestras plataformas oficiales.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-2 max-w-xl mx-auto">
            {/* WhatsApp */}
            <a
              href={data.whatsappUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              title="WhatsApp Oficial"
              className="w-12 h-12 rounded-2xl bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.53 1.771.815 2.796.815 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.767-5.768-5.767zm3.385 8.169c-.144.405-.837.774-1.17.824-.312.045-.694.077-2.228-.557-1.782-.738-2.909-2.553-2.997-2.671-.088-.118-.72-1.026-.72-1.956 0-.93.486-1.387.659-1.579.173-.191.381-.239.508-.239.127 0 .254.001.365.006.118.006.275-.045.431.33.161.385.55 1.341.599 1.439.048.098.081.213.016.342-.066.129-.098.21-.196.326-.098.116-.207.26-.296.349-.099.098-.202.205-.087.402.115.197.511.843 1.096 1.364.754.672 1.389.88 1.587.978.197.098.313.082.427-.049.115-.131.492-.574.623-.77.131-.197.262-.164.443-.098.181.066 1.147.541 1.344.64.197.098.328.147.377.23.049.082.049.475-.095.88z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={data.facebookUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Página de Facebook"
              title="Facebook Oficial"
              className="w-12 h-12 rounded-2xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href={data.instagramUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Perfil de Instagram"
              title="Instagram Oficial"
              className="w-12 h-12 rounded-2xl bg-pink-500/20 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-600 text-pink-300 hover:text-white border border-pink-500/40 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a
              href={data.tiktokUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Perfil de TikTok"
              title="TikTok Oficial"
              className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.126V9.4a6.33 6.33 0 0 0-.87-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.48c.18-.18.34-.37.49-.57V10.7a8.28 8.28 0 0 0 5.28 1.93v-3.45a4.84 4.84 0 0 1-3.23-.97c-.01-.01-.02-.02-.04-.03l3.27-1.49z"/>
              </svg>
            </a>

            {/* Correo Electrónico */}
            <a
              href={`mailto:${data.emailContacto || "contacto@consultoriomedico.com"}`}
              aria-label="Enviar Correo Electrónico"
              title="Enviar Correo Electrónico"
              className="w-12 h-12 rounded-2xl bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
            >
              <Mail className="w-5 h-5 text-amber-300 group-hover:text-white transition-transform group-hover:scale-110" />
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="p-6 bg-slate-950 text-slate-400 text-left text-xs space-y-4">
          <div className="space-y-1">
            <p className="text-white font-bold text-sm sm:text-base">{data.nombreMedico}</p>
            <p className="text-slate-400">{data.especialidad} en {data.ciudad}</p>
          </div>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-1.5 text-slate-500 text-xs">
            <p>&copy; 2026 {data.nombreMedico}. Todos los derechos reservados.</p>
            <p>Cédula Profesional: {data.cedulaProfesional}</p>
            <p className="text-blue-400/90 font-medium">Landing Page Médica Marca Blanca y PWA.</p>
          </div>
        </footer>
        
        {/* Chatbot Virtual */}
        <ChatbotWidget data={data} getC={getC} />

        {/* MENÚ INFERIOR MÓVIL STICKY MEJORADO (Barra de Navegación Ergonómica con Iconos de Alto Contraste y Estados de Color Distintivos) */}
        {device === "mobile" && (
          <nav 
            aria-label="Navegación Móvil Rápida"
            className="sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 py-2 px-2.5 flex justify-around items-center z-30 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] shrink-0"
          >
            {/* Inicio (Azul Zafiro) */}
            <a 
              href="#preview-landing-hero" 
              className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 transition-all duration-200 transform active:scale-95 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 border border-blue-200/70 flex items-center justify-center shadow-xs group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200">
                <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-extrabold tracking-tight">Inicio</span>
            </a>

            {/* Doctor (Índigo) */}
            <a 
              href="#preview-landing-nosotros" 
              className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/80 transition-all duration-200 transform active:scale-95 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-700 border border-indigo-200/70 flex items-center justify-center shadow-xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-200">
                <Award className="w-4 h-4 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-extrabold tracking-tight">Doctor</span>
            </a>

            {/* Servicios (Teal) */}
            <a 
              href="#preview-landing-servicios" 
              className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl text-slate-700 hover:text-teal-700 hover:bg-teal-50/80 transition-all duration-200 transform active:scale-95 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-100/80 text-teal-700 border border-teal-200/70 flex items-center justify-center shadow-xs group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all duration-200">
                <Stethoscope className="w-4 h-4 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-extrabold tracking-tight">Servicios</span>
            </a>

            {/* Opiniones (Ámbar) */}
            <a 
              href="#preview-landing-resenas" 
              className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl text-slate-700 hover:text-amber-700 hover:bg-amber-50/80 transition-all duration-200 transform active:scale-95 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 border border-amber-200/70 flex items-center justify-center shadow-xs group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all duration-200">
                <Star className="w-4 h-4 transition-transform group-hover:scale-110 fill-current" />
              </div>
              <span className="text-[10px] font-extrabold tracking-tight">Opiniones</span>
            </a>

            {/* Agendar Cita (Verde Esmeralda) */}
            <a 
              href="#agendar-preview" 
              className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl bg-emerald-500/15 border border-emerald-300 text-emerald-800 shadow-xs hover:bg-emerald-600 hover:text-white transition-all duration-200 transform active:scale-95 group cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                <Calendar className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                </span>
              </div>
              <span className="text-[10px] font-black tracking-tight">Cita</span>
            </a>
          </nav>
        )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
