/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { defaultMedicalData, MedicalLandingData } from "./types";
import FormPanel from "./components/FormPanel";
import PreviewPanel from "./components/PreviewPanel";
import CodePanel from "./components/CodePanel";
import SeoAuditPanel from "./components/SeoAuditPanel";
import { AiIngestionModal } from "./components/AiIngestionModal";
import { ClientManagerModal } from "./components/ClientManagerModal";
import { applyExtractedMedicalData } from "./utils/aiMerge";
import { 
  getActiveProfileId, 
  getSavedProfiles, 
  setActiveProfileId, 
  saveProfile 
} from "./utils/profileStorage";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  ShieldCheck, 
  Code, 
  Sparkles, 
  Globe, 
  HelpCircle,
  FileCode,
  Smartphone,
  CheckCircle2,
  RotateCcw,
  Link as LinkIcon,
  FileText,
  Users,
  FolderArchive,
  Upload,
  Save,
  UserCheck
} from "lucide-react";

const LOCAL_STORAGE_KEY = "medical_landing_generator_state";

export default function App() {
  // Función para inicializar datos desde localStorage
  const getInitialData = (): MedicalLandingData => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    return defaultMedicalData;
  };

  // Datos reactivos de la landing page del médico
  const [medicalData, setMedicalData] = useState<MedicalLandingData>(getInitialData);
  const [rightTab, setRightTab] = useState<"preview" | "code" | "audit">("preview");
  const [isGlobalAiModalOpen, setIsGlobalAiModalOpen] = useState(false);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState(false);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(getActiveProfileId);
  const [savedProfilesCount, setSavedProfilesCount] = useState<number>(0);
  const [quickSavedToast, setQuickSavedToast] = useState<string>("");

  const refreshProfileStats = () => {
    const list = getSavedProfiles();
    setSavedProfilesCount(list.length);
    const activeId = getActiveProfileId();
    setActiveProfileIdState(activeId);
  };

  useEffect(() => {
    refreshProfileStats();
  }, []);

  // Guardar en localStorage cuando cambie medicalData
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(medicalData));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [medicalData]);

  const handleDataChange = (newData: MedicalLandingData) => {
    setMedicalData(newData);
  };

  const handleApplyExtractedData = (newData: Partial<MedicalLandingData>, mergeMode: boolean) => {
    const merged = applyExtractedMedicalData(medicalData, newData, mergeMode);
    setMedicalData(merged);
  };

  const handleLoadProfile = (data: MedicalLandingData, profileId?: string) => {
    setMedicalData(data);
    if (profileId) {
      setActiveProfileId(profileId);
      setActiveProfileIdState(profileId);
    }
    refreshProfileStats();
    setQuickSavedToast(`¡Perfil de ${data.nombreMedico} cargado con éxito!`);
    setTimeout(() => setQuickSavedToast(""), 3500);
  };

  const handleQuickSaveCurrent = () => {
    const profiles = getSavedProfiles();
    const existing = activeProfileId ? profiles.find(p => p.id === activeProfileId) : null;
    
    const saved = saveProfile(
      medicalData,
      existing ? existing.nombreCliente : undefined,
      activeProfileId || undefined
    );
    
    setActiveProfileId(saved.id);
    setActiveProfileIdState(saved.id);
    refreshProfileStats();
    setQuickSavedToast(`¡Guardado en catálogo: "${saved.nombreCliente}"!`);
    setTimeout(() => setQuickSavedToast(""), 3500);
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      "¿Estás seguro de que deseas restablecer todos los campos a los valores por defecto? Se perderán tus cambios no guardados."
    );
    if (confirmReset) {
      setMedicalData(defaultMedicalData);
      setActiveProfileId(null);
      setActiveProfileIdState(null);
      refreshProfileStats();
    }
  };

  const currentDoctorDisplay = medicalData.nombreMedico && medicalData.nombreMedico !== "{{NOMBRE_MEDICO}}"
    ? medicalData.nombreMedico
    : "Sin médico asignado";
    
  const currentSpecialtyDisplay = medicalData.especialidad && medicalData.especialidad !== "{{ESPECIALIDAD}}"
    ? medicalData.especialidad
    : "Especialidad Médica";

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* HEADER CLÍNICO */}
      <header id="app-main-header" className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Heart className="w-5.5 h-5.5 fill-current text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-extrabold text-slate-900 flex items-center gap-1.5 leading-tight truncate">
                White-Label Medical Landing Generator
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100 hidden sm:inline-block">E-E-A-T & PWA</span>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hidden md:inline-flex items-center gap-1">
                  🇪🇨 Exclusivo Ecuador
                </span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 truncate">
                Configura, importa y exporta landing pages médicas para más de 100 especialistas en Ecuador.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* BOTÓN GESTOR DE CLIENTES & IMPORTADOR */}
            <button
              id="btn-open-client-manager"
              onClick={() => setIsClientManagerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md shadow-slate-900/10 cursor-pointer transition-all hover:scale-105 border border-slate-700"
              title="Administrar biblioteca de clientes, importar archivos .json o restaurar backups"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Clientes / Importar</span>
              <span className="sm:hidden">Clientes</span>
              {savedProfilesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-black">
                  {savedProfilesCount}
                </span>
              )}
            </button>

            {/* BOTÓN ASISTENTE DE INGESTA CON IA */}
            <button
              onClick={() => setIsGlobalAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition-all hover:scale-105 border border-white/20"
              title="Organizar información desestructurada o escanear enlace web con IA"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden md:inline">Organizar con IA</span>
              <span className="md:hidden">IA</span>
            </button>

          </div>
        </div>
      </header>

      {/* TOAST FLOTANTE DE ACCIÓN RÁPIDA */}
      {quickSavedToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center shadow-md animate-in fade-in slide-in-from-top duration-200 shrink-0 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{quickSavedToast}</span>
        </div>
      )}

      {/* CUERPO DE LA APP (Doble Columna) */}
      <main id="app-main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Formulario de Control (5 Columnas) */}
        <section id="editor-section" className="lg:col-span-5 h-full" aria-label="Panel de edición">
          <div className="space-y-4">
            
            {/* TARJETA DE ESTADO DEL CLIENTE ACTUAL */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                        {activeProfileId ? "Cliente en Catálogo" : "Borrador en Curso"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {medicalData.ciudad || "Ecuador"}
                      </span>
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 mt-1 truncate" title={currentDoctorDisplay}>
                      {currentDoctorDisplay}
                    </h2>
                    <p className="text-xs text-slate-500 truncate" title={currentSpecialtyDisplay}>
                      {currentSpecialtyDisplay} • {medicalData.nombreClinicaGBP || "Consultorio"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsClientManagerOpen(true)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                  title="Cambiar de perfil, importar otro archivo o ver biblioteca"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cambiar</span>
                </button>
              </div>

              {/* BARRA DE ACCIONES RÁPIDAS DE PERFIL */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleQuickSaveCurrent}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold cursor-pointer shadow-2xs"
                    title="Guardar cambios de este cliente en la biblioteca local"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cliente</span>
                  </button>

                  <button
                    onClick={() => setIsClientManagerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-all font-bold cursor-pointer"
                    title="Importar un archivo .json de otro médico"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Importar .JSON</span>
                  </button>
                </div>

                <button
                  onClick={handleResetData}
                  className="flex items-center gap-1 px-2 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-semibold cursor-pointer"
                  title="Restablecer plantilla a valores por defecto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Restablecer</span>
                </button>
              </div>
            </div>
            
            <FormPanel data={medicalData} onChange={handleDataChange} />
          </div>
        </section>

        {/* COLUMNA DERECHA: Vista Previa e Instancias de Código (7 Columnas) */}
        <section id="workspace-section" className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Selector de espacio de trabajo */}
          <div id="workspace-tabs-container" className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <button
                id="btn-workspace-preview"
                onClick={() => setRightTab("preview")}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  rightTab === "preview"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Vista Previa
              </button>
              <button
                id="btn-workspace-code"
                onClick={() => setRightTab("code")}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  rightTab === "code"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Code className="w-4 h-4" />
                Código PWA & Exportación
              </button>
              <button
                id="btn-workspace-audit"
                onClick={() => setRightTab("audit")}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  rightTab === "audit"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Auditoría SEO & E-E-A-T
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Sincronización NAP en vivo</span>
            </div>
          </div>

          {/* Renderizado Dinámico del Panel Seleccionado */}
          <div id="workspace-content-viewport" className="transition-all duration-300">
            <AnimatePresence mode="wait">
              <motion.div
                key={rightTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {rightTab === "preview" ? (
                  <PreviewPanel data={medicalData} />
                ) : rightTab === "code" ? (
                  <CodePanel data={medicalData} />
                ) : (
                  <SeoAuditPanel data={medicalData} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* FOOTER INFORMADO */}
      <footer id="app-global-footer" className="bg-white border-t border-slate-200 mt-auto py-6 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; 2026 White-Label Medical Landing Generator. Diseñado para cardiólogos, otorrinolaringólogos, cirujanos y especialistas del sector salud.</p>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <button 
              onClick={() => setIsClientManagerOpen(true)}
              className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              Gestor de Clientes ({savedProfilesCount})
            </button>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              WCAG AA Accesible
            </span>
            <span className="flex items-center gap-1">
              <FileCode className="w-4 h-4 text-blue-500" />
              Estructura PWA Lista
            </span>
          </div>
        </div>
      </footer>

      {/* Modal Gestor de Clientes & Importador Multi-Perfil */}
      <ClientManagerModal
        isOpen={isClientManagerOpen}
        onClose={() => {
          setIsClientManagerOpen(false);
          refreshProfileStats();
        }}
        currentData={medicalData}
        onLoadProfile={handleLoadProfile}
      />

      {/* Modal Asistente de Ingesta Inteligente con IA */}
      <AiIngestionModal
        isOpen={isGlobalAiModalOpen}
        onClose={() => setIsGlobalAiModalOpen(false)}
        currentData={medicalData}
        onApplyData={handleApplyExtractedData}
      />

    </div>
  );
}

