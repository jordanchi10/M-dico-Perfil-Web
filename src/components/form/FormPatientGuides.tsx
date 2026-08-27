import React, { useState } from "react";
import { MedicalLandingData, PatientGuideItem } from "../../types";
import { PatientGuideModal } from "../PatientGuideModal";
import { compressAndConvertToWebP } from "../../utils/imageCompressor";
import {
  FileText,
  Plus,
  Trash2,
  FileDown,
  Sparkles,
  CheckCircle2,
  Tag,
  Link2,
  FolderDown,
  Download,
  MessageSquare,
  Mail,
  Share2,
  BookOpen,
  Image as ImageIcon,
  Upload,
  X,
  Loader2
} from "lucide-react";

interface FormPatientGuidesProps {
  data: MedicalLandingData;
  onChange?: (newData: MedicalLandingData | ((prev: MedicalLandingData) => MedicalLandingData)) => void;
  updateField?: (field: keyof MedicalLandingData, value: any) => void;
}

const CATEGORIAS_PREDEFINIDAS = [
  "Pre y Post Quirúrgico",
  "Primera Consulta",
  "Dieta & Preparación Exámenes",
  "Cuidados en Casa & Medicación",
  "Prevención & Estilo de Vida"
];

const PORTADAS_SUGERIDAS = [
  {
    nombre: "Consulta Médica",
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
  },
  {
    nombre: "Nutrición & Dieta",
    url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"
  },
  {
    nombre: "Exámenes & Diagnóstico",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
  },
  {
    nombre: "Bienestar & Ejercicio",
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80"
  }
];

export const getCleanGuideUrl = (domain: string, tipoEnlace?: string, slug?: string, titulo?: string) => {
  const base = (domain || "https://tu-dominio.com").replace(/\/$/, "");
  const prefix = (tipoEnlace || "Ebook").toLowerCase().trim();
  const cleanSlug = (slug || titulo || "guia").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

  if (prefix === "descargar") {
    return `${base}/descargar/${cleanSlug}`;
  }
  return `${base}/${prefix}/${cleanSlug}`;
};

