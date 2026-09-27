/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { MedicalLandingData, BeforeAfterCase, PatientGuideItem, BlogPostItem, ServiceItem, DEFAULT_SECTION_ORDER } from "../types";
import { PatientGuideModal } from "./PatientGuideModal";
import { ServiceDetailModal } from "./ServiceDetailModal";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, 
  Tablet,
  Monitor, 
  Stethoscope, 
  Activity, 
  HeartPulse, 
  Check, 
  ChevronDown, 
  ChevronLeft,
  MapPin, 
  Phone,
  PhoneCall, 
  Clock, 
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Award,
  GraduationCap,
  Trophy,
  ThumbsUp,
  Sparkles,
  Syringe,
  Eye,
  Thermometer,
  FileText,
  FileDown,
  Download,
  Lock,
  Pill,
  Scissors,
  Cross,
  Brain,
  Smile,
  Microscope,
  Mail,
  Share2,
  QrCode,
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
  UserCheck,
  X,
  Menu,
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  Search,
  Copy,
  SlidersHorizontal,
  ExternalLink as ExternalLinkIcon,
  Play,
  Video,
  BookOpen,
  Film,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  RefreshCw,
  Target,
  HeartHandshake,
  Compass,
  Bot,
  Send,
  ImageIcon
} from "lucide-react";
import { MedicalAiAssistantFaq } from "./MedicalAiAssistantFaq";
import { getActiveColorScale, generateScaleFromHex } from "../utils/colorUtils";
import { MedicalIconRenderer } from "./MedicalIconRenderer";
import { getLiveConsultationStatus } from "../utils/scheduleUtils";
import { getActiveLandingStyle, getDynamicGoogleFontsUrl } from "../utils/stylePresets";
import { slugifyMedicalService, normalizeDomainUrl, generateHtmlFile } from "../utils/generators";

const TypewriterText = ({ text, className }: { text: string; className?: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    if (!text) return;

    let index = 0;
    const speed = 25; // escritura rápida
    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setTimeout(() => setIsTyping(false), 600);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 sm:h-4 bg-current ml-1 animate-pulse rounded-xs align-middle opacity-85" />
      )}
    </span>
  );
};

interface PreviewPanelProps {
  data: MedicalLandingData;
  onOpenExternalPreview?: () => void;
  onForceRefresh?: () => void;
  key?: React.Key;
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
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">{caso.titulo}</h3>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">{caso.descripcion}</p>
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
          src={caso.imgAfter || undefined} 
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
            src={caso.imgBefore || undefined} 
            alt={`Estado Antes - ${caso.titulo}`} 
            className="absolute inset-0 w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-2.5 left-2.5 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-xs pointer-events-auto">Antes</span>
        </div>

        <span className="absolute top-2.5 right-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-xs pointer-events-auto">Después</span>

        {/* Separador de Arrastre */}
        <div 
          id="before-after-slider"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="absolute top-0 bottom-0 w-0.5 bg-white flex items-center justify-center cursor-ew-resize shadow-lg z-20 group/slider-handle"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        >
          {/* Anillo exterior con pulso / brillo animado */}
          <span className="absolute w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-500/30 animate-ping opacity-75 pointer-events-none" />
          <span className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-400/30 to-blue-500/20 animate-pulse pointer-events-none blur-xs" />

