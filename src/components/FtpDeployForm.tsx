/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { MedicalLandingData } from "../types";
import { 
  generateHtmlFile, 
  generateDynamicStylesCss, 
  generateManifestJson, 
  generateServiceWorkerJs, 
  generateJsonLd,
  generateSitemapXml,
  generateRobotsTxt,
  generateLlmsTxt,
  generateServicePageHtml,
  slugifyMedicalService,
  normalizeDomainUrl,
  getGoogleHtmlVerificationFilename,
  getGoogleHtmlVerificationContent
} from "../utils/generators";
import { prepareDataForHostingExport } from "../utils/exportZipPacker";
import { FtpLogsPanel, FtpLogEntry, FtpLogLevel } from "./FtpLogsPanel";
import { 
  Server, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Globe, 
  Key, 
  Folder, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  Lock, 
  Trash2,
  HelpCircle,
  FileCode,
  Image as ImageIcon,
  Check,
  Terminal,
  Activity,
  Wifi,
  WifiOff,
  FileText,
  Layers,
  Clock,
  RotateCcw,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  Copy,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface FtpConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  remotePath: string;
  secure: boolean;
  rememberCredentials?: boolean;
  cleanBeforeUpload?: boolean;
}

interface FtpDeployFormProps {
  data: MedicalLandingData;
  onDeploySuccess?: (result: any) => void;
  isCompact?: boolean;
}

const STORAGE_KEY = "medicoec_ftp_config_v1";

