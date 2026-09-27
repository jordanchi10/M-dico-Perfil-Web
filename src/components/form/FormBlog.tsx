/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData, BlogPostItem } from "../../types";
import { compressAndConvertToWebP } from "../../utils/imageCompressor";
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  ImageIcon, 
  ExternalLink,
  FileText,
  Upload,
  Link,
  X,
  Loader2,
  Check
} from "lucide-react";

interface FormBlogProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

const PRESET_MEDICAL_IMAGES = [
  {
    category: "Consulta & Diagnóstico",
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
    title: "Médico en consulta con paciente"
  },
  {
    category: "Estetoscopio & Clínica",
    url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop",
    title: "Estetoscopio e instrumental médico"
  },
  {
    category: "Cardiología",
    url: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=800&auto=format&fit=crop",
    title: "Salud del corazón y electro"
  },
  {
    category: "Pediatría & Maternidad",
    url: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop",
    title: "Atención pediátrica e infantil"
  },
  {
    category: "Odontología & Sonrisa",
    url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop",
    title: "Salud dental y profilaxis"
  },
  {
    category: "Nutrición & Alimentación",
    url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800&auto=format&fit=crop",
    title: "Dieta equilibrada y bienestar"
  },
  {
    category: "Dermatología & Piel",
    url: "https://images.unsplash.com/photo-1512290900673-7002b55b93d3?q=80&w=800&auto=format&fit=crop",
    title: "Cuidado cutáneo y estética"
  },
  {
    category: "Oftalmología",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
    title: "Examen de la visión y óptica"
  },
  {
    category: "Fisioterapia",
    url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop",
    title: "Rehabilitación física y masajes"
  },
  {
    category: "Laboratorio Clínico",
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop",
    title: "Análisis y muestras médicas"
  },
  {
    category: "Cirugía & Quirófano",
    url: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=800&auto=format&fit=crop",
    title: "Procedimientos quirúrgicos"
  },
  {
    category: "Salud Mental & Bienestar",
    url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
    title: "Psicología y equilibrio emocional"
  }
];

export function FormBlog({
  data,
  onChange,
  updateField
}: FormBlogProps) {
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [presetModalIndex, setPresetModalIndex] = useState<number | null>(null);
  const [showUrlInput, setShowUrlInput] = useState<Record<number, boolean>>({});

  const toggleShowUrlInput = (index: number) => {
    setShowUrlInput(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleBlogPostChange = (index: number, field: keyof BlogPostItem, value: any) => {
    const newBlogPosts = [...(data.blogPosts || [])];
    newBlogPosts[index] = {
      ...newBlogPosts[index],
      [field]: value
    };
    updateField("blogPosts", newBlogPosts);
  };

  const handleImageFileUpload = async (index: number, file?: File) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const result = await compressAndConvertToWebP(file, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.88,
        format: "image/webp"
      });
      handleBlogPostChange(index, "imagenUrl", result.dataUrl);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      const reader = new FileReader();
      reader.onload = (e) => {
        handleBlogPostChange(index, "imagenUrl", (e.target?.result as string) || "");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingIndex(null);
    }
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>

                {/* GESTIÓN Y SELECCIÓN DE IMAGEN DE PORTADA */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>Selección de Imagen del Artículo</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">Gestión Visual HD</span>
                  </label>

                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
                    {post.imagenUrl ? (
                      /* Vista cuando ya existe una imagen cargada */
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group">
                          <img
                            src={post.imagenUrl}
                            alt={post.titulo}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-1 left-1 text-[9px] font-extrabold text-white bg-slate-900/80 px-1.5 py-0.5 rounded backdrop-blur-xs">
                            Portada Activa
                          </span>
                        </div>

                        <div className="flex-1 space-y-2 w-full text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={post.imagenUrl}>
                              Imagen Configurada
                            </span>
                            <button
                              type="button"
                              onClick={() => handleBlogPostChange(idx, "imagenUrl", "")}
                              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-red-200"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-2xs cursor-pointer">
                              {uploadingIndex === idx ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 text-white" />
                              )}
                              <span>Cambiar Imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageFileUpload(idx, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => setPresetModalIndex(idx)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors border border-emerald-200 cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Galería Médica</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleShowUrlInput(idx)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Link className="w-3 h-3 text-slate-500" />
                              <span>{showUrlInput[idx] ? "Ocultar URL" : "Ver URL"}</span>
                            </button>
                          </div>

                          {showUrlInput[idx] && (
                            <div className="pt-2">
                              <input
                                id={`post-img-${idx}`}
                                type="text"
                                value={post.imagenUrl ?? ""}
                                onChange={(e) => handleBlogPostChange(idx, "imagenUrl", e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-emerald-500 outline-none bg-slate-50 font-mono text-slate-700"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Vista cuando NO hay imagen seleccionada aún */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {/* Opción 1: Cargar desde dispositivo */}
                          <label className="p-3 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50/50 hover:border-emerald-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 group shadow-2xs">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                              {uploadingIndex === idx ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-900">Subir de Dispositivo</span>
                            <span className="text-[10px] text-slate-500">JPG, PNG o WebP</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageFileUpload(idx, file);
                                e.target.value = "";
                              }}
                            />
                          </label>

                          {/* Opción 2: Galería de presets médicos */}
                          <button
                            type="button"
                            onClick={() => setPresetModalIndex(idx)}
                            className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/50 hover:border-emerald-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 group shadow-2xs"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-900">Galería Médica HD</span>
                            <span className="text-[10px] text-slate-500">12 fotos por especialidad</span>
                          </button>

                          {/* Opción 3: Ingresar URL Externa */}
                          <button
                            type="button"
                            onClick={() => toggleShowUrlInput(idx)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 group shadow-2xs ${
                              showUrlInput[idx]
                                ? "border-emerald-500 bg-emerald-50/40"
                                : "border-slate-200 bg-white hover:bg-slate-100/70"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Link className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-900">Enlace de Imagen</span>
                            <span className="text-[10px] text-slate-500">Ingresar URL directa</span>
                          </button>
                        </div>

                        {showUrlInput[idx] && (
                          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5 animate-fade-in">
                            <label className="text-[10px] font-bold text-slate-600 uppercase" htmlFor={`post-img-${idx}`}>
                              URL Directa de la Imagen:
                            </label>
                            <input
                              id={`post-img-${idx}`}
                              type="text"
                              value={post.imagenUrl ?? ""}
                              onChange={(e) => handleBlogPostChange(idx, "imagenUrl", e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-emerald-500 outline-none bg-slate-50 font-mono text-slate-700"
                            />
                          </div>
                        )}
                      </div>
                    )}
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

      {/* MODAL SELECCIÓN DE IMÁGENES PRESET MÉDICAS */}
      {presetModalIndex !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Cabecera del modal */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Galería de Fotos Médicas HD</h4>
                  <p className="text-xs text-slate-500">Selecciona una imagen profesional para tu artículo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPresetModalIndex(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Parrilla de imágenes preset */}
            <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_MEDICAL_IMAGES.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    handleBlogPostChange(presetModalIndex, "imagenUrl", preset.url);
                    setPresetModalIndex(null);
                  }}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition-all text-left cursor-pointer flex flex-col h-36 shadow-2xs hover:shadow-xs"
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-2 bg-white flex-1 flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold text-emerald-950 truncate block">{preset.category}</span>
                    <span className="text-[9px] text-slate-500 truncate block">{preset.title}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pie del modal */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">12 fotografías de stock clínico de alta resolución</span>
              <button
                type="button"
                onClick={() => setPresetModalIndex(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