          {/* Botón principal del manipulador con borde reluciente */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-blue-600 shadow-xl flex items-center justify-center border-2 border-blue-500/90 group-hover/slider-handle:border-blue-600 group-hover/slider-handle:scale-110 active:scale-95 transition-all duration-300 pointer-events-none ring-4 ring-blue-500/25 group-hover/slider-handle:ring-blue-500/50">
            {/* Flechas animadas parpadeando horizontalmente */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 4 4 4m8 0l4-4-4-4" />
            </svg>
          </div>

          {/* Indicador flotante animado de indicación de arrastre */}
          <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-slate-900/95 text-white text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-xs shadow-md border border-white/20 whitespace-nowrap opacity-90 group-hover/slider-handle:opacity-100 transition-opacity pointer-events-none animate-bounce flex items-center gap-1">
            <span>◄ Arrastra ►</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/// Sub-componente interactivo de Carrusel de Fotos de Instalaciones para el Live Preview
interface ClinicGalleryPreviewCarouselProps {
  photos: { id: string; url: string; titulo?: string; descripcion?: string }[];
  primaryColorClass: string;
  getC: (key: string) => string;
  subtituloInstalaciones?: string;
  tituloInstalaciones?: string;
  descripcionInstalaciones?: string;
  isClinica?: boolean;
  isMerged?: boolean;
}

const ClinicGalleryPreviewCarousel: React.FC<ClinicGalleryPreviewCarouselProps> = ({ 
  photos, 
  primaryColorClass, 
  getC,
  subtituloInstalaciones,
  tituloInstalaciones,
  descripcionInstalaciones,
  isClinica = false,
  isMerged = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activePhotos = photos && photos.length > 0 ? photos : [
    {
      id: "foto-cons-1",
      url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
      titulo: "Recepción y Sala de Espera",
      descripcion: "Espacio moderno, climatizado y diseñado para la comodidad de los pacientes."
    },
    {
      id: "foto-cons-2",
      url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
      titulo: "Consultorio de Atención Privada",
      descripcion: "Ambiente confidencial y confortable para valoraciones médicas detalladas."
    },
    {
      id: "foto-cons-3",
      url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
      titulo: "Área de Evaluación Diagnóstica",
      descripcion: "Tecnología médica avanzada e instrumental clínico de máxima precisión."
    }
  ];

  const total = activePhotos.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const currentPhoto = activePhotos[currentIndex] || activePhotos[0];

  const carouselBody = (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Cabecera de la Sección con Espaciado Generoso */}
      <div className="pb-2 border-b border-slate-200/60">
        <div className="max-w-xl">
          <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-3 py-1 rounded-full inline-block mb-2`}>
            {subtituloInstalaciones || "Instalaciones & Tecnología"}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
            {tituloInstalaciones || (isClinica ? "Espacios e Instalaciones Médicas" : "Espacios Diseñados para tu Bienestar")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            {descripcionInstalaciones || "Conoce nuestro consultorio, salas de atención e instrumental médico preparado bajo los más estrictos protocolos clínicos."}
          </p>
        </div>
      </div>

      {/* Tarjeta Principal del Carrusel (Formato 5:4) - Imagen Limpia */}
      <div className="relative max-w-2xl mx-auto w-full aspect-[5/4] rounded-2xl overflow-hidden shadow-md border border-slate-200/90 bg-slate-900 group">
        <img
          src={currentPhoto.url || undefined}
          alt={currentPhoto.titulo || `Instalación ${currentIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Botones Flotantes Superpuestos */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
          aria-label="Foto siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dots de Navegación */}
        <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 z-20 flex items-center gap-1 sm:gap-1.5 bg-slate-950/60 backdrop-blur-xs px-2 sm:px-2.5 py-1 rounded-full border border-white/10 max-w-[85%] overflow-x-auto no-scrollbar">
          {activePhotos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all shrink-0 ${idx === currentIndex ? 'w-4 sm:w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Ir a foto ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Título y Descripción FUERA de la Imagen */}
      <div className={`max-w-2xl mx-auto mt-3 sm:mt-4 p-4 sm:p-5 rounded-2xl ${isMerged ? 'bg-slate-50' : 'bg-white'} border border-slate-200/90 shadow-2xs text-left space-y-1.5`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-950 leading-snug tracking-tight">
            {currentPhoto.titulo || `Área Clínica ${currentIndex + 1}`}
          </h3>
          <span className="text-xs sm:text-sm font-extrabold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full shrink-0 shadow-2xs">
            {currentIndex + 1} de {total}
          </span>
        </div>
        {currentPhoto.descripcion && (
          <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed font-medium pt-0.5">
            {currentPhoto.descripcion}
          </p>
        )}
      </div>

    </div>
  );

  if (isMerged) {
    return (
      <div id="preview-landing-instalaciones" className="pt-8 mt-6 border-t border-slate-200/80 text-left">
        {carouselBody}
      </div>
    );
  }

  return (
    <section id="preview-landing-instalaciones" className="py-10 px-4 sm:px-8 bg-slate-50/90 border-y border-slate-200/80 text-left">
      {carouselBody}
    </section>
  );
};

interface ReviewsInteractiveCarouselProps {
  resenas: { id: string; paciente: string; estrellas: number; comentario: string; fecha: string }[];
  getC: (key: string) => string;
}

const ReviewsInteractiveCarousel: React.FC<ReviewsInteractiveCarouselProps> = ({ resenas, getC }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1);
  const [activeDotIndex, setActiveDotIndex] = useState(0);

  const updateScrollStats = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollPosition(scrollLeft);
      setMaxScroll(scrollWidth - clientWidth);
      
      const scrollPercent = scrollLeft / (scrollWidth - clientWidth || 1);
      const index = Math.round(scrollPercent * (resenas.length - 1));
      setActiveDotIndex(index);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollStats, { passive: true });
      updateScrollStats();
      const ro = new ResizeObserver(() => updateScrollStats());
      ro.observe(el);
      return () => {
        el.removeEventListener("scroll", updateScrollStats);
        ro.disconnect();
      };
    }
  }, [resenas]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const amount = clientWidth * 0.85;
      const scrollTo = direction === "left" ? scrollLeft - amount : scrollLeft + amount;
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative group/carousel w-full">
      {/* Botones de navegación laterales (para pantallas con cursor) */}
      <div className="absolute top-1/2 -left-3 -translate-y-1/2 z-10 hidden md:block">
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={scrollPosition <= 5}
          className="p-3.5 rounded-full bg-white border border-slate-200/80 text-slate-700 shadow-md transition-all hover:bg-slate-50 disabled:opacity-0 disabled:pointer-events-none active:scale-95 cursor-pointer flex items-center justify-center hover:border-slate-300"
          aria-label="Opiniones anteriores"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-1/2 -right-3 -translate-y-1/2 z-10 hidden md:block">
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={scrollPosition >= maxScroll - 5}
          className="p-3.5 rounded-full bg-white border border-slate-200/80 text-slate-700 shadow-md transition-all hover:bg-slate-50 disabled:opacity-0 disabled:pointer-events-none active:scale-95 cursor-pointer flex items-center justify-center hover:border-slate-300"
          aria-label="Opiniones siguientes"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Contenedor de deslizamiento optimizado, libre de barras de desplazamiento molestas */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-5 pb-6 pt-2 scroll-smooth px-4 sm:px-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {resenas.map((res, idx) => {
          const starsCount = Math.max(1, Math.min(5, Number(res.estrellas) || 5));
          return (
            <div
              key={res.id || idx}
              className="snap-center shrink-0 w-[285px] xs:w-[310px] sm:w-[340px] lg:w-[350px] h-[215px] sm:h-[230px] p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group/card relative overflow-hidden"
            >
              {/* Símbolo decorativo de cita */}
              <span className="absolute top-2 right-4 text-7xl text-slate-100/80 font-serif select-none pointer-events-none transition-transform group-hover/card:scale-110 duration-500">
                “
              </span>

              <div className="flex-1 flex flex-col relative z-10">
                <div className="flex items-center justify-between gap-2 mb-3.5 shrink-0">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < starsCount ? "text-amber-400" : "text-slate-200"}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-1.5">{starsCount}.0</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verificado
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center my-0.5">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic font-normal line-clamp-4">
                    "{res.comentario}"
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-3 shrink-0 relative z-10">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate pr-2">
                  {res.paciente || "Paciente"}
                </span>
                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                  {res.fecha || "Reciente"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicadores de navegación elegantes para móvil */}
      {resenas.length > 1 && (
        <div className="flex justify-center items-center gap-2 pt-1">
          {resenas.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (scrollRef.current) {
                  const { scrollWidth, clientWidth } = scrollRef.current;
                  const itemWidth = scrollWidth / resenas.length;
                  scrollRef.current.scrollTo({
                    left: idx * itemWidth,
                    behavior: "smooth"
                  });
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === activeDotIndex ? "w-6 bg-slate-800" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
              aria-label={`Ir al testimonio ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PreviewPanel({ data, onOpenExternalPreview, onForceRefresh }: PreviewPanelProps) {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [shareModalGuide, setShareModalGuide] = useState<PatientGuideItem | null>(null);
  const [selectedBlogPostModal, setSelectedBlogPostModal] = useState<BlogPostItem | null>(null);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<ServiceItem | null>(null);
  const [showAllServicesInGrid, setShowAllServicesInGrid] = useState<boolean>(false);
  const [showAllFaqs, setShowAllFaqs] = useState<boolean>(false);
  const [selectedServiceForAppointment, setSelectedServiceForAppointment] = useState<string | null>(null);
  const [selectedGuideForDownload, setSelectedGuideForDownload] = useState<PatientGuideItem | null>(null);
  const [leadCaptureName, setLeadCaptureName] = useState<string>("");
  const [leadCaptureContact, setLeadCaptureContact] = useState<string>("");
  const [leadCaptureSubmitted, setLeadCaptureSubmitted] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const heroParallaxRef = useRef<HTMLDivElement>(null);

  const handleStartGuideDownload = (guide: PatientGuideItem) => {
    if (guide.requiereRegistro) {
      setSelectedGuideForDownload(guide);
      setLeadCaptureName("");
      setLeadCaptureContact("");
      setLeadCaptureSubmitted(false);
    } else {
      triggerDirectDownload(guide);
    }
  };

  const triggerDirectDownload = (guide: PatientGuideItem) => {
    // Si la guía especifica una ruta real en cPanel (ej. /descargas/mi-libro.pdf) o archivoUrl
    const cpanelOrUrl = guide.rutaCpanel || guide.archivoUrl;
    
    if (cpanelOrUrl && cpanelOrUrl.startsWith("http")) {
      window.open(cpanelOrUrl, "_blank");
    } else {
      // Descarga directa con fallback de archivo simulado para la previsualización
      const fileName = cpanelOrUrl ? cpanelOrUrl.split("/").pop() || `${guide.titulo}.pdf` : `${guide.titulo.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;
      const dummyContent = `%PDF-1.4\n% Guía Médica Oficial: ${guide.titulo}\n% Especialista: ${data.nombreMedico}\n% Clínica: ${data.nombreClinicaGBP || "Centro Médico Especializado"}\n% Ciudad: ${data.ciudad || "Ecuador"}\n% Fecha: ${new Date().toLocaleDateString()}\n% Este documento se aloja en la raíz de su servidor cPanel en: ${guide.rutaCpanel || "/descargas/"}`;
      const blob = new Blob([dummyContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setDownloadToast(`¡Descarga iniciada! "${guide.titulo}"`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleSubmitLeadCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCaptureName.trim() || !leadCaptureContact.trim()) return;

    setLeadCaptureSubmitted(true);
    if (selectedGuideForDownload) {
      triggerDirectDownload(selectedGuideForDownload);
    }

    setTimeout(() => {
      setSelectedGuideForDownload(null);
      setLeadCaptureSubmitted(false);
    }, 1500);
  };

  const handleOpenExternal = () => {
    if (onOpenExternalPreview) {
      onOpenExternalPreview();
    } else {
      try {
        const appUrl = data.dominioWeb || "https://tu-dominio.com";
        const fullHtml = generateHtmlFile(data, appUrl, "1.0");
        const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } catch (err) {
        console.error("Error al abrir vista previa externa:", err);
      }
    }
  };

  const isClinica = data.tipoEnfoqueLanding === "clinica";

  const isSectionVisible = (id: string) => {
    if (!data.ordenSecciones || data.ordenSecciones.length === 0) return true;
    const item = data.ordenSecciones.find(s => s.id === id);
    return item ? item.visible !== false : true;
  };

  const hasNosotros = isSectionVisible("eeat");
  const hasInstalaciones = data.fotosConsultorio && data.fotosConsultorio.length > 0 && isSectionVisible("galeria");
  const hasServicios = data.servicios && data.servicios.length > 0 && isSectionVisible("servicios");
  const hasRedesSociales = isSectionVisible("redes_sociales");
  const hasCasos = data.casosAntesDespues && data.casosAntesDespues.length > 0 && isSectionVisible("casos");
  const hasFaq = data.faqs && data.faqs.length > 0 && isSectionVisible("faqs");
  const hasResenas = data.resenas && data.resenas.length > 0 && isSectionVisible("opiniones");
  const hasBlog = data.blogPosts && data.blogPosts.length > 0 && isSectionVisible("blog");
  const hasGuias = data.guiasPacientes && data.guiasPacientes.length > 0 && isSectionVisible("guias");

  // Section order list from data or default
  const sectionOrderList = (data.ordenSecciones && data.ordenSecciones.length > 0)
    ? data.ordenSecciones
    : DEFAULT_SECTION_ORDER;

  // Active navigation items matching sectionOrderList order
  const activeNavs: { id: string; label: string; icon: string }[] = [];

  sectionOrderList.forEach(sec => {
    if (sec.visible === false) return;

    if (sec.id === "hero") {
      if (!activeNavs.some(item => item.id === "inicio")) {
        activeNavs.push({ id: "inicio", label: "Inicio", icon: "home" });
      }
    } else if (sec.id === "eeat" && (hasNosotros || hasInstalaciones)) {
      if (!activeNavs.some(item => item.id === "nosotros")) {
        activeNavs.push({ id: "nosotros", label: isClinica ? "Nosotros" : "Doctor", icon: "doctor" });
      }
    } else if (sec.id === "servicios" && hasServicios) {
      if (!activeNavs.some(item => item.id === "servicios")) {
        activeNavs.push({ id: "servicios", label: "Tratamientos", icon: "servicios" });
      }
    } else if (sec.id === "redes_sociales" && hasRedesSociales) {
      if (!activeNavs.some(item => item.id === "redes-sociales")) {
        activeNavs.push({ id: "redes-sociales", label: "Redes", icon: "video" });
      }
    } else if (sec.id === "casos" && hasCasos) {
      if (!activeNavs.some(item => item.id === "casos")) {
        activeNavs.push({ id: "casos", label: isClinica ? "Casos Clínicos" : "Mis casos", icon: "casos" });
      }
    } else if (sec.id === "opiniones" && hasResenas) {
      if (!activeNavs.some(item => item.id === "opiniones")) {
        activeNavs.push({ id: "opiniones", label: "Reseñas", icon: "opiniones" });
      }
    } else if (sec.id === "blog" && hasBlog) {
      if (!activeNavs.some(item => item.id === "blog")) {
        activeNavs.push({ id: "blog", label: "Blog", icon: "blog" });
      }
    } else if (sec.id === "guias" && hasGuias) {
      if (!activeNavs.some(item => item.id === "guias")) {
        activeNavs.push({ id: "guias", label: "Guías", icon: "guias" });
      }
    } else if (sec.id === "horarios_ubicacion" || sec.id === "tarifas") {
      if (!activeNavs.some(item => item.id === "contacto")) {
        activeNavs.push({ id: "contacto", label: "Cita", icon: "cita" });
      }
    } else if (sec.id === "faqs" && hasFaq) {
      if (!activeNavs.some(item => item.id === "faqs")) {
        activeNavs.push({ id: "faqs", label: "Asistente", icon: "faq" });
      }
    }
  });

  if (!activeNavs.some(item => item.id === "contacto")) {
    activeNavs.push({ id: "contacto", label: "Cita", icon: "cita" });
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "home": return Home;
      case "doctor": return Award;
      case "servicios": return Stethoscope;
      case "video": return Video;
      case "casos": return Activity;
      case "clinica": return Building2;
      case "opiniones": return Star;
      case "faq": return HelpCircle;
      case "blog": return FileText;
      case "guias": return BookOpen;
      case "cita": return Calendar;
      default: return Home;
    }
  };

  // Dynamic scroll observer to highlight current section in real time in strict sequential order
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const getNavElement = (id: string): HTMLElement | null => {
      switch (id) {
        case "inicio":
          return viewport.querySelector("#preview-landing-header") || viewport.querySelector("#inicio");
        case "nosotros":
          return viewport.querySelector("#preview-landing-nosotros") || viewport.querySelector("#nosotros");
        case "servicios":
          return viewport.querySelector("#preview-landing-servicios") || viewport.querySelector("#servicios");
        case "redes-sociales":
          return viewport.querySelector("#preview-landing-redes-sociales") || viewport.querySelector("#redes-sociales");
        case "casos":
          return viewport.querySelector("#preview-landing-casos") || viewport.querySelector("#casos");
        case "opiniones":
          return viewport.querySelector("#resenas") || viewport.querySelector("#preview-landing-resenas") || viewport.querySelector("#opiniones");
        case "blog":
          return viewport.querySelector("#preview-landing-blog") || viewport.querySelector("#blog");
        case "guias":
          return viewport.querySelector("#preview-landing-guias") || viewport.querySelector("#guias-pacientes");
        case "contacto":
          return viewport.querySelector("#agendar-preview") || viewport.querySelector("#agendar");
        case "faqs":
          return viewport.querySelector("#preview-landing-faq") || viewport.querySelector("#faq");
        default:
          return null;
      }
    };

    const handleScroll = () => {
      const scrollTop = viewport.scrollTop;
      setIsScrolled(scrollTop > 40);

      // Si el usuario está al principio del contenedor
      if (scrollTop < 80) {
        if (activeNavs.length > 0) {
          setActiveSection(activeNavs[0].id);
        }
        return;
      }

      // Si el usuario llegó al fondo del contenedor (últimos 90px)
      const scrollRemaining = viewport.scrollHeight - scrollTop - viewport.clientHeight;
      if (scrollRemaining < 90 && activeNavs.length > 0) {
        setActiveSection(activeNavs[activeNavs.length - 1].id);
        return;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const focalLine = viewportRect.top + 160;

      // Obtener todos los elementos nav activos que existen en el DOM en su orden secuencial
      const resolvedSections = activeNavs
        .map(nav => ({ id: nav.id, element: getNavElement(nav.id) }))
        .filter((item): item is { id: string; element: HTMLElement } => item.element !== null);

      if (resolvedSections.length === 0) return;

      // Buscar la última sección cuyo borde superior ya cruzó la línea focal de lectura
      let currentActiveId = resolvedSections[0].id;

      for (const sec of resolvedSections) {
        const rect = sec.element.getBoundingClientRect();
        if (rect.top <= focalLine) {
          currentActiveId = sec.id;
        }
      }

      setActiveSection(currentActiveId);

      // Parallax sutil en desktop
      if (heroParallaxRef.current) {
        if (viewport.offsetWidth >= 1024) {
          const scrolled = viewport.scrollTop;
          if (scrolled < 1200) {
            heroParallaxRef.current.style.transform = `translateY(${scrolled * 0.08}px)`;
          }
        } else {
          heroParallaxRef.current.style.transform = "";
        }
      }
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    const initTimeout = setTimeout(handleScroll, 100);

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      clearTimeout(initTimeout);
    };
  }, [device, data, activeNavs]);

  // Smooth scroll handler inside the scrollable container viewport
  const scrollToSection = (sectionId: string) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setMobileMenuOpen(false);

    let selector = "";
    if (sectionId === "inicio") selector = "#preview-landing-header, #inicio";
    else if (sectionId === "nosotros") selector = "#preview-landing-nosotros, #nosotros";
    else if (sectionId === "servicios") selector = "#preview-landing-servicios, #servicios";
    else if (sectionId === "redes-sociales") selector = "#preview-landing-redes-sociales, #redes-sociales";
    else if (sectionId === "casos") selector = "#preview-landing-casos, #casos";
    else if (sectionId === "instalaciones") selector = "#preview-landing-instalaciones";
    else if (sectionId === "opiniones" || sectionId === "resenas") selector = "#resenas, #preview-landing-resenas, #opiniones";
    else if (sectionId === "blog") selector = "#preview-landing-blog, #blog";
    else if (sectionId === "guias") selector = "#preview-landing-guias, #guias-pacientes";
    else if (sectionId === "contacto") selector = "#agendar-preview, #agendar";
    else if (sectionId === "faqs") selector = "#preview-landing-faq, #faq";

    const element = viewport.querySelector<HTMLElement>(selector);
    if (element) {
      const containerTop = viewport.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const relativeTop = elementTop - containerTop;
      
      viewport.scrollTo({
        top: viewport.scrollTop + relativeTop - 2,
        behavior: "smooth"
      });
      setActiveSection(sectionId);
    }
  };
  const [faqExpanded, setFaqExpanded] = useState<{ [key: number]: boolean }>({});
  
  // Mini formulario de agendamiento interactivo
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [bookingTime, setBookingTime] = useState<string>("10:30 AM");
  const [visitorName, setVisitorName] = useState<string>("Jordan");
  const [showWelcomePopup, setShowWelcomePopup] = useState<boolean>(() => {
    return data.habilitarPopupBienvenida ?? true;
  });
  const [welcomeInputName, setWelcomeInputName] = useState<string>("Jordan");
  const [patientName, setPatientName] = useState<string>("Jordan");
  const [bookingDetails, setBookingDetails] = useState<string>("");
  const [bookingModality, setBookingModality] = useState<"presencial" | "teleconsulta">("presencial");
  const [bookingService, setBookingService] = useState<string>("");
  const [pricingTab, setPricingTab] = useState<"presencial" | "teleconsulta">("presencial");

  // Formateador para primera letra en mayúscula y resto en minúscula
  const formatCapitalizeName = (str: string) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/(?:^|\s|['-])\S/g, (char) => char.toUpperCase());
  };

  const handleWelcomeInputChange = (val: string) => {
    if (!val) {
      setWelcomeInputName("");
      return;
    }
    // Capitaliza primera letra de las palabras al escribir
    const formatted = val.replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
    setWelcomeInputName(formatted);
  };

  const handleSaveWelcomeName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = formatCapitalizeName(welcomeInputName.trim());
    if (trimmed) {
      setVisitorName(trimmed);
      setPatientName(trimmed);
      setWelcomeInputName(trimmed);
    }
    setShowWelcomePopup(false);
  };

  // Modal de confirmación de cita médica con resumen previo
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState<boolean>(false);
  const [showServicesModal, setShowServicesModal] = useState<boolean>(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string>("");
  const [bookingModalService, setBookingModalService] = useState<"whatsapp">("whatsapp");
  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string; platform: string; desc?: string } | null>(null);

  const getSocialVideoEmbedUrl = (rawUrl: string, platform: string): string => {
    if (!rawUrl) return "";
    const plat = (platform || "").toLowerCase();

    if (plat === "youtube" || rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
      let videoId = "";
      if (rawUrl.includes("youtu.be/")) {
        videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0]?.split("/")[0] || "";
      } else if (rawUrl.includes("shorts/")) {
        videoId = rawUrl.split("shorts/")[1]?.split("?")[0]?.split("/")[0] || "";
      } else if (rawUrl.includes("v=")) {
        videoId = rawUrl.split("v=")[1]?.split("&")[0] || "";
      }
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : rawUrl;
    }

    if (plat === "instagram" || rawUrl.includes("instagram.com")) {
      const match = rawUrl.match(/instagram\.com\/(reel|p|reels)\/([^/?#&]+)/i);
      if (match && match[2]) {
        return `https://www.instagram.com/p/${match[2]}/embed/captioned/`;
      }
    }

    if (plat === "tiktok" || rawUrl.includes("tiktok.com")) {
      const match = rawUrl.match(/tiktok\.com\/.*\/video\/(\d+)/i) || rawUrl.match(/v=(\d+)/i);
      if (match && match[1]) {
        return `https://www.tiktok.com/embed/v2/${match[1]}`;
      }
    }

    if (plat === "facebook" || rawUrl.includes("facebook.com")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false&autoplay=true`;
    }

    return rawUrl;
  };

  // Helper para formatear fecha de forma amigable (ej. "Martes, 18 de agosto de 2026")
  const getFormattedDateDisplay = (): string => {
    if (!bookingDate) return "Fecha a coordinar";
    try {
      const parts = bookingDate.split("-");
      if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const formatted = dateObj.toLocaleDateString("es-ES", { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
      }
    } catch (e) {
      return bookingDate;
    }
    return bookingDate;
  };

  // Helper para generar URL dinámica de WhatsApp con servicio, modalidad, precio, fecha, hora y paciente
  const getDynamicWhatsAppUrl = (
    overrideService?: string,
    overrideModality?: "presencial" | "teleconsulta"
  ): string => {
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

    const currentService = (overrideService !== undefined ? overrideService : bookingService).trim() || "Consulta de Especialidad";
    const currentModality = overrideModality !== undefined ? overrideModality : bookingModality;
    const modalityText = currentModality === "teleconsulta"
      ? "Teleconsulta Online (Videollamada)"
      : `Presencial (Consultorio en ${data.ciudad || "Ecuador"})`;
    const priceText = currentModality === "teleconsulta"
      ? (data.precioTeleconsulta || "$40 USD")
      : (data.precioConsulta || "$50 USD");

    const nameStr = patientName.trim() ? ` Mi nombre es ${patientName.trim()}.` : "";
    const detailsStr = bookingDetails.trim() ? ` Detalles de la consulta: ${bookingDetails.trim()}.` : "";
    const defaultTemplate = "Hola Dr(a). {{medico}}, deseo agendar una valoración para {{servicio}} en modalidad {{modalidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.";
    
    let msg = data.whatsappMensajePlantilla && data.whatsappMensajePlantilla.trim() 
      ? data.whatsappMensajePlantilla 
      : defaultTemplate;

    msg = msg
      .replace(/\{\{medico\}\}/gi, data.nombreMedico || "")
      .replace(/\{\{servicio\}\}/gi, currentService)
      .replace(/\{\{tratamiento\}\}/gi, currentService)
      .replace(/\{\{modalidad\}\}/gi, modalityText)
      .replace(/\{\{precio\}\}/gi, priceText)
      .replace(/\{\{especialidad\}\}/gi, data.especialidad || "")
      .replace(/\{\{ciudad\}\}/gi, data.ciudad || "")
      .replace(/\{\{clinica\}\}/gi, data.nombreClinicaGBP || "")
      .replace(/\{\{fecha\}\}/gi, dateFormatted)
      .replace(/\{\{hora\}\}/gi, bookingTime)
      .replace(/\{\{nombre\}\}/gi, nameStr)
      .replace(/\{\{detalles\}\}/gi, bookingDetails.trim() ? `Detalles: ${bookingDetails.trim()}` : "");

    // Si la plantilla no tenía {{servicio}} explícito y el usuario seleccionó un servicio específico
    if (currentService && currentService !== "Consulta de Especialidad" && !data.whatsappMensajePlantilla?.includes("{{servicio}}") && !msg.includes(currentService)) {
      msg += ` (Motivo: ${currentService})`;
    }

    if (nameStr && !data.whatsappMensajePlantilla?.includes("{{nombre}}") && !msg.includes(nameStr)) {
      msg += nameStr;
    }

    if (bookingDetails.trim() && !data.whatsappMensajePlantilla?.includes("{{detalles}}") && !msg.includes(bookingDetails.trim())) {
      msg += detailsStr;
    }

    return `${baseUrl}?text=${encodeURIComponent(msg)}`;
  };

  // Web Share API o Portapapeles para compartir el perfil del médico
  const handleShareProfile = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `${data.nombreMedico} - ${data.especialidad}`,
      text: `Consulta médica y perfil profesional de ${data.nombreMedico}, especialista en ${data.especialidad} en ${data.ciudad}.`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error al compartir:", err);
      }
    } else {
      handleCopyShareLink();
    }
  };

  const handleCopyShareLink = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setCopiedShareUrl(true);
      setShareFeedback("¡Enlace copiado!");
      setTimeout(() => {
        setCopiedShareUrl(false);
        setShareFeedback("");
      }, 2500);
    } catch (err) {
      console.log("Error al copiar enlace:", err);
    }
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

  // Estado de Atención en Tiempo Real y Tokens de Diseño
  const liveStatus = getLiveConsultationStatus(data.horarios);
  const cleanHorarioSemana = (data.horarios?.semana || "")
    .replace(/^(lunes\s+a\s+viernes|lunes\s+a\s+s[aá]bado|lunes|semana):\s*/i, "")
    .trim() || "10:00 AM - 07:00 PM";
  const cleanHorarioSabado = (data.horarios?.sabado || "")
    .replace(/^(s[aá]bados?):\s*/i, "")
    .trim() || "Cerrado / Previa Cita Exclusiva";
  const cleanHorarioDomingo = (data.horarios?.domingo || "")
    .replace(/^(domingos?):\s*/i, "")
    .trim() || "Cerrado";

  const currentDayIndex = new Date().getDay();
  const isSemanaActive = currentDayIndex >= 1 && currentDayIndex <= 5;
  const isSabadoActive = currentDayIndex === 6;
  const isDomingoActive = currentDayIndex === 0;
  const activeLandingStyle = getActiveLandingStyle(data.estiloLanding);
  const activeColorScale = getActiveColorScale(data.paletaColor, data.colorPrimarioHex);
  const activeSecondaryScale = data.colorSecundarioHex 
    ? generateScaleFromHex(data.colorSecundarioHex)
    : activeColorScale;
  const activeAccentScale = data.colorAcentoHex
    ? generateScaleFromHex(data.colorAcentoHex)
    : generateScaleFromHex("#f59e0b");

  // Inyección dinámica de Google Fonts y Preload de Recursos Clave (Logotipo y Foto LCP) para vista previa
  useEffect(() => {
    if (activeLandingStyle) {
      const dynamicFontsUrl = getDynamicGoogleFontsUrl(activeLandingStyle, data.fuenteTitulos, data.fuenteParrafos);
      let link = document.querySelector(`link[data-font-preset="medical-preview"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.setAttribute("data-font-preset", "medical-preview");
        document.head.appendChild(link);
      }
      link.href = dynamicFontsUrl;
    }

    // Estrategia de pre-carga inmediata del logotipo y foto de perfil para optimización LCP
    if (data.logoUrl && data.logoUrl.trim()) {
      const cleanLogoUrl = data.logoUrl.trim();
      
      // 1. Preload en caché del navegador (Image object pre-decoding)
      const preloadImg = new Image();
      preloadImg.src = cleanLogoUrl;
      if ("decode" in preloadImg) {
        preloadImg.decode().catch(() => {});
      }

      // 2. Preload link element en el <head> con alta prioridad
      let logoPreloadLink = document.querySelector(`link[data-preload-asset="medical-logo"]`) as HTMLLinkElement;
      if (!logoPreloadLink) {
        logoPreloadLink = document.createElement("link");
        logoPreloadLink.rel = "preload";
        logoPreloadLink.as = "image";
        logoPreloadLink.setAttribute("data-preload-asset", "medical-logo");
        logoPreloadLink.setAttribute("fetchpriority", "high");
        document.head.appendChild(logoPreloadLink);
      }
      logoPreloadLink.href = cleanLogoUrl;
    }
  }, [activeLandingStyle, data.fuenteTitulos, data.fuenteParrafos, data.logoUrl]);

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
          <span 
            className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md text-white border border-black/10"
            style={{ backgroundColor: activeColorScale["600"] }}
          >
            <span className="opacity-80 font-normal">Color:</span>
            {data.paletaColor || "Azul"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            id="btn-preview-mobile"
            onClick={() => setDevice("mobile")}
            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              device === "mobile" 
                ? "bg-white text-blue-600 shadow-xs font-black border border-slate-200" 
                : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
            }`}
            title="Vista Móvil (Enfoque Mobile-First: ~375px)"
            aria-label="Cambiar a vista móvil"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[11px] font-extrabold hidden sm:inline">Móvil</span>
          </button>
          <button
            id="btn-preview-tablet"
            onClick={() => setDevice("tablet")}
            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              device === "tablet" 
                ? "bg-white text-blue-600 shadow-xs font-black border border-slate-200" 
                : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
            }`}
            title="Vista Tablet (Pantalla Mediana: ~720px)"
            aria-label="Cambiar a vista tablet"
          >
            <Tablet className="w-4 h-4" />
            <span className="text-[11px] font-extrabold hidden sm:inline">Tablet</span>
          </button>
          <button
            id="btn-preview-desktop"
            onClick={() => setDevice("desktop")}
            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              device === "desktop" 
                ? "bg-white text-blue-600 shadow-xs font-black border border-slate-200" 
                : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
            }`}
            title="Vista Escritorio (Desktop: 100%)"
            aria-label="Cambiar a vista escritorio"
          >
            <Monitor className="w-4 h-4" />
            <span className="text-[11px] font-extrabold hidden sm:inline">Desktop</span>
          </button>
          {(data.habilitarPopupBienvenida ?? true) && (
            <button
              id="btn-trigger-welcome-modal"
              type="button"
              onClick={() => {
                setWelcomeInputName(visitorName);
                setShowWelcomePopup(true);
              }}
              className="p-1.5 px-2.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[11px]"
              title="Probar Popup de Bienvenida y Saludo Personalizado"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden xl:inline">Probar Popup</span>
            </button>
          )}
          <button
            id="btn-preview-external-inline"
            type="button"
            onClick={handleOpenExternal}
            className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white transition-all cursor-pointer flex items-center gap-1 font-bold text-[11px]"
            title="Abrir vista previa en pestaña independiente"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden lg:inline">Navegador</span>
          </button>
        </div>
      </div>

      {/* Área de la Vista Previa con Inyección Dinámica de Estilo */}
      <div 
        id="preview-viewport-wrapper"
        ref={viewportRef}
        style={{
          fontFamily: activeLandingStyle.fontBody,
          letterSpacing: activeLandingStyle.variables["--landing-letter-spacing"]
        }}
        className={`transition-all duration-300 w-full overflow-y-auto bg-[#fafbfc] border border-slate-200/80 shadow-inner rounded-xl relative ${
          device === "mobile" 
            ? "max-w-[375px] h-[600px] lg:h-[calc(100vh-13.5rem)] lg:min-h-[480px] lg:max-h-[760px] scrollbar-thin" 
            : device === "tablet"
              ? "max-w-[720px] h-[600px] lg:h-[calc(100vh-13.5rem)] lg:min-h-[480px] lg:max-h-[760px] scrollbar-thin"
              : "max-w-full h-[600px] lg:h-[calc(100vh-13.5rem)] lg:min-h-[480px] lg:max-h-[760px]"
        }`}
      >
        {/* Inyección de estilos de tipografía, bordes y sombras para el Preview */}
        <style>{`
          #preview-viewport-wrapper {
            --color-primary-50: ${activeColorScale["50"]};
            --color-primary-100: ${activeColorScale["100"]};
            --color-primary-200: ${activeColorScale["200"]};
            --color-primary-500: ${activeColorScale["500"]};
            --color-primary-600: ${activeColorScale["600"]};
            --color-primary-700: ${activeColorScale["700"]};
            --color-primary-800: ${activeColorScale["800"]};
            --color-primary-900: ${activeColorScale["900"]};

            --clinical-50: ${activeColorScale["50"]};
            --clinical-100: ${activeColorScale["100"]};
            --clinical-200: ${activeColorScale["200"]};
            --clinical-500: ${activeColorScale["500"]};
            --clinical-600: ${activeColorScale["600"]};
            --clinical-700: ${activeColorScale["700"]};
            --clinical-800: ${activeColorScale["800"]};
            --clinical-900: ${activeColorScale["900"]};

            --color-secondary-50: ${activeSecondaryScale["50"]};
            --color-secondary-100: ${activeSecondaryScale["100"]};
            --color-secondary-200: ${activeSecondaryScale["200"]};
            --color-secondary-500: ${activeSecondaryScale["500"]};
            --color-secondary-600: ${activeSecondaryScale["600"]};
            --color-secondary-700: ${activeSecondaryScale["700"]};
            --color-secondary-800: ${activeSecondaryScale["800"]};
            --color-secondary-900: ${activeSecondaryScale["900"]};

            --secondary-50: ${activeSecondaryScale["50"]};
            --secondary-100: ${activeSecondaryScale["100"]};
            --secondary-200: ${activeSecondaryScale["200"]};
            --secondary-500: ${activeSecondaryScale["500"]};
            --secondary-600: ${activeSecondaryScale["600"]};
            --secondary-700: ${activeSecondaryScale["700"]};
            --secondary-800: ${activeSecondaryScale["800"]};
            --secondary-900: ${activeSecondaryScale["900"]};

            --color-accent-50: ${activeAccentScale["50"]};
            --color-accent-100: ${activeAccentScale["100"]};
            --color-accent-200: ${activeAccentScale["200"]};
            --color-accent-500: ${activeAccentScale["500"]};
            --color-accent-600: ${activeAccentScale["600"]};
            --color-accent-700: ${activeAccentScale["700"]};
            --color-accent-800: ${activeAccentScale["800"]};
            --color-accent-900: ${activeAccentScale["900"]};

            --accent-50: ${activeAccentScale["50"]};
            --accent-100: ${activeAccentScale["100"]};
            --accent-200: ${activeAccentScale["200"]};
            --accent-500: ${activeAccentScale["500"]};
            --accent-600: ${activeAccentScale["600"]};
            --accent-700: ${activeAccentScale["700"]};
            --accent-800: ${activeAccentScale["800"]};
            --accent-900: ${activeAccentScale["900"]};

            --landing-font-display: ${data.fuenteTitulos || activeLandingStyle.fontDisplay};
            --landing-font-body: ${data.fuenteParrafos || activeLandingStyle.fontBody};
            --landing-letter-spacing: ${activeLandingStyle.variables["--landing-letter-spacing"]};
            --landing-radius: ${activeLandingStyle.variables["--landing-radius"]};
            --landing-radius-sm: ${activeLandingStyle.variables["--landing-radius-sm"]};
            --landing-radius-lg: ${activeLandingStyle.variables["--landing-radius-lg"]};
            --landing-shadow: ${activeLandingStyle.variables["--landing-shadow"]};
          }

          /* Mapeo universal de clases cromáticas clínicas y clases dinámicas de Tailwind */
          #preview-viewport-wrapper .bg-clinical-50,
          #preview-viewport-wrapper .bg-blue-50,
          #preview-viewport-wrapper .bg-emerald-50,
          #preview-viewport-wrapper .bg-purple-50,
          #preview-viewport-wrapper .bg-teal-50,
          #preview-viewport-wrapper .bg-indigo-50,
          #preview-viewport-wrapper .bg-rose-50,
          #preview-viewport-wrapper .bg-red-50 {
            background-color: var(--clinical-50) !important;
          }
          #preview-viewport-wrapper .bg-clinical-100,
          #preview-viewport-wrapper .bg-blue-100,
          #preview-viewport-wrapper .bg-emerald-100,
          #preview-viewport-wrapper .bg-purple-100,
          #preview-viewport-wrapper .bg-teal-100,
          #preview-viewport-wrapper .bg-indigo-100,
          #preview-viewport-wrapper .bg-rose-100,
          #preview-viewport-wrapper .bg-red-100 {
            background-color: var(--clinical-100) !important;
          }
          #preview-viewport-wrapper .bg-clinical-200,
          #preview-viewport-wrapper .bg-blue-200,
          #preview-viewport-wrapper .bg-emerald-200 {
            background-color: var(--clinical-200) !important;
          }
          #preview-viewport-wrapper .bg-clinical-500,
          #preview-viewport-wrapper .bg-blue-500,
          #preview-viewport-wrapper .bg-emerald-500,
          #preview-viewport-wrapper .bg-purple-500,
          #preview-viewport-wrapper .bg-teal-500,
          #preview-viewport-wrapper .bg-indigo-500 {
            background-color: var(--clinical-500) !important;
          }
          #preview-viewport-wrapper .bg-clinical-600,
          #preview-viewport-wrapper .bg-blue-600,
          #preview-viewport-wrapper .bg-emerald-600,
          #preview-viewport-wrapper .bg-purple-600,
          #preview-viewport-wrapper .bg-teal-600,
          #preview-viewport-wrapper .bg-indigo-600,
          #preview-viewport-wrapper .bg-rose-600,
          #preview-viewport-wrapper .bg-red-600 {
            background-color: var(--clinical-600) !important;
          }
          #preview-viewport-wrapper .bg-clinical-700,
          #preview-viewport-wrapper .bg-blue-700,
          #preview-viewport-wrapper .bg-emerald-700,
          #preview-viewport-wrapper .bg-purple-700,
          #preview-viewport-wrapper .bg-teal-700,
          #preview-viewport-wrapper .bg-indigo-700,
          #preview-viewport-wrapper .bg-rose-700,
          #preview-viewport-wrapper .bg-red-700 {
            background-color: var(--clinical-700) !important;
          }
          #preview-viewport-wrapper .text-clinical-500,
          #preview-viewport-wrapper .text-blue-500,
          #preview-viewport-wrapper .text-emerald-500,
          #preview-viewport-wrapper .text-purple-500,
          #preview-viewport-wrapper .text-teal-500,
          #preview-viewport-wrapper .text-indigo-500 {
            color: var(--clinical-500) !important;
          }
          #preview-viewport-wrapper .text-clinical-600,
          #preview-viewport-wrapper .text-blue-600,
          #preview-viewport-wrapper .text-emerald-600,
          #preview-viewport-wrapper .text-purple-600,
          #preview-viewport-wrapper .text-teal-600,
          #preview-viewport-wrapper .text-indigo-600,
          #preview-viewport-wrapper .text-rose-600,
          #preview-viewport-wrapper .text-red-600 {
            color: var(--clinical-600) !important;
          }
          #preview-viewport-wrapper .text-clinical-700,
          #preview-viewport-wrapper .text-blue-700,
          #preview-viewport-wrapper .text-emerald-700,
          #preview-viewport-wrapper .text-purple-700,
          #preview-viewport-wrapper .text-teal-700,
          #preview-viewport-wrapper .text-indigo-700,
          #preview-viewport-wrapper .text-rose-700,
          #preview-viewport-wrapper .text-red-700 {
            color: var(--clinical-700) !important;
          }
          #preview-viewport-wrapper .border-clinical-100,
          #preview-viewport-wrapper .border-blue-100,
          #preview-viewport-wrapper .border-emerald-100 {
            border-color: var(--clinical-100) !important;
          }
          #preview-viewport-wrapper .border-clinical-200,
          #preview-viewport-wrapper .border-blue-200,
          #preview-viewport-wrapper .border-emerald-200 {
            border-color: var(--clinical-200) !important;
          }
          #preview-viewport-wrapper .border-clinical-500,
          #preview-viewport-wrapper .border-blue-500,
          #preview-viewport-wrapper .border-emerald-500 {
            border-color: var(--clinical-500) !important;
          }
          #preview-viewport-wrapper .border-clinical-600,
          #preview-viewport-wrapper .border-blue-600,
          #preview-viewport-wrapper .border-emerald-600,
          #preview-viewport-wrapper .border-purple-600,
          #preview-viewport-wrapper .border-teal-600,
          #preview-viewport-wrapper .border-indigo-600 {
            border-color: var(--clinical-600) !important;
          }

          /* Clases de Acento */
          #preview-viewport-wrapper .bg-amber-500,
          #preview-viewport-wrapper .bg-accent-500 {
            background-color: var(--accent-500) !important;
          }
          #preview-viewport-wrapper .bg-amber-600,
          #preview-viewport-wrapper .bg-accent-600 {
            background-color: var(--accent-600) !important;
          }
          #preview-viewport-wrapper .text-amber-500,
          #preview-viewport-wrapper .text-amber-600,
          #preview-viewport-wrapper .text-accent-600 {
            color: var(--accent-600) !important;
          }

          #preview-viewport-wrapper [class*="from-blue-50"], 
          #preview-viewport-wrapper [class*="from-emerald-50"], 
          #preview-viewport-wrapper [class*="from-purple-50"], 
          #preview-viewport-wrapper [class*="from-teal-50"], 
          #preview-viewport-wrapper [class*="from-indigo-50"], 
          #preview-viewport-wrapper [class*="from-rose-50"], 
          #preview-viewport-wrapper [class*="from-amber-50"] {
            --tw-gradient-from: var(--clinical-50) !important;
            --tw-gradient-to: rgb(255 255 255 / 0) !important;
            --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
          }
          #preview-viewport-wrapper [class*="from-blue-600"], 
          #preview-viewport-wrapper [class*="from-emerald-600"], 
          #preview-viewport-wrapper [class*="from-purple-600"], 
          #preview-viewport-wrapper [class*="from-teal-600"], 
          #preview-viewport-wrapper [class*="from-indigo-600"] {
            --tw-gradient-from: var(--clinical-600) !important;
            --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
          }
          #preview-viewport-wrapper [class*="to-blue-700"], 
          #preview-viewport-wrapper [class*="to-emerald-700"], 
          #preview-viewport-wrapper [class*="to-purple-700"], 
          #preview-viewport-wrapper [class*="to-teal-700"], 
          #preview-viewport-wrapper [class*="to-indigo-700"] {
            --tw-gradient-to: var(--clinical-700) !important;
          }

          #preview-viewport-wrapper h1, 
          #preview-viewport-wrapper h2, 
          #preview-viewport-wrapper h3, 
          #preview-viewport-wrapper h4, 
          #preview-viewport-wrapper .font-display {
            font-family: var(--landing-font-display) !important;
            letter-spacing: var(--landing-letter-spacing) !important;
          }
          #preview-viewport-wrapper p,
          #preview-viewport-wrapper span,
          #preview-viewport-wrapper button,
          #preview-viewport-wrapper input,
          #preview-viewport-wrapper label {
            font-family: var(--landing-font-body);
          }
          #preview-viewport-wrapper .rounded-3xl,
          #preview-viewport-wrapper .rounded-2xl,
          #preview-viewport-wrapper .rounded-\\[2\\.5rem\\] {
            border-radius: var(--landing-radius-lg) !important;
          }
          #preview-viewport-wrapper .rounded-xl {
            border-radius: var(--landing-radius) !important;
          }
          #preview-viewport-wrapper .rounded-lg {
            border-radius: var(--landing-radius-sm) !important;
          }
          #preview-viewport-wrapper .shadow-xl,
          #preview-viewport-wrapper .shadow-2xl,
          #preview-viewport-wrapper .shadow-lg {
            box-shadow: var(--landing-shadow) !important;
          }
        `}</style>

        <AnimatePresence mode="wait">
          {(() => {
            // Tamaño dinámico del logotipo según dispositivo
            const logoMobH = data.logoTamanoMobile || 36;
            const logoTabH = data.logoTamanoTablet || 48;
            const logoDeskH = data.logoTamanoDesktop || 60;
            let currentLogoH = logoDeskH;
            if (device === "mobile") {
              currentLogoH = logoMobH;
            } else if (device === "tablet") {
              currentLogoH = logoTabH;
            }

            return (
              <motion.div
                key={device}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="min-h-full flex flex-col"
              >
                {/* LANDING PAGE MÉDICA INTEGRAL */}
                {/* BARRA SUPERIOR TOP INFO (Versión 3: Ejecutivo Doble Barra Dark) */}
                {device === "desktop" && data.estiloMenuDesktop === "ejecutivo" && (
                  <div className="bg-slate-950 text-slate-100 text-xs py-2 px-4 border-b border-slate-800/90 hidden md:block">
                    <div className="w-[90%] max-w-[90%] mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] font-medium">
                        {/* Badge Teléfono Dark - Llamada Directa */}
                        <a 
                          href={`tel:${data.telefonoGBP.replace(/\s+/g, '')}`}
                          title="Hacer clic para llamar directamente"
                          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-800/90 hover:scale-[1.02] transition-all group shadow-2xs cursor-pointer"
                        >
                          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shrink-0">
                            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                          </span>
                          <span className="flex flex-col text-left leading-none">
                            <span className="text-[9px] text-emerald-400 uppercase font-extrabold tracking-wider">Llamar Ahora</span>
                            <strong className="text-white font-mono font-bold tracking-tight text-[11px] mt-0.5">{data.telefonoGBP}</strong>
                          </span>
                        </a>

                        {/* Badge Ubicación Dark */}
                        <span 
                          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group shadow-2xs"
                          onClick={() => scrollToSection("horarios_ubicacion")}
                        >
                          <span className="p-1 rounded-md bg-blue-500/15 text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-slate-200 font-medium">{data.ciudad}, {data.estadoRegion}</span>
                        </span>

                        {/* Badge Horario Dark */}
                        <span 
                          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group shadow-2xs"
                          onClick={() => scrollToSection("horarios_ubicacion")}
                        >
                          <span className="p-1 rounded-md bg-amber-500/15 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-slate-200 font-medium">{data.horarios?.semana || "Atención previa cita"}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Badge Citas Disponibles */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>Citas Disponibles</span>
                        </div>

                        {/* Botón WhatsApp Directo */}
                        <a 
                          href={data.whatsappUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-xs hover:shadow-emerald-900/40 transition-all scale-[1.02] active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                          <span>WhatsApp Directo</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* HEADER / NAV (En móvil: se oculta arriba al inicio y aparece suavemente al hacer scroll) */}
                <header 
                  id="preview-landing-header" 
                  className={`${
                    device === "mobile"
                      ? `fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                          isScrolled ? "translate-y-0 opacity-100 shadow-md pointer-events-auto" : "-translate-y-full opacity-0 pointer-events-none"
                        }`
                      : "sticky top-0 z-30 shadow-xs bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-2 sm:px-4 h-16 sm:h-20 flex items-center w-full"
                  }`}
                >
                  <div className="w-[90%] max-w-[90%] mx-auto flex items-center justify-between h-full">
                    {/* Brand Logo */}
                    <div className="flex items-center shrink-0 h-full py-2 overflow-hidden cursor-pointer" onClick={() => scrollToSection("inicio")}>
                      {data.logoUrl ? (
                        <img 
                          src={data.logoUrl || undefined} 
                          alt={`Logo ${data.nombreMedico || 'Especialista'}`} 
                          style={{ height: `${currentLogoH}px`, maxHeight: '100%', width: 'auto' }}
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                          className="object-contain object-left max-w-[180px] sm:max-w-[280px] md:max-w-[340px] bg-transparent shrink-0 transition-all duration-200"
                        />
                      ) : (
                        <div className="flex flex-col text-left">
                          <span className="text-sm sm:text-base font-extrabold text-slate-950 flex items-center gap-1.5 font-display tracking-tight leading-tight">
                            <span className={`w-2.5 h-2.5 rounded-full bg-${getC("600")}`}></span>
                            {data.nombreMedico}
                          </span>
                          <span className={`text-[10px] sm:text-[11px] text-${getC("600")} font-bold uppercase tracking-wider mt-0.5`}>{data.especialidad}</span>
                        </div>
                      )}
                    </div>

                {/* VERSIÓN 1 DE MENÚ DESKTOP: CÁPSULA CENTRADA (PÍLDORA) */}
                {device === "desktop" && (data.estiloMenuDesktop || "capsula") === "capsula" && (
                  <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 p-1.5 rounded-full shadow-2xs mx-4">
                    {activeNavs.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          style={isActive ? { backgroundColor: activeColorScale["600"], color: "#FFFFFF" } : {}}
                          className={`px-4 py-1.5 text-[14px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                            isActive 
                              ? "text-white font-extrabold shadow-xs scale-[1.02]"
                              : "text-slate-700 hover:text-slate-950 hover:bg-white/90"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                )}

                {/* VERSIÓN 2 DE MENÚ DESKTOP: MINIMALISTA A LA DERECHA CON LÍNEA INFERIOR */}
                {device === "desktop" && data.estiloMenuDesktop === "minimalista" && (
                  <nav className="hidden md:flex items-center gap-6 ml-auto mr-6">
                    {activeNavs.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          style={isActive ? { borderBottomColor: activeColorScale["600"], color: activeColorScale["700"] } : {}}
                          className={`py-1 text-[14px] font-extrabold transition-all duration-200 cursor-pointer border-b-2 ${
                            isActive 
                              ? "border-b-2 font-black text-slate-950"
                              : "border-transparent text-slate-600 hover:text-slate-950 hover:border-slate-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                )}

                {/* VERSIÓN 3 DE MENÚ DESKTOP: EJECUTIVO PESTAÑAS ESTRUCTURADAS */}
                {device === "desktop" && data.estiloMenuDesktop === "ejecutivo" && (
                  <nav className="hidden md:flex items-center gap-1.5 ml-auto mr-4">
                    {activeNavs.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          style={isActive ? { backgroundColor: activeColorScale["50"], color: activeColorScale["700"], borderColor: activeColorScale["200"] } : {}}
                          className={`px-3.5 py-1.5 text-[13px] font-extrabold rounded-xl transition-all duration-200 cursor-pointer border ${
                            isActive 
                              ? "shadow-2xs font-black"
                              : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-950"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                )}

                {/* VERSIÓN 4 DE MENÚ DESKTOP: DOCK FLOTANTE CRISTAL (GLASSMORPHISM) */}
                {device === "desktop" && data.estiloMenuDesktop === "modern_dock" && (
                  <nav className="hidden md:flex items-center gap-1.5 bg-white/90 backdrop-blur-xl border border-slate-300/80 p-1.5 rounded-2xl shadow-sm mx-auto">
                    {activeNavs.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          style={isActive ? { backgroundColor: activeColorScale["600"], color: "#FFFFFF" } : {}}
                          className={`px-3.5 py-1.5 text-[13px] font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                            isActive 
                              ? "text-white font-black shadow-xs scale-[1.03]"
                              : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/90"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                )}

                {/* VERSIÓN 5 DE MENÚ DESKTOP: PEDIÁTRICO COLORIDO CON ICONOS 3D */}
                {device === "desktop" && data.estiloMenuDesktop === "split_centrado" && (
                  <nav className="hidden md:flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-sm mx-auto">
                    {activeNavs.map((item) => {
                      const isActive = activeSection === item.id;
                      const icon3D = (() => {
                        switch (item.icon) {
                          case "home": return "🏠";
                          case "doctor": return "🩺";
                          case "servicios": return "🧸";
                          case "video": return "🎬";
                          case "casos": return "✨";
                          case "clinica": return "🏥";
                          case "opiniones": return "⭐";
                          case "faq": return "💡";
                          case "blog": return "📚";
                          case "guias": return "📋";
                          case "cita": return "📅";
                          default: return "🎈";
                        }
                      })();
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          style={isActive ? { backgroundColor: activeColorScale["600"], color: "#FFFFFF" } : {}}
                          className={`px-3.5 py-2 text-[14px] rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 group ${
                            isActive 
                              ? "font-extrabold text-white shadow-xs scale-[1.02]"
                              : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-bold"
                          }`}
                        >
                          <span className="text-base leading-none transition-transform duration-200 group-hover:scale-120 select-none">
                            {icon3D}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                )}

                {/* Actions Block */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Botón Agendar Cita en Desktop para v5 */}
                  {device === "desktop" && data.estiloMenuDesktop === "split_centrado" && (
                    <button
                      onClick={() => scrollToSection("contacto")}
                      style={{ backgroundColor: activeColorScale["600"] }}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-white text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer rounded-xl"
                    >
                      <span className="text-sm">📅</span>
                      <span>Agendar Cita</span>
                    </button>
                  )}

                  {/* Botón Asistente Virtual (Estilo IA Sutil Persistente) */}
                  <button 
                    onClick={() => scrollToSection("faqs")}
                    aria-label="Asistente Virtual IA"
                    title="Ir al Asistente Virtual IA"
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 active:from-blue-700 active:to-violet-700 text-white rounded-full flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/25 transition-all duration-300 shrink-0 hover:scale-105 cursor-pointer border border-indigo-300/40 text-xs sm:text-xs font-black tracking-tight"
                  >
                    <Bot className="w-4 h-4 shrink-0 text-indigo-100" />
                    <span>Asistente</span>
                  </button>

                  {/* Mobile Hamburger Menu Button (Only in mobile view mode) */}
                  {device === "mobile" && (
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      style={mobileMenuOpen ? { backgroundColor: activeColorScale["600"], color: "#FFFFFF", borderColor: activeColorScale["600"] } : {}}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                        mobileMenuOpen 
                          ? "text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      aria-label="Menú principal"
                      title="Menú principal"
                    >
                      {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Slide-Down Menu Panel (Lista vertical con el mismo estilo de etiqueta/tarjeta) */}
              {device === "mobile" && mobileMenuOpen && (
                <div className="overflow-hidden max-w-full w-full border-t border-slate-100 mt-2.5 pb-2">
                  <nav className="flex flex-col gap-2 bg-slate-50/90 p-2.5 rounded-2xl border border-slate-200/80 mt-1 w-full overflow-hidden">
                    {activeNavs.map((item) => {
                      const isActive = activeSection === item.id;
                      const Icon = getIconComponent(item.icon);
                      const isCita = item.id === "contacto";
                      const isOpiniones = item.id === "opiniones";
                      const isAsistente = item.id === "faqs";
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            scrollToSection(item.id);
                            setMobileMenuOpen(false);
                          }}
                          style={isActive ? { backgroundColor: activeColorScale["600"], color: "#FFFFFF", borderColor: activeColorScale["600"] } : {}}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs group ${
                            isActive 
                              ? "text-white shadow-xs font-black"
                              : isCita
                                ? "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 font-black"
                                : "text-slate-800 bg-white border border-slate-200/80 hover:bg-slate-100 hover:text-slate-950"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive 
                                ? "bg-white/20 text-white" 
                                : isCita 
                                  ? "bg-emerald-100 text-emerald-700" 
                                  : isOpiniones
                                    ? "bg-amber-100 text-amber-500"
                                    : isAsistente
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                            }`}>
                              <Icon className={`w-4 h-4 shrink-0 min-w-[16px] min-h-[16px] ${
                                isActive 
                                  ? "text-white" 
                                  : isOpiniones 
                                    ? "fill-amber-400 text-amber-500" 
                                    : isAsistente
                                      ? "text-indigo-600"
                                      : ""
                              }`} />
                            </div>
                            <span className="font-bold tracking-tight">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0 mr-1" />
                            )}
                            <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 shrink-0 ${isActive ? "text-white/80" : "text-slate-400 group-hover:text-slate-600"}`} />
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}
            </header>

        {/* HERO SECTION DINÁMICO (100% ANCHO, 80% ALTO VIEWPORT CON LOGO, FOTO CIRCULAR GLOW, DATOS, CTA Y REDES SOCIALES) */}
        {isSectionVisible("hero") && (
          <section 
            id="inicio" 
            className="relative w-full min-h-[80vh] md:min-h-[80vh] flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-5 pb-8 sm:py-12 md:py-16 overflow-hidden bg-cover bg-center bg-no-repeat shadow-inner"
            style={(() => {
              const bgType = data.tipoFondoHero || (data.imagenFondoHero ? "imagen" : "gradiente");
              if (bgType === "imagen" && data.imagenFondoHero) {
                return {
                  backgroundImage: `url("${data.imagenFondoHero}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat"
                };
              }
              if (bgType === "solido" && data.colorFondoHero) {
                return {
                  backgroundColor: data.colorFondoHero
                };
              }
              if (data.gradienteFondoHero) {
                return {
                  background: data.gradienteFondoHero
                };
              }
              return {
                background: `linear-gradient(135deg, ${activeColorScale["900"]} 0%, ${activeColorScale["950"]} 100%)`
              };
            })()}
          >
            {/* Capa de contraste y gradiente profesional con overlay oscuro o claro */}
            {(() => {
              const bgType = data.tipoFondoHero || (data.imagenFondoHero ? "imagen" : "gradiente");
              const isLightOverlay = data.tipoOverlayHero === "claro";
              const userOpacity = data.overlayOscuroHero ?? 0.8;

              // Para gradientes o colores sólidos, usamos una viñeta suave para resaltar los colores del gradiente
              if (bgType === "gradiente" || bgType === "solido") {
                return (
                  <div 
                    className={`absolute inset-0 backdrop-blur-[1px] ${
                      isLightOverlay 
                        ? "bg-gradient-to-b from-white/30 via-transparent to-white/30" 
                        : "bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/50"
                    }`} 
                    style={{ opacity: Math.min(userOpacity, 0.6) }}
                  />
                );
              }

              // Para imágenes fotográficas panorámicas
              return (
                <div 
                  className={`absolute inset-0 backdrop-blur-[1.5px] ${
                    isLightOverlay 
                      ? "bg-gradient-to-b from-white/90 via-slate-50/80 to-white/90" 
                      : "bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/90"
                  }`} 
                  style={{ opacity: userOpacity }}
                />
              );
            })()}

            {/* Contenido Adaptativo del Hero (Estructura Tradicional 2 Columnas en Desktop: Info Izquierda, Foto Derecha, Sin Logo Superior; Centrado en Mobile/Tablet) */}
            {(() => {
              const isDesktop = device === "desktop";
              const disenoDesktop = data.disenoHeroDesktop || "estandar";
              const isCentradoVersion = disenoDesktop === "centrado";
              const isCentrado = isDesktop && isCentradoVersion;
              const isDesktopAlignLeft = isDesktop && !isCentrado;

              // Componente reutilizable para la Fotografía del Médico
              const photoNode = (() => {
                const forma = data.fotoFormaHero || "circular";
                const mobW = data.fotoTamanoMobile || 176;
                const tabW = data.fotoTamanoTablet || 240;
                const deskW = data.fotoTamanoDesktop || 320;

                let currentW = deskW;
                if (device === "mobile") {
                  currentW = mobW;
                } else if (device === "tablet") {
                  currentW = tabW;
                } else {
                  currentW = deskW;
                }

                const isCircular = forma === "circular";
                const isRect = forma === "rectangular";
                const isSinBorde = forma === "sin_borde";

                return (
                  <div className={`relative group hero-animate-image ${isDesktop ? "shrink-0 my-0.5" : "mx-auto -mt-4 sm:-mt-2 mb-1 sm:my-0.5 max-w-full"}`}>
                    <style>{`
                      .doctor-hero-photo-container {
                        width: ${currentW}px !important;
                        max-width: 100% !important;
                      }

                      @keyframes heroFadeInUp {
                        0% {
                          opacity: 0;
                          transform: translateY(22px) scale(0.98);
                        }
                        100% {
                          opacity: 1;
                          transform: translateY(0) scale(1);
                        }
                      }

                      @keyframes heroBlurIn {
                        0% {
                          opacity: 0;
                          filter: blur(16px);
                          transform: scale(0.95) translateY(12px);
                        }
                        50% {
                          opacity: 0.85;
                          filter: blur(4px);
                        }
                        100% {
                          opacity: 1;
                          filter: blur(0px);
                          transform: scale(1) translateY(0);
                        }
                      }

                      @keyframes heroBadgePop {
                        0% {
                          opacity: 0;
                          transform: scale(0.82) translateY(-8px);
                        }
                        70% {
                          transform: scale(1.05) translateY(0);
                        }
                        100% {
                          opacity: 1;
                          transform: scale(1) translateY(0);
                        }
                      }

                      .hero-animate-logo {
                        animation: heroBadgePop 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 40ms;
                      }

                      .hero-animate-badge {
                        animation: heroBadgePop 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 100ms;
                      }

                      .hero-animate-title {
                        animation: heroFadeInUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 200ms;
                      }

                      .hero-animate-image {
                        animation: heroBlurIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 280ms;
                        will-change: transform, filter, opacity;
                      }

                      .hero-animate-specialty {
                        animation: heroFadeInUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 360ms;
                      }

                      .hero-animate-location {
                        animation: heroFadeInUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 460ms;
                      }

                      .hero-animate-cta {
                        animation: heroFadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 560ms;
                      }

                      .hero-animate-social {
                        animation: heroFadeInUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 660ms;
                      }

                      .hero-animate-status {
                        animation: heroFadeInUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
                        animation-delay: 760ms;
                      }
                    `}</style>

                    <div ref={heroParallaxRef} className="w-full h-full transition-transform duration-100 ease-out will-change-transform">
                      {/* Halo / Glow Effect */}
                      {!isSinBorde && (
                        <div 
                          className={`absolute -inset-2.5 sm:-inset-4 md:-inset-5 bg-gradient-to-r from-blue-400/50 via-cyan-400/50 to-emerald-400/50 blur-lg sm:blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse ${
                            isCircular ? "rounded-full opacity-85 group-hover:opacity-100" : "rounded-3xl opacity-85 group-hover:opacity-100"
                          }`} 
                        />
                      )}
                      
                      {/* Marco de la Fotografía */}
                      <div 
                        className={`relative doctor-hero-photo-container overflow-hidden transition-all duration-300 max-w-full mx-auto ${
                          isCircular 
                            ? "aspect-square rounded-full border-4 sm:border-[5px] md:border-[6px] border-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.65)] ring-4 md:ring-8 ring-white/30 bg-slate-900" 
                            : isRect 
                              ? "aspect-[3/4] rounded-2xl sm:rounded-[2.5rem] border-4 sm:border-[5px] md:border-[6px] border-white/95 shadow-2xl ring-4 md:ring-8 ring-white/30 bg-slate-900" 
                              : "aspect-[3/4] rounded-none border-0 ring-0 shadow-none bg-transparent"
                        }`}
                        style={
                          isSinBorde
                            ? {
                                WebkitMaskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
                                maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
                              }
                            : undefined
                        }
                      >
                        <img 
                          src={data.fotoUrl || undefined} 
                          alt={data.nombreMedico} 
                          className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                            isCircular ? "rounded-full" : isRect ? "rounded-2xl sm:rounded-[2.5rem]" : "rounded-none"
                          }`} 
                          loading="eager"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })();

              // Componente reutilizable para el bloque de información (Badge, Nombre, Especialidad, Ubicación, CTA, RRSS, Horario)
              const infoNode = (
                <div className={`space-y-3 sm:space-y-3.5 w-full ${isDesktopAlignLeft ? "text-left flex flex-col items-start" : "text-center flex flex-col items-center mx-auto max-w-2xl"}`}>
                  {/* BADGE: MÉDICO CERTIFICADO O VERIFICADO */}
                  <div className={`flex items-center ${isDesktopAlignLeft ? "justify-start" : "justify-center"} pt-0.5 hero-animate-badge`}>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3 sm:py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-sm border border-blue-400/40 shrink-0 transform transition-all duration-200 hover:scale-105 cursor-default">
                      <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-100 shrink-0" />
                      <span>{isCentradoVersion ? "Verificado" : (isClinica ? "Centro Acreditado" : "Médico Certificado")}</span>
                    </div>
                  </div>

                  {/* NOMBRE Y ESPECIALIDAD */}
                  <div className={`space-y-1 w-full ${isDesktopAlignLeft ? "text-left px-0" : "text-center px-2"}`}>
                    <h2 className={`text-[1.45rem] sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight break-words max-w-full font-display hero-animate-title ${
                      data.tipoOverlayHero === "claro" ? "text-slate-900 drop-shadow-xs" : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                    }`}>
                      {data.nombreMedico}
                    </h2>
                    <h1 className={`text-[0.935rem] sm:text-base md:text-xl lg:text-2xl uppercase tracking-wide sm:tracking-wider leading-snug break-words max-w-full hero-animate-specialty ${
                      data.tipoOverlayHero === "claro" ? "text-blue-700 font-extrabold drop-shadow-2xs" : "text-cyan-300 font-semibold drop-shadow-xs"
                    }`}>
                      <TypewriterText text={data.especialidad} />
                      <span className="sr-only"> en {data.ciudad || "Ecuador"}</span>
                    </h1>
                  </div>

                  {/* CIUDAD / UBICACIÓN */}
                  <div className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-3.5 py-1 rounded-full hero-animate-location ${
                    data.tipoOverlayHero === "claro" 
                      ? "text-slate-800 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm" 
                      : "text-slate-200/90 bg-slate-900/60 backdrop-blur-sm border border-white/10"
                  }`}>
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{data.ciudad} | {data.estadoRegion || data.pais || "Ecuador"}</span>
                  </div>

                  {/* CTA PRINCIPAL */}
                  <div className={`w-full flex ${isDesktopAlignLeft ? "justify-start" : "justify-center"} pt-1.5 hero-animate-cta`}>
                    <a 
                      href="#agendar-preview" 
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection("contacto");
                      }}
                      className={`${isDesktopAlignLeft ? "w-auto min-w-[260px] mx-0" : "w-[80%] sm:w-auto sm:min-w-[280px] max-w-md mx-auto"} inline-flex items-center justify-center gap-2.5 font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer group text-center bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-500/30 ${
                        data.estiloCta === "estatico_pulso"
                          ? "ring-4 ring-emerald-400/40 shadow-xl animate-pulse hover:animate-none"
                          : ""
                      }`}
                    >
                      <Calendar className="w-5 h-5 shrink-0 text-emerald-100 group-hover:scale-110 transition-transform" />
                      <span className="uppercase tracking-wide font-bold">Agendar Cita</span>
                    </a>
                  </div>

                  {/* REDES SOCIALES & BOTONES DE ACCIÓN RÁPIDA (Orden: Facebook, Instagram, TikTok, Llamar, Compartir) */}
                  <div className={`flex items-center ${isDesktopAlignLeft ? "justify-start" : "justify-center"} gap-2.5 pt-1 flex-wrap hero-animate-social`}>
                    {/* 1. Facebook */}
                    <a 
                      href={data.facebookUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook del Especialista"
                      title="Facebook"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    >
                      <Facebook className="w-5 h-5 fill-current" />
                    </a>

                    {/* 2. Instagram */}
                    <a 
                      href={data.instagramUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram del Especialista"
                      title="Instagram"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>

                    {/* 3. TikTok */}
                    <a 
                      href={data.tiktokUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok del Especialista"
                      title="TikTok"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.126V9.4a6.33 6.33 0 0 0-.87-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.48c.18-.18.34-.37.49-.57V10.7a8.28 8.28 0 0 0 5.28 1.93v-3.45a4.84 4.84 0 0 1-3.23-.97c-.01-.01-.02-.02-.04-.03l3.27-1.49z"/>
                      </svg>
                    </a>

                    {/* 4. Teléfono / Llamar */}
                    <a 
                      href={data.telefonoGBP ? `tel:${data.telefonoGBP}` : "#"} 
                      aria-label="Llamar al Consultorio"
                      title="Llamada Directa"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0288D1] hover:bg-[#0277bd] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    >
                      <Phone className="w-5 h-5" />
                    </a>

                    {/* 5. Compartir Perfil en Redes Sociales */}
                    <button 
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      aria-label="Compartir perfil en redes sociales"
                      title="Compartir Perfil en Redes Sociales"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* BADGE DE HORARIO EN VIVO */}
                  <div className={`pt-1.5 w-full flex ${isDesktopAlignLeft ? "justify-start" : "justify-center"} hero-animate-status`}>
                    <button 
                      type="button"
                      onClick={() => scrollToSection("contacto")}
                      title="Click para ver horario completo de atención"
                      className={`inline-flex items-center gap-1.5 sm:gap-2 md:gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 md:px-4.5 md:py-2 rounded-full backdrop-blur-md border shadow-md text-xs md:text-sm font-semibold transition-all cursor-pointer group/badge max-w-full overflow-hidden ${
                        data.tipoOverlayHero === "claro"
                          ? "bg-white/90 hover:bg-white text-slate-900 border-slate-300/80 shadow-md"
                          : "bg-slate-900/85 hover:bg-slate-800 active:bg-slate-950 text-white border-white/20"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0 ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-500 animate-pulse' : liveStatus.dotColor === 'amber' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
                      {device === "mobile" ? (
                        <span className={`transition-colors font-bold text-xs whitespace-nowrap truncate ${data.tipoOverlayHero === "claro" ? "group-hover/badge:text-blue-700 text-slate-900" : "group-hover/badge:text-cyan-300 text-white"}`}>
                          {liveStatus.badgeText}
                        </span>
                      ) : (
                        <>
                          <span className={`md:hidden transition-colors font-bold text-xs whitespace-nowrap truncate ${data.tipoOverlayHero === "claro" ? "group-hover/badge:text-blue-700 text-slate-900" : "group-hover/badge:text-cyan-300 text-white"}`}>
                            {liveStatus.badgeText}
                          </span>
                          <span className={`hidden md:inline-flex items-center gap-2 transition-colors text-xs lg:text-sm whitespace-nowrap ${data.tipoOverlayHero === "claro" ? "group-hover/badge:text-blue-700 text-slate-900" : "group-hover/badge:text-cyan-300 text-white"}`}>
                            <span className="font-bold">{liveStatus.badgeText}</span>
                            <span className="text-slate-400">•</span>
                            <span className={`font-medium text-xs lg:text-sm ${data.tipoOverlayHero === "claro" ? "text-slate-700" : "text-slate-300"}`}>{liveStatus.badgeDetail}</span>
                          </span>
                        </>
                      )}
                      <span className={`text-[10px] sm:text-xs font-normal group-hover/badge:underline inline-flex items-center gap-0.5 ml-0.5 md:ml-1.5 shrink-0 whitespace-nowrap ${data.tipoOverlayHero === "claro" ? "text-blue-700 font-bold" : "text-cyan-400"}`}>
                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                        <span>Ver horario</span>
                      </span>
                    </button>
                  </div>

                  {shareFeedback && (
                    <div className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-400/40 animate-in fade-in">
                      {shareFeedback}
                    </div>
                  )}
                </div>
              );

              // Renderizado para DESKTOP
              if (isDesktop) {
                if (disenoDesktop === "invertido") {
                  return (
                    <div className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-12 grid grid-cols-12 items-center gap-8 lg:gap-12 text-left my-auto">
                      {/* Columna Izquierda: Foto del Médico (Col 5) */}
                      <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-start items-center">
                        {photoNode}
                      </div>

                      {/* Columna Derecha: Información del Médico (Col 7) */}
                      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-start space-y-3 sm:space-y-3.5">
                        {infoNode}
                      </div>
                    </div>
                  );
                }

                if (disenoDesktop === "centrado") {
                  return (
                    <div className="relative z-10 w-full max-w-3xl mx-auto px-6 lg:px-12 flex flex-col items-center justify-center text-center my-auto">
                      {infoNode}
                    </div>
                  );
                }

                // Versión "estandar" (Por defecto: Info Izq, Foto Der)
                return (
                  <div className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-12 grid grid-cols-12 items-center gap-8 lg:gap-12 text-left my-auto">
                    {/* Columna Izquierda: Información del Médico (Col 7) */}
                    <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-start space-y-3 sm:space-y-3.5">
                      {infoNode}
                    </div>

                    {/* Columna Derecha: Foto del Médico (Col 5) */}
                    <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end items-center">
                      {photoNode}
                    </div>
                  </div>
                );
              }

              // Renderizado para MOBILE Y TABLET (1 columna vertical: Logotipo -> Foto de Perfil -> Información)
              return (
                <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center justify-center space-y-1 sm:space-y-3.5 text-center my-auto -mt-3.5 sm:mt-0">
                  {/* 1. LOGOTIPO (Visible únicamente en Mobile y Tablet, Oculto en Desktop) */}
                  {data.logoUrl ? (
                    <div className="w-full flex justify-center items-center -mt-2 sm:-mt-2 pt-0 pb-0 animate-in fade-in slide-in-from-top-2 duration-700">
                      <img 
                        src={data.logoUrl || undefined} 
                        alt={`Logotipo ${data.nombreMedico}`} 
                        style={{ height: `${Math.round(currentLogoH * 1.25)}px`, maxHeight: `${Math.round(currentLogoH * 1.25)}px`, width: 'auto' }}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="object-contain bg-transparent filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-all duration-200 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-md -mt-1 animate-in fade-in duration-500 ${
                      data.tipoOverlayHero === "claro"
                        ? "bg-slate-900 text-white border border-slate-700 shadow-sm"
                        : "bg-white/10 backdrop-blur-md border border-white/20 text-white/90"
                    }`}>
                      <Stethoscope className={`w-3.5 h-3.5 ${data.tipoOverlayHero === "claro" ? "text-cyan-300" : "text-cyan-400"}`} />
                      <span>Atención Médica Especializada</span>
                    </div>
                  )}

                  {/* 2. FOTO DEL MÉDICO (Arriba de la información en Mobile/Tablet, Oculta si es versión centrada) */}
                  {!isCentradoVersion && photoNode}

                  {/* 3. INFORMACIÓN DEL MÉDICO (Abajo de la foto en Mobile/Tablet) */}
                  {infoNode}
                </div>
              );
            })()}
          </section>
        )}

        {/* FRANJA DE SALUDO PERSONALIZADO BAJO EL HERO (FONDO TRANSPARENTE) */}
        {(data.habilitarPopupBienvenida ?? true) && (
          <div id="preview-franja-saludo" className="w-full py-4 sm:py-5 px-4 sm:px-6 text-center bg-transparent border-b border-slate-200/40 animate-in fade-in duration-500">
            <style>{`
              @keyframes heartbeat4s {
                0%, 82%, 100% {
                  transform: scale(1);
                }
                87% {
                  transform: scale(1.18);
                }
                92% {
                  transform: scale(1.02);
                }
                96% {
                  transform: scale(1.12);
                }
              }
              .heartbeat-4s {
                animation: heartbeat4s 4s ease-in-out infinite;
                will-change: transform;
              }
            `}</style>
            <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] hover:scale-125 transition-transform duration-300 select-none heartbeat-4s inline-block cursor-default" role="img" aria-label="Icono Saludo 3D">
                {data.popupBienvenidaIcono || "😊"}
              </span>
              <p className="text-sm sm:text-base md:text-lg font-bold sm:font-semibold text-slate-800 tracking-tight leading-snug">
                {visitorName ? (
                  (() => {
                    const fullTemplate = data.franjaSaludoHeroTexto || "¡Hola {nombre}, te muestro un poco de mi!";
                    const parts = fullTemplate.split("{nombre}");
                    return (
                      <span>
                        {parts[0]}
                        <span style={{ color: activeColorScale["600"] }} className="font-extrabold">
                          {visitorName}
                        </span>
                        {parts[1] || ""}
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-slate-600">
                    {(data.franjaSaludoHeroTexto || "¡Hola {nombre}, te muestro un poco de mi!").replace("{nombre}", "visitante")}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* NOSOTROS / ACERCA DE + GALERÍA FUSIONADA */}
        {(isSectionVisible("eeat") || (isSectionVisible("galeria") && data.fotosConsultorio && data.fotosConsultorio.length > 0)) && (
          <section id="preview-landing-nosotros" className="p-6 sm:p-8 bg-white space-y-6 text-left">
          {isSectionVisible("eeat") && (
            <>
              <div className="space-y-2.5">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-${getC("50")} text-${getC("700")} border border-${getC("200")}/80 shadow-2xs`}>
                  <ShieldCheck className={`w-3.5 h-3.5 text-${getC("600")} shrink-0`} />
                  <span>{isClinica ? "Sobre Nosotros / Centro Médico" : "Sobre el Especialista"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 leading-tight">{isClinica ? "Trayectoria e Instalaciones" : "Trayectoria y formación"}</h2>
                <p className={`text-xs sm:text-sm font-semibold text-${getC("700")} tracking-wide`}>Experiencia, acreditaciones y compromiso con el paciente</p>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {data.biografiaCurta}
                </p>
              </div>

              {/* Badges y Stats Rápidos de Alto Impacto (Diseño Vertical Compacto Mobile-First) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 py-2">
                {/* CARD 1: EXPERIENCIA MÉDICA */}
                <div className={`relative overflow-hidden p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-${getC("50")}/50 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 group border-l-4 border-l-${getC("600")} flex flex-col items-start gap-2 sm:gap-3`}>
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-${getC("600")} to-${getC("700")} text-white shadow-xs shadow-${getC("600")}/20 flex items-center justify-center shrink-0 ring-2 sm:ring-4 ring-${getC("100")}/80 group-hover:scale-105 transition-transform duration-300`}>
                    <Award className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
                  </div>
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xl sm:text-3xl font-black text-${getC("600")} tracking-tight`}>+{data.anosExperiencia}</span>
                      <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md bg-${getC("100")} text-${getC("800")} uppercase tracking-wider`}>
                        Años Exp.
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-wide mt-1 leading-snug">{isClinica ? "Trayectoria Institucional Acreditada" : "Trayectoria Médica Acreditada"}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5">Experiencia clínica y actualización continua</p>
                  </div>
                </div>

                {/* CARD 2: PUNTUACIÓN DE PACIENTES */}
                <div className="relative overflow-hidden p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-amber-50/50 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 group border-l-4 border-l-amber-500 flex flex-col items-start gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs shadow-amber-500/20 flex items-center justify-center shrink-0 ring-2 sm:ring-4 ring-amber-100/80 group-hover:scale-105 transition-transform duration-300">
                    <Star className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white fill-white" />
                  </div>
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">4.9<span className="text-xs sm:text-lg text-slate-400 font-bold">/5</span></span>
                      <div className="flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500 text-amber-500 shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">Reseñas</span>
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-wide mt-1 leading-snug">Puntuación Pacientes</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex text-amber-400 text-[10px] sm:text-xs">★★★★★</div>
                      <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold">(Excelente)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de acceso al Perfil Médico con Animación Bounce */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-${getC("600")} hover:bg-${getC("700")} text-white text-xs sm:text-sm font-extrabold uppercase tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer animate-bounce hover:animate-none`}
                  style={{ animationDuration: '2.5s' }}
                >
                  <UserCheck className="w-5 h-5 text-white shrink-0" />
                  <span className="font-black">{isClinica ? "CONOCE NUESTRO CENTRO" : "MI PERFIL COMPLETO"}</span>
                </button>
              </div>
            </>
          )}

          {/* GALERÍA DE INSTALACIONES & CONSULTORIO FUSIONADA ABAJO DE LA INFORMACIÓN */}
          {isSectionVisible("galeria") && data.fotosConsultorio && data.fotosConsultorio.length > 0 && (
            <ClinicGalleryPreviewCarousel
              photos={data.fotosConsultorio || []}
              primaryColorClass={getC("600")}
              getC={getC}
              subtituloInstalaciones={data.subtituloInstalaciones}
              tituloInstalaciones={data.tituloInstalaciones}
              descripcionInstalaciones={data.descripcionInstalaciones}
              isClinica={isClinica}
              isMerged={isSectionVisible("eeat")}
            />
          )}
        </section>
        )}

        {/* SERVICIOS - 5 PRINCIPALES CON H2 PARA SEO + BOTÓN "MIS SERVICIOS" */}
        {isSectionVisible("servicios") && (
          <section id="preview-landing-servicios" className="p-6 sm:p-8 bg-slate-50 space-y-6 text-left">
          <div className="text-center pb-2">
            <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-3.5 py-1 rounded-full inline-block mb-2`}>
              Tratamientos & Procedimientos
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">Procedimientos y Tratamientos Especializados</h2>
          </div>

          {/* Grid de servicios principales (6 en desktop, 4 en tablet/mobile) */}
          <div className={`grid ${device === "desktop" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : device === "tablet" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            {(showAllServicesInGrid ? data.servicios : data.servicios.slice(0, device === "desktop" ? 6 : 4)).map((srv, idx) => {
              const hasImage = srv.mostrarImagen !== false && Boolean(srv.imagenUrl);

              return (
                <div 
                  key={srv.id || idx} 
                  className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4 hover:border-blue-300 hover:shadow-md transition-all group overflow-hidden"
                >
                  <div className="space-y-3 cursor-pointer" onClick={() => setSelectedServiceForDetail(srv)}>
                    {/* Contenedor Superior: Imagen o Badge Superior */}
                    {hasImage ? (
                      <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-2xs group-hover:scale-[1.015] transition-transform duration-300">
                        <img src={srv.imagenUrl} alt={srv.titulo} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
                          {(() => {
                            const isDestacado = Boolean(srv.destacado);
                            const text = srv.badgeEtiqueta || (isDestacado ? "DESTACADO" : "");
                            if (!text) return null;
                            if (isDestacado) {
                              return (
                                <span className="text-[10px] font-black tracking-wide uppercase text-amber-950 bg-amber-300 border border-amber-400/90 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                  ⭐ {text}
                                </span>
                              );
                            }
                            return (
                              <span className="text-[10px] font-bold tracking-wide uppercase text-slate-800 bg-white/90 backdrop-blur-xs border border-slate-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                                {text}
                              </span>
                            );
                          })()}
                        </div>
                        {srv.galeriaFotos && srv.galeriaFotos.length > 0 && (
                          <span className="absolute bottom-2 left-2 text-[10px] font-extrabold text-white bg-slate-900/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                            <ImageIcon className="w-3 h-3 text-blue-400" />
                            <span>+{srv.galeriaFotos.length} fotos</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl bg-${getC("50")} text-${getC("600")} border border-${getC("100")} shrink-0 h-12 w-12 flex items-center justify-center group-hover:bg-${getC("600")} group-hover:text-white transition-colors`}>
                          {renderIcon(srv.icono)}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {(() => {
                            const isDestacado = Boolean(srv.destacado);
                            const text = srv.badgeEtiqueta || (isDestacado ? "DESTACADO" : "");
                            if (!text) return null;
                            if (isDestacado) {
                              return (
                                <span className="text-[10px] font-black tracking-wide uppercase text-amber-950 bg-amber-300 border border-amber-400 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                  ⭐ {text}
                                </span>
                              );
                            }
                            return (
                              <span className="text-[10px] font-bold tracking-wide uppercase text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                                {text}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* TÍTULO Y DESCRIPCIÓN DEL SERVICIO */}
                    <div className="space-y-2 min-w-0">
                      <h2 className={`text-base sm:text-lg font-extrabold text-slate-950 leading-snug group-hover:text-${getC("600")} transition-colors`}>
                        {srv.titulo}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 font-normal">
                        {srv.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Indicadores Rápidos (Ficha Técnica: Precio, Duración, Recuperación, Modalidad) */}
                  <div className="space-y-3 pt-2.5 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {srv.precio && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-md" title="Inversión / Precio Estimado">
                          <Banknote className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{srv.precio}</span>
                        </span>
                      )}
                      {srv.duracion && (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-md" title="Duración de la Cita">
                          <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>⏳ {srv.duracion}</span>
                        </span>
                      )}
                      {srv.recuperacion && (
                        <span className="inline-flex items-center gap-1 font-bold text-purple-800 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-md" title="Tiempo de Recuperación">
                          <Activity className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>⏱️ {srv.recuperacion}</span>
                        </span>
                      )}
                      {srv.modalidad && (
                        <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-md" title="Modalidad de Atención">
                          <Building2 className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>🏥 {srv.modalidad}</span>
                        </span>
                      )}
                      {data.aseguradoras && data.aseguradoras.length > 0 && srv.aplicaReembolso !== false && (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 border border-slate-200/90 px-2.5 py-0.5 rounded-md text-[10px]" title="Factura SRI válida para reembolso de seguros médicos">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Cobertura Seguros / Reembolso</span>
                        </span>
                      )}
                    </div>

                    {/* BOTÓN "VER MÁS" PARA CADA TARJETA DE SERVICIO */}
                    <button
                      type="button"
                      onClick={() => setSelectedServiceForDetail(srv)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-${getC("600")} hover:bg-${getC("700")} active:bg-${getC("800")} text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 shadow-xs shadow-${getC("600")}/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border border-${getC("600")}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Ver más</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón "Más servicios" para expandir/mostrar el catálogo directamente en la cuadrícula */}
          {data.servicios.length > (device === "desktop" ? 6 : 4) && (
            <div className="pt-3 text-center flex flex-col items-center justify-center">
              <button
                type="button"
                id="btn-open-all-services-modal"
                onClick={() => setShowAllServicesInGrid(!showAllServicesInGrid)}
                className={`w-[90%] max-w-lg inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-${getC("600")} hover:bg-${getC("700")} text-white text-xs sm:text-base font-extrabold uppercase tracking-wider shadow-lg shadow-${getC("600")}/25 hover:shadow-xl hover:shadow-${getC("600")}/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer group animate-heartbeat hover:animate-none`}
              >
                <Stethoscope className="w-4 sm:w-5 h-4 sm:h-5 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
                <span className="whitespace-nowrap">
                  {showAllServicesInGrid ? "Menos servicios" : "Más servicios"}
                </span>
                <ChevronDown className={`w-5 h-5 ml-0.5 sm:ml-1 transition-transform duration-300 shrink-0 ${showAllServicesInGrid ? "rotate-180" : ""}`} />
              </button>
              <p className="text-sm text-slate-700 mt-2 font-bold">
                {showAllServicesInGrid
                  ? "Mostrando la totalidad de tratamientos y procedimientos disponibles"
                  : `Muestra ${data.servicios.length - (device === "desktop" ? 6 : 4)} procedimiento(s) adicional(es)`}
              </p>
            </div>
          )}
        </section>
        )}

        {/* SECCIÓN DE REDES SOCIALES Y REELS (INSTAGRAM, TIKTOK, FACEBOOK, YOUTUBE) */}
        {isSectionVisible("redes_sociales") && (
          <section id="preview-landing-redes-sociales" className="p-6 sm:p-8 bg-white border-t border-slate-200/80 space-y-6 text-left">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-${getC("50")} text-${getC("600")} border border-${getC("200")}/80`}>
                <Film className="w-3.5 h-3.5" />
                Redes Sociales & Reels Médicos
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
                Síguenos en Redes Sociales & Mira Nuestros Videos
              </h2>
              <p className={`text-xs sm:text-sm text-${getC("700")} font-medium leading-relaxed`}>
                Compartimos contenido informativo, consejos de salud, explicación de procedimientos y reels en tiempo real en nuestras plataformas oficiales.
              </p>

              {/* Botones rápidos de perfiles oficiales */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {data.instagramUrl && (
                  <a
                    href={data.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-extrabold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                )}

                {data.tiktokUrl && (
                  <a
                    href={data.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-cyan-400 font-extrabold text-xs">♪</span>
                    <span>TikTok</span>
                  </a>
                )}

                {data.facebookUrl && (
                  <a
                    href={data.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </a>
                )}

                {data.youtubeUrl && (
                  <a
                    href={data.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </a>
                )}

                {data.linkedinUrl && (
                  <a
                    href={data.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-extrabold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            {/* Grid de Videos / Reels (Máximo 6) */}
            {data.redesSocialesVideos && data.redesSocialesVideos.length > 0 ? (
              <div className={`grid ${device === "desktop" ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-2"} gap-4 pt-2`}>
                {data.redesSocialesVideos.slice(0, 6).map((vid, idx) => {
                  const getPlatformInfo = (plat: string) => {
                    switch (plat) {
                      case "tiktok":
                        return { name: "TikTok", bg: "bg-slate-900 text-cyan-300", badge: "🎵 TikTok Video", border: "hover:border-slate-800" };
                      case "facebook":
                        return { name: "Facebook", bg: "bg-blue-600 text-white", badge: "📘 Facebook Watch", border: "hover:border-blue-500" };
                      case "youtube":
                        return { name: "YouTube", bg: "bg-red-600 text-white", badge: "▶️ YouTube Short", border: "hover:border-red-500" };
                      case "instagram":
                      default:
                        return { name: "Instagram", bg: "bg-gradient-to-r from-purple-600 to-pink-500 text-white", badge: "📸 Instagram Reel", border: "hover:border-pink-500" };
                    }
                  };

                  const platInfo = getPlatformInfo(vid.plataforma);
                  const thumb = vid.thumbnailUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop";

                  return (
                    <div 
                      key={vid.id || idx}
                      className={`group relative rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${platInfo.border}`}
                    >
                      {/* Visual Poster Card with Play Button */}
                      <div className="relative aspect-[4/5] sm:aspect-[9/16] max-h-[320px] w-full bg-slate-900 overflow-hidden">
                        <img 
                          src={thumb} 
                          alt={vid.titulo} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                        {/* Badge Plataforma */}
                        <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs ${platInfo.bg}`}>
                          {platInfo.badge}
                        </span>

                        {/* Play Button Overlay */}
                        <button
                          type="button"
                          onClick={() => setActiveVideoModal({
                            url: vid.videoUrl || "#",
                            title: vid.titulo,
                            platform: vid.plataforma || "instagram",
                            desc: vid.descripcion
                          })}
                          className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
                          title={`Reproducir ${vid.titulo} en la web`}
                        >
                          <div className="w-13 h-13 rounded-full bg-white/90 group-hover/play:bg-white text-slate-900 flex items-center justify-center shadow-xl transform group-hover/play:scale-110 transition-all duration-300 pl-0.5">
                            <Play className="w-6 h-6 fill-current text-pink-600" />
                          </div>
                        </button>

                        {/* Título sobre el thumbnail */}
                        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                          <h3 className="text-xs sm:text-sm font-extrabold leading-snug line-clamp-2 text-white drop-shadow-md">
                            {vid.titulo}
                          </h3>
                        </div>
                      </div>

                      {/* Footer Info & Action */}
                      <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2">
                        {vid.descripcion && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {vid.descripcion}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveVideoModal({
                            url: vid.videoUrl || "#",
                            title: vid.titulo,
                            platform: vid.plataforma || "instagram",
                            desc: vid.descripcion
                          })}
                          className="inline-flex items-center justify-between text-xs font-extrabold text-pink-600 hover:text-pink-700 pt-1 border-t border-slate-100/80 transition-colors cursor-pointer"
                        >
                          <span>▶️ Reproducir en la Web</span>
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500">
                <Film className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Explora nuestro contenido en redes sociales</p>
                <p className="text-[11px] text-slate-500 mt-1">Visita nuestros perfiles oficiales arriba para ver videos y reels informativos.</p>
              </div>
            )}
          </section>
        )}



        {/* CASOS COMPARATIVOS - SLIDERS INTERACTIVOS */}
        {isSectionVisible("casos") && data.casosAntesDespues && data.casosAntesDespues.length > 0 && (
          <section id="preview-landing-casos" className="p-6 sm:p-8 bg-white space-y-5 text-left">
            <div className="text-center pb-2">
              <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-3 py-1 rounded-full inline-block`}>
                Casos Clínicos
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2">Casos Clínicos</h2>
              <p className={`text-xs sm:text-sm text-${getC("700")} font-medium mt-1`}>Arrastra o haz clic en el slider de cualquier caso para comparar resultados:</p>
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

        {/* OPINIONES / RESEÑAS & WIDGET GOOGLE MAPS */}
        {isSectionVisible("opiniones") && ((data.resenas && data.resenas.length > 0) || (data.habilitarGoogleReviewsWidget ?? true)) && (
          <section id="resenas" className="p-6 sm:p-8 md:p-10 bg-slate-50/50 space-y-6 text-left border-t border-slate-200/70" aria-label="Opiniones y testimonios de pacientes">
            <div className="text-center max-w-xl mx-auto space-y-2 pb-1">
              <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-3.5 py-1 rounded-full inline-block mb-1`}>
                Opiniones & Testimonios
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Qué opinan los pacientes</h2>
              <p className={`text-xs sm:text-sm text-${getC("700")} font-medium leading-relaxed`}>
                Opiniones y testimonios de pacientes atendidos en <strong>{data.ciudad || "Ecuador"}</strong>.
              </p>
            </div>

            {/* WIDGET GOOGLE REVIEWS (GOOGLE BUSINESS PROFILE / GOOGLE MAPS) */}
            {(data.habilitarGoogleReviewsWidget ?? true) && (
              <div id="google-reviews-widget-preview" className="p-5 sm:p-6 rounded-2xl bg-white border border-indigo-200/80 shadow-xs space-y-4 neon-card-soft">
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

                  {/* Botón de acción minimalista con latido neón suave */}
                  {data.googleMapsReviewsUrl && (
                    <a
                      href={data.googleMapsReviewsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-4.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-blue-400/60 text-xs sm:text-sm font-extrabold shadow-xs hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 self-start md:self-auto neon-pulse-btn"
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

            {/* INTERACTIVE REVIEW CAROUSEL */}
            {data.resenas && data.resenas.length > 0 && (
              <ReviewsInteractiveCarousel resenas={data.resenas} getC={getC} />
            )}

            {/* CALL TO ACTION: LEAVE A GOOGLE BUSINESS REVIEW */}
            {data.googleMapsReviewsUrl && (
              <div className="flex flex-col items-center justify-center pt-6 sm:pt-8 text-center">
                <div className="max-w-md w-full p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current shrink-0" />
                    ))}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900">¿Fuiste atendido por el {data.nombreMedico}?</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tu opinión es sumamente valiosa para nosotros y ayuda a otros pacientes en <strong>{data.ciudad || "Ecuador"}</strong> a encontrar la mejor atención médica.
                    </p>
                  </div>
                  <a
                    href={data.googleMapsReviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-4 py-3.5 w-full rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.636 0-8.403-3.728-8.403-8.4s3.767-8.4 8.403-8.4c2.086 0 3.978.74 5.46 2.2l3.184-3.185C18.358 1.155 15.42 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c7.03 0 11.76-4.945 11.76-12 0-.728-.088-1.423-.224-1.715H12.24z"/>
                    </svg>
                    <span>Escribir reseña en Google Business</span>
                    <ExternalLink className="w-4 h-4 text-slate-300 shrink-0" />
                  </a>
                </div>
              </div>
            )}
          </section>
        )}

        {/* SECCIÓN BLOG MÉDICO (SEO Long-Tail) */}
        {isSectionVisible("blog") && data.blogPosts && data.blogPosts.length > 0 && (
          <section id="preview-landing-blog" className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200/70 space-y-5 text-left">
            <div className="text-center pb-2">
              <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-3 py-1 rounded-full inline-block mb-2`}>
                Blog de Salud ({data.blogPosts.length})
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2">Artículos de Interés y Prevención</h2>
              <p className={`text-xs sm:text-sm text-${getC("700")} font-medium mt-1 max-w-lg mx-auto`}>
                Información confiable, respaldada por la ciencia y redactada para tu bienestar por especialistas.
              </p>
            </div>

            <div className={`grid ${device === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-6`}>
              {data.blogPosts.map((post, idx) => (
                <div key={post.id || idx} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col h-full">
                  <div className="h-40 relative overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={post.imagenUrl || undefined}
                      alt={post.titulo}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                      {post.categoria}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span>{post.fecha}</span>
                        <span>•</span>
                        <span>{post.tiempoLectura}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-950 line-clamp-2 leading-snug">
                        {post.titulo}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {post.extracto}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBlogPostModal(post)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl bg-${getC("600")} hover:bg-${getC("700")} active:bg-${getC("800")} text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 mt-2 shadow-sm shadow-${getC("600")}/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200 border border-${getC("600")}`}
                    >
                      <span>Leer artículo completo</span>
                      <ArrowRight className="w-4 h-4 text-white shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECCIÓN GUÍAS, EBOOKS & FICHAS PARA PACIENTES */}
        {isSectionVisible("guias") && data.guiasPacientes && data.guiasPacientes.length > 0 && (
          <section id="preview-landing-guias" className="p-6 sm:p-8 md:p-10 bg-white text-slate-900 border-t border-slate-200/80 space-y-8 text-left relative overflow-hidden" aria-label="Guías y fichas para pacientes">
            {/* Decoración sutil con el color primario de la web */}
            <div className={`absolute -right-20 -top-20 w-72 h-72 bg-${getC("500")}/5 rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -left-20 -bottom-20 w-72 h-72 bg-${getC("500")}/5 rounded-full blur-3xl pointer-events-none`} />

            {/* Cabecera limpia sin el logotipo secundario */}
            <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
              <span className={`text-[11px] font-extrabold text-${getC("800")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/80 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs`}>
                <FileDown className={`w-3.5 h-3.5 text-${getC("600")}`} />
                Recursos Médicos & Ebooks ({data.guiasPacientes.length})
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Guías, Ebooks y Fichas para Pacientes
              </h2>
              <p className={`text-xs sm:text-sm text-${getC("800")}/80 font-medium leading-relaxed max-w-2xl mx-auto`}>
                Material educativo en PDF para orientación y preparación antes y después de tu consulta médica.
              </p>
            </div>

            {/* Grid de Tarjetas con Fondo Blanco, Imagen de Portada y Botones Elegantes */}
            <div className={`grid ${device === "desktop" && data.guiasPacientes.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-5 sm:gap-6 max-w-5xl mx-auto relative z-10`}>
              {data.guiasPacientes.map((guia, idx) => {
                const deliveryMethod = guia.metodoEntrega || "todos";

                // Enlace de WhatsApp
                const phoneClean = (data.telefonoGBP || "").replace(/[^0-9]/g, "");
                const waMessage = encodeURIComponent(`Hola ${data.nombreMedico}, me gustaría solicitar la guía descargable: "${guia.titulo}"`);
                const waUrl = data.whatsappUrl && data.whatsappUrl.startsWith("http")
                  ? data.whatsappUrl
                  : `https://wa.me/${phoneClean || "593991234567"}?text=${waMessage}`;
                
                // Enlace de Correo
                const mailUrl = `mailto:${data.emailContacto || "contacto@medico.com"}?subject=${encodeURIComponent(`Solicitud de Guía: ${guia.titulo}`)}&body=${encodeURIComponent(`Hola ${data.nombreMedico},\n\nDesearía recibir la guía médica "${guia.titulo}" en PDF.\n\nSaludos.`)}`;

                return (
                  <div 
                    key={guia.id || idx}
                    className={`p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-${getC("300")} shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5 group relative`}
                  >
                    <div className="space-y-3 text-left">
                      {/* Imagen de Portada de la Guía / Ebook */}
                      {guia.imagenPortadaUrl && (
                        <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-slate-100 shadow-2xs group-hover:shadow-xs transition-shadow">
                          <img
                            src={guia.imagenPortadaUrl}
                            alt={guia.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Categoría y Formato */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-${getC("50")} text-${getC("800")} border border-${getC("200")}`}>
                          {guia.categoria || "Guía Médica"}
                        </span>

                        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <FileText className={`w-3.5 h-3.5 text-${getC("600")}`} />
                          {guia.formato || "PDF"} • {guia.tamano || "1.8 MB"}
                        </span>
                      </div>

                      {/* Título de la Guía */}
                      <h3 className={`text-base font-extrabold text-slate-900 group-hover:text-${getC("700")} transition-colors leading-snug`}>
                        {guia.titulo}
                      </h3>

                      {/* Descripción */}
                      {guia.descripcion && (
                        <p className="text-sm text-slate-600 leading-relaxed font-normal">
                          {guia.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Botones de Acción Múltiple con Animaciones e Identidad de Landing Page */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row flex-wrap items-center gap-2.5">
                      {/* Opción 1: Descarga Directa desde Servidor / cPanel */}
                      {(deliveryMethod === "todos" || deliveryMethod === "descarga_directa") && (
                        <button
                          type="button"
                          onClick={() => handleStartGuideDownload(guia)}
                          style={{ backgroundColor: activeColorScale["600"] }}
                          className="group/btn px-4 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer flex-1 min-w-[130px]"
                        >
                          <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform duration-200" />
                          <span>Descarga Directa</span>
                        </button>
                      )}

                      {/* Opción 2: Solicitar por WhatsApp */}
                      {(deliveryMethod === "todos" || deliveryMethod === "whatsapp") && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 flex-1 min-w-[140px]"
                        >
                          <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                          <span>Solicitar por WhatsApp</span>
                        </a>
                      )}

                      {/* Opción 3: Solicitar por Correo */}
                      {(deliveryMethod === "todos" || deliveryMethod === "email") && (
                        <a
                          href={mailUrl}
                          className="group/btn px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 flex-1 min-w-[130px]"
                        >
                          <Mail className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                          <span>Solicitar por Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* AGENDAR Y MAPA (Contacto) */}
        {isSectionVisible("horarios_ubicacion") && (
          <section id="agendar-preview" className="p-5 sm:p-8 md:p-10 bg-white border-t border-slate-200/70 text-left">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
              {/* Encabezado */}
              <div className="space-y-2 text-left max-w-2xl">
                <span className={`text-xs font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-3 py-1 rounded-lg inline-block`}>Contáctenos</span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-950 tracking-tight font-display">Agenda tu Valoración</h2>
                <p className={`text-sm sm:text-base text-${getC("700")} font-medium leading-relaxed`}>Atención médica personalizada y cita directa en {data.ciudad || "Ecuador"}.</p>
              </div>

              {/* Grid sincronizado: 1 columna en mobile con bloques redondeados, 2 columnas en desktop y tablet */}
              <div className={`grid ${device === "desktop" ? "grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch" : device === "tablet" ? "grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch" : "grid-cols-1 gap-6 items-start"}`}>
                
                {/* Columna Izquierda: Información de Contacto (NAP), Tarifas */}
                <div className={`${device === "desktop" ? "lg:col-span-6 xl:col-span-6" : device === "tablet" ? "md:col-span-6" : "w-full"} space-y-4 sm:space-y-5 flex flex-col justify-start`}>
                  {/* Tarjetas de Información de Contacto (NAP) individuales con separación amplia y legible */}
                  <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
                    {/* Ubicación física */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white sm:bg-slate-50/80 border border-slate-200/80 flex flex-col items-start gap-2.5 shadow-2xs text-left" style={{ padding: '1.25rem' }}>
                      <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="w-full text-left">
                        <p className="text-sm sm:text-base font-extrabold text-slate-950 text-left">Ubicación de Consulta</p>
                        <address className="not-italic text-slate-600 mt-1 leading-relaxed text-xs sm:text-sm text-left">
                          <strong className="text-slate-900 block text-sm sm:text-base mb-0.5 text-left">{data.nombreClinicaGBP}</strong>
                          <span className="text-left block">{data.direccionFisica}, CP {data.codigoPostal}, {data.ciudad}</span>
                        </address>
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white sm:bg-slate-50/80 border border-slate-200/80 flex flex-col items-start gap-2.5 shadow-2xs text-left" style={{ padding: '1.25rem' }}>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="w-full text-left">
                        <p className="text-sm sm:text-base font-extrabold text-slate-950 text-left">Teléfono Directo</p>
                        <a href={`tel:${data.telefonoGBP}`} className="text-sm sm:text-base font-bold text-emerald-700 hover:text-emerald-800 hover:underline block mt-1 text-left">
                          {data.telefonoGBP}
                        </a>
                      </div>
                    </div>

                    {/* Horarios Clínicos y Estado en Tiempo Real (Tarjeta destacada sutilmente con el color primario de la landing) */}
                    <div className={`p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${getC("bgGradient")}/40 via-white to-slate-50/80 border-2 border-${getC("200")}/90 shadow-xs flex flex-col items-start gap-3.5 text-left`} style={{ padding: '1.25rem' }}>
                      {/* Fila superior: Icono arriba a la izquierda y badge de disponibilidad a la derecha */}
                      <div className="w-full flex items-center justify-between gap-2">
                        <div className={`w-10 h-10 rounded-xl bg-${getC("100")} text-${getC("700")} flex items-center justify-center shrink-0 border border-${getC("200")}/80 shadow-2xs`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-2xs ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : liveStatus.dotColor === 'amber' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          <span className={`w-2 h-2 rounded-full ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-500 animate-pulse' : liveStatus.dotColor === 'amber' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
                          {liveStatus.badgeText}
                        </span>
                      </div>

                      <div className="w-full text-left">
                        <p className="text-sm sm:text-base font-black text-slate-950 text-left mb-2.5">Horarios de Atención</p>
                        <div className="space-y-1.5 w-full">
                          <div className={`flex items-center justify-between gap-3 text-xs sm:text-sm px-3 py-2 rounded-xl transition-all w-full box-border ${isSemanaActive ? `bg-${getC("100")}/70 font-extrabold text-${getC("950")} shadow-2xs` : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}>
                            <span className="font-semibold text-slate-600 text-left shrink-0 whitespace-nowrap" style={{ textAlign: 'left', flexShrink: 0, whiteSpace: 'nowrap' }}>Lunes a Viernes:</span>
                            <span className="font-bold text-slate-950 text-right ml-auto" style={{ textAlign: 'right', marginLeft: 'auto' }}>{cleanHorarioSemana}</span>
                          </div>
                          <div className="h-px bg-slate-200/80 w-full"></div>
                          <div className={`flex items-center justify-between gap-3 text-xs sm:text-sm px-3 py-2 rounded-xl transition-all w-full box-border ${isSabadoActive ? `bg-${getC("100")}/70 font-extrabold text-${getC("950")} shadow-2xs` : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}>
                            <span className="font-semibold text-slate-600 text-left shrink-0 whitespace-nowrap" style={{ textAlign: 'left', flexShrink: 0, whiteSpace: 'nowrap' }}>Sábados:</span>
                            <span className="font-bold text-slate-950 text-right ml-auto" style={{ textAlign: 'right', marginLeft: 'auto' }}>{cleanHorarioSabado}</span>
                          </div>
                          <div className="h-px bg-slate-200/80 w-full"></div>
                          <div className={`flex items-center justify-between gap-3 text-xs sm:text-sm px-3 py-2 rounded-xl transition-all w-full box-border ${isDomingoActive ? `bg-${getC("100")}/70 font-extrabold text-${getC("950")} shadow-2xs` : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}>
                            <span className="font-semibold text-slate-600 text-left shrink-0 whitespace-nowrap" style={{ textAlign: 'left', flexShrink: 0, whiteSpace: 'nowrap' }}>Domingos:</span>
                            <span className="font-bold text-slate-950 text-right ml-auto" style={{ textAlign: 'right', marginLeft: 'auto' }}>{cleanHorarioDomingo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

          {/* Tarifa de Consulta y Modalidad de Atención (Presencial vs. Teleconsulta) */}
          {isSectionVisible("tarifas") && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border border-emerald-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Modalidades & Tarifas</span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">Tarifas Transparentes</h3>
                  </div>
                </div>

                {data.habilitarTeleconsulta && (
                  <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setPricingTab("presencial");
                        setBookingModality("presencial");
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        pricingTab === "presencial"
                          ? "bg-white text-emerald-800 shadow-xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🏥 Presencial
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPricingTab("teleconsulta");
                        setBookingModality("teleconsulta");
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        pricingTab === "teleconsulta"
                          ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>💻 Teleconsulta</span>
                      <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase">Online</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Vista Tarifaria según Pestaña */}
              {(!data.habilitarTeleconsulta || pricingTab === "presencial") ? (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Consulta Médica Presencial</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">{data.precioConsulta || "$50 USD"}</span>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                      En Consultorio
                    </span>
                  </div>

                  <div className="border-t border-slate-200/80 pt-3">
                    <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide block mb-2">
                      Métodos de pago aceptados:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(data.metodosPago || ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"]).map((mp, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          {mp.toLowerCase().includes("efectivo") && <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {mp.toLowerCase().includes("transferencia") && <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                          {mp.toLowerCase().includes("tarjeta") && <CreditCard className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                          <span>{mp}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <div>
                      <span className="text-xs font-black uppercase text-emerald-700 tracking-wider block">Teleconsulta Médica Online (Videollamada)</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">{data.precioTeleconsulta || "$40 USD"}</span>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <span>🎥 Videoconsulta</span>
                    </span>
                  </div>

                  {/* Plataformas y Requisitos de Teleconsulta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                      <span className="font-extrabold text-slate-700 block mb-1">📱 Plataformas de Conexión:</span>
                      <p className="text-slate-600 font-medium">{data.plataformasTeleconsulta || "Zoom, Google Meet o WhatsApp Video"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                      <span className="font-extrabold text-slate-700 block mb-1">🌐 Cobertura Pacientes:</span>
                      <p className="text-slate-600 font-medium">{data.coberturaTeleconsulta || "Nacional e Internacional"}</p>
                    </div>
                  </div>

                  {data.requisitosTeleconsulta && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950">
                      <span className="font-extrabold block">📋 Requisitos para la Videoconsulta:</span>
                      <p className="mt-0.5 text-amber-900 leading-relaxed">{data.requisitosTeleconsulta}</p>
                    </div>
                  )}

                  <div className="border-t border-slate-200/80 pt-3">
                    <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide block mb-2">
                      Pagos digitales para Teleconsulta:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {["Transferencia Bancaria", "Tarjeta de Crédito/Débito", "Link de Pago Seguro"].map((mp, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          {mp.includes("Transferencia") && <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                          {mp.includes("Tarjeta") && <CreditCard className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                          {mp.includes("Link") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span>{mp}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Mapa Interactivo con tarjeta redondeada y altura adaptable */}
        <div className={`${device === "desktop" ? "lg:col-span-6 xl:col-span-6" : device === "tablet" ? "md:col-span-6" : "w-full"} flex flex-col ${device !== "mobile" ? "h-full" : ""}`}>
          <div className={`rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-50 relative flex flex-col ${device !== "mobile" ? "h-full flex-1" : ""}`}>
            <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {data.nombreClinicaGBP || "Consultorio Médico"}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${data.latitud},${data.longitud}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 shrink-0 transition-colors"
              >
                <span>Cómo llegar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className={`w-full ${device === "mobile" ? "h-60 sm:h-64" : "h-full flex-1 min-h-[300px]"}`}>
              <iframe 
                title="Preview Google Map"
                className="w-full h-full min-h-[220px] border-0 grayscale hover:grayscale-0 transition-all duration-300" 
                src={`https://maps.google.com/maps?q=${data.latitud},${data.longitud}&hl=es&z=15&amp;output=embed`}
                loading="lazy"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Tarjeta de Agendamiento Interactivo ("Selecciona el día de tu cita médica") ocupando TODO EL ANCHO */}
      <div className="w-full space-y-4 sm:space-y-5 pt-2">
        <div className="p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5 sm:space-y-6 text-left">
          {/* Header con icono arriba a la izquierda, título abajo y alineación estricta a la izquierda */}
          <div className="w-full flex flex-col items-start gap-3 text-left">
            <div className="w-full flex items-center justify-between gap-2 flex-wrap">
              <div className={`w-11 h-11 rounded-xl bg-${getC("100")} text-${getC("700")} flex items-center justify-center shrink-0 shadow-2xs`}>
                <Calendar className="w-5 h-5" />
              </div>

              {/* Selector de Modalidad en Desktop y Tablet (Fila superior a la derecha) */}
              {data.habilitarTeleconsulta && (
                <div className={`${device === "mobile" ? "hidden" : "hidden sm:inline-flex"} items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold`}>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingModality("presencial");
                      setPricingTab("presencial");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                      bookingModality === "presencial"
                        ? "bg-white text-emerald-800 shadow-xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🏥 Presencial
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingModality("teleconsulta");
                      setPricingTab("teleconsulta");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1 ${
                      bookingModality === "teleconsulta"
                        ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>💻 Teleconsulta</span>
                  </button>
                </div>
              )}
            </div>

            <div className="w-full text-left">
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 text-left">Selecciona el día de tu cita médica</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 text-left">Elige la modalidad, fecha, horario y motivo de tu atención.</p>

              {/* Selector de Modalidad en Mobile (debajo del texto explicativo) */}
              {data.habilitarTeleconsulta && (
                <div className={`${device === "mobile" ? "inline-flex" : "inline-flex sm:hidden"} mt-3 items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold`}>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingModality("presencial");
                      setPricingTab("presencial");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                      bookingModality === "presencial"
                        ? "bg-white text-emerald-800 shadow-xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🏥 Presencial
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingModality("teleconsulta");
                      setPricingTab("teleconsulta");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1 ${
                      bookingModality === "teleconsulta"
                        ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>💻 Teleconsulta</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Motivo / Tratamiento en una sola columna o línea completa */}
            <div className="w-full flex flex-col gap-1.5 text-left">
              <label htmlFor="preview-booking-service" className="text-xs sm:text-sm font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-slate-500" />
                  <span>Motivo / Tratamiento</span>
                </span>
                {bookingService && (
                  <button
                    type="button"
                    onClick={() => setBookingService("")}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </label>
              <select
                id="preview-booking-service"
                value={bookingService}
                onChange={(e) => setBookingService(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50/70 font-semibold text-slate-800 min-h-[44px] cursor-pointer"
              >
                <option value="">-- Consulta Médica de Especialidad ({data.especialidad || "General"}) --</option>
                {(data.servicios || []).map((srv, idx) => (
                  <option key={srv.id || idx} value={srv.titulo}>
                    {srv.titulo} {srv.precio ? `(${srv.precio})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Fecha, Horario y Nombre del paciente en Grid adaptable */}
            <div className={`grid ${device === "desktop" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
              {/* Selector de Fecha */}
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="preview-booking-date" className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Fecha preferida</span>
                </label>
                <input
                  id="preview-booking-date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50/70 font-semibold text-slate-800 min-h-[44px]"
                />
              </div>

              {/* Selector de Horario */}
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="preview-booking-time" className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Horario preferido</span>
                </label>
                <select
                  id="preview-booking-time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50/70 font-semibold text-slate-800 min-h-[44px] cursor-pointer"
                >
                  <option value="09:00 AM">09:00 AM (Mañana)</option>
                  <option value="10:30 AM">10:30 AM (Mañana)</option>
                  <option value="12:00 PM">12:00 PM (Mediodía)</option>
                  <option value="03:00 PM">03:00 PM (Tarde)</option>
                  <option value="04:30 PM">04:30 PM (Tarde)</option>
                  <option value="06:00 PM">06:00 PM (Tarde/Noche)</option>
                </select>
              </div>

              {/* Nombre opcional */}
              <div className={`flex flex-col gap-1.5 text-left ${device === "desktop" ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                <label htmlFor="preview-booking-name" className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  <span>Nombre del paciente (opcional)</span>
                </label>
                <input
                  id="preview-booking-name"
                  type="text"
                  placeholder="ej. María Gómez"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50/70 font-medium text-slate-800 min-h-[44px]"
                />
              </div>
            </div>

            {/* 3. Detalles de la consulta en una sola columna o línea completa */}
            <div className="w-full flex flex-col gap-1.5 text-left">
              <label htmlFor="preview-booking-details" className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Detalles de la consulta (opcional)</span>
              </label>
              <textarea
                id="preview-booking-details"
                placeholder="ej. Dolor de espalda, chequeo anual, renovación de receta..."
                value={bookingDetails}
                onChange={(e) => setBookingDetails(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50/70 font-medium text-slate-800 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Botones de Agenda Adaptables */}
        <div className="w-full">
          {data.estiloCta === "estatico_pulso" && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs text-xs font-black mb-2.5 w-full justify-center text-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>¡Agenda tu Consulta con Respuesta Prioritaria!</span>
            </div>
          )}
          <button 
            id="preview-btn-agenda-whatsapp"
            type="button"
            onClick={() => {
              setBookingModalService("whatsapp");
              setShowBookingModal(true);
            }}
            className={`w-full text-sm sm:text-base font-extrabold uppercase tracking-wide py-4 px-6 rounded-2xl text-center flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-500/30 min-h-[48px] ${
              data.estiloCta === "estatico_pulso" 
                ? "ring-4 ring-emerald-400/40 shadow-xl animate-pulse hover:animate-none" 
                : ""
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0 text-emerald-100" />
            <span>Confirmar cita</span>
          </button>
        </div>
      </div>

            </div>
          </section>
        )}

        {/* ASISTENTE (AL FINAL DE LA PÁGINA) */}
        {isSectionVisible("faqs") && (
          <section id="preview-landing-faq" className="p-6 sm:p-8 bg-slate-50/70 space-y-6 text-left border-t border-slate-200/80">
            <div className="max-w-3xl mx-auto">
              <div className="text-center pb-1">
                <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} px-3.5 py-1 rounded-full border border-${getC("200")}/60 inline-block`}>
                  Asistente
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2.5 tracking-tight">¿Preguntas frecuentes?</h2>
                <p className={`text-xs sm:text-sm text-${getC("700")} font-medium mt-1 max-w-lg mx-auto`}>Resuelve tus preguntas e inquietudes de forma inmediata y confidencial sobre la atención médica.</p>
              </div>

              {/* Asistente */}
              <div className="max-w-2xl mx-auto mt-6">
                <MedicalAiAssistantFaq data={data} colorName={data.paletaColor} />
              </div>
            </div>
          </section>
        )}

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
              <p className="text-xs text-slate-600 max-w-xl mx-auto">
                Atención con cobertura directa o trámite de reembolso con las principales compañías de seguro médico en Ecuador.
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

            {/* AVISO EXPLICATIVO DE REEMBOLSO EN ECUADOR */}
            <div className="max-w-2xl mx-auto p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/90 text-left flex items-start gap-3 text-xs text-blue-950 font-medium leading-relaxed mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>¿Cómo funciona el Reembolso Médico en Ecuador?</strong>
                <p className="text-[11px] text-blue-900 mt-0.5">
                  En cada consulta o procedimiento se emite la <strong>Factura Electrónica oficial autorizada por el SRI</strong> e incluye la entrega del <strong>Formulario de Reclamo Médico firmado (con código diagnóstico CIE-10)</strong> y su desglose para trámite ágil de reembolso o convenio directo con sus aseguradoras activas.
                </p>
              </div>
            </div>

            {/* Microdatos SEO Indexables e Invisibles (Servicio/Especialidad + Aseguradora + Ciudad Ecuador) */}
            <div className="sr-only" aria-hidden="true" itemScope itemType="https://schema.org/MedicalOrganization">
              <meta itemProp="name" content={`${data.especialidad} ${data.ciudad} - Seguros Médicos y Prepagada`} />
              <meta itemProp="description" content={`Atención de ${data.especialidad} en ${data.ciudad}, Ecuador con factura SRI válida para reembolso o convenio en ${(data.aseguradoras || []).join(", ")}.`} />
              {(data.aseguradoras || []).map((aseg, i) => (
                <div key={i} itemProp="healthPlanNetwork" itemScope itemType="https://schema.org/HealthInsurancePlan">
                  <meta itemProp="name" content={`${data.especialidad} en ${data.ciudad} con ${aseg}`} />
                  <meta itemProp="healthPlanNetworkId" content={aseg} />
                </div>
              ))}
              {(data.servicios || []).map((srv, sIdx) => (data.aseguradoras || []).map((aseg, aIdx) => (
                <div key={`${sIdx}-${aIdx}`} itemProp="hasOfferCatalog" itemScope itemType="https://schema.org/Offer">
                  <meta itemProp="name" content={`${srv.titulo} con seguro ${aseg} en ${data.ciudad}`} />
                  <meta itemProp="description" content={`Procedimiento de ${srv.titulo} en ${data.ciudad}, Ecuador con factura SRI para reembolso en ${aseg}.`} />
                </div>
              )))}
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
          {/* Cédula Profesional / Registro Sanitario (Preservado en código para SEO/Schema): {data.cedulaProfesional} */}
          <meta itemProp="identifier" content={data.cedulaProfesional} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-slate-500 text-xs pt-1">
            <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
            <p className="text-slate-400 font-medium">
              Desarrollado por{" "}
              <a href="https://medico.ec/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-colors">médico Ec</a>{" "}
              y{" "}
              <a href="https://mantaconect.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-colors">MC</a>
            </p>
          </div>
        </footer>

        {/* MODAL PERFIL MÉDICO */}
        <AnimatePresence>
          {showProfileModal && (
            <motion.div 
              id="preview-profile-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={() => setShowProfileModal(false)}
            >
              <motion.div 
                id="preview-profile-modal-card"
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Cabecera del Modal */}
                <div className={`bg-gradient-to-r from-${getC("600")} to-${getC("700")} p-5 sm:p-6 text-white relative`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={data.fotoUrl || undefined} 
                        alt={data.nombreMedico} 
                        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white/40 shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-100 block">
                          {isClinica ? "Institucional" : "Perfil Profesional"}
                        </span>
                        <h3 className="text-base sm:text-lg font-black leading-tight text-white">{data.nombreMedico}</h3>
                        <p className="text-xs text-white/90">
                          {data.especialidad} {data.mostrarRegistroPublico ? `• Reg. ${data.cedulaProfesional}` : `• ✓ Acreditado SENESCYT / MSP`}
                        </p>
                      </div>
                    </div>
                    <button
                      id="preview-close-profile-modal"
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      aria-label="Cerrar perfil médico"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Contenido del Resumen Completo */}
                <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto text-left">
                  
                  {/* Misión, Visión y Valores Institucionales / Profesionales */}
                  {(data.mision || data.vision || (data.valores && data.valores.filter(v => v && v.trim()).length > 0)) && (
                    <div className="space-y-3 pb-3 border-b border-slate-100">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Target className={`w-4 h-4 text-${getC("600")}`} />
                        {isClinica ? "Misión, Visión & Valores Institucionales" : "Misión, Visión & Valores Médicos"}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.mision && (
                          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100/90 text-left space-y-1 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-900 tracking-wide">
                              <Target className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>Misión</span>
                            </div>
                            <p className="text-xs text-purple-950 leading-relaxed font-medium">{data.mision}</p>
                          </div>
                        )}

                        {data.vision && (
                          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/90 text-left space-y-1 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-blue-900 tracking-wide">
                              <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Visión</span>
                            </div>
                            <p className="text-xs text-blue-950 leading-relaxed font-medium">{data.vision}</p>
                          </div>
                        )}
                      </div>

                      {data.valores && data.valores.filter(v => v && v.trim()).length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 space-y-2 text-left shadow-2xs">
                          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-900 tracking-wide">
                            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Valores Fundamentales</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {data.valores.filter(v => v && v.trim()).map((val, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-emerald-900 text-xs font-bold border border-emerald-200 shadow-2xs">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                {val}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hospitales de Operación & Quirófanos */}
                  {data.hospitalesdondeOpera && data.hospitalesdondeOpera.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Building2 className={`w-4 h-4 text-${getC("600")}`} />
                        Hospitales de Operación & Quirófanos
                      </h4>
                      <div className="space-y-2.5">
                        {data.hospitalesdondeOpera.map((hosp, i) => (
                          <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100">
                              <Building2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs sm:text-sm text-slate-900">{hosp}</p>
                              <p className="text-[11px] text-slate-500 font-medium truncate">Hospital con quirófano e instalaciones certificadas</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sociedades Científicas & Membresías */}
                  {data.asociaciones && data.asociaciones.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-600" />
                        Sociedades Científicas & Membresías
                      </h4>
                      <ul className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {data.asociaciones.map((asoc, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>{asoc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Certificaciones & Actualización Médica */}
                  {data.certificados && data.certificados.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        Certificaciones & Actualización Médica
                      </h4>
                      <ul className="space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/80">
                        {data.certificados.map((cert, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Distinciones & Reconocimientos */}
                  {data.reconocimientos && data.reconocimientos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Distinciones & Reconocimientos
                      </h4>
                      <ul className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/80">
                        {data.reconocimientos.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950 font-medium">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formación y Filosofía / Compromiso con el Paciente */}
                  {data.filosofia && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 text-xs text-blue-900 leading-relaxed">
                      <p className={`font-bold mb-1 text-${getC("800")} flex items-center gap-1.5 text-xs sm:text-sm`}>
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Compromiso con el Paciente:
                      </p>
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{data.filosofia}</p>
                    </div>
                  )}

                  {/* Redes Sociales y Canales Oficiales */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Redes Sociales y Canales Oficiales</h4>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* WhatsApp */}
                      {data.whatsappUrl && (
                        <a
                          href={data.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#25D366]/20 active:scale-90"
                          title="WhatsApp Profesional"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.53 1.771.815 2.796.815 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.767-5.768-5.767zm3.385 8.169c-.144.405-.837.774-1.17.824-.312.045-.694.077-2.228-.557-1.782-.738-2.909-2.553-2.997-2.671-.088-.118-.72-1.026-.72-1.956 0-.93.486-1.387.659-1.579.173-.191.381-.239.508-.239.127 0 .254.001.365.006.118.006.275-.045.431.33.161.385.55 1.341.599 1.439.048.098.081.213.016.342-.066.129-.098.21-.196.326-.098.116-.207.26-.296.349-.099.098-.202.205-.087.402.115.197.511.843 1.096 1.364.754.672 1.389.88 1.587.978.197.098.313.082.427-.049.115-.131.492-.574.623-.77.131-.197.262-.164.443-.098.181.066 1.147.541 1.344.64.197.098.328.147.377.23.049.082.049.475-.095.88z"/>
                          </svg>
                        </a>
                      )}
                      {/* Facebook */}
                      {data.facebookUrl && (
                        <a
                          href={data.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-blue-500/20 active:scale-90"
                          title="Facebook"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {/* Instagram */}
                      {data.instagramUrl && (
                        <a
                          href={data.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-pink-500/10 hover:bg-pink-600 text-pink-600 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-pink-500/20 active:scale-90"
                          title="Instagram"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {/* TikTok */}
                      {data.tiktokUrl && (
                        <a
                          href={data.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-slate-900/10 hover:bg-slate-900 text-slate-800 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-200 active:scale-90"
                          title="TikTok"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.126V9.4a6.33 6.33 0 0 0-.87-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.48c.18-.18.34-.37.49-.57V10.7a8.28 8.28 0 0 0 5.28 1.93v-3.45a4.84 4.84 0 0 1-3.23-.97c-.01-.01-.02-.02-.04-.03l3.27-1.49z"/>
                          </svg>
                        </a>
                      )}
                      {/* Email */}
                      {data.emailContacto && (
                        <a
                          href={`mailto:${data.emailContacto}`}
                          className="w-9 h-9 rounded-xl bg-amber-500/10 hover:bg-amber-600 text-amber-600 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-amber-500/20 active:scale-90"
                          title="Enviar Correo"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                </div>

                {/* Pie de Acciones */}
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                  <a
                    href="#preview-landing-agendar"
                    onClick={() => setShowProfileModal(false)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 bg-${getC("600")} hover:bg-${getC("700")} text-white text-xs sm:text-sm font-extrabold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer`}
                  >
                    <CalendarCheck className="w-4 h-4 shrink-0 text-white" />
                    <span>Agendar Cita</span>
                  </a>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileModal(false);
                        setShowShareModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer border border-purple-200/50 shrink-0"
                      title="Compartir perfil"
                    >
                      <Share2 className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                      <span className="hidden sm:inline">Compartir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer shrink-0"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DE BIENVENIDA MINIMALISTA & SOLICITUD AMABLE DE NOMBRE */}
        <AnimatePresence>
          {showWelcomePopup && (
            <motion.div 
              id="preview-welcome-popup-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={() => setShowWelcomePopup(false)}
            >
              <motion.div 
                id="preview-welcome-popup-card"
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                className="bg-white rounded-3xl max-w-xs sm:max-w-md w-full p-5 sm:p-8 shadow-2xl border border-slate-100 relative text-center my-auto mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botón Cerrar Minimalista */}
                <button
                  type="button"
                  onClick={() => setShowWelcomePopup(false)}
                  className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icono Seleccionado en 3D (Sin logotipo) */}
                <div className="flex flex-col items-center justify-center mb-2 sm:mb-2.5">
                  <div className="relative inline-flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl select-none filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] transform hover:scale-110 transition-transform duration-300 inline-block cursor-default heartbeat-4s" role="img" aria-label="Icono 3D">
                      {data.popupBienvenidaIcono || "😊"}
                    </span>
                  </div>
                </div>

                {/* Título & Mensaje Descriptivo Más Grande */}
                <div className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-6 text-center">
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {data.popupBienvenidaTitulo || "¡Bienvenido(a) a mi consulta!"}
                  </h3>
                  <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                    {data.popupBienvenidaSubtitulo || "Me encantaría conocerte. ¿Cuál es tu nombre para brindarte una mejor atención?"}
                  </p>
                </div>

                {/* Formulario e Input Minimalista con Capitalización */}
                <form onSubmit={handleSaveWelcomeName} className="space-y-3.5">
                  <div>
                    <input
                      id="welcome-popup-input"
                      type="text"
                      autoFocus
                      value={welcomeInputName}
                      onChange={(e) => handleWelcomeInputChange(e.target.value)}
                      placeholder={data.popupBienvenidaPlaceholder || "Escribe tu nombre..."}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-50 border border-slate-200/90 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-base sm:text-lg font-semibold text-slate-800 outline-none placeholder:text-slate-400 text-center shadow-2xs capitalize"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{data.popupBienvenidaBoton || "Comenzar recorrido"}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowWelcomePopup(false)}
                    className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer pt-1 block mx-auto"
                  >
                    Omitir por ahora
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL PARA COMPARTIR EN REDES SOCIALES */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div 
              id="preview-share-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div 
                id="preview-share-modal-card"
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Cabecera del Modal */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-5 sm:p-6 text-white relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-200 block">Compartir Enlace</span>
                        <h3 className="text-base sm:text-lg font-black leading-tight text-white">Compartir Perfil Médico</h3>
                      </div>
                    </div>
                    <button
                      id="preview-close-share-modal"
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Cerrar modal de compartir"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Contenido del Modal */}
                <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Tarjeta del Médico */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
                    <img 
                      src={data.fotoUrl || undefined} 
                      alt={data.nombreMedico} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{data.nombreMedico}</h4>
                      <p className={`text-[11px] font-extrabold text-${getC("600")} truncate`}>{data.especialidad}</p>
                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span>{data.ciudad || "Ecuador"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Redes Sociales para Compartir */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                      Selecciona una red social o app:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {/* WhatsApp */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Conoce los servicios médicos y agenda tu cita con ${data.nombreMedico} (${data.especialidad}) en ${data.ciudad}: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xs"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span className="truncate">WhatsApp</span>
                      </a>

                      {/* Facebook */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xs"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Facebook className="w-4 h-4" />
                        </div>
                        <span className="truncate">Facebook</span>
                      </a>

                      {/* X / Twitter */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Perfil médico y consulta de ${data.nombreMedico} - ${data.especialidad} en ${data.ciudad}`)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/10 hover:bg-slate-900/20 border border-slate-900/30 text-slate-900 font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xs"
                      >
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <span className="font-black text-xs">𝕏</span>
                        </div>
                        <span className="truncate">X (Twitter)</span>
                      </a>

                      {/* Telegram */}
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(`${data.nombreMedico} - ${data.especialidad} en ${data.ciudad}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xs"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Send className="w-4 h-4" />
                        </div>
                        <span className="truncate">Telegram</span>
                      </a>

                      {/* LinkedIn */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-[#0A66C2] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xs"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Linkedin className="w-4 h-4" />
                        </div>
                        <span className="truncate">LinkedIn</span>
                      </a>

                      {/* Correo Electrónico */}
                      <a
                        href={`mailto:?subject=${encodeURIComponent(`${data.nombreMedico} - ${data.especialidad}`)}&body=${encodeURIComponent(`Te comparto el sitio web y perfil profesional de ${data.nombreMedico} (${data.especialidad}) en ${data.ciudad}:\n\n${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xs"
                      >
                        <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="truncate">Email</span>
                      </a>
                    </div>
                  </div>

                  {/* Botón compartir nativo (si el navegador lo soporta) */}
                  {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 font-bold text-xs border border-purple-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Más opciones (Abrir menú del dispositivo)</span>
                    </button>
                  )}

                  {/* Sección Copiar Enlace Directo */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                      O copia el enlace directo:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== "undefined" ? window.location.href : ""}
                          className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 truncate select-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-2xs shrink-0 ${
                          copiedShareUrl
                            ? "bg-emerald-600 text-white shadow-emerald-600/30"
                            : "bg-slate-900 hover:bg-slate-800 active:bg-black text-white"
                        }`}
                      >
                        {copiedShareUrl ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Código QR para Escaneo Móvil Directo */}
                  <div className="pt-3 border-t border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-purple-600 shrink-0" />
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Código QR para Escanear
                        </label>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Cámara Móvil
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-3 text-center">
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs shrink-0 inline-flex items-center justify-center">
                        <QRCodeCanvas
                          value={typeof window !== "undefined" ? window.location.href : (data.dominioWeb || "https://tu-dominio.com")}
                          size={180}
                          level="M"
                          includeMargin={false}
                          fgColor="#0f172a"
                          bgColor="#ffffff"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        Escanea con la cámara de tu celular
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer del Modal */}
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black rounded-xl transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DE CONFIRMACIÓN DE CITA MÉDICA CON RESUMEN */}
        <AnimatePresence>
          {showBookingModal && (
            <motion.div 
              id="preview-booking-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={() => setShowBookingModal(false)}
            >
              <motion.div 
                id="preview-booking-modal-card"
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Cabecera del Modal */}
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-5 sm:p-6 text-white relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                        <CalendarCheck className="w-5 h-5 text-emerald-200" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 block">Paso Final</span>
                        <h3 className="text-base sm:text-lg font-black leading-tight text-white">Resumen de Cita Médica</h3>
                      </div>
                    </div>
                    <button
                      id="preview-close-booking-modal"
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Cerrar ventana de confirmación"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-emerald-100 mt-2 leading-relaxed font-normal">
                    Revisa los datos de tu consulta antes de coordinar tu atención con el especialista.
                  </p>
                </div>

                {/* Contenido del Resumen */}
                <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                  
                  {/* Tarjeta del Doctor & Modalidad */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
                    <img 
                      src={data.fotoUrl || undefined} 
                      alt={data.nombreMedico} 
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{data.nombreMedico}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          bookingModality === "teleconsulta" 
                            ? "bg-blue-100 text-blue-800 border border-blue-200" 
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}>
                          {bookingModality === "teleconsulta" ? "💻 Teleconsulta Online" : "🏥 Consulta Presencial"}
                        </span>
                      </div>
                      <p className={`text-[11px] font-extrabold text-${getC("600")} truncate`}>{data.especialidad}</p>
                      <p className="text-[10px] text-slate-500 truncate font-medium">
                        {data.mostrarRegistroPublico
                          ? `Registro MSP / SENESCYT: ${data.cedulaProfesional}`
                          : `✓ Acreditación Médica MSP & SENESCYT Verificada`}
                      </p>
                    </div>
                  </div>

                  {/* Servicio o Procedimiento Solicitado */}
                  {bookingService && (
                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide block">Tratamiento / Procedimiento:</span>
                          <p className="text-xs font-black text-slate-900 truncate">{bookingService}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fila de Datos Clave de Cita (Fecha, Hora, Paciente) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Fecha Seleccionada */}
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-0.5">
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" /> Fecha Elegida
                      </span>
                      <p className="text-xs font-black text-slate-900 leading-tight">
                        {getFormattedDateDisplay()}
                      </p>
                    </div>

                    {/* Hora Seleccionada */}
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 space-y-0.5">
                      <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wide flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" /> Horario Preferido
                      </span>
                      <p className="text-xs font-black text-slate-900 leading-tight">
                        {bookingTime}
                      </p>
                    </div>
                  </div>

                  {/* Nombre del Paciente */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-600">Paciente:</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {patientName.trim() ? patientName.trim() : "A coordinar en recepción"}
                    </span>
                  </div>

                  {/* Detalles de la Consulta */}
                  {bookingDetails.trim() && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-600">Detalles:</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 break-words pl-6">
                        {bookingDetails}
                      </p>
                    </div>
                  )}

                  {/* Valor de la Consulta & Métodos de Pago */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-700">
                          {bookingModality === "teleconsulta" ? "Tarifa Videoconsulta:" : "Tarifa Consulta Presencial:"}
                        </span>
                      </div>
                      <span className="text-sm font-black text-slate-950">
                        {bookingModality === "teleconsulta" 
                          ? (data.precioTeleconsulta || data.precioConsulta || "$40 USD") 
                          : (data.precioConsulta || "$50 USD")}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-600">
                      <span className="font-semibold text-slate-500">Pagos aceptados:</span>
                      <span className="font-bold text-slate-800">
                        {bookingModality === "teleconsulta" 
                          ? "Transferencia bancaria • Tarjetas de crédito/débito • Link digital"
                          : (data.metodosPago || ["Efectivo", "Transferencia", "Tarjetas"]).join(" • ")}
                      </span>
                    </div>
                  </div>

                  {/* Dirección Física (Presencial) o Plataforma (Teleconsulta) */}
                  {bookingModality === "teleconsulta" ? (
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Atención 100% Online por Videollamada</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Plataforma: {data.plataformasTeleconsulta || "Zoom, Google Meet o WhatsApp Video"}. El enlace de conexión se enviará al confirmar tu cita.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{data.nombreClinicaGBP}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-600 pl-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <address className="not-italic text-[11px] leading-relaxed">
                          {data.direccionFisica}, CP {data.codigoPostal}, {data.ciudad}
                        </address>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 pl-0.5 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{data.telefonoGBP}</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Pie de Acciones / Redirección */}
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col gap-2.5">
                  {/* Botón WhatsApp */}
                  <a
                    id="preview-modal-confirm-whatsapp"
                    href={getDynamicWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowBookingModal(false)}
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1ca34f] text-white text-xs sm:text-sm font-extrabold py-3.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Confirmar y Abrir WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                  </a>



                  {/* Modificar / Cerrar */}
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="text-center text-[11px] font-bold text-slate-500 hover:text-slate-800 py-1 transition-colors cursor-pointer"
                  >
                    ← Modificar fecha u horario
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}

          {/* PÁGINA INDEPENDIENTE: CATÁLOGO COMPLETO DE SERVICIOS ("MIS SERVICIOS") */}
          {showServicesModal && (
            <motion.div
              id="preview-services-modal-backdrop"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto selection:bg-purple-600 selection:text-white"
            >
              {/* Barra de navegación superior: SÓLO BOTÓN REGRESAR */}
              <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
                  
                  {/* Botón de retroceso único */}
                  <button
                    type="button"
                    onClick={() => setShowServicesModal(false)}
                    style={{
                      backgroundColor: activeColorScale["50"],
                      borderColor: activeColorScale["200"],
                      color: activeColorScale["700"]
                    }}
                    className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs group hover:opacity-95 hover:shadow-xs active:scale-95"
                    aria-label="Regresar"
                  >
                    <ArrowLeft 
                      className="w-4 h-4 group-hover:-translate-x-1 transition-transform" 
                      style={{ color: activeColorScale["600"] }}
                    />
                    <span>Regresar</span>
                  </button>
                </div>
              </header>

              {/* Contenido Principal */}
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
                {/* Cabecera & Buscador */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span 
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg inline-block border"
                        style={{ 
                          backgroundColor: activeColorScale["50"], 
                          borderColor: activeColorScale["200"],
                          color: activeColorScale["700"] 
                        }}
                      >
                        Catálogo Oficial de Atención
                      </span>
                      <h1 
                        className="text-2xl sm:text-3xl font-black tracking-tight font-display"
                        style={{ color: activeColorScale["900"] }}
                      >
                        Procedimientos y Tratamientos Médicos
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Explora los tratamientos especializados disponibles y agenda directamente tu valoración clínica.
                      </p>
                    </div>

                    {/* Buscador en tiempo real */}
                    <div className="w-full sm:w-80 relative shrink-0">
                      <input
                        type="text"
                        value={serviceSearchQuery}
                        onChange={(e) => setServiceSearchQuery(e.target.value)}
                        placeholder="Buscar procedimiento..."
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-2xs"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      {serviceSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setServiceSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista de Servicios Filtrados (Grid 3 columnas en Desktop) */}
                <div className="space-y-4">
                  {(() => {
                    const filtered = (data.servicios || []).filter(srv => {
                      if (!serviceSearchQuery.trim()) return true;
                      const q = serviceSearchQuery.toLowerCase();
                      return (srv.titulo || "").toLowerCase().includes(q) || (srv.descripcion || "").toLowerCase().includes(q);
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
                          <p className="text-sm font-bold text-slate-700">No se encontraron procedimientos coincidentes</p>
                          <p className="text-xs text-slate-500">Intenta con otro término o consulta directamente para más información.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((srv, idx) => {
                          const hasImage = srv.mostrarImagen !== false && Boolean(srv.imagenUrl);

                          return (
                            <div 
                              key={srv.id || idx}
                              className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group overflow-hidden"
                            >
                              <div className="space-y-4">
                                {hasImage ? (
                                  <div 
                                    className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-2xs group-hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                                    onClick={() => {
                                      setShowServicesModal(false);
                                      setSelectedServiceForDetail(srv);
                                    }}
                                  >
                                    <img src={srv.imagenUrl} alt={srv.titulo} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
                                      {(() => {
                                        const isDestacado = Boolean(srv.destacado);
                                        const text = srv.badgeEtiqueta || (isDestacado ? "DESTACADO" : "");
                                        if (!text) return null;
                                        if (isDestacado) {
                                          return (
                                            <span className="text-[10px] font-black tracking-wide uppercase text-amber-950 bg-amber-300 border border-amber-400/90 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                              ⭐ {text}
                                            </span>
                                          );
                                        }
                                        return (
                                          <span className="text-[10px] font-bold tracking-wide uppercase text-slate-800 bg-white/90 backdrop-blur-xs border border-slate-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                                            {text}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                    {srv.galeriaFotos && srv.galeriaFotos.length > 0 && (
                                      <span className="absolute bottom-2 left-2 text-[10px] font-extrabold text-white bg-slate-900/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                                        <ImageIcon className="w-3 h-3 text-blue-400" />
                                        <span>+{srv.galeriaFotos.length} fotos</span>
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => {
                                      setShowServicesModal(false);
                                      setSelectedServiceForDetail(srv);
                                    }}
                                  >
                                    <div 
                                      className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-105"
                                      style={{ backgroundColor: activeColorScale["50"], color: activeColorScale["600"], border: `1px solid ${activeColorScale["200"]}` }}
                                    >
                                      {renderIcon(srv.icono)}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      {(() => {
                                        const isDestacado = Boolean(srv.destacado);
                                        const text = srv.badgeEtiqueta || (isDestacado ? "DESTACADO" : "");
                                        if (!text) return null;
                                        if (isDestacado) {
                                          return (
                                            <span className="text-[10px] font-black tracking-wide uppercase text-amber-950 bg-amber-300 border border-amber-400/90 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                              ⭐ {text}
                                            </span>
                                          );
                                        }
                                        return (
                                          <span className="text-[10px] font-bold tracking-wide uppercase text-slate-800 bg-white/90 backdrop-blur-xs border border-slate-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                                            {text}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                )}

                                {/* TÍTULO Y DESCRIPCIÓN DEL SERVICIO */}
                                <div 
                                  className="space-y-1.5 min-w-0 text-left cursor-pointer"
                                  onClick={() => {
                                    setShowServicesModal(false);
                                    setSelectedServiceForDetail(srv);
                                  }}
                                >
                                  <h2 
                                    className="text-base sm:text-lg font-extrabold leading-snug transition-colors"
                                    style={{ color: activeColorScale["950"] }}
                                  >
                                    {srv.titulo}
                                  </h2>
                                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 font-normal">
                                    {srv.descripcion}
                                  </p>
                                </div>

                                {/* Badges informativos */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {srv.precio && (
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 flex items-center gap-1">
                                      <Banknote className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>{srv.precio}</span>
                                    </span>
                                  )}
                                  {srv.duracion && (
                                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                                      <span>{srv.duracion}</span>
                                    </span>
                                  )}
                                  {srv.modalidad && (
                                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60 flex items-center gap-1">
                                      <Building2 className="w-3 h-3 text-teal-600 shrink-0" />
                                      <span>{srv.modalidad}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowServicesModal(false);
                                    setSelectedServiceForDetail(srv);
                                  }}
                                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer text-center"
                                >
                                  Ver Ficha Completa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowServicesModal(false);
                                    setSelectedServiceForAppointment(srv.titulo);
                                    setBookingService(srv.titulo);
                                    scrollToSection("contacto");
                                  }}
                                  className={`py-2.5 px-4 rounded-xl bg-${getC("600")} hover:bg-${getC("700")} text-white font-extrabold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1`}
                                >
                                  <span>Agendar</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVEGACIÓN MÓVIL INFERIOR: BARRA FIJA DUAL O MENÚ ERGONÓMICO */}
        {device === "mobile" && (
          data.estiloCta === "barra_fija_dual" ? (
            <div 
              id="preview-mobile-dual-cta-bar"
              className="sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 py-2.5 px-3 flex items-center gap-2.5 z-30 shadow-[0_-8px_25px_rgba(0,0,0,0.12)] shrink-0"
            >
              <a 
                href={data.whatsappUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white py-2.5 px-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-[0_5px_15px_-2px_rgba(16,185,129,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-2.5px_2px_rgba(0,0,0,0.25)] border-t border-white/40 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-98 transition-all duration-200 text-center uppercase tracking-wide cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0 fill-white text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
                <span className="truncate font-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">AGENDAR CITA</span>
              </a>
              <button 
                type="button" 
                onClick={() => {
                  scrollToSection("resenas");
                }}
                className="flex-1 bg-gradient-to-b from-white via-slate-50 to-slate-100 hover:from-white hover:to-slate-100 text-slate-800 border border-slate-200/90 py-2.5 px-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(0,0,0,0.06)] border-t border-white hover:-translate-y-0.5 active:translate-y-0.5 active:scale-98 transition-all duration-200 text-center cursor-pointer"
              >
                <Star className="w-4 h-4 shrink-0 fill-amber-400 text-amber-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" />
                <span className="truncate font-black">Reseñas</span>
              </button>
            </div>
          ) : (
            <nav 
              aria-label="Navegación Móvil Rápida"
              className="sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 py-2 px-2 flex justify-around items-center z-30 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] shrink-0"
            >
              {/* Inicio (3D Azul Zafiro) */}
              <a 
                href="#preview-landing-hero" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("inicio");
                }}
                className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl text-slate-700 hover:text-blue-700 transition-all duration-200 transform active:scale-95 group cursor-pointer"
              >
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 text-white flex items-center justify-center shadow-[0_4px_10px_-1px_rgba(59,130,246,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.7),inset_0_-2px_2px_rgba(0,0,0,0.2)] border-t border-white/40 transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_6px_14px_-1px_rgba(59,130,246,0.55),inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-2px_2px_rgba(0,0,0,0.2)] active:scale-95">
                  <Home className="w-4.5 h-4.5 text-white drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[10px] font-extrabold tracking-tight">Inicio</span>
              </a>

              {/* Doctor (3D Índigo) */}
              <a 
                href="#preview-landing-nosotros" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("nosotros");
                }}
                className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl text-slate-700 hover:text-indigo-700 transition-all duration-200 transform active:scale-95 group cursor-pointer"
              >
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-b from-indigo-400 via-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_4px_10px_-1px_rgba(99,102,241,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.7),inset_0_-2px_2px_rgba(0,0,0,0.2)] border-t border-white/40 transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_6px_14px_-1px_rgba(99,102,241,0.55),inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-2px_2px_rgba(0,0,0,0.2)] active:scale-95">
                  <Award className="w-4.5 h-4.5 text-white drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[10px] font-extrabold tracking-tight">{isClinica ? "Nosotros" : "Doctor"}</span>
              </a>

              {/* Servicios (3D Teal) */}
              <a 
                href="#preview-landing-servicios" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("servicios");
                }}
                className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl text-slate-700 hover:text-teal-700 transition-all duration-200 transform active:scale-95 group cursor-pointer"
              >
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 text-white flex items-center justify-center shadow-[0_4px_10px_-1px_rgba(20,184,166,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.7),inset_0_-2px_2px_rgba(0,0,0,0.2)] border-t border-white/40 transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_6px_14px_-1px_rgba(20,184,166,0.55),inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-2px_2px_rgba(0,0,0,0.2)] active:scale-95">
                  <Stethoscope className="w-4.5 h-4.5 text-white drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[10px] font-extrabold tracking-tight">Servicios</span>
              </a>

              {/* Reseñas (3D Ámbar Dorado) */}
              <a 
                href="#preview-landing-resenas" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("resenas");
                }}
                className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl text-slate-700 hover:text-amber-700 transition-all duration-200 transform active:scale-95 group cursor-pointer"
              >
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-amber-950 flex items-center justify-center shadow-[0_4px_10px_-1px_rgba(245,158,11,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-2px_2px_rgba(0,0,0,0.2)] border-t border-white/50 transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_6px_14px_-1px_rgba(245,158,11,0.6),inset_0_1.5px_1px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(0,0,0,0.2)] active:scale-95">
                  <Star className="w-4.5 h-4.5 fill-amber-950 text-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[10px] font-extrabold tracking-tight">Reseñas</span>
              </a>

              {/* Agendar Cita (3D Verde Esmeralda Hero CTA) */}
              <a 
                href="#agendar-preview" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contacto");
                }}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all duration-200 transform active:scale-95 group cursor-pointer ${
                  data.estiloCta === "estatico_pulso"
                    ? "bg-emerald-600/15 border-2 border-emerald-400 text-emerald-950 shadow-md"
                    : "bg-emerald-500/15 border border-emerald-300/80 text-emerald-950 shadow-xs hover:bg-emerald-500/25"
                }`}
              >
                <div className={`relative w-9 h-9 rounded-2xl ${
                  data.estiloCta === "estatico_pulso"
                    ? "bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-800 ring-2 ring-emerald-400 shadow-[0_6px_16px_-1px_rgba(16,185,129,0.7),inset_0_2px_1.5px_rgba(255,255,255,0.8),inset_0_-2.5px_2px_rgba(0,0,0,0.3)] animate-pulse"
                    : "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 shadow-[0_5px_12px_-1px_rgba(16,185,129,0.55),inset_0_2px_1.5px_rgba(255,255,255,0.75),inset_0_-2.5px_2px_rgba(0,0,0,0.25)]"
                } text-white border-t border-white/50 flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-95`}>
                  <Calendar className="w-4.5 h-4.5 text-white drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.3)]" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-br from-emerald-200 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9),inset_0_1px_1px_white] border border-white"></span>
                  </span>
                </div>
                <span className="text-[10px] font-black tracking-tight text-emerald-900 group-hover:text-emerald-700">{data.estiloCta === "estatico_pulso" ? "Agendar" : "Cita"}</span>
              </a>
            </nav>
          )
        )}
          </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Modal Reproductor de Video de Redes Sociales sin salir de la Web */}
        <AnimatePresence>
          {activeVideoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/85 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-100"
              >
                {/* Header */}
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      activeVideoModal.platform === "tiktok" ? "bg-slate-800 text-cyan-300" :
                      activeVideoModal.platform === "facebook" ? "bg-blue-600 text-white" :
                      activeVideoModal.platform === "youtube" ? "bg-red-600 text-white" :
                      "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    }`}>
                      {activeVideoModal.platform ? activeVideoModal.platform.toUpperCase() : "VIDEO"}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold truncate text-white">
                      {activeVideoModal.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(null)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                    title="Cerrar reproductor"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Video Player Box */}
                <div className="relative bg-black w-full aspect-[9/16] max-h-[460px] sm:max-h-[500px] flex items-center justify-center overflow-hidden shrink-0">
                  {activeVideoModal.url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={activeVideoModal.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={getSocialVideoEmbedUrl(activeVideoModal.url, activeVideoModal.platform)}
                      className="w-full h-full border-0"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                      title={activeVideoModal.title}
                    />
                  )}
                </div>

                {/* Footer Info */}
                <div className="p-3.5 bg-white border-t border-slate-100 flex flex-col gap-2 overflow-y-auto">
                  {activeVideoModal.desc && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeVideoModal.desc}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <a
                      href={activeVideoModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-pink-600 hover:underline flex items-center gap-1"
                    >
                      <span>Abrir en app oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(null)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DE DESCARGA DE GUÍAS (LEAD MAGNET CAPTURE) */}
        <AnimatePresence>
          {selectedGuideForDownload && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setSelectedGuideForDownload(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-800 to-slate-900 p-5 text-white relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">Descarga Oficial</span>
                        <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">Acceso a la Guía Médica</h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedGuideForDownload(null)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmitLeadCapture} className="p-5 sm:p-6 space-y-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{selectedGuideForDownload.titulo}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {selectedGuideForDownload.descripcion}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Ingresa tus datos para recibir el enlace de descarga oficial y una copia directa a tu WhatsApp:
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        value={leadCaptureName}
                        onChange={(e) => setLeadCaptureName(e.target.value)}
                        placeholder="Ej. María Fernanda Morales"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700">Número de WhatsApp / Teléfono</label>
                      <input
                        type="tel"
                        required
                        value={leadCaptureContact}
                        onChange={(e) => setLeadCaptureContact(e.target.value)}
                        placeholder="Ej. +593 99 123 4567"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={leadCaptureSubmitted}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {leadCaptureSubmitted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>¡Enviando y descargando...!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Descargar Guía Inmediata</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      Tus datos son 100% confidenciales según la ley médica de protección de datos.
                    </p>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST DE CONFIRMACIÓN DE DESCARGA */}
        <AnimatePresence>
          {downloadToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-bold"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white font-bold">{downloadToast}</p>
                <span className="text-[10px] text-slate-400 font-normal">Documento PDF generado con éxito</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL LECTURA ARTÍCULO COMPLETO DE BLOG */}
        <AnimatePresence>
          {selectedBlogPostModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left"
              onClick={() => setSelectedBlogPostModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative"
              >
                <div className="relative h-48 sm:h-64 bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={selectedBlogPostModal.imagenUrl || undefined}
                    alt={selectedBlogPostModal.titulo}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedBlogPostModal(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className={`absolute bottom-3 left-4 text-[10px] font-extrabold uppercase tracking-widest bg-${getC("600")} text-white px-3 py-1 rounded-full shadow-xs`}>
                    {selectedBlogPostModal.categoria}
                  </span>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>{selectedBlogPostModal.fecha}</span>
                    <span>•</span>
                    <span>{selectedBlogPostModal.tiempoLectura}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                      Autor: {data.nombreMedico || "Médico Especialista"}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight font-display">
                    {selectedBlogPostModal.titulo}
                  </h2>

                  <div className={`p-3.5 rounded-xl bg-${getC("50")} border-l-4 border-${getC("600")} text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic`}>
                    {selectedBlogPostModal.extracto}
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3 font-normal pt-1">
                    {selectedBlogPostModal.contenido}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Contenido educativo médico E-E-A-T
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedBlogPostModal(null)}
                    className={`ml-auto px-4 py-2 rounded-xl bg-${getC("600")} hover:bg-${getC("700")} text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs`}
                  >
                    Cerrar Lectura
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL COMPONENTE COMPARTIBLE DE GUÍA / EBOOK */}
        <PatientGuideModal
          guide={shareModalGuide}
          data={data}
          isOpen={Boolean(shareModalGuide)}
          onClose={() => setShareModalGuide(null)}
        />

        {/* MODAL DE DETALLE DE SERVICIO / PROCEDIMIENTO */}
        <ServiceDetailModal
          service={selectedServiceForDetail}
          data={data}
          onClose={() => setSelectedServiceForDetail(null)}
          onSelectService={(serviceTitle) => {
            setSelectedServiceForAppointment(serviceTitle);
            setBookingService(serviceTitle);
            scrollToSection("contacto");
          }}
          onUpdateServiceMedia={(updatedSrv) => {
            if ((data as any).updateField) {
              const updatedList = data.servicios.map((s) => s.id === updatedSrv.id ? updatedSrv : s);
              (data as any).updateField("servicios", updatedList);
            }
            setSelectedServiceForDetail(updatedSrv);
          }}
          getC={getC}
        />

      </div>
    </div>
  );
}
