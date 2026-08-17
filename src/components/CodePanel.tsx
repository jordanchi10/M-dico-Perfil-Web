/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData } from "../types";
import JSZip from "jszip";
import { motion, AnimatePresence } from "motion/react";
import { 
  generateHtmlFile, 
  generateManifestJson, 
  generateServiceWorkerJs, 
  generateJsonLd 
} from "../utils/generators";
import { downloadProfileAsJson } from "../utils/profileStorage";
import { 
  Download, 
  Copy, 
  Check, 
  BookOpen,
  FolderArchive,
  FileJson
} from "lucide-react";

interface CodePanelProps {
  data: MedicalLandingData;
}

type CodeTab = "html" | "jsonld" | "manifest" | "sw" | "profileJson" | "docs";

export default function CodePanel({ data }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<CodeTab>("html");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSpecific, setCopiedSpecific] = useState<"html" | "jsonld" | "profileJson" | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  const htmlCode = generateHtmlFile(data);
  const jsonldCode = generateJsonLd(data);
  const manifestCode = generateManifestJson(data);
  const swCode = generateServiceWorkerJs(data);
  const profileJsonCode = JSON.stringify({
    version: "1.0",
    tipoExportacion: "individual",
    fechaExportacion: new Date().toISOString(),
    cliente: {
      nombreMedico: data.nombreMedico,
      especialidad: data.especialidad,
      ciudad: data.ciudad,
      clinica: data.nombreClinicaGBP
    },
    data: data
  }, null, 2);

  const handleExportZip = async () => {
    try {
      setExporting(true);
      const zip = new JSZip();
      
      // Añadir archivos del proyecto
      zip.file("index.html", htmlCode);
      zip.file("manifest.json", manifestCode);
      zip.file("service-worker.js", swCode);
      zip.file("schema-physician-faq.json", jsonldCode);
      zip.file("config-perfil.json", profileJsonCode);
      
      // README Informativo
      const readmeContent = `# Despliegue de Landing Page Médica

Este archivo ZIP contiene los entregables listos para producción para el especialista médico.

## Contenido del Paquete:
1. \`index.html\`: Código HTML5 semántico de alto rendimiento con diseño ultra-rápido, PWA integrado y optimización móvil.
2. \`manifest.json\`: Archivo de configuración PWA para permitir la instalación en dispositivos móviles Android e iOS.
3. \`service-worker.js\`: Script para cachear recursos de manera offline-first, garantizando velocidad instantánea.
4. \`schema-physician-faq.json\`: Datos estructurados Schema.org listos para alimentar los motores de búsqueda de Google.
5. \`config-perfil.json\`: Copia de respaldo de todos los datos para re-importar y editar este perfil médico en el generador en cualquier momento.

## Instrucciones de Despliegue Directo:
Sube estos archivos directamente al directorio raíz de tu hosting (e.g. Netlify, Vercel, Firebase Hosting, Hostinger, Cloudflare Pages).
`;
      zip.file("README.md", readmeContent);

      const content = await zip.generateAsync({ type: "blob" });
      const sanitizedName = data.nombreMedico.toLowerCase()
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
    } catch (err) {
      console.error("Error al exportar el proyecto como .zip", err);
    } finally {
      setExporting(false);
    }
  };

  const handleCopySpecific = (type: "html" | "jsonld" | "profileJson") => {
    let code = htmlCode;
    if (type === "jsonld") code = jsonldCode;
    if (type === "profileJson") code = profileJsonCode;
    
    navigator.clipboard.writeText(code).then(() => {
      setCopiedSpecific(type);
      setTimeout(() => setCopiedSpecific(null), 2000);
    });
  };

  const getCodeContent = () => {
    switch (activeTab) {
      case "html":
        return htmlCode;
      case "jsonld":
        return jsonldCode;
      case "manifest":
        return manifestCode;
      case "sw":
        return swCode;
      case "profileJson":
        return profileJsonCode;
      default:
        return "";
    }
  };

  const getFilename = () => {
    switch (activeTab) {
      case "html":
        return "index.html";
      case "jsonld":
        return "schema-physician-faq.json";
      case "manifest":
        return "manifest.json";
      case "sw":
        return "service-worker.js";
      case "profileJson":
        return "config-perfil.json";
      default:
        return "";
    }
  };

  const handleCopy = () => {
    const code = getCodeContent();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (activeTab === "profileJson") {
      downloadProfileAsJson(data);
      return;
    }
    const code = getCodeContent();
    const filename = getFilename();
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "html", label: "index.html", desc: "Landing semántica completa", icon: "HTML" },
    { id: "profileJson", label: "config-perfil.json", desc: "Backup Re-importable", icon: "CONFIG" },
    { id: "jsonld", label: "JSON-LD (SEO)", desc: "Physician + FAQ Schema", icon: "SEO" },
    { id: "manifest", label: "manifest.json", desc: "PWA Manifest", icon: "PWA" },
    { id: "sw", label: "service-worker.js", desc: "Offline Cache", icon: "JS" },
    { id: "docs", label: "Guía Técnica", desc: "E-E-A-T & Hosting", icon: "DOCS" },
  ];

  return (
    <div id="code-panel-container" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full text-slate-100">
      
      {/* Selector de pestañas y Exportador Global */}
      <div id="code-tabs" className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-slate-800 bg-slate-950 px-2 md:px-4 py-2 md:py-0 gap-3 shrink-0">
        <div className="flex overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as CodeTab);
                  setCopied(false);
                }}
                className={`flex flex-col items-start px-3.5 md:px-4 py-3 border-b-2 text-left transition-all whitespace-nowrap gap-0.5 cursor-pointer ${
                  isActive
                    ? "border-blue-500 text-blue-400 bg-slate-900/40"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <span className="text-xs font-bold tracking-wider">{tab.label}</span>
                <span className="text-[9px] text-slate-500">{tab.desc}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center px-2 md:px-0 pb-1 md:pb-0">
          <button
            onClick={handleExportZip}
            disabled={exporting}
            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-blue-400/20 disabled:opacity-50"
          >
            <FolderArchive className={`w-4 h-4 text-blue-100 ${exporting ? "animate-spin" : ""}`} />
            <span>{exporting ? "Preparando ZIP..." : "Exportar Proyecto Completo (.zip)"}</span>
          </button>
        </div>
      </div>

      {/* Barra de Acceso Rápido al Portapapeles */}
      <div id="quick-copy-bar" className="bg-slate-950/85 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shrink-0">
        <span className="text-slate-300 font-bold flex items-center gap-2">
          <Copy className="w-4 h-4 text-blue-400 shrink-0" />
          Copiar Rápido:
        </span>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleCopySpecific("html")}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            title="Copiar el código HTML completo"
          >
            {copiedSpecific === "html" ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> ¡HTML Copiado!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> HTML Completo</>
            )}
          </button>

          <button
            onClick={() => handleCopySpecific("profileJson")}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            title="Copiar configuración JSON del cliente para re-importar después"
          >
            {copiedSpecific === "profileJson" ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> ¡JSON Copiado!</>
            ) : (
              <><FileJson className="w-3.5 h-3.5" /> Config JSON</>
            )}
          </button>

          <button
            onClick={() => handleCopySpecific("jsonld")}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            title="Copiar el marcado JSON-LD estructurado"
          >
            {copiedSpecific === "jsonld" ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> ¡SEO Copiado!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Schema JSON-LD</>
            )}
          </button>
        </div>
      </div>

      {/* Cabecera de Acciones (Solo para código descargable) */}
      {activeTab !== "docs" && (
        <div id="code-actions" className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/60 border-b border-slate-800 text-xs shrink-0">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Archivo: {getFilename()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Descargar
            </button>
          </div>
        </div>
      )}

      {/* Editor/Visualizador de Código */}
      <div id="code-display-area" className="flex-1 p-6 font-mono text-xs overflow-y-auto leading-relaxed h-[450px] bg-slate-950/90 text-emerald-400 scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full"
          >
            {activeTab === "docs" ? (
              <div className="font-sans text-slate-300 space-y-6 text-sm">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Guía Técnica de Implementación Médica
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Cómo optimizar esta landing page "marca blanca" para maximizar la conversión de pacientes y el posicionamiento SEO.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-1">1. Directrices E-E-A-T & YMYL (Salud)</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Para el algoritmo de Google, las páginas del sector salud entran en la categoría <strong>YMYL (Your Money or Your Life)</strong>, exigiendo altos niveles de <strong>Experiencia, Autoridad y Confiabilidad (E-E-A-T)</strong>.
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-slate-400">
                      <li><strong>Cédula Profesional visible:</strong> Siempre expón la cédula médica en el Hero y el Footer de manera transparente.</li>
                      <li><strong>Aseguradoras & Asociaciones:</strong> El slider y la sección nosotros contienen logotipos en escala de grises de aseguradoras y consejos de especialidad, que Google rastrea mediante texto alternativo.</li>
                      <li><strong>Consentimiento informado:</strong> El footer cuenta con enlaces preparados para Aviso de Privacidad de Datos de Salud y Consentimientos Quirúrgicos.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-1">2. Sincronización con Google Business Profile (Local SEO)</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Para dominar las búsquedas locales (el "Local 3-Pack" en Google Maps), los datos de la landing page deben coincidir con el perfil de Google Business Profile (GBP).
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-slate-400">
                      <li><strong>NAP Consistencia:</strong> El Nombre (Name), Dirección (Address) y Teléfono (Phone) en el JSON-LD de <code>Physician</code> son exactamente idénticos a los del perfil en Maps.</li>
                      <li><strong>Coordenadas exactas:</strong> Configura la latitud y longitud correctas para alimentar el mapa interactivo y sincronizar el backend de rastreo local de Google.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-1">3. Instalación PWA & Soporte Offline</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Al subir estos archivos a tu hosting web (e.g. Vercel, Netlify, Firebase Hosting), los navegadores móviles detectarán las cabeceras PWA:
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-slate-400">
                      <li><strong>Instalación nativa:</strong> Los pacientes verán un banner invitándolos a agregar el consultorio a su pantalla de inicio como una aplicación nativa.</li>
                      <li><strong>Soporte offline-first:</strong> Si el paciente pierde conectividad, el <code>service-worker.js</code> responderá inmediatamente sirviendo la caché local instantáneamente.</li>
                      <li><strong>Push Notifications:</strong> El service worker incluye la estructura para activar alertas y recordatorios de citas mediante suscripciones web.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-emerald-400 selection:bg-slate-800">{getCodeContent()}</pre>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
