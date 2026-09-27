/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { ClinicGalleryImage } from "../types";
import { 
  Building2, 
  Upload, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  X,
  ExternalLink,
  Eye,
  Camera,
  Layers,
  Info,
  Zap,
  Loader2
} from "lucide-react";
import { compressAndConvertToWebP, formatBytes } from "../utils/imageCompressor";

interface ClinicGalleryManagerProps {
  photos: ClinicGalleryImage[];
  onChange: (newPhotos: ClinicGalleryImage[]) => void;
  primaryColorClass?: string;
}

// Preset de fotografías de consultorios clínicos de alta resolución
const CLINIC_PHOTO_PRESETS = [
  {
    titulo: "Recepción y Sala de Espera",
    descripcion: "Espacio moderno, climatizado y diseñado para la comodidad de los pacientes.",
    url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Consultorio de Atención Privada",
    descripcion: "Ambiente confidencial y confortable para valoraciones médicas detalladas.",
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Área de Evaluación Diagnóstica",
    descripcion: "Tecnología médica avanzada e instrumental clínico de máxima precisión.",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Sala de Procedimientos Menores",
    descripcion: "Cumplimiento de los más rigurosos estándares de esterilización y bioseguridad.",
    url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Equipamiento e Instrumental Clínico",
    descripcion: "Instrumentos médicos estériles y tecnología de vanguardia para atención especializada.",
    url: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Estación de Monitoreo & Diagnóstico",
    descripcion: "Equipos de visualización digital y monitorización continua del paciente.",
    url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Área de Recuperación & Confort",
    descripcion: "Ambiente tranquilo y acogedor para reposo post-tratamiento bajo supervisión.",
    url: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Cabina de Tratamientos Especializados",
    descripcion: "Espacio ergonómico y esterilizado para intervenciones clínicas de precisión.",
    url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Sala de Esterilización & Bioseguridad",
    descripcion: "Protocolos hospitalarios de desinfección y trazabilidad de instrumental médico.",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Módulo de Atención Personalizada",
    descripcion: "Espacio reservado para explicación de diagnósticos y planes de tratamiento.",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Espacio de Terapia & Rehabilitación",
    descripcion: "Instalaciones amplias y equipadas para seguimiento de recuperación clínica.",
    url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop"
  },
  {
    titulo: "Laboratorio Clínico & Muestras",
    descripcion: "Equipamiento de toma de muestras con conservación y bioseguridad garantizada.",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"
  }
];