export const FormPatientGuides: React.FC<FormPatientGuidesProps> = ({ data, onChange, updateField }) => {
  const guias = data.guiasPacientes || [];
  const [activeModalGuide, setActiveModalGuide] = useState<PatientGuideItem | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleImageFileUpload = async (index: number, file?: File) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const result = await compressAndConvertToWebP(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.88,
        format: "image/webp"
      });
      updateGuia(index, "imagenPortadaUrl", result.dataUrl);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      const reader = new FileReader();
      reader.onload = (e) => {
        updateGuia(index, "imagenPortadaUrl", (e.target?.result as string) || "");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingIndex(null);
    }
  };

  const addGuia = (categoriaPreset?: string) => {
    const defaultSlug = categoriaPreset 
      ? `guia-${categoriaPreset.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
      : `guia-paciente-${Date.now().toString().slice(-4)}`;

    const portadaInicial = PORTADAS_SUGERIDAS[guias.length % PORTADAS_SUGERIDAS.length].url;

    const nuevaGuia: PatientGuideItem = {
      id: "guia-" + Date.now(),
      titulo: categoriaPreset ? `Guía de ${categoriaPreset}` : "Nueva Guía / Ficha Preparatoria",
      descripcion: "Instrucciones médicas detalladas en formato PDF descargable para orientación del paciente.",
      categoria: categoriaPreset || "General",
      formato: "PDF",
      tamano: "1.8 MB",
      rutaCpanel: `/descargas/${defaultSlug}.pdf`,
      tipoEnlace: "Ebook",
      slug: defaultSlug,
      metodoEntrega: "todos",
      requiereRegistro: false,
      imagenPortadaUrl: portadaInicial
    };
    const nuevasGuias = [...guias, nuevaGuia];
    if (updateField) {
      updateField("guiasPacientes", nuevasGuias);
    } else if (onChange) {
      onChange((prev) => ({ ...prev, guiasPacientes: nuevasGuias }));
    }
  };

  const updateGuia = (index: number, field: keyof PatientGuideItem, value: any) => {
    const actualizadas = [...guias];
    actualizadas[index] = { ...actualizadas[index], [field]: value };
    if (updateField) {
      updateField("guiasPacientes", actualizadas);
    } else if (onChange) {
      onChange((prev) => ({ ...prev, guiasPacientes: actualizadas }));
    }
  };

  const removeGuia = (index: number) => {
    const actualizadas = guias.filter((_, i) => i !== index);
    if (updateField) {
      updateField("guiasPacientes", actualizadas);
    } else if (onChange) {
      onChange((prev) => ({ ...prev, guiasPacientes: actualizadas }));
    }
  };

  const domainBase = data.dominioWeb || "https://tu-dominio.com";

  return (
    <div className="space-y-6 text-left">
      {/* Modal de Prueba / Compartir Guía a Pacientes */}
      <PatientGuideModal
        guide={activeModalGuide}
        data={data}
        isOpen={Boolean(activeModalGuide)}
        onClose={() => setActiveModalGuide(null)}
      />

      {/* Encabezado informativo sobre Lead Magnets */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white shadow-md space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Guías, Ebooks y Fichas para Pacientes</h3>
            <p className="text-xs text-blue-200/90 font-medium">
              Permite descarga directa desde tu hosting (cPanel), solicitudes por WhatsApp o correo, con enlaces propios compartibles para enviar a tus pacientes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Descarga directa en cPanel</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Enlace propio sin duplicados</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Envío fácil por WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Plantillas Rápidas */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Agregar desde Plantillas Frecuentes
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS_PREDEFINIDAS.map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addGuia(cat)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Guías */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Documentos & Ebooks Descargables ({guias.length})
          </h4>
          <button
            type="button"
            onClick={() => addGuia()}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Guía / Ebook</span>
          </button>
        </div>

        {guias.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 space-y-2">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No has agregado guías ni fichas descargables</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Crea tus fichas preparatorias, guías de cuidados o libros educativos para enviarlos a tus pacientes o permitir descarga directa.
            </p>
          </div>
        ) : (
          guias.map((guia, idx) => {
            const fullLink = getCleanGuideUrl(domainBase, guia.tipoEnlace, guia.slug, guia.titulo);
            const cpanelPath = guia.rutaCpanel || `/descargas/${guia.slug || "guia"}.pdf`;

            return (
              <div key={guia.id || idx} className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 uppercase">
                      {guia.titulo || "Sin Título"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botón para previsualizar el componente / modal enviado al paciente */}
                    <button
                      type="button"
                      onClick={() => setActiveModalGuide(guia)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200/70 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Probar componente y ver enlace de envío"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Componente / Enviar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeGuia(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar guía"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Título */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700">Título del Documento / Guía / Libro</label>
                    <input
                      type="text"
                      value={guia.titulo}
                      onChange={(e) => updateGuia(idx, "titulo", e.target.value)}
                      placeholder="Ej. Guía de Cuidados Pre y Post Quirúrgicos"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-900"
                    />
                  </div>

                  {/* Imagen de Portada de la Guía/Ebook */}
                  <div className="sm:col-span-2 space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        Imagen de Portada para la Tarjeta / Ebook
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                        Soporta cualquier resolución (JPG, PNG, WebP)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Previsualización de Imagen */}
                      <div className="relative group shrink-0">
                        {guia.imagenPortadaUrl ? (
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-300 shadow-2xs bg-white">
                            <img
                              src={guia.imagenPortadaUrl}
                              alt="Portada"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => updateGuia(idx, "imagenPortadaUrl", "")}
                              className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
                              title="Quitar foto"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-slate-200/80 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-1 shrink-0">
                            <ImageIcon className="w-6 h-6 stroke-1 text-slate-400" />
                            <span className="text-[10px]">Sin Foto</span>
                          </div>
                        )}
                      </div>

                      {/* Botones de Subida y URL */}
                      <div className="w-full space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            uploadingIndex === idx
                              ? "bg-slate-300 text-slate-600 cursor-wait"
                              : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"
                          }`}>
                            {uploadingIndex === idx ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Procesando imagen...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Subir Imagen desde mi Equipo</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingIndex === idx}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageFileUpload(idx, file);
                                e.target.value = "";
                              }}
                              className="hidden"
                            />
                          </label>

                          {guia.imagenPortadaUrl && (
                            <button
                              type="button"
                              onClick={() => updateGuia(idx, "imagenPortadaUrl", "")}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Quitar</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <input
                            type="text"
                            value={guia.imagenPortadaUrl || ""}
                            onChange={(e) => updateGuia(idx, "imagenPortadaUrl", e.target.value)}
                            placeholder="o pega URL directa: https://..."
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono outline-none focus:border-blue-500"
                          />
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-bold text-slate-500">Sugerencias:</span>
                            {PORTADAS_SUGERIDAS.map((portada, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => updateGuia(idx, "imagenPortadaUrl", portada.url)}
                                className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-[10px] font-bold text-slate-700 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                              >
                                {portada.nombre}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700">Categoría o Etiqueta</label>
                    <div className="relative">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={guia.categoria}
                        onChange={(e) => updateGuia(idx, "categoria", e.target.value)}
                        placeholder="Ej. Pre y Post Operatorio"
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Formato y Tamaño */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700">Formato</label>
                      <select
                        value={guia.formato || "PDF"}
                        onChange={(e) => updateGuia(idx, "formato", e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-slate-800 font-semibold cursor-pointer"
                      >
                        <option value="PDF">PDF</option>
                        <option value="Ebook">Ebook</option>
                        <option value="Libro">Libro Digital</option>
                        <option value="Ficha Imprimible">Ficha Imprimible</option>
                        <option value="Checklist">Checklist</option>
                        <option value="Documento">Documento</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700">Tamaño aprox.</label>
                      <input
                        type="text"
                        value={guia.tamano || "1.8 MB"}
                        onChange={(e) => updateGuia(idx, "tamano", e.target.value)}
                        placeholder="1.8 MB"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700">Resumen Explicativo para el Paciente</label>
                    <textarea
                      rows={2}
                      value={guia.descripcion}
                      onChange={(e) => updateGuia(idx, "descripcion", e.target.value)}
                      placeholder="Describe qué aprenderá o encontrará el paciente en este archivo descargable..."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-slate-700 leading-relaxed"
                    />
                  </div>

                  {/* ENLACE PROPIO Y SLUG PERSONALIZABLE */}
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-blue-600" />
                        Enlace Propio Compartible para Pacientes
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                        Componente Único
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Prefijo</label>
                        <select
                          value={guia.tipoEnlace || "Ebook"}
                          onChange={(e) => updateGuia(idx, "tipoEnlace", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-blue-800 cursor-pointer"
                        >
                          <option value="Ebook">Ebook</option>
                          <option value="Descargar">Descargar</option>
                          <option value="Libro">Libro</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Nombre de Enlace (Slug)</label>
                        <input
                          type="text"
                          value={guia.slug || ""}
                          onChange={(e) => updateGuia(idx, "slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                          placeholder="ej. guia-gastritis-postop"
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 font-semibold"
                        />
                      </div>
                    </div>

                    {/* Visualización de la URL final (Sin duplicar /descargar/descargar/) */}
                    <div className="p-2 rounded-lg bg-white border border-blue-200 text-[11px] font-mono text-blue-900 flex items-center justify-between gap-2 overflow-x-auto">
                      <span className="truncate">{fullLink}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(fullLink);
                          alert(`¡Enlace copiado! ${fullLink}`);
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* ARCHIVO Y RUTA CPANEL */}
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                      <FolderDown className="w-4 h-4 text-emerald-600" />
                      Ruta del Archivo en Servidor / cPanel (Carpeta en Raíz)
                    </label>
                    <input
                      type="text"
                      value={guia.rutaCpanel || cpanelPath}
                      onChange={(e) => updateGuia(idx, "rutaCpanel", e.target.value)}
                      placeholder="/descargas/mi-guia.pdf"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 font-semibold focus:border-emerald-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-500 leading-normal">
                      💡 <strong>¿Cómo funciona en cPanel?</strong> Al subir tu sitio web a tu hosting cPanel, crea la carpeta <code className="bg-slate-200 text-slate-900 px-1 rounded">/descargas/</code> en la raíz (ej: <code className="bg-slate-200 text-slate-900 px-1 rounded">public_html/descargas/</code>) y coloca allí tu PDF con este mismo nombre. El botón de descarga lo abrirá e iniciará automáticamente.
                    </p>
                  </div>

                  {/* CANALES DE ENTREGA */}
                  <div className="sm:col-span-2 space-y-1.5 pt-1">
                    <label className="text-[11px] font-extrabold text-slate-700">Opción de Entrega para el Paciente</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => updateGuia(idx, "metodoEntrega", "todos")}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          (guia.metodoEntrega || "todos") === "todos"
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Todos los Canales</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateGuia(idx, "metodoEntrega", "descarga_directa")}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          guia.metodoEntrega === "descarga_directa"
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descarga Directa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateGuia(idx, "metodoEntrega", "whatsapp")}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          guia.metodoEntrega === "whatsapp"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Por WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateGuia(idx, "metodoEntrega", "email")}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          guia.metodoEntrega === "email"
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Por Correo</span>
                      </button>
                    </div>
                  </div>

                  {/* CHECKBOX LEAD MAGNET */}
                  <div className="sm:col-span-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                      <input
                        type="checkbox"
                        checked={guia.requiereRegistro ?? false}
                        onChange={(e) => updateGuia(idx, "requiereRegistro", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <div className="text-xs">
                        <span className="font-extrabold text-slate-800 block">Solicitar WhatsApp/Email del paciente antes de descargar (Lead Magnet)</span>
                        <span className="text-slate-500 text-[11px]">Formulario para capturar prospectos interesados antes de entregar el archivo.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


