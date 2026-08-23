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
import { DoctorIntakeFormModal } from "./components/DoctorIntakeFormModal";
import { ClientManagerModal } from "./components/ClientManagerModal";
import { QrGeneratorModal } from "./components/QrGeneratorModal";
import { MedicoEcLogo } from "./components/MedicoEcLogo";
import { printDoctorSummaryPdf } from "./utils/printDoctorSummary";
import { applyExtractedMedicalData } from "./utils/aiMerge";
import { 
  generateHtmlFile, 
  generateDynamicStylesCss,
  generateManifestJson, 
  generateServiceWorkerJs, 
  generateJsonLd,
  generateLlmsTxt,
  generateRobotsTxt,
  generateSitemapXml
} from "./utils/generators";
import JSZip from "jszip";
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
  UserCheck,
  Sliders,
  RefreshCw,
  ExternalLink,
  ClipboardList,
  QrCode,
  Sun,
  Moon
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
  const [isGlobalIntakeModalOpen, setIsGlobalIntakeModalOpen] = useState(false);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(getActiveProfileId);
  const [savedProfilesCount, setSavedProfilesCount] = useState<number>(0);
  const [quickSavedToast, setQuickSavedToast] = useState<string>("");

  // Estado del tema visual de la interfaz del generador (Claro / Oscuro para ergonomía visual)
  const [editorTheme, setEditorTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("medical_generator_theme");
      return (saved === "dark" || saved === "light") ? saved : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("medical_generator_theme", editorTheme);
      if (editorTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }, [editorTheme]);

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

  // Actualizar favicon de la pestaña en tiempo real
  useEffect(() => {
    try {
      const faviconUrl = medicalData.faviconUrl;
      if (faviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.getElementsByTagName("head")[0].appendChild(link);
        }
        link.href = faviconUrl;
      }
    } catch (e) {
      console.error("Error updating browser favicon:", e);
    }
  }, [medicalData.faviconUrl]);

  const handleDataChange = (newData: MedicalLandingData | ((prev: MedicalLandingData) => MedicalLandingData)) => {
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
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Error clearing localStorage:", e);
    }
    setMedicalData(JSON.parse(JSON.stringify(defaultMedicalData)));
    setActiveProfileId(null);
    setActiveProfileIdState(null);
    refreshProfileStats();
    setIsResetConfirmOpen(false);
    setQuickSavedToast("¡Plantilla médica restablecida a los valores originales!");
    setTimeout(() => setQuickSavedToast(""), 3500);
  };

  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      const zip = new JSZip();
      
      const sharedVersion = Date.now().toString();
      const htmlCode = generateHtmlFile(medicalData, "https://tu-dominio.com", sharedVersion);
      const cssCode = generateDynamicStylesCss(medicalData);
      const jsonldCode = generateJsonLd(medicalData);
      const manifestCode = generateManifestJson(medicalData);
      const swCode = generateServiceWorkerJs(medicalData, sharedVersion);
      const llmsTxtCode = generateLlmsTxt(medicalData);
      const robotsTxtCode = generateRobotsTxt(medicalData);
      const sitemapXmlCode = generateSitemapXml(medicalData);
      const profileJsonCode = JSON.stringify({
        version: "1.0",
        tipoExportacion: "individual",
        fechaExportacion: new Date().toISOString(),
        cliente: {
          nombreMedico: medicalData.nombreMedico,
          especialidad: medicalData.especialidad,
          ciudad: medicalData.ciudad,
          clinica: medicalData.nombreClinicaGBP
        },
        data: medicalData
      }, null, 2);

      // Añadir archivos del proyecto
      zip.file("index.html", htmlCode);
      zip.file("estilos-config.css", cssCode);
      zip.file("manifest.json", manifestCode);
      zip.file("service-worker.js", swCode);
      zip.file("schema-physician-faq.json", jsonldCode);
      zip.file("llms.txt", llmsTxtCode);
      zip.file("robots.txt", robotsTxtCode);
      zip.file("sitemap.xml", sitemapXmlCode);
      zip.file("config-perfil.json", profileJsonCode);
      
      // README Informativo
      const readmeContent = `# Despliegue de Landing Page Médica

Este archivo ZIP contiene los entregables listos para producción para el especialista médico.

## Contenido del Paquete:
1. \`index.html\`: Código HTML5 semántico de alto rendimiento con diseño ultra-rápido, PWA integrado y optimización móvil.
2. \`estilos-config.css\`: Hoja de estilos CSS dinámicos con variables CSS (:root) para fuentes, colores, radios y componentes.
3. \`manifest.json\`: Archivo de configuración PWA para permitir la instalación en dispositivos móviles Android e iOS.
4. \`service-worker.js\`: Script para cachear recursos de manera offline-first, garantizando velocidad instantánea.
5. \`schema-physician-faq.json\`: Datos estructurados Schema.org listos para alimentar los motores de búsqueda de Google.
6. \`config-perfil.json\`: Copia de respaldo de todos los datos para re-importar y editar este perfil médico en el generador en cualquier momento.

## Instrucciones de Despliegue Directo:
Sube estos archivos directamente al directorio raíz de tu hosting (e.g. Netlify, Vercel, Firebase Hosting, Hostinger, Cloudflare Pages).
`;
      zip.file("README.md", readmeContent);

      const content = await zip.generateAsync({ type: "blob" });
      const sanitizedName = medicalData.nombreMedico.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remover acentos
        .replace(/[^a-z0-9]+/g, "-") // caracteres no alfanuméricos por guion
        .replace(/(^-|-$)/g, ""); // guiones en extremos
        
      const filename = `proyecto-landing-${sanitizedName || "doctor"}.zip`;
      
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setQuickSavedToast("¡Proyecto descargado con éxito (.ZIP)!");
      setTimeout(() => setQuickSavedToast(""), 3500);
    } catch (err) {
      console.error("Error al exportar el proyecto como .zip", err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleOpenExternalPreview = () => {
    try {
      const appUrl = medicalData.dominioWeb || "https://tu-dominio.com";
      const fullHtml = generateHtmlFile(medicalData, appUrl, Date.now().toString());
      const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Error al abrir vista previa externa:", err);
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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* LOGOTIPO OFICIAL MEDICO.EC */}
            <MedicoEcLogo className="h-9 shrink-0" />

            <div className="h-7 w-px bg-slate-200 hidden md:block" />

            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-extrabold text-slate-900 flex items-center gap-1.5 leading-tight truncate">
                Creador de Consultorio Digital 3.0
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
            
            {/* BOTÓN PREVISUALIZAR EN NAVEGADOR EXTERNO */}
            <button
              id="btn-main-open-browser"
              onClick={handleOpenExternalPreview}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 border border-blue-500"
              title="Abrir y previsualizar la web médica completa en una nueva pestaña del navegador para verla en pantalla completa"
            >
              <ExternalLink className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Ver en Navegador</span>
              <span className="sm:hidden">Web</span>
            </button>

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

            {/* BOTÓN FORMULARIO DE TOMA DE DATOS PARA MÉDICOS */}
            <button
              onClick={() => setIsGlobalIntakeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105 border border-emerald-500"
              title="Descargar o copiar formulario de toma de datos para enviar a tus clientes médicos"
            >
              <ClipboardList className="w-4 h-4 text-white" />
              <span className="hidden xl:inline">Formulario Médico</span>
              <span className="xl:hidden">Formulario</span>
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

            {/* BOTÓN CONMUTADOR DE TEMA CLARO/OSCURO */}
            <button
              id="btn-toggle-editor-theme"
              type="button"
              onClick={() => setEditorTheme(prev => prev === "light" ? "dark" : "light")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all hover:scale-105 cursor-pointer shrink-0 font-bold text-xs"
              title={editorTheme === "light" ? "Cambiar a Modo Oscuro para mayor ergonomía visual" : "Cambiar a Modo Claro"}
            >
              {editorTheme === "light" ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden lg:inline text-xs">Modo Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline text-xs">Modo Claro</span>
                </>
              )}
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

      {/* CUERPO DE LA APP 100% ANCHO COMPLETO (Doble Columna) */}
      <main id="app-main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
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
                <div className="flex items-center gap-1.5 flex-wrap">
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

                  <button
                    onClick={handleExportZip}
                    disabled={isExportingZip}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all font-black cursor-pointer shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-50"
                    title="Descargar todos los archivos listos para producción comprimidos en un archivo .ZIP"
                  >
                    <FolderArchive className={`w-3.5 h-3.5 text-blue-100 ${isExportingZip ? "animate-spin" : ""}`} />
                    <span>{isExportingZip ? "Preparando..." : "Descargar ZIP"}</span>
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
            
            <FormPanel 
              data={medicalData} 
              onChange={handleDataChange} 
            />
          </div>
        </section>

        {/* COLUMNA DERECHA: Vista Previa e Instancias de Código (7 Columnas - Fija en Escritorio) */}
        <section 
          id="workspace-section" 
          className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] lg:self-start shrink-0"
        >
          
          {/* Selector de espacio de trabajo */}
          <div id="workspace-tabs-container" className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none gap-2 shrink-0">
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

            <div className="flex items-center gap-2 shrink-0">
              {/* Badge de Sincronización en Vivo */}
              <div 
                id="design-version-pill-btn"
                className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-2xs"
                title="Cambios sincronizados en tiempo real"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sincronizado en Vivo</span>
              </div>

              <div className="hidden 2xl:flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 shrink-0">
                <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                <span>NAP en vivo</span>
              </div>
            </div>
          </div>

          {/* Renderizado Dinámico del Panel Seleccionado con Key Reactivo por Versión de Diseño */}
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
                  <PreviewPanel 
                    data={medicalData} 
                    onOpenExternalPreview={handleOpenExternalPreview}
                  />
                ) : rightTab === "code" ? (
                  <CodePanel 
                    data={medicalData} 
                  />
                ) : (
                  <SeoAuditPanel 
                    data={medicalData} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* FOOTER INFORMADO */}
      <footer id="app-global-footer" className="bg-white border-t border-slate-200 mt-auto py-6 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; 2026 Medico.ec - Creador de Consultorio Digital 3.0. Diseñado para cardiólogos, otorrinolaringólogos, cirujanos y especialistas del sector salud en Ecuador.</p>
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
        onOpenIntakeForm={() => setIsGlobalIntakeModalOpen(true)}
      />

      {/* Modal Formulario de Toma de Datos para Clientes Médicos */}
      <DoctorIntakeFormModal
        isOpen={isGlobalIntakeModalOpen}
        onClose={() => setIsGlobalIntakeModalOpen(false)}
        onOpenAiIngestion={() => setIsGlobalAiModalOpen(true)}
      />

      {/* Modal Generador de Código QR */}
      <QrGeneratorModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        data={medicalData}
      />

      {/* Modal de Confirmación para Restablecer Datos */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/90 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  ¿Restablecer información por defecto?
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Esta acción restaurará la plantilla clínica original.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              Se restablecerán todos los campos del formulario con los datos clínicos base (Dr. Alejandro Ruiz - Cardiología Pediátrica). Tus cambios locales no guardados en el catálogo se reemplazarán.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sí, Restablecer Todo</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

