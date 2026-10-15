/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  MedicalLandingData, 
  SectionOrderItem, 
  DEFAULT_SECTION_ORDER, 
  LandingStyleType, 
  CtaStyleType,
  DesktopHeaderStyleType
} from "../../types";
import { 
  Palette, 
  Pipette, 
  Sliders, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Sparkles, 
  MousePointerClick, 
  Phone, 
  MessageCircle,
  Layout,
  CheckCircle2,
  GripVertical,
  Image as ImageIcon,
  Upload,
  Zap,
  Loader2,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Circle,
  Square,
  Crop,
  ShieldCheck,
  AlignLeft,
  AlignRight,
  AlignCenter,
  Building2,
  Star,
  Calendar,
  Home,
  Award,
  Stethoscope
} from "lucide-react";
import {
  IconHome3D,
  IconDoctor3D,
  IconServices3D,
  IconReviews3D,
  IconAppointment3D,
  IconWhatsapp3D
} from "../Mobile3DIcons";
import { PRESET_PALETTES, generateScaleFromHex, getActiveColorScale, ensureValid7CharHex } from "../../utils/colorUtils";
import { LANDING_STYLE_PRESETS, SUPPORTED_FONTS, SYSTEM_FONTS, GOOGLE_FONTS } from "../../utils/stylePresets";
import { compressAndConvertToWebP, formatBytes, CompressResult } from "../../utils/imageCompressor";

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  order: { id: string; visible: boolean }[];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "predeterminado",
    name: "Estándar Completo (SEO Ideal)",
    description: "Todas las secciones en flujo óptimo para posicionamiento web y conversión.",
    badge: "10 Secciones",
    order: [
      { id: "hero", visible: true },
      { id: "eeat", visible: true },
      { id: "servicios", visible: true },
      { id: "redes_sociales", visible: true },
      { id: "casos", visible: true },
      { id: "opiniones", visible: true },
      { id: "blog", visible: true },
      { id: "guias", visible: true },
      { id: "horarios_ubicacion", visible: true },
      { id: "faqs", visible: true },
    ]
  },
  {
    id: "minimalista",
    name: "Minimalista & Rápido",
    description: "Enfocado únicamente en presentación rápida, servicios principales y contacto.",
    badge: "4 Secciones",
    order: [
      { id: "hero", visible: true },
      { id: "servicios", visible: true },
      { id: "opiniones", visible: true },
      { id: "horarios_ubicacion", visible: true },
      { id: "eeat", visible: false },
      { id: "redes_sociales", visible: false },
      { id: "casos", visible: false },
      { id: "blog", visible: false },
      { id: "guias", visible: false },
      { id: "faqs", visible: false },
    ]
  },
  {
    id: "clinico",
    name: "Enfoque Clínico & Procedimientos",
    description: "Destaca la autoridad médica, tratamientos avanzados y evidencia de casos.",
    badge: "8 Secciones",
    order: [
      { id: "hero", visible: true },
      { id: "eeat", visible: true },
      { id: "servicios", visible: true },
      { id: "casos", visible: true },
      { id: "opiniones", visible: true },
      { id: "guias", visible: true },
      { id: "horarios_ubicacion", visible: true },
      { id: "faqs", visible: true },
      { id: "redes_sociales", visible: false },
      { id: "blog", visible: false },
    ]
  },
  {
    id: "biografia",
    name: "Perfil & Autoridad E-E-A-T",
    description: "Prioriza la trayectoria académica, reputación del especialista y testimonios.",
    badge: "7 Secciones",
    order: [
      { id: "hero", visible: true },
      { id: "eeat", visible: true },
      { id: "opiniones", visible: true },
      { id: "servicios", visible: true },
      { id: "blog", visible: true },
      { id: "horarios_ubicacion", visible: true },
      { id: "faqs", visible: true },
      { id: "redes_sociales", visible: false },
      { id: "casos", visible: false },
      { id: "guias", visible: false },
    ]
  },
  {
    id: "conversion",
    name: "Conversión Directa & Citas",
    description: "Diseñado para agendar rápidamente con precios transparentes y FAQs.",
    badge: "6 Secciones",
    order: [
      { id: "hero", visible: true },
      { id: "servicios", visible: true },
      { id: "opiniones", visible: true },
      { id: "horarios_ubicacion", visible: true },
      { id: "guias", visible: true },
      { id: "faqs", visible: true },
      { id: "eeat", visible: false },
      { id: "redes_sociales", visible: false },
      { id: "casos", visible: false },
      { id: "blog", visible: false },
    ]
  }
];

interface FormDesignProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData | ((prev: MedicalLandingData) => MedicalLandingData)) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
  updateFields?: (fields: Partial<MedicalLandingData>) => void;
  subSection?: "colores" | "hero" | "secciones" | "all";
}