export default function FtpDeployForm({ data, onDeploySuccess, isCompact = false }: FtpDeployFormProps) {
  const [ftpConfig, setFtpConfig] = useState<FtpConfig>({
    host: "",
    port: 21,
    user: "",
    password: "",
    remotePath: "public_html",
    secure: false,
    rememberCredentials: true,
    cleanBeforeUpload: false
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSeconds, setUploadSeconds] = useState<number>(0);
  const [currentFileTransfer, setCurrentFileTransfer] = useState<string>("");
  
  const [uploadResult, setUploadResult] = useState<{ 
    success: boolean; 
    message: string; 
    hint?: string;
    failedFile?: string;
    cleanedCount?: number;
    uploadedFiles?: string[];
    totalBytes?: number;
    elapsedSeconds?: string;
    remotePath?: string;
  } | null>(null);

  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showBatchManifest, setShowBatchManifest] = useState<boolean>(false);
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [logs, setLogs] = useState<FtpLogEntry[]>([]);
  const [showLogsPanel, setShowLogsPanel] = useState<boolean>(true);

  const timerRef = useRef<any>(null);

  // Helper para añadir registros al panel de logs
  const addLog = (level: FtpLogLevel, message: string, details?: any, hint?: string) => {
    const timestamp = new Date().toLocaleTimeString("es-EC", { hour12: false });
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp,
        level,
        message,
        details,
        hint
      }
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Timer para tracking de duración durante subida masiva
  useEffect(() => {
    if (uploading) {
      setUploadSeconds(0);
      timerRef.current = setInterval(() => {
        setUploadSeconds(sec => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [uploading]);

  // Cargar credenciales guardadas en localStorage o inferir del dominio
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFtpConfig(prev => ({
          ...prev,
          host: parsed.host || "",
          port: parsed.port || 21,
          user: parsed.user || "",
          password: parsed.password || "",
          remotePath: parsed.remotePath || "public_html",
          secure: parsed.secure ?? false,
          rememberCredentials: true
        }));
      } else if (data.dominioWeb) {
        const cleanHost = data.dominioWeb.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
        if (cleanHost && !cleanHost.includes("localhost")) {
          setFtpConfig(prev => ({
            ...prev,
            host: `ftp.${cleanHost}`
          }));
        }
      }
    } catch (e) {
      console.error("Error al cargar config FTP guardada:", e);
    }
  }, [data.dominioWeb]);

  const saveCredentialsToLocal = (cfg: FtpConfig) => {
    if (cfg.rememberCredentials) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          host: cfg.host,
          port: cfg.port,
          user: cfg.user,
          password: cfg.password,
          remotePath: cfg.remotePath,
          secure: cfg.secure
        }));
      } catch (e) {
        console.error("Error al guardar credenciales en localStorage:", e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleClearSaved = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFtpConfig({
      host: "",
      port: 21,
      user: "",
      password: "",
      remotePath: "public_html",
      secure: false,
      rememberCredentials: true
    });
    setTestResult(null);
    setUploadResult(null);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
    addLog("info", "Credenciales eliminadas de la memoria del navegador.");
  };

  // Convertir Blob a Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Probar Conexión FTP (Test Ping)
  const handleTestConnection = async () => {
    if (!ftpConfig.host.trim() || !ftpConfig.user.trim()) {
      const msg = "Por favor ingresa el Servidor FTP (Host) y el Usuario antes de probar la conexión.";
      setTestResult({
        success: false,
        message: msg
      });
      addLog("warning", msg);
      return;
    }

    setTestingConnection(true);
    setTestResult(null);
    const cleanHost = ftpConfig.host.trim().replace(/^ftp:\/\//i, "").replace(/\/.*$/, "");
    addLog("info", `[Test Ping] Iniciando prueba de conexión con socket ${cleanHost}:${ftpConfig.port || 21} (TLS: ${ftpConfig.secure ? 'Activo' : 'Inactivo'})...`);

    try {
      saveCredentialsToLocal(ftpConfig);

      const response = await fetch("/api/ftp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ftpConfig)
      });

      const resJson = await response.json();

      // Incorporar logs devueltos por el servidor si existen
      if (resJson.serverLogs && Array.isArray(resJson.serverLogs)) {
        resJson.serverLogs.forEach((sLog: any) => {
          addLog(sLog.type || "info", `[Servidor] ${sLog.message}`);
        });
      }

      if (resJson.success) {
        setTestResult({
          success: true,
          message: resJson.message || "Conexión y autenticación FTP exitosas.",
          details: resJson.serverInfo
        });
        addLog("success", `¡Verificación FTP exitosa! Directorio actual: ${resJson.serverInfo?.currentDir || ftpConfig.remotePath} (${resJson.serverInfo?.filesFound || 0} archivos encontrados).`);
      } else {
        setTestResult({
          success: false,
          message: resJson.error || "No se pudo conectar al servidor FTP con las credenciales indicadas."
        });
        addLog("error", resJson.error || "Fallo en la autenticación o conexión FTP.", null, resJson.hint);
      }
    } catch (err: any) {
      const errMsg = err.message || "Error de red al intentar comunicarse con el servidor FTP.";
      setTestResult({
        success: false,
        message: errMsg
      });
      addLog("error", errMsg);
    } finally {
      setTestingConnection(false);
    }
  };

  // Subir directamente todos los archivos generados en lote (Batch Upload) al hosting
  const handleDeployToHosting = async () => {
    if (!ftpConfig.host.trim() || !ftpConfig.user.trim()) {
      const errMsg = "Por favor completa el Host y Usuario FTP antes de iniciar la subida masiva.";
      setUploadResult({
        success: false,
        message: errMsg
      });
      addLog("warning", errMsg);
      return;
    }

    setUploading(true);
    setUploadResult(null);
    setUploadProgress(5);
    setCurrentFileTransfer("Iniciando preparación del paquete...");
    setShowLogsPanel(true);

    const activeDomain = normalizeDomainUrl(data.dominioWeb);
    const version = Date.now().toString();
    addLog("info", `=== INICIANDO SUBIDA MASIVA EN LOTE A HOSTING (${activeDomain}) ===`);

    try {
      saveCredentialsToLocal(ftpConfig);

      // FASE 1: Procesar fotografías y assets a WebP local
      setUploadProgress(15);
      setUploadStep("Fase 1/4: Extrayendo y optimizando fotografías médicas en formato WebP local...");
      setCurrentFileTransfer("Convirtiendo fotos del consultorio y perfil médico...");
      addLog("info", "Fase 1/4: Extrayendo y convirtiendo imágenes médicas a formato binario WebP en /img/...");

      const { exportedData, assets } = await prepareDataForHostingExport(data);
      
      assets.forEach(asset => {
        const sizeKb = (asset.blob.size / 1024).toFixed(1);
        addLog("file", `Asset optimizado: ${asset.filename} (${sizeKb} KB, tipo: ${asset.blob.type || 'image/webp'})`);
      });

      // FASE 2: Generar código estático completo para producción
      setUploadProgress(35);
      setUploadStep("Fase 2/4: Compilando páginas HTML, CSS dinámico, directivas SEO, llms.txt y PWA...");
      setCurrentFileTransfer("Generando index.html, estilos-config.css y sitemap.xml...");
      addLog("info", "Fase 2/4: Compilando index.html, estilos-config.css, sitemap.xml, robots.txt, llms.txt, manifest.json y sw.js...");

      const htmlCode = generateHtmlFile(exportedData, activeDomain, version);
      const cssCode = generateDynamicStylesCss(exportedData);
      const sitemapCode = generateSitemapXml(exportedData, activeDomain);
      const robotsCode = generateRobotsTxt(exportedData, activeDomain);
      const llmsCode = generateLlmsTxt(exportedData, activeDomain);
      const manifestCode = generateManifestJson(exportedData);
      const swCode = generateServiceWorkerJs(exportedData, version);
      const jsonldCode = generateJsonLd(exportedData, activeDomain);
      const profileJsonCode = JSON.stringify({
        version: "3.0",
        fechaExportacion: new Date().toISOString(),
        metadatos: {
          medico: data.nombreMedico,
          especialidad: data.especialidad,
          ciudad: data.ciudad,
          clinica: data.nombreClinicaGBP,
          dominioWeb: data.dominioWeb || activeDomain
        },
        data: data
      }, null, 2);

      const readmeContent = `# ${data.nombreMedico} - Landing Page Médica & PWA
Dominio Oficial: ${activeDomain}
Especialidad: ${data.especialidad} (${data.ciudad}, Ecuador)
Desplegado directamente en lote vía FTP el ${new Date().toLocaleString('es-EC')}.
`;

      const filesToUpload: Array<{ path: string; content: string; encoding?: "utf8" | "base64" }> = [
        { path: "index.html", content: htmlCode, encoding: "utf8" },
        { path: "estilos-config.css", content: cssCode, encoding: "utf8" },
        { path: "sitemap.xml", content: sitemapCode, encoding: "utf8" },
        { path: "robots.txt", content: robotsCode, encoding: "utf8" },
        { path: "llms.txt", content: llmsCode, encoding: "utf8" },
        { path: "manifest.json", content: manifestCode, encoding: "utf8" },
        { path: "service-worker.js", content: swCode, encoding: "utf8" },
        { path: "schema-physician-faq.json", content: jsonldCode, encoding: "utf8" },
        { path: "config-perfil.json", content: profileJsonCode, encoding: "utf8" },
        { path: "README.md", content: readmeContent, encoding: "utf8" }
      ];

      // Archivo HTML de verificación Google Search Console (si se configuró)
      const gscVerifyFilename = getGoogleHtmlVerificationFilename(data.googleVerificationFileCode || data.googleSiteVerification);
      if (gscVerifyFilename) {
        const gscVerifyContent = getGoogleHtmlVerificationContent(gscVerifyFilename);
        filesToUpload.push({
          path: gscVerifyFilename,
          content: gscVerifyContent,
          encoding: "utf8"
        });
        addLog("file", `Generado: ${gscVerifyFilename} (Verificación Google Search Console)`);
      }

      addLog("file", `Generado: index.html (${(htmlCode.length / 1024).toFixed(1)} KB)`);
      addLog("file", `Generado: estilos-config.css (${(cssCode.length / 1024).toFixed(1)} KB)`);
      addLog("file", `Generado: sitemap.xml, robots.txt & llms.txt (SEO e IA)`);
      addLog("file", `Generado: manifest.json & service-worker.js (PWA Offline)`);
      addLog("file", `Generado: schema-physician-faq.json (Marcado E-E-A-T)`);

      // Páginas dedicadas e individuales de servicios para SEO local
      (exportedData.servicios || []).forEach(srv => {
        const slug = srv.slug || slugifyMedicalService(srv.titulo);
        const serviceHtml = generateServicePageHtml(srv, exportedData, activeDomain, version);
        filesToUpload.push({
          path: `servicios/${slug}.html`,
          content: serviceHtml,
          encoding: "utf8"
        });
        filesToUpload.push({
          path: `servicios/${slug}/index.html`,
          content: serviceHtml,
          encoding: "utf8"
        });
        addLog("file", `Generado: servicios/${slug}.html (Landing individual)`);
      });

      // FASE 3: Empaquetar imágenes en Base64 binario
      setUploadProgress(55);
      setUploadStep(`Fase 3/4: Empaquetando ${assets.length} activos WebP en codificación binaria...`);
      setCurrentFileTransfer(`Procesando ${assets.length} imágenes físicas...`);
      addLog("info", `Fase 3/4: Empaquetando ${assets.length} activos WebP en codificación Base64...`);

      for (const asset of assets) {
        const base64Content = await blobToBase64(asset.blob);
        filesToUpload.push({
          path: asset.filename,
          content: base64Content,
          encoding: "base64"
        });
      }

      // FASE 4: Transmisión masiva vía socket FTP
      setUploadProgress(70);
      const phase4Text = ftpConfig.cleanBeforeUpload
        ? `Fase 4/4: Limpiando directorio "${ftpConfig.remotePath}" y transmitiendo lote de ${filesToUpload.length} archivos...`
        : `Fase 4/4: Conectando al servidor FTP y transmitiendo lote de ${filesToUpload.length} archivos a ${ftpConfig.remotePath}...`;
      setUploadStep(phase4Text);
      setCurrentFileTransfer(`Transmitiendo ${filesToUpload.length} archivos al hosting...`);
      addLog("info", `Fase 4/4: Transmitiendo lote de ${filesToUpload.length} archivos al host "${ftpConfig.host}" en "${ftpConfig.remotePath}"...`);

      if (ftpConfig.cleanBeforeUpload) {
        addLog("warning", `Directiva de limpieza previa activa: Se vaciará el contenido previo de "${ftpConfig.remotePath}" antes de subir los archivos.`);
      }

      // Enviar lote completo al servidor backend
      const response = await fetch("/api/ftp/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ftpConfig,
          files: filesToUpload,
          cleanBeforeUpload: ftpConfig.cleanBeforeUpload
        })
      });

      const resJson = await response.json();
      setUploadProgress(100);

      // Incorporar logs devueltos por el servidor durante la transferencia
      if (resJson.serverLogs && Array.isArray(resJson.serverLogs)) {
        resJson.serverLogs.forEach((sLog: any) => {
          const mappedLevel: FtpLogLevel = sLog.type === "warn" ? "warning" : (sLog.type || "file");
          addLog(mappedLevel, `[Servidor] ${sLog.message}`, sLog.details);
        });
      }

      if (resJson.success) {
        const outcome = {
          success: true,
          message: resJson.message || "¡Despliegue masivo completado con éxito!",
          uploadedFiles: resJson.uploadedFiles || [],
          cleanedCount: resJson.cleanedCount,
          totalBytes: resJson.totalBytes,
          elapsedSeconds: resJson.elapsedSeconds,
          remotePath: resJson.remotePath
        };
        setUploadResult(outcome);
        addLog(
          "success",
          `¡Despliegue masivo completado! ${resJson.uploadedCount || filesToUpload.length} archivos subidos exitosamente (${((resJson.totalBytes || 0) / 1024).toFixed(1)} KB) en ${resJson.elapsedSeconds || '0'}s.${resJson.cleanedCount ? ` (Limpieza previa: ${resJson.cleanedCount} ítems eliminados)` : ''}`,
          { remotePath: resJson.remotePath }
        );
        if (onDeploySuccess) onDeploySuccess(outcome);
      } else {
        const outcome = {
          success: false,
          message: resJson.error || "Ocurrió un error durante la transferencia en lote de archivos por FTP.",
          hint: resJson.hint,
          failedFile: resJson.failedFile,
          uploadedFiles: resJson.partialUploads || []
        };
        setUploadResult(outcome);
        addLog("error", resJson.error || "Fallo en la subida masiva al servidor.", null, resJson.hint);
      }
    } catch (err: any) {
      const errMsg = err.message || "Error al procesar la subida masiva al hosting.";
      setUploadResult({
        success: false,
        message: errMsg
      });
      addLog("error", errMsg);
    } finally {
      setUploading(false);
      setCurrentFileTransfer("");
    }
  };

  const copyDomainUrl = () => {
    const activeDomain = normalizeDomainUrl(data.dominioWeb);
    navigator.clipboard.writeText(activeDomain);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const activeDomain = normalizeDomainUrl(data.dominioWeb);

  // Estimación previa de archivos en el lote
  const estimatedServicesCount = (data.servicios || []).length;
  const estimatedImagesCount = 2 + (data.fotosConsultorio?.length || 0) + (data.casosAntesDespues?.length || 0) * 2;
  const estimatedTotalFiles = 11 + (estimatedServicesCount * 2) + Math.max(1, estimatedImagesCount);

  return (
    <div id="ftp-deploy-form-container" className="space-y-6 text-slate-200">
      
      {/* Banner Superior Informativo de Dominio */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-white">Subida Masiva Directa por FTP</h4>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Lote Completo 1-Clic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transmite todos los archivos estáticos generados (HTML, CSS, PWA, SEO y WebP) directamente a <span className="text-emerald-300 font-mono font-bold">{activeDomain}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowBatchManifest(!showBatchManifest)}
            className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer justify-center ${
              showBatchManifest 
                ? "bg-purple-950/60 border-purple-700/60 text-purple-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showBatchManifest ? "Ocultar Archivos del Lote" : `Ver Lote (~${estimatedTotalFiles} archivos)`}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLogsPanel(!showLogsPanel)}
            className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer justify-center ${
              showLogsPanel 
                ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showLogsPanel ? "Ocultar Logs" : `Ver Logs (${logs.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 cursor-pointer justify-center"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showGuide ? "Ocultar Guía" : "¿Dónde están mis credenciales?"}</span>
          </button>
        </div>
      </div>

      {/* Checklist / Manifiesto de Archivos del Lote en Despliegue */}
      <AnimatePresence>
        {showBatchManifest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/90 border border-purple-800/50 rounded-2xl p-4 sm:p-5 text-xs space-y-3 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="font-bold text-purple-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Manifiesto del Lote de Despliegue (Archivos generados listos para subida masiva):</span>
              </div>
              <span className="font-mono text-[11px] text-purple-200 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-700/60">
                Total estimado: ~{estimatedTotalFiles} archivos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                  <FileCode className="w-3.5 h-3.5" /> Páginas Web & CSS
                </div>
                <ul className="text-[11px] text-slate-300 font-mono space-y-1">
                  <li>• index.html (Landing principal)</li>
                  <li>• estilos-config.css (Variables dinámicas)</li>
                  <li>• servicios/*.html ({estimatedServicesCount} páginas dedicadas)</li>
                </ul>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                  <Globe className="w-3.5 h-3.5" /> SEO, IA & E-E-A-T
                </div>
                <ul className="text-[11px] text-slate-300 font-mono space-y-1">
                  <li>• sitemap.xml (Google Search Console)</li>
                  <li>• robots.txt (Directivas de rastreo)</li>
                  <li>• llms.txt (ChatGPT & Gemini AI)</li>
                  <li>• schema-physician-faq.json (JSON-LD)</li>
                </ul>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <div className="font-bold text-blue-400 flex items-center gap-1.5 text-[11px]">
                  <Zap className="w-3.5 h-3.5" /> PWA, Código Puro & Assets
                </div>
                <ul className="text-[11px] text-slate-300 font-mono space-y-1">
                  <li>• manifest.json & service-worker.js</li>
                  <li>• /img/*.webp (Fotos WebP físicas)</li>
                  <li>• config-perfil.json & README.md</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guía Desplegable para cPanel / Hostinger / DonWeb / SiteGround */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-4 text-xs space-y-3 text-slate-300 overflow-hidden"
          >
            <div className="font-bold text-blue-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Guía rápida para obtener o crear la cuenta FTP en el Hosting del médico:
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
              <li>
                <strong>Host / Servidor FTP:</strong> Generalmente <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">ftp.{data.dominioWeb?.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'tudominio.com'}</code> o la dirección IP de tu servidor.
              </li>
              <li>
                <strong>Usuario y Contraseña:</strong> El usuario principal de cPanel o una cuenta creada en la sección <em>"Cuentas FTP"</em> con acceso a la carpeta web.
              </li>
              <li>
                <strong>Directorio / Carpeta:</strong> En cPanel o Apache la carpeta raíz pública es <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono">public_html</code>. En Plesk suele ser <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono">httpdocs</code>.
              </li>
              <li>
                <strong>Conexión Segura FTPS:</strong> Recomendada para transferir datos cifrados mediante TLS/SSL.
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario de Parámetros FTP */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Host / Servidor FTP */}
          <div className="md:col-span-8 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" /> Servidor FTP (Host o IP) <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">ej. ftp.drperez.com o 198.51.100.1</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={ftpConfig.host}
                onChange={e => setFtpConfig({ ...ftpConfig, host: e.target.value })}
                placeholder="ftp.tudominio.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Puerto */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Puerto FTP</span>
              <span className="text-[10px] text-slate-500 font-normal">Estándar: 21</span>
            </label>
            <input
              type="number"
              value={ftpConfig.port}
              onChange={e => setFtpConfig({ ...ftpConfig, port: Number(e.target.value) || 21 })}
              placeholder="21"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
          </div>

          {/* Usuario FTP */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" /> Usuario FTP <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">ej. cpanel_user o doctor@dominio.com</span>
            </label>
            <input
              type="text"
              value={ftpConfig.user}
              onChange={e => setFtpConfig({ ...ftpConfig, user: e.target.value })}
              placeholder="usuario_cpanel"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
          </div>

          {/* Contraseña FTP */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Contraseña FTP
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={ftpConfig.password || ""}
                onChange={e => setFtpConfig({ ...ftpConfig, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono pr-10 transition-colors"
              />
            </div>
          </div>

          {/* Directorio de Destino Remoto */}
          <div className="md:col-span-12 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" /> Carpeta de Destino en el Hosting <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Normalmente public_html</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={ftpConfig.remotePath}
                onChange={e => setFtpConfig({ ...ftpConfig, remotePath: e.target.value })}
                placeholder="public_html"
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFtpConfig({ ...ftpConfig, remotePath: "public_html" })}
                  className={`px-3 py-1.5 text-xs rounded-xl font-mono border transition-all cursor-pointer ${
                    ftpConfig.remotePath === "public_html"
                      ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                  title="Raíz estándar cPanel / Apache"
                >
                  public_html
                </button>
                <button
                  type="button"
                  onClick={() => setFtpConfig({ ...ftpConfig, remotePath: "httpdocs" })}
                  className={`px-3 py-1.5 text-xs rounded-xl font-mono border transition-all cursor-pointer ${
                    ftpConfig.remotePath === "httpdocs"
                      ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                  title="Raíz estándar Plesk"
                >
                  httpdocs
                </button>
                <button
                  type="button"
                  onClick={() => setFtpConfig({ ...ftpConfig, remotePath: "/" })}
                  className={`px-3 py-1.5 text-xs rounded-xl font-mono border transition-all cursor-pointer ${
                    ftpConfig.remotePath === "/"
                      ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                  title="Raíz directa de la cuenta FTP"
                >
                  / (Raíz)
                </button>
              </div>
            </div>

            {/* Opción de Limpieza Previa del Directorio Raíz/Destino */}
            <div className={`mt-3 p-3.5 rounded-xl border transition-all ${
              ftpConfig.cleanBeforeUpload
                ? "bg-amber-950/40 border-amber-500/50 shadow-sm"
                : "bg-slate-950/60 border-slate-800/90 hover:border-slate-700"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={ftpConfig.cleanBeforeUpload || false}
                    onChange={e => setFtpConfig({ ...ftpConfig, cleanBeforeUpload: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Trash2 className={`w-3.5 h-3.5 ${ftpConfig.cleanBeforeUpload ? "text-amber-400" : "text-slate-400"}`} />
                      Limpiar directorio raíz antes de subir (Despliegue limpio)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Si el servidor destino no está vacío, elimina previamente los archivos y carpetas obsoletas en <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono text-[10px]">{ftpConfig.remotePath || 'public_html'}</code> antes de transferir la nueva versión.
                    </p>
                  </div>
                </label>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                  ftpConfig.cleanBeforeUpload
                    ? "bg-amber-900/60 border-amber-500/60 text-amber-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}>
                  {ftpConfig.cleanBeforeUpload ? "Activo" : "Inactivo"}
                </span>
              </div>

              {ftpConfig.cleanBeforeUpload && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2.5 pt-2.5 border-t border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Reemplazo limpio:</strong> Se vaciará el contenido de <strong className="font-mono text-amber-200">"{ftpConfig.remotePath || 'public_html'}"</strong> en el hosting para evitar archivos residuales o conflictos con versiones anteriores.
                  </span>
                </motion.div>
              )}
            </div>

          </div>

        </div>

        {/* Opciones de Seguridad y Guardado */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={ftpConfig.secure}
              onChange={e => setFtpConfig({ ...ftpConfig, secure: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-950 cursor-pointer"
            />
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Conexión Cifrada Segura FTPS / TLS (Recomendado)
            </span>
          </label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={ftpConfig.rememberCredentials}
                onChange={e => setFtpConfig({ ...ftpConfig, rememberCredentials: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-950 cursor-pointer"
              />
              <span>Recordar en este navegador</span>
            </label>
            
            <button
              type="button"
              onClick={handleClearSaved}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Borrar credenciales guardadas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {clearedNotice && (
          <div className="text-[11px] text-amber-400 font-mono bg-amber-950/30 border border-amber-800/40 p-2 rounded-lg text-center">
            ✓ Credenciales eliminadas de este navegador.
          </div>
        )}

      </div>

      {/* Botonera de Acción Principal: Probar Ping y Subir en Lote */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testingConnection || uploading}
          className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
          title="Verifica socket, login y permisos de carpeta sin subir archivos"
        >
          {testingConnection ? (
            <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          )}
          <span>{testingConnection ? "Realizando Test Ping al Servidor..." : "📡 Probar Conexión (Test Ping)"}</span>
        </button>

        <button
          type="button"
          onClick={handleDeployToHosting}
          disabled={uploading || testingConnection}
          className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transform active:scale-98 border border-emerald-400/30"
        >
          <UploadCloud className={`w-4 h-4 ${uploading ? "animate-bounce" : ""}`} />
          <span>{uploading ? "Subiendo Lote al Hosting..." : `🚀 Subir Todos los Archivos al Hosting (${estimatedTotalFiles} ítems)`}</span>
        </button>
      </div>

      {/* Retroalimentación Visual de Prueba de Conexión (Test Ping) */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className={`p-4 sm:p-5 rounded-2xl border text-xs shadow-xl transition-all ${
              testResult.success
                ? "bg-emerald-950/70 border-emerald-500/80 text-emerald-100 shadow-emerald-950/40"
                : "bg-rose-950/70 border-rose-600/80 text-rose-100 shadow-rose-950/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {testResult.success ? (
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                    <WifiOff className="w-5 h-5" />
                  </div>
                )}
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-white">{testResult.message}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        testResult.success
                          ? "bg-emerald-900/80 border-emerald-600 text-emerald-200"
                          : "bg-rose-900/80 border-rose-600 text-rose-200"
                      }`}
                    >
                      {testResult.success ? "PING OK (230 LOGIN)" : "ERROR DE CONEXIÓN"}
                    </span>
                  </div>

                  {testResult.details && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                      <div className="bg-slate-900/80 border border-emerald-800/40 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Host Conectado:</span>
                        <span className="text-white font-bold truncate block">{testResult.details.host}</span>
                      </div>

                      <div className="bg-slate-900/80 border border-emerald-800/40 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Directorio:</span>
                        <span className="text-emerald-300 font-bold truncate block">{testResult.details.currentDir || testResult.details.targetDir}</span>
                      </div>

                      <div className="bg-slate-900/80 border border-emerald-800/40 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Archivos Existentes:</span>
                        <span className="text-white font-bold">{testResult.details.filesFound} ítems</span>
                      </div>

                      <div className="bg-slate-900/80 border border-emerald-800/40 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Latencia Socket:</span>
                        <span className="text-amber-300 font-bold">
                          {testResult.details.responseTimeMs ? `${testResult.details.responseTimeMs} ms` : "OK"}
                        </span>
                      </div>
                    </div>
                  )}

                  {testResult.success && !uploading && (
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-emerald-200/90 font-medium">
                        ✓ Servidor validado. Puedes proceder con la subida masiva del lote de archivos con total seguridad.
                      </p>
                      <button
                        type="button"
                        onClick={handleDeployToHosting}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md shadow-emerald-600/30"
                      >
                        <UploadCloud className="w-3.5 h-3.5" /> Iniciar Subida del Lote
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTestResult(null)}
                className="text-slate-400 hover:text-white p-1 text-xs cursor-pointer"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESTADO DE CARGA MULTI-FASE EN TIEMPO REAL */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-emerald-500/50 p-5 sm:p-6 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span className="font-extrabold text-sm text-white">{uploadStep}</span>
              </div>
              {currentFileTransfer && (
                <p className="text-[11px] text-emerald-300/90 font-mono pl-6">
                  {currentFileTransfer}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="inline-flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{uploadSeconds < 10 ? `0${uploadSeconds}` : uploadSeconds}s</span>
              </div>
              <span className="font-mono text-emerald-400 font-black text-base">{uploadProgress}%</span>
            </div>
          </div>
          
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <motion.div 
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-md shadow-emerald-500/40"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px] text-slate-400">
            <div className={`p-2 rounded-lg border ${uploadProgress >= 15 ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-slate-950 border-slate-800'}`}>
              1. Optimizar WebP
            </div>
            <div className={`p-2 rounded-lg border ${uploadProgress >= 35 ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-slate-950 border-slate-800'}`}>
              2. Compilar HTML/CSS
            </div>
            <div className={`p-2 rounded-lg border ${uploadProgress >= 55 ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-slate-950 border-slate-800'}`}>
              3. Conexión & Auth
            </div>
            <div className={`p-2 rounded-lg border ${uploadProgress >= 70 ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-slate-950 border-slate-800'}`}>
              4. Transmisión FTP
            </div>
          </div>
        </motion.div>
      )}

      {/* CONFIRMACIÓN DE ÉXITO O GESTIÓN ROBUSTA DE ERRORES */}
      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-5 sm:p-6 rounded-2xl border text-xs space-y-4 shadow-2xl transition-all ${
            uploadResult.success
              ? "bg-emerald-950/70 border-emerald-500/80 text-emerald-100 shadow-emerald-950/50"
              : "bg-rose-950/70 border-rose-600/80 text-rose-100 shadow-rose-950/50"
          }`}
        >
          <div className="flex items-start gap-3.5">
            {uploadResult.success ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm text-white">{uploadResult.message}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    uploadResult.success
                      ? "bg-emerald-900/80 border-emerald-600 text-emerald-200"
                      : "bg-rose-900/80 border-rose-600 text-rose-200"
                  }`}
                >
                  {uploadResult.success ? "DESPLIEGUE EN LOTE EXITOSO" : "ERROR EN SUBIDA MASIVA"}
                </span>
              </div>

              {/* Si hubo error, mostrar diagnóstico, archivo fallido y consejo de solución */}
              {!uploadResult.success && (
                <div className="space-y-2 pt-1">
                  {uploadResult.failedFile && (
                    <div className="text-[11px] font-mono bg-slate-950/80 border border-rose-800/40 p-2.5 rounded-xl text-rose-200">
                      Archivo en transferencia: <strong className="text-white">{uploadResult.failedFile}</strong>
                    </div>
                  )}

                  {uploadResult.hint && (
                    <div className="text-[11px] bg-slate-900/90 border border-amber-500/40 p-3 rounded-xl text-amber-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> Solución sugerida:
                      </div>
                      <p>{uploadResult.hint}</p>
                    </div>
                  )}

                  {uploadResult.uploadedFiles && uploadResult.uploadedFiles.length > 0 && (
                    <p className="text-[11px] text-slate-300">
                      Archivos subidos previamente en esta sesión antes de la interrupción: <strong className="text-white">{uploadResult.uploadedFiles.length}</strong>
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleDeployToHosting}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reintentar Subida Masiva
                    </button>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Probar Conexión (Ping)
                    </button>
                  </div>
                </div>
              )}
              
              {/* Si fue exitoso, mostrar métricas y resumen de archivos */}
              {uploadResult.success && uploadResult.uploadedFiles && (
                <div className="text-[11px] text-emerald-300/90 space-y-2 pt-1">
                  <div className="font-mono bg-slate-900/90 p-3 rounded-xl border border-emerald-800/40 flex flex-wrap gap-x-5 gap-y-1.5">
                    <span>Directorio remoto: <strong className="text-white">{uploadResult.remotePath}</strong></span>
                    <span>Archivos subidos: <strong className="text-white">{uploadResult.uploadedFiles.length} ítems</strong></span>
                    <span>Volumen transmitido: <strong className="text-white">{((uploadResult.totalBytes || 0) / 1024).toFixed(1)} KB</strong></span>
                    <span>Duración: <strong className="text-white">{uploadResult.elapsedSeconds}s</strong></span>
                    {uploadResult.cleanedCount !== undefined && uploadResult.cleanedCount > 0 && (
                      <span className="text-amber-300">
                        🧹 Limpieza previa: <strong className="text-amber-200">{uploadResult.cleanedCount} archivos/carpetas eliminados</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-200">
                      <FileCode className="w-3 h-3" /> index.html
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-200">
                      <ImageIcon className="w-3 h-3" /> /img/ (WebP físicos)
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-200">
                      <Folder className="w-3 h-3" /> /servicios/ ({estimatedServicesCount} landing pages)
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-200">
                      <Globe className="w-3 h-3" /> sitemap.xml & robots.txt
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-200">
                      <Zap className="w-3 h-3" /> llms.txt (IA & SEO)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {uploadResult.success && (
            <div className="pt-3 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-slate-200 font-semibold text-xs">
                ¡Tu consultorio digital y todos sus archivos ya están publicados en vivo en tu hosting!
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={copyDomainUrl}
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Copiar URL al portapapeles"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? "URL Copiada" : "Copiar URL"}</span>
                </button>
                <a
                  href={activeDomain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir Sitio Web ({activeDomain.replace(/^https?:\/\//i, '')})
                </a>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* PANEL DE LOGS Y DIAGNÓSTICO EN TIEMPO REAL */}
      {showLogsPanel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2"
        >
          <FtpLogsPanel
            logs={logs}
            onClearLogs={clearLogs}
            isStreaming={uploading}
            uploadProgress={uploadProgress}
            status={uploading ? "uploading" : uploadResult ? (uploadResult.success ? "success" : "error") : testResult ? (testResult.success ? "success" : "error") : "idle"}
            onRetry={handleDeployToHosting}
          />
        </motion.div>
      )}

    </div>
  );
}

