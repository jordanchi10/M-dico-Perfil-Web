/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MedicalLandingData } from "../types";
import JSZip from "jszip";
import { motion, AnimatePresence } from "motion/react";
import { 
  generateHtmlFile, 
  generateDynamicStylesCss,
  generateManifestJson, 
  generateServiceWorkerJs, 
  generateJsonLd,
  generateSitemapXml,
  generateRobotsTxt,
  generateServicePageHtml,
  slugifyMedicalService,
  normalizeDomainUrl
} from "../utils/generators";
import { downloadProfileAsJson } from "../utils/profileStorage";
import { 
  Download, 
  Copy, 
  Check, 
  BookOpen,
  FolderArchive,
  FileJson,
  Globe,
  Lock,
  ShieldCheck,
  Smartphone,
  Server,
  WifiOff,
  CheckCircle2,
  Circle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Bot,
  MapPin,
  Key
} from "lucide-react";

interface CodePanelProps {
  data: MedicalLandingData;
  key?: React.Key;
}

type CodeTab = "html" | "css" | "sitemap" | "robots" | "jsonld" | "manifest" | "sw" | "profileJson" | "docs";

interface PwaCheckItem {
  id: string;
  titulo: string;
  descripcion: string;
  obligatorio: boolean;
}

const PWA_CHECKLIST_ITEMS: PwaCheckItem[] = [
  {
    id: "ssl",
    titulo: "1. Protocolo HTTPS / Certificado SSL Activo",
    descripcion: "El navegador rechaza el Service Worker si el sitio se carga en HTTP no seguro. Hosting con SSL (Cloudflare, Vercel, Netlify o cPanel) es obligatorio.",
    obligatorio: true
  },
  {
    id: "manifest_root",
    titulo: "2. Archivo manifest.json en la Raíz del Dominio",
    descripcion: "Debe residir en la raíz (https://tudominio.com/manifest.json) y estar vinculado en el <head> con <link rel='manifest' href='/manifest.json'>.",
    obligatorio: true
  },
  {
    id: "sw_scope",
    titulo: "3. Service Worker Registrado y Activo",
    descripcion: "El script service-worker.js debe residir en la raíz para tener alcance (scope: '/') sobre toda la landing page y manejar la caché offline.",
    obligatorio: true
  },
  {
    id: "icons_sizes",
    titulo: "4. Iconos PWA Cuadrados (192x192 y 512x512)",
    descripcion: "Imágenes cuadradas en formato PNG declaradas en el manifest para servir de icono en la pantalla de inicio de Android y en el splash screen de iOS.",
    obligatorio: true
  },
  {
    id: "viewport_mobile",
    titulo: "5. Viewport Móvil Responsivo y Meta Theme-Color",
    descripcion: "El meta viewport 'width=device-width, initial-scale=1.0' y 'theme-color' configuran la barra de estado del teléfono con el color clínico.",
    obligatorio: true
  },
  {
    id: "offline_test",
    titulo: "6. Prueba de Navegación en Modo Avión (Offline)",
    descripcion: "Carga la página una vez, activa el Modo Avión en el teléfono y recarga: la página debe mostrarse instantáneamente desde la caché del Service Worker.",
    obligatorio: false
  },
  {
    id: "lighthouse_pwa",
    titulo: "7. Validación en Chrome DevTools / Lighthouse",
    descripcion: "Abre DevTools (F12) > Pestaña 'Lighthouse' > Selecciona 'Progressive Web App' y verifica que cumpla con los estándares PWA de Google.",
    obligatorio: false
  }
];

