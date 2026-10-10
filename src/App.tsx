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
  generateSitemapXml,
  generateServicePageHtml,
  slugifyMedicalService,
  normalizeDomainUrl,
  extractGoogleVerificationCode,
  getGoogleHtmlVerificationFilename,
  getGoogleHtmlVerificationContent
} from "./utils/generators";
import { prepareDataForHostingExport } from "./utils/exportZipPacker";
import { runLocalSeoAudit } from "./utils/localSeoAuditor";
import { LocalSeoAuditModal } from "./components/LocalSeoAuditModal";
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
  Moon,
  Cloud
} from "lucide-react";
import { auth, saveDoctorToCloud, formatFirestoreErrorMessage } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const LOCAL_STORAGE_KEY = "medical_landing_generator_state";

export default function App() {
  // Función para inicializar datos desde localStorage
  const getInitialData = (): MedicalLandingData => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Si tenía las 4 fotos iniciales de la plantilla previa, actualizar a las 3 por defecto
        if (
          parsed &&
          Array.isArray(parsed.fotosConsultorio) &&
          parsed.fotosConsultorio.length === 4 &&
          parsed.fotosConsultorio[3]?.id === "foto-cons-4"
        ) {
          parsed.fotosConsultorio = parsed.fotosConsultorio.slice(0, 3);
        }
        return parsed;
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    return defaultMedicalData;
  };

  // Datos reactivos de la landing page del médico
  const [medicalData, setMedicalData] = useState<MedicalLandingData>(getInitialData);
  const [previewKey, setPreviewKey] = useState<number>(() => Date.now());
  const [rightTab, setRightTab] = useState<"preview" | "code" | "audit">("preview");
  const [isGlobalAiModalOpen, setIsGlobalAiModalOpen] = useState(false);
  const [isGlobalIntakeModalOpen, setIsGlobalIntakeModalOpen] = useState(false);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLocalSeoAuditModalOpen, setIsLocalSeoAuditModalOpen] = useState(false);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(getActiveProfileId);
  const [savedProfilesCount, setSavedProfilesCount] = useState<number>(0);
  const [quickSavedToast, setQuickSavedToast] = useState<string>("");
  const [mobileActiveTab, setMobileActiveTab] = useState<"editor" | "workspace">("editor");

  // Estado de Firebase Cloud y sincronización automática
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clientManagerInitialTab, setClientManagerInitialTab] = useState<"import" | "catalog" | "export" | "cloud">("catalog");
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(false);
  const [firestoreSyncSuccess, setFirestoreSyncSuccess] = useState<boolean>(false);
  const [firestoreSyncError, setFirestoreSyncError] = useState<string | null>(null);
  const [lastFirestoreSavedAt, setLastFirestoreSavedAt] = useState<Date | null>(null);

  // Escuchar estado de Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  // Guardar en localStorage cuando cambie medicalData y notificar vistas externas
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(medicalData));
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("medical_landing_preview_sync");
        channel.postMessage({ type: "DATA_UPDATED", timestamp: Date.now() });
        channel.close();
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
    setPreviewKey(Date.now());
  }, [medicalData]);

  // Hook useEffect: detecta cambios en 'medicalData' y sincroniza automáticamente
  // el perfil actual con la colección de Firestore cuando 'currentUser' esté definido,
  // incluyendo un estado de carga y guardado exitoso.
  useEffect(() => {
    // Si el usuario no está logueado en Firebase, no sincronizar en la nube
    if (!currentUser) {
      setIsFirestoreSyncing(false);
      setFirestoreSyncSuccess(false);
      return;
    }

    // Estado de carga / sincronizando en progreso
    setIsFirestoreSyncing(true);
    setFirestoreSyncSuccess(false);
    setFirestoreSyncError(null);

    // Debounce de 1200ms para evitar escrituras excesivas durante la edición interactiva
    const syncTimeout = setTimeout(async () => {
      try {
        let currentId = activeProfileId || getActiveProfileId();
        if (!currentId) {
          currentId = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          setActiveProfileId(currentId);
          setActiveProfileIdState(currentId);
        }

        // Persistir en el catálogo local y en la colección de Firestore
        const savedProfile = saveProfile(medicalData, undefined, currentId);
        await saveDoctorToCloud(currentUser.uid, currentUser.email || "", savedProfile);

        // Actualizar estadísticas de perfiles
        refreshProfileStats();

        // Estado de guardado exitoso
        setIsFirestoreSyncing(false);
        setFirestoreSyncSuccess(true);
        setLastFirestoreSavedAt(new Date());

        // Restablecer el badge de éxito después de 3.5 segundos
        const timer = setTimeout(() => {
          setFirestoreSyncSuccess(false);
        }, 3500);

        return () => clearTimeout(timer);
      } catch (err: any) {
        console.error("Error al sincronizar automáticamente con Firestore:", err);
        setIsFirestoreSyncing(false);
        setFirestoreSyncSuccess(false);
        setFirestoreSyncError(formatFirestoreErrorMessage(err));
      }
    }, 1200);

    return () => {
      clearTimeout(syncTimeout);
    };
  }, [medicalData, currentUser, activeProfileId]);

  const handleForceRefresh = () => {
    setPreviewKey(Date.now());
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const channel = new BroadcastChannel("medical_landing_preview_sync");
        channel.postMessage({ type: "DATA_UPDATED", timestamp: Date.now() });
        channel.close();
      } catch (e) {
        console.error("BroadcastChannel error:", e);
      }
    }
    setQuickSavedToast("¡Vista previa sincronizada y re-renderizada!");
    setTimeout(() => setQuickSavedToast(""), 3000);
  };

  // Favicon de corazón por defecto para la plataforma web
  const defaultPlatformHeartFavicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ff3b5c'/%3E%3Cstop offset='100%25' stop-color='%23e11d48'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23g)' d='M16 28.5S4.5 21 2.2 14.3C-.4 7.6 4.3 2 10.3 2c3.5 0 5.7 2 5.7 2s2.2-2 5.7-2c6 0 10.7 5.6 8.1 12.3C27.5 21 16 28.5 16 28.5z'/%3E%3C/svg%3E";

  // Actualizar favicon de la pestaña en tiempo real (con icono de corazón de la plataforma)
  useEffect(() => {
    try {
      const activeFavicon = medicalData.pwaIconUrl || medicalData.faviconUrl || medicalData.logoUrl || defaultPlatformHeartFavicon;
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.type = activeFavicon.includes("svg") ? "image/svg+xml" : "image/x-icon";
      link.href = activeFavicon;
    } catch (e) {
      console.error("Error updating browser favicon:", e);
    }
  }, [medicalData.pwaIconUrl, medicalData.faviconUrl, medicalData.logoUrl]);

  // Mantener actualizado el script JSON-LD (Schema.org Physician + FAQPage) en el <head> del documento
  useEffect(() => {
    try {
      let schemaScript = document.querySelector("#injected-schema-jsonld") as HTMLScriptElement;
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.id = "injected-schema-jsonld";
        schemaScript.type = "application/ld+json";
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = generateJsonLd(medicalData);
    } catch (e) {
      console.error("Error updating JSON-LD in document head:", e);
    }
  }, [medicalData]);

  // Mantener actualizada la metaetiqueta de verificación de Google Search Console en el <head>
  useEffect(() => {
    try {
      const cleanCode = extractGoogleVerificationCode(medicalData.googleSiteVerification);
      let metaEl = document.querySelector("meta[name='google-site-verification']") as HTMLMetaElement;
      if (cleanCode) {
        if (!metaEl) {
          metaEl = document.createElement("meta");
          metaEl.name = "google-site-verification";
          document.head.appendChild(metaEl);
        }
        metaEl.content = cleanCode;
      } else if (metaEl) {
        metaEl.remove();
      }
    } catch (e) {
      console.error("Error updating Google verification meta tag:", e);
    }
  }, [medicalData.googleSiteVerification]);

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
      activeProfileId || undefined,
      existing?.notasInternas,
      existing?.etiquetaEspecialidad || medicalData.especialidad
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
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const appUrl = medicalData.dominioWeb || "https://tu-dominio.com";
      generateHtmlFile(medicalData, appUrl, "status-check");
      setPreviewError(false);
    } catch {
      setPreviewError(true);
    }
  }, [medicalData]);

  const isPreviewLive = isOnline && !previewError;

  const handleExportZip = async (overrideData?: MedicalLandingData, bypassAudit = false) => {
    const dataToExport = overrideData || medicalData;

    // 0. Auditoría de SEO Local obligatoria antes de permitir la descarga
    if (!bypassAudit) {
      const audit = runLocalSeoAudit(dataToExport);
      if (!audit.isComplete) {
        setIsLocalSeoAuditModalOpen(true);
        return;
      }
    }

    try {
      setIsExportingZip(true);
      const zip = new JSZip();
      const activeDomain = normalizeDomainUrl(dataToExport.dominioWeb);
      const sharedVersion = Date.now().toString();

      // 1. Procesar imágenes para almacenar físicamente en /img/ local
      const { exportedData, assets } = await prepareDataForHostingExport(dataToExport);

      if (assets.length > 0) {
        const imgFolder = zip.folder("img");
        if (imgFolder) {
          assets.forEach(asset => {
            const cleanFileName = asset.filename.replace(/^img\//, "");
            imgFolder.file(cleanFileName, asset.blob);
          });
        }
      }
      
      const htmlCode = generateHtmlFile(exportedData, activeDomain, sharedVersion);
      const cssCode = generateDynamicStylesCss(exportedData);
      const jsonldCode = generateJsonLd(exportedData, activeDomain);
      const manifestCode = generateManifestJson(exportedData);
      const swCode = generateServiceWorkerJs(exportedData, sharedVersion);
      const llmsTxtCode = generateLlmsTxt(exportedData);
      const robotsTxtCode = generateRobotsTxt(exportedData, activeDomain);
      const sitemapXmlCode = generateSitemapXml(exportedData, activeDomain);
      const profileJsonCode = JSON.stringify({
        version: "3.0",
        tipoExportacion: "individual",
        fechaExportacion: new Date().toISOString(),
        cliente: {
          nombreMedico: dataToExport.nombreMedico,
          especialidad: dataToExport.especialidad,
          ciudad: dataToExport.ciudad,
          clinica: dataToExport.nombreClinicaGBP,
          dominioWeb: activeDomain
        },
        data: dataToExport
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

      // Archivo HTML de verificación Google Search Console (si se configuró)
      const gscVerifyFilename = getGoogleHtmlVerificationFilename(dataToExport.googleVerificationFileCode || dataToExport.googleSiteVerification);
      if (gscVerifyFilename) {
        const gscVerifyContent = getGoogleHtmlVerificationContent(gscVerifyFilename);
        zip.file(gscVerifyFilename, gscVerifyContent);
      }

      // Páginas SEO dedicadas para cada servicio médico
      const serviciosFolder = zip.folder("servicios");
      (exportedData.servicios || []).forEach(srv => {
        const slug = srv.slug || slugifyMedicalService(srv.titulo);
        const serviceHtml = generateServicePageHtml(srv, exportedData, activeDomain, sharedVersion);
        if (serviciosFolder) {
          serviciosFolder.file(`${slug}.html`, serviceHtml);
          serviciosFolder.file(`${slug}/index.html`, serviceHtml);
        }
      });
      
      // README Informativo Completo
      const readmeContent = `# ${dataToExport.nombreMedico} - Landing Page Médica & PWA
## Especialidad: ${dataToExport.especialidad} | ${dataToExport.ciudad}, Ecuador
### Dominio Oficial Configurado: ${activeDomain}

Este archivo ZIP contiene los entregables listos para producción para el especialista médico.
Las imágenes están empaquetadas físicamente dentro de la carpeta local \`/img/\` para máxima velocidad, autonomía y durabilidad sin depender de servidores externos.

## 📦 Contenido del Paquete:
1. \`index.html\`: Código HTML5 semántico de alto rendimiento con diseño ultra-rápido, PWA integrado, URL canónica y optimización móvil.
2. \`/img/\`: Carpeta que contiene las imágenes del médico comprimidas en formato WebP local.
3. \`estilos-config.css\`: Hoja de estilos CSS dinámicos con variables CSS (:root) para fuentes, colores, radios y componentes.
4. \`/servicios/\`: Páginas HTML independientes optimizadas para SEO y Schema.org MedicalProcedure por cada tratamiento.
5. \`manifest.json\`: Archivo de configuración PWA para permitir la instalación en dispositivos móviles Android e iOS.
6. \`service-worker.js\`: Script para cachear recursos de manera offline-first, garantizando velocidad instantánea.
7. \`schema-physician-faq.json\`: Datos estructurados Schema.org listos para alimentar los motores de búsqueda de Google.
8. \`sitemap.xml\`: Mapa del sitio XML con todas las URLs de servicios y páginas.
9. \`robots.txt\`: Directivas de rastreo de motores de búsqueda.
10. \`llms.txt\`: Contexto semántico para buscadores y modelos de Inteligencia Artificial.
11. \`config-perfil.json\`: Copia de respaldo de todos los datos para re-importar y editar este perfil médico en cualquier momento.

## 🚀 Instrucciones de Despliegue Directo:
Sube estos archivos directamente al directorio raíz de tu hosting (e.g. Hostinger, cPanel / public_html, Cloudflare Pages, Netlify, Vercel).
`;
      zip.file("README.md", readmeContent);

      const content = await zip.generateAsync({ type: "blob" });
      const sanitizedName = dataToExport.nombreMedico.toLowerCase()
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
      
      setQuickSavedToast("¡Proyecto descargado con éxito (.ZIP completo)! ");
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

  // Si la vista activa es el Gestor de Clientes Médicos (Página Independiente)
  if (isClientManagerOpen) {
    return (
      <div id="app-root-container" className={`min-h-screen ${editorTheme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-800"} flex flex-col font-sans transition-colors duration-200`}>
        <ClientManagerModal
          isOpen={true}
          onClose={() => {
            setIsClientManagerOpen(false);
            refreshProfileStats();
          }}
          currentData={medicalData}
          onLoadProfile={handleLoadProfile}
          initialTab={clientManagerInitialTab}
          isFirestoreSyncing={isFirestoreSyncing}
          firestoreSyncSuccess={firestoreSyncSuccess}
        />
      </div>
    );
  }

  return (
    <div id="app-root-container" className={`min-h-screen ${editorTheme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* HEADER CLÍNICO */}
      <header id="app-main-header" className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50 shadow-sm shrink-0 transition-colors duration-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* LOGOTIPO OFICIAL MEDICO.EC */}
            <MedicoEcLogo className="h-9 shrink-0" />

            <div className="h-7 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-tight truncate">
                Creador de Consultorio Digital 3.0
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hidden md:inline-flex items-center gap-1">
                  🇪🇨 Exclusivo Ecuador
                </span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">
                Configura, importa y exporta landing pages médicas para más de 100 especialistas en Ecuador.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* BOTÓN PREVISUALIZAR EN NAVEGADOR EXTERNO CON INDICADOR DE ESTADO */}
            <button
              id="btn-main-open-browser"
              onClick={handleOpenExternalPreview}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 border border-blue-500"
              title={
                isPreviewLive
                  ? "Previsualización activa en vivo (Conectado). Clic para abrir en una nueva pestaña del navegador."
                  : "Estado inactivo o sin conexión a internet."
              }
            >
              {/* Indicador de estado (punto verde si activo, gris si error de conexión) */}
              <span className="relative flex h-2 w-2 shrink-0" aria-label={isPreviewLive ? "Estado: Activo" : "Estado: Desconectado"}>
                {isPreviewLive ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-emerald-100 shadow-xs" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400 border border-slate-300" />
                )}
              </span>

              <ExternalLink className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="hidden sm:inline">Ver en Navegador</span>
              <span className="sm:hidden">Web</span>
            </button>

            {/* BOTÓN GESTOR DE CLIENTES & IMPORTADOR */}
            <button
              id="btn-open-client-manager"
              onClick={() => {
                setClientManagerInitialTab("catalog");
                setIsClientManagerOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs shadow-md shadow-slate-900/10 cursor-pointer transition-all hover:scale-105 border border-slate-700"
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

            {/* BOTÓN NUBE FIREBASE */}
            <button
              id="btn-open-firebase-cloud"
              onClick={() => {
                setClientManagerInitialTab("cloud");
                setIsClientManagerOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all hover:scale-105 border ${
                currentUser
                  ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-600/70 shadow-xs"
                  : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              }`}
              title={
                currentUser
                  ? `Google Firebase Conectado (${currentUser.email}). Clic para gestionar tu nube.`
                  : "Sincronizar y respaldar médicos en Google Firebase"
              }
            >
              <Cloud className={`w-4 h-4 ${currentUser ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`} />
              <span className="hidden lg:inline">
                {currentUser ? "Nube Firebase" : "Nube Google"}
              </span>
              <span className="lg:hidden">Nube</span>
              {currentUser && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            {/* ESTADO EN VIVO DE SINCRONIZACIÓN AUTOMÁTICA CON FIRESTORE */}
            {currentUser && isFirestoreSyncing && (
              <div 
                id="header-firestore-syncing"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400 dark:border-amber-500/50 text-amber-900 dark:text-amber-200 text-xs font-black animate-pulse shadow-xs"
                title="Sincronizando automáticamente perfil actual en Firestore..."
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                <span className="hidden md:inline">Sincronizando Firestore...</span>
              </div>
            )}
            {currentUser && !isFirestoreSyncing && firestoreSyncSuccess && (
              <div 
                id="header-firestore-synced"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200 text-xs font-black animate-in fade-in shadow-xs"
                title={`Perfil médico sincronizado exitosamente con Firestore${lastFirestoreSavedAt ? ` (${lastFirestoreSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Guardado en Firestore</span>
              </div>
            )}

            {/* BOTÓN FORMULARIO DE TOMA DE DATOS PARA MÉDICOS */}
            <button
              onClick={() => setIsGlobalIntakeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105 border border-emerald-500"
              title={medicalData.tipoEnfoqueLanding === "clinica" 
                ? "Descargar o copiar formulario de toma de datos para tu Centro Médico / Clínica"
                : "Descargar o copiar formulario de toma de datos para enviar a tus clientes médicos"}
            >
              <ClipboardList className="w-4 h-4 text-white" />
              <span className="hidden xl:inline">
                {medicalData.tipoEnfoqueLanding === "clinica" ? "Formulario Clínica" : "Formulario Médico"}
              </span>
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

            {/* BOTÓN CONMUTADOR DE TEMA CLARO/OSCURO (SÓLO ICONO) */}
            <button
              id="btn-toggle-editor-theme"
              type="button"
              onClick={() => setEditorTheme(prev => prev === "light" ? "dark" : "light")}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 cursor-pointer shrink-0 font-bold flex items-center justify-center"
              title={editorTheme === "light" ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
              aria-label={editorTheme === "light" ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
            >
              {editorTheme === "light" ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
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

      {/* SELECTOR RESPONSIVO PARA MÓVIL Y TABLET (< lg) */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between gap-2 shadow-xs">
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setMobileActiveTab("editor")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              mobileActiveTab === "editor"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Formulario & Datos</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab("workspace")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              mobileActiveTab === "workspace"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Vista Previa & Código</span>
          </button>
        </div>
      </div>

      {/* CUERPO DE LA APP 100% ANCHO COMPLETO (Doble Columna en Desktop, Conmutado en Mobile) */}
      <main id="app-main-content" className="flex-1 w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Formulario de Control (5 Columnas en Desktop) */}
        <section 
          id="editor-section" 
          className={`lg:col-span-5 h-full ${mobileActiveTab === "editor" ? "block" : "hidden lg:block"}`} 
          aria-label="Panel de edición"
        >
          <div className="space-y-4">
            
            {/* TARJETA DE ESTADO DEL CLIENTE ACTUAL */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                        {activeProfileId ? "Cliente en Catálogo" : "Borrador en Curso"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {medicalData.ciudad || "Ecuador"}
                      </span>
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1 truncate" title={currentDoctorDisplay}>
                      {currentDoctorDisplay}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={currentSpecialtyDisplay}>
                      {currentSpecialtyDisplay} • {medicalData.nombreClinicaGBP || "Consultorio"}
                    </p>
                  </div>
                </div>
              </div>

              {/* BARRA DE ACCIONES RÁPIDAS DE PERFIL */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs gap-2 flex-wrap">
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
                    onClick={() => handleExportZip()}
                    disabled={isExportingZip}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all font-black cursor-pointer shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-50"
                    title="Descargar todos los archivos listos para producción comprimidos en un archivo .ZIP (Con auditoría previa de SEO Local)"
                  >
                    <FolderArchive className={`w-3.5 h-3.5 text-blue-100 ${isExportingZip ? "animate-spin" : ""}`} />
                    <span>{isExportingZip ? "Preparando..." : "Descargar ZIP"}</span>
                  </button>
                </div>

                <button
                  onClick={handleResetData}
                  className="flex items-center gap-1 px-2 py-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all text-xs font-semibold cursor-pointer"
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
          className={`lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] lg:self-start shrink-0 ${
            mobileActiveTab === "workspace" ? "flex" : "hidden lg:flex"
          }`}
        >
          
          {/* Selector de espacio de trabajo */}
          <div id="workspace-tabs-container" className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-none gap-2 shrink-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <button
                id="btn-workspace-preview"
                onClick={() => setRightTab("preview")}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  rightTab === "preview"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
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
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
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
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Auditoría SEO & E-E-A-T
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Botón de Refresco Forzado / Re-render */}
              <button
                id="btn-force-refresh-preview"
                type="button"
                onClick={handleForceRefresh}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:bg-blue-200 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-2xs hover:scale-105"
                title="Forzar re-renderizado inmediato de la vista previa"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Refrescar</span>
              </button>

              {/* Badge de Sincronización en Vivo */}
              <div 
                id="design-version-pill-btn"
                className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs"
                title="Cambios sincronizados en tiempo real"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Sincronizado en Vivo</span>
              </div>
            </div>
          </div>

          {/* Renderizado Dinámico del Panel Seleccionado con Key Reactivo por Versión de Diseño */}
          <div id="workspace-content-viewport" className="transition-all duration-300">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${rightTab}-${previewKey}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {rightTab === "preview" ? (
                  <PreviewPanel 
                    key={`preview-${previewKey}`}
                    data={medicalData} 
                    onOpenExternalPreview={handleOpenExternalPreview}
                    onForceRefresh={handleForceRefresh}
                  />
                ) : rightTab === "code" ? (
                  <CodePanel 
                    data={medicalData} 
                    onUpdateData={handleDataChange}
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
          <p>&copy; {new Date().getFullYear()} Medico.ec - Creador de Consultorio Digital 3.0. Diseñado para cardiólogos, otorrinolaringólogos, cirujanos y especialistas del sector salud en Ecuador.</p>
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
        isClinica={medicalData.tipoEnfoqueLanding === "clinica"}
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

      {/* Modal de Auditoría de SEO Local antes de Descargar el Proyecto */}
      <LocalSeoAuditModal
        isOpen={isLocalSeoAuditModalOpen}
        onClose={() => setIsLocalSeoAuditModalOpen(false)}
        data={medicalData}
        onSaveData={(updatedData) => {
          handleDataChange(updatedData);
        }}
        onProceedDownload={(updatedData) => {
          handleExportZip(updatedData || medicalData, true);
        }}
      />

    </div>
  );
}

