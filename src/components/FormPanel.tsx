/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  MedicalLandingData, 
  ServiceItem, 
  BlogPostItem 
} from "../types";
import { 
  User, 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Palette, 
  Share2, 
  HelpCircle, 
  ShieldCheck, 
  Globe, 
  Sliders, 
  Layers,
  Search,
  Layout,
  Building2,
  Users,
  ChevronRight,
  ClipboardList,
  QrCode,
  FileText,
  Camera
} from "lucide-react";
import { FormDoctorProfile } from "./form/FormDoctorProfile";
import { FormClinicLocation } from "./form/FormClinicLocation";
import { FormCredentials } from "./form/FormCredentials";
import { FormServicesCases } from "./form/FormServicesCases";
import { FormSeo } from "./form/FormSeo";
import { FormSocialReviews } from "./form/FormSocialReviews";
import { FormFaqs } from "./form/FormFaqs";
import { FormBlog } from "./form/FormBlog";
import { FormDesign } from "./form/FormDesign";
import { ClinicGalleryManager } from "./ClinicGalleryManager";
import { AiIngestionModal } from "./AiIngestionModal";
import { DoctorIntakeFormModal } from "./DoctorIntakeFormModal";
import { QrGeneratorModal } from "./QrGeneratorModal";
import { printDoctorSummaryPdf } from "../utils/printDoctorSummary";
import { applyExtractedMedicalData } from "../utils/aiMerge";

interface FormPanelProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData | ((prev: MedicalLandingData) => MedicalLandingData)) => void;
}

export type FormTabKey = 
  | "perfil" 
  | "clinica" 
  | "credenciales" 
  | "servicios" 
  | "galeria"
  | "seo" 
  | "social" 
  | "faqs" 
  | "blog" 
  | "diseno";

export type CategoryId = "identidad" | "contenido" | "diseno" | "seo";

interface CategoryGroup {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  tabs: {
    id: FormTabKey;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "identidad",
    name: "Identidad & Consultorio",
    shortName: "Identidad",
    description: "Doctor, clínica, ubicación y credenciales",
    icon: Building2,
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    tabs: [
      { id: "perfil", label: "Perfil & Contacto", shortLabel: "Perfil Médico", icon: User },
      { id: "clinica", label: "Ubicación & Horarios", shortLabel: "Ubicación & GPS", icon: MapPin },
      { id: "credenciales", label: "Credenciales E-E-A-T", shortLabel: "Credenciales E-E-A-T", icon: ShieldCheck }
    ]
  },
  {
    id: "contenido",
    name: "Contenido & Pacientes",
    shortName: "Contenido",
    description: "Servicios, galería de instalaciones, reseñas, blog y preguntas",
    icon: Users,
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    tabs: [
      { id: "servicios", label: "Servicios & Casos", shortLabel: "Servicios Clínicos", icon: Briefcase },
      { id: "galeria", label: "Galería de Instalaciones & Consultorio", shortLabel: "Galería Consultorio", icon: Camera },
      { id: "social", label: "Reseñas & Redes", shortLabel: "Reseñas & Redes", icon: MessageSquare },
      { id: "faqs", label: "Preguntas Frecuentes", shortLabel: "Preguntas FAQs", icon: HelpCircle },
      { id: "blog", label: "Blog & Artículos", shortLabel: "Blog Médico", icon: BookOpen }
    ]
  },
  {
    id: "diseno",
    name: "Diseño & Layout",
    shortName: "Diseño & Layout",
    description: "Estilo visual, colores, CTAs y orden de secciones",
    icon: Layout,
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    tabs: [
      { id: "diseno", label: "Diseño, Colores & Estilo Visual", shortLabel: "Diseño & Estilo", icon: Palette }
    ]
  },
  {
    id: "seo",
    name: "SEO & Dominio Web",
    shortName: "SEO & Dominio",
    description: "Posicionamiento Google y configuración de dominio",
    icon: Globe,
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    tabs: [
      { id: "seo", label: "SEO & Dominio Web", shortLabel: "SEO & Dominio", icon: Globe, badge: "Ecuador" }
    ]
  }
];

