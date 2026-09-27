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
  Camera,
  Smartphone,
  Monitor,
  Award
} from "lucide-react";
import { FormDoctorProfile } from "./form/FormDoctorProfile";
import { FormClinicLocation } from "./form/FormClinicLocation";
import { FormCredentials } from "./form/FormCredentials";
import { FormTechnicalInfo } from "./form/FormTechnicalInfo";
import { FormMedicalValidationInfo } from "./form/FormMedicalValidationInfo";
import { FormServicesCases } from "./form/FormServicesCases";
import { FormSeo } from "./form/FormSeo";
import { FormGlobalMetadata } from "./form/FormGlobalMetadata";
import { FormPwa } from "./form/FormPwa";
import { FormSocialReviews } from "./form/FormSocialReviews";
import { FormFaqs } from "./form/FormFaqs";
import { FormBlog } from "./form/FormBlog";
import { FormPatientGuides } from "./form/FormPatientGuides";
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
  | "informacion_tecnica"
  | "validacion_credenciales"
  | "servicios" 
  | "galeria"
  | "guias"
  | "metadatos"
  | "pwa"
  | "seo" 
  | "social" 
  | "faqs" 
  | "blog" 
  | "diseno_colores"
  | "diseno_hero"
  | "diseno_secciones"
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

function getCategoryGroups(isClinica: boolean): CategoryGroup[] {
  return [
    {
      id: "identidad",
      name: "Identidad & Consultorio",
      shortName: "Identidad",
      description: isClinica ? "Clínica, centro, ubicación, validación y credenciales" : "Doctor, clínica, ubicación, validación y credenciales",
      icon: Building2,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      tabs: [
        { id: "perfil", label: isClinica ? "Perfil & Contacto Institucional" : "Perfil & Contacto", shortLabel: isClinica ? "Perfil Clínica" : "Perfil Médico", icon: User },
        { id: "clinica", label: "Ubicación & Horarios", shortLabel: "Ubicación & GPS", icon: MapPin },
        { id: "credenciales", label: "Credenciales E-E-A-T", shortLabel: "Credenciales E-E-A-T", icon: ShieldCheck },
        { id: "informacion_tecnica", label: "Información Técnica & Código Puro", shortLabel: "Código Puro 3+ Años", icon: FileText, badge: "Garantía 3+ Años" },
        { id: "validacion_credenciales", label: "Validación de Credenciales Médicas en Internet", shortLabel: "Validación Web & IA", icon: Award, badge: "SEO Local & IA" }
      ]
    },
    {
      id: "contenido",
      name: "Contenido & Pacientes",
      shortName: "Contenido",
      description: "Servicios, galería de instalaciones, guías de pacientes, reseñas, blog y preguntas",
      icon: Users,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      tabs: [
        { id: "servicios", label: "Servicios & Casos", shortLabel: "Servicios Clínicos", icon: Briefcase },
        { id: "galeria", label: "Galería de Instalaciones & Consultorio", shortLabel: "Galería Consultorio", icon: Camera },
        { id: "guias", label: "Guías & Fichas para Pacientes", shortLabel: "Guías Pacientes PDF", icon: FileText, badge: "Lead Magnet" },
        { id: "social", label: "Reseñas & Redes", shortLabel: "Reseñas & Redes", icon: MessageSquare },
        { id: "faqs", label: "Preguntas Frecuentes & Asistente IA", shortLabel: "FAQs & Asistente IA", icon: HelpCircle },
        { id: "blog", label: "Blog & Artículos", shortLabel: isClinica ? "Blog Institucional" : "Blog Médico", icon: BookOpen }
      ]
    },
    {
      id: "diseno",
      name: "Diseño & Layout",
      shortName: "Diseño & Layout",
      description: "Paleta cromática, tipografías, cabecera hero, CTAs y orden de secciones",
      icon: Layout,
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      tabs: [
        { 
          id: "diseno_colores", 
          label: "Paleta Cromática & Tipografías", 
          shortLabel: "Colores & Fuentes", 
          icon: Palette,
          badge: "Colores" 
        },
        { 
          id: "diseno_hero", 
          label: "Cabecera, Menú Desktop & Hero", 
          shortLabel: "Hero & Menú", 
          icon: Monitor,
          badge: "Hero" 
        },
        { 
          id: "diseno_secciones", 
          label: "Botones CTA & Orden de Secciones", 
          shortLabel: "CTAs & Secciones", 
          icon: Layers,
          badge: "Layout" 
        }
      ]
    },
    {
      id: "seo",
      name: "SEO, Dominio & PWA",
      shortName: "SEO & PWA",
      description: "Metadatos SEO, aplicación PWA para celular y dominio web",
      icon: Globe,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      tabs: [
        { id: "metadatos", label: "Metadatos Globales SEO", shortLabel: "Metadatos SEO", icon: Sliders },
        { id: "pwa", label: "Aplicación Móvil PWA & Add to Home", shortLabel: "App Móvil PWA", icon: Smartphone, badge: "PWA App" },
        { 
          id: "seo", 
          label: "Vinculación SEO con Inteligencia Artificial", 
          shortLabel: "SEO & IA", 
          icon: Sparkles, 
          badge: "IA & SEO" 
        }
      ]
    }
  ];
}

