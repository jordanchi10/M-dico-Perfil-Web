/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData, BlogPostItem } from "../../types";
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  ImageIcon, 
  ExternalLink,
  FileText
} from "lucide-react";

interface FormBlogProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormBlog({
  data,
  onChange,
  updateField
}: FormBlogProps) {
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleBlogPostChange = (index: number, field: keyof BlogPostItem, value: any) => {
    const newBlogPosts = [...(data.blogPosts || [])];
    newBlogPosts[index] = {
      ...newBlogPosts[index],
      [field]: value
    };
    updateField("blogPosts", newBlogPosts);
  };

  const handleGenerateBlogWithAi = async () => {
    setIsGeneratingBlog(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreMedico: data.nombreMedico,
          especialidad: data.especialidad,
          ciudad: data.ciudad
        })
      });

      const result = await response.json();
      if (result.success && result.posts) {
        onChange({
          ...data,
          blogPosts: result.posts
        });
      } else {
        setGenerationError(result.error || "No se pudieron generar los artículos médicos.");
      }
    } catch (err: any) {
      console.error("Error generating blog:", err);
      setGenerationError("Error de conexión al generar los artículos con IA.");
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const addBlogPost = () => {
    const postCount = (data.blogPosts || []).length + 1;
    const newPost: BlogPostItem = {
      id: `post-${Date.now()}`,
      titulo: `Guía Médica ${postCount}: Recomendaciones de Salud y Prevención`,
      slug: `guia-medica-prevencion-${Date.now()}`,
      categoria: data.especialidad || "Salud y Prevención",
      tiempoLectura: "4 min de lectura",
      fecha: "Reciente",
      extracto: "Consejos prácticos y evidencia clínica para el cuidado de tu salud en el día a día.",
      contenido: "La prevención y el diagnóstico temprano son las herramientas más poderosas para preservar la salud. Consulte periódicamente a su especialista de confianza.",
      imagenUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop"
    };
    updateField("blogPosts", [...(data.blogPosts || []), newPost]);
  };

  const removeBlogPost = (index: number) => {
    const newPosts = (data.blogPosts || []).filter((_, i) => i !== index);
    updateField("blogPosts", newPosts);
  };

  return (
    <div id="form-blog-section" className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Artículos Médicos & Blog Educativo E-E-A-T
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Publica guías y artículos para educar al paciente y posicionar en búsquedas informacionales.
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Autoridad SEO
        </span>
      </div>

      {/* BOTÓN IA PARA GENERAR ARTÍCULOS AUTOMÁTICOS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Generador Inteligente de Artículos Médicos con IA
            </h4>
            <p className="text-[11px] text-emerald-800/80">
              Genera 3 artículos completos optimizados para la especialidad de {data.especialidad} en {data.ciudad}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateBlogWithAi}
            disabled={isGeneratingBlog}
            className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-3.5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingBlog ? "animate-spin" : ""}`} />
            <span>{isGeneratingBlog ? "Generando Artículos..." : "Generar Artículos IA"}</span>
          </button>
        </div>

        {generationError && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {generationError}
          </div>
        )}
      </div>

      {/* LISTA DE ARTÍCULOS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>Listado de Artículos Publicados</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {(data.blogPosts || []).length} { (data.blogPosts || []).length === 1 ? "artículo" : "artículos" }
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">Cada artículo cuenta con su propia URL limpia y ficha de autor médico.</p>
          </div>
          <button
            type="button"
            onClick={addBlogPost}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Añadir Artículo
          </button>
        </div>

        {(!data.blogPosts || data.blogPosts.length === 0) ? (
          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-3">No hay artículos médicos configurados.</p>
            <button
              type="button"
              onClick={addBlogPost}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white border border-slate-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear primer artículo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.blogPosts.map((post, idx) => (
              <div key={post.id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-[11px] font-extrabold text-slate-800 uppercase">Artículo #{idx + 1}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBlogPost(idx)}
                    title="Eliminar artículo"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`post-titulo-${idx}`}>
                      Título del Artículo
                    </label>
                    <input
                      id={`post-titulo-${idx}`}
                      type="text"
                      value={post.titulo ?? ""}
                      onChange={(e) => handleBlogPostChange(idx, "titulo", e.target.value)}
                      placeholder="ej. 5 Consejos para Cuidar tu Salud Cardiovascular"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none bg-white font-bold text-slate-900"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`post-cat-${idx}`}>
                      Categoría
                    </label>
                    <input
                      id={`post-cat-${idx}`}
                      type="text"
                      value={post.categoria ?? ""}
                      onChange={(e) => handleBlogPostChange(idx, "categoria", e.target.value)}
                      placeholder="ej. Prevención Médica"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`post-time-${idx}`}>
                      Tiempo de Lectura
                    </label>
                    <input
                      id={`post-time-${idx}`}
                      type="text"
                      value={post.tiempoLectura ?? ""}
                      onChange={(e) => handleBlogPostChange(idx, "tiempoLectura", e.target.value)}
                      placeholder="ej. 4 min de lectura"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none bg-white font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`post-date-${idx}`}>
                      Fecha de Publicación
                    </label>
                    <input
                      id={`post-date-${idx}`}
                      type="text"
                      value={post.fecha ?? ""}
                      onChange={(e) => handleBlogPostChange(idx, "fecha", e.target.value)}
                      placeholder="ej. 15 de Octubre, 2024"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none bg-white font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`post-img-${idx}`}>
                      Imagen de Portada (URL)
                    </label>
                    <input
                      id={`post-img-${idx}`}
                      type="text"
                      value={post.imagenUrl ?? ""}
                      onChange={(e) => handleBlogPostChange(idx, "imagenUrl", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`post-extracto-${idx}`}>
                    Extracto / Resumen Corto
                  </label>
                  <textarea
                    id={`post-extracto-${idx}`}
                    rows={2}
                    value={post.extracto ?? ""}
                    onChange={(e) => handleBlogPostChange(idx, "extracto", e.target.value)}
                    placeholder="Resumen para la tarjeta del blog..."
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none resize-none bg-white text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`post-content-${idx}`}>
                    Contenido Completo del Artículo
                  </label>
                  <textarea
                    id={`post-content-${idx}`}
                    rows={4}
                    value={post.contenido ?? ""}
                    onChange={(e) => handleBlogPostChange(idx, "contenido", e.target.value)}
                    placeholder="Desarrollo completo del artículo médico..."
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none resize-none bg-white text-slate-800 font-normal leading-relaxed"
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