export const ClinicGalleryManager: React.FC<ClinicGalleryManagerProps> = ({
  photos = [],
  onChange,
  primaryColorClass = "blue"
}) => {
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);
  const [newUrlInput, setNewUrlInput] = useState<string>("");
  const [newTitleInput, setNewTitleInput] = useState<string>("");
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxPhotos = 12;
  const isMaxReached = photos.length >= maxPhotos;

  // Helper para procesar archivo a Base64 con compresión WebP
  const processUploadedFile = async (file: File, customTitle?: string) => {
    if (!file || isMaxReached) return;

    try {
      const result = await compressAndConvertToWebP(file, {
        maxWidth: 1200,
        maxHeight: 900,
        quality: 0.82
      });

      const newPhoto: ClinicGalleryImage = {
        id: `foto-cons-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: result.dataUrl,
        titulo: customTitle || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || `Instalación ${photos.length + 1}`,
        descripcion: `Optimizada a WebP (${formatBytes(result.compressedSize)}). Cumple estándares SEO.`
      };
      onChange([...photos, newPhoto]);
    } catch (err) {
      console.error("Error comprimiendo foto de galería:", err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const newPhoto: ClinicGalleryImage = {
            id: `foto-cons-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: result,
            titulo: customTitle || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || `Instalación ${photos.length + 1}`,
            descripcion: "Instalaciones preparadas con altos estándares de confort y bioseguridad."
          };
          onChange([...photos, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess: File[] = (Array.from(files) as File[]).slice(0, remainingSlots);

    filesToProcess.forEach((file: File) => {
      processUploadedFile(file);
    });

    if (e.target) e.target.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const remainingSlots = maxPhotos - photos.length;
      const filesToProcess: File[] = (Array.from(e.dataTransfer.files) as File[]).slice(0, remainingSlots);
      filesToProcess.forEach((file: File) => {
        processUploadedFile(file);
      });
    }
  };

  const handleAddViaUrl = () => {
    if (!newUrlInput.trim() || isMaxReached) return;

    const newPhoto: ClinicGalleryImage = {
      id: `foto-cons-${Date.now()}`,
      url: newUrlInput.trim(),
      titulo: newTitleInput.trim() || `Instalación Médica ${photos.length + 1}`,
      descripcion: "Espacio diseñado para brindar una atención médica de primer nivel."
    };

    onChange([...photos, newPhoto]);
    setNewUrlInput("");
    setNewTitleInput("");
    setIsAddingCustom(false);
  };

  const handleAddPreset = (preset: typeof CLINIC_PHOTO_PRESETS[0]) => {
    if (isMaxReached) return;

    const newPhoto: ClinicGalleryImage = {
      id: `foto-cons-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: preset.url,
      titulo: preset.titulo,
      descripcion: preset.descripcion
    };

    onChange([...photos, newPhoto]);
  };

  const handleUpdatePhoto = (index: number, field: keyof ClinicGalleryImage, value: string) => {
    const updated = [...photos];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange(updated);
  };

  const handleDeletePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === photos.length - 1)
    ) {
      return;
    }
    const updated = [...photos];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleReplacePhotoFile = (index: number, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const updated = [...photos];
        updated[index] = {
          ...updated[index],
          url: result
        };
        onChange(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="clinic-gallery-manager" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                Galería de Instalaciones & Consultorio
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isMaxReached ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`}>
                  {photos.length} / {maxPhotos} fotos
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Sube hasta 12 fotos del consultorio, recepción o equipos. Se presentarán en un carrusel interactivo después de 'Nosotros'.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setShowPresetModal(!showPresetModal)}
            disabled={isMaxReached}
            className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            title="Usar fotos sugeridas de alta resolución"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fotos de Ejemplo</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isMaxReached}
            className="text-[11px] font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Foto</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Preset Modal / Drawer desplegable */}
      {showPresetModal && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Selecciona fotos profesionales listas para usar:
            </span>
            <button
              type="button"
              onClick={() => setShowPresetModal(false)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[460px] overflow-y-auto pr-1">
            {CLINIC_PHOTO_PRESETS.map((preset, idx) => {
              const alreadyAdded = photos.some((p) => p.url === preset.url);
              return (
                <div 
                  key={idx} 
                  className={`p-2 rounded-xl border transition-all text-left flex flex-col justify-between group relative overflow-hidden ${alreadyAdded ? "bg-emerald-50 border-emerald-300 opacity-80" : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xs"}`}
                >
                  <div className="aspect-[5/4] rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                    <img 
                      src={preset.url} 
                      alt={preset.titulo} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-800 line-clamp-1">{preset.titulo}</p>
                  
                  <button
                    type="button"
                    disabled={alreadyAdded || isMaxReached}
                    onClick={() => handleAddPreset(preset)}
                    className={`mt-1.5 w-full text-[10px] font-extrabold py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${alreadyAdded ? "bg-emerald-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white"}`}
                  >
                    {alreadyAdded ? (
                      <>
                        <Check className="w-3 h-3" /> Agregada
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> Agregar
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zona Drag & Drop si faltan fotos */}
      {!isMaxReached && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
            dragActive 
              ? "border-blue-500 bg-blue-50/60 scale-[0.99]" 
              : "border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-800">
              Arrastra y suelta fotos de tu consultorio aquí, o <span className="text-blue-600 underline">haz clic para examinar</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Formatos aceptados: JPEG, PNG, WebP (Hasta {maxPhotos - photos.length} fotos más disponibles)
            </p>
          </div>
        </div>
      )}

      {/* Opción de agregar mediante URL directa */}
      {!isMaxReached && (
        <div>
          {!isAddingCustom ? (
            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="text-[11px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>O agregar foto mediante enlace / URL web</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-700">Agregar foto por URL:</span>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newTitleInput}
                  onChange={(e) => setNewTitleInput(e.target.value)}
                  placeholder="Título (ej. Recepción Principal)"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    placeholder="URL de la imagen: https://..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:border-blue-500 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddViaUrl}
                    disabled={!newUrlInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition-all shrink-0"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de Fotos Cargadas */}
      <div className="space-y-3 pt-1">
        {photos.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500">
            <Building2 className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
            <p className="text-xs font-bold text-slate-700">No hay fotos añadidas al consultorio</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Añade fotografías de tus instalaciones o haz clic en "Fotos de Ejemplo" para cargar imágenes clínicas profesionales.
            </p>
          </div>
        ) : (
          photos.map((photo, index) => (
            <div 
              key={photo.id || index}
              className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                
                {/* Miniatura 5:4 con indicador de posición */}
                <div className="relative w-full sm:w-36 aspect-[5/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group">
                  <img 
                    src={photo.url} 
                    alt={photo.titulo} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute("src", "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop");
                    }}
                  />
                  <div className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    #{index + 1}
                  </div>

                  {/* Reemplazar foto individual */}
                  <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity">
                    <span>Cambiar imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReplacePhotoFile(index, file);
                      }}
                    />
                  </label>
                </div>

                {/* Campos de texto: Título y Descripción */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={photo.titulo}
                      onChange={(e) => handleUpdatePhoto(index, "titulo", e.target.value)}
                      placeholder="Título de la foto (ej. Sala de Espera)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    value={photo.descripcion || ""}
                    onChange={(e) => handleUpdatePhoto(index, "descripcion", e.target.value)}
                    placeholder="Descripción breve de la instalación (ej. Ambiente climatizado y confortable)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Controles de ordenamiento y eliminación */}
                <div className="flex items-center sm:flex-col justify-end gap-1 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === photos.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(index)}
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {isMaxReached && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Has completado las {maxPhotos} fotografías permitidas para la galería de tu consultorio.</span>
        </div>
      )}
    </div>
  );
};
