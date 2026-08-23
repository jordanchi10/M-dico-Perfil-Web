/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MedicalLandingData, BeforeAfterCase, DEFAULT_SECTION_ORDER } from "../types";
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
  UserCheck,
  X,
  Menu,
  CalendarCheck,
  ArrowRight,
  Search,
  Copy,
  SlidersHorizontal,
  ExternalLink as ExternalLinkIcon,
  Play,
  Video,
  Film,
  Instagram,
  Facebook,
  Youtube,
  Linkedin
} from "lucide-react";
import { getActiveColorScale } from "../utils/colorUtils";
import { MedicalIconRenderer } from "./MedicalIconRenderer";
import { getLiveConsultationStatus } from "../utils/scheduleUtils";
import { getActiveLandingStyle } from "../utils/stylePresets";
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

/// Sub-componente interactivo de Carrusel de Fotos de Instalaciones para el Live Preview
interface ClinicGalleryPreviewCarouselProps {
  photos: { id: string; url: string; titulo?: string; descripcion?: string }[];
  primaryColorClass: string;
  getC: (key: string) => string;
}

const ClinicGalleryPreviewCarousel: React.FC<ClinicGalleryPreviewCarouselProps> = ({ photos, primaryColorClass, getC }) => {
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
    },
    {
      id: "foto-cons-4",
      url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&auto=format&fit=crop",
      titulo: "Sala de Procedimientos Menores",
      descripcion: "Cumplimiento de los más rigurosos estándares de esterilización y bioseguridad."
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

  return (
    <section id="preview-landing-instalaciones" className="py-10 px-4 sm:px-8 bg-slate-50/90 border-y border-slate-200/80 text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabecera de la Sección con Espaciado Generoso */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div className="max-w-xl">
            <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-3 py-1 rounded-full inline-block mb-2`}>
              Galería
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
              Espacios Diseñados para tu Bienestar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Conoce nuestro consultorio, salas de atención e instrumental médico preparado bajo los más estrictos protocolos clínicos.
            </p>
          </div>

          {/* Controles y Contador de Diapositiva */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-end">
            <span className="text-xs font-black text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
              {currentIndex + 1} <span className="text-slate-400 font-normal">/</span> {total}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevSlide}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-700 shadow-2xs transition-all cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className={`p-2.5 rounded-xl bg-${getC("600")} hover:bg-${getC("700")} active:bg-${getC("800")} text-white shadow-2xs transition-all cursor-pointer`}
                aria-label="Foto siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta Principal del Carrusel (Formato 5:4) */}
        <div className="relative max-w-2xl mx-auto w-full aspect-[5/4] rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 bg-slate-950 group">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.titulo || `Instalación ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          
          {/* Gradiente y Textos sin deformación con fondo legible */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent pt-16 pb-5 px-5 sm:px-7 text-white flex flex-col justify-end">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md border border-white/20 inline-block mb-1.5 self-start">
              Foto {currentIndex + 1} de {total} • Consultorio Clínico
            </span>
            <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white leading-snug">
              {currentPhoto.titulo || `Área Clínica ${currentIndex + 1}`}
            </h3>
            {currentPhoto.descripcion && (
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mt-1 font-normal leading-relaxed">
                {currentPhoto.descripcion}
              </p>
            )}
          </div>

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
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10">
            {activePhotos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                aria-label={`Ir a foto ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Miniaturas de Selección con Espaciado y Cabecera Dedicada */}
        <div className="max-w-2xl mx-auto pt-2">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Galería de Espacios ({activePhotos.length} fotos)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Haz clic para previsualizar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {activePhotos.map((photo, idx) => (
              <button
                key={photo.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? `bg-white border-${getC("500")} shadow-xs ring-2 ring-${getC("500")}/25`
                    : "bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-2xs"
                }`}
              >
                <div className="w-10 h-8 aspect-[5/4] rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                  <img
                    src={photo.url}
                    alt={photo.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-bold truncate leading-tight ${idx === currentIndex ? `text-${getC("700")}` : 'text-slate-800'}`}>
                    {photo.titulo || `Foto ${idx + 1}`}
                  </p>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Espacio {idx + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
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

export default function PreviewPanel({ data, onOpenExternalPreview }: PreviewPanelProps) {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement>(null);

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

  const isSectionVisible = (id: string) => {
    if (!data.ordenSecciones || data.ordenSecciones.length === 0) return true;
    const item = data.ordenSecciones.find(s => s.id === id);
    return item ? item.visible !== false : true;
  };

  const hasNosotros = isSectionVisible("eeat");
  const hasInstalaciones = data.fotosConsultorio && data.fotosConsultorio.length > 0 && isSectionVisible("galeria");
  const hasServicios = data.servicios && data.servicios.length > 0 && isSectionVisible("servicios");
  const hasCasos = data.casosAntesDespues && data.casosAntesDespues.length > 0 && isSectionVisible("casos");
  const hasFaq = data.faqs && data.faqs.length > 0 && isSectionVisible("faqs");
  const hasResenas = data.resenas && data.resenas.length > 0 && isSectionVisible("opiniones");
  const hasBlog = data.blogPosts && data.blogPosts.length > 0 && isSectionVisible("blog");

  // Active navigation items matching generators.ts
  const activeNavs: { id: string; label: string; icon: string }[] = [];
  activeNavs.push({ id: "inicio", label: "Inicio", icon: "home" });
  if (hasNosotros) activeNavs.push({ id: "nosotros", label: "Doctor", icon: "doctor" });
  
  if (hasServicios) {
    activeNavs.push({ id: "servicios", label: "Servicios", icon: "servicios" });
  } else if (hasInstalaciones) {
    activeNavs.push({ id: "instalaciones", label: "Clínica", icon: "clinica" });
  }

  if (hasResenas) {
    activeNavs.push({ id: "opiniones", label: "Opiniones", icon: "opiniones" });
  } else if (hasFaq) {
    activeNavs.push({ id: "faqs", label: "Preguntas", icon: "faq" });
  } else if (hasBlog) {
    activeNavs.push({ id: "blog", label: "Blog", icon: "blog" });
  }
  activeNavs.push({ id: "contacto", label: "Cita", icon: "cita" });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "home": return Home;
      case "doctor": return Award;
      case "servicios": return Stethoscope;
      case "clinica": return Building2;
      case "opiniones": return Star;
      case "faq": return CheckCircle2;
      case "blog": return FileText;
      case "cita": return Calendar;
      default: return Home;
    }
  };

  // Dynamic scroll observer to highlight current section in real time
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      setIsScrolled(viewport.scrollTop > 40);

      const sections = activeNavs.map(nav => {
        let elementId = "";
        if (nav.id === "inicio") elementId = "#preview-landing-header";
        else if (nav.id === "nosotros") elementId = "#preview-landing-nosotros";
        else if (nav.id === "servicios") elementId = "#preview-landing-servicios";
        else if (nav.id === "instalaciones") elementId = "#preview-landing-instalaciones";
        else if (nav.id === "faqs") elementId = "#preview-landing-faq";
        else if (nav.id === "opiniones") elementId = "#resenas";
        else if (nav.id === "blog") elementId = "#preview-landing-blog";
        else if (nav.id === "contacto") elementId = "#agendar-preview";

        return { id: nav.id, element: viewport.querySelector(elementId) };
      });

      const viewportRect = viewport.getBoundingClientRect();
      let currentActive = "inicio";
      let maxVisibleHeight = 0;

      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          const top = Math.max(rect.top, viewportRect.top);
          const bottom = Math.min(rect.bottom, viewportRect.bottom);
          const visibleHeight = Math.max(0, bottom - top);

          if (visibleHeight > maxVisibleHeight) {
            maxVisibleHeight = visibleHeight;
            currentActive = section.id;
          }
        }
      }
      setActiveSection(currentActive);
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    // Run an initial tick to set active section
    const initTimeout = setTimeout(handleScroll, 100);

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      clearTimeout(initTimeout);
    };
  }, [device, data]);

  // Smooth scroll handler inside the scrollable container viewport
  const scrollToSection = (sectionId: string) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setMobileMenuOpen(false);

    let elementId = "";
    if (sectionId === "inicio") elementId = "preview-landing-header";
    else if (sectionId === "nosotros") elementId = "preview-landing-nosotros";
    else if (sectionId === "servicios") elementId = "preview-landing-servicios";
    else if (sectionId === "instalaciones") elementId = "preview-landing-instalaciones";
    else if (sectionId === "faqs") elementId = "preview-landing-faq";
    else if (sectionId === "opiniones") elementId = "resenas";
    else if (sectionId === "blog") elementId = "preview-landing-blog";
    else if (sectionId === "contacto") elementId = "agendar-preview";

    const element = viewport.querySelector(`#${elementId}`);
    if (element) {
      const containerTop = viewport.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const relativeTop = elementTop - containerTop;
      
      viewport.scrollTo({
        top: viewport.scrollTop + relativeTop - 1, // Offset of 1px for border alignment
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
  const [patientName, setPatientName] = useState<string>("");

  // Modal de confirmación de cita médica con resumen previo
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
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

  // Web Share API o Portapapeles para compartir el perfil del médico
  const handleShareProfile = async () => {
    const shareData = {
      title: `${data.nombreMedico} - ${data.especialidad}`,
      text: `Conoce el perfil clínico y trayectoria del ${data.nombreMedico}, especialista en ${data.especialidad} en ${data.ciudad}.`,
      url: window.location.origin + window.location.pathname,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error al compartir:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
        setShareFeedback("¡Enlace copiado!");
        setTimeout(() => setShareFeedback(""), 2500);
      } catch (err) {
        console.log("Error al copiar enlace:", err);
        setShareFeedback("Error al copiar.");
        setTimeout(() => setShareFeedback(""), 2500);
      }
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
  const activeLandingStyle = getActiveLandingStyle(data.estiloLanding);
  const activeColorScale = getActiveColorScale(data.paletaColor, data.colorPrimarioHex);

  // Inyección dinámica de Google Fonts en el DOM para vista previa en tiempo real
  useEffect(() => {
    if (activeLandingStyle?.googleFontsUrl) {
      let link = document.querySelector(`link[data-font-preset="medical-preview"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.setAttribute("data-font-preset", "medical-preview");
        document.head.appendChild(link);
      }
      link.href = activeLandingStyle.googleFontsUrl;
    }
  }, [activeLandingStyle]);

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
            --clinical-50: ${activeColorScale["50"]};
            --clinical-100: ${activeColorScale["100"]};
            --clinical-200: ${activeColorScale["200"]};
            --clinical-500: ${activeColorScale["500"]};
            --clinical-600: ${activeColorScale["600"]};
            --clinical-700: ${activeColorScale["700"]};
            --clinical-800: ${activeColorScale["800"]};
            --clinical-900: ${activeColorScale["900"]};
            --landing-font-display: ${activeLandingStyle.fontDisplay};
            --landing-font-body: ${activeLandingStyle.fontBody};
            --landing-letter-spacing: ${activeLandingStyle.variables["--landing-letter-spacing"]};
            --landing-radius: ${activeLandingStyle.variables["--landing-radius"]};
            --landing-radius-sm: ${activeLandingStyle.variables["--landing-radius-sm"]};
            --landing-radius-lg: ${activeLandingStyle.variables["--landing-radius-lg"]};
            --landing-shadow: ${activeLandingStyle.variables["--landing-shadow"]};
          }

          /* Mapeo universal de clases cromáticas clínicas y clases dinámicas de Tailwind */
          #preview-viewport-wrapper .bg-clinical-50 {
            background-color: var(--clinical-50) !important;
          }
          #preview-viewport-wrapper .bg-clinical-100 {
            background-color: var(--clinical-100) !important;
          }
          #preview-viewport-wrapper .bg-clinical-200 {
            background-color: var(--clinical-200) !important;
          }
          #preview-viewport-wrapper .bg-clinical-600 {
            background-color: var(--clinical-600) !important;
          }
          #preview-viewport-wrapper .bg-clinical-700 {
            background-color: var(--clinical-700) !important;
          }
          #preview-viewport-wrapper .text-clinical-500 {
            color: var(--clinical-500) !important;
          }
          #preview-viewport-wrapper .text-clinical-600 {
            color: var(--clinical-600) !important;
          }
          #preview-viewport-wrapper .text-clinical-700 {
            color: var(--clinical-700) !important;
          }
          #preview-viewport-wrapper .border-clinical-100 {
            border-color: var(--clinical-100) !important;
          }
          #preview-viewport-wrapper .border-clinical-200 {
            border-color: var(--clinical-200) !important;
          }
          #preview-viewport-wrapper .border-clinical-600 {
            border-color: var(--clinical-600) !important;
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

                {/* BARRA SUPERIOR TOP INFO (Versión 5: Doble Barra Médica Light) */}
                {device === "desktop" && data.estiloMenuDesktop === "split_centrado" && (
                  <div className="bg-slate-100/95 border-b border-slate-200/90 text-slate-700 text-xs py-1.5 px-4 hidden md:block">
                    <div className="w-[90%] max-w-[90%] mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] font-medium">
                        {/* Badge Teléfono Light - Llamada Directa */}
                        <a 
                          href={`tel:${data.telefonoGBP.replace(/\s+/g, '')}`}
                          title="Hacer clic para llamar directamente"
                          className="flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer group shadow-2xs"
                        >
                          <span className="p-1 rounded-md bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                          </span>
                          <span className="flex flex-col text-left leading-none">
                            <span className="text-[9px] text-emerald-800 uppercase font-extrabold tracking-wider">Llamar Ahora</span>
                            <strong className="text-slate-900 font-mono font-bold tracking-tight text-[11px] mt-0.5">{data.telefonoGBP}</strong>
                          </span>
                        </a>

                        {/* Badge Ubicación Light */}
                        <span 
                          className="flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group shadow-2xs"
                          onClick={() => scrollToSection("horarios_ubicacion")}
                        >
                          <span className="p-0.5 rounded-md bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-slate-700 font-medium">{data.ciudad}, {data.estadoRegion}</span>
                        </span>

                        {/* Badge Horario Light */}
                        <span 
                          className="flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer group shadow-2xs"
                          onClick={() => scrollToSection("horarios_ubicacion")}
                        >
                          <span className="p-0.5 rounded-md bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-slate-700 font-medium">{data.horarios?.semana || "Atención previa cita"}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Badge Atendiendo Hoy Light */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Atención Médica Hoy</span>
                        </div>

                        {/* Botón Agendar Cita Light */}
                        <a 
                          href={data.whatsappUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-2xs transition-all active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Agendar Cita</span>
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
                      : data.estiloMenuDesktop === "institucional"
                        ? "sticky top-3 z-40 w-[92%] max-w-[92%] mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 my-2 px-4 sm:px-6 h-16 sm:h-20 flex items-center transition-all duration-300 hover:shadow-2xl hover:border-slate-300/80"
                        : "sticky top-0 z-30 shadow-xs bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-2 sm:px-4 h-16 sm:h-20 flex items-center w-full"
                  }`}
                >
                  <div className="w-[90%] max-w-[90%] mx-auto flex items-center justify-between h-full">
                    {/* Brand Logo */}
                    <div className="flex items-center shrink-0 cursor-pointer h-full py-2 overflow-hidden" onClick={() => scrollToSection("inicio")}>
                      {data.logoUrl ? (
                        <img 
                          src={data.logoUrl} 
                          alt="Logo Especialista" 
                          style={{ height: `${currentLogoH}px`, maxHeight: '100%', width: 'auto' }}
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

                      {/* Badge Clínica Privada (Solo versión 6 Dark Luxury) */}
                      {device === "desktop" && data.estiloMenuDesktop === "institucional" && (
                        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 text-white border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ml-3 shrink-0 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>Clínica Privada</span>
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

                {/* VERSIÓN 5 DE MENÚ DESKTOP: DOBLE BARRA MÉDICA LIGHT (PESTAÑAS ESTRUCTURADAS) */}
                {device === "desktop" && data.estiloMenuDesktop === "split_centrado" && (
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

                {/* VERSIÓN 6 DE MENÚ DESKTOP: MENÚ FLOTANTE MODERNO PREMIUM EN BLANCO */}
                {device === "desktop" && data.estiloMenuDesktop === "institucional" && (
                  <div className="hidden md:flex items-center gap-3 ml-auto mr-2">
                    {/* Botón de Llamada Directa en Menú Flotante Blanco */}
                    <a
                      href={`tel:${data.telefonoGBP.replace(/\s+/g, '')}`}
                      title="Hacer clic para llamar directamente"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/90 transition-all hover:scale-[1.02] active:scale-95 shadow-2xs group shrink-0"
                    >
                      <span className="p-1 rounded-lg bg-emerald-600 text-white group-hover:bg-emerald-700 transition-colors shrink-0 shadow-2xs">
                        <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                      </span>
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[9px] text-emerald-800 uppercase font-black tracking-wider">Llamar Directo</span>
                        <strong className="text-[12px] font-mono font-extrabold text-slate-900 mt-0.5">{data.telefonoGBP}</strong>
                      </div>
                    </a>

                    <div className="h-6 w-px bg-slate-200/90"></div>

                    {/* Navegación Flotante Segmentada */}
                    <nav className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/90 p-1 rounded-xl shadow-2xs">
                      {activeNavs.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            style={isActive ? { backgroundColor: activeColorScale["600"], color: "#FFFFFF" } : {}}
                            className={`px-3 py-1.5 text-[13px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? "text-white font-black shadow-md scale-[1.03]"
                                : "text-slate-700 hover:text-slate-950 hover:bg-white/80"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                )}

                {/* Actions Block */}
                <div className="flex items-center gap-2">
                  {/* Calendar Quick Cta Button */}
                  <button 
                    onClick={() => scrollToSection("contacto")}
                    aria-label="Agendar Cita"
                    title="Agendar Cita"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all shrink-0 hover:scale-105 cursor-pointer"
                  >
                    <Calendar className="w-4.5 h-4.5 shrink-0" />
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

              {/* Mobile Slide-Down Menu Panel */}
              {device === "mobile" && mobileMenuOpen && (
                <div className="overflow-hidden border-t border-slate-100 mt-2.5">
                  <nav className="flex flex-col py-1.5 gap-1 bg-slate-50/90 p-2.5 rounded-2xl border border-slate-200/70 mt-1">
                    {activeNavs.map((item) => {
                      const isActive = activeSection === item.id;
                      const Icon = getIconComponent(item.icon);
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          style={isActive ? { backgroundColor: activeColorScale["600"], color: "#FFFFFF" } : {}}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-left text-[14px] font-bold transition-all cursor-pointer ${
                            isActive 
                              ? "text-white shadow-xs font-black"
                              : "text-slate-800 hover:bg-white hover:text-slate-950"
                          }`}
                        >
                          <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                          <span className={isActive ? "text-white font-black" : "text-slate-800 font-bold"}>{item.label}</span>
                          {isActive && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                          )}
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
            className="relative w-full min-h-[80vh] md:min-h-[80vh] flex flex-col justify-center items-center text-center px-4 sm:px-8 py-8 sm:py-12 md:py-16 overflow-hidden bg-cover bg-center bg-no-repeat shadow-inner"
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
                  <div className={`relative group hero-animate-image ${isDesktop ? "shrink-0 my-0.5" : "mx-auto my-0.5 max-w-full"}`}>
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
                        src={data.fotoUrl} 
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
                );
              })();

              // Componente reutilizable para el bloque de información (Badge, Nombre, Especialidad, Ubicación, CTA, RRSS, Horario)
              const infoNode = (
                <div className={`space-y-3 sm:space-y-3.5 w-full ${isDesktopAlignLeft ? "text-left flex flex-col items-start" : "text-center flex flex-col items-center mx-auto max-w-2xl"}`}>
                  {/* BADGE: MÉDICO CERTIFICADO O VERIFICADO */}
                  <div className={`flex items-center ${isDesktopAlignLeft ? "justify-start" : "justify-center"} pt-0.5 hero-animate-badge`}>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-sm border border-blue-400/40 shrink-0 transform transition-all duration-200 hover:scale-105 cursor-default">
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-100 shrink-0" />
                      <span>{isCentradoVersion ? "Verificado" : "Médico Certificado"}</span>
                    </div>
                  </div>

                  {/* NOMBRE Y ESPECIALIDAD */}
                  <div className={`space-y-0.5 w-full ${isDesktopAlignLeft ? "text-left px-0" : "text-center px-2"}`}>
                    <h1 className={`text-lg sm:text-xl md:text-2xl ${isDesktop ? "lg:text-4xl" : "lg:text-3xl"} font-medium leading-tight tracking-normal truncate max-w-full font-display hero-animate-title ${
                      data.tipoOverlayHero === "claro" ? "text-slate-900 drop-shadow-xs" : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                    }`}>
                      {data.nombreMedico}
                    </h1>
                    <p className={`text-xs sm:text-sm uppercase tracking-wide sm:tracking-wider truncate max-w-full hero-animate-specialty ${
                      data.tipoOverlayHero === "claro" ? "text-blue-700 font-extrabold drop-shadow-2xs" : "text-cyan-300 font-semibold drop-shadow-xs"
                    }`}>
                      <TypewriterText text={data.especialidad} />
                    </p>
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
                      className={`${isDesktopAlignLeft ? "w-auto min-w-[260px] mx-0" : "w-[80%] sm:w-auto sm:min-w-[280px] max-w-md mx-auto"} inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-emerald-500/30 transition-all cursor-pointer group text-center`}
                    >
                      <Calendar className="w-5 h-5 shrink-0 text-emerald-100 group-hover:scale-110 transition-transform" />
                      <span className="uppercase tracking-wide font-bold">Agendar Cita</span>
                    </a>
                  </div>

                  {/* REDES SOCIALES & BOTONES DE ACCIÓN RÁPIDA */}
                  <div className={`flex items-center ${isDesktopAlignLeft ? "justify-start" : "justify-center"} gap-2.5 pt-1 flex-wrap hero-animate-social`}>
                    {/* WhatsApp */}
                    <a 
                      href={data.whatsappUrl || `https://wa.me/${data.telefonoGBP.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Contactar por WhatsApp"
                      title="WhatsApp Directo"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20"
                    >
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </a>

                    {/* Instagram */}
                    {data.instagramUrl && (
                      <a 
                        href={data.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram del Especialista"
                        title="Instagram"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}

                    {/* Facebook */}
                    {data.facebookUrl && (
                      <a 
                        href={data.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook del Especialista"
                        title="Facebook"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20"
                      >
                        <Facebook className="w-5 h-5 fill-current" />
                      </a>
                    )}

                    {/* Teléfono / Llamar */}
                    <a 
                      href={`tel:${data.telefonoGBP}`} 
                      aria-label="Llamar al Consultorio"
                      title="Llamada Directa"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0288D1] hover:bg-[#0277bd] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20"
                    >
                      <Phone className="w-5 h-5" />
                    </a>

                    {/* Compartir Perfil */}
                    <button 
                      type="button"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `${data.nombreMedico} - ${data.especialidad}`,
                            text: `Consulta médica y perfil profesional de ${data.nombreMedico} en ${data.ciudad}`,
                            url: window.location.href
                          }).catch(() => {});
                        } else {
                          navigator.clipboard?.writeText(window.location.href);
                          setShareFeedback("¡Enlace del perfil copiado!");
                          setTimeout(() => setShareFeedback(""), 2500);
                        }
                      }}
                      aria-label="Compartir perfil"
                      title="Compartir Perfil Médico"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20"
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
                      <span className="relative inline-flex h-2.5 w-2.5 md:h-3 md:w-3 shrink-0">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-400' : liveStatus.dotColor === 'amber' ? 'bg-amber-400' : 'bg-slate-400'} opacity-75`}></span>
                        <span className={`inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 ${liveStatus.dotColor === 'emerald' ? 'bg-emerald-500' : liveStatus.dotColor === 'amber' ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
                      </span>
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
                <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center justify-center space-y-3 sm:space-y-3.5 text-center my-auto">
                  {/* 1. LOGOTIPO (Visible únicamente en Mobile y Tablet, Oculto en Desktop) */}
                  {data.logoUrl ? (
                    <div className="w-full flex justify-center items-center -mt-2 sm:-mt-3 pt-0 pb-0.5 animate-in fade-in slide-in-from-top-2 duration-700">
                      <img 
                        src={data.logoUrl} 
                        alt={`Logotipo ${data.nombreMedico}`} 
                        style={{ height: `${Math.round(currentLogoH * 1.25)}px`, maxHeight: `${Math.round(currentLogoH * 1.25)}px`, width: 'auto' }}
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

        {/* NOSOTROS / ACERCA DE */}
        {isSectionVisible("eeat") && (
          <section id="preview-landing-nosotros" className="p-6 sm:p-8 bg-white space-y-6 text-left">
          <div className="space-y-2.5">
            <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-2.5 py-1 rounded-md inline-block`}>Sobre el Especialista</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight">Trayectoria y formación</h2>
            <p className={`text-xs sm:text-sm font-semibold text-${getC("700")} tracking-wide`}>Experiencia, acreditaciones y compromiso con el paciente</p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {data.biografiaCurta}
            </p>
          </div>

          {/* Stats Rápidos - Colores Sólidos y Diseño Limpio */}
          <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-200/80 text-center bg-slate-50/50 rounded-xl">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-all">
              <div className={`w-11 h-11 rounded-full bg-${getC("100")} text-${getC("600")} flex items-center justify-center mb-2 shrink-0`}>
                <Award className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold text-${getC("600")}`}>+{data.anosExperiencia}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">Años Exp.</p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-all">
              <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2 shrink-0">
                <Star className="w-5.5 h-5.5 text-amber-600 fill-amber-500 animate-pulse" />
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold text-${getC("600")}`}>4.9/5</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">Puntuación Pacientes</p>
            </div>
          </div>

          {/* Botón de acceso al Perfil Médico con Animación Bounce */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-${getC("600")} hover:bg-${getC("700")} text-white text-sm font-extrabold shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] animate-bounce hover:animate-none`}
              style={{ animationDuration: '2.5s' }}
            >
              <UserCheck className="w-5 h-5 text-white shrink-0" />
              <span className="tracking-wide uppercase font-black">MI PERFIL COMPLETO</span>
            </button>
          </div>
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
            <p className={`text-xs sm:text-sm text-${getC("700")} mt-1 max-w-lg mx-auto font-medium`}>Servicios integrales diseñados bajo estándares internacionales para garantizar seguridad y máxima precisión.</p>
          </div>

          {/* Grid de los 5 servicios principales */}
          <div className={`grid ${device === "desktop" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            {data.servicios.slice(0, 5).map((srv, idx) => {
              const hasImage = srv.mostrarImagen !== false && Boolean(srv.imagenUrl);

              return (
                <div 
                  key={srv.id || idx} 
                  className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4 hover:border-blue-300 hover:shadow-md transition-all group overflow-hidden"
                >
                  <div className="space-y-3">
                    {hasImage ? (
                      <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-2xs group-hover:scale-[1.015] transition-transform duration-300">
                        <img src={srv.imagenUrl} alt={srv.titulo} className="w-full h-full object-cover" loading="lazy" />
                        {srv.destacado && (
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold text-amber-800 bg-amber-50/95 backdrop-blur-xs border border-amber-200/90 px-2.5 py-0.5 rounded-full shadow-xs">
                            ⭐ Destacado
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0 h-12 w-12 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {renderIcon(srv.icono)}
                        </div>
                        {srv.destacado && (
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">⭐ Destacado</span>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5 min-w-0">
                      {/* H2 para SEO según requerimiento */}
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-950 leading-snug group-hover:text-blue-600 transition-colors">
                        {srv.titulo}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">{srv.descripcion}</p>
                    </div>
                  </div>

                  {/* Badges de precio, duración y recuperación */}
                  <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 text-[11px]">
                    {srv.precio && (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                        <Banknote className="w-3 h-3 text-emerald-600" />
                        {srv.precio}
                      </span>
                    )}
                    {srv.duracion && (
                      <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-blue-600" />
                        {srv.duracion}
                      </span>
                    )}
                    {srv.recuperacion && (
                      <span className="inline-flex items-center gap-1 font-bold text-purple-800 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-md">
                        <Activity className="w-3 h-3 text-purple-600" />
                        {srv.recuperacion}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón "Mis Servicios" para abrir el modal */}
          <div className="pt-3 text-center">
            <button
              type="button"
              id="btn-open-all-services-modal"
              onClick={() => setShowServicesModal(true)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-${getC("600")} hover:bg-${getC("700")} text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.01]`}
            >
              <Stethoscope className="w-4.5 h-4.5" />
              <span>Mis servicios</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Abre el catálogo completo con detalles de cada tratamiento</p>
          </div>
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all hover:scale-105"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs hover:shadow-md transition-all hover:scale-105"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all hover:scale-105"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all hover:scale-105"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all hover:scale-105"
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

        {/* CARRUSEL DE INSTALACIONES Y CONSULTORIO */}
        {isSectionVisible("galeria") && (
          <ClinicGalleryPreviewCarousel
            photos={data.fotosConsultorio || []}
            primaryColorClass={getC("600")}
            getC={getC}
          />
        )}

        {/* CASOS COMPARATIVOS - SLIDERS INTERACTIVOS */}
        {isSectionVisible("casos") && data.casosAntesDespues && data.casosAntesDespues.length > 0 && (
          <section id="preview-landing-casos" className="p-6 sm:p-8 bg-white space-y-5 text-left">
            <div className="text-center pb-2">
              <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-3 py-1 rounded-full inline-block`}>
                {data.casosAntesDespues.length} Casos Clínicos
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2">Mis casos</h2>
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

        {/* FAQs ACORDEÓN */}
        {isSectionVisible("faqs") && data.faqs && data.faqs.length > 0 && (
          <section id="preview-landing-faq" className="p-6 sm:p-8 bg-slate-50/70 space-y-6 text-left">
            <div className="text-center pb-1">
              <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} px-3.5 py-1 rounded-full border border-${getC("200")}/60 inline-block`}>
                Preguntas Frecuentes ({data.faqs.length})
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2.5 tracking-tight">Preguntas Frecuentes de la Consulta</h2>
              <p className={`text-xs sm:text-sm text-${getC("700")} font-medium mt-1 max-w-lg mx-auto`}>Respuestas claras y oportunas para disipar tus dudas antes de agendar tu cita médica.</p>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              {data.faqs.map((faq, i) => {
                const isExpanded = !!faqExpanded[i];
                const preguntaClean = faq.pregunta.replace(/\{\{CIUDAD\}\}/g, data.ciudad || "Ecuador");
                const respuestaClean = faq.respuesta.replace(/\{\{CIUDAD\}\}/g, data.ciudad || "Ecuador");
                return (
                  <div key={faq.id || i} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all overflow-hidden">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="flex items-center justify-between w-full text-left font-extrabold text-xs sm:text-sm text-slate-900 hover:text-slate-950 p-4 sm:p-4.5 focus:outline-none cursor-pointer gap-3 transition-colors"
                      aria-expanded={isExpanded}
                      aria-controls={`preview-faq-ans-${i}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`w-5.5 h-5.5 rounded-full bg-${getC("50")} text-${getC("700")} text-[11px] font-extrabold flex items-center justify-center shrink-0 border border-${getC("100")}`}>
                          {i + 1}
                        </span>
                        <span className="leading-snug">{preguntaClean}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? `rotate-180 text-${getC("600")}` : ""}`} />
                    </button>
                    {isExpanded && (
                      <div id={`preview-faq-ans-${i}`} className="px-4.5 pb-4.5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                        <p>{respuestaClean}</p>
                      </div>
                    )}
                  </div>
                );
              })}
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
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 w-full rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
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
                      src={post.imagenUrl}
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
                      className={`text-xs font-extrabold text-${getC("600")} hover:text-${getC("700")} flex items-center gap-1 mt-1 cursor-pointer self-start`}
                    >
                      <span>Leer artículo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AGENDAR Y MAPA (Contacto) */}
        {isSectionVisible("horarios_ubicacion") && (
          <section id="agendar-preview" className="p-6 sm:p-8 bg-white border-t border-slate-200/70 space-y-6 text-left">
          <div className="space-y-1.5">
            <span className={`text-[11px] font-extrabold text-${getC("600")} uppercase tracking-widest bg-${getC("50")} border border-${getC("200")}/60 px-2.5 py-1 rounded-md inline-block`}>Contáctenos</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">Agenda tu Valoración</h2>
            <p className={`text-xs sm:text-sm text-${getC("700")} font-medium`}>Atención médica personalizada y cita directa en {data.ciudad || "Ecuador"}.</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* NAP Info */}
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-slate-950">Ubicación física</p>
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
                <p className="font-extrabold text-slate-950">Teléfono</p>
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
          {isSectionVisible("tarifas") && (
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
          )}

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

          {/* Botones de Agenda Adaptables */}
          <div className="flex flex-col items-center gap-3.5 pt-1 w-full">
            {data.estiloCta === "estatico_pulso" && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs text-xs font-black mb-1">
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
              className={`w-[95%] max-w-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm sm:text-base font-extrabold py-4 px-6 rounded-2xl text-center flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] border border-emerald-500/30 transition-all cursor-pointer ${
                data.estiloCta === "estatico_pulso" ? "ring-4 ring-emerald-400/30 shadow-xl animate-pulse hover:animate-none" : ""
              }`}
            >
              <Calendar className="w-5 h-5 shrink-0 text-emerald-100" />
              <span>Confirmar cita</span>
            </button>
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
                      <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-100 block">Trayectoria</span>
                        <h3 className="text-base sm:text-lg font-black leading-tight text-white">Perfil Profesional</h3>
                      </div>
                    </div>
                    <button
                      id="preview-close-profile-modal"
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Cerrar perfil médico"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Contenido del Resumen */}
                <div className="p-5 sm:p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                  
                  {/* Tarjeta del Doctor */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
                    <img 
                      src={data.fotoUrl} 
                      alt={data.nombreMedico} 
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{data.nombreMedico}</h4>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          Verificado
                        </span>
                      </div>
                      <p className={`text-[11px] font-extrabold text-${getC("600")} truncate`}>{data.especialidad}</p>
                      <p className="text-[10px] text-slate-500 truncate">Cédula Profesional: {data.cedulaProfesional}</p>
                    </div>
                  </div>

                  {/* Hospitales */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Hospitales de trabajo</h4>
                    <div className="space-y-2">
                      {data.hospitalesdondeOpera.map((hosp, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{hosp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Asociaciones Médicas */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Asociaciones y Certificados medicos</h4>
                    <ul className="space-y-2 pl-1">
                      {data.asociaciones.map((asoc, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <Award className={`w-4 h-4 text-${getC("600")} shrink-0 mt-0.5`} />
                          <span>{asoc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Redes Sociales del Especialista */}
                  <div className="space-y-3 pt-3.5 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Redes Sociales y Canales Oficiales</h4>
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
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleShareProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-2xs border border-blue-200/40 active:scale-95 duration-150"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span>{shareFeedback || "Compartir perfil"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-xl transition-all cursor-pointer active:scale-95 duration-150"
                  >
                    Entendido
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
                  
                  {/* Tarjeta del Doctor */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
                    <img 
                      src={data.fotoUrl} 
                      alt={data.nombreMedico} 
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{data.nombreMedico}</h4>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          Verificado
                        </span>
                      </div>
                      <p className={`text-[11px] font-extrabold text-${getC("600")} truncate`}>{data.especialidad}</p>
                      <p className="text-[10px] text-slate-500 truncate">Cédula Profesional: {data.cedulaProfesional}</p>
                    </div>
                  </div>

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

                  {/* Valor de la Consulta & Métodos de Pago */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-700">Valor de la Consulta:</span>
                      </div>
                      <span className="text-sm font-black text-slate-950">
                        {data.precioConsulta || "$50 USD"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-600">
                      <span className="font-semibold text-slate-500">Pagos aceptados:</span>
                      <span className="font-bold text-slate-800">
                        {(data.metodosPago || ["Efectivo", "Transferencia", "Tarjetas"]).join(" • ")}
                      </span>
                    </div>
                  </div>

                  {/* Dirección Física & Consultorio (NAP) */}
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
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1ca34f] text-white text-xs sm:text-sm font-extrabold py-3.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
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

          {/* MODAL INTERACTIVO: CATÁLOGO COMPLETO DE SERVICIOS ("MIS SERVICIOS") */}
          {showServicesModal && (
            <motion.div
              id="preview-services-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowServicesModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white rounded-3xl max-w-5xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
              >
                {/* Cabecera del Modal */}
                <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-${getC("600")} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white leading-tight">Catálogo de Procedimientos Médicos</h2>
                      <p className="text-xs text-slate-300 font-medium">Explora todos los tratamientos y procedimientos médicos disponibles</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowServicesModal(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Buscador en tiempo real */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200/80 shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre de procedimiento, síntoma o técnica..."
                      className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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

                {/* Lista de Servicios Filtrados */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                  {(() => {
                    const filtered = (data.servicios || []).filter(srv => {
                      if (!serviceSearchQuery.trim()) return true;
                      const q = serviceSearchQuery.toLowerCase();
                      return (srv.titulo || "").toLowerCase().includes(q) || (srv.descripcion || "").toLowerCase().includes(q);
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-12 space-y-2">
                          <p className="text-sm font-bold text-slate-700">No se encontraron procedimientos</p>
                          <p className="text-xs text-slate-500">Intenta con otro término o consulta directamente por WhatsApp.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        {filtered.map((srv, idx) => {
                          const hasImage = srv.mostrarImagen !== false && Boolean(srv.imagenUrl);

                          return (
                            <div 
                              key={srv.id || idx}
                              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group overflow-hidden"
                            >
                              <div className="space-y-3.5">
                                {hasImage ? (
                                  <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs group-hover:scale-[1.02] transition-transform duration-300">
                                    <img src={srv.imagenUrl} alt={srv.titulo} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {srv.destacado && (
                                      <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold text-amber-800 bg-amber-50/95 backdrop-blur-xs border border-amber-200/90 px-2.5 py-0.5 rounded-full shadow-xs">
                                        ⭐ Destacado
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="relative w-full h-36 sm:h-40 rounded-xl bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/70 border border-blue-100/80 flex items-center justify-center overflow-hidden group-hover:border-blue-300 transition-all duration-300">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                      {renderIcon(srv.icono)}
                                    </div>
                                    {srv.destacado && (
                                      <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold text-amber-800 bg-amber-50/95 backdrop-blur-xs border border-amber-200/90 px-2.5 py-0.5 rounded-full shadow-xs">
                                        ⭐ Destacado
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-1.5 min-w-0">
                                  {/* H2 para SEO */}
                                  <h2 className="text-base sm:text-lg font-extrabold text-slate-950 leading-snug group-hover:text-blue-600 transition-colors">
                                    {srv.titulo}
                                  </h2>
                                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">{srv.descripcion}</p>
                                </div>

                                {/* Badges informativos */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {srv.precio && (
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 flex items-center gap-1">
                                      <Banknote className="w-3 h-3 text-emerald-600" />
                                      {srv.precio}
                                    </span>
                                  )}
                                  {srv.duracion && (
                                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-blue-600" />
                                      {srv.duracion}
                                    </span>
                                  )}
                                  {srv.recuperacion && (
                                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 flex items-center gap-1">
                                      <Activity className="w-3 h-3 text-purple-600" />
                                      {srv.recuperacion}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-100">
                                <a
                                  href="#agendar-preview"
                                  onClick={() => setShowServicesModal(false)}
                                  className={`w-full flex items-center justify-center gap-2 bg-${getC("600")} hover:bg-${getC("700")} text-white text-xs font-extrabold py-2.5 px-3 rounded-xl text-center transition-all duration-200 shadow-2xs group-hover:shadow-md cursor-pointer`}
                                >
                                  <span>Agendar este procedimiento</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Footer del Modal */}
                <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
                  <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    💡 Procedimientos realizados bajo protocolos médicos certificados
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href="#agendar-preview"
                      onClick={() => setShowServicesModal(false)}
                      className={`flex-1 sm:flex-none bg-${getC("600")} hover:bg-${getC("700")} text-white text-xs font-extrabold py-2.5 px-5 rounded-xl text-center transition-colors shadow-2xs`}
                    >
                      Agendar Consulta
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowServicesModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

              </motion.div>
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
                className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1ca34f] text-white py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="truncate font-black">WhatsApp Directo</span>
              </a>
              <button 
                type="button" 
                onClick={() => {
                  setBookingModalService("whatsapp");
                  setShowBookingModal(true);
                }}
                className={`flex-1 bg-${getC("600")} hover:bg-${getC("700")} active:bg-${getC("800")} text-white py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center cursor-pointer`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="truncate font-black">Agendar Cita</span>
              </button>
            </div>
          ) : (
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

      </div>
    </div>
  );
}
