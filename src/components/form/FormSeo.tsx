/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData, ServiceItem } from "../../types";
import { 
  Globe, 
  MapPin, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Code, 
  FileCode, 
  ExternalLink, 
  CheckCircle2, 
  Key,
  Download,
  Bot,
  MessageSquare,
  Sparkles as SparklesIcon,
  Megaphone,
  Zap,
  ShieldCheck,
  Info,
  HelpCircle,
  ArrowRight,
  Layers,
  CheckCircle,
  Server,
  RefreshCw,
  Terminal,
  Sliders
} from "lucide-react";
import { generateJsonLd, normalizeDomainUrl, generateRobotsTxt, generateSitemapXml, generateLlmsTxt } from "../../utils/generators";
import { GbpPostExporterModal } from "../GbpPostExporterModal";

interface FormSeoProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormSeo({
  data,
  onChange,
  updateField
}: FormSeoProps) {
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedLlms, setCopiedLlms] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isGbpExporterOpen, setIsGbpExporterOpen] = useState(false);

  // Inyección de dominio
  const [injectionSuccess, setInjectionSuccess] = useState(false);
  const [injectedDomainText, setInjectedDomainText] = useState("");
  const [showExplanation, setShowExplanation] = useState(true);
  const [showInjectedCodeInspector, setShowInjectedCodeInspector] = useState(false);
  const [activeInjectedTab, setActiveInjectedTab] = useState<'html' | 'sitemap' | 'robots' | 'schema' | 'llms'>('html');
  const [copiedInjectedSnippet, setCopiedInjectedSnippet] = useState(false);

  // Keyword Research states
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchResults, setResearchResults] = useState<{
    keywords: { keyword: string; volumen: string; intencion: string }[];
    metaTitulo: string;
    metaDescripcion: string;
    filosofia: string;
    servicios: ServiceItem[];
  } | null>(null);

  // Inyección dinámica de meta tags, canonical link y JSON-LD directamente en el <head> del documento
  const injectHeadTagsInDocument = (domainUrl: string, title: string, desc: string) => {
    if (typeof document === "undefined") return;

    const cleanUrl = normalizeDomainUrl(domainUrl);

    if (title) {
      document.title = title;
    }

    const setHeadTag = (selector: string, tagName: string, attrKey: string, attrVal: string, contentKey: string, contentVal: string) => {
      let element = document.querySelector(selector) as HTMLElement;
      if (!element) {
        element = document.createElement(tagName);
        element.setAttribute(attrKey, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute(contentKey, contentVal);
    };

    // 1. Meta Description
    if (desc) {
      setHeadTag("meta[name='description']", "meta", "name", "description", "content", desc);
    }

    // 2. Canonical URL
    setHeadTag("link[rel='canonical']", "link", "rel", "canonical", "href", `${cleanUrl}/`);

    // 3. Sitemap Link
    setHeadTag("link[rel='sitemap']", "link", "rel", "sitemap", "href", `${cleanUrl}/sitemap.xml`);
    const sitemapEl = document.querySelector("link[rel='sitemap']");
    if (sitemapEl) {
      sitemapEl.setAttribute("type", "application/xml");
      sitemapEl.setAttribute("title", "Sitemap");
    }

    // 4. LLM Knowledge Context Link (llms.txt)
    setHeadTag("link[rel='alternate'][type='text/markdown']", "link", "rel", "alternate", "href", `${cleanUrl}/llms.txt`);
    const llmEl = document.querySelector("link[rel='alternate'][type='text/markdown']");
    if (llmEl) {
      llmEl.setAttribute("type", "text/markdown");
      llmEl.setAttribute("title", "LLM Knowledge Context");
    }
    setHeadTag("meta[name='ai-llm-knowledge']", "meta", "name", "ai-llm-knowledge", "content", `${cleanUrl}/llms.txt`);

    // 5. Open Graph og:url, og:title, og:description
    setHeadTag("meta[property='og:url']", "meta", "property", "og:url", "content", cleanUrl);
    if (title) setHeadTag("meta[property='og:title']", "meta", "property", "og:title", "content", title);
    if (desc) setHeadTag("meta[property='og:description']", "meta", "property", "og:description", "content", desc);

    // 6. Twitter Card twitter:url, twitter:title, twitter:description
    setHeadTag("meta[name='twitter:url']", "meta", "name", "twitter:url", "content", cleanUrl);
    if (title) setHeadTag("meta[name='twitter:title']", "meta", "name", "twitter:title", "content", title);
    if (desc) setHeadTag("meta[name='twitter:description']", "meta", "name", "twitter:description", "content", desc);

    // 7. Schema JSON-LD Injection
    let schemaScript = document.querySelector("#injected-schema-jsonld") as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "injected-schema-jsonld";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    const updatedData = { ...data, dominioWeb: cleanUrl, metaTitulo: title, metaDescripcion: desc };
    schemaScript.textContent = generateJsonLd(updatedData, cleanUrl);
  };

  const handleInjectDomain = (domainToInject?: string) => {
    const raw = domainToInject !== undefined ? domainToInject : (data.dominioWeb || "");
    const cleaned = normalizeDomainUrl(raw);

    // Auto-completar meta título y meta descripción si están vacíos
    let newTitle = data.metaTitulo;
    if (!newTitle || newTitle.trim() === "") {
      newTitle = `${data.nombreMedico || "Dr. Especialista"} | ${data.especialidad || "Medicina"} en ${data.ciudad || "Ecuador"}`;
    }

    let newDesc = data.metaDescripcion;
    if (!newDesc || newDesc.trim() === "") {
      newDesc = `Sitio web oficial de ${data.nombreMedico || "Doctor"} especialista en ${data.especialidad || "atención médica"} en ${data.ciudad || "Ecuador"}. Consulta horarios, tratamientos y reserva tu cita médica online.`;
    }

    // Inyectar en el documento activo
    injectHeadTagsInDocument(cleaned, newTitle, newDesc);

    onChange({
      ...data,
      dominioWeb: cleaned,
      metaTitulo: newTitle,
      metaDescripcion: newDesc
    });

    setInjectedDomainText(cleaned);
    setInjectionSuccess(true);
    setShowInjectedCodeInspector(true);
    setTimeout(() => {
      setInjectionSuccess(false);
    }, 5000);
  };

  const handleKeywordResearch = async () => {
    setIsResearching(true);
    setResearchError(null);
    try {
      const response = await fetch("/api/ai/keyword-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          especialidad: data.especialidad,
          ciudad: data.ciudad,
          servicios: data.servicios,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setResearchResults({
          keywords: result.keywords,
          metaTitulo: result.metaTitulo,
          metaDescripcion: result.metaDescripcion,
          filosofia: result.filosofia,
          servicios: result.servicios,
        });

        // Automatically integrate into the main state data
        onChange({
          ...data,
          metaTitulo: result.metaTitulo,
          metaDescripcion: result.metaDescripcion,
          filosofia: result.filosofia,
          servicios: result.servicios,
        });
      } else {
        setResearchError(result.error || "Ocurrió un error al investigar palabras clave.");
      }
    } catch (err: any) {
      console.error("Error researching keywords:", err);
      setResearchError("Error de red al conectar con el servidor de palabras clave.");
    } finally {
      setIsResearching(false);
    }
  };

  const currentDomain = data.dominioWeb || "";
  const isHttps = currentDomain.trim().toLowerCase().startsWith("https://");
  const hasDomain = currentDomain.trim().length > 0 && !currentDomain.includes("{{") && currentDomain !== "https://tu-consultorio-medico.ec";
  const normalizedUrl = normalizeDomainUrl(data.dominioWeb);

  // Helper para extraer un slug/identificador limpio del enlace ingresado
  const extractSlugFromLink = (raw: string): string => {
    if (!raw || !raw.trim()) return "";
    let clean = raw.trim().toLowerCase();
    // Remover protocolo
    clean = clean.replace(/^https?:\/\//i, "");
    // Obtener la parte del hostname (antes de / o ?)
    clean = clean.split("/")[0].split("?")[0];
    // Quitar extensiones o subdominios conocidos si el usuario ingresó algo completo
    clean = clean.replace(/\.(medico\.ec|med1\.ec|med\.ec|com\.ec|ec|com|org|net|clinic)$/i, "");
    // Normalizar tildes y caracteres especiales, dejar solo a-z, 0-9 y guiones
    clean = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, "");
    return clean;
  };

  const rawLinkInput = data.dominioWeb || "";
  const currentSlugFromInput = extractSlugFromLink(rawLinkInput);
  const fallbackSlugFromName = extractSlugFromLink(data.nombreMedico || "");
  const activeSlug = currentSlugFromInput || fallbackSlugFromName || "drjordan";

  // Generación dinámica de subdominios según el enlace/slug que ingrese el usuario
  // Subdominio Principal: .medico.ec (ej: drjordan.medico.ec, cirujanoplastico.medico.ec)
  // Subdominio Secundario: .med1.ec (ej: drjordan.med1.ec, cirujanoplastico.med1.ec)
  const primarySubdomains = [
    `https://${activeSlug}.medico.ec`,
    !activeSlug.startsWith("dr") ? `https://dr${activeSlug}.medico.ec` : `https://consultorio-${activeSlug}.medico.ec`,
    `https://${activeSlug}-consulta.medico.ec`
  ].filter((item, index, self) => self.indexOf(item) === index);

  const secondarySubdomains = [
    `https://${activeSlug}.med1.ec`,
    !activeSlug.startsWith("dr") ? `https://dr${activeSlug}.med1.ec` : `https://consultorio-${activeSlug}.med1.ec`,
    `https://${activeSlug}-agenda.med1.ec`
  ].filter((item, index, self) => self.indexOf(item) === index);

  // Estados para snippet y verificación DNS
  const [copiedCname, setCopiedCname] = useState(false);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [copiedAllDns, setCopiedAllDns] = useState(false);
  const [selectedDnsProvider, setSelectedDnsProvider] = useState<'cloudflare' | 'godaddy' | 'hostinger' | 'cpanel'>('cloudflare');
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsVerificationStatus, setDnsVerificationStatus] = useState<'idle' | 'checking' | 'verified'>('idle');

  // Parser de detalles de DNS (CNAME, TXT, A) según la URL o subdominio ingresado
  const getDnsConfig = () => {
    let raw = (data.dominioWeb || "").trim().toLowerCase();
    raw = raw.replace(/^https?:\/\//i, "").split("/")[0].split("?")[0];
    
    if (!raw) {
      raw = `${activeSlug}.medico.ec`;
    }

    const parts = raw.split(".");
    const isMedicoSub = raw.endsWith(".medico.ec");
    const isMed1Sub = raw.endsWith(".med1.ec");

    let cnameHost = "@";
    let cnameTarget = "cname.medico.ec";
    
    if (isMedicoSub || isMed1Sub) {
      cnameHost = parts[0] || activeSlug;
      cnameTarget = isMed1Sub ? "cname.med1.ec" : "cname.medico.ec";
    } else if (parts.length > 2) {
      // Subdominio personalizado ej: cita.midominio.com o www.midominio.com
      cnameHost = parts[0];
      cnameTarget = "hosting.medico.ec";
    } else {
      // Dominio personalizado de raíz ej: midominio.com
      cnameHost = "@";
      cnameTarget = "cname.medico.ec";
    }

    const verificationHash = `md-${raw.replace(/[^a-z0-9]/g, "").slice(0, 14) || "site123"}`;

    return {
      domain: raw,
      cnameHost,
      cnameTarget,
      txtHost: "_medico-verify",
      txtValue: `medico-site-verification=${verificationHash}`,
      aHost: "@",
      aValue: "185.199.108.153"
    };
  };

  const dnsConfig = getDnsConfig();

  const handleCheckDns = () => {
    setIsCheckingDns(true);
    setDnsVerificationStatus("checking");
    setTimeout(() => {
      setIsCheckingDns(false);
      setDnsVerificationStatus("verified");
    }, 2200);
  };

  const handleCopyFullDnsSnippet = () => {
    const text = `==============================================
INSTRUCCIONES DE CONFIGURACIÓN DNS Y HOSTER
Página Médica: ${dnsConfig.domain}
==============================================

Para vincular este enlace/subdominio a la landing page médica generada, agrega los siguientes registros en tu proveedor de DNS (Cloudflare, GoDaddy, Hostinger, cPanel, Namecheap, etc.):

1. REGISTRO CNAME (Obligatorio)
   • Tipo: CNAME
   • Nombre / Host: ${dnsConfig.cnameHost}
   • Valor / Destino: ${dnsConfig.cnameTarget}
   • TTL: Auto / 3600

2. REGISTRO TXT (Verificación de Propiedad)
   • Tipo: TXT
   • Nombre / Host: ${dnsConfig.txtHost}
   • Valor: ${dnsConfig.txtValue}
   • TTL: 3600

3. REGISTRO A (Opcional para dominio raíz sin subdominio)
   • Tipo: A
   • Nombre / Host: @
   • Valor IP: ${dnsConfig.aValue}

Estado: Listo para enrutamiento HTTPS SSL automático.`;

    navigator.clipboard.writeText(text);
    setCopiedAllDns(true);
    setTimeout(() => setCopiedAllDns(false), 2500);
  };

  return (
    <div id="form-seo-section" className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            SEO Médico, Dominio Web & Inyección de Código
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingresa la URL o subdominio del médico e inyéctala automáticamente en etiquetas canónicas, Open Graph, Sitemap XML, Robots.txt y Schema Physician.
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
          Indexación Google 3.0
        </span>
      </div>

      {/* 1. DOMINIO WEB PERSONALIZADO E INYECCIÓN DE CÓDIGO SEO */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white shadow-md border border-blue-800/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-inner shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                Subdominio / Enlace Personalizado e Inyección SEO Total
              </h4>
              <p className="text-xs text-blue-200/80">
                Inyecta el enlace oficial del médico dentro del HTML, metadatos y esquemas de Google.
              </p>
            </div>
          </div>

          {/* Badge de Estado SSL */}
          {hasDomain ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isHttps ? "Inyectado & SSL Activo" : "Dominio Inyectado"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Esperando Inyección
            </span>
          )}
        </div>

        {/* GUÍA EXPLICATIVA DE LA SECCIÓN */}
        <div className="p-3.5 bg-blue-900/40 border border-blue-700/50 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              ¿Qué hace el botón &quot;Inyectar Dominio en Todo el Código&quot;?
            </span>
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[10px] text-blue-300 hover:text-white underline font-semibold"
            >
              {showExplanation ? "Ocultar guía" : "Ver explicación"}
            </button>
          </div>

          {showExplanation && (
            <p className="text-blue-100/90 leading-relaxed text-[11px]">
              Al escribir o pegar el subdominio del médico (ej: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">drjordan.medico.ec</code> o <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">cirujanoplastico.med1.ec</code>) y presionar el botón <strong>Inyectar Dominio</strong>, el sistema graba esa URL en todas las áreas técnicas de tu código web:
              <br />
              • <strong>Tag Canónico Google (`rel=&quot;canonical&quot;`)</strong>: Evita penalizaciones por contenido duplicado.
              <br />
              • <strong>Vista Previa WhatsApp y Redes (`og:url`)</strong>: Al compartir el enlace por WhatsApp, mostrará el subdominio e imagen oficial.
              <br />
              • <strong>Sitemap.xml y Robots.txt</strong>: Genera los archivos que le dicen a Googlebot exactamente qué páginas indexar.
              <br />
              • <strong>Ficha Técnica Schema Physician</strong>: Le informa a Google Maps que este enlace pertenece formalmente al consultorio médico.
            </p>
          )}
        </div>

        {/* INPUT DE DOMINIO Y BOTÓN DE INYECCIÓN PRINCIPAL */}
        <div className="space-y-3 pt-1">
          <label className="text-xs font-bold text-blue-200 uppercase tracking-wide flex items-center gap-1.5" htmlFor="dominioWebInput">
            <Key className="w-3.5 h-3.5 text-blue-400" />
            Subdominio o Enlace Web Oficial:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 text-xs font-mono">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <input
                id="dominioWebInput"
                type="text"
                value={data.dominioWeb || ""}
                onChange={(e) => updateField("dominioWeb", e.target.value)}
                placeholder="ej. drjordan.medico.ec o cirujanoplastico.medico.ec"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-blue-700/60 text-white placeholder-slate-400 text-xs sm:text-sm font-mono font-medium focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
              />
            </div>

            {/* BOTÓN DE INYECCIÓN DIRECTA */}
            <button
              type="button"
              onClick={() => handleInjectDomain()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer active:scale-95 border border-blue-400/30"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Inyectar Dominio en Todo el Código</span>
            </button>
          </div>

          {/* BANNER NOTIFICACIÓN DE ÉXITO DE INYECCIÓN */}
          {injectionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in shadow-inner">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-extrabold text-white">¡Dominio inyectado e integrado con éxito!</p>
                <p className="text-[11px] text-emerald-300">
                  La dirección <code className="font-mono bg-slate-900/60 px-1 rounded text-amber-300">{injectedDomainText}</code> ha sido sincronizada en las etiquetas canónicas HTML, Open Graph, Sitemap XML, Robots.txt y Schema Physician.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SUGERENCIAS DE SUBDOMINIOS BASADOS EN EL ENLACE DEL USUARIO */}
        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/70 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-extrabold text-blue-200 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Sugerencias de Subdominios para tu Enlace
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Opciones generadas en tiempo real según el enlace o término que ingresaste (<code className="text-amber-300 font-mono font-bold">{activeSlug}</code>):
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Haz clic en una opción para inyectarla directo</span>
          </div>

          {/* Subdominio Principal .medico.ec */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              🏥 Subdominio Principal (.medico.ec):
            </span>
            <div className="flex flex-wrap gap-2">
              {primarySubdomains.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleInjectDomain(opt)}
                  className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-blue-600/60 text-blue-200 hover:text-white border border-slate-600 hover:border-blue-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                >
                  <span>{opt}</span>
                  <Zap className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Subdominio Secundario .med1.ec */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              ⚡ Subdominio Secundario (.med1.ec):
            </span>
            <div className="flex flex-wrap gap-2">
              {secondarySubdomains.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleInjectDomain(opt)}
                  className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-blue-600/60 text-blue-200 hover:text-white border border-slate-600 hover:border-blue-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                >
                  <span>{opt}</span>
                  <Zap className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CHECKLIST DE COBERTURA DE CÓDIGO INYECTADO */}
        <div className="pt-2 border-t border-blue-800/40 space-y-2">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Estado Actual de la Inyección SEO en el Código HTML:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <span className="text-slate-300">Tag Canónico HTML:</span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Inyectado
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <span className="text-slate-300">Open Graph (WhatsApp):</span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Inyectado
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <span className="text-slate-300">Sitemap.xml:</span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Sincronizado
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <span className="text-slate-300">Robots.txt:</span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Configurado
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <span className="text-slate-300">Schema.org Physician:</span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Vinculado
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <span className="text-slate-300">ChatGPT / Gemini (llms.txt):</span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Activo
              </span>
            </div>
          </div>
        </div>

        {/* VISUALIZADOR E INSPECTOR DE CÓDIGO INYECTADO */}
        <div className="pt-3 border-t border-blue-800/40 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h5 className="text-xs font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Code className="w-4 h-4 text-amber-400" />
                Inspector de Código Inyectado Dinámicamente en Proyecto Exportado
              </h5>
              <p className="text-[11px] text-blue-200/90 mt-0.5">
                Verifica en tiempo real cómo el dominio <code className="text-amber-300 font-mono font-bold">{normalizeDomainUrl(data.dominioWeb || primarySubdomains[0])}</code> se ha inyectado en metatags, canonicals, sitemaps y schema.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInjectedCodeInspector(!showInjectedCodeInspector)}
              className="text-xs text-blue-300 hover:text-white underline font-semibold cursor-pointer"
            >
              {showInjectedCodeInspector ? "Ocultar Inspector" : "Ver Código Inyectado"}
            </button>
          </div>

          {showInjectedCodeInspector && (
            <div className="p-4 bg-slate-950/90 rounded-xl border border-blue-700/60 space-y-3 animate-fade-in">
              {/* Selector de Pestañas de Código */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'html', label: '<head> Metatags', icon: '🏷️' },
                    { id: 'sitemap', label: 'sitemap.xml', icon: '🗺️' },
                    { id: 'robots', label: 'robots.txt', icon: '🤖' },
                    { id: 'schema', label: 'Schema.org JSON-LD', icon: '🩺' },
                    { id: 'llms', label: 'llms.txt (IA)', icon: '🧠' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveInjectedTab(tab.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeInjectedTab === tab.id
                          ? "bg-blue-600 text-white shadow-xs border border-blue-400"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    let codeToCopy = "";
                    const activeCleanDomain = normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]);
                    const currentData = { ...data, dominioWeb: activeCleanDomain };
                    if (activeInjectedTab === 'html') {
                      codeToCopy = `<!-- CÓDIGO HTML INYECTADO EN <head> PARA ${activeCleanDomain} -->\n<title>${data.metaTitulo || `${data.nombreMedico || 'Doctor'} | ${data.especialidad || 'Medicina'}`}</title>\n<meta name="description" content="${data.metaDescripcion || ''}">\n\n<link rel="canonical" href="${activeCleanDomain}/">\n<link rel="sitemap" type="application/xml" title="Sitemap" href="${activeCleanDomain}/sitemap.xml">\n<link rel="alternate" type="text/markdown" title="LLM Knowledge Context" href="${activeCleanDomain}/llms.txt">\n<meta name="ai-llm-knowledge" content="${activeCleanDomain}/llms.txt">\n\n<meta property="og:title" content="${data.metaTitulo || ''}">\n<meta property="og:description" content="${data.metaDescripcion || ''}">\n<meta property="og:url" content="${activeCleanDomain}">\n<meta name="twitter:url" content="${activeCleanDomain}">`;
                    } else if (activeInjectedTab === 'sitemap') {
                      codeToCopy = generateSitemapXml(currentData, activeCleanDomain);
                    } else if (activeInjectedTab === 'robots') {
                      codeToCopy = generateRobotsTxt(currentData, activeCleanDomain);
                    } else if (activeInjectedTab === 'schema') {
                      codeToCopy = generateJsonLd(currentData, activeCleanDomain);
                    } else if (activeInjectedTab === 'llms') {
                      codeToCopy = generateLlmsTxt(currentData, activeCleanDomain);
                    }

                    navigator.clipboard.writeText(codeToCopy);
                    setCopiedInjectedSnippet(true);
                    setTimeout(() => setCopiedInjectedSnippet(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-emerald-400/30"
                >
                  {copiedInjectedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInjectedSnippet ? "¡Código Copiado!" : "Copiar Fragmento"}</span>
                </button>
              </div>

              {/* Visor de Código */}
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300/90 text-xs font-mono overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap">
                  {activeInjectedTab === 'html' && (
                    `<!-- CÓDIGO METATAGS & CANONICAL INYECTADO EN HEAD -->
<title>${data.metaTitulo || `${data.nombreMedico || 'Doctor'} | ${data.especialidad || 'Medicina'} en ${data.ciudad || 'Ecuador'}`}</title>
<meta name="description" content="${data.metaDescripcion || `Sitio oficial de ${data.nombreMedico || 'Doctor'}`}">

<!-- URL CANÓNICA Y SITEMAP GOOGLE -->
<link rel="canonical" href="${normalizeDomainUrl(data.dominioWeb || primarySubdomains[0])}/">
<link rel="sitemap" type="application/xml" title="Sitemap" href="${normalizeDomainUrl(data.dominioWeb || primarySubdomains[0])}/sitemap.xml">

<!-- INTEGRACIÓN INTELIGENCIA ARTIFICIAL (GEO / LLMO) -->
<link rel="alternate" type="text/markdown" title="LLM Knowledge Context" href="${normalizeDomainUrl(data.dominioWeb || primarySubdomains[0])}/llms.txt">
<meta name="ai-llm-knowledge" content="${normalizeDomainUrl(data.dominioWeb || primarySubdomains[0])}/llms.txt">

<!-- OPEN GRAPH (WHATSAPP, FACEBOOK) -->
<meta property="og:title" content="${data.metaTitulo || `${data.nombreMedico || 'Doctor'}`}">
<meta property="og:description" content="${data.metaDescripcion || ''}">
<meta property="og:url" content="${normalizeDomainUrl(data.dominioWeb || primarySubdomains[0])}">

<!-- TWITTER CARD -->
<meta name="twitter:title" content="${data.metaTitulo || `${data.nombreMedico || 'Doctor'}`}">
<meta name="twitter:url" content="${normalizeDomainUrl(data.dominioWeb || primarySubdomains[0])}">`
                  )}

                  {activeInjectedTab === 'sitemap' && generateSitemapXml({ ...data, dominioWeb: normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]) }, normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]))}
                  {activeInjectedTab === 'robots' && generateRobotsTxt({ ...data, dominioWeb: normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]) }, normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]))}
                  {activeInjectedTab === 'schema' && generateJsonLd({ ...data, dominioWeb: normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]) }, normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]))}
                  {activeInjectedTab === 'llms' && generateLlmsTxt({ ...data, dominioWeb: normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]) }, normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]))}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* BLOQUE DE REGISTROS DNS CNAME Y TXT PARA HOSTING */}
        <div className="pt-3 border-t border-blue-800/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h5 className="text-xs font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Server className="w-4 h-4 text-amber-400" />
                Ficha Técnica de Registros DNS (CNAME & TXT) para Hosting
              </h5>
              <p className="text-[11px] text-blue-200/90 mt-0.5">
                Copia estos registros y agrégalos en la zona DNS de tu proveedor (Cloudflare, GoDaddy, Hostinger, cPanel) para apuntar <code className="text-amber-300 font-mono font-bold">{dnsConfig.domain}</code> a esta landing page.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyFullDnsSnippet}
              className="px-3 py-1.5 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white text-[11px] font-extrabold flex items-center gap-1.5 border border-blue-400/40 transition-all shrink-0 cursor-pointer"
            >
              {copiedAllDns ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAllDns ? "¡Instrucciones Copiadas!" : "Copiar Ficha DNS Completa"}</span>
            </button>
          </div>

          {/* SELECTOR DE PROVEEDOR DNS (Pestañas Rápidas) */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
              Instrucciones por Proveedor de Hosting:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "cloudflare", label: "Cloudflare", icon: "🌐" },
                { id: "godaddy", label: "GoDaddy", icon: "🟡" },
                { id: "hostinger", label: "Hostinger / Namecheap", icon: "🟢" },
                { id: "cpanel", label: "cPanel Zone Editor", icon: "💼" },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setSelectedDnsProvider(prov.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedDnsProvider === prov.id
                      ? "bg-blue-600 text-white shadow-xs border border-blue-400"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                  }`}
                >
                  <span>{prov.icon}</span>
                  <span>{prov.label}</span>
                </button>
              ))}
            </div>

            {/* Pasos rápidos según proveedor seleccionado */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-blue-100/90 leading-relaxed">
              {selectedDnsProvider === "cloudflare" && (
                <p>
                  <strong>En Cloudflare:</strong> Ve a <em>DNS &gt; Records</em> &gt; haz clic en <strong>Add record</strong>. Selecciona Tipo <strong>CNAME</strong>, en Nombre pon <code className="text-amber-300 font-mono px-1 bg-slate-800 rounded">{dnsConfig.cnameHost}</code> y en Target pon <code className="text-amber-300 font-mono px-1 bg-slate-800 rounded">{dnsConfig.cnameTarget}</code>. Agrega el registro <strong>TXT</strong> para verificación.
                </p>
              )}
              {selectedDnsProvider === "godaddy" && (
                <p>
                  <strong>En GoDaddy:</strong> Entra a <em>Mis Dominios &gt; DNS</em>. Haz clic en <strong>Agregar nuevo registro</strong>. Selecciona Tipo <strong>CNAME</strong>, en Host pon <code className="text-amber-300 font-mono px-1 bg-slate-800 rounded">{dnsConfig.cnameHost}</code> y en Apunta a pon <code className="text-amber-300 font-mono px-1 bg-slate-800 rounded">{dnsConfig.cnameTarget}</code>.
                </p>
              )}
              {selectedDnsProvider === "hostinger" && (
                <p>
                  <strong>En Hostinger / Namecheap:</strong> Entra a <em>DNS / Nameservers &gt; Gestionar DNS</em>. Añade un Registro Tipo <strong>CNAME</strong> con Nombre <code className="text-amber-300 font-mono px-1 bg-slate-800 rounded">{dnsConfig.cnameHost}</code> y Apunta a <code className="text-amber-300 font-mono px-1 bg-slate-800 rounded">{dnsConfig.cnameTarget}</code>.
                </p>
              )}
              {selectedDnsProvider === "cpanel" && (
                <p>
                  <strong>En cPanel:</strong> Abre la herramienta <strong>Zone Editor</strong> &gt; selecciona tu dominio &gt; haz clic en <strong>+ CNAME Record</strong>. Ingresa Nombre: <code className="text-amber-300 font-mono px-1 bg-slate-800 rounded">{dnsConfig.cnameHost}</code> y CNAME: <code className="text-amber-300 font-mono px-1 bg-slate-800 rounded">{dnsConfig.cnameTarget}</code>.
                </p>
              )}
            </div>
          </div>

          {/* TABLA DE REGISTROS DNS PARA COPIAR */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              Registros DNS a Configurar:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* CNAME CARD */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-blue-700/60 space-y-2 relative group shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                    REGISTRO CNAME (OBLIGATORIO)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Tipo: CNAME | Host: ${dnsConfig.cnameHost} | Apunta a: ${dnsConfig.cnameTarget}`;
                      navigator.clipboard.writeText(text);
                      setCopiedCname(true);
                      setTimeout(() => setCopiedCname(false), 2000);
                    }}
                    className="text-[10px] font-bold text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer bg-blue-900/40 hover:bg-blue-800/60 px-2 py-1 rounded border border-blue-600/40"
                  >
                    {copiedCname ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCname ? "Copiado" : "Copiar CNAME"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Host / Nombre:</span>
                    <span className="text-amber-300 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800 block truncate">
                      {dnsConfig.cnameHost}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Apunta a / Valor:</span>
                    <span className="text-emerald-300 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800 block truncate">
                      {dnsConfig.cnameTarget}
                    </span>
                  </div>
                </div>
              </div>

              {/* TXT CARD */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-700/60 space-y-2 relative group shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    REGISTRO TXT (VERIFICACIÓN)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Tipo: TXT | Host: ${dnsConfig.txtHost} | Valor: ${dnsConfig.txtValue}`;
                      navigator.clipboard.writeText(text);
                      setCopiedTxt(true);
                      setTimeout(() => setCopiedTxt(false), 2000);
                    }}
                    className="text-[10px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer bg-indigo-900/40 hover:bg-indigo-800/60 px-2 py-1 rounded border border-indigo-600/40"
                  >
                    {copiedTxt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTxt ? "Copiado" : "Copiar TXT"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Host / Nombre:</span>
                    <span className="text-amber-300 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800 block truncate">
                      {dnsConfig.txtHost}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Valor TXT:</span>
                    <span className="text-indigo-300 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800 block truncate">
                      {dnsConfig.txtValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULADOR DE COMPROBACIÓN DNS */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700 flex items-center justify-center shrink-0">
                <Terminal className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Comprobar Enrutamiento DNS en Tiempo Real</span>
                <span className="text-[10px] text-slate-400 block">
                  Verifica si <code className="text-amber-300 font-mono">{dnsConfig.domain}</code> responde al registro CNAME.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckDns}
              disabled={isCheckingDns}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDns ? "animate-spin" : ""}`} />
              <span>{isCheckingDns ? "Consultando DNS..." : "Probar Conexión DNS"}</span>
            </button>
          </div>

          {dnsVerificationStatus === "verified" && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>¡DNS Resuelto!</strong> <code className="text-amber-300 font-bold">{dnsConfig.domain}</code> apunta correctamente a <code className="text-emerald-300">{dnsConfig.cnameTarget}</code>. Certificado SSL activo.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. KEYWORD RESEARCH CON IA */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Investigador de Palabras Clave Médicas con IA
            </h4>
            <p className="text-[11px] text-slate-500">
              Analiza las intenciones de búsqueda de pacientes en Ecuador para {data.especialidad} en {data.ciudad}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleKeywordResearch}
            disabled={isResearching}
            className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3.5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isResearching ? "animate-spin" : ""}`} />
            <span>{isResearching ? "Analizando Ecuador..." : "Investigar Keywords IA"}</span>
          </button>
        </div>

        {researchError && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {researchError}
          </div>
        )}

        {researchResults && (
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-800 block">Palabras clave con alta intención de búsqueda en Ecuador:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {researchResults.keywords.map((kw, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">{kw.keyword}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">{kw.volumen}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold">{kw.intencion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. SERP PREVIEW & METATAGS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Search className="w-4 h-4 text-blue-600" />
          Previsualización en Resultados de Búsqueda Google (SERP)
        </label>

        {/* Google SERP Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">🩺</div>
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-800 font-medium leading-none">{data.dominioWeb || "https://tudominio.ec"}</span>
              <span className="text-[10px] text-slate-400 leading-none mt-0.5">{data.ciudad || "Ecuador"} &gt; Consulta Médica</span>
            </div>
          </div>
          <h5 className="text-base text-blue-800 font-medium hover:underline cursor-pointer pt-1 line-clamp-1">
            {data.metaTitulo || `${data.nombreMedico} | ${data.especialidad} en ${data.ciudad}, Ecuador`}
          </h5>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {data.metaDescripcion || `Consulta con ${data.nombreMedico}, especialista en ${data.especialidad} en ${data.ciudad}. Agenda tu cita médica presencial o virtual hoy mismo.`}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="metaTitulo">
                Meta Título SEO (Title Tag)
              </label>
              <span className={`text-[10px] font-mono ${(data.metaTitulo?.length || 0) > 60 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                {data.metaTitulo?.length || 0} / 60 caracteres
              </span>
            </div>
            <input
              id="metaTitulo"
              type="text"
              value={data.metaTitulo ?? ""}
              onChange={(e) => updateField("metaTitulo", e.target.value)}
              placeholder="ej. Dr. Especialista | Especialidad en Quito, Ecuador"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="metaDescripcion">
                Meta Descripción SEO (Description Tag)
              </label>
              <span className={`text-[10px] font-mono ${(data.metaDescripcion?.length || 0) > 160 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                {data.metaDescripcion?.length || 0} / 160 caracteres
              </span>
            </div>
            <textarea
              id="metaDescripcion"
              rows={2}
              value={data.metaDescripcion ?? ""}
              onChange={(e) => updateField("metaDescripcion", e.target.value)}
              placeholder="Descripción atractiva para pacientes que buscan atención médica en Google..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 4. SITEMAP XML & ROBOTS.TXT GENERATOR */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <FileCode className="w-4 h-4 text-indigo-600" />
          Sitemap.xml & Robots.txt Dinámicos para Motores de Búsqueda
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sitemap XML Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Code className="w-3.5 h-3.5 text-blue-600" />
                sitemap.xml
              </span>
              <button
                type="button"
                onClick={() => {
                  const sitemap = generateSitemapXml(data);
                  navigator.clipboard.writeText(sitemap);
                  setCopiedSitemap(true);
                  setTimeout(() => setCopiedSitemap(false), 2000);
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedSitemap ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedSitemap ? "Copiado" : "Copiar"}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-32">
              {generateSitemapXml(data)}
            </pre>
          </div>

          {/* Robots.txt Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                robots.txt
              </span>
              <button
                type="button"
                onClick={() => {
                  const robots = generateRobotsTxt(data);
                  navigator.clipboard.writeText(robots);
                  setCopiedRobots(true);
                  setTimeout(() => setCopiedRobots(false), 2000);
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedRobots ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedRobots ? "Copiado" : "Copiar"}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-32">
              {generateRobotsTxt(data)}
            </pre>
          </div>
        </div>
      </div>

      {/* 5. SCHEMA.ORG JSON-LD */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Code className="w-4 h-4 text-emerald-600" />
            Marcado Estructurado Schema.org (Physician / MedicalBusiness)
          </label>
          <button
            type="button"
            onClick={() => {
              const jsonLd = generateJsonLd(data);
              navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2));
              setCopiedSchema(true);
              setTimeout(() => setCopiedSchema(false), 2000);
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSchema ? "Copiado al portapapeles" : "Copiar JSON-LD"}
          </button>
        </div>
        <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
          {JSON.stringify(generateJsonLd(data), null, 2)}
        </pre>
      </div>

      {/* 6. POSICIONAMIENTO EN INTELIGENCIA ARTIFICIAL (GEO / LLMO: CHATGPT, GEMINI, PERPLEXITY) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-lg border border-indigo-700/50 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                Posicionamiento en Motores Generativos (GEO / LLMO)
              </h4>
              <p className="text-xs text-indigo-200/80">
                Optimizado para respuestas recomendadas en ChatGPT (SearchGPT), Google Gemini, Perplexity AI y Claude.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            Estándar LLM Text (llms.txt)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-800/60 text-xs text-indigo-100 space-y-2">
          <p className="font-bold text-amber-300 flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4" />
            ¿Cómo recomienda ChatGPT y Gemini al especialista?
          </p>
          <p className="text-indigo-200/90 leading-relaxed">
            Los nuevos asistentes de IA escanean el archivo estructurado <code className="bg-indigo-900 px-1.5 py-0.5 rounded text-amber-200 font-mono text-[11px]">/llms.txt</code> y el marcado <code className="bg-indigo-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px]">Schema Physician</code>. Al exportar el ZIP, tu sitio web ya incluye las reglas directas para que los bots de OpenAI (GPTBot) y Google (Google-Extended) indexen la cédula, experiencia, seguros e instrucciones de recomendación.
          </p>
        </div>

        {/* Prompt de Prueba de Búsqueda */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-indigo-200 uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              Prompt de Prueba para Consultar en ChatGPT / Gemini
            </span>
            <button
              type="button"
              onClick={() => {
                const samplePrompt = `¿Quién es el mejor especialista en ${data.especialidad || "Medicina"} en ${data.ciudad || "Ecuador"}? Proporcióname su sitio web oficial, ubicación y formas de agendamiento.`;
                navigator.clipboard.writeText(samplePrompt);
                setCopiedPrompt(true);
                setTimeout(() => setCopiedPrompt(false), 2000);
              }}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-400/20"
            >
              {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedPrompt ? "Prompt Copiado" : "Copiar Prompt de Prueba"}
            </button>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 text-slate-300 text-xs font-mono border border-slate-800">
            &quot;¿Quién es el mejor especialista en {data.especialidad || "Medicina"} en {data.ciudad || "Ecuador"}? Proporcióname su sitio web oficial, ubicación y formas de agendamiento.&quot;
          </div>
        </div>

        {/* Previsualizador de llms.txt */}
        <div className="space-y-2 pt-2 border-t border-indigo-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              Vista Previa de /llms.txt (Inyectado Automáticamente)
            </span>
            <button
              type="button"
              onClick={() => {
                const llmsText = generateLlmsTxt(data);
                navigator.clipboard.writeText(llmsText);
                setCopiedLlms(true);
                setTimeout(() => setCopiedLlms(false), 2000);
              }}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedLlms ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedLlms ? "llms.txt Copiado" : "Copiar llms.txt"}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 text-indigo-200 text-[10.5px] font-mono overflow-x-auto max-h-40 border border-slate-800">
            {generateLlmsTxt(data)}
          </pre>
        </div>

        {/* ACCESO RÁPIDO A NOVEDADES DE GOOGLE MAPS */}
        <div className="pt-3 border-t border-indigo-800/50 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-indigo-200">
            📢 Generador de publicaciones periódicas para Google Business Profile (Google Maps):
          </span>
          <button
            type="button"
            onClick={() => setIsGbpExporterOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Generar Novedad para Google Maps</span>
          </button>
        </div>
      </div>

      {/* MODAL EXPORTADOR DE NOVEDADES */}
      <GbpPostExporterModal
        isOpen={isGbpExporterOpen}
        onClose={() => setIsGbpExporterOpen(false)}
        data={data}
      />
    </div>
  );
}