export default function CodePanel({ data }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<CodeTab>("html");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSpecific, setCopiedSpecific] = useState<"html" | "jsonld" | "profileJson" | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [version, setVersion] = useState<string>(() => Date.now().toString());

  // Estado del checklist de verificación PWA
  const [checkedPwaItems, setCheckedPwaItems] = useState<Record<string, boolean>>({
    ssl: true,
    manifest_root: true,
    sw_scope: true,
    icons_sizes: true,
    viewport_mobile: true,
    offline_test: false,
    lighthouse_pwa: false
  });

  const togglePwaCheck = (id: string) => {
    setCheckedPwaItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    setVersion(Date.now().toString());
  }, [data]);

  const activeDomain = normalizeDomainUrl(data.dominioWeb);
  const htmlCode = generateHtmlFile(data, activeDomain, version);
  const cssCode = generateDynamicStylesCss(data);
  const jsonldCode = generateJsonLd(data, activeDomain);
  const sitemapCode = generateSitemapXml(data, activeDomain);
  const robotsCode = generateRobotsTxt(data, activeDomain);
  const manifestCode = generateManifestJson(data);
  const swCode = generateServiceWorkerJs(data, version);
  const profileJsonCode = JSON.stringify({
    version: "1.0",
    tipoExportacion: "individual",
    fechaExportacion: new Date().toISOString(),
    cliente: {
      nombreMedico: data.nombreMedico,
      especialidad: data.especialidad,
      ciudad: data.ciudad,
      clinica: data.nombreClinicaGBP,
      dominioWeb: data.dominioWeb || activeDomain
    },
    data: data
  }, null, 2);

  const completedPwaCount = Object.values(checkedPwaItems).filter(Boolean).length;
  const totalPwaCount = PWA_CHECKLIST_ITEMS.length;
  const pwaPercentage = Math.round((completedPwaCount / totalPwaCount) * 100);

  const handleExportZip = async () => {
    try {
      setExporting(true);
      const zip = new JSZip();
      
      // Añadir archivos del proyecto listos para producción
      zip.file("index.html", htmlCode);
      zip.file("estilos-config.css", cssCode);
      zip.file("sitemap.xml", sitemapCode);
      zip.file("robots.txt", robotsCode);
      zip.file("manifest.json", manifestCode);
      zip.file("service-worker.js", swCode);
      zip.file("schema-physician-faq.json", jsonldCode);
      zip.file("config-perfil.json", profileJsonCode);
      
      // Añadir páginas SEO dedicadas para cada servicio médico
      const serviciosFolder = zip.folder("servicios");
      (data.servicios || []).forEach(srv => {
        const slug = srv.slug || slugifyMedicalService(srv.titulo);
        const serviceHtml = generateServicePageHtml(srv, data, activeDomain, version);
        if (serviciosFolder) {
          serviciosFolder.file(`${slug}.html`, serviceHtml);
          serviciosFolder.file(`${slug}/index.html`, serviceHtml);
        }
      });
      
      // README Informativo con Guía de Dominio, SSL y PWA
      const readmeContent = `# ${data.nombreMedico} - Landing Page Médica & PWA
## Especialidad: ${data.especialidad} | ${data.ciudad}, Ecuador
### Dominio Oficial Configurado: ${activeDomain}

Este paquete contiene todos los archivos estáticos optimizados y listos para producción para el despliegue del consultorio digital.

---

## 📦 Contenido del Paquete:
1. \`index.html\`: Código HTML5 semántico de alto rendimiento con los 5 procedimientos principales (etiquetas <h2> para SEO), botón modal "Mis Servicios", PWA integrado, URL canónica vinculada a \`${activeDomain}\` y optimización móvil.
2. \`estilos-config.css\`: Hoja de estilos dinámicos independiente que exporta variables CSS (:root) con la paleta de color ${data.paletaColor.toUpperCase()}, fuentes Google Fonts, radios de curvatura, sombreados y clases de componentes personalizables.
3. \`/servicios/\`: Directorio con páginas HTML independientes y optimizadas para SEO (etiqueta MedicalProcedure, OpenGraph y JSON-LD) para cada uno de los ${(data.servicios || []).length} tratamientos médicos.
4. \`sitemap.xml\`: Mapa del sitio XML estándar para indexación rápida en Google Search Console y Bing Webmaster Tools con todas las URLs de servicios y páginas.
5. \`robots.txt\`: Directivas de rastreo de motores de búsqueda apuntando automáticamente al sitemap oficial.
6. \`manifest.json\`: Archivo de configuración PWA para permitir la instalación directa en teléfonos móviles Android e iOS.
7. \`service-worker.js\`: Script para cachear recursos de manera offline-first, garantizando velocidad instantánea de carga.
8. \`schema-physician-faq.json\`: Marcado estructurado Schema.org (Physician + FAQPage + MedicalBusiness) para Google SERP Rich Snippets.
9. \`config-perfil.json\`: Copia de respaldo de todos los datos para re-importar y editar este perfil médico en el generador en cualquier momento.

---

## 🚀 Guía de Despliegue en Servidor & Dominio Personalizado

### Paso 1: Elegir el Proveedor de Hosting
Recomendamos plataformas modernas con CDN global y SSL automático gratuito:
- **Cloudflare Pages** (Recomendado: SSL gratuito, CDN global ultra-rápido y protección anti-DDoS).
- **Vercel** o **Netlify** (Subida por arrastrar y soltar o conexión con Git).
- **Firebase Hosting** (Google Cloud infra con SSL instantáneo).
- **Hostinger / cPanel** (Carga tradicional vía Administrador de Archivos en la carpeta \`public_html\`).

### Paso 2: Subir los Archivos a la Raíz
Extrae el contenido de este archivo ZIP y sube todos los archivos (\`index.html\`, \`sitemap.xml\`, \`robots.txt\`, \`manifest.json\`, \`service-worker.js\`) directamente a la carpeta raíz de tu hosting (\`/\` o \`public_html\`).

### Paso 3: Configurar el Dominio Personalizado (${activeDomain.replace(/^https?:\/\//i, "")}) en tu Proveedor DNS
1. Accede al panel donde compraste tu dominio (NIC.ec, Namecheap, GoDaddy, Cloudflare, etc.).
2. En la zona de **Gestión de DNS**, crea los siguientes registros:
   - **Registro A**: Nombre \`@\` (raíz) -> Apuntando a la dirección IP de tu servidor hosting.
   - **Registro CNAME**: Nombre \`www\` -> Apuntando a tu dominio principal (\`${activeDomain.replace(/^https?:\/\//i, "")}\`) o al host asignado por tu CDN.
3. Espera de 10 a 60 minutos para la propagación DNS mundial.

### Paso 4: Activar Certificado SSL (HTTPS Obligatorio)
- Las plataformas como Cloudflare, Vercel y Netlify activan el certificado **SSL Let's Encrypt automáticamente**.
- Si utilizas cPanel, ve a **SSL/TLS Status** > Selecciona tu dominio y haz clic en **Run AutoSSL**.
- **Crucial:** Activa la opción de **Forzar redirección HTTPS** (Always use HTTPS). El protocolo seguro es obligatorio para que los teléfonos permitan la instalación de la PWA y para proteger la privacidad de los datos médicos de los pacientes.

### Paso 5: Enviar Sitemap a Google Search Console
1. Entra a [Google Search Console](https://search.google.com/search-console).
2. Añade tu propiedad con la URL \`${activeDomain}/\`.
3. Ve a la sección **Sitemaps** e ingresa \`sitemap.xml\`.
4. Google indexará todas las páginas, servicios y artículos de blog en pocas horas.

---

## 📱 Checklist de Instalación PWA para Pacientes

### En Teléfonos Android (Google Chrome):
1. El paciente entra a \`${activeDomain}\`.
2. Chrome mostrará automáticamente un aviso en la parte inferior: **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
3. Al pulsar instalar, el consultorio aparecerá como una app en el cajón de aplicaciones con el logotipo oficial del médico.

### En Teléfonos iPhone / iPad (Safari):
1. El paciente entra al sitio web en el navegador **Safari**.
2. Pulsa el botón central de **Compartir** (icono de cuadro con flecha hacia arriba).
3. Selecciona la opción **"Agregar a pantalla de inicio"** (Add to Home Screen).
4. El acceso directo se guardará en la pantalla del iPhone como una app nativa a pantalla completa.

---

## 📞 Soporte & Re-Edición
Para editar textos, cambiar fotos o actualizar servicios en el futuro:
1. Abre la herramienta generadora **Creador de Consultorio Digital 3.0**.
2. Haz clic en el botón **"Importar .JSON"** o en **"Gestor de Clientes"**.
3. Sube el archivo \`config-perfil.json\` incluido en este paquete para reanudar la edición exactamente donde la dejaste.
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

  const handleCopySpecific = (type: "html" | "jsonld" | "sitemap" | "profileJson") => {
    let code = htmlCode;
    if (type === "jsonld") code = jsonldCode;
    if (type === "sitemap") code = sitemapCode;
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
      case "css":
        return cssCode;
      case "sitemap":
        return sitemapCode;
      case "robots":
        return robotsCode;
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
      case "css":
        return "estilos-config.css";
      case "sitemap":
        return "sitemap.xml";
      case "robots":
        return "robots.txt";
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
    { id: "css", label: "estilos-config.css", desc: "Hoja de Estilos Dinámica", icon: "CSS" },
    { id: "sitemap", label: "sitemap.xml", desc: "Indexación Google", icon: "MAP" },
    { id: "robots", label: "robots.txt", desc: "Directivas de Rastreo", icon: "BOT" },
    { id: "jsonld", label: "JSON-LD (SEO)", desc: "Physician + FAQ Schema", icon: "SEO" },
    { id: "manifest", label: "manifest.json", desc: "PWA Manifest", icon: "PWA" },
    { id: "sw", label: "service-worker.js", desc: "Offline Cache", icon: "JS" },
    { id: "profileJson", label: "config-perfil.json", desc: "Backup Re-importable", icon: "CONFIG" },
    { id: "docs", label: "Guía Técnica & PWA", desc: "Dominio, SSL & Checklist", icon: "DOCS" },
  ];

  return (
    <div id="code-panel-container" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full text-slate-100">
      
      {/* Banner de Dominio Activo & Estado de Vinculación Global */}
      <div id="code-domain-banner" className="bg-gradient-to-r from-slate-950 via-blue-950/80 to-slate-950 px-4 sm:px-6 py-3 border-b border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase text-blue-300 tracking-wider">Dominio Oficial Vinculado:</span>
              {activeDomain.startsWith("https://") ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> SSL Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  HTTP (Se recomienda HTTPS)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <code className="text-xs font-mono font-bold text-white tracking-wide truncate bg-slate-900/90 px-2 py-0.5 rounded border border-blue-800/40">
                {activeDomain}
              </code>
              <a
                href={activeDomain}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-sans font-medium"
                title="Abrir URL en pestaña nueva"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Badges de Vinculación SEO/PWA */}
        <div className="flex items-center gap-1.5 flex-wrap self-stretch md:self-auto justify-start md:justify-end">
          <span className="text-[10px] font-mono bg-blue-900/40 text-blue-200 border border-blue-700/50 px-2 py-1 rounded-md flex items-center gap-1" title="Etiqueta Canonical configurada">
            <span className="text-emerald-400">✓</span> Canonical
          </span>
          <span className="text-[10px] font-mono bg-blue-900/40 text-blue-200 border border-blue-700/50 px-2 py-1 rounded-md flex items-center gap-1" title="Sitemap XML generado">
            <span className="text-emerald-400">✓</span> Sitemap
          </span>
          <span className="text-[10px] font-mono bg-blue-900/40 text-blue-200 border border-blue-700/50 px-2 py-1 rounded-md flex items-center gap-1" title="Robots.txt generado">
            <span className="text-emerald-400">✓</span> Robots.txt
          </span>
          <span className="text-[10px] font-mono bg-purple-900/40 text-purple-200 border border-purple-700/50 px-2 py-1 rounded-md flex items-center gap-1" title="Schema.org Physician estructurado">
            <span className="text-emerald-400">✓</span> Schema.org
          </span>
        </div>
      </div>

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
            onClick={() => handleCopySpecific("sitemap")}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            title="Copiar Sitemap XML para Google Search Console"
          >
            {copiedSpecific === "sitemap" ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> ¡Sitemap Copiado!</>
            ) : (
              <><Globe className="w-3.5 h-3.5" /> Sitemap XML</>
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

      {/* Editor/Visualizador de Código o Guía Técnica Interactiva */}
      <div id="code-display-area" className="flex-1 p-6 font-mono text-xs overflow-y-auto leading-relaxed h-[520px] bg-slate-950/90 text-emerald-400 scrollbar-thin">
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
                
                {/* Encabezado de la Guía */}
                <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
                      Guía de Despliegue, Dominio Propio, SSL & PWA
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Instrucciones prácticas paso a paso para publicar el consultorio digital con dominio personalizado y validación de Progressive Web App.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-800/60 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-[11px] font-extrabold text-blue-200">E-E-A-T & PWA Ready</span>
                  </div>
                </div>

                <div className="space-y-6">

                  {/* SECCIÓN 1: CONFIGURACIÓN DE DOMINIO PERSONALIZADO */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2.5 text-blue-400 border-b border-slate-800/80 pb-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wide text-white">1. Configuración de Dominio Personalizado (.com, .ec, .med.ec)</h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Tener un dominio personalizado (ejemplo: <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">drpedroperez.com</code> o <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">cardiologiapediatrica.ec</code>) transmite máxima autoridad médica ante los pacientes y acelera la indexación en Google.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Paso A</span>
                        <h5 className="text-xs font-bold text-white mb-1">Registrar el Dominio</h5>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Adquiere tu dominio en <strong>NIC.ec</strong> (para dominios .ec / .med.ec en Ecuador) o en registradores como Namecheap, GoDaddy o Cloudflare.
                        </p>
                      </div>

                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Paso B</span>
                        <h5 className="text-xs font-bold text-white mb-1">Elegir el Hosting</h5>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Recomendamos <strong>Cloudflare Pages</strong> o <strong>Vercel/Netlify</strong> por su CDN ultra-rápido, o tu hosting cPanel tradicional con Apache/Nginx.
                        </p>
                      </div>

                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Paso C</span>
                        <h5 className="text-xs font-bold text-white mb-1">Subir Archivos</h5>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Extrae el archivo <code className="text-emerald-400">.zip</code> descargado y sube <code className="text-emerald-400">index.html</code>, <code className="text-emerald-400">manifest.json</code> y <code className="text-emerald-400">service-worker.js</code> a la raíz (<code className="text-slate-300">public_html</code>).
                        </p>
                      </div>
                    </div>

                    {/* Tabla de Registros DNS */}
                    <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800">
                      <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-blue-400" />
                        Registros DNS que debes configurar en tu panel de dominio:
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-left">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-bold">
                              <th className="pb-1.5 font-mono">Tipo</th>
                              <th className="pb-1.5 font-mono">Nombre / Host</th>
                              <th className="pb-1.5 font-mono">Valor / Destino</th>
                              <th className="pb-1.5">Propósito</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                            <tr>
                              <td className="py-1.5 text-blue-400 font-bold">A</td>
                              <td className="py-1.5">@ (o tu dominio)</td>
                              <td className="py-1.5 text-emerald-400">IP de tu Servidor</td>
                              <td className="py-1.5 font-sans text-slate-400">Apunta el dominio raíz al hosting</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-blue-400 font-bold">CNAME</td>
                              <td className="py-1.5">www</td>
                              <td className="py-1.5 text-emerald-400">tudominio.com</td>
                              <td className="py-1.5 font-sans text-slate-400">Redirige el subdominio www</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: CONFIGURACIÓN DE SSL / HTTPS */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2.5 text-emerald-400 border-b border-slate-800/80 pb-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wide text-white">2. Configuración de Certificado SSL & Forzar HTTPS (Indispensable)</h4>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">¿Por qué es obligatorio HTTPS?</strong> Los navegadores modernos (Safari iOS y Chrome Android) <strong>bloquean por completo la instalación de PWA</strong> y la activación del Service Worker si el sitio web no se sirve bajo un protocolo cifrado SSL (<code className="text-white bg-slate-900 px-1 rounded">https://</code>). Además, es fundamental para el cumplimiento de privacidad en salud.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          En Hosting Moderno (Cloudflare / Vercel / Netlify)
                        </h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          El certificado SSL se genera <strong>automáticamente y gratis (Let's Encrypt)</strong> al conectar tu dominio. En Cloudflare, ve a <em>SSL/TLS</em> y activa el modo <strong>"Full"</strong> y la casilla <strong>"Always Use HTTPS"</strong>.
                        </p>
                      </div>

                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          En Hosting Tradicional cPanel
                        </h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Entra a tu cPanel &gt; Busca la herramienta <strong>SSL/TLS Status</strong> &gt; Selecciona tu dominio y haz clic en <strong>"Run AutoSSL"</strong>. Luego activa <strong>"Force HTTPS Redirect"</strong> en la sección Dominios.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: CHECKLIST DE VERIFICACIÓN PWA INTERACTIVO */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5 text-indigo-400">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold uppercase tracking-wide text-white">3. Checklist de Verificación PWA (Progressive Web App)</h4>
                          <p className="text-[11px] text-slate-400">Marca los puntos verificados antes de entregar la landing page al médico.</p>
                        </div>
                      </div>

                      {/* Medidor de Progreso */}
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
                        <span className="text-xs font-bold text-slate-400">Progreso:</span>
                        <span className="text-xs font-black text-emerald-400">{completedPwaCount}/{totalPwaCount}</span>
                        <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                            style={{ width: `${pwaPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{pwaPercentage}%</span>
                      </div>
                    </div>

                    {/* Lista Interactiva de Checks */}
                    <div className="space-y-2.5 pt-1">
                      {PWA_CHECKLIST_ITEMS.map((item) => {
                        const isChecked = checkedPwaItems[item.id] || false;
                        return (
                          <div
                            key={item.id}
                            onClick={() => togglePwaCheck(item.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isChecked
                                ? "bg-emerald-950/20 border-emerald-800/40 text-slate-200 hover:bg-emerald-950/30"
                                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-950 hover:text-slate-300"
                            }`}
                          >
                            <button
                              type="button"
                              className="mt-0.5 text-emerald-400 shrink-0 focus:outline-hidden"
                              aria-label={isChecked ? "Marcado" : "Desmarcado"}
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 fill-emerald-400/20" />
                              ) : (
                                <Circle className="w-4.5 h-4.5 text-slate-600 hover:text-slate-400" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isChecked ? "text-white" : "text-slate-300"}`}>
                                  {item.titulo}
                                </span>
                                {item.obligatorio && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Requerido
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                {item.descripcion}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECCIÓN 4: GUÍA DE INSTALACIÓN PARA PACIENTES (ANDROID & IOS) */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-sm font-extrabold uppercase tracking-wide text-white flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      4. Cómo Instala el Paciente la App en su Teléfono
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Android Chrome */}
                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <span>📱 En Android (Google Chrome)</span>
                        </div>
                        <ol className="list-decimal pl-4 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                          <li>El paciente abre <code className="text-emerald-300 font-mono">https://tudominio.com</code> en Chrome.</li>
                          <li>Chrome detecta el <code className="text-slate-400 font-mono">manifest.json</code> y muestra el banner inferior automático: <strong>"Instalar aplicación"</strong>.</li>
                          <li>Si no aparece automáticamente, pulsar el menú ⋮ (tres puntos) &gt; <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
                          <li>Se creará el icono oficial con acceso directo a pantalla completa.</li>
                        </ol>
                      </div>

                      {/* iPhone Safari */}
                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                          <span>🍏 En iPhone / iPad (Safari)</span>
                        </div>
                        <ol className="list-decimal pl-4 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                          <li>El paciente abre el enlace en el navegador <strong>Safari</strong> de iOS.</li>
                          <li>Toca el botón central de <strong>Compartir</strong> (icono de cuadro con flecha hacia arriba).</li>
                          <li>Desliza hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong>.</li>
                          <li>Confirma el nombre del médico. La PWA se abrirá sin barra de navegación del navegador (Standalone).</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 5: E-E-A-T & YMYL Y GOOGLE BUSINESS PROFILE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">Directrices E-E-A-T & YMYL (Salud)</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Para Google, el sector salud entra en <strong>YMYL (Your Money or Your Life)</strong>. Se valida:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                        <li><strong>Cédula Profesional visible:</strong> En Hero y Footer para transparencia médica.</li>
                        <li><strong>Sociedades & Convenios:</strong> Logos y sellos de especialidad para validación de autoridad.</li>
                        <li><strong>Aviso de Privacidad:</strong> Consentimiento de datos médicos en el pie de página.</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">Sincronización Local SEO (GBP)</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Para aparecer en el <em>Local 3-Pack de Google Maps</em> en Ecuador:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                        <li><strong>Consistencia NAP:</strong> Nombre, Dirección y Teléfono idénticos a Google Maps.</li>
                        <li><strong>Coordenadas GPS:</strong> Latitud y longitud exactas configuradas en el JSON-LD.</li>
                        <li><strong>Ficha verificada:</strong> Enlaza tu landing page como sitio web oficial en Google Business Profile.</li>
                      </ul>
                    </div>
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

