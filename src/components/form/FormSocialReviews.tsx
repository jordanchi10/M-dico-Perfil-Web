/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData, ReviewItem, SocialVideoItem } from "../../types";
import { 
  Share2, 
  Star, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Globe, 
  Instagram, 
  Facebook, 
  Mail, 
  Phone,
  CalendarCheck,
  MapPin,
  Sparkles,
  Megaphone,
  ExternalLink,
  Building2,
  Video,
  Youtube,
  Linkedin,
  Play,
  Film,
  X,
  Copy,
  ArrowUp,
  ArrowDown,
  Wand2,
  Loader2,
  Check,
  Quote,
  Search,
  Link2,
  FileText
} from "lucide-react";
import { GbpPostExporterModal } from "../GbpPostExporterModal";

interface FormSocialReviewsProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData | ((prev: MedicalLandingData) => MedicalLandingData)) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormSocialReviews({
  data,
  onChange,
  updateField
}: FormSocialReviewsProps) {
  const [isGbpExporterOpen, setIsGbpExporterOpen] = useState(false);

  // Estados para Modal Extractor de Reseñas Reales con IA
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [extractTab, setExtractTab] = useState<"paste" | "generate">("paste");
  const [rawSourceText, setRawSourceText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<ReviewItem[] | null>(null);

  // Estados para Modal Añadir Reseña Manual
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPaciente, setNewPaciente] = useState("");
  const [newEstrellas, setNewEstrellas] = useState(5);
  const [newFecha, setNewFecha] = useState("Hace 2 días");
  const [newComentario, setNewComentario] = useState("");

  const videosList = data.redesSocialesVideos || [];

  const handleVideoChange = (index: number, field: keyof SocialVideoItem, value: any) => {
    onChange((prev) => {
      const currentVideos = prev.redesSocialesVideos || [];
      const newVideos = [...currentVideos];
      newVideos[index] = {
        ...newVideos[index],
        [field]: value
      };
      return {
        ...prev,
        redesSocialesVideos: newVideos
      };
    });
  };

  const addVideo = () => {
    onChange((prev) => {
      const currentVideos = prev.redesSocialesVideos || [];
      if (currentVideos.length >= 6) return prev;
      const newVid: SocialVideoItem = {
        id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        plataforma: "instagram",
        titulo: "",
        videoUrl: "",
        thumbnailUrl: "",
        descripcion: ""
      };
      return {
        ...prev,
        redesSocialesVideos: [...currentVideos, newVid]
      };
    });
  };

  const removeVideo = (index: number) => {
    onChange((prev) => {
      const currentVideos = prev.redesSocialesVideos || [];
      const newVideos = currentVideos.filter((_, i) => i !== index);
      return {
        ...prev,
        redesSocialesVideos: newVideos
      };
    });
  };

  const handleReviewChange = (index: number, field: keyof ReviewItem, value: any) => {
    const newReviews = [...(data.resenas || [])];
    newReviews[index] = {
      ...newReviews[index],
      [field]: value
    };
    updateField("resenas", newReviews);
  };

  const addReview = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveNewReview = () => {
    if (!newPaciente.trim()) return;
    const newRev: ReviewItem = {
      id: `rev-manual-${Date.now()}`,
      paciente: newPaciente.trim(),
      estrellas: newEstrellas,
      fecha: newFecha.trim() || "Hace 1 día",
      comentario: newComentario.trim() || "Excelente atención médica y diagnóstico certero."
    };
    updateField("resenas", [...(data.resenas || []), newRev]);
    setIsAddModalOpen(false);
    setNewPaciente("");
    setNewEstrellas(5);
    setNewFecha("Hace 2 días");
    setNewComentario("");
  };

  const removeReview = (index: number) => {
    const newReviews = (data.resenas || []).filter((_, i) => i !== index);
    updateField("resenas", newReviews);
  };

  const duplicateReview = (index: number) => {
    const reviews = [...(data.resenas || [])];
    const target = reviews[index];
    if (!target) return;
    const dup: ReviewItem = {
      ...target,
      id: `rev-dup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      paciente: `${target.paciente} (Copia)`
    };
    reviews.splice(index + 1, 0, dup);
    updateField("resenas", reviews);
  };

  const moveReview = (index: number, direction: "up" | "down") => {
    const reviews = [...(data.resenas || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reviews.length) return;
    const temp = reviews[index];
    reviews[index] = reviews[targetIndex];
    reviews[targetIndex] = temp;
    updateField("resenas", reviews);
  };

  const handleExtractReviews = async (mode: "extract_pasted" | "search_and_generate") => {
    if (mode === "extract_pasted" && !rawSourceText.trim()) {
      setExtractError("Por favor ingresa un enlace o pega texto con las reseñas para poder extraerlas.");
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setExtractedPreview(null);

    try {
      const response = await fetch("/api/ai/extract-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawSource: mode === "extract_pasted" ? rawSourceText : "",
          mode,
          doctorInfo: {
            nombreMedico: data.nombreMedico,
            especialidad: data.especialidad,
            ciudad: data.ciudad,
            nombreClinicaGBP: data.nombreClinicaGBP || data.nombreMedico
          }
        })
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || "No se pudieron extraer las reseñas.");
      }

      setExtractedPreview(resData.reviews || []);
    } catch (err: any) {
      console.error(err);
      setExtractError(err.message || "Error de conexión con el servicio de extracción de reseñas con IA.");
    } finally {
      setIsExtracting(false);
    }
  };

  const applyExtractedReviews = (append: boolean) => {
    if (!extractedPreview || extractedPreview.length === 0) return;
    if (append) {
      updateField("resenas", [...(data.resenas || []), ...extractedPreview]);
    } else {
      updateField("resenas", extractedPreview);
    }
    setIsExtractModalOpen(false);
    setExtractedPreview(null);
    setRawSourceText("");
  };

  const reviewsList = data.resenas || [];
  const avgRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc, r) => acc + (r.estrellas || 5), 0) / reviewsList.length).toFixed(1)
    : "5.0";

  return (
    <div id="form-social-reviews-section" className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-pink-600" />
            Redes Sociales & Testimonios de Pacientes
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura los perfiles de redes sociales y las opiniones de pacientes de Google Business Profile.
          </p>
        </div>
      </div>

      {/* 1. REDES SOCIALES & CONTACTO */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-pink-600" />
          Perfiles de Redes Sociales Médicas & Canales de Contacto
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5" htmlFor="socialInstagram">
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              Instagram (URL)
            </label>
            <input
              id="socialInstagram"
              type="text"
              value={data.instagramUrl || ""}
              onChange={(e) => updateField("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/dr..."
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-pink-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5" htmlFor="socialFacebook">
              <Facebook className="w-3.5 h-3.5 text-blue-600" />
              Facebook (URL)
            </label>
            <input
              id="socialFacebook"
              type="text"
              value={data.facebookUrl || ""}
              onChange={(e) => updateField("facebookUrl", e.target.value)}
              placeholder="https://facebook.com/..."
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5" htmlFor="socialTiktok">
              <span className="font-bold text-slate-800">♪</span>
              TikTok (URL)
            </label>
            <input
              id="socialTiktok"
              type="text"
              value={data.tiktokUrl || ""}
              onChange={(e) => updateField("tiktokUrl", e.target.value)}
              placeholder="https://tiktok.com/@..."
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-slate-800 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5" htmlFor="socialYoutube">
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              YouTube (URL / Canal)
            </label>
            <input
              id="socialYoutube"
              type="text"
              value={data.youtubeUrl || ""}
              onChange={(e) => updateField("youtubeUrl", e.target.value)}
              placeholder="https://youtube.com/@..."
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5" htmlFor="socialLinkedin">
              <Linkedin className="w-3.5 h-3.5 text-blue-700" />
              LinkedIn (URL)
            </label>
            <input
              id="socialLinkedin"
              type="text"
              value={data.linkedinUrl || ""}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-700 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5" htmlFor="socialEmail">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              Correo Electrónico de Contacto
            </label>
            <input
              id="socialEmail"
              type="email"
              value={data.emailContacto || ""}
              onChange={(e) => updateField("emailContacto", e.target.value)}
              placeholder="contacto@dr..."
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-600 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5" htmlFor="socialDominio">
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              Dominio Web Oficial (Opcional)
            </label>
            <input
              id="socialDominio"
              type="text"
              value={data.dominioWeb || ""}
              onChange={(e) => updateField("dominioWeb", e.target.value)}
              placeholder="https://drcarlosmendoza.ec"
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-slate-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. REELS & VIDEOS DESTACADOS EN REDES SOCIALES (HASTA 6 VIDEOS) */}
      <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Film className="w-4 h-4 text-pink-600" />
              Reels & Videos de Redes Sociales (Facebook, Instagram, TikTok)
            </label>
            <p className="text-[11px] text-slate-500">
              Agrega hasta 6 videos o reels para mostrarlos directamente debajo de Procedimientos y Tratamientos.
            </p>
          </div>

          <button
            type="button"
            onClick={addVideo}
            disabled={videosList.length >= 6}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
              videosList.length >= 6
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700 text-white shadow-xs"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Video ({videosList.length}/6)</span>
          </button>
        </div>

        {videosList.length === 0 ? (
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2 bg-slate-50/50">
            <Video className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No hay videos de redes sociales agregados aún.</p>
            <p className="text-[11px] text-slate-400">Haz clic en "Agregar Video" para compartir tus Reels de Instagram, TikTok o Facebook.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videosList.map((video, index) => (
              <div key={video.id || index} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                    <Play className="w-3 h-3 text-pink-600" />
                    Video #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Eliminar video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-1">
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
                      Plataforma:
                    </label>
                    <select
                      value={video.plataforma || "instagram"}
                      onChange={(e) => handleVideoChange(index, "plataforma", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-pink-500"
                    >
                      <option value="instagram">Instagram Reel / Post</option>
                      <option value="tiktok">TikTok Video</option>
                      <option value="facebook">Facebook Video / Watch</option>
                      <option value="youtube">YouTube Short / Video</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
                      Título del Video:
                    </label>
                    <input
                      type="text"
                      value={video.titulo || ""}
                      onChange={(e) => handleVideoChange(index, "titulo", e.target.value)}
                      placeholder="Ej. Reel: Síntomas y Prevención"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-0.5">
                      Enlace / URL Directa del Video / Reel:
                    </label>
                    <input
                      type="text"
                      value={video.videoUrl || ""}
                      onChange={(e) => handleVideoChange(index, "videoUrl", e.target.value)}
                      placeholder="https://www.instagram.com/reel/..."
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-0.5">
                      URL de Portada / Miniatura (Thumbnail):
                    </label>
                    <input
                      type="text"
                      value={video.thumbnailUrl || ""}
                      onChange={(e) => handleVideoChange(index, "thumbnailUrl", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-0.5">
                      Breve Descripción:
                    </label>
                    <input
                      type="text"
                      value={video.descripcion || ""}
                      onChange={(e) => handleVideoChange(index, "descripcion", e.target.value)}
                      placeholder="Explicación médica basada en evidencia..."
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-normal text-slate-800 outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. GOOGLE REVIEWS / GBP INTEGRATION */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Integración con Google Maps & Reseñas GBP
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.habilitarGoogleReviewsWidget ?? true}
              onChange={(e) => updateField("habilitarGoogleReviewsWidget", e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-bold text-slate-700">Mostrar badge de Google Maps</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="googleReviewsRating">
              Calificación Promedio (1 a 5)
            </label>
            <input
              id="googleReviewsRating"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={data.googleReviewsRating ?? 4.9}
              onChange={(e) => updateField("googleReviewsRating", parseFloat(e.target.value) || 5.0)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="googleReviewsTotalCount">
              Total de Reseñas en Google
            </label>
            <input
              id="googleReviewsTotalCount"
              type="number"
              min="0"
              value={data.googleReviewsTotalCount ?? 128}
              onChange={(e) => updateField("googleReviewsTotalCount", parseInt(e.target.value, 10) || 0)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="googlePlaceId">
              Google Place ID (Opcional)
            </label>
            <input
              id="googlePlaceId"
              type="text"
              value={data.googlePlaceId || ""}
              onChange={(e) => updateField("googlePlaceId", e.target.value)}
              placeholder="ChIJ... (Place ID)"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="googleMapsReviewsUrl">
            Enlace Directo para Dejar Opinión en Google Maps (URL)
          </label>
          <input
            id="googleMapsReviewsUrl"
            type="text"
            value={data.googleMapsReviewsUrl || ""}
            onChange={(e) => updateField("googleMapsReviewsUrl", e.target.value)}
            placeholder="https://g.page/r/.../review o https://maps.app.goo.gl/..."
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* NOVEDADES & PUBLICACIONES GOOGLE BUSINESS PROFILE */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md border border-blue-700/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Megaphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                Exportador de Publicaciones para Google Maps (GBP)
              </h4>
              <p className="text-xs text-blue-200/80">
                Genera novedades localizadas de servicios, blog y promociones con llamadas a la acción.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGbpExporterOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generar Novedad para Google Maps</span>
          </button>
        </div>

        <p className="text-[11.5px] text-blue-100/90 leading-relaxed pt-1 border-t border-blue-800/50">
          💡 Las publicaciones periódicas en Google Business Profile aumentan hasta un <strong>40% la visibilidad en el mapa local</strong> de Google en Ecuador.
        </p>
      </div>

      {/* MODAL EXPORTADOR DE NOVEDADES */}
      <GbpPostExporterModal
        isOpen={isGbpExporterOpen}
        onClose={() => setIsGbpExporterOpen(false)}
        data={data}
      />

      {/* 3. TESTIMONIOS Y RESEÑAS DE PACIENTES */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* CABECERA Y METRICAS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Reseñas y Testimonios de Pacientes</span>
              </h4>
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {avgRating} ({reviewsList.length} {reviewsList.length === 1 ? "reseña" : "reseñas"})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Administra o extrae comentarios reales de Google Maps, WhatsApp y Doctoralia para potenciar tu autoridad.
            </p>
          </div>

          {/* ACCIONES PRINCIPALES */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsExtractModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Extraer Reseñas Reales con IA</span>
            </button>

            <button
              type="button"
              onClick={addReview}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3.5 py-2 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              <span>Agregar Nueva Reseña</span>
            </button>
          </div>
        </div>

        {/* LISTADO DE RESEÑAS */}
        {reviewsList.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-amber-200 rounded-2xl bg-amber-50/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Quote className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">No hay reseñas de pacientes registradas</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Puedes extraer automáticamente opiniones reales de Google Maps o agregarlas manualmente en segundos.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsExtractModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 px-3.5 py-1.5 rounded-xl shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Extraer con IA
              </button>
              <button
                type="button"
                onClick={addReview}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-white border border-amber-200 hover:bg-amber-50 px-3.5 py-1.5 rounded-xl shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar manual
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewsList.map((rev, idx) => (
              <div 
                key={rev.id || idx} 
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors relative group"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleReviewChange(idx, "estrellas", s)}
                          className="cursor-pointer hover:scale-110 transition-transform p-0.5"
                          title={`Cambiar a ${s} estrellas`}
                        >
                          <Star 
                            className={`w-4 h-4 ${s <= rev.estrellas ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-800">
                      Reseña #{idx + 1} ({rev.estrellas} ★)
                    </span>
                  </div>

                  {/* HERRAMIENTAS DE EDICION / ORDENAMIENTO */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveReview(idx, "up")}
                      disabled={idx === 0}
                      title="Mover arriba"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveReview(idx, "down")}
                      disabled={idx === reviewsList.length - 1}
                      title="Mover abajo"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateReview(idx)}
                      title="Duplicar reseña"
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeReview(idx)}
                      title="Eliminar reseña"
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`rev-paciente-${idx}`}>
                      Nombre del Paciente
                    </label>
                    <input
                      id={`rev-paciente-${idx}`}
                      type="text"
                      value={rev.paciente ?? ""}
                      onChange={(e) => handleReviewChange(idx, "paciente", e.target.value)}
                      placeholder="ej. María José Viteri"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white font-bold text-slate-900"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`rev-fecha-${idx}`}>
                      Fecha / Antigüedad
                    </label>
                    <input
                      id={`rev-fecha-${idx}`}
                      type="text"
                      value={rev.fecha ?? ""}
                      onChange={(e) => handleReviewChange(idx, "fecha", e.target.value)}
                      placeholder="ej. Hace 2 semanas"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`rev-comentario-${idx}`}>
                    Comentario / Testimonio del Paciente
                  </label>
                  <textarea
                    id={`rev-comentario-${idx}`}
                    rows={2}
                    value={rev.comentario ?? ""}
                    onChange={(e) => handleReviewChange(idx, "comentario", e.target.value)}
                    placeholder="Escribe la experiencia del paciente..."
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none resize-none bg-white text-slate-800 font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: EXTRACTOR E IMPORTADOR DE RESEÑAS CON IA */}
      {isExtractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-5 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* ENCABEZADO MODAL */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-md">
                  <Wand2 className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    Extractor de Reseñas Reales con IA
                  </h3>
                  <p className="text-[11.5px] text-slate-500">
                    Importa comentarios de Google Maps, WhatsApp o Doctoralia, o simula reseñas verificadas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExtractModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SELECTOR DE PESTAÑAS */}
            <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setExtractTab("paste"); setExtractedPreview(null); setExtractError(null); }}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  extractTab === "paste"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Pegar Enlace o Texto</span>
              </button>

              <button
                type="button"
                onClick={() => { setExtractTab("generate"); setExtractedPreview(null); setExtractError(null); }}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  extractTab === "generate"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Generar Reseñas de Google</span>
              </button>
            </div>

            {/* CONTENIDO PESTAÑA 1: PEGAR LINK O TEXTO */}
            {extractTab === "paste" && (
              <div className="space-y-3 overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5" htmlFor="extract-url-text">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    URL de Google Maps / Doctoralia o Texto Copiado
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Pega un enlace de tu ficha en Google Maps, un perfil de Doctoralia, o copia mensajes de WhatsApp o Facebook.
                  </p>
                  <textarea
                    id="extract-url-text"
                    rows={4}
                    value={rawSourceText}
                    onChange={(e) => setRawSourceText(e.target.value)}
                    placeholder="Ejemplo de enlace o texto:&#10;https://maps.app.goo.gl/...&#10;o pega aquí: 'Excelente atención de la Dra. María en Quito, fue muy empática...'"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-slate-50/50 focus:bg-white resize-none font-medium"
                  />
                </div>

                <button
                  type="button"
                  disabled={isExtracting || !rawSourceText.trim()}
                  onClick={() => handleExtractReviews("extract_pasted")}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Analizando y Extrayendo Reseñas con IA...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-slate-950" />
                      <span>Extraer Reseñas del Texto / Enlace</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CONTENIDO PESTAÑA 2: GENERAR RESEÑAS REALES DE GOOGLE */}
            {extractTab === "generate" && (
              <div className="space-y-3 overflow-y-auto pr-1">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-extrabold text-amber-900">Configuración Contextual Ecuatoriana</span>
                  </div>
                  <p className="text-[11.5px] text-amber-800 leading-relaxed">
                    La IA generará reseñas reales y auténticas adaptadas a:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-800 pt-1">
                    <div className="bg-white p-2 rounded-xl border border-amber-200/60">
                      👨‍⚕️ {data.nombreMedico || "Dr. Especialista"}
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200/60">
                      🩺 {data.especialidad || "Medicina General"}
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200/60">
                      📍 {data.ciudad || "Quito"}, Ecuador
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200/60">
                      🏥 {data.nombreClinicaGBP || "Consultorio Médico"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={() => handleExtractReviews("search_and_generate")}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Generando Reseñas de Google con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Generar 5 Reseñas de Google Maps</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ERROR */}
            {extractError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                ⚠️ {extractError}
              </div>
            )}

            {/* PREVISUALIZACION DE RESEÑAS EXTRAIDAS */}
            {extractedPreview && extractedPreview.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100 overflow-y-auto max-h-56">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Se encontraron {extractedPreview.length} reseñas estructuradas:
                  </span>
                </div>

                <div className="space-y-2">
                  {extractedPreview.map((rev, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{rev.paciente}</span>
                        <span className="text-amber-500">{"★".repeat(rev.estrellas)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{rev.comentario}</p>
                    </div>
                  ))}
                </div>

                {/* BOTONES PARA APLICAR */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => applyExtractedReviews(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-xs transition-all cursor-pointer text-center"
                  >
                    Añadir a las {reviewsList.length} existentes
                  </button>
                  <button
                    type="button"
                    onClick={() => applyExtractedReviews(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer text-center"
                  >
                    Reemplazar todas ({extractedPreview.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: AGREGAR NUEVA RESEÑA MANUAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Agregar Nueva Reseña Manual</h3>
                  <p className="text-[11px] text-slate-500">Ingresa la experiencia del paciente para mostrarla en tu sitio.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="new-paciente-input">
                    Nombre del Paciente
                  </label>
                  <input
                    id="new-paciente-input"
                    type="text"
                    value={newPaciente}
                    onChange={(e) => setNewPaciente(e.target.value)}
                    placeholder="ej. Lic. Carlos Mendoza"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="new-fecha-input">
                    Fecha / Tiempo
                  </label>
                  <input
                    id="new-fecha-input"
                    type="text"
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    placeholder="ej. Hace 3 días"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* CALIFICACION ESTRELLAS */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Calificación ({newEstrellas} Estrellas)
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewEstrellas(s)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${s <= newEstrellas ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* PLANTILLAS RAPIDAS DE TEXTO */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Plantillas Rápidas de Testimonios:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Excelente atención, explicación clara y diagnóstico certero.",
                    "Puntualidad impecable, instalaciones muy limpias y trato humano.",
                    "El seguimiento por WhatsApp fue genial tras mi consulta.",
                    "Muy satisfecho con los resultados del tratamiento en Quito."
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewComentario(p)}
                      className="text-[10px] text-slate-600 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      "{p.slice(0, 32)}..."
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="new-comentario-input">
                  Comentario del Paciente
                </label>
                <textarea
                  id="new-comentario-input"
                  rows={3}
                  value={newComentario}
                  onChange={(e) => setNewComentario(e.target.value)}
                  placeholder="Escribe la reseña o testimonio..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none resize-none font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!newPaciente.trim()}
                onClick={handleSaveNewReview}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                Guardar Reseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
