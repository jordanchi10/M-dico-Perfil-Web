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
  Film
} from "lucide-react";
import { GbpPostExporterModal } from "../GbpPostExporterModal";

interface FormSocialReviewsProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormSocialReviews({
  data,
  onChange,
  updateField
}: FormSocialReviewsProps) {
  const [isGbpExporterOpen, setIsGbpExporterOpen] = useState(false);

  const videosList = data.redesSocialesVideos || [];

  const handleVideoChange = (index: number, field: keyof SocialVideoItem, value: any) => {
    const newVideos = [...videosList];
    newVideos[index] = {
      ...newVideos[index],
      [field]: value
    };
    updateField("redesSocialesVideos", newVideos);
  };

  const addVideo = () => {
    if (videosList.length >= 6) return;
    const newVid: SocialVideoItem = {
      id: `vid-${Date.now()}`,
      plataforma: "instagram",
      titulo: `Reel / Video Médico ${videosList.length + 1}`,
      videoUrl: "https://www.instagram.com/reel/...",
      thumbnailUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
      descripcion: "Breve explicación de la consulta o tratamiento médico."
    };
    updateField("redesSocialesVideos", [...videosList, newVid]);
  };

  const removeVideo = (index: number) => {
    const newVideos = videosList.filter((_, i) => i !== index);
    updateField("redesSocialesVideos", newVideos);
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
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      paciente: "Nombre del Paciente",
      estrellas: 5,
      comentario: "Excelente atención médica, diagnóstico certero y acompañamiento postoperatorio impecable en Ecuador.",
      fecha: "Hace 1 semana"
    };
    updateField("resenas", [...(data.resenas || []), newRev]);
  };

  const removeReview = (index: number) => {
    const newReviews = (data.resenas || []).filter((_, i) => i !== index);
    updateField("resenas", newReviews);
  };

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

      {/* 3. TESTIMONIOS Y RESEÑAS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Reseñas y Testimonios de Pacientes</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {(data.resenas || []).length} { (data.resenas || []).length === 1 ? "reseña" : "reseñas" }
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">Comentarios reales que fortalecen la prueba social en la landing page.</p>
          </div>
          <button
            type="button"
            onClick={addReview}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Añadir Reseña
          </button>
        </div>

        {(!data.resenas || data.resenas.length === 0) ? (
          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-3">No hay reseñas registradas actualmente.</p>
            <button
              type="button"
              onClick={addReview}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-white border border-slate-200 hover:bg-amber-50 px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear primera reseña
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.resenas.map((rev, idx) => (
              <div key={rev.id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleReviewChange(idx, "estrellas", s)}
                          className="cursor-pointer"
                        >
                          <Star 
                            className={`w-4 h-4 ${s <= rev.estrellas ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">Reseña #{idx + 1} ({rev.estrellas} estrellas)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReview(idx)}
                    title="Eliminar reseña"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`rev-fecha-${idx}`}>
                      Fecha / Tiempo
                    </label>
                    <input
                      id={`rev-fecha-${idx}`}
                      type="text"
                      value={rev.fecha ?? ""}
                      onChange={(e) => handleReviewChange(idx, "fecha", e.target.value)}
                      placeholder="ej. Hace 2 semanas"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white font-medium"
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
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none resize-none bg-white text-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
