/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  MedicalLandingData, 
  FAQItem, 
  ServiceItem, 
  ReviewItem, 
  BlogPostItem, 
  BeforeAfterCase,
  ECUADOR_CITIES,
  ECUADOR_ASEGURADORAS,
  ECUADOR_HOSPITALES,
  ECUADOR_ASOCIACIONES,
  EcuadorCityPreset
} from "../types";
import { 
  User, 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  Plus, 
  Trash2, 
  FileCode, 
  ShieldAlert, 
  Sparkles,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Stethoscope,
  Layers,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  HelpCircle,
  Mail,
  Share2,
  Phone,
  Building2,
  Award,
  ShieldCheck,
  Check,
  Star,
  ExternalLink,
  Globe,
  Key,
  CheckCircle2,
  Map,
  CreditCard,
  Banknote,
  DollarSign,
  Wallet,
  Upload,
  X,
  FileImage,
  Palette,
  Pipette,
  Clock,
  Code,
  Copy,
  Search,
  MessageCircle,
  Send,
  Layout,
  Type,
  Sliders
} from "lucide-react";
import { MedicalIconSelector } from "./MedicalIconSelector";
import { AiIngestionModal } from "./AiIngestionModal";
import { applyExtractedMedicalData } from "../utils/aiMerge";
import { PRESET_PALETTES, getActiveColorScale, generateScaleFromHex } from "../utils/colorUtils";
import { LANDING_STYLE_PRESETS, getActiveLandingStyle } from "../utils/stylePresets";
import { generateJsonLd } from "../utils/generators";
import { getLiveConsultationStatus } from "../utils/scheduleUtils";

interface FormPanelProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
}

type TabType = "identidad" | "seo" | "servicios" | "faqs" | "blog";

