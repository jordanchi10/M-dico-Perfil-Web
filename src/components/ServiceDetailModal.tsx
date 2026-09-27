/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { ServiceItem, MedicalLandingData } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Stethoscope, 
  Check, 
  Clock, 
  Banknote, 
  Activity, 
  Building2, 
  Film, 
  ImageIcon, 
  Upload, 
  Plus, 
  Play, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Loader2,
  Instagram,
  CheckCircle2,
  ShieldCheck,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { compressAndConvertToWebP } from "../utils/imageCompressor";
import { getActiveColorScale } from "../utils/colorUtils";

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  data: MedicalLandingData;
  onClose: () => void;
  onSelectService: (serviceTitle: string) => void;
  onUpdateServiceMedia?: (updatedService: ServiceItem) => void;
  getC?: (shade: string) => string;
}

/**
 * Visor de pantalla completa (Lightbox) para imágenes de tratamientos
 */
function ServiceImageLightbox({
  images,
  initialIndex = 0,
  title,
  onClose
}: {
  images: string[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handlePrev = useCallback(() => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  // Atajos de teclado para navegación y escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleResetZoom();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  if (!images || images.length === 0) return null;
  const currentImage = images[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none"
      onClick={onClose}
    >
      {/* BARRA SUPERIOR DE HERRAMIENTAS */}
      <div 
        className="flex items-center justify-between gap-3 text-white z-20 shrink-0 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h4>
            <p className="text-[11px] text-slate-400">
              Fotografía clínica {currentIndex + 1} de {images.length} {currentIndex === 0 ? "(Portada)" : "(Detalle clínico)"}
            </p>
          </div>
        </div>

        {/* CONTROLES DE ZOOM Y CERRAR */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 cursor-pointer transition-colors"
              title="Alejar (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold px-2 text-slate-300 min-w-[42px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 cursor-pointer transition-colors"
              title="Acercar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg text-amber-300 hover:bg-slate-700 cursor-pointer transition-colors ml-0.5"
                title="Restablecer tamaño (100%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-all cursor-pointer hover:scale-105 border border-red-500/30"
            title="Cerrar visor (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DE LA IMAGEN CON NAVEGACIÓN */}
      <div 
        className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN ANTERIOR */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-30 p-3 sm:p-4 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white shadow-2xl border border-white/20 transition-all cursor-pointer hover:scale-110 active:scale-95"
            title="Foto anterior (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* IMAGEN PRINCIPAL EN ALTA RESOLUCIÓN */}
        <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden">
          <motion.img
            key={currentImage}
            src={currentImage}
            alt={`${title} - Foto ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: zoomLevel }}
            transition={{ duration: 0.2 }}
            className="max-h-[75vh] max-w-[90vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-transform cursor-zoom-in"
            onClick={() => setZoomLevel(prev => prev === 1 ? 1.75 : 1)}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* BOTÓN SIGUIENTE */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-30 p-3 sm:p-4 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white shadow-2xl border border-white/20 transition-all cursor-pointer hover:scale-110 active:scale-95"
            title="Siguiente foto (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* TIRA INFERIOR DE MINIATURAS */}
      {images.length > 1 && (
        <div 
          className="shrink-0 flex items-center justify-center gap-2 py-2 overflow-x-auto max-w-full z-20 px-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl max-w-full overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setZoomLevel(1);
                  setCurrentIndex(idx);
                }}
                className={`relative w-14 sm:w-18 aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  currentIndex === idx 
                    ? "border-blue-500 ring-2 ring-blue-400 scale-105 opacity-100" 
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-bold text-white text-center py-0.5">
                  #{idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Renderizador de video, reel o iframe de redes sociales
 */
function renderSingleMediaItem(itemStr: string, index: number, title: string) {
  if (!itemStr || !itemStr.trim()) return null;
  const str = itemStr.trim();

  // 1. Si hay código iframe embed explícito
  if (str.includes("<iframe")) {
    return (
      <div key={index} className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Demostración Clínica #{index + 1}</span>
        <div 
          className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center min-h-[320px] shadow-sm"
          dangerouslySetInnerHTML={{ __html: str }}
        />
      </div>
    );
  }

  // 2. Si hay URL de Reel / Video - YouTube
  const ytMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return (
      <div key={index} className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Video YouTube #{index + 1}</span>
        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-sm">
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0`}
            title={`${title} - Video ${index + 1}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // 3. Instagram Reel / Post
  const igMatch = str.match(/instagram\.com\/(?:p|reel|reels)\/([^/?#&]+)/);
  if (igMatch && igMatch[1]) {
    return (
      <div key={index} className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Reel Instagram #{index + 1}</span>
        <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 p-3 flex flex-col items-center shadow-sm">
          <div className="w-full max-w-[380px] h-[480px] rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.instagram.com/p/${igMatch[1]}/embed/captioned/`}
              title={`Instagram Reel ${index + 1}`}
              className="w-full h-full border-0"
              allowtransparency="true"
            />
          </div>
          <a
            href={str}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
          >
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>Ver Reel original en Instagram</span>
          </a>
        </div>
      </div>
    );
  }

  // 4. Direct MP4 or video link
  if (str.endsWith(".mp4") || str.endsWith(".webm")) {
    return (
      <div key={index} className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Video Demostrativo #{index + 1}</span>
        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-sm">
          <video src={str} controls className="w-full h-full object-contain" />
        </div>
      </div>
    );
  }

  // Fallback card link for other reels/tiktok
  return (
    <div key={index} className="p-4 rounded-2xl border border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-600/30 text-pink-400 flex items-center justify-center shrink-0">
          <Film className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-100">Video / Reel Demostrativo #{index + 1}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-[240px] sm:max-w-xs">{str}</p>
        </div>
      </div>
      <a
        href={str}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-all shadow-xs shrink-0"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Ver Video</span>
      </a>
    </div>
  );
}

function renderMediaContent(service: ServiceItem) {
  const items: string[] = [];
  if (service.codigosEmbed && service.codigosEmbed.length > 0) {
    service.codigosEmbed.forEach(item => {
      if (item && item.trim()) items.push(item.trim());
    });
  }
  if (items.length === 0) {
    if (service.codigoEmbed && service.codigoEmbed.trim()) items.push(service.codigoEmbed.trim());
    if (service.reelUrl && service.reelUrl.trim() && !items.includes(service.reelUrl.trim())) items.push(service.reelUrl.trim());
    if (service.videoUrl && service.videoUrl.trim() && !items.includes(service.videoUrl.trim())) items.push(service.videoUrl.trim());
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.slice(0, 8).map((item, idx) => renderSingleMediaItem(item, idx, service.titulo))}
    </div>
  );
}

export function ServiceDetailModal({
  service,
  data,
  onClose,
  onSelectService,
  onUpdateServiceMedia
}: ServiceDetailModalProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [newReelUrl, setNewReelUrl] = useState("");
  const [newEmbedCode, setNewEmbedCode] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const activeColorScale = getActiveColorScale(data.paletaColor, data.colorPrimarioHex);

  // Bloquear scroll de fondo cuando la página de servicio está activa
  useEffect(() => {
    if (service) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [service]);

  // Atajo de tecla Escape para retroceder
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightboxOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, lightboxOpen]);

  if (!service) return null;

  // Lista unificada de todas las imágenes del servicio (Portada + Fotos adicionales de galería)
  const allImages: string[] = [
    ...(service.imagenUrl ? [service.imagenUrl] : []),
    ...(Array.isArray(service.galeriaFotos) ? service.galeriaFotos.filter(Boolean) : [])
  ];

  const currentGallery = service.galeriaFotos || [];
  const currentActiveImage = allImages[activeImageIndex] || service.imagenUrl || null;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const openLightboxAt = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateServiceMedia) return;

    setUploadingImage(true);
    try {
      const res = await compressAndConvertToWebP(file, { maxWidth: 1200, maxHeight: 900, quality: 0.85 });
      const updatedGallery = [...currentGallery, res.dataUrl];
      onUpdateServiceMedia({
        ...service,
        galeriaFotos: updatedGallery
      });
      setActiveImageIndex(service.imagenUrl ? updatedGallery.length : updatedGallery.length - 1);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const updatedGallery = [...currentGallery, reader.result];
          onUpdateServiceMedia({
            ...service,
            galeriaFotos: updatedGallery
          });
          setActiveImageIndex(service.imagenUrl ? updatedGallery.length : updatedGallery.length - 1);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSaveReelOrEmbed = () => {
    if (!onUpdateServiceMedia) return;
    const updated: ServiceItem = {
      ...service
    };
    if (newReelUrl.trim()) updated.reelUrl = newReelUrl.trim();
    if (newEmbedCode.trim()) updated.codigoEmbed = newEmbedCode.trim();

    onUpdateServiceMedia(updated);
    setNewReelUrl("");
    setNewEmbedCode("");
    setShowUploader(false);
  };

  const handleRemoveGalleryImage = (imgUrl: string) => {
    if (!onUpdateServiceMedia) return;
    const updated = currentGallery.filter((item) => item !== imgUrl);
    onUpdateServiceMedia({
      ...service,
      galeriaFotos: updated
    });
    setActiveImageIndex(0);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-50 text-slate-900 flex flex-col overflow-y-auto selection:bg-purple-600 selection:text-white"
        >
          {/* BARRA DE NAVEGACIÓN SUPERIOR: SÓLO BOTÓN REGRESAR */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
              
              {/* BOTÓN DE RETROCESO PRINCIPAL (ÚNICO ELEMENTO EN CABECERA) */}
              <button
                type="button"
                onClick={onClose}
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

          {/* CUERPO PRINCIPAL DE LA PÁGINA INDEPENDIENTE */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            
            {/* BREADCRUMB / RUTA DE NAVEGACIÓN */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6 flex-wrap">
              <button 
                type="button" 
                onClick={onClose}
                className="hover:underline transition-colors cursor-pointer font-semibold"
                style={{ color: activeColorScale["700"] }}
              >
                Inicio
              </button>
              <span className="text-slate-300">/</span>
              <button 
                type="button" 
                onClick={onClose}
                className="hover:underline transition-colors cursor-pointer font-semibold"
                style={{ color: activeColorScale["700"] }}
              >
                Procedimientos & Tratamientos
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold truncate max-w-xs">{service.titulo}</span>
            </nav>

            {/* GRID PRINCIPAL DISTRIBUIDO PARA DESKTOP & MOBILE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              
              {/* COLUMNA IZQUIERDA (PRINCIPAL / VISUALES Y DESCRIPCIÓN CLÍNICA) - 7 COLUMNAS */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* SHOWCASE VISUAL PRINCIPAL (FOTO GRANDE EN ALTA DEFINICIÓN) */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-2 sm:p-3">
                  <div className="relative aspect-16/10 sm:aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden group select-none flex items-center justify-center">
                    {currentActiveImage ? (
                      <>
                        {/* Fondo difuminado elegante */}
                        <img
                          src={currentActiveImage}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30 select-none pointer-events-none"
                          aria-hidden="true"
                          referrerPolicy="no-referrer"
                        />
                        {/* Foto principal completa sin recortar */}
                        <img
                          src={currentActiveImage}
                          alt={`${service.titulo} - Foto ${activeImageIndex + 1}`}
                          className="relative w-full h-full object-contain z-10 transition-transform duration-300 cursor-zoom-in group-hover:scale-[1.01]"
                          onClick={() => openLightboxAt(activeImageIndex)}
                          referrerPolicy="no-referrer"
                        />

                        {/* Botones Anterior / Siguiente si hay más fotos */}
                        {allImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={handlePrevImage}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:scale-110 text-white shadow-xl transition-all cursor-pointer active:scale-95 border border-white/20 z-20"
                              title="Foto anterior"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                              type="button"
                              onClick={handleNextImage}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:scale-110 text-white shadow-xl transition-all cursor-pointer active:scale-95 border border-white/20 z-20"
                              title="Siguiente foto"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {/* Badges superiores sobre la imagen */}
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-20">
                          {service.badgeEtiqueta && (
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-3 py-1 rounded-full shadow-md border border-amber-300">
                              ⭐ {service.badgeEtiqueta}
                            </span>
                          )}
                          {service.destacado && !service.badgeEtiqueta && (
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-3 py-1 rounded-full shadow-md">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>

                        {/* Botón flotante para ampliar en HD */}
                        <button
                          type="button"
                          onClick={() => openLightboxAt(activeImageIndex)}
                          className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white shadow-lg transition-all cursor-pointer hover:scale-105 border border-white/20 flex items-center gap-1.5 px-3 text-xs font-bold z-20"
                          title="Ampliar en pantalla completa"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>Ampliar HD</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8 text-white text-center">
                        <Stethoscope className="w-16 h-16 opacity-70 mb-3" style={{ color: activeColorScale["400"] }} />
                        <span className="text-sm font-bold text-slate-200">Tratamiento Médico Especializado</span>
                      </div>
                    )}
                  </div>

                  {/* TIRA DE MINIATURAS INTERACTIVAS INFERIOR */}
                  {allImages.length > 1 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto pt-3 pb-1 px-1">
                      {allImages.map((img, idx) => {
                        const isSelected = activeImageIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            style={{
                              borderColor: isSelected ? activeColorScale["600"] : undefined
                            }}
                            className={`relative w-16 sm:w-20 aspect-4/3 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                              isSelected
                                ? "ring-2 ring-purple-500/30 scale-105 shadow-sm"
                                : "border-slate-200 opacity-60 hover:opacity-100"
                            }`}
                            title={`Ver fotografía ${idx + 1}`}
                          >
                            <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* DESCRIPCIÓN CLÍNICA DETALLADA */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 text-left">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <div 
                      className="p-2.5 rounded-2xl flex items-center justify-center shadow-2xs shrink-0"
                      style={{ 
                        backgroundColor: activeColorScale["50"], 
                        color: activeColorScale["600"],
                        border: `1px solid ${activeColorScale["200"]}`
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 
                        className="text-sm sm:text-base font-black uppercase tracking-wider font-display"
                        style={{ color: activeColorScale["600"] }}
                      >
                        Descripción Clínica del Tratamiento
                      </h3>
                    </div>
                  </div>

                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-line font-normal pt-1">
                    {service.descripcion || "Consulte directamente para una evaluación clínica personalizada sobre este tratamiento y sus objetivos terapéuticos específicos."}
                  </p>
                </div>

                {/* GALERÍA DE IMÁGENES CLÍNICAS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="p-2.5 rounded-2xl flex items-center justify-center shadow-2xs shrink-0"
                        style={{ 
                          backgroundColor: activeColorScale["50"], 
                          color: activeColorScale["600"],
                          border: `1px solid ${activeColorScale["200"]}`
                        }}
                      >
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 
                          className="text-sm sm:text-base font-black uppercase tracking-wider font-display"
                          style={{ color: activeColorScale["600"] }}
                        >
                          Galería Fotográfica ({allImages.length})
                        </h3>
                      </div>
                    </div>

                    {onUpdateServiceMedia && (
                      <button
                        type="button"
                        onClick={() => setShowUploader(!showUploader)}
                        style={{
                          backgroundColor: activeColorScale["50"],
                          borderColor: activeColorScale["200"],
                          color: activeColorScale["700"]
                        }}
                        className="text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto hover:opacity-90"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{showUploader ? "Ocultar Panel de Carga" : "Agregar Foto / Video"}</span>
                      </button>
                    )}
                  </div>

                  {/* GRID DE FOTOS */}
                  {allImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
                      {allImages.map((imgUrl, gIdx) => {
                        const isCover = gIdx === 0 && Boolean(service.imagenUrl);
                        const isCurrentlyActive = activeImageIndex === gIdx;

                        return (
                          <div 
                            key={gIdx} 
                            style={{
                              borderColor: isCurrentlyActive ? activeColorScale["600"] : undefined
                            }}
                            className={`group relative rounded-2xl overflow-hidden border-2 transition-all bg-slate-900 shadow-2xs hover:shadow-md ${
                              isCurrentlyActive 
                                ? "ring-2 ring-purple-500/30 scale-[1.02]" 
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div 
                              className="aspect-4/3 w-full overflow-hidden cursor-pointer bg-slate-950 flex items-center justify-center relative"
                              onClick={() => {
                                setActiveImageIndex(gIdx);
                                openLightboxAt(gIdx);
                              }}
                            >
                              <img 
                                src={imgUrl} 
                                alt={`Foto ${gIdx + 1} - ${service.titulo}`} 
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white">
                                <span className="p-2 rounded-full bg-slate-900/90 text-white shadow-md flex items-center gap-1 text-[11px] font-bold">
                                  <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Ampliar</span>
                                </span>
                              </div>
                            </div>

                            <div className="absolute top-2 left-2 pointer-events-none">
                              {isCover ? (
                                <span 
                                  className="text-[9px] font-black uppercase text-white backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs"
                                  style={{ backgroundColor: activeColorScale["600"] }}
                                >
                                  Portada
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold text-white bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs">
                                  Foto #{gIdx + 1}
                                </span>
                              )}
                            </div>

                            {!isCover && onUpdateServiceMedia && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveGalleryImage(imgUrl);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-slate-900/85 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                title="Eliminar esta foto de la galería"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">Galería clínica en preparación</p>
                    </div>
                  )}

                  {/* PANEL DE SUBIDA MULTIMEDIA */}
                  {showUploader && (
                    <div 
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border shadow-sm space-y-4 animate-fade-in mt-3"
                      style={{ borderColor: activeColorScale["200"] }}
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Plus className="w-4 h-4" style={{ color: activeColorScale["600"] }} />
                          <span>Cargar Fotografías o Video para {service.titulo}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">WebP optimizado</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-700 uppercase block">1. Subir Fotografía</span>
                          <label 
                            className="w-full py-2.5 px-3 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
                            style={{ backgroundColor: activeColorScale["600"] }}
                          >
                            {uploadingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <Upload className="w-4 h-4 text-white" />
                            )}
                            <span>{uploadingImage ? "Comprimiendo WebP..." : "Seleccionar Fotografía"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleUploadPhoto}
                              disabled={uploadingImage}
                            />
                          </label>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-700 uppercase block">2. Enlace de Reel / Video</span>
                          <div className="space-y-2">
                            <input
                              type="url"
                              value={newReelUrl}
                              onChange={(e) => setNewReelUrl(e.target.value)}
                              placeholder="https://www.instagram.com/reel/..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-slate-50 focus:border-slate-400"
                            />
                            <input
                              type="text"
                              value={newEmbedCode}
                              onChange={(e) => setNewEmbedCode(e.target.value)}
                              placeholder="O pega código <iframe...> embed"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-slate-50 font-mono focus:border-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowUploader(false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveReelOrEmbed}
                          style={{ backgroundColor: activeColorScale["600"] }}
                          className="px-4 py-1.5 rounded-xl text-white text-xs font-extrabold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Guardar Multimedia</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* DEMOSTRACIÓN EN VIDEO / REELS */}
                {(service.codigoEmbed || service.reelUrl || service.videoUrl || (service.codigosEmbed && service.codigosEmbed.length > 0)) && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                      <div 
                        className="p-2.5 rounded-2xl flex items-center justify-center shadow-2xs shrink-0"
                        style={{ 
                          backgroundColor: activeColorScale["50"], 
                          color: activeColorScale["600"],
                          border: `1px solid ${activeColorScale["200"]}`
                        }}
                      >
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 
                          className="text-sm sm:text-base font-black uppercase tracking-wider font-display"
                          style={{ color: activeColorScale["600"] }}
                        >
                          Demostración en Video & Reels
                        </h3>
                      </div>
                    </div>
                    {renderMediaContent(service)}
                  </div>
                )}

                {/* SEGUROS MÉDICOS Y REEMBOLSO SRI */}
                {data.aseguradoras && data.aseguradoras.length > 0 && service.aplicaReembolso !== false && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                      <div 
                        className="p-2.5 rounded-2xl flex items-center justify-center shadow-2xs shrink-0"
                        style={{ 
                          backgroundColor: activeColorScale["50"], 
                          color: activeColorScale["600"],
                          border: `1px solid ${activeColorScale["200"]}`
                        }}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 
                          className="text-sm sm:text-base font-black uppercase tracking-wider font-display"
                          style={{ color: activeColorScale["600"] }}
                        >
                          Cobertura de Seguros Médicos & Reembolso SRI (Ecuador)
                        </h3>
                      </div>
                    </div>
                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal pt-1">
                      Para este tratamiento se emite <strong className="text-slate-900 font-semibold">Factura Electrónica autorizada por el SRI</strong> y <strong className="text-slate-900 font-semibold">Formulario de Reclamo Médico firmado</strong> con código CIE-10 para trámite de reembolso o cobertura con las principales aseguradoras ({data.aseguradoras.slice(0, 5).join(", ")}{data.aseguradoras.length > 5 ? " y más" : ""}).
                    </p>
                  </div>
                )}

              </div>

              {/* COLUMNA DERECHA (FICHA TÉCNICA, TARJETA DE AGENDAMIENTO Y ACCIÓN) - 5 COLUMNAS */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                
                {/* TARJETA PRINCIPAL DE FICHA TÉCNICA Y ACCIÓN */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6 text-left">
                  
                  {/* TÍTULO Y BADGE */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg inline-block border"
                        style={{ 
                          backgroundColor: activeColorScale["50"], 
                          borderColor: activeColorScale["200"],
                          color: activeColorScale["700"] 
                        }}
                      >
                        Procedimiento Especializado
                      </span>
                      {service.badgeEtiqueta && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-1 rounded-lg">
                          ⭐ {service.badgeEtiqueta}
                        </span>
                      )}
                    </div>

                    <h1 
                      className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight font-display"
                    >
                      {service.titulo}
                    </h1>
                  </div>

                  {/* FICHA TÉCNICA GRID 2x2 */}
                  <div className="grid grid-cols-2 gap-3">
                    {service.precio && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                          <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          Inversión
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-emerald-950 mt-1">{service.precio}</span>
                      </div>
                    )}

                    {service.duracion && (
                      <div 
                        className="p-3.5 rounded-2xl border flex flex-col justify-center"
                        style={{ 
                          backgroundColor: activeColorScale["50"], 
                          borderColor: activeColorScale["200"] 
                        }}
                      >
                        <span 
                          className="text-[10px] font-bold uppercase flex items-center gap-1"
                          style={{ color: activeColorScale["700"] }}
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: activeColorScale["600"] }} />
                          Duración
                        </span>
                        <span 
                          className="text-sm sm:text-base font-extrabold mt-1"
                          style={{ color: activeColorScale["950"] }}
                        >
                          {service.duracion}
                        </span>
                      </div>
                    )}

                    {service.recuperacion && (
                      <div className="p-3.5 rounded-2xl bg-purple-50/90 border border-purple-200/80 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-purple-700 uppercase flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          Recuperación
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-purple-950 mt-1">{service.recuperacion}</span>
                      </div>
                    )}

                    {service.modalidad && (
                      <div className="p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200/80 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-teal-700 uppercase flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          Modalidad
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-teal-950 mt-1">{service.modalidad}</span>
                      </div>
                    )}
                  </div>

                  {/* BOTÓN PRINCIPAL DE ACCIÓN (AGENDAR / SELECCIONAR) */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectService(service.titulo);
                        onClose();
                      }}
                      style={{ backgroundColor: activeColorScale["600"] }}
                      className="w-full py-4 px-6 rounded-2xl text-white font-extrabold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <Check className="w-5 h-5 text-white group-hover:scale-110 transition-transform shrink-0" />
                      <span>Seleccionar y Agendar</span>
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Explorar otros procedimientos
                    </button>
                  </div>

                  {/* GARANTÍAS Y BENEFICIOS CLÍNICOS */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 text-left">
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Atención profesional personalizada y evaluación minuciosa</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Protocolos terapéuticos respaldados con evidencia médica</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Factura electrónica oficial para reembolso de seguros SRI</span>
                    </div>
                  </div>
                </div>

                {/* TARJETA DEL ESPECIALISTA / CONTACTO DIRECTO */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex items-center gap-4 text-left">
                  {data.fotoUrl ? (
                    <img 
                      src={data.fotoUrl} 
                      alt={data.nombreMedico} 
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border-2 shadow-xs" 
                      style={{ borderColor: activeColorScale["200"] }}
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: activeColorScale["50"], color: activeColorScale["700"] }}
                    >
                      <UserCheck className="w-8 h-8" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span 
                      className="text-[10px] font-extrabold uppercase tracking-wider block"
                      style={{ color: activeColorScale["600"] }}
                    >
                      Atención Especializada
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                      {data.nombreMedico}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {data.especialidad}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </main>

          {/* BARRA FLOTANTE FIJA INFERIOR PARA MOBILE */}
          <div className="lg:hidden sticky bottom-0 inset-x-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl flex items-center gap-3 z-40">
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: activeColorScale["50"],
                color: activeColorScale["700"],
                borderColor: activeColorScale["200"]
              }}
              className="p-3 rounded-2xl font-bold transition-colors cursor-pointer shrink-0 border"
              title="Regresar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectService(service.titulo);
                onClose();
              }}
              style={{ backgroundColor: activeColorScale["600"] }}
              className="flex-1 py-3.5 px-5 rounded-2xl text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Check className="w-4 h-4 text-white shrink-0" />
              <span>Seleccionar Servicio</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* MODAL LIGHTBOX FULLSCREEN EN ALTA DEFINICIÓN */}
      <AnimatePresence>
        {lightboxOpen && (
          <ServiceImageLightbox
            images={allImages}
            initialIndex={lightboxIndex}
            title={service.titulo}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