export function FormDesign({
  data,
  onChange,
  updateField,
  updateFields,
  subSection = "all"
}: FormDesignProps) {
  const applyFields = (fields: Partial<MedicalLandingData>) => {
    if (updateFields) {
      updateFields(fields);
    } else {
      onChange((prev) => ({
        ...prev,
        ...fields
      }));
    }
  };

  const [isCompressingPhoto, setIsCompressingPhoto] = React.useState(false);
  const [photoStats, setPhotoStats] = React.useState<CompressResult | null>(null);

  const [isCompressingHeroBg, setIsCompressingHeroBg] = React.useState(false);
  const [heroBgStats, setHeroBgStats] = React.useState<CompressResult | null>(null);


  const handleProfilePhotoUpload = async (file: File) => {
    try {
      setIsCompressingPhoto(true);
      const result = await compressAndConvertToWebP(file, {
        maxWidth: 800,
        maxHeight: 800,
        squareCrop: true,
        quality: 0.82
      });
      updateField("fotoUrl", result.dataUrl);
      setPhotoStats(result);
    } catch (err) {
      console.error("Error comprimiendo foto de perfil:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateField("fotoUrl", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleHeroBgUpload = async (file: File) => {
    try {
      setIsCompressingHeroBg(true);
      const result = await compressAndConvertToWebP(file, {
        maxWidth: 1600,
        maxHeight: 1000,
        quality: 0.85
      });
      applyFields({
        tipoFondoHero: "imagen",
        imagenFondoHero: result.dataUrl
      });
      setHeroBgStats(result);
    } catch (err) {
      console.error("Error comprimiendo fondo de hero:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          applyFields({
            tipoFondoHero: "imagen",
            imagenFondoHero: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingHeroBg(false);
    }
  };

  const currentSectionOrder: SectionOrderItem[] = 
    data.ordenSecciones && data.ordenSecciones.length > 0 
      ? data.ordenSecciones 
      : DEFAULT_SECTION_ORDER;

  const applyLayoutPreset = (presetId: string) => {
    const preset = LAYOUT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const labelMap = new Map(DEFAULT_SECTION_ORDER.map(s => [s.id, s.label]));

    const newOrder: SectionOrderItem[] = preset.order.map(item => ({
      id: item.id as any,
      label: labelMap.get(item.id as any) || item.id,
      visible: item.visible
    }));

    const presentIds = new Set(newOrder.map(s => s.id));
    DEFAULT_SECTION_ORDER.forEach(sec => {
      if (!presentIds.has(sec.id)) {
        newOrder.push({ ...sec, visible: false });
      }
    });

    onChange({
      ...data,
      ordenSecciones: newOrder
    });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const list = [...currentSectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    onChange({
      ...data,
      ordenSecciones: list
    });
  };

  const handleToggleSectionVisibility = (index: number) => {
    const list = currentSectionOrder.map((sec, i) => {
      if (i === index) {
        return { ...sec, visible: !sec.visible };
      }
      return sec;
    });
    onChange({
      ...data,
      ordenSecciones: list
    });
  };

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex ?? parseInt(e.dataTransfer.getData("text/plain"), 10);
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (isNaN(sourceIndex) || sourceIndex < 0 || sourceIndex >= currentSectionOrder.length) return;
    if (sourceIndex === targetIndex) return;

    const list = [...currentSectionOrder];
    const [movedItem] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, movedItem);

    onChange({
      ...data,
      ordenSecciones: list
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleResetSectionOrder = () => {
    onChange({
      ...data,
      ordenSecciones: DEFAULT_SECTION_ORDER
    });
  };

  const showColores = subSection === "all" || subSection === "colores";
  const showHero = subSection === "all" || subSection === "hero";
  const showSecciones = subSection === "all" || subSection === "secciones";

  return (
    <div id="form-design-section" className="space-y-6">
      {/* CABECERA DE SECCIÓN DINÁMICA SEGÚN SUBSECCIÓN */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          {subSection === "colores" ? (
            <>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" />
                Paleta Cromática & Tipografías de Marca
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personaliza la paleta médica, colores primario y secundario con contraste dinámico WCAG y las fuentes para títulos y párrafos.
              </p>
            </>
          ) : subSection === "hero" ? (
            <>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-600" />
                Cabecera, Menú Desktop & Sección Hero
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personaliza el estilo de menú de navegación en escritorio, distribución visual del hero, foto médica y fondos dinámicos.
              </p>
            </>
          ) : subSection === "secciones" ? (
            <>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Botones CTA & Organizador de Secciones
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura los botones de llamado a la acción (CTA) flotantes o fijos y organiza la secuencia y visibilidad de las secciones de tu web.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" />
                Diseño, Colores & Estilo Visual
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personaliza la paleta cromática, estilo de interfaz, llamadas a la acción (CTA) y orden de las secciones.
              </p>
            </>
          )}
        </div>
      </div>

      {/* 1. IDENTIDAD CROMÁTICA, PALETA DE COLORES & TIPOGRAFÍA DE MARCA */}
      {showColores && (
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Pipette className="w-4 h-4 text-blue-600" />
              Identidad Cromática & Paleta de Colores
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Selecciona una paleta médica o personaliza los códigos HEX de tu marca (primario, secundario y acento).
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200/80 shrink-0 hidden sm:inline">
            Cálculo Dinámico WCAG
          </span>
        </div>

        {/* 1.1 PALETAS PREDEFINIDAS */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Paletas Médicas Predefinidas:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(PRESET_PALETTES).map((preset) => {
              const isSelected = data.paletaColor === preset.id && (!data.colorPrimarioHex || data.colorPrimarioHex.toLowerCase() === preset.primaryHex.toLowerCase());
              return (
                <button
                  key={preset.id}
                  type="button"
                  id={`preset-color-${preset.id}`}
                  onClick={() => {
                    onChange({
                      ...data,
                      paletaColor: preset.id as any,
                      colorPrimarioHex: preset.primaryHex
                    });
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div 
                    className="w-5 h-5 rounded-lg shrink-0 shadow-2xs border border-black/10" 
                    style={{ backgroundColor: preset.primaryHex }} 
                  />
                  <span className="text-slate-800 text-[11px] truncate">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.2 CONFIGURACIÓN AVANZADA DE COLORES HEX */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Ajuste Fino de Colores HEX Personalizados</span>
            <span className="text-[10px] text-slate-400 normal-case">Tono Primario, Secundario y Acento</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* COLOR PRIMARIO */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">Color Primario</span>
                <span className="text-[10px] text-slate-400 font-mono">Dominante</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                <input
                  type="color"
                  id="custom-primary-color-picker"
                  value={ensureValid7CharHex(data.colorPrimarioHex, "#1e6fd9")}
                  onChange={(e) => {
                    const hexVal = e.target.value;
                    onChange({
                      ...data,
                      paletaColor: "personalizado",
                      colorPrimarioHex: hexVal
                    });
                  }}
                  className="w-8 h-8 rounded-md cursor-pointer border border-slate-200 p-0.5 shrink-0"
                />
                <input
                  type="text"
                  id="custom-primary-color-hex-input"
                  value={data.colorPrimarioHex || "#1e6fd9"}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({
                      ...data,
                      paletaColor: "personalizado",
                      colorPrimarioHex: val
                    });
                  }}
                  placeholder="#1e6fd9"
                  className="w-full px-2 py-1 rounded-md text-xs font-mono font-bold uppercase outline-none text-slate-800 bg-transparent"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Utilizado en encabezados, botones de contacto e iconos principales.
              </p>
            </div>

            {/* COLOR SECUNDARIO */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">Color Secundario</span>
                {data.colorSecundarioHex && (
                  <button
                    type="button"
                    onClick={() => updateField("colorSecundarioHex", undefined)}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Auto
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                <input
                  type="color"
                  id="custom-secondary-color-picker"
                  value={ensureValid7CharHex(data.colorSecundarioHex, data.colorPrimarioHex || "#10b981")}
                  onChange={(e) => updateField("colorSecundarioHex", e.target.value)}
                  className="w-8 h-8 rounded-md cursor-pointer border border-slate-200 p-0.5 shrink-0"
                />
                <input
                  type="text"
                  id="custom-secondary-color-hex-input"
                  value={data.colorSecundarioHex || ""}
                  onChange={(e) => updateField("colorSecundarioHex", e.target.value)}
                  placeholder="Automático"
                  className="w-full px-2 py-1 rounded-md text-xs font-mono font-bold uppercase outline-none text-slate-800 bg-transparent"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Utilizado en tarjetas secundarias, badges de especialidades y fondos suaves.
              </p>
            </div>

            {/* COLOR DE ACENTO */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">Color de Acento</span>
                {data.colorAcentoHex && (
                  <button
                    type="button"
                    onClick={() => updateField("colorAcentoHex", undefined)}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Auto
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                <input
                  type="color"
                  id="custom-accent-color-picker"
                  value={ensureValid7CharHex(data.colorAcentoHex, "#f59e0b")}
                  onChange={(e) => updateField("colorAcentoHex", e.target.value)}
                  className="w-8 h-8 rounded-md cursor-pointer border border-slate-200 p-0.5 shrink-0"
                />
                <input
                  type="text"
                  id="custom-accent-color-hex-input"
                  value={data.colorAcentoHex || ""}
                  onChange={(e) => updateField("colorAcentoHex", e.target.value)}
                  placeholder="#f59e0b"
                  className="w-full px-2 py-1 rounded-md text-xs font-mono font-bold uppercase outline-none text-slate-800 bg-transparent"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Utilizado en llamadas a la acción flotantes, insignias y botones de conversión.
              </p>
            </div>
          </div>
        </div>

        {/* 1.3 ESCALA CROMÁTICA EN VIVO */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Escala cromática principal en vivo (Tonos 50 - 950):
          </span>
          <div className="grid grid-cols-10 gap-1 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60">
            {Object.entries(getActiveColorScale(data.paletaColor, data.colorPrimarioHex)).map(([shade, hex]) => (
              <div key={shade} className="flex flex-col items-center gap-1 group relative">
                <div 
                  className="w-full h-6 sm:h-7 rounded-md border border-black/10 transition-transform group-hover:scale-105" 
                  style={{ backgroundColor: hex }} 
                  title={`${shade}: ${hex}`}
                />
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-500">{shade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 1.4 CONFIGURACIÓN TIPOGRÁFICA DE MARCA */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            Tipografías de Marca (Títulos y Cuerpo)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tipografía Títulos */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800">
                  Tipografía para Títulos (h1, h2, h3)
                </label>
                {data.fuenteTitulos && (
                  <button
                    type="button"
                    onClick={() => updateField("fuenteTitulos", undefined)}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Usar por defecto
                  </button>
                )}
              </div>
              <select
                id="select-custom-font-titles"
                value={data.fuenteTitulos || ""}
                onChange={(e) => updateField("fuenteTitulos", e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">— Heredar del Estilo de Landing —</option>
                <optgroup label="Fuentes de Google">
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font.id} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Fuentes del Sistema">
                  {SYSTEM_FONTS.map((font) => (
                    <option key={font.id} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Tipografía Párrafos */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800">
                  Tipografía para Párrafos y Cuerpo
                </label>
                {data.fuenteParrafos && (
                  <button
                    type="button"
                    onClick={() => updateField("fuenteParrafos", undefined)}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Usar por defecto
                  </button>
                )}
              </div>
              <select
                id="select-custom-font-body"
                value={data.fuenteParrafos || ""}
                onChange={(e) => updateField("fuenteParrafos", e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">— Heredar del Estilo de Landing —</option>
                <optgroup label="Fuentes de Google">
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font.id} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Fuentes del Sistema">
                  {SYSTEM_FONTS.map((font) => (
                    <option key={font.id} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Muestra Tipográfica */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              Muestra Tipográfica Live:
            </span>
            <div className="space-y-0.5 bg-white p-2.5 rounded-lg border border-slate-100">
              <h4 
                className="text-xs sm:text-sm font-extrabold text-slate-900"
                style={{ fontFamily: data.fuenteTitulos || "inherit" }}
              >
                Atención Médica Especializada con Calidez Humana
              </h4>
              <p 
                className="text-[10px] sm:text-[11px] text-slate-500 leading-snug"
                style={{ fontFamily: data.fuenteParrafos || "inherit" }}
              >
                Comprometidos con el bienestar integral de nuestros pacientes mediante tecnología de punta y excelencia profesional.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. ESTILO VISUAL DE LANDING PAGE, MENÚ DESKTOP, CABECERA HERO & FOTO */}
      {showHero && (
      <>
      {/* 2.1 ESTILO VISUAL DE LANDING PAGE */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Layout className="w-4 h-4 text-indigo-600" />
          Estilo de Landing Page
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.values(LANDING_STYLE_PRESETS).map((preset) => {
            const isSelected = (data.estiloLanding || "profesional") === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                id={`preset-style-${preset.id}`}
                onClick={() => {
                  onChange({
                    ...data,
                    estiloLanding: preset.id as LandingStyleType
                  });
                }}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold text-slate-900">{preset.name}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{preset.description}</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1.5">{preset.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.1 ESTILO DE MENÚ DESKTOP (HEADER DE NAVEGACIÓN) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-emerald-600" />
              Estilo de Menú Desktop (Navegación Header)
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Elige entre 5 versiones de menú exclusivas para pantalla de escritorio, para dar una personalidad única y profesional a la web de cada médico.
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            5 Versiones Desktop
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: "capsula",
              title: "v1. Cápsula Centrada",
              badge: "Píldora Flotante",
              description: "Logo a la izquierda, menú de enlaces agrupado en una cápsula ovalada al centro y botón de cita a la derecha.",
              renderPreview: () => (
                <div className="w-full h-10 bg-slate-100 rounded-lg p-1.5 flex items-center justify-between border border-slate-200/80">
                  <div className="w-12 h-3.5 bg-slate-300 rounded-md shrink-0"></div>
                  <div className="h-6 bg-white rounded-full px-2.5 border border-slate-200 flex items-center gap-1">
                    <div className="w-4 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-4 h-2 bg-slate-300 rounded-full"></div>
                    <div className="w-4 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  <div className="w-5 h-5 bg-emerald-600 rounded-full shrink-0"></div>
                </div>
              )
            },
            {
              id: "minimalista",
              title: "v2. Minimalista a la Derecha",
              badge: "Línea Inferior",
              description: "Diseño limpio sin cápsula gris. Enlaces alineados a la derecha con indicador de línea activa en el color del médico.",
              renderPreview: () => (
                <div className="w-full h-10 bg-slate-100 rounded-lg p-1.5 flex items-center justify-between border border-slate-200/80">
                  <div className="w-12 h-3.5 bg-slate-300 rounded-md shrink-0"></div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-5 h-2 bg-blue-600 rounded-xs"></div>
                      <div className="w-5 h-0.5 bg-blue-600"></div>
                    </div>
                    <div className="w-5 h-2 bg-slate-300 rounded-xs"></div>
                    <div className="w-5 h-2 bg-slate-300 rounded-xs"></div>
                    <div className="w-10 h-5 bg-emerald-600 rounded-md shrink-0"></div>
                  </div>
                </div>
              )
            },
            {
              id: "ejecutivo",
              title: "v3. Ejecutivo Doble Barra (Dark Bar)",
              badge: "Top Info Badges",
              description: "Barra superior en tono oscuro con micro-tarjetas de datos clave (Teléfono, Ubicación, Horarios, Citas) + Barra de navegación principal.",
              renderPreview: () => (
                <div className="w-full h-11 bg-slate-100 rounded-lg p-1 flex flex-col justify-between border border-slate-200/80 overflow-hidden">
                  <div className="w-full h-3.5 bg-slate-950 rounded-t-xs px-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-1.5 bg-emerald-400 rounded-xs"></div>
                      <div className="w-4 h-1.5 bg-blue-400 rounded-xs"></div>
                    </div>
                    <div className="w-8 h-1.5 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div className="w-full h-6 px-1 flex items-center justify-between">
                    <div className="w-10 h-3 bg-slate-300 rounded-md"></div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2.5 bg-blue-100 border border-blue-300 rounded-xs"></div>
                      <div className="w-4 h-2.5 bg-slate-200 rounded-xs"></div>
                      <div className="w-8 h-3.5 bg-emerald-600 rounded-md"></div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: "modern_dock",
              title: "v4. Dock Flotante Cristal",
              badge: "Isla Flotante",
              description: "Menú flotante separado del borde en un contenedor tipo isla con bordes redondeados suaves y sombra difuminada.",
              renderPreview: () => (
                <div className="w-full h-11 bg-slate-200/60 rounded-lg p-1.5 flex items-center justify-center">
                  <div className="w-11/12 h-8 bg-white/90 rounded-2xl px-2 shadow-sm border border-slate-300/70 flex items-center justify-between">
                    <div className="w-10 h-3 bg-blue-600 rounded-md shrink-0"></div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-2 bg-slate-800 rounded-xs"></div>
                      <div className="w-3 h-2 bg-slate-400 rounded-xs"></div>
                      <div className="w-3 h-2 bg-slate-400 rounded-xs"></div>
                    </div>
                    <div className="w-4 h-4 bg-emerald-600 rounded-full shrink-0"></div>
                  </div>
                </div>
              )
            },
            {
              id: "split_centrado",
              title: "v5. Pediátrico Colorido con Iconos 3D",
              badge: "Kids & Color 3D",
              description: "Diseño alegre, colorido y amigable ideal para pediatría y salud infantil. Iconos 3D limpios directamente junto a cada sección, sin burbujas extras.",
              renderPreview: () => (
                <div className="w-full h-11 bg-slate-50 rounded-xl p-1.5 flex items-center justify-between border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm leading-none">🧸</span>
                    <div className="w-8 h-3 bg-slate-800 rounded-md"></div>
                  </div>
                  <div className="h-8 bg-white/95 rounded-xl px-2 border border-slate-200 shadow-2xs flex items-center gap-2">
                    <div className="h-6 px-2 bg-blue-600 rounded-lg flex items-center gap-1 text-white shadow-2xs">
                      <span className="text-xs leading-none">🏠</span>
                      <div className="w-3 h-1.5 bg-white rounded-xs"></div>
                    </div>
                    <div className="flex items-center gap-1 px-1">
                      <span className="text-xs">🩺</span>
                      <div className="w-3.5 h-1.5 bg-slate-400 rounded-xs"></div>
                    </div>
                    <div className="flex items-center gap-1 px-1">
                      <span className="text-xs">⭐</span>
                      <div className="w-3.5 h-1.5 bg-slate-400 rounded-xs"></div>
                    </div>
                  </div>
                  <div className="h-7 px-2 bg-blue-600 rounded-lg shadow-xs flex items-center gap-1 text-xs text-white">
                    <span>📅</span>
                  </div>
                </div>
              )
            }
          ].map((version) => {
            const currentStyle = data.estiloMenuDesktop || "capsula";
            const isSelected = currentStyle === version.id;
            return (
              <button
                key={version.id}
                type="button"
                id={`preset-header-${version.id}`}
                onClick={() => {
                  onChange({
                    ...data,
                    estiloMenuDesktop: version.id as DesktopHeaderStyleType
                  });
                }}
                className={`flex flex-col justify-between text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold text-slate-900">{version.title}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 uppercase">
                        {version.badge}
                      </span>
                    )}
                  </div>
                  {version.renderPreview()}
                  <p className="text-[11px] text-slate-500 leading-snug">{version.description}</p>
                </div>
                {isSelected && (
                  <span className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block w-fit">
                    ✓ Versión Activa
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.5. ESTRUCTURA Y LAYOUT DE LA SECCIÓN HERO (SOLO DESKTOP) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-emerald-600" />
              Estructura & Layout de la Sección Hero (Solo Desktop)
            </label>
            <p className="text-[11px] text-slate-500">
              Selecciona una de las 3 alternativas de distribución visual para pantallas grandes (Desktop / Laptop).
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            Solo Desktop
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: "estandar",
              title: "v1. Estándar (Por Defecto)",
              subtitle: "Información Izq. | Foto Der.",
              badge: "Recomendado",
              description: "Información, botones CTA y redes sociales alineados a la izquierda, con la fotografía del médico en la columna derecha.",
              icon: AlignLeft,
              renderDiagram: () => (
                <div className="w-full h-12 bg-slate-100 rounded-lg p-1.5 flex items-center justify-between border border-slate-200 gap-1.5">
                  <div className="flex-1 h-full bg-slate-200/80 rounded-md p-1 flex flex-col justify-center space-y-1">
                    <div className="w-3/4 h-1.5 bg-slate-800 rounded-xs"></div>
                    <div className="w-1/2 h-1 bg-blue-600 rounded-xs"></div>
                    <div className="w-2/3 h-2 bg-emerald-600 rounded-xs mt-0.5"></div>
                  </div>
                  <div className="w-9 h-full bg-slate-800 rounded-md flex items-center justify-center shrink-0 border border-slate-600">
                    <div className="w-5 h-5 bg-cyan-400/30 rounded-full border border-cyan-300/50"></div>
                  </div>
                </div>
              )
            },
            {
              id: "invertido",
              title: "v2. Invertido",
              subtitle: "Foto Izq. | Información Der.",
              badge: "Estructura Invertida",
              description: "La foto del especialista se ubica en la columna izquierda, con la información y botones organizados a la derecha.",
              icon: AlignRight,
              renderDiagram: () => (
                <div className="w-full h-12 bg-slate-100 rounded-lg p-1.5 flex items-center justify-between border border-slate-200 gap-1.5">
                  <div className="w-9 h-full bg-slate-800 rounded-md flex items-center justify-center shrink-0 border border-slate-600">
                    <div className="w-5 h-5 bg-cyan-400/30 rounded-full border border-cyan-300/50"></div>
                  </div>
                  <div className="flex-1 h-full bg-slate-200/80 rounded-md p-1 flex flex-col justify-center space-y-1">
                    <div className="w-3/4 h-1.5 bg-slate-800 rounded-xs"></div>
                    <div className="w-1/2 h-1 bg-blue-600 rounded-xs"></div>
                    <div className="w-2/3 h-2 bg-emerald-600 rounded-xs mt-0.5"></div>
                  </div>
                </div>
              )
            },
            {
              id: "centrado",
              title: "v3. Centrado (Institución)",
              subtitle: "Centros Médicos & Labs",
              badge: "Clínicas & Labs",
              description: "Foto oculta en todas las pantallas (Mobile, Tablet y Desktop) y badge en 'Verificado' para destacar el centro médico y el logotipo.",
              icon: AlignCenter,
              renderDiagram: () => (
                <div className="w-full h-12 bg-slate-100 rounded-lg p-1.5 flex items-center justify-center border border-slate-200">
                  <div className="w-4/5 h-full bg-slate-200/80 rounded-md p-1 flex flex-col items-center justify-center space-y-1 text-center">
                    <div className="w-2/3 h-1.5 bg-slate-800 rounded-xs mx-auto"></div>
                    <div className="w-1/2 h-1 bg-blue-600 rounded-xs mx-auto"></div>
                    <div className="w-3/5 h-2 bg-emerald-600 rounded-xs mx-auto mt-0.5"></div>
                  </div>
                </div>
              )
            }
          ].map((option) => {
            const currentOption = data.disenoHeroDesktop || "estandar";
            const isSelected = currentOption === option.id;
            const IconComp = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                id={`preset-hero-layout-${option.id}`}
                onClick={() => updateField("disenoHeroDesktop", option.id)}
                className={`flex flex-col justify-between text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="space-y-2.5 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <IconComp className={`w-4 h-4 ${isSelected ? "text-emerald-600" : "text-slate-500"}`} />
                      <span className="text-xs font-extrabold text-slate-900">{option.title}</span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 uppercase">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.renderDiagram()}
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 block mb-0.5">{option.subtitle}</span>
                    <p className="text-[11px] text-slate-500 leading-snug">{option.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="mt-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                    ✓ Layout Activo
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
          <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Información importante:</strong> La versión v3 Centrada oculta la foto en Mobile, Tablet y Desktop y cambia el badge a "Verificado" para enfocar la landing en el centro médico. Para las versiones v1 y v2, en Mobile y Tablet se mantiene la foto del profesional.
          </span>
        </div>
      </div>

      {/* 2.6. POPUP DE BIENVENIDA & FRANJA DE SALUDO PERSONALIZADO */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Popup de Bienvenida Minimalista & Saludo al Paciente
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                data.habilitarPopupBienvenida
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {data.habilitarPopupBienvenida ? "😊 Activado" : "Deshabilitado por defecto"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Modal ultra-limpio y minimalista con icono de cara feliz en 3D que solicita amablemente el nombre al visitante, muestra una franja sin fondo bajo el Hero y auto-completa el formulario de citas. Viene deshabilitado por defecto.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              {data.habilitarPopupBienvenida ? "Habilitado" : "Habilitar"}
            </span>
            <label className="relative inline-flex items-center cursor-pointer" title={data.habilitarPopupBienvenida ? "Deshabilitar popup" : "Habilitar popup manualmente"}>
              <input
                type="checkbox"
                id="toggle-popup-bienvenida"
                checked={Boolean(data.habilitarPopupBienvenida)}
                onChange={(e) => updateField("habilitarPopupBienvenida", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {Boolean(data.habilitarPopupBienvenida) && (
          <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
            {/* Selector de Icono 3D para el Popup y Franja */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">
                Selecciona el Icono 3D del Popup y Franja de Saludo
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {[
                  { emoji: "😊", label: "Cara Feliz" },
                  { emoji: "👋", label: "Saludo Mano" },
                  { emoji: "🩺", label: "Estetoscopio" },
                  { emoji: "✨", label: "Destello" },
                  { emoji: "🧸", label: "Pediatría / Osito" },
                  { emoji: "🌟", label: "Estrella" },
                  { emoji: "💙", label: "Corazón Médico" },
                  { emoji: "🏥", label: "Clínica" },
                  { emoji: "👨‍⚕️", label: "Doctor" },
                  { emoji: "👩‍⚕️", label: "Doctora" },
                ].map((item) => {
                  const isSelected = (data.popupBienvenidaIcono || "😊") === item.emoji;
                  return (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => updateField("popupBienvenidaIcono", item.emoji)}
                      className={`px-2.5 py-1.5 rounded-xl border text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700"
                      }`}
                      title={item.label}
                    >
                      <span className="text-base select-none filter drop-shadow-xs">{item.emoji}</span>
                      <span className="text-[11px] font-medium hidden sm:inline">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Título del Popup de Bienvenida
                </label>
                <input
                  type="text"
                  value={data.popupBienvenidaTitulo ?? "¡Bienvenido(a) a mi consulta!"}
                  onChange={(e) => updateField("popupBienvenidaTitulo", e.target.value)}
                  placeholder="¡Bienvenido(a) a mi consulta!"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Texto del Botón Continuar
                </label>
                <input
                  type="text"
                  value={data.popupBienvenidaBoton ?? "Comenzar recorrido"}
                  onChange={(e) => updateField("popupBienvenidaBoton", e.target.value)}
                  placeholder="Comenzar recorrido"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Mensaje Amable / Petición de Nombre (Subtítulo)
              </label>
              <input
                type="text"
                value={data.popupBienvenidaSubtitulo ?? "Me encantaría conocerte. ¿Cuál es tu nombre para brindarte una mejor atención?"}
                onChange={(e) => updateField("popupBienvenidaSubtitulo", e.target.value)}
                placeholder="Me encantaría conocerte. ¿Cuál es tu nombre para brindarte una mejor atención?"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Texto de Sugerencia del Input (Placeholder)
              </label>
              <input
                type="text"
                value={data.popupBienvenidaPlaceholder ?? "Ingresa tu nombre aquí..."}
                onChange={(e) => updateField("popupBienvenidaPlaceholder", e.target.value)}
                placeholder="Ingresa tu nombre aquí..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Franja de Saludo debajo del Hero (Sin fondo)
                </label>
                <span className="text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Usa {"{nombre}"} para el nombre dinámico
                </span>
              </div>
              <input
                type="text"
                value={data.franjaSaludoHeroTexto ?? "¡Hola {nombre}, te muestro un poco de mi!"}
                onChange={(e) => updateField("franjaSaludoHeroTexto", e.target.value)}
                placeholder="¡Hola {nombre}, te muestro un poco de mi!"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 font-medium text-slate-800"
              />
              <p className="text-[10px] text-slate-500">
                Ejemplo resultante: <em>"¡Hola Jordan, te muestro un poco de mi!"</em> (o saludo cordial si el usuario no ingresa su nombre).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. FOTO PROFESIONAL DEL MÉDICO & CONFIGURACIÓN DE MARCO */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5" htmlFor="fotoUrl">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Foto Profesional del Médico & Configuración de Marco
            </label>
            <p className="text-[11px] text-slate-500">Sube la fotografía, selecciona su forma (circular, 3:4 o sin borde) y ajusta el tamaño por dispositivo.</p>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            {data.fotoFormaHero || "circular"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4 flex flex-col items-center justify-center p-1 rounded-2xl border-2 border-slate-200 bg-slate-100 aspect-square w-24 sm:w-28 mx-auto overflow-hidden shadow-xs relative">
            <img 
              src={data.fotoUrl} 
              alt={data.nombreMedico} 
              className={`w-full h-full object-cover object-top ${
                data.fotoFormaHero === "circular" ? "rounded-full" : data.fotoFormaHero === "rectangular" ? "rounded-xl" : "rounded-none"
              }`}
              style={
                data.fotoFormaHero === "sin_borde"
                  ? {
                      WebkitMaskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
                      maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
                    }
                  : undefined
              } 
            />
          </div>

          <div className="sm:col-span-8 space-y-2">
            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all">
              {isCompressingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span>{isCompressingPhoto ? "Comprimiendo y Convirtiendo a WebP..." : "Subir Foto (Auto-Compresión WebP SEO)"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isCompressingPhoto}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProfilePhotoUpload(file);
                }}
              />
            </label>
            <input
              id="fotoUrl"
              type="text"
              value={data.fotoUrl ?? ""}
              onChange={(e) => {
                updateField("fotoUrl", e.target.value);
                setPhotoStats(null);
              }}
              placeholder="O pega una URL: https://images.unsplash.com/..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-mono text-slate-600 bg-white"
            />

            {/* BADGE DE COMPRESIÓN WEBP DE FOTO */}
            {photoStats && (
              <div className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-emerald-600 text-white rounded-md shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[11px] leading-tight">
                      Convertida a {photoStats.format} ({photoStats.width}x{photoStats.height}px)
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      Original: {formatBytes(photoStats.originalSize)} → Compreso: <strong>{formatBytes(photoStats.compressedSize)}</strong>
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white font-black text-xs px-2 py-1 rounded-lg shrink-0">
                  -{photoStats.savingsPercent}% SEO
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">Presets médicos:</span>
              {[
                { label: "Dr. Médico 1", url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop" },
                { label: "Dra. Médica 2", url: "https://images.unsplash.com/photo-1594824813590-482a6e9a6671?q=80&w=800&auto=format&fit=crop" },
                { label: "Dr. Cirujano 3", url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=800&auto=format&fit=crop" }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => updateField("fotoUrl", preset.url)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTROLES DE FORMA DE LA FOTO */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Crop className="w-3.5 h-3.5 text-emerald-600" />
              Forma Visual de la Fotografía en Hero
            </span>
            <span className="text-[10px] text-slate-400">Soporta retrato 3:4 o circular 1:1</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: "circular",
                label: "Circular 1:1",
                desc: "Anillo circular con halo glow médico",
                icon: Circle
              },
              {
                id: "rectangular",
                label: "Rectangular 3:4",
                desc: "Marco vertical 3:4 con bordes redondeados",
                icon: Square
              },
              {
                id: "sin_borde",
                label: "Sin Borde / Libre",
                desc: "Foto flotante limpia en 3:4 con suave desvanecimiento inferior (10%)",
                icon: Crop
              }
            ].map((shape) => {
              const isSelected = (data.fotoFormaHero || "circular") === shape.id;
              const IconComp = shape.icon;
              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => updateField("fotoFormaHero", shape.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs font-extrabold"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                      {shape.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight block">{shape.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTROLES DE TAMAÑO RESPONSIVO (MÓVIL, TABLET, DESKTOP) */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
              Ajuste de Tamaño Personalizado por Pantalla (Ancho)
            </label>
            <button
              type="button"
              onClick={() => {
                applyFields({
                  fotoTamanoMobile: 176,
                  fotoTamanoTablet: 240,
                  fotoTamanoDesktop: 320
                });
              }}
              className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer Tamaños
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Móvil */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  Móvil
                </span>
                <span className="text-xs font-extrabold text-blue-600 font-mono">
                  {data.fotoTamanoMobile || 176}px
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="340"
                step="4"
                value={data.fotoTamanoMobile || 176}
                onChange={(e) => updateField("fotoTamanoMobile", parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>100px</span>
                <span>340px</span>
              </div>
            </div>

            {/* Tablet */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Tablet className="w-3.5 h-3.5 text-slate-500" />
                  Tablet
                </span>
                <span className="text-xs font-extrabold text-blue-600 font-mono">
                  {data.fotoTamanoTablet || 240}px
                </span>
              </div>
              <input
                type="range"
                min="150"
                max="500"
                step="4"
                value={data.fotoTamanoTablet || 240}
                onChange={(e) => updateField("fotoTamanoTablet", parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>150px</span>
                <span>500px</span>
              </div>
            </div>

            {/* Desktop */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  Escritorio (PC)
                </span>
                <span className="text-xs font-extrabold text-blue-600 font-mono">
                  {data.fotoTamanoDesktop || 320}px
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="640"
                step="4"
                value={data.fotoTamanoDesktop || 320}
                onChange={(e) => updateField("fotoTamanoDesktop", parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>200px</span>
                <span>640px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FONDO DINÁMICO DEL HERO (GRADIENTE, COLOR SÓLIDO O IMAGEN CON OVERLAY OSCURO) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5" htmlFor="imagenFondoHero">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              Fondo Dinámico del Hero (100% Ancho / 80% Alto Pantalla)
            </label>
            <p className="text-[11px] text-slate-500">
              Personaliza el fondo de la cabecera: elige entre gradientes modernos, color sólido o sube una imagen panorámica con overlay oscuro.
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            80% Alto Viewport
          </span>
        </div>

        {/* SELECTOR DE TIPO DE FONDO: GRADIENTE / SÓLIDO / IMAGEN */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200">
          {[
            { id: "gradiente", label: "🎨 Gradiente Moderno", icon: "✨" },
            { id: "solido", label: "⬛ Color Sólido", icon: "🎨" },
            { id: "imagen", label: "🖼️ Imagen Panorámica", icon: "📷" }
          ].map((tab) => {
            const currentType = data.tipoFondoHero || (data.imagenFondoHero ? "imagen" : "gradiente");
            const isSelected = currentType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateField("tipoFondoHero", tab.id)}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OPCIÓN GRADIENTE */}
        {(data.tipoFondoHero === "gradiente" || (!data.tipoFondoHero && !data.imagenFondoHero)) && (
          <div className="space-y-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>🎨 Presets de Gradientes Variados (12 Opciones)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Femeninos, Blancos y Oscuros</span>
            </div>

            {/* CATEGORÍA 1: 6 PALETAS FEMENINAS & SUAVES */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-pink-700 uppercase tracking-wide flex items-center gap-1">
                🌸 6 Paletas Femeninas & Suaves (Rose, Lavanda, Coral, Blush, Lilá)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: "Rose Gold & Blush", value: "linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 50%, #f472b6 100%)", defaultOverlay: "claro" },
                  { name: "Orquídea & Lavanda", value: "linear-gradient(135deg, #f3e8ff 0%, #d8b4fe 50%, #a855f7 100%)", defaultOverlay: "claro" },
                  { name: "Coral & Durazno", value: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fb923c 100%)", defaultOverlay: "claro" },
                  { name: "Rosa Pastel & Crema", value: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fda4af 100%)", defaultOverlay: "claro" },
                  { name: "Lilá Silvestre & Nude", value: "linear-gradient(135deg, #faf5ff 0%, #e9d5ff 50%, #c084fc 100%)", defaultOverlay: "claro" },
                  { name: "Silk Rose & Borgoña", value: "linear-gradient(135deg, #fce7f3 0%, #f472b6 50%, #831843 100%)", defaultOverlay: "oscuro" }
                ].map((grad) => {
                  const currentBgType = data.tipoFondoHero || (data.imagenFondoHero ? "imagen" : "gradiente");
                  const isSelected = currentBgType === "gradiente" && (data.gradienteFondoHero || "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)") === grad.value;
                  return (
                    <button
                      key={grad.name}
                      type="button"
                      onClick={() => {
                        applyFields({
                          tipoFondoHero: "gradiente",
                          gradienteFondoHero: grad.value,
                          ...(grad.defaultOverlay ? { tipoOverlayHero: grad.defaultOverlay as "oscuro" | "claro" } : {})
                        });
                      }}
                      className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-end h-16 shadow-2xs ${
                        isSelected
                          ? "ring-2 ring-pink-500 border-transparent shadow-md scale-[1.02]"
                          : "border-slate-300 hover:border-pink-400"
                      }`}
                      style={{ background: grad.value }}
                    >
                      <span className={`text-[10px] font-extrabold drop-shadow-xs z-10 ${grad.defaultOverlay === "claro" ? "text-slate-900" : "text-white"}`}>
                        {grad.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORÍA 2: 3 LUMINOSOS & BLANCOS MÉDICOS */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                🤍 3 Blancos, Mármol & Menta (Luminosos y Limpios)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Mármol & Perla", value: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)", defaultOverlay: "claro" },
                  { name: "Menta & Salvia", value: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #86efac 100%)", defaultOverlay: "claro" },
                  { name: "Celeste Algodón", value: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #7dd3fc 100%)", defaultOverlay: "claro" }
                ].map((grad) => {
                  const currentBgType = data.tipoFondoHero || (data.imagenFondoHero ? "imagen" : "gradiente");
                  const isSelected = currentBgType === "gradiente" && (data.gradienteFondoHero || "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)") === grad.value;
                  return (
                    <button
                      key={grad.name}
                      type="button"
                      onClick={() => {
                        applyFields({
                          tipoFondoHero: "gradiente",
                          gradienteFondoHero: grad.value,
                          ...(grad.defaultOverlay ? { tipoOverlayHero: grad.defaultOverlay as "oscuro" | "claro" } : {})
                        });
                      }}
                      className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-end h-16 shadow-2xs ${
                        isSelected
                          ? "ring-2 ring-blue-500 border-transparent shadow-md scale-[1.02]"
                          : "border-slate-300 hover:border-blue-400"
                      }`}
                      style={{ background: grad.value }}
                    >
                      <span className="text-[10px] font-extrabold text-slate-900 drop-shadow-xs z-10">
                        {grad.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORÍA 3: 3 PROFUNDOS & ESPECIALIDAD */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                💙 3 Profundos & Especialidad (Elegantes y Clásicos)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Royal Medical Blue", value: "linear-gradient(135deg, #172554 0%, #1d4ed8 50%, #0f172a 100%)", defaultOverlay: "oscuro" },
                  { name: "Clinical Ocean", value: "linear-gradient(135deg, #082f49 0%, #0369a1 50%, #0f172a 100%)", defaultOverlay: "oscuro" },
                  { name: "Deep Slate & Navy", value: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", defaultOverlay: "oscuro" }
                ].map((grad) => {
                  const currentBgType = data.tipoFondoHero || (data.imagenFondoHero ? "imagen" : "gradiente");
                  const isSelected = currentBgType === "gradiente" && (data.gradienteFondoHero || "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)") === grad.value;
                  return (
                    <button
                      key={grad.name}
                      type="button"
                      onClick={() => {
                        applyFields({
                          tipoFondoHero: "gradiente",
                          gradienteFondoHero: grad.value,
                          ...(grad.defaultOverlay ? { tipoOverlayHero: grad.defaultOverlay as "oscuro" | "claro" } : {})
                        });
                      }}
                      className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-end h-16 shadow-2xs ${
                        isSelected
                          ? "ring-2 ring-slate-700 border-transparent shadow-md scale-[1.02]"
                          : "border-slate-300 hover:border-slate-500"
                      }`}
                      style={{ background: grad.value }}
                    >
                      <span className="text-[10px] font-extrabold text-white drop-shadow-md z-10">
                        {grad.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. OPCIÓN COLOR SÓLIDO */}
        {data.tipoFondoHero === "solido" && (
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block">Elige un Color Sólido o ingresa tu color HEX:</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.colorFondoHero || "#0f172a"}
                onChange={(e) => {
                  applyFields({
                    tipoFondoHero: "solido",
                    colorFondoHero: e.target.value
                  });
                }}
                className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                title="Seleccionar color"
              />
              <input
                type="text"
                value={data.colorFondoHero || "#0f172a"}
                onChange={(e) => {
                  applyFields({
                    tipoFondoHero: "solido",
                    colorFondoHero: e.target.value
                  });
                }}
                placeholder="#0f172a"
                className="w-32 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white text-slate-800"
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "Blanco Mármol", color: "#f8fafc", overlay: "claro" },
                  { name: "Rosa Suave", color: "#fce7f3", overlay: "claro" },
                  { name: "Slate 900", color: "#0f172a", overlay: "oscuro" },
                  { name: "Navy 900", color: "#172554", overlay: "oscuro" },
                  { name: "Teal 950", color: "#022c22", overlay: "oscuro" }
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => {
                      applyFields({
                        tipoFondoHero: "solido",
                        colorFondoHero: c.color,
                        ...(c.overlay ? { tipoOverlayHero: c.overlay as "oscuro" | "claro" } : {})
                      });
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold shadow-2xs border border-slate-300 hover:scale-105 transition-all cursor-pointer"
                    style={{ backgroundColor: c.color, color: c.overlay === "claro" ? "#0f172a" : "#ffffff" }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. OPCIÓN IMAGEN PANORÁMICA */}
        {data.tipoFondoHero === "imagen" && (
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-1 rounded-xl border border-slate-200 bg-slate-100 aspect-video w-full max-w-[160px] mx-auto overflow-hidden shadow-xs relative group">
                {data.imagenFondoHero ? (
                  <img 
                    src={data.imagenFondoHero} 
                    alt="Fondo Hero" 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                ) : (
                  <div className="text-[10px] text-slate-400 text-center font-semibold p-2">
                    Sin imagen (Sube una o usa preset)
                  </div>
                )}
                {data.imagenFondoHero && (
                  <button
                    type="button"
                    onClick={() => {
                      updateField("imagenFondoHero", "");
                    }}
                    className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>

              <div className="sm:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all">
                    {isCompressingHeroBg ? (
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                    <span>{isCompressingHeroBg ? "Optimizando..." : "Subir Imagen (Auto WebP)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isCompressingHeroBg}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHeroBgUpload(file);
                      }}
                    />
                  </label>
                  <input
                    id="imagenFondoHero"
                    type="text"
                    value={data.imagenFondoHero || ""}
                    onChange={(e) => {
                      applyFields({
                        tipoFondoHero: "imagen",
                        imagenFondoHero: e.target.value
                      });
                      setHeroBgStats(null);
                    }}
                    placeholder="O pega URL de fondo..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white outline-none focus:border-blue-500"
                  />
                </div>

                {/* BADGE DE COMPRESIÓN WEBP DEL FONDO */}
                {heroBgStats && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-900 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Fondo optimizado a {heroBgStats.format} ({formatBytes(heroBgStats.compressedSize)})
                      </span>
                    </div>
                    <span className="bg-emerald-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md">
                      -{heroBgStats.savingsPercent}% SEO
                    </span>
                  </div>
                )}

                {/* Presets de fondos para consultorio / clínica / femenina */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold w-full">Fondos recomendados:</span>
                  {[
                    { label: "🏥 Clínica Moderna", url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1600&auto=format&fit=crop" },
                    { label: "🩺 Consultorio Premium", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop" },
                    { label: "🌸 Estética & Spa Médico", url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1600&auto=format&fit=crop" },
                    { label: "🌿 Pediatría & Maternidad", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1600&auto=format&fit=crop" },
                    { label: "🔬 Área Médica Tech", url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1600&auto=format&fit=crop" },
                    { label: "🏨 Hospital Vanguardia", url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1600&auto=format&fit=crop" }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        applyFields({
                          tipoFondoHero: "imagen",
                          imagenFondoHero: preset.url
                        });
                      }}
                      className="text-[10px] px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY Y OPACIDAD DE CONTRASTE (40% A 90% CON OVERLAY OSCURO Y CLARO) */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  Capa de Contraste Overlay ({Math.round((data.overlayOscuroHero ?? 0.8) * 100)}%)
                </span>
                <p className="text-[10px] text-slate-500">Garantiza máxima legibilidad del texto e íconos sobre cualquier fondo.</p>
              </div>
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {Math.round((data.overlayOscuroHero ?? 0.8) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* TIPO DE OVERLAY: OSCURO / CLARO */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">Tipo de Overlay:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateField("tipoOverlayHero", "oscuro")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    (data.tipoOverlayHero || "oscuro") === "oscuro"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>🌙 Overlay Oscuro</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField("tipoOverlayHero", "claro")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    data.tipoOverlayHero === "claro"
                      ? "bg-white text-slate-900 border-blue-500 ring-2 ring-blue-500/30 shadow-sm font-extrabold"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>☀️ Overlay Claro</span>
                </button>
              </div>
            </div>

            {/* OPACIDAD SLIDER (40% A 90%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Opacidad de Contraste:</span>
                <span className="text-[10px] text-slate-500 font-mono font-bold">Rango 40% - 90%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="0.9"
                step="0.05"
                value={data.overlayOscuroHero ?? 0.8}
                onChange={(e) => updateField("overlayOscuroHero", parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between items-center gap-1 pt-1 overflow-x-auto scrollbar-none">
                {[
                  { label: "40%", val: 0.4 },
                  { label: "50%", val: 0.5 },
                  { label: "60%", val: 0.6 },
                  { label: "70%", val: 0.7 },
                  { label: "80% (Rec.)", val: 0.8 },
                  { label: "90%", val: 0.9 }
                ].map((ov) => (
                  <button
                    key={ov.val}
                    type="button"
                    onClick={() => updateField("overlayOscuroHero", ov.val)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      Math.abs((data.overlayOscuroHero ?? 0.8) - ov.val) < 0.02
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {ov.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* 3. BOTONES DE ACCIÓN (CTA) & ORGANIZADOR DE SECCIONES */}
      {showSecciones && (
      <>
      {/* 3.1 ESTILO DE BOTÓN DE ACCIÓN (CTA) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <MousePointerClick className="w-4 h-4 text-emerald-600" />
          Estilo del Botón de Llamado a la Acción (CTA)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { 
              id: "flotante", 
              label: "Burbuja Flotante 3D", 
              desc: "Navegación ergonómica móvil con iconos 3D táctiles y cápsulas de alto relieve.",
              renderPreview: () => (
                <div className="mt-2.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-around gap-1 w-full shadow-inner">
                  <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-[0_2px_5px_rgba(59,130,246,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] border-t border-white/50">
                    <IconHome3D className="w-4 h-4" />
                  </div>
                  <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-indigo-400 via-indigo-500 to-indigo-600 flex items-center justify-center shadow-[0_2px_5px_rgba(99,102,241,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] border-t border-white/50">
                    <IconDoctor3D className="w-4 h-4" />
                  </div>
                  <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center shadow-[0_2px_5px_rgba(20,184,166,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] border-t border-white/50">
                    <IconServices3D className="w-4 h-4" />
                  </div>
                  <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center shadow-[0_2px_5px_rgba(245,158,11,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] border-t border-white/60">
                    <IconReviews3D className="w-4 h-4" />
                  </div>
                  <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_2px_5px_rgba(16,185,129,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] border-t border-white/60 ring-1 ring-emerald-300">
                    <IconAppointment3D className="w-4 h-4" />
                  </div>
                </div>
              )
            },
            { 
              id: "estatico_pulso", 
              label: "Botón con Pulso 3D", 
              desc: "Botón 3D táctil con pulso continuo y calendario tridimensional en relieve.",
              renderPreview: () => (
                <div className="mt-2.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center w-full">
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-700 text-white text-[10px] font-black flex items-center gap-1.5 shadow-[0_4px_10px_rgba(16,185,129,0.6),inset_0_1.5px_1px_rgba(255,255,255,0.7),inset_0_-2px_2px_rgba(0,0,0,0.3)] border-t border-white/40 ring-2 ring-emerald-400/50 animate-pulse">
                    <IconAppointment3D className="w-3.5 h-3.5 shrink-0" />
                    <span>Confirmar Cita</span>
                  </div>
                </div>
              )
            },
            { 
              id: "barra_fija_dual", 
              label: "Barra Fija Dual 3D", 
              desc: "Barra inferior: Botón 3D WhatsApp esmeralda 'AGENDAR CITA' y botón 'Reseñas' oro 3D.",
              renderPreview: () => (
                <div className="mt-2.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-1.5 w-full">
                  <div className="flex-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white rounded-xl py-1 px-1.5 text-[9px] font-black flex items-center justify-center gap-1 shadow-[0_3px_8px_rgba(16,185,129,0.5),inset_0_1px_1px_rgba(255,255,255,0.6)] border-t border-white/40 truncate">
                    <IconWhatsapp3D className="w-3.5 h-3.5 shrink-0" />
                    <span>AGENDAR CITA</span>
                  </div>
                  <div className="flex-1 bg-gradient-to-b from-white via-slate-100 to-slate-200 text-slate-900 border border-slate-300 rounded-xl py-1 px-1.5 text-[9px] font-extrabold flex items-center justify-center gap-1 shadow-[0_2px_6px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] border-t border-white truncate">
                    <IconReviews3D className="w-3.5 h-3.5 shrink-0" />
                    <span>Reseñas</span>
                  </div>
                </div>
              )
            },
          ].map((cta) => {
            const isSelected = (data.estiloCta || "flotante") === cta.id;
            return (
              <button
                key={cta.id}
                type="button"
                id={`cta-style-${cta.id}`}
                onClick={() => {
                  onChange({
                    ...data,
                    estiloCta: cta.id as CtaStyleType
                  });
                }}
                className={`flex flex-col text-left p-3.5 rounded-xl border bg-white transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm"
                    : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold text-slate-900">{cta.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{cta.desc}</p>
                {cta.renderPreview()}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ORDEN Y VISIBILIDAD DE SECCIONES (LAYOUT DINÁMICO) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              Organizador y Visibilidad de Secciones
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reordena o activa/desactiva secciones completas de la landing page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetSectionOrder}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Restablecer orden predeterminado"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>
        </div>

        {/* CONTENEDOR DE PLANTILLAS RÁPIDAS DE DISPOSICIÓN */}
        <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200/80 space-y-2.5 my-3">
          <div className="flex items-center justify-between">
            <label htmlFor="quick-layout-preset-select" className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Plantillas Rápidas de Disposición (Quick Layout Presets):</span>
            </label>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md border border-purple-200">
              Prediseñados
            </span>
          </div>

          <select
            id="quick-layout-preset-select"
            onChange={(e) => {
              if (e.target.value) {
                applyLayoutPreset(e.target.value);
              }
            }}
            defaultValue=""
            className="w-full bg-white text-slate-900 text-xs font-extrabold px-3 py-2 rounded-lg border border-purple-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all cursor-pointer shadow-2xs"
          >
            <option value="" disabled>
              ⚡ Selecciona una Disposición Rápida de Secciones...
            </option>
            {LAYOUT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.badge}) — {p.description}
              </option>
            ))}
          </select>

          {/* Botones de Selección Rápida */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {LAYOUT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                id={`btn-preset-layout-${p.id}`}
                onClick={() => applyLayoutPreset(p.id)}
                className="px-2.5 py-1 bg-white hover:bg-purple-100/80 text-purple-900 text-[11px] font-extrabold rounded-md border border-purple-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                title={p.description}
              >
                <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                <span>{p.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          {currentSectionOrder.map((sec, idx) => {
            const isBeingDragged = draggedIndex === idx;
            const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

            return (
              <div
                key={sec.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none ${
                  isBeingDragged
                    ? "opacity-40 border-dashed border-purple-500 bg-purple-50/50"
                    : isDragOver
                    ? "border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-400/60"
                    : sec.visible
                    ? "bg-slate-50/80 border-slate-200/90 hover:bg-slate-100/70"
                    : "bg-slate-100/40 border-slate-200/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="text-slate-400 hover:text-purple-600 transition-colors shrink-0 p-0.5 cursor-grab active:cursor-grabbing" 
                    title="Arrastrar para reordenar esta sección"
                  >
                    <GripVertical className="w-4 h-4" />
                  </span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className={`text-xs font-bold truncate ${sec.visible ? "text-slate-800" : "text-slate-500 line-through"}`}>
                    {sec.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility(idx)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      sec.visible
                        ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        : "text-slate-400 bg-slate-200 hover:bg-slate-300"
                    }`}
                    title={sec.visible ? "Ocultar sección" : "Mostrar sección"}
                  >
                    {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    title="Subir posición"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(idx, "down")}
                    disabled={idx === currentSectionOrder.length - 1}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    title="Bajar posición"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
