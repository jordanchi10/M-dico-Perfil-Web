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
  Zap
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
  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    const newServices = [...(data.servicios || [])];
    newServices[index] = {
      ...newServices[index],
      [field]: value
    };
    updateField("servicios", newServices);
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
    const caseNum = (data.casosAntesDespues || []).length + 1;
    const newCase: BeforeAfterCase = {
      id: `caso-${Date.now()}`,
      titulo: `Caso Clínico ${caseNum}: Evolución y Resultado Post-Tratamiento`,
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between" htmlFor={`srv-titulo-${idx}`}>
                        <span>Título del Servicio / Procedimiento (Etiqueta &lt;h2&gt; SEO)</span>
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
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white font-bold text-slate-900"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between" htmlFor={`srv-slug-${idx}`}>
                        <span>Slug SEO / Enlace Propio</span>
                        <button
                          type="button"
                          onClick={() => autoGenerateSlug(idx)}
                          className="text-[9px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5 cursor-pointer"
                          title="Generar slug automáticamente"
                        >
                          <Wand2 className="w-2.5 h-2.5" />
                          Auto
                        </button>
                      </label>
                      <div className="relative">
                        <input
                          id={`srv-slug-${idx}`}
                          type="text"
                          value={srv.slug || ""}
                          onChange={(e) => handleServiceChange(idx, "slug", slugify(e.target.value))}
                          placeholder={slugify(srv.titulo || `servicio-${idx + 1}`)}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white font-mono text-purple-900"
                        />
                        <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono truncate">
                        sitemap.xml: /servicios/{currentSlug}
                      </span>
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
                          <label className="text-[10px] font-bold text-slate-600 uppercase">
                            Vista Previa 5:4
                          </label>
                          <div className="w-full aspect-[5/4] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-2xs">
                            {srv.imagenUrl ? (
                              <img src={srv.imagenUrl} alt="Preview" className="w-full h-full object-cover" />
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

                  {/* Metadatos Clínicos: Precio, Duración y Recuperación */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1" htmlFor={`srv-precio-${idx}`}>
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        Precio Estimado
                      </label>
                      <input
                        id={`srv-precio-${idx}`}
                        type="text"
                        value={srv.precio || ""}
                        onChange={(e) => handleServiceChange(idx, "precio", e.target.value)}
                        placeholder="ej. $50 USD o Desde $450"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1" htmlFor={`srv-duracion-${idx}`}>
                        <Clock className="w-3 h-3 text-blue-600" />
                        Duración del Procedimiento
                      </label>
                      <input
                        id={`srv-duracion-${idx}`}
                        type="text"
                        value={srv.duracion || ""}
                        onChange={(e) => handleServiceChange(idx, "duracion", e.target.value)}
                        placeholder="ej. 45 - 60 min"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1" htmlFor={`srv-recuperacion-${idx}`}>
                        <Activity className="w-3 h-3 text-purple-600" />
                        Recuperación
                      </label>
                      <input
                        id={`srv-recuperacion-${idx}`}
                        type="text"
                        value={srv.recuperacion || ""}
                        onChange={(e) => handleServiceChange(idx, "recuperacion", e.target.value)}
                        placeholder="ej. Ambulatoria (24-48h)"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white text-slate-800"
                      />
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
              <Sparkles className="w-4 h-4 text-emerald-600" />
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
                  <p className="text-[11px] font-extrabold text-slate-800 uppercase">{caso.titulo || `Caso Clínico #${idx + 1}`}</p>
                  <button
                    type="button"
                    onClick={() => removeCase(idx)}
                    title="Eliminar caso clínico"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
    </div>
  );
}