export default function FormPanel({ 
  data, 
  onChange
}: FormPanelProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("identidad");
  const [activeTab, setActiveTab] = useState<FormTabKey>("perfil");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const isClinica = data.tipoEnfoqueLanding === "clinica";
  const categoryGroups = getCategoryGroups(isClinica);

  const getCategoryForTab = (tabId: FormTabKey): CategoryId => {
    for (const cat of categoryGroups) {
      if (cat.tabs.some(t => t.id === tabId)) {
        return cat.id;
      }
    }
    return "identidad";
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setActiveCategory(catId);
    const cat = categoryGroups.find(c => c.id === catId);
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

  const currentCategory = categoryGroups.find(c => c.id === activeCategory) || categoryGroups[0];

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
        </div>
      </div>

      {/* 1. PESTAÑAS PRINCIPALES (3 CATEGORÍAS APILADAS VERTICALMENTE) */}
      <div className="p-3 bg-slate-100/70 border-b border-slate-200 space-y-2">
        {categoryGroups.map((cat) => {
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
      <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200/90 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <span className="text-slate-500 font-medium">Subsecciones de</span>
          <span className="font-extrabold text-slate-900">{currentCategory.name}:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full">
          {currentCategory.tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTab === tab.id;
            const isFuturisticAiTab = tab.id === "seo";

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer select-none ${
                  isFuturisticAiTab
                    ? isTabActive
                      ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/25 ring-2 ring-cyan-400/40 border border-cyan-300"
                      : "bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-indigo-100 hover:text-white border border-indigo-500/40 hover:border-cyan-400/60 shadow-xs hover:shadow-indigo-500/20 hover:scale-[1.01]"
                    : isTabActive
                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/25 border border-blue-600"
                    : "bg-white text-slate-700 hover:bg-slate-100/90 border border-slate-300 hover:border-slate-400 hover:text-slate-950 shadow-2xs"
                }`}
              >
                <TabIcon 
                  className={`w-4 h-4 shrink-0 ${
                    isFuturisticAiTab 
                      ? isTabActive ? "text-cyan-200 animate-pulse" : "text-cyan-400" 
                      : isTabActive ? "text-white" : "text-blue-600"
                  }`} 
                />
                <span className="leading-tight">{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold tracking-tight ${
                    isFuturisticAiTab
                      ? isTabActive
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : isTabActive 
                      ? "bg-white/20 text-white" 
                      : "bg-blue-50 text-blue-700 border border-blue-200"
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

        {activeTab === "informacion_tecnica" && (
          <FormTechnicalInfo />
        )}

        {activeTab === "validacion_credenciales" && (
          <FormMedicalValidationInfo 
            data={data} 
            onChange={onChange}
            updateField={updateField}
            updateFields={updateFields}
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
          <div className="space-y-4">
            {/* Configuración de Encabezado de la Sección */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Encabezado de la Sección Instalaciones & Tecnología
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Edita el título, subtítulo y la descripción general que verán tus pacientes en esta sección.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Badge / Subtítulo Superior
                  </label>
                  <input
                    type="text"
                    value={data.subtituloInstalaciones ?? ""}
                    onChange={(e) => updateField("subtituloInstalaciones", e.target.value)}
                    placeholder="ej. Instalaciones & Tecnología"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={data.tituloInstalaciones ?? ""}
                    onChange={(e) => updateField("tituloInstalaciones", e.target.value)}
                    placeholder="ej. Espacios Diseñados para tu Bienestar"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Descripción General de la Sección
                  </label>
                  <textarea
                    rows={2}
                    value={data.descripcionInstalaciones ?? ""}
                    onChange={(e) => updateField("descripcionInstalaciones", e.target.value)}
                    placeholder="ej. Conoce nuestro consultorio, salas de atención e instrumental médico preparado bajo los más estrictos protocolos..."
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Gestor de Fotos */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <ClinicGalleryManager
                photos={data.fotosConsultorio || []}
                onChange={(newPhotos) => updateField("fotosConsultorio", newPhotos)}
                primaryColorClass={data.paletaColor || "blue"}
              />
            </div>
          </div>
        )}

        {activeTab === "guias" && (
          <FormPatientGuides
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "metadatos" && (
          <FormGlobalMetadata
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
        )}

        {activeTab === "pwa" && (
          <FormPwa
            data={data}
            onChange={onChange}
            updateField={updateField}
          />
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

        {(activeTab === "diseno_colores" || activeTab === "diseno") && (
          <FormDesign
            data={data}
            onChange={onChange}
            updateField={updateField}
            updateFields={updateFields}
            subSection={activeTab === "diseno" ? "all" : "colores"}
          />
        )}

        {activeTab === "diseno_hero" && (
          <FormDesign
            data={data}
            onChange={onChange}
            updateField={updateField}
            updateFields={updateFields}
            subSection="hero"
          />
        )}

        {activeTab === "diseno_secciones" && (
          <FormDesign
            data={data}
            onChange={onChange}
            updateField={updateField}
            updateFields={updateFields}
            subSection="secciones"
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
        onOpenFaqsTab={() => handleSelectTab("faqs")}
      />

      {/* MODAL DE FORMULARIO DE CAPTURA DE DATOS PARA MÉDICOS */}
      <DoctorIntakeFormModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onOpenAiIngestion={() => setIsAiModalOpen(true)}
        isClinica={data.tipoEnfoqueLanding === "clinica"}
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