export default function FormPanel({ 
  data, 
  onChange
}: FormPanelProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("identidad");
  const [activeTab, setActiveTab] = useState<FormTabKey>("perfil");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const getCategoryForTab = (tabId: FormTabKey): CategoryId => {
    for (const cat of CATEGORY_GROUPS) {
      if (cat.tabs.some(t => t.id === tabId)) {
        return cat.id;
      }
    }
    return "identidad";
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setActiveCategory(catId);
    const cat = CATEGORY_GROUPS.find(c => c.id === catId);
    if (cat && !cat.tabs.some(t => t.id === activeTab)) {
      setActiveTab(cat.tabs[0].id);
    }
  };

  const handleSelectTab = (tabId: FormTabKey) => {
    setActiveTab(tabId);
    const parentCat = getCategoryForTab(tabId);
    if (parentCat !== activeCategory) {
      setActiveCategory(parentCat);
    }
  };

  const currentCategory = CATEGORY_GROUPS.find(c => c.id === activeCategory) || CATEGORY_GROUPS[0];

  const updateField = (field: keyof MedicalLandingData, value: any) => {
    onChange((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const updateFields = (fields: Partial<MedicalLandingData>) => {
    onChange((prevData) => ({
      ...prevData,
      ...fields,
    }));
  };

  const handleApplyExtractedData = (newData: Partial<MedicalLandingData>, mergeMode: boolean) => {
    const merged = applyExtractedMedicalData(data, newData, mergeMode);
    onChange(merged);
  };

  return (
    <div id="editor-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* CABECERA PRINCIPAL DEL PANEL */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Creador de Landing Page Médica
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuración estructurada de tu landing page médica para Ecuador 🇪🇨
          </p>
        </div>

        {/* BOTONES DE ACCIÓN RÁPIDA */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-extrabold text-xs transition-all hover:scale-102 cursor-pointer shrink-0"
            title="Generar Código QR de la web o WhatsApp para imprimir o compartir"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Código QR</span>
          </button>

          <button
            type="button"
            onClick={() => printDoctorSummaryPdf(data)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-xs transition-all hover:scale-102 cursor-pointer shrink-0"
            title="Generar e imprimir Ficha Informativa del Consultorio en formato PDF"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Ficha PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsIntakeModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs transition-all hover:scale-102 cursor-pointer shrink-0"
            title="Descargar o copiar formulario de captura de datos para enviar a tu cliente médico"
          >
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>Formulario Médico</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all hover:scale-102 cursor-pointer shrink-0"
            title="Organizar o extraer información de un texto libre o web"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Autocompletar con IA</span>
          </button>
        </div>
      </div>

      {/* 1. PESTAÑAS PRINCIPALES (3 CATEGORÍAS APILADAS VERTICALMENTE) */}
      <div className="p-3 bg-slate-100/70 border-b border-slate-200 space-y-2">
        {CATEGORY_GROUPS.map((cat) => {
          const CatIcon = cat.icon;
          const isCatActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                isCatActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-300 ring-2 ring-blue-500/20"
                  : "bg-white/60 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isCatActive ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
                }`}>
                  <CatIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className={`text-xs font-black block truncate ${isCatActive ? "text-blue-950 font-black" : "text-slate-800 font-extrabold"}`}>
                    {cat.name}
                  </span>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{cat.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {isCatActive ? (
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    Activo
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. SUB-PESTAÑAS DE LA CATEGORÍA ACTIVA */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mr-1">
          <span className="text-slate-400 font-normal">Subsecciones de</span>
          <span className="font-extrabold text-slate-900">{currentCategory.name}:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {currentCategory.tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isTabActive
                    ? "bg-blue-600 text-white shadow-xs ring-1 ring-blue-700/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90 hover:text-blue-700 shadow-2xs"
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isTabActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isTabActive ? "bg-white/25 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENIDO DEL FORMULARIO SEGÚN LA PESTAÑA ACTIVA */}
      <div className="p-4 sm:p-6 space-y-6">
        {activeTab === "perfil" && (
          <FormDoctorProfile
            data={data}
            onChange={onChange}
            updateField={updateField}
            updateFields={updateFields}
          />
        )}

        {activeTab === "clinica" && (
          <FormClinicLocation
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "credenciales" && (
          <FormCredentials
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "servicios" && (
          <FormServicesCases
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "galeria" && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <ClinicGalleryManager
              photos={data.fotosConsultorio || []}
              onChange={(newPhotos) => updateField("fotosConsultorio", newPhotos)}
              primaryColorClass={data.paletaColor || "blue"}
            />
          </div>
        )}

        {activeTab === "seo" && (
          <FormSeo
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "social" && (
          <FormSocialReviews
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "faqs" && (
          <FormFaqs
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "blog" && (
          <FormBlog
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "diseno" && (
          <FormDesign
            data={data}
            onChange={onChange}
            updateField={updateField}
            updateFields={updateFields}
          />
        )}
      </div>

      {/* MODAL DE EXTRACCIÓN & AUTOCOMPLETADO CON IA */}
      <AiIngestionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentData={data}
        onApplyData={handleApplyExtractedData}
        onOpenIntakeForm={() => setIsIntakeModalOpen(true)}
      />

      {/* MODAL DE FORMULARIO DE CAPTURA DE DATOS PARA MÉDICOS */}
      <DoctorIntakeFormModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onOpenAiIngestion={() => setIsAiModalOpen(true)}
      />

      {/* MODAL GENERADOR DE CÓDIGO QR */}
      <QrGeneratorModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        data={data}
      />
    </div>
  );
}