export default function FormPanel({ data, onChange }: FormPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("identidad");
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const updateField = (field: keyof MedicalLandingData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleApplyExtractedData = (newData: Partial<MedicalLandingData>, mergeMode: boolean) => {
    const merged = applyExtractedMedicalData(data, newData, mergeMode);
    onChange(merged);
  };

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
      const resData = await response.json();
      if (resData.success && resData.blogPosts) {
        updateField("blogPosts", resData.blogPosts);
      } else {
        setGenerationError(resData.error || "No se pudo generar el blog.");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError("Fallo de conexión con el generador de IA.");
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const updateNestedField = (parent: "horarios", field: string, value: any) => {
    onChange({
      ...data,
      [parent]: {
        ...data[parent],
        [field]: value
      }
    });
  };

  const handleArrayChange = (field: "aseguradoras" | "hospitalesdondeOpera" | "asociaciones", index: number, value: string) => {
    const newArr = [...data[field]];
    newArr[index] = value;
    updateField(field, newArr);
  };

  const addArrayItem = (field: "aseguradoras" | "hospitalesdondeOpera" | "asociaciones") => {
    updateField(field, [...data[field], ""]);
  };

  const removeArrayItem = (field: "aseguradoras" | "hospitalesdondeOpera" | "asociaciones", index: number) => {
    const newArr = data[field].filter((_, i) => i !== index);
    updateField(field, newArr);
  };

  const handleFaqChange = (index: number, field: keyof FAQItem, value: string) => {
    const newFaqs = [...(data.faqs || [])];
    newFaqs[index] = {
      ...newFaqs[index],
      [field]: value
    };
    updateField("faqs", newFaqs);
  };

  const addFaq = () => {
    const nextNum = (data.faqs || []).length + 1;
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      pregunta: `¿Cuál es el procedimiento y recuperación para una consulta de ${data.especialidad || "especialidad"}?`,
      respuesta: `Brindamos una valoración clínica personalizada, explicando detalladamente los pasos diagnósticos, alternativas de tratamiento y tiempos estimados para su recuperación.`
    };
    updateField("faqs", [...(data.faqs || []), newFaq]);
  };

  const removeFaq = (index: number) => {
    const newFaqs = (data.faqs || []).filter((_, i) => i !== index);
    updateField("faqs", newFaqs);
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    const faqs = [...(data.faqs || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;
    const temp = faqs[index];
    faqs[index] = faqs[targetIndex];
    faqs[targetIndex] = temp;
    updateField("faqs", faqs);
  };

  const resetDefaultFaqs = () => {
    const defaultFaqs: FAQItem[] = [
      {
        id: "faq-1",
        pregunta: "¿Qué incluye la primera consulta de valoración médica?",
        respuesta: "Historia clínica completa, exploración física detallada, diagnóstico presuntivo, revisión de estudios previos y diseño de un plan de tratamiento individualizado."
      },
      {
        id: "faq-2",
        pregunta: "¿Acepta seguros de gastos médicos mayores?",
        respuesta: "Sí, trabajamos mediante reembolso con todas las aseguradoras nacionales e internacionales y convenio directo según el hospital sede."
      },
      {
        id: "faq-3",
        pregunta: "¿Dónde se realizan los procedimientos y cirugías?",
        respuesta: `En quirófanos certificados de alta especialidad en ${data.hospitalesdondeOpera?.[0] || "Hospitales de Alta Especialidad"}, cumpliendo con los más estrictos estándares de seguridad y bioseguridad sanitaria.`
      }
    ];
    updateField("faqs", defaultFaqs);
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string) => {
    const newServices = [...(data.servicios || [])];
    newServices[index] = {
      ...newServices[index],
      [field]: value
    };
    updateField("servicios", newServices);
  };

  const addService = () => {
    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      titulo: `Procedimiento Especializado ${(data.servicios || []).length + 1}`,
      descripcion: "Descripción detallada del procedimiento o tratamiento especializado realizado bajo estrictos protocolos clínicos.",
      icono: "Stethoscope"
    };
    updateField("servicios", [...(data.servicios || []), newService]);
  };

  const removeService = (index: number) => {
    const newServices = (data.servicios || []).filter((_, i) => i !== index);
    updateField("servicios", newServices);
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
    const newReview: ReviewItem = {
      id: `resena-${Date.now()}`,
      paciente: "Paciente Verificado",
      estrellas: 5,
      comentario: "Excelente trato y atención profesional durante toda la consulta.",
      fecha: "Hace 1 semana"
    };
    updateField("resenas", [...(data.resenas || []), newReview]);
  };

  const removeReview = (index: number) => {
    const newReviews = (data.resenas || []).filter((_, i) => i !== index);
    updateField("resenas", newReviews);
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

  const tabs = [
    { id: "identidad", label: "Identidad & E-E-A-T", icon: User, color: "bg-blue-100 text-blue-700", activeText: "text-blue-600 border-blue-600" },
    { id: "seo", label: "Local SEO & GBP", icon: MapPin, color: "bg-emerald-100 text-emerald-700", activeText: "text-emerald-600 border-emerald-600" },
    { id: "servicios", label: "Servicios & Casos", icon: Briefcase, color: "bg-purple-100 text-purple-700", activeText: "text-purple-600 border-purple-600" },
    { id: "faqs", label: "FAQs & Opiniones", icon: MessageSquare, color: "bg-amber-100 text-amber-700", activeText: "text-amber-600 border-amber-600" },
    { id: "blog", label: "Blog Médico", icon: FileCode, color: "bg-rose-100 text-rose-700", activeText: "text-rose-600 border-rose-600" },
  ];

  return (
    <div id="form-panel-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* BANNER ASISTENTE INTELIGENTE CON IA */}
      <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-black text-white">
                Autocompletar con Inteligencia Artificial
              </h4>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-300/30">
                Gemini 3.7
              </span>
            </div>
            <p className="text-[11px] text-blue-100/90 leading-tight mt-0.5">
              Pega texto sin organizar (notas, WhatsApp, CV) o escanea el enlace web del médico para estructurar todos los campos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          className="px-3.5 py-2.5 bg-white hover:bg-blue-50 text-blue-950 rounded-xl font-extrabold text-xs shrink-0 shadow-md shadow-slate-950/20 transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5 border border-white/80"
          title="Abrir organizador de datos médicos con IA"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Escanear / Ingestar Datos</span>
          <span className="sm:hidden">Ingestar IA</span>
        </button>
      </div>

      {/* Selector de pestañas */}
      <div id="tabs-header-container" className="flex border-b border-slate-100 bg-slate-50/80 overflow-x-auto scrollbar-none p-1.5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${tab.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido del formulario */}
      <div id="form-content-area" className="p-6 overflow-y-auto flex-1 space-y-6 max-h-[calc(100vh-280px)] md:max-h-[700px]">
        {/* PESTAÑA 1: IDENTIDAD Y E-E-A-T */}
        {activeTab === "identidad" && (
          <div id="tab-identidad-content" className="space-y-6">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-md font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Datos Profesionales del Especialista
              </h3>
              <p className="text-xs text-slate-500 mt-1">Configura la identidad y credenciales médicas para robustecer la credibilidad (YMYL).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="nombreMedico">Nombre Completo del Médico</label>
                <input
                  id="nombreMedico"
                  type="text"
                  value={data.nombreMedico}
                  onChange={(e) => updateField("nombreMedico", e.target.value)}
                  placeholder="ej. Dr. Alejandro Ruiz"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="especialidad">Especialidad Principal</label>
                <input
                  id="especialidad"
                  type="text"
                  value={data.especialidad}
                  onChange={(e) => updateField("especialidad", e.target.value)}
                  placeholder="ej. Cardiólogo Pediatra"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="cedulaProfesional">Cédula Profesional</label>
                <input
                  id="cedulaProfesional"
                  type="text"
                  value={data.cedulaProfesional}
                  onChange={(e) => updateField("cedulaProfesional", e.target.value)}
                  placeholder="ej. 12345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="anosExperiencia">Años de Trayectoria</label>
                <input
                  id="anosExperiencia"
                  type="number"
                  value={data.anosExperiencia}
                  onChange={(e) => updateField("anosExperiencia", parseInt(e.target.value) || 0)}
                  placeholder="ej. 15"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="universidad">Universidad de Procedencia</label>
              <input
                id="universidad"
                type="text"
                value={data.universidad}
                onChange={(e) => updateField("universidad", e.target.value)}
                placeholder="ej. Universidad Nacional Autónoma de México"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
              />
            </div>

            {/* SECCIÓN LOGOTIPO DE LA CLÍNICA / ESPECIALISTA */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5" htmlFor="logoUrl">
                    <FileImage className="w-4 h-4 text-blue-600" />
                    Logotipo Oficial (Fondo Transparente)
                  </label>
                  <p className="text-[11px] text-slate-500">Se mostrará al inicio de la landing page arriba de la foto profesional (PNG o SVG sin fondo recomendado).</p>
                </div>
                {data.logoUrl && (
                  <button
                    type="button"
                    onClick={() => updateField("logoUrl", "")}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <X className="w-3 h-3" />
                    Quitar Logo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Previsualizador de Logotipo con cuadrícula de transparencia */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] bg-white min-h-[90px] relative overflow-hidden">
                  {data.logoUrl ? (
                    <img 
                      src={data.logoUrl} 
                      alt="Logo Especialista" 
                      className="max-h-16 max-w-full object-contain filter drop-shadow-xs" 
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 text-center">
                      <FileImage className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px] font-medium">Sin logotipo (Opcional)</span>
                    </div>
                  )}
                </div>

                {/* Controles de Subida / URL */}
                <div className="sm:col-span-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all">
                      <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Subir archivo (PNG / SVG)</span>
                      <input
                        type="file"
                        accept="image/png,image/svg+xml,image/webp,image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                updateField("logoUrl", event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    id="logoUrl"
                    type="text"
                    value={data.logoUrl || ""}
                    onChange={(e) => updateField("logoUrl", e.target.value)}
                    placeholder="O pega una URL: https://.../logo.png"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-slate-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN FOTO PROFESIONAL 1:1 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5" htmlFor="fotoUrl">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    Foto Profesional del Médico (Formato 1:1)
                  </label>
                  <p className="text-[11px] text-slate-500">Se mostrará en la cabecera principal con relación de aspecto cuadrada 1:1.</p>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Aspect Ratio 1:1
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Preview 1:1 de la foto */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-1 rounded-2xl border-2 border-slate-200 bg-slate-100 aspect-square w-24 sm:w-28 mx-auto overflow-hidden shadow-xs relative">
                  <img 
                    src={data.fotoUrl} 
                    alt={data.nombreMedico} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Subir o Enlazar URL */}
                <div className="sm:col-span-8 space-y-2">
                  <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all">
                    <Upload className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Subir nueva foto desde tu equipo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              updateField("fotoUrl", event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <input
                    id="fotoUrl"
                    type="text"
                    value={data.fotoUrl}
                    onChange={(e) => updateField("fotoUrl", e.target.value)}
                    placeholder="O pega una URL: https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-mono text-slate-600 bg-white"
                  />
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
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="filosofia">Propuesta de Valor / Filosofía</label>
              <textarea
                id="filosofia"
                rows={2}
                value={data.filosofia}
                onChange={(e) => updateField("filosofia", e.target.value)}
                placeholder="ej. Brindar atención médica cálida..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="biografiaCurta">Biografía Curricular Resumida</label>
              <textarea
                id="biografiaCurta"
                rows={3}
                value={data.biografiaCurta}
                onChange={(e) => updateField("biografiaCurta", e.target.value)}
                placeholder="Resumen curricular del especialista..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none"
              />
            </div>

            {/* SEÑALES E-E-A-T DE AUTORIDAD */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Aseguradoras y Medicina Prepagada en Ecuador (E-E-A-T)
                  </h4>
                  <p className="text-[10px] text-slate-500">Transmite confianza a pacientes ecuatorianos mostrando seguros médicos y convenios por reembolso.</p>
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("aseguradoras")}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>

              {/* Botones de inserción rápida de aseguradoras de Ecuador */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">Sugerencias rápidas de aseguradoras en Ecuador:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ECUADOR_ASEGURADORAS.map((aseg) => {
                    const exists = data.aseguradoras.includes(aseg);
                    return (
                      <button
                        key={aseg}
                        type="button"
                        onClick={() => {
                          if (!exists) {
                            onChange({
                              ...data,
                              aseguradoras: [...data.aseguradoras, aseg]
                            });
                          }
                        }}
                        disabled={exists}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                          exists 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default opacity-80" 
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {exists && <Check className="w-3 h-3 text-emerald-600" />}
                        {aseg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.aseguradoras.map((aseg, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aseg}
                      onChange={(e) => handleArrayChange("aseguradoras", idx, e.target.value)}
                      placeholder="Nombre Aseguradora"
                      aria-label={`Aseguradora número ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      aria-label={`Eliminar aseguradora ${idx + 1}`}
                      onClick={() => removeArrayItem("aseguradoras", idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* HOSPITALES */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Hospitales y Clínicas donde Opera en Ecuador
                  </h4>
                  <p className="text-[10px] text-slate-500">Centros hospitalarios y clínicas quirúrgicas en el Ecuador.</p>
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("hospitalesdondeOpera")}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>

              {/* Botones de inserción rápida de hospitales de Ecuador */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">Sugerencias rápidas de hospitales y clínicas en Ecuador:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ECUADOR_HOSPITALES.map((hosp) => {
                    const exists = data.hospitalesdondeOpera.includes(hosp);
                    return (
                      <button
                        key={hosp}
                        type="button"
                        onClick={() => {
                          if (!exists) {
                            onChange({
                              ...data,
                              hospitalesdondeOpera: [...data.hospitalesdondeOpera, hosp]
                            });
                          }
                        }}
                        disabled={exists}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                          exists 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default opacity-80" 
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {exists && <Check className="w-3 h-3 text-emerald-600" />}
                        {hosp}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {data.hospitalesdondeOpera.map((hosp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={hosp}
                      onChange={(e) => handleArrayChange("hospitalesdondeOpera", idx, e.target.value)}
                      placeholder="Hospital (ej. Hospital Metropolitano)"
                      aria-label={`Hospital de operación número ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      aria-label={`Eliminar hospital ${idx + 1}`}
                      onClick={() => removeArrayItem("hospitalesdondeOpera", idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ASOCIACIONES */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    Colegios Médicos, MSP & Avales en Ecuador
                  </h4>
                  <p className="text-[10px] text-slate-500">Federaciones, colegios provinciales y registro MSP / SENESCYT.</p>
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("asociaciones")}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>

              {/* Botones de inserción rápida de asociaciones de Ecuador */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">Sugerencias de colegios y avales de salud en Ecuador:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ECUADOR_ASOCIACIONES.map((asoc) => {
                    const exists = data.asociaciones.includes(asoc);
                    return (
                      <button
                        key={asoc}
                        type="button"
                        onClick={() => {
                          if (!exists) {
                            onChange({
                              ...data,
                              asociaciones: [...data.asociaciones, asoc]
                            });
                          }
                        }}
                        disabled={exists}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                          exists 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default opacity-80" 
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {exists && <Check className="w-3 h-3 text-emerald-600" />}
                        {asoc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {data.asociaciones.map((asoc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={asoc}
                      onChange={(e) => handleArrayChange("asociaciones", idx, e.target.value)}
                      placeholder="Asociación / Colegio (ej. Colegio de Médicos de Pichincha)"
                      aria-label={`Asociación médica número ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      aria-label={`Eliminar asociación ${idx + 1}`}
                      onClick={() => removeArrayItem("asociaciones", idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TARIFA DE CONSULTA Y MÉTODOS DE PAGO */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Valor de la Consulta & Métodos de Pago
                  </h4>
                  <p className="text-[10px] text-slate-500">Muestra transparencia en costos de consulta médica y opciones de pago aceptadas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="precioConsulta">
                    Valor de la Consulta Médica
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="precioConsulta"
                      type="text"
                      value={data.precioConsulta || ""}
                      onChange={(e) => updateField("precioConsulta", e.target.value)}
                      placeholder="ej. $50 USD"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["$40 USD", "$50 USD", "$60 USD", "$80 USD", "$100 USD"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateField("precioConsulta", preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                          data.precioConsulta === preset 
                            ? "bg-emerald-600 text-white" 
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Métodos de Pago Aceptados
                  </label>
                  <div className="space-y-2 pt-1">
                    {[
                      { key: "Efectivo", icon: Banknote, desc: "Pago presencial en dólares" },
                      { key: "Transferencia bancaria", icon: Building2, desc: "Bancos locales y DeUna" },
                      { key: "Tarjetas de crédito", icon: CreditCard, desc: "Visa, Mastercard, diferido" }
                    ].map((metodo) => {
                      const currentMetodos = data.metodosPago || ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"];
                      const isChecked = currentMetodos.includes(metodo.key);
                      const IconComponent = metodo.icon;
                      return (
                        <label
                          key={metodo.key}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                            isChecked 
                              ? "bg-emerald-50/60 border-emerald-300 text-emerald-950 font-bold" 
                              : "bg-slate-50/50 border-slate-200 text-slate-600 opacity-60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateField("metodosPago", [...currentMetodos, metodo.key]);
                              } else {
                                updateField("metodosPago", currentMetodos.filter((m) => m !== metodo.key));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <IconComponent className={`w-4 h-4 ${isChecked ? "text-emerald-600" : "text-slate-400"}`} />
                          <div className="flex flex-col">
                            <span className="text-xs">{metodo.key}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{metodo.desc}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ESTILO DE LANDING & ARQUITECTURA VISUAL (FUENTES, BORDES, ESPACIADOS) */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-600" />
                    Estilo de Landing Page (Fuentes, Bordes & Espaciados)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Aplica presets integrales de tipografía Google Fonts, curvatura de bordes, elevación y espaciados mediante variables CSS dinámicas (<code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">--landing-font-*</code>, <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">--landing-radius</code>, <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">--landing-section-py</code>).
                  </p>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  CSS Tokens Presets
                </span>
              </div>

              {/* Grid de Presets de Estilo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(LANDING_STYLE_PRESETS).map((preset) => {
                  const isSelected = (data.estiloLanding || "profesional") === preset.id;
                  return (
                    <button
                      key={preset.id}
                      id={`style-preset-${preset.id}`}
                      type="button"
                      onClick={() => updateField("estiloLanding", preset.id)}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 relative group overflow-hidden ${
                        isSelected
                          ? "border-indigo-600 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 ring-2 ring-indigo-500/20 shadow-md"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs"
                      }`}
                    >
                      {/* Cabecera del Preset con Badge y Check */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                              isSelected 
                                ? "bg-indigo-600 text-white" 
                                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : preset.name.charAt(0)}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">{preset.name}</span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                          isSelected 
                            ? "bg-indigo-100/80 text-indigo-800 border-indigo-300" 
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {preset.badge}
                        </span>
                      </div>

                      {/* Tagline y Descripción */}
                      <p className="text-[11px] font-semibold text-slate-700 mb-1 leading-snug">
                        {preset.tagline}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {preset.description}
                      </p>

                      {/* Mini Preview Box interactivo demostrando geometría y tipografía real */}
                      <div 
                        className="p-2.5 mb-3 border border-slate-200/90 transition-all text-left space-y-1"
                        style={{
                          borderRadius: preset.variables["--landing-radius"],
                          boxShadow: preset.variables["--landing-shadow"],
                          backgroundColor: preset.variables["--landing-card-bg"],
                          letterSpacing: preset.variables["--landing-letter-spacing"]
                        }}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span 
                            className="font-bold text-slate-900 truncate"
                            style={{ fontFamily: preset.fontDisplay }}
                          >
                            Dr. Especialista Médico
                          </span>
                          <span 
                            className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold border border-indigo-100"
                            style={{ borderRadius: preset.variables["--landing-badge-radius"] }}
                          >
                            {preset.sampleRadius}
                          </span>
                        </div>
                        <p 
                          className="text-[9px] text-slate-500 truncate"
                          style={{ fontFamily: preset.fontBody }}
                        >
                          Atención de primer nivel en salud • Consulta personalizada
                        </p>
                      </div>

                      {/* Fichas de Tokens Visuales */}
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-0.5">
                            <Type className="w-2.5 h-2.5 text-indigo-500" /> Fuente
                          </span>
                          <span className="font-semibold truncate text-slate-800" title={preset.fontDisplayName}>
                            {preset.fontDisplayName}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-0.5">
                            <Sliders className="w-2.5 h-2.5 text-indigo-500" /> Curvatura
                          </span>
                          <span className="font-semibold truncate text-slate-800">
                            {preset.sampleRadius}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-0.5">
                            <Layout className="w-2.5 h-2.5 text-indigo-500" /> Espaciado
                          </span>
                          <span className="font-semibold truncate text-slate-800">
                            {preset.sampleSpacing}
                          </span>
                        </div>
                      </div>

                      {/* Especialidades Recomendadas */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center gap-1.5 text-[9px] text-slate-500">
                        <span className="font-bold text-slate-700 shrink-0">Ideal para:</span>
                        <span className="truncate italic">{preset.specialtyFit}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Inspector de Tokens CSS Dinámicos del Preset Activo */}
              {(() => {
                const activePreset = getActiveLandingStyle(data.estiloLanding);
                return (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 shadow-md space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-indigo-400" />
                        Tokens CSS del Estilo Activo: <span className="text-white">{activePreset.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        Inyección Automática en HTML
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[10px] bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 block text-[9px]">--landing-font-display:</span>
                        <span className="text-indigo-300 font-bold truncate block">{activePreset.variables["--landing-font-display"].split(",")[0]}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">--landing-radius:</span>
                        <span className="text-amber-300 font-bold block">{activePreset.variables["--landing-radius"]} (lg: {activePreset.variables["--landing-radius-lg"]})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">--landing-section-py:</span>
                        <span className="text-cyan-300 font-bold block">{activePreset.variables["--landing-section-py"]}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">--landing-shadow:</span>
                        <span className="text-emerald-300 font-bold truncate block">{activePreset.variables["--landing-shadow"].slice(0, 22)}...</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* IDENTIDAD VISUAL & COLOR PRINCIPAL DE MARCA */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600" />
                    Color Principal de Marca & Variables CSS
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Define el color corporativo del médico o clínica. Modifica dinámicamente las variables CSS <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-700">--clinical-50</code> a <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-700">--clinical-900</code> en la landing page y el código exportado.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Variables CSS Dinámicas
                </span>
              </div>

              {/* Grid de Paletas Predefinidas por Especialidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {Object.values(PRESET_PALETTES).map((p) => {
                  const isSelected = data.paletaColor === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onChange({
                          ...data,
                          paletaColor: p.id as any,
                          colorPrimarioHex: p.primaryHex
                        });
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <span 
                          className="w-7 h-7 rounded-full flex items-center justify-center shadow-xs border-2 border-white"
                          style={{ backgroundColor: p.primaryHex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-medium">{p.primaryHex}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">{p.specialties}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Opción de Color Personalizado */}
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...data,
                      paletaColor: "personalizado",
                      colorPrimarioHex: data.colorPrimarioHex || "#1e6fd9"
                    });
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                    data.paletaColor === "personalizado"
                      ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80"
                  }`}
                >
                  <div className="relative shrink-0">
                    <span 
                      className="w-7 h-7 rounded-full flex items-center justify-center shadow-xs border-2 border-white bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-500"
                    >
                      {data.paletaColor === "personalizado" ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Pipette className="w-3.5 h-3.5 text-white" />
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">Color Personalizado</span>
                      <span className="text-[10px] font-mono text-blue-600 font-bold">HEX / Picker</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">Elige cualquier código HEX de marca</span>
                  </div>
                </button>
              </div>

              {/* Selector Detallado de Color Personalizado con Color Picker */}
              {data.paletaColor === "personalizado" && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5" htmlFor="customColorPicker">
                      <Pipette className="w-4 h-4 text-blue-600" />
                      Selector de Color HEX de Marca
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Auto-genera escala de 8 tonalidades</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Native Color Picker Circle */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <label className="relative cursor-pointer group shrink-0">
                        <input
                          id="customColorPicker"
                          type="color"
                          value={data.colorPrimarioHex?.startsWith("#") ? data.colorPrimarioHex : "#1e6fd9"}
                          onChange={(e) => updateField("colorPrimarioHex", e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <div 
                          className="w-11 h-11 rounded-2xl border-2 border-white shadow-md flex items-center justify-center group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: data.colorPrimarioHex || "#1e6fd9" }}
                        >
                          <Pipette className="w-4 h-4 text-white drop-shadow-sm" />
                        </div>
                      </label>
                      
                      {/* Input de texto HEX */}
                      <div className="relative flex-1 sm:w-48">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-sm font-bold">#</span>
                        <input
                          type="text"
                          value={(data.colorPrimarioHex || "#1e6fd9").replace("#", "")}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                            updateField("colorPrimarioHex", `#${val}`);
                          }}
                          placeholder="1e6fd9"
                          maxLength={6}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Presets Rápidos */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Rápidos:</span>
                      {[
                        { hex: "#0284c7", label: "Sky" },
                        { hex: "#059669", label: "Emerald" },
                        { hex: "#0d9488", label: "Teal" },
                        { hex: "#7c3aed", label: "Violet" },
                        { hex: "#e11d48", label: "Rose" },
                        { hex: "#d97706", label: "Amber" },
                        { hex: "#0f766e", label: "Pine" },
                        { hex: "#1e3a8a", label: "Navy" }
                      ].map((item) => (
                        <button
                          key={item.hex}
                          type="button"
                          onClick={() => updateField("colorPrimarioHex", item.hex)}
                          className="w-6 h-6 rounded-lg border border-white shadow-2xs hover:scale-110 transition-transform"
                          style={{ backgroundColor: item.hex }}
                          title={`${item.label} (${item.hex})`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Visualizador de Escala Tonal y Variables CSS Generadas */}
              {(() => {
                const activeScale = getActiveColorScale(data.paletaColor, data.colorPrimarioHex);
                return (
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-[11px] font-extrabold uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Escala Tonal de Variables CSS Aplicadas
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">8 Tonalidades Armónicas</span>
                    </div>

                    {/* Barra de tonalidades */}
                    <div className="grid grid-cols-8 gap-1.5 rounded-xl overflow-hidden p-1 bg-slate-50 border border-slate-100">
                      {(["50", "100", "200", "500", "600", "700", "800", "900"] as const).map((shade) => (
                        <div key={shade} className="flex flex-col items-center gap-1">
                          <div 
                            className="w-full h-8 rounded-lg border border-black/5 shadow-2xs transition-transform hover:scale-105"
                            style={{ backgroundColor: activeScale[shade] }}
                          />
                          <span className="text-[9px] font-extrabold text-slate-600">{shade}</span>
                          <span className="text-[8px] font-mono text-slate-400 hidden sm:block truncate">{activeScale[shade]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: LOCAL SEO & GBP */}
        {activeTab === "seo" && (
          <div id="tab-seo-content" className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  SEO Local & Posicionamiento en Ecuador
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Exclusivo Ecuador 🇪🇨
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Optimiza la indexación en Google Maps y Google Search para pacientes locales en las principales ciudades y provincias del Ecuador.
              </p>
            </div>

            {/* SELECTOR RÁPIDO DE CIUDADES DE ECUADOR */}
            <div className="p-4 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Seleccionar Ciudad / Cantón del Ecuador (Auto-completar NAP y Geo)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Haz clic en la ciudad donde atiende tu médico para autocompletar coordenadas, provincia y código postal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                {ECUADOR_CITIES.map((c) => {
                  const isSelected = data.ciudad.toLowerCase() === c.ciudad.toLowerCase();
                  return (
                    <button
                      key={c.ciudad}
                      type="button"
                      onClick={() => {
                        onChange({
                          ...data,
                          ciudad: c.ciudad,
                          estadoRegion: c.provincia,
                          codigoPostal: c.codigoPostal,
                          latitud: c.latitud,
                          longitud: c.longitud,
                          pais: "Ecuador",
                          direccionFisica: data.direccionFisica.includes("{{") || data.direccionFisica.includes("Av. Mariana") 
                            ? c.ejemploDireccion 
                            : data.direccionFisica
                        });
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200 font-bold"
                          : "bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px]">{c.ciudad}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                        {c.provincia}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="nombreClinicaGBP">Nombre de la Clínica en GBP (NAP)</label>
              <input
                id="nombreClinicaGBP"
                type="text"
                value={data.nombreClinicaGBP}
                onChange={(e) => updateField("nombreClinicaGBP", e.target.value)}
                placeholder="ej. Centro Médico Especializado Quito"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="direccionFisica">Dirección Física Detallada en Ecuador (NAP)</label>
              <input
                id="direccionFisica"
                type="text"
                value={data.direccionFisica}
                onChange={(e) => updateField("direccionFisica", e.target.value)}
                placeholder="ej. Av. Mariana de Jesús y Calle Nicolás Arteta, Edificio Meditrópoli, Piso 4"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="ciudad">Ciudad</label>
                <input
                  id="ciudad"
                  type="text"
                  value={data.ciudad}
                  onChange={(e) => updateField("ciudad", e.target.value)}
                  placeholder="ej. Quito"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="estadoRegion">Provincia</label>
                <input
                  id="estadoRegion"
                  type="text"
                  value={data.estadoRegion}
                  onChange={(e) => updateField("estadoRegion", e.target.value)}
                  placeholder="ej. Pichincha"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="codigoPostal">Código Postal</label>
                <input
                  id="codigoPostal"
                  type="text"
                  value={data.codigoPostal}
                  onChange={(e) => updateField("codigoPostal", e.target.value)}
                  placeholder="ej. 170504"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="pais">País</label>
                <input
                  id="pais"
                  type="text"
                  value={data.pais}
                  onChange={(e) => updateField("pais", e.target.value)}
                  placeholder="Ecuador"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 font-bold text-blue-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="latitud">Latitud Geográfica (Google Maps)</label>
                <input
                  id="latitud"
                  type="text"
                  value={data.latitud}
                  onChange={(e) => updateField("latitud", e.target.value)}
                  placeholder="ej. -0.1807"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="longitud">Longitud Geográfica (Google Maps)</label>
                <input
                  id="longitud"
                  type="text"
                  value={data.longitud}
                  onChange={(e) => updateField("longitud", e.target.value)}
                  placeholder="ej. -78.4678"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* REDES SOCIALES & CONTACTO DIRECTO */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  Redes Sociales y Canales de Contacto Directo en Ecuador
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Se posicionarán de primero al inicio de la landing page para que los pacientes ecuatorianos conecten al instante.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Teléfono */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5" htmlFor="telefonoGBP">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> Teléfono Clínico Ecuador (NAP)
                  </label>
                  <input
                    id="telefonoGBP"
                    type="text"
                    value={data.telefonoGBP}
                    onChange={(e) => updateField("telefonoGBP", e.target.value)}
                    placeholder="ej. +593 99 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5" htmlFor="whatsappUrl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Enlace / Número de WhatsApp (+593 Ecuador)
                  </label>
                  <input
                    id="whatsappUrl"
                    type="text"
                    value={data.whatsappUrl}
                    onChange={(e) => updateField("whatsappUrl", e.target.value)}
                    placeholder="https://wa.me/593991234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/20 text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* EDITOR DE PLANTILLA DE MENSAJE DE WHATSAPP */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border border-emerald-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        Mensaje de Bienvenida Personalizado para WhatsApp
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Define el texto exacto con el que el paciente inicia la conversación al agendar desde la landing page.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> Variables Dinámicas
                  </span>
                </div>

                {/* BOTONES DE INSERCIÓN RÁPIDA DE VARIABLES DINÁMICAS */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      Insertar Variables con 1 Clic (se reemplazan automáticamente):
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Haz clic para agregar al texto</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { tag: "{{medico}}", label: "👨‍⚕️ Médico", desc: data.nombreMedico || "Dr(a)." },
                      { tag: "{{especialidad}}", label: "🩺 Especialidad", desc: data.especialidad || "Especialidad" },
                      { tag: "{{ciudad}}", label: "📍 Ciudad", desc: data.ciudad || "Ecuador" },
                      { tag: "{{clinica}}", label: "🏥 Clínica", desc: data.nombreClinicaGBP || "Consultorio" },
                      { tag: "{{fecha}}", label: "📅 Fecha elegida", desc: "Fecha de cita" },
                      { tag: "{{hora}}", label: "⏰ Horario elegido", desc: "Hora de cita" },
                      { tag: "{{nombre}}", label: "👤 Nombre paciente", desc: "Nombre del paciente" }
                    ].map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => {
                          const current = data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.";
                          updateField("whatsappMensajePlantilla", `${current} ${item.tag}`);
                        }}
                        title={`Inserta ${item.tag} (${item.desc})`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer active:scale-95"
                      >
                        <span className="font-mono text-[10px] text-emerald-600">{item.tag}</span>
                        <span className="text-slate-500 font-medium text-[10px]">({item.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TEXTAREA PRINCIPAL DE EDICIÓN DE PLANTILLA */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="whatsappMensajePlantilla" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      Plantilla del Mensaje
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        updateField(
                          "whatsappMensajePlantilla",
                          "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad."
                        );
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restablecer por defecto
                    </button>
                  </div>

                  <textarea
                    id="whatsappMensajePlantilla"
                    rows={3}
                    value={data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad."}
                    onChange={(e) => updateField("whatsappMensajePlantilla", e.target.value)}
                    placeholder="Escribe aquí la plantilla del mensaje de WhatsApp..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed transition-all shadow-2xs"
                  />
                </div>

                {/* PLANTILLAS RÁPIDAS PREDISEÑADAS */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                    Plantillas Médicas Sugeridas:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateField(
                          "whatsappMensajePlantilla",
                          "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad."
                        );
                      }}
                      className="text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all text-xs group cursor-pointer shadow-2xs"
                    >
                      <div className="font-extrabold text-slate-800 group-hover:text-emerald-800 flex items-center justify-between">
                        <span>🩺 Estándar Cita Médica</span>
                        <Send className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        "Hola Dr(a). &#123;&#123;medico&#125;&#125;, deseo agendar una consulta médica de &#123;&#123;especialidad&#125;&#125; para el día &#123;&#123;fecha&#125;&#125; a las &#123;&#123;hora&#125;&#125;..."
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateField(
                          "whatsappMensajePlantilla",
                          "Estimado(a) Dr(a). {{medico}}, me gustaría coordinar una primera consulta de valoración de {{especialidad}} en {{ciudad}} para el {{fecha}} a las {{hora}}.{{nombre}}"
                        );
                      }}
                      className="text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all text-xs group cursor-pointer shadow-2xs"
                    >
                      <div className="font-extrabold text-slate-800 group-hover:text-emerald-800 flex items-center justify-between">
                        <span>🏥 Valoración Inicial</span>
                        <Send className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        "Estimado(a) Dr(a). &#123;&#123;medico&#125;&#125;, me gustaría coordinar una primera consulta de valoración en &#123;&#123;ciudad&#125;&#125;..."
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateField(
                          "whatsappMensajePlantilla",
                          "Hola Dr(a). {{medico}}, requiero agendar una cita prioritaria de {{especialidad}} para el {{fecha}} a las {{hora}}.{{nombre}} Muchas gracias."
                        );
                      }}
                      className="text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all text-xs group cursor-pointer shadow-2xs"
                    >
                      <div className="font-extrabold text-slate-800 group-hover:text-emerald-800 flex items-center justify-between">
                        <span>⚡ Cita Prioritaria</span>
                        <Send className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        "Hola Dr(a). &#123;&#123;medico&#125;&#125;, requiero agendar una cita prioritaria de &#123;&#123;especialidad&#125;&#125;..."
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateField(
                          "whatsappMensajePlantilla",
                          "Hola Dr(a). {{medico}}, quisiera información sobre la consulta de {{especialidad}} en {{clinica}} y agendar para el {{fecha}} a las {{hora}}.{{nombre}}"
                        );
                      }}
                      className="text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all text-xs group cursor-pointer shadow-2xs"
                    >
                      <div className="font-extrabold text-slate-800 group-hover:text-emerald-800 flex items-center justify-between">
                        <span>💬 Información & Consulta</span>
                        <Send className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        "Hola Dr(a). &#123;&#123;medico&#125;&#125;, quisiera información sobre la consulta en &#123;&#123;clinica&#125;&#125;..."
                      </p>
                    </button>
                  </div>
                </div>

                {/* SIMULADOR EN VIVO DEL MENSAJE DE WHATSAPP */}
                <div className="p-3.5 rounded-xl bg-[#e5ddd5] dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Vista Previa del Mensaje Renderizado para el Paciente:
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Simulación WhatsApp</span>
                  </div>

                  {/* Burbuja Verde de WhatsApp */}
                  {(() => {
                    const template = data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.";
                    const sampleDate = "martes, 18 de agosto de 2026";
                    const sampleTime = "10:30 AM";
                    const sampleName = " Mi nombre es María Gómez.";

                    let evaluated = template
                      .replace(/\{\{medico\}\}/gi, data.nombreMedico || "Dr. Especialista")
                      .replace(/\{\{especialidad\}\}/gi, data.especialidad || "Medicina")
                      .replace(/\{\{ciudad\}\}/gi, data.ciudad || "Quito")
                      .replace(/\{\{clinica\}\}/gi, data.nombreClinicaGBP || "Centro Médico")
                      .replace(/\{\{fecha\}\}/gi, sampleDate)
                      .replace(/\{\{hora\}\}/gi, sampleTime)
                      .replace(/\{\{nombre\}\}/gi, sampleName);

                    if (!template.includes("{{nombre}}") && !evaluated.includes(sampleName)) {
                      evaluated += sampleName;
                    }

                    return (
                      <div className="flex justify-end">
                        <div className="max-w-[90%] sm:max-w-[80%] p-3 rounded-2xl rounded-tr-xs bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 shadow-sm border border-emerald-200/50 space-y-1">
                          <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                            {evaluated}
                          </p>
                          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 dark:text-slate-300 font-medium">
                            <span>10:30 AM</span>
                            <span className="text-blue-500 font-bold">✓✓</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Facebook */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="facebookUrl">Facebook URL</label>
                  <input
                    id="facebookUrl"
                    type="text"
                    value={data.facebookUrl}
                    onChange={(e) => updateField("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/drmedicoecuador"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                {/* Instagram */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="instagramUrl">Instagram URL</label>
                  <input
                    id="instagramUrl"
                    type="text"
                    value={data.instagramUrl}
                    onChange={(e) => updateField("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/dr.medico.ecuador"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* TikTok */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="tiktokUrl">TikTok URL</label>
                  <input
                    id="tiktokUrl"
                    type="text"
                    value={data.tiktokUrl}
                    onChange={(e) => updateField("tiktokUrl", e.target.value)}
                    placeholder="https://tiktok.com/@drmedicoecuador"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                {/* Email de contacto */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="emailContacto">Correo Electrónico</label>
                  <input
                    id="emailContacto"
                    type="email"
                    value={data.emailContacto}
                    onChange={(e) => updateField("emailContacto", e.target.value)}
                    placeholder="contacto@consultoriomedico.ec"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Doctoralia / Directorios Médicos Ecuador */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="doctoraliaUrl">Doctoralia / Doctorisy Ecuador Profile URL</label>
                <input
                  id="doctoraliaUrl"
                  type="text"
                  value={data.doctoraliaUrl}
                  onChange={(e) => updateField("doctoraliaUrl", e.target.value)}
                  placeholder="https://www.doctoralia.com.ec/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* HORARIOS CONSULTA & ESTADO EN TIEMPO REAL */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Horarios de Atención Dinámicos & Indicador en Vivo
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Se calcula en tiempo real si el consultorio está "Atendiendo hoy", "Abierto ahora" o "Cerrado" para los pacientes.
                  </p>
                </div>

                {/* Badge Simulador de Estado en Vivo */}
                {(() => {
                  const live = getLiveConsultationStatus(data.horarios);
                  return (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-800 shrink-0 self-start sm:self-auto">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${live.dotColor === 'emerald' ? 'bg-emerald-400' : live.dotColor === 'amber' ? 'bg-amber-400' : 'bg-slate-400'} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${live.dotColor === 'emerald' ? 'bg-emerald-500' : live.dotColor === 'amber' ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
                      </span>
                      <span>{live.badgeText}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 text-[11px] font-medium">{live.badgeDetail}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Presets Rápidos de Horarios Médicos */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                  Plantillas Rápidas de Horarios Clínicos en Ecuador:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...data,
                        horarios: {
                          semana: "Lunes a Viernes: 09:00 - 18:00",
                          sabado: "Sábados: 09:00 - 13:00",
                          domingo: "Domingos: Cerrado"
                        }
                      });
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    🩺 Estándar Clínico (09:00 - 18:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...data,
                        horarios: {
                          semana: "Lunes a Viernes: 08:00 - 19:00",
                          sabado: "Sábados: 08:30 - 14:00",
                          domingo: "Domingos: Cerrado"
                        }
                      });
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    🏥 Jornada Continua (08:00 - 19:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...data,
                        horarios: {
                          semana: "Lunes a Viernes: 14:00 - 20:00",
                          sabado: "Sábados: 09:00 - 14:00",
                          domingo: "Domingos: Cerrado"
                        }
                      });
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    🌙 Horario Vespertino (14:00 - 20:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...data,
                        horarios: {
                          semana: "Lunes a Viernes: 09:00 - 17:00 (Previa Cita)",
                          sabado: "Sábados: 09:00 - 13:00 (Previa Cita)",
                          domingo: "Domingos: Cerrado"
                        }
                      });
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    📋 Con Cita Previa (09:00 - 17:00)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="horarioSemana">Lunes a Viernes</label>
                  <input
                    id="horarioSemana"
                    type="text"
                    value={data.horarios.semana}
                    onChange={(e) => updateNestedField("horarios", "semana", e.target.value)}
                    placeholder="Lunes a Viernes: 09:00 - 18:00"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="horarioSabado">Sábados</label>
                  <input
                    id="horarioSabado"
                    type="text"
                    value={data.horarios.sabado}
                    onChange={(e) => updateNestedField("horarios", "sabado", e.target.value)}
                    placeholder="Sábados: 09:00 - 13:00"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="horarioDomingo">Domingos</label>
                  <input
                    id="horarioDomingo"
                    type="text"
                    value={data.horarios.domingo}
                    onChange={(e) => updateNestedField("horarios", "domingo", e.target.value)}
                    placeholder="Domingos: Cerrado"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN: GENERADOR DE SCHEMA MEDICALBUSINESS ESTRUCTURADO & SIMULADOR GOOGLE */}
            <div className="border-t border-slate-100 pt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-600" />
                    Schema MedicalBusiness Estructurado (JSON-LD para Google)
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Google Search Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Este marcado multicapa Schema.org le informa a Google tus estrellas de calificación, dirección exacta en Ecuador y horarios de atención para posicionarte en los primeros resultados locales.
                </p>
              </div>

              {/* LOS 3 PILARES DEL MARCADO ESTRUCTURADO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Pilar 1: Estrellas de Calificación */}
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>1. Estrellas Google</span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-snug">
                    Calificación <strong>{data.googleReviewsRating || 4.9} / 5.0</strong> basada en <strong>{data.googleReviewsTotalCount || 148} opiniones</strong> mediante <code className="font-mono text-[10px] bg-amber-100/80 px-1 rounded">aggregateRating</code>.
                  </p>
                </div>

                {/* Pilar 2: Dirección y Coordenadas */}
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-xs">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>2. Dirección Ecuador</span>
                  </div>
                  <p className="text-[11px] text-blue-900/80 leading-snug">
                    Dirección física en <strong>{data.ciudad || "Quito"}</strong> con geolocalización <code className="font-mono text-[10px] bg-blue-100/80 px-1 rounded">GeoCoordinates</code> y NAP telefónico.
                  </p>
                </div>

                {/* Pilar 3: Horarios de Atención */}
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>3. Horarios ISO</span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-snug">
                    Días y horas de consulta mapeados a <code className="font-mono text-[10px] bg-emerald-100/80 px-1 rounded">openingHoursSpecification</code> para mostrar estado "Abierto hoy".
                  </p>
                </div>
              </div>

              {/* SIMULADOR DE RESULTADO ENRIQUECIDO EN GOOGLE (GOOGLE RICH SNIPPET PREVIEW) */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    Previsualización en Google Search (SERP Rich Snippet)
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Google Mobile / Desktop</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                  {/* URL / Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">G</div>
                    <span className="font-medium text-slate-700">https://www.doctores.ec</span>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-500">{data.ciudad.toLowerCase() || "quito"}</span>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-500">{data.especialidad.toLowerCase().replace(/\s+/g, '-')}</span>
                  </div>

                  {/* Meta Título Google */}
                  <h5 className="text-base sm:text-lg font-medium text-blue-800 hover:underline cursor-pointer leading-tight">
                    {data.metaTitulo || `${data.nombreMedico} | Especialista en ${data.especialidad} en ${data.ciudad}`}
                  </h5>

                  {/* Estrellas de Calificación Enriquecida */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
                    <div className="flex text-amber-500 text-xs">
                      {"★★★★★"}
                    </div>
                    <span className="font-bold text-slate-900">{data.googleReviewsRating || 4.9}</span>
                    <span className="text-slate-500">({data.googleReviewsTotalCount || 148} opiniones)</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Abierto hoy ⋅ Cierra a las {data.horarios.semana.match(/\d{1,2}:\d{2}/g)?.[1] || "18:00"}
                    </span>
                  </div>

                  {/* Dirección y Teléfono */}
                  <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                    <span className="text-slate-700 font-medium">📍 {data.direccionFisica}, {data.ciudad}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700 font-medium">📞 {data.telefonoGBP}</span>
                  </div>

                  {/* Meta Descripción */}
                  <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                    {data.metaDescripcion || `${data.filosofia} Consulta con el Dr. ${data.nombreMedico}, especialista en ${data.especialidad} en ${data.ciudad}, Ecuador. Horarios: ${data.horarios.semana}.`}
                  </p>
                </div>
              </div>

              {/* VISOR DE CÓDIGO JSON-LD & BOTÓN DE COPIAR */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-mono text-slate-300 font-bold">application/ld+json (Schema Graph)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const jsonLdContent = generateJsonLd(data);
                        navigator.clipboard.writeText(jsonLdContent);
                        setCopiedSchema(true);
                        setTimeout(() => setCopiedSchema(false), 2500);
                      }}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      {copiedSchema ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>¡Schema Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Marcado Schema</span>
                        </>
                      )}
                    </button>

                    <a
                      href="https://search.google.com/test/rich-results"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                      title="Probar Schema en Google Rich Results Test"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Rich Results Test</span>
                    </a>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400/90 leading-relaxed scrollbar-thin">
                  <pre className="whitespace-pre-wrap">{generateJsonLd(data)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: SERVICIOS Y CASOS */}
        {activeTab === "servicios" && (
          <div id="tab-servicios-content" className="space-y-8">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-md font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Catálogo de Procedimientos & Casos Clínicos
              </h3>
              <p className="text-xs text-slate-500 mt-1">Configura el catálogo completo de tratamientos y la galería de casos clínicos comparativos con sliders interactivos de antes y después.</p>
            </div>

            {/* SECCIÓN 1: SERVICIOS Y TRATAMIENTOS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Procedimientos y Tratamientos</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      {(data.servicios || []).length} { (data.servicios || []).length === 1 ? "servicio" : "servicios" }
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Procedimientos detallados que se mostrarán en la landing page y en el marcado Schema.org.</p>
                </div>
                <button
                  type="button"
                  id="btn-add-service"
                  onClick={addService}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
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
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-white border border-slate-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear primer servicio
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.servicios.map((srv, idx) => (
                    <div key={srv.id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <p className="text-[11px] font-extrabold text-slate-800 uppercase">Servicio #{idx + 1}</p>
                        </div>
                        <button
                          type="button"
                          id={`btn-remove-service-${idx}`}
                          onClick={() => removeService(idx)}
                          title="Eliminar servicio"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`srv-titulo-${idx}`}>Título del Tratamiento / Consulta</label>
                          <input
                            id={`srv-titulo-${idx}`}
                            type="text"
                            value={srv.titulo}
                            onChange={(e) => handleServiceChange(idx, "titulo", e.target.value)}
                            placeholder="ej. Consulta de Valoración Integral"
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`srv-icono-${idx}`}>Icono Médico Predefinido</label>
                          <MedicalIconSelector
                            id={`srv-icono-${idx}`}
                            value={srv.icono}
                            onChange={(newIcon) => handleServiceChange(idx, "icono", newIcon)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`srv-desc-${idx}`}>Descripción Médica del Procedimiento</label>
                        <textarea
                          id={`srv-desc-${idx}`}
                          rows={2}
                          value={srv.descripcion}
                          onChange={(e) => handleServiceChange(idx, "descripcion", e.target.value)}
                          placeholder="Explica en qué consiste el procedimiento, su técnica y beneficios para el paciente..."
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: CASOS CLÍNICOS COMPARATIVOS (ANTES Y DESPUÉS) */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Casos Clínicos con Sliders Antes / Después</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {(data.casosAntesDespues || []).length} { (data.casosAntesDespues || []).length === 1 ? "caso" : "casos" }
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Cada caso genera un slider interactivo independiente en la landing page y en la vista previa.</p>
                </div>
                <button
                  type="button"
                  id="btn-add-caso"
                  onClick={addCase}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
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
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-white border border-slate-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg shadow-sm"
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
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <p className="text-[11px] font-extrabold text-slate-800 uppercase">Caso Clínico #{idx + 1}</p>
                        </div>
                        <button
                          type="button"
                          id={`btn-remove-caso-${idx}`}
                          onClick={() => removeCase(idx)}
                          title="Eliminar caso clínico"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`caso-titulo-${idx}`}>Título del Caso de Éxito</label>
                        <input
                          id={`caso-titulo-${idx}`}
                          type="text"
                          value={caso.titulo}
                          onChange={(e) => handleCaseChange(idx, "titulo", e.target.value)}
                          placeholder="ej. Rinoplastia Ultrasónica & Corrección Septal"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`caso-desc-${idx}`}>Descripción Clínica y Evolución</label>
                        <textarea
                          id={`caso-desc-${idx}`}
                          rows={2}
                          value={caso.descripcion}
                          onChange={(e) => handleCaseChange(idx, "descripcion", e.target.value)}
                          placeholder="Diagnóstico inicial del paciente, tratamiento aplicado y resultados cuantificados a las semanas/meses..."
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`caso-before-${idx}`}>Foto Estado ANTES (URL)</label>
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Antes</span>
                          </div>
                          <input
                            id={`caso-before-${idx}`}
                            type="text"
                            value={caso.imgBefore}
                            onChange={(e) => handleCaseChange(idx, "imgBefore", e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white"
                          />
                          {caso.imgBefore && (
                            <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                              <img src={caso.imgBefore} alt="Preview Antes" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Antes</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`caso-after-${idx}`}>Foto Estado DESPUÉS (URL)</label>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Después</span>
                          </div>
                          <input
                            id={`caso-after-${idx}`}
                            type="text"
                            value={caso.imgAfter}
                            onChange={(e) => handleCaseChange(idx, "imgAfter", e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="px-3 py-1.5 rounded-lg border border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white"
                          />
                          {caso.imgAfter && (
                            <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                              <img src={caso.imgAfter} alt="Preview Después" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <span className="absolute bottom-1 right-1 bg-emerald-700/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Después</span>
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
        )}

        {/* PESTAÑA 4: PREGUNTAS Y RESEÑAS */}
        {activeTab === "faqs" && (
          <div id="tab-faqs-content" className="space-y-6">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-md font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                FAQs Acordeón & Reseñas de Pacientes
              </h3>
              <p className="text-xs text-slate-500 mt-1">Alimenta el marcado de Schema FAQPage con preguntas recurrentes y muestra opiniones reales.</p>
            </div>

            {/* ACORDEÓN FAQS DINÁMICO */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Preguntas Frecuentes (FAQs)</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      {(data.faqs || []).length} {(data.faqs || []).length === 1 ? "pregunta" : "preguntas"}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Añade, edita o elimina las preguntas del acordeón y del Schema SEO FAQPage.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-reset-faqs"
                    onClick={resetDefaultFaqs}
                    title="Restaurar las 3 preguntas médicas recomendadas por defecto"
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Plantilla Base
                  </button>
                  <button
                    type="button"
                    id="btn-add-faq"
                    onClick={addFaq}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir Pregunta
                  </button>
                </div>
              </div>

              {(!data.faqs || data.faqs.length === 0) ? (
                <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                  <p className="text-xs text-slate-500 font-medium">No hay preguntas frecuentes registradas.</p>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={addFaq}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-white border border-slate-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Crear nueva pregunta
                    </button>
                    <button
                      type="button"
                      onClick={resetDefaultFaqs}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Cargar 3 preguntas de plantilla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.faqs.map((faq, idx) => (
                    <div key={faq.id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <p className="text-[11px] font-extrabold text-blue-700 uppercase">Pregunta #{idx + 1}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveFaq(idx, "up")}
                            disabled={idx === 0}
                            title="Subir posición"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFaq(idx, "down")}
                            disabled={idx === data.faqs.length - 1}
                            title="Bajar posición"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            id={`btn-remove-faq-${idx}`}
                            onClick={() => removeFaq(idx)}
                            title="Eliminar pregunta"
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`faq-pregunta-${idx}`}>Pregunta</label>
                        <input
                          id={`faq-pregunta-${idx}`}
                          type="text"
                          value={faq.pregunta}
                          onChange={(e) => handleFaqChange(idx, "pregunta", e.target.value)}
                          placeholder="Ej. ¿Qué incluye la primera consulta de valoración?"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white font-medium text-slate-900"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`faq-respuesta-${idx}`}>Respuesta Médica</label>
                        <textarea
                          id={`faq-respuesta-${idx}`}
                          rows={2}
                          value={faq.respuesta}
                          onChange={(e) => handleFaqChange(idx, "respuesta", e.target.value)}
                          placeholder="Describe detalladamente la respuesta que resolverá la duda del paciente..."
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RESEÑAS TESTIMONIOS & WIDGET GOOGLE REVIEWS */}
            <div id="resenas-control-section" className="border-t border-slate-100 pt-6 space-y-5">
              {/* INTEGRACIÓN GOOGLE MAPS / GOOGLE REVIEWS WIDGET */}
              <div id="google-reviews-integration-card" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 shadow-2xs flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">
                          Widget de Google Reviews & Maps
                        </h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Prueba Social Ecuador
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Valida la reputación médica real del consultorio conectando el <strong>Place ID</strong> y/o <strong>API Key</strong> de Google Maps.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs hover:bg-blue-50/50 transition-colors shrink-0">
                    <input
                      type="checkbox"
                      id="toggle-google-reviews-widget"
                      checked={data.habilitarGoogleReviewsWidget ?? true}
                      onChange={(e) => updateField("habilitarGoogleReviewsWidget", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Activar Widget en Landing</span>
                  </label>
                </div>

                {/* CAMPOS DE CONFIGURACIÓN GOOGLE REVIEWS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* GOOGLE PLACE ID */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="google-place-id" className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        ID de Lugar en Google Maps (Place ID)
                      </label>
                      <a
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                      >
                        ¿Qué es Place ID? <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <input
                      id="google-place-id"
                      type="text"
                      value={data.googlePlaceId ?? ""}
                      onChange={(e) => updateField("googlePlaceId", e.target.value)}
                      placeholder="ej. ChIJbXGk0iSa1ZER5uF2q_e3g4M o ID de la clínica"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white font-mono text-slate-800"
                    />
                    <span className="text-[10px] text-slate-500">
                      Identificador único del consultorio o clínica en Google Maps en Ecuador.
                    </span>
                  </div>

                  {/* GOOGLE MAPS API KEY (OPCIONAL) */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="google-maps-api-key" className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-600" />
                        Google Maps API Key (Opcional)
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">Para API Places / Embeds</span>
                    </div>
                    <input
                      id="google-maps-api-key"
                      type="password"
                      value={data.googleMapsApiKey ?? ""}
                      onChange={(e) => updateField("googleMapsApiKey", e.target.value)}
                      placeholder="AIzaSy... (opcional para embed con Places API)"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white font-mono text-slate-800"
                    />
                    <span className="text-[10px] text-slate-500">
                      Si no dispones de API Key, se utilizará el widget integrado y el enlace directo verificado.
                    </span>
                  </div>

                  {/* CALIFICACIÓN Y TOTAL DE RESEÑAS */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="google-reviews-rating" className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        Rating Promedio
                      </label>
                      <input
                        id="google-reviews-rating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={data.googleReviewsRating ?? 4.9}
                        onChange={(e) => updateField("googleReviewsRating", parseFloat(e.target.value) || 5.0)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white font-extrabold text-amber-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="google-reviews-total-count" className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                        Total Reseñas GBP
                      </label>
                      <input
                        id="google-reviews-total-count"
                        type="number"
                        min="1"
                        value={data.googleReviewsTotalCount ?? 148}
                        onChange={(e) => updateField("googleReviewsTotalCount", parseInt(e.target.value, 10) || 10)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* ENLACE DIRECTO A FICHA GOOGLE MAPS */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="google-maps-reviews-url" className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-600" />
                        URL Directa de Reseñas / Ficha GBP
                      </label>
                      {data.googleMapsReviewsUrl && (
                        <a
                          href={data.googleMapsReviewsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                        >
                          Verificar <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      id="google-maps-reviews-url"
                      type="url"
                      value={data.googleMapsReviewsUrl ?? ""}
                      onChange={(e) => updateField("googleMapsReviewsUrl", e.target.value)}
                      placeholder="https://maps.google.com/?cid=... o https://g.page/r/..."
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white text-slate-800"
                    />
                  </div>
                </div>

                {/* BOTÓN PRESET RÁPIDO PARA ECUADOR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-200/50">
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Configurado para consultorio en <strong>{data.ciudad || "Ecuador"}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("habilitarGoogleReviewsWidget", true);
                      updateField("googlePlaceId", `ChIJ_${(data.ciudad || "Ecuador").toLowerCase()}_med_${Math.floor(100000 + Math.random() * 900000)}`);
                      updateField("googleReviewsRating", 4.9);
                      updateField("googleReviewsTotalCount", 148);
                      updateField("googleMapsReviewsUrl", `https://maps.google.com/?q=${encodeURIComponent((data.nombreMedico || "Dr. Especialista") + " " + (data.especialidad || "Medicina") + " " + (data.ciudad || "Quito") + " Ecuador")}`);
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs cursor-pointer transition-all flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Generar Place ID y Enlace de Google Maps para {data.ciudad || "Ecuador"}
                  </button>
                </div>
              </div>

              {/* LISTA DE RESEÑAS DETALLADAS */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Testimonios de Pacientes (Schema Review)</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      {(data.resenas || []).length} { (data.resenas || []).length === 1 ? "testimonio" : "testimonios" }
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Suma testimonios verificados para alimentar el marcado de Schema.org (Review & AggregateRating).</p>
                </div>
                <button
                  type="button"
                  id="btn-add-resena"
                  onClick={addReview}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Reseña
                </button>
              </div>

              {(!data.resenas || data.resenas.length === 0) ? (
                <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <p className="text-xs text-slate-500 font-medium mb-3">No hay reseñas configuradas para este perfil médico.</p>
                  <button
                    type="button"
                    onClick={addReview}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-white border border-slate-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear primera reseña
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.resenas.map((res, idx) => (
                    <div key={res.id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <p className="text-[11px] font-extrabold text-slate-800 uppercase">Reseña #{idx + 1}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`res-stars-${idx}`}>Estrellas</label>
                            <select
                              id={`res-stars-${idx}`}
                              value={res.estrellas}
                              onChange={(e) => handleReviewChange(idx, "estrellas", parseInt(e.target.value))}
                              className="px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none bg-white font-bold text-amber-600"
                            >
                              <option value="5">5 ★★★★★</option>
                              <option value="4">4 ★★★★☆</option>
                              <option value="3">3 ★★★☆☆</option>
                              <option value="2">2 ★★☆☆☆</option>
                              <option value="1">1 ★☆☆☆☆</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            id={`btn-remove-resena-${idx}`}
                            onClick={() => removeReview(idx)}
                            title="Eliminar reseña"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`res-paciente-${idx}`}>Nombre del Paciente / Iniciales</label>
                          <input
                            id={`res-paciente-${idx}`}
                            type="text"
                            value={res.paciente}
                            onChange={(e) => handleReviewChange(idx, "paciente", e.target.value)}
                            placeholder="ej. M. González o Mariana R."
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`res-fecha-${idx}`}>Fecha Relativa o Verificación</label>
                          <input
                            id={`res-fecha-${idx}`}
                            type="text"
                            value={res.fecha}
                            onChange={(e) => handleReviewChange(idx, "fecha", e.target.value)}
                            placeholder="ej. Hace 2 semanas • Google Reviews"
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`res-comentario-${idx}`}>Comentario / Experiencia Clínica</label>
                        <textarea
                          id={`res-comentario-${idx}`}
                          rows={2}
                          value={res.comentario}
                          onChange={(e) => handleReviewChange(idx, "comentario", e.target.value)}
                          placeholder="Describe la experiencia y resultados del paciente..."
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 5: BLOG MÉDICO (SEO Long-Tail) */}
        {activeTab === "blog" && (
          <div id="tab-blog-content" className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-md font-extrabold text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                Blog Médico para Captación Long-Tail
              </h3>
              <p className="text-xs text-slate-500 mt-1">Genera y edita artículos informativos para indexar búsquedas locales sobre síntomas, tratamientos o dudas comunes.</p>
            </div>

            {/* BOTÓN GENERADOR CON IA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-2xl border border-blue-100/70 space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">Generador de Artículos con IA</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Usa Gemini para autocompletar 3 artículos de blog de alto impacto SEO basados en tu especialidad (<strong>{data.especialidad || "Tu Especialidad"}</strong>) y ciudad (<strong>{data.ciudad || "Tu Ciudad"}</strong>).
                  </p>
                </div>
              </div>

              {generationError && (
                <div className="text-xs bg-red-50 text-red-600 p-3 rounded-lg font-semibold border border-red-100">
                  ⚠️ Error: {generationError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateBlogWithAi}
                disabled={isGeneratingBlog}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                  isGeneratingBlog
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/10"
                }`}
              >
                {isGeneratingBlog ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Autocompletando con Gemini 3.7 Flash...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Autocompletar 3 Artículos con IA
                  </>
                )}
              </button>
            </div>

            {/* ARTÍCULOS */}
            <div className="space-y-6">
              {(data.blogPosts || []).map((post, idx) => (
                <div key={post.id || `blog-${idx}`} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Artículo #{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Tráfico Long-tail
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`blog-titulo-${idx}`}>Título del Artículo</label>
                      <input
                        id={`blog-titulo-${idx}`}
                        type="text"
                        value={post.titulo}
                        onChange={(e) => handleBlogPostChange(idx, "titulo", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`blog-slug-${idx}`}>Slug / URL Amigable</label>
                      <input
                        id={`blog-slug-${idx}`}
                        type="text"
                        value={post.slug}
                        onChange={(e) => handleBlogPostChange(idx, "slug", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`blog-categoria-${idx}`}>Categoría</label>
                      <input
                        id={`blog-categoria-${idx}`}
                        type="text"
                        value={post.categoria}
                        onChange={(e) => handleBlogPostChange(idx, "categoria", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`blog-tiempo-${idx}`}>Tiempo de Lectura</label>
                      <input
                        id={`blog-tiempo-${idx}`}
                        type="text"
                        value={post.tiempoLectura}
                        onChange={(e) => handleBlogPostChange(idx, "tiempoLectura", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`blog-fecha-${idx}`}>Fecha de Publicación</label>
                      <input
                        id={`blog-fecha-${idx}`}
                        type="text"
                        value={post.fecha}
                        onChange={(e) => handleBlogPostChange(idx, "fecha", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`blog-imagen-${idx}`}>URL de Imagen de Portada</label>
                    <input
                      id={`blog-imagen-${idx}`}
                      type="text"
                      value={post.imagenUrl}
                      onChange={(e) => handleBlogPostChange(idx, "imagenUrl", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-[10px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`blog-extracto-${idx}`}>Extracto / Resumen Corto</label>
                    <textarea
                      id={`blog-extracto-${idx}`}
                      rows={2}
                      value={post.extracto}
                      onChange={(e) => handleBlogPostChange(idx, "extracto", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`blog-contenido-${idx}`}>Contenido Completo (Estructurado con HTML)</label>
                    <textarea
                      id={`blog-contenido-${idx}`}
                      rows={6}
                      value={post.contenido}
                      onChange={(e) => handleBlogPostChange(idx, "contenido", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Informativo E-E-A-T al pie del panel */}
      <div id="form-footer-hint" className="bg-blue-50 p-4 border-t border-slate-100 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-[10px] text-blue-800 leading-normal font-medium">
          <strong>Optimización E-E-A-T y YMYL activa:</strong> Al cambiar estos campos se actualiza en tiempo real el script de Schema JSON-LD y el archivo HTML para indexación orgánica local instantánea en Google Maps.
        </div>
      </div>

      {/* Modal Asistente de Ingesta Inteligente con IA */}
      <AiIngestionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentData={data}
        onApplyData={handleApplyExtractedData}
      />
    </div>
  );
}
