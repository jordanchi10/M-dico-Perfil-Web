/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MedicalLandingData, ServiceItem, BeforeAfterCase } from "../../types";
import { 
  Briefcase, 
  Sparkles, 
  Plus, 
  Trash2, 
  ImageIcon,
  Link2,
  Clock,
  DollarSign,
  Activity,
  Wand2,
  ExternalLink,
  CheckCircle2,
  Upload,
  Zap,
  Tag,
  Building2,
  Timer,
  Globe,
  FileText,
  Film,
  Loader2,
  Code,
  Play,
  ShieldCheck,
  Eye,
  Maximize2,
  X
} from "lucide-react";
import { MedicalIconSelector } from "../MedicalIconSelector";
import { compressAndConvertToWebP, formatBytes } from "../../utils/imageCompressor";

interface FormServicesCasesProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

function slugify(text: string): string {
  if (!text) return "servicio";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "servicio";
}

const SAMPLE_SERVICE_IMAGES = [
  { label: "Consulta", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop" },
  { label: "Cirugía / Quirófano", url: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=800&auto=format&fit=crop" },
  { label: "Chequeo Preventivo", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop" },
  { label: "Estética & Facial", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop" },
  { label: "Rehabilitación", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" },
  { label: "Diagnóstico", url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop" }
];

export function FormServicesCases({
  data,
  onChange,
  updateField
}: FormServicesCasesProps) {
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = React.useState<number | null>(null);
  const [newGalleryUrlInput, setNewGalleryUrlInput] = React.useState<{ [key: number]: string }>({});
  const [newEmbedInput, setNewEmbedInput] = React.useState<{ [key: number]: string }>({});
  const [previewLightbox, setPreviewLightbox] = React.useState<{ url: string; title: string } | null>(null);

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    updateServiceFields(index, { [field]: value });
  };

  const updateServiceFields = (index: number, patch: Partial<ServiceItem>) => {
    const newServices = [...(data.servicios || [])];
    newServices[index] = {
      ...newServices[index],
      ...patch
    };
    updateField("servicios", newServices);
  };

  const handleAddGalleryPhotoUrl = (srvIdx: number) => {
    const url = (newGalleryUrlInput[srvIdx] || "").trim();
    if (!url) return;
    const currentSrv = (data.servicios || [])[srvIdx];
    if (!currentSrv) return;
    const currentGallery = currentSrv.galeriaFotos || [];
    if (currentGallery.length >= 6) return;
    
    const updatedGallery = [...currentGallery, url];
    handleServiceChange(srvIdx, "galeriaFotos", updatedGallery);
    setNewGalleryUrlInput(prev => ({ ...prev, [srvIdx]: "" }));
  };

  const handleUploadGalleryPhotoFile = async (srvIdx: number, file: File) => {
    const currentSrv = (data.servicios || [])[srvIdx];
    if (!currentSrv) return;
    const currentGallery = currentSrv.galeriaFotos || [];
    if (currentGallery.length >= 6) return;

    setUploadingGalleryIdx(srvIdx);
    try {
      const res = await compressAndConvertToWebP(file, { maxWidth: 1200, maxHeight: 900, quality: 0.85 });
      const updatedGallery = [...currentGallery, res.dataUrl];
      handleServiceChange(srvIdx, "galeriaFotos", updatedGallery);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const updatedGallery = [...currentGallery, reader.result];
          handleServiceChange(srvIdx, "galeriaFotos", updatedGallery);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingGalleryIdx(null);
    }
  };

  const handleRemoveGalleryPhoto = (srvIdx: number, photoIdx: number) => {
    const currentSrv = (data.servicios || [])[srvIdx];
    if (!currentSrv) return;
    const currentGallery = currentSrv.galeriaFotos || [];
    const updatedGallery = currentGallery.filter((_, i) => i !== photoIdx);
    handleServiceChange(srvIdx, "galeriaFotos", updatedGallery);
  };

  const getEmbedList = (srv: ServiceItem): string[] => {
    if (srv.codigosEmbed && srv.codigosEmbed.length > 0) {
      return srv.codigosEmbed;
    }
    const fallback: string[] = [];
    if (srv.codigoEmbed && srv.codigoEmbed.trim()) fallback.push(srv.codigoEmbed.trim());
    if (srv.reelUrl && srv.reelUrl.trim() && !fallback.includes(srv.reelUrl.trim())) fallback.push(srv.reelUrl.trim());
    if (srv.videoUrl && srv.videoUrl.trim() && !fallback.includes(srv.videoUrl.trim())) fallback.push(srv.videoUrl.trim());
    return fallback;
  };

  const handleAddEmbedCodeItem = (srvIdx: number) => {
    const val = (newEmbedInput[srvIdx] || "").trim();
    if (!val) return;
    const currentSrv = (data.servicios || [])[srvIdx];
    if (!currentSrv) return;
    const currentEmbeds = getEmbedList(currentSrv);
    if (currentEmbeds.length >= 8) return;

    const updatedEmbeds = [...currentEmbeds, val];
    updateServiceFields(srvIdx, {
      codigosEmbed: updatedEmbeds,
      codigoEmbed: updatedEmbeds[0] || "",
      reelUrl: updatedEmbeds[0] || ""
    });
    setNewEmbedInput(prev => ({ ...prev, [srvIdx]: "" }));
  };

  const handleUpdateEmbedCodeItem = (srvIdx: number, embedIdx: number, value: string) => {
    const currentSrv = (data.servicios || [])[srvIdx];
    if (!currentSrv) return;
    const currentEmbeds = [...getEmbedList(currentSrv)];
    currentEmbeds[embedIdx] = value;
    updateServiceFields(srvIdx, {
      codigosEmbed: currentEmbeds,
      codigoEmbed: currentEmbeds[0] || "",
      reelUrl: currentEmbeds[0] || ""
    });
  };

  const handleRemoveEmbedCodeItem = (srvIdx: number, embedIdx: number) => {
    const currentSrv = (data.servicios || [])[srvIdx];
    if (!currentSrv) return;
    const currentEmbeds = getEmbedList(currentSrv).filter((_, i) => i !== embedIdx);
    updateServiceFields(srvIdx, {
      codigosEmbed: currentEmbeds,
      codigoEmbed: currentEmbeds[0] || "",
      reelUrl: currentEmbeds[0] || ""
    });
  };

  const autoGenerateSlug = (index: number) => {
    const current = (data.servicios || [])[index];
    if (!current) return;
    const generatedSlug = slugify(current.titulo);
    handleServiceChange(index, "slug", generatedSlug);
  };

  const addService = () => {
    const count = (data.servicios || []).length + 1;
    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      titulo: `Procedimiento Especializado ${count}`,
      slug: `procedimiento-especializado-${count}`,
      descripcion: "Descripción clínica detallada del procedimiento, técnica médica empleada y beneficios de recuperación para el paciente.",
      icono: "Stethoscope",
      imagenUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
      mostrarImagen: true,
      precio: "$50 USD",
      duracion: "45 min",
      recuperacion: "Ambulatoria"
    };
    updateField("servicios", [...(data.servicios || []), newService]);
  };

  const removeService = (index: number) => {
    const newServices = (data.servicios || []).filter((_, i) => i !== index);
    updateField("servicios", newServices);
  };

  const handleCaseChange = (index: number, field: keyof BeforeAfterCase, value: string) => {
    const newCases = [...(data.casosAntesDespues || [])];
    newCases[index] = {
      ...newCases[index],
      [field]: value
    };
    updateField("casosAntesDespues", newCases);
  };

  const addCase = () => {
    const newCase: BeforeAfterCase = {
      id: `caso-${Date.now()}`,
      titulo: "Evolución y Resultado Post-Tratamiento",
      descripcion: "Descripción clínica detallada del diagnóstico del paciente, técnica médica empleada y resultados funcionales y estéticos obtenidos.",
      imgBefore: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
      imgAfter: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop"
    };
    updateField("casosAntesDespues", [...(data.casosAntesDespues || []), newCase]);
  };

  const removeCase = (index: number) => {
    const newCases = (data.casosAntesDespues || []).filter((_, i) => i !== index);
    updateField("casosAntesDespues", newCases);
  };

  return (
    <div id="form-services-cases-section" className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            Catálogo de Servicios & Casos Clínicos Antes/Después
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura el portafolio de procedimientos médicos, fotos/iconos grandes, slugs SEO individuales para el sitemap y casos comparativos.
          </p>
        </div>
      </div>

      {/* 1. SERVICIOS Y TRATAMIENTOS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>Procedimientos y Tratamientos Médicos</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                {(data.servicios || []).length} { (data.servicios || []).length === 1 ? "servicio" : "servicios" }
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Los <strong>5 primeros servicios</strong> se mostrarán destacados en la página principal con títulos &lt;h2&gt; para SEO, y el botón <strong>"Mis Servicios"</strong> abrirá el catálogo interactivo completo.
            </p>
          </div>
          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Añadir Servicio
          </button>
        </div>

        {(!data.servicios || data.servicios.length === 0) ? (
          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-3">No hay servicios registrados actualmente.</p>
            <button
              type="button"
              onClick={addService}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-white border border-slate-200 hover:bg-purple-50 px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear primer servicio
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.servicios.map((srv, idx) => {
              const currentSlug = srv.slug || slugify(srv.titulo);
              const isFirstFive = idx < 5;

              return (
                <div key={srv.id || idx} className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${isFirstFive ? "border-purple-200/90 bg-purple-50/20" : "border-slate-200 bg-slate-50/50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center ${isFirstFive ? "bg-purple-600 shadow-xs" : "bg-slate-700"}`}>
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-extrabold text-slate-900">
                          {srv.titulo || `Servicio #${idx + 1}`}
                        </p>
                        {isFirstFive ? (
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                            Principal (Inicio)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            En Modal "Mis Servicios"
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeService(idx)}
                      title="Eliminar servicio"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Título y Slug SEO */}
                  <div className="space-y-3">
                    {/* Título */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between" htmlFor={`srv-titulo-${idx}`}>
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-600" />
                          Título del Servicio / Procedimiento (Etiqueta &lt;h2&gt; SEO)
                        </span>
                      </label>
                      <input
                        id={`srv-titulo-${idx}`}
                        type="text"
                        value={srv.titulo ?? ""}
                        onChange={(e) => {
                          handleServiceChange(idx, "titulo", e.target.value);
                          if (!srv.slug) {
                            handleServiceChange(idx, "slug", slugify(e.target.value));
                          }
                        }}
                        placeholder="ej. Consulta de Valoración Integral"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white font-bold text-slate-900 shadow-2xs"
                      />
                    </div>
                    
                    {/* Slug SEO / Enlace Propio */}
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[10px] font-extrabold text-purple-900 uppercase flex items-center gap-1.5" htmlFor={`srv-slug-${idx}`}>
                          <Link2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Slug SEO / Enlace Propio del Servicio</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => autoGenerateSlug(idx)}
                          className="text-[10px] font-bold text-purple-700 hover:text-purple-950 bg-white hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          title="Generar slug optimizado automáticamente basado en el título"
                        >
                          <Wand2 className="w-3 h-3 text-purple-600" />
                          <span>Auto Generar</span>
                        </button>
                      </div>

                      <div className="flex items-center w-full rounded-xl border border-purple-200 overflow-hidden bg-white shadow-2xs focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
                        <span className="px-3 py-2 text-[11px] font-mono font-semibold text-purple-700 bg-purple-100/70 border-r border-purple-200 shrink-0 select-none flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          /servicios/
                        </span>
                        <input
                          id={`srv-slug-${idx}`}
                          type="text"
                          value={srv.slug || ""}
                          onChange={(e) => handleServiceChange(idx, "slug", slugify(e.target.value))}
                          placeholder={slugify(srv.titulo || `servicio-${idx + 1}`)}
                          className="w-full px-3 py-2 text-xs font-mono font-bold text-purple-950 outline-none bg-transparent"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-0.5 pt-0.5 flex-wrap gap-1">
                        <span className="flex items-center gap-1.5 text-purple-900 font-semibold truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          sitemap.xml: <strong className="font-mono text-purple-950">/servicios/{currentSlug}</strong>
                        </span>
                        <span className="text-purple-600/80 text-[9px] font-medium bg-purple-100/50 px-1.5 py-0.5 rounded">URL Amigable SEO</span>
                      </div>
                    </div>
                  </div>

                  {/* Selector y Control de Imagen vs Icono */}
                  <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                    {/* Toggle Switch para Habilitar/Deshabilitar Imagen */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${srv.mostrarImagen !== false ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-500"}`}>
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {srv.mostrarImagen !== false ? "Fotografía Médica Habilitada" : "Modo Icono Clínico (Sin Imagen)"}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {srv.mostrarImagen !== false 
                              ? "Muestra fotografía médica destacada en proporción 5:4 (aspect-[5/4])." 
                              : "Muestra el icono médico clínico estilizado en lugar de foto."}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        role="switch"
                        aria-checked={srv.mostrarImagen !== false}
                        onClick={() => handleServiceChange(idx, "mostrarImagen", srv.mostrarImagen === false ? true : false)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          srv.mostrarImagen !== false ? "bg-purple-600" : "bg-slate-300"
                        }`}
                        title={srv.mostrarImagen !== false ? "Desactivar imagen para este servicio" : "Activar imagen para este servicio"}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            srv.mostrarImagen !== false ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Contenido Condicional según el Toggle */}
                    {srv.mostrarImagen !== false ? (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                        <div className="sm:col-span-8 flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between" htmlFor={`srv-img-${idx}`}>
                            <span className="flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                              URL o Carga de Fotografía Clínica (Formato 5:4)
                            </span>
                          </label>

                          <div className="flex gap-2">
                            <input
                              id={`srv-img-${idx}`}
                              type="url"
                              value={srv.imagenUrl || ""}
                              onChange={(e) => handleServiceChange(idx, "imagenUrl", e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-slate-50/50 text-slate-800"
                            />
                            <label 
                              className="px-3 py-2 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1 shrink-0 transition-colors"
                              title="Subir imagen con compresión WebP SEO"
                            >
                              <Upload className="w-3.5 h-3.5 text-purple-600" />
                              <span className="hidden sm:inline">Subir WebP</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const res = await compressAndConvertToWebP(file, {
                                        maxWidth: 800,
                                        maxHeight: 640,
                                        quality: 0.82
                                      });
                                      handleServiceChange(idx, "imagenUrl", res.dataUrl);
                                    } catch (err) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (typeof reader.result === "string") {
                                          handleServiceChange(idx, "imagenUrl", reader.result);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                          
                          {/* Sugerencias Rápidas */}
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Sugerencias:</span>
                            {SAMPLE_SERVICE_IMAGES.map((sample, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleServiceChange(idx, "imagenUrl", sample.url)}
                                className="text-[10px] font-semibold text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                              >
                                {sample.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Previsualizador en proporción 5:4 */}
                        <div className="sm:col-span-4 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between">
                            <span>Vista Previa 5:4</span>
                            {srv.imagenUrl && (
                              <span className="text-[9px] font-bold text-blue-600 flex items-center gap-0.5">
                                <Eye className="w-3 h-3" /> Clic para ampliar
                              </span>
                            )}
                          </label>
                          <div 
                            className={`w-full aspect-[5/4] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-2xs group ${srv.imagenUrl ? "cursor-pointer" : ""}`}
                            onClick={() => {
                              if (srv.imagenUrl) {
                                setPreviewLightbox({ url: srv.imagenUrl, title: `${srv.titulo || "Tratamiento"} - Foto de Portada` });
                              }
                            }}
                          >
                            {srv.imagenUrl ? (
                              <>
                                <img src={srv.imagenUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <span className="p-1.5 rounded-lg bg-slate-900/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                                    <Maximize2 className="w-3 h-3 text-blue-400" /> Ver HD
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                                <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                <span className="text-[10px] font-medium">Sin imagen</span>
                              </div>
                            )}
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                              5:4
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase" htmlFor={`srv-icono-${idx}`}>
                            Icono Clínico Seleccionado
                          </label>
                          <MedicalIconSelector
                            id={`srv-icono-${idx}`}
                            value={srv.icono || "Stethoscope"}
                            onChange={(newIcon) => handleServiceChange(idx, "icono", newIcon)}
                          />
                        </div>
                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                          <p className="text-[11px] text-purple-900 leading-tight">
                            Este tratamiento se presentará con un <strong>contenedor visual de icono estilizado</strong> en la landing y el catálogo.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ETIQUETA / BADGE DE CONVERSIÓN (PARTE SUPERIOR DERECHA) */}
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold text-amber-900 uppercase flex items-center gap-1.5" htmlFor={`srv-badge-${idx}`}>
                        <Tag className="w-3.5 h-3.5 text-amber-700" />
                        <span>Etiqueta de Destacado / Badge (Superior Derecha de Foto o Tarjeta)</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-amber-900">
                        <input
                          type="checkbox"
                          checked={Boolean(srv.destacado)}
                          onChange={(e) => handleServiceChange(idx, "destacado", e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                        />
                        <span>Destacar (Fondo Amarillo)</span>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <input
                        id={`srv-badge-${idx}`}
                        type="text"
                        value={srv.badgeEtiqueta || ""}
                        onChange={(e) => handleServiceChange(idx, "badgeEtiqueta", e.target.value)}
                        placeholder="ej. Más Solicitado, Novedad, Técnica Mínimamente Invasiva..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-bold text-amber-950 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-white"
                      />
                    </div>

                    {/* Botones Rápidos de Sugerencia */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[9px] font-bold text-amber-800 uppercase">Añadir rápido:</span>
                      {[
                        "Más Solicitado",
                        "Novedad",
                        "Técnica Mínimamente Invasiva",
                        "Procedimiento de Un Día",
                        "Sin Anestesia General",
                        "Alta Inmediata"
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleServiceChange(idx, "badgeEtiqueta", preset)}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            srv.badgeEtiqueta === preset 
                              ? "bg-amber-600 text-white border-amber-700 shadow-2xs"
                              : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INDICADORES RÁPIDOS (FICHA TÉCNICA) */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Indicadores Rápidos de Conversión (Ficha Técnica)</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* ⏱️ Tiempo de Recuperación */}
                      <div className="flex flex-col gap-1 bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <label className="text-[10px] font-bold text-purple-900 uppercase flex items-center gap-1" htmlFor={`srv-recuperacion-${idx}`}>
                          <Activity className="w-3 h-3 text-purple-600" />
                          <span>⏱️ Tiempo de Recuperación</span>
                        </label>
                        <input
                          id={`srv-recuperacion-${idx}`}
                          type="text"
                          value={srv.recuperacion || ""}
                          onChange={(e) => handleServiceChange(idx, "recuperacion", e.target.value)}
                          placeholder="ej. Ambulatorio, 24 horas, 3-5 días..."
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white text-slate-800 font-bold"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {["Ambulatorio", "24 horas", "3-5 días", "Inmediato"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleServiceChange(idx, "recuperacion", preset)}
                              className="text-[9px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 🏥 Modalidad */}
                      <div className="flex flex-col gap-1 bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <label className="text-[10px] font-bold text-teal-900 uppercase flex items-center gap-1" htmlFor={`srv-modalidad-${idx}`}>
                          <Building2 className="w-3 h-3 text-teal-600" />
                          <span>🏥 Modalidad de Atención</span>
                        </label>
                        <input
                          id={`srv-modalidad-${idx}`}
                          type="text"
                          value={srv.modalidad || ""}
                          onChange={(e) => handleServiceChange(idx, "modalidad", e.target.value)}
                          placeholder="ej. En consultorio, Quirófano, Online..."
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all bg-white text-slate-800 font-bold"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {["En consultorio", "Quirófano", "Online", "Hospitalario"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleServiceChange(idx, "modalidad", preset)}
                              className="text-[9px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 🛡️ Cobertura Seguros / Reembolso SRI */}
                      <div className="flex flex-col justify-between gap-1 bg-white p-2.5 rounded-lg border border-slate-200/80 col-span-1 sm:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-[10px] font-extrabold text-emerald-950 uppercase flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Mostrar Badge "🛡️ Cobertura Seguros / Reembolso"</span>
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200/90 text-xs font-extrabold text-emerald-900 transition-all shrink-0">
                            <input
                              type="checkbox"
                              checked={srv.aplicaReembolso !== false}
                              onChange={(e) => handleServiceChange(idx, "aplicaReembolso", e.target.checked)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                            />
                            <span>{srv.aplicaReembolso !== false ? "✓ Visible en Tarjeta y Modal" : "🚫 Oculto (Procedimiento Complejo / Sin Reembolso)"}</span>
                          </label>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight pt-0.5">
                          Actívalo si la Factura Electrónica SRI emitida para este tratamiento permite el trámite de reembolso médico con seguros privados. Desactívalo para cirugías complejas, tratamientos estéticos o procedimientos no reembolsables.
                        </p>
                      </div>

                      {/* ⏳ Duración de la Cita */}
                      <div className="flex flex-col gap-1 bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <label className="text-[10px] font-bold text-blue-900 uppercase flex items-center gap-1" htmlFor={`srv-duracion-${idx}`}>
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>⏳ Duración de la Cita / Procedimiento</span>
                        </label>
                        <input
                          id={`srv-duracion-${idx}`}
                          type="text"
                          value={srv.duracion || ""}
                          onChange={(e) => handleServiceChange(idx, "duracion", e.target.value)}
                          placeholder="ej. 30 min, 45 min, 1 hora..."
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white text-slate-800 font-bold"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {["30 min", "45 min", "1 hora", "1.5 horas"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleServiceChange(idx, "duracion", preset)}
                              className="text-[9px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 💰 Precio / Inversión */}
                      <div className="flex flex-col gap-1 bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <label className="text-[10px] font-bold text-emerald-900 uppercase flex items-center gap-1" htmlFor={`srv-precio-${idx}`}>
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          <span>💰 Inversión / Valor Estimado</span>
                        </label>
                        <input
                          id={`srv-precio-${idx}`}
                          type="text"
                          value={srv.precio || ""}
                          onChange={(e) => handleServiceChange(idx, "precio", e.target.value)}
                          placeholder="ej. $50 USD, Desde $450 USD..."
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white text-slate-800 font-bold"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {["$50 USD", "Desde $450 USD", "Consulta $40", "A cotizar"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleServiceChange(idx, "precio", preset)}
                              className="text-[9px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`srv-desc-${idx}`}>
                      Descripción Médica del Procedimiento
                    </label>
                    <textarea
                      id={`srv-desc-${idx}`}
                      rows={2}
                      value={srv.descripcion ?? ""}
                      onChange={(e) => handleServiceChange(idx, "descripcion", e.target.value)}
                      placeholder="Explica en qué consiste el procedimiento, su técnica y beneficios para el paciente..."
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none bg-white text-slate-800"
                    />
                  </div>

                  {/* GALERÍA DE FOTOS ADICIONALES (HASTA 6 IMÁGENES) */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-900 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Galería de Fotografías Clínicas (Hasta 6)</span>
                      </p>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {(srv.galeriaFotos || []).length} / 6 fotos
                      </span>
                    </div>

                    {/* MINIATURAS DE LA GALERÍA */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {(srv.galeriaFotos || []).map((imgUrl, gIdx) => (
                        <div 
                          key={gIdx} 
                          className="relative group aspect-4/3 rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setPreviewLightbox({ url: imgUrl, title: `${srv.titulo || "Tratamiento"} - Foto Clínica #${gIdx + 1}` })}
                        >
                          <img src={imgUrl} alt={`Foto ${gIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <span className="p-1 rounded-md bg-slate-900/90 text-white text-[9px] font-bold flex items-center gap-1">
                              <Eye className="w-3 h-3 text-emerald-400" /> Ver HD
                            </span>
                          </div>
                          <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                            Foto #{gIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveGalleryPhoto(idx, gIdx);
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xs cursor-pointer transition-transform hover:scale-110 z-10"
                            title="Eliminar foto de galería"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* FORMULARIO PARA AGREGAR IMAGEN A GALERÍA SI ES MENOR A 6 */}
                    {(srv.galeriaFotos || []).length < 6 && (
                      <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                        {/* Subida rápida desde archivo local */}
                        <label className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0">
                          {uploadingGalleryIdx === idx ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>Subir foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUploadGalleryPhotoFile(idx, f);
                              e.target.value = "";
                            }}
                            disabled={uploadingGalleryIdx === idx}
                          />
                        </label>

                        <span className="text-[10px] font-bold text-slate-400 uppercase">ó URL:</span>

                        {/* Pegar URL de imagen */}
                        <input
                          type="url"
                          value={newGalleryUrlInput[idx] || ""}
                          onChange={(e) => setNewGalleryUrlInput(prev => ({ ...prev, [idx]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddGalleryPhotoUrl(idx);
                            }
                          }}
                          placeholder="https://..."
                          className="flex-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddGalleryPhotoUrl(idx)}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold cursor-pointer transition-colors shrink-0"
                        >
                          + Agregar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CÓDIGOS EMBED & REELS (HASTA 8) */}
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-purple-900 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-purple-600" />
                        <span>Códigos Embed & Videos / Reels (Hasta 8)</span>
                      </p>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                        {getEmbedList(srv).length} / 8 videos
                      </span>
                    </div>

                    {/* LISTA DE EMBEDS ACTUALES */}
                    <div className="space-y-1.5">
                      {getEmbedList(srv).map((embVal, embIdx) => (
                        <div key={embIdx} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-purple-200">
                          <span className="text-[10px] font-black text-purple-700 w-5 text-center shrink-0">#{embIdx + 1}</span>
                          <input
                            type="text"
                            value={embVal}
                            onChange={(e) => handleUpdateEmbedCodeItem(idx, embIdx, e.target.value)}
                            placeholder="URL de Reel o código <iframe ...>"
                            className="flex-1 px-2 py-1 text-xs font-mono text-slate-800 border-0 outline-none bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveEmbedCodeItem(idx, embIdx)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer transition-colors shrink-0"
                            title="Eliminar embed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* AGREGAR OTRO EMBED SI ES MENOR A 8 */}
                    {getEmbedList(srv).length < 8 && (
                      <div className="pt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={newEmbedInput[idx] || ""}
                          onChange={(e) => setNewEmbedInput(prev => ({ ...prev, [idx]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddEmbedCodeItem(idx);
                            }
                          }}
                          placeholder="Pega URL de Reel (Instagram, TikTok, YT) o código <iframe>..."
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 outline-none focus:border-purple-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddEmbedCodeItem(idx)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-extrabold cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. CASOS CLÍNICOS COMPARATIVOS (ANTES Y DESPUÉS) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>Casos Clínicos con Sliders Antes / Después</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {(data.casosAntesDespues || []).length} { (data.casosAntesDespues || []).length === 1 ? "caso" : "casos" }
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">Cada caso genera un slider interactivo independiente en la landing page médica.</p>
          </div>
          <button
            type="button"
            onClick={addCase}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Añadir Caso Clínico
          </button>
        </div>

        {(!data.casosAntesDespues || data.casosAntesDespues.length === 0) ? (
          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-3">No hay casos clínicos comparativos configurados.</p>
            <button
              type="button"
              onClick={addCase}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white border border-slate-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear primer caso clínico
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.casosAntesDespues.map((caso, idx) => (
              <div key={caso.id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-slate-800 uppercase truncate pr-2">{caso.titulo || "Caso Clínico"}</p>
                  <button
                    type="button"
                    onClick={() => removeCase(idx)}
                    title="Eliminar caso clínico"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`caso-titulo-${idx}`}>
                    Título del Caso Clínico
                  </label>
                  <input
                    id={`caso-titulo-${idx}`}
                    type="text"
                    value={caso.titulo ?? ""}
                    onChange={(e) => handleCaseChange(idx, "titulo", e.target.value)}
                    placeholder="ej. Rinoplastia Ultrasónica & Corrección Septal"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white font-bold text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`caso-desc-${idx}`}>
                    Diagnóstico Clínico y Técnica
                  </label>
                  <textarea
                    id={`caso-desc-${idx}`}
                    rows={2}
                    value={caso.descripcion ?? ""}
                    onChange={(e) => handleCaseChange(idx, "descripcion", e.target.value)}
                    placeholder="Describe el estado previo, procedimiento realizado y tiempo de evolución del paciente..."
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none bg-white text-slate-800"
                  />
                </div>

                {/* URLs de imágenes Antes y Después con Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between" htmlFor={`caso-img-before-${idx}`}>
                      <span>Imagen Estado Inicial (Antes)</span>
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">Antes</span>
                    </label>
                    <input
                      id={`caso-img-before-${idx}`}
                      type="url"
                      value={caso.imgBefore ?? ""}
                      onChange={(e) => handleCaseChange(idx, "imgBefore", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white text-slate-800"
                    />
                    {caso.imgBefore && (
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                        <img src={caso.imgBefore} alt="Antes" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Antes</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between" htmlFor={`caso-img-after-${idx}`}>
                      <span>Imagen Resultado Final (Después)</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">Después</span>
                    </label>
                    <input
                      id={`caso-img-after-${idx}`}
                      type="url"
                      value={caso.imgAfter ?? ""}
                      onChange={(e) => handleCaseChange(idx, "imgAfter", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white text-slate-800"
                    />
                    {caso.imgAfter && (
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                        <img src={caso.imgAfter} alt="Después" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Después</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* MODAL DE PREVISUALIZACIÓN DE IMÁGENES EN ALTA RESOLUCIÓN */}
      {previewLightbox && (
        <div 
          className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setPreviewLightbox(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-4 shadow-2xl flex flex-col gap-3 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{previewLightbox.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLightbox(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-red-600 text-white transition-colors cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full max-h-[65vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/60 p-1">
              <img 
                src={previewLightbox.url} 
                alt={previewLightbox.title} 
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Resolución WebP optimizada</span>
              <button
                type="button"
                onClick={() => setPreviewLightbox(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
              >
                Cerrar vista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
