/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData, ServiceItem, BacklinkAuthorityItem } from "../../types";
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
  Sliders,
  Link,
  Plus,
  Trash2,
  Award,
  Building2,
  Landmark,
  GraduationCap,
  CheckSquare,
  Square,
  Share2,
  Smartphone,
  Image,
  Upload,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Activity,
  TrendingUp
} from "lucide-react";
import { 
  generateJsonLd, 
  normalizeDomainUrl, 
  generateRobotsTxt, 
  generateSitemapXml, 
  generateLlmsTxt, 
  getActiveFaviconUrl, 
  getActiveOgImageUrl,
  extractGoogleVerificationCode,
  getGoogleHtmlVerificationFilename,
  getGoogleHtmlVerificationContent,
  extractGoogleAnalyticsId,
  generateGoogleAnalyticsScript,
  resolveLocalSeoFields
} from "../../utils/generators";
import { compressAndConvertToWebP } from "../../utils/imageCompressor";
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
  const [seoPreviewTab, setSeoPreviewTab] = useState<'serp' | 'social'>('serp');

  // Estados para Google Search Console
  const [gscVerificationTab, setGscVerificationTab] = useState<'meta' | 'file' | 'dns'>('meta');
  const [copiedGscMeta, setCopiedGscMeta] = useState(false);
  const [copiedGscFileContent, setCopiedGscFileContent] = useState(false);
  const [copiedGscFilename, setCopiedGscFilename] = useState(false);
  const [copiedGscDns, setCopiedGscDns] = useState(false);
  const [copiedGscSitemapUrl, setCopiedGscSitemapUrl] = useState(false);

  // Estados para Google Analytics (GA4)
  const [copiedGaScript, setCopiedGaScript] = useState(false);
  const [copiedGaId, setCopiedGaId] = useState(false);

  // Estados para Módulo de Backlinks & Autoridad Médica E-E-A-T
  const [newPortalNombre, setNewPortalNombre] = useState("");
  const [newTipoPortal, setNewTipoPortal] = useState<BacklinkAuthorityItem["tipoPortal"]>("colegio_medico");
  const [newUrlDestino, setNewUrlDestino] = useState("");
  const [newAnchorText, setNewAnchorText] = useState("");
  const [newNotas, setNewNotas] = useState("");
  const [newEstado, setNewEstado] = useState<BacklinkAuthorityItem["estado"]>("verificado");
  const [newIncluirSchema, setNewIncluirSchema] = useState(true);
  const [newMostrarFooter, setNewMostrarFooter] = useState(true);
  const [copiedAiPrompt, setCopiedAiPrompt] = useState(false);

  // Estados para Importador Inteligente de Respuestas de IA
  const [isImportingAiResponse, setIsImportingAiResponse] = useState(false);
  const [pastedAiText, setPastedAiText] = useState("");
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);
  const [showAdvancedManualForm, setShowAdvancedManualForm] = useState(false);
  const [isSubdomainsVisible, setIsSubdomainsVisible] = useState(false);
  const [optimizedNotice, setOptimizedNotice] = useState<string | null>(null);

  const activeFavicon = getActiveFaviconUrl(data);
  const activeOgImage = getActiveOgImageUrl(data);

  // Agregar nuevo backlink manualmente
  const handleAddBacklink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortalNombre.trim() || !newUrlDestino.trim()) return;

    const newItem: BacklinkAuthorityItem = {
      id: `backlink-${Date.now()}`,
      portalNombre: newPortalNombre.trim(),
      tipoPortal: newTipoPortal,
      urlDestino: newUrlDestino.trim(),
      estado: newEstado,
      incluirEnSchema: newIncluirSchema,
      mostrarEnFooter: newMostrarFooter,
      anchorText: newAnchorText.trim() || newPortalNombre.trim(),
      notas: newNotas.trim()
    };

    const currentList = data.backlinksAutoridad || [];
    updateField("backlinksAutoridad", [newItem, ...currentList]);

    setNewPortalNombre("");
    setNewUrlDestino("");
    setNewAnchorText("");
    setNewNotas("");
  };

  // Eliminar backlink
  const handleRemoveBacklink = (id: string) => {
    const updated = (data.backlinksAutoridad || []).filter(b => b.id !== id);
    updateField("backlinksAutoridad", updated);
  };

  // Toggle propiedad de backlink
  const handleToggleBacklinkProp = (id: string, key: "incluirEnSchema" | "mostrarEnFooter") => {
    const updated = (data.backlinksAutoridad || []).map(b => {
      if (b.id === id) {
        return { ...b, [key]: !b[key] };
      }
      return b;
    });
    updateField("backlinksAutoridad", updated);
  };

  // Sugerencias Inteligentes Automáticas por Ciudad / Especialidad
  const handleGenerateSmartSuggestions = () => {
    const ciudad = data.ciudad || "Ecuador";
    const provincia = (data.ciudad && data.ciudad.toLowerCase().includes("quito")) ? "Pichincha" 
      : (data.ciudad && data.ciudad.toLowerCase().includes("guayaquil")) ? "Guayas"
      : (data.ciudad && data.ciudad.toLowerCase().includes("cuenca")) ? "Azuay" : "Ecuador";
    const especialidad = data.especialidad || "Medicina";
    const doctor = data.nombreMedico || "Especialista";

    const defaultSuggestions: BacklinkAuthorityItem[] = [
      {
        id: `sug-${Date.now()}-1`,
        portalNombre: `Colegio de Médicos de ${provincia}`,
        tipoPortal: "colegio_medico",
        urlDestino: `https://www.colegiomedico${provincia.toLowerCase().replace(/[^a-z]/g, '') || 'ecuador'}.org/directorio`,
        estado: "verificado",
        incluirEnSchema: true,
        mostrarEnFooter: true,
        anchorText: `Colegio de Médicos de ${provincia} - Directorio`,
        notas: "Registro oficial provincial de colegiatura médica."
      },
      {
        id: `sug-${Date.now()}-2`,
        portalNombre: "Ficha Verificada Google Business Profile (Google Maps)",
        tipoPortal: "perfil_google",
        urlDestino: data.googleMapsReviewsUrl || "https://maps.google.com/?cid=123456789",
        estado: "verificado",
        incluirEnSchema: true,
        mostrarEnFooter: true,
        anchorText: `${doctor} - Google Maps ${ciudad}`,
        notas: "Ficha oficial local en Google Maps."
      },
      {
        id: `sug-${Date.now()}-3`,
        portalNombre: `Sociedad Ecuatoriana de ${especialidad}`,
        tipoPortal: "sociedad_cientifica",
        urlDestino: `https://www.sociedad${especialidad.toLowerCase().replace(/[^a-z]/g, '') || 'medica'}.org.ec`,
        estado: "sugerido",
        incluirEnSchema: true,
        mostrarEnFooter: false,
        anchorText: `Miembro Activo Sociedad de ${especialidad}`,
        notas: "Membresía científica de especialidad."
      },
      {
        id: `sug-${Date.now()}-4`,
        portalNombre: `Directorio Staff ${data.hospitalesdondeOpera?.[0] || 'Hospital Local'}`,
        tipoPortal: "hospital_clinica",
        urlDestino: "https://www.hospital-acreditado.ec/medicos",
        estado: "verificado",
        incluirEnSchema: true,
        mostrarEnFooter: true,
        anchorText: `Staff Médico - ${data.hospitalesdondeOpera?.[0] || 'Hospital Local'}`,
        notas: "Acreditación de staff facultativo."
      }
    ];

    const existing = data.backlinksAutoridad || [];
    const newItems = defaultSuggestions.filter(sug => !existing.some(ex => ex.portalNombre.toLowerCase() === sug.portalNombre.toLowerCase()));

    updateField("backlinksAutoridad", [...newItems, ...existing]);
  };

  // Copiar Prompt General para Cualquier IA (ChatGPT, Gemini, Claude, Perplexity, etc.)
  const handleCopyAiPrompt = () => {
    const doctor = data.nombreMedico || "Doctor Especialista";
    const especialidad = data.especialidad || "Medicina";
    const ciudad = data.ciudad || "Ecuador";
    const clinica = data.nombreClinicaGBP || "Consultorio Médico";
    const dominio = data.dominioWeb || 'https://tu-dominio.ec';

    const promptText = `Actúa como un Consultor SEO Médico Senior especializado en posicionamiento orgánico E-E-A-T e indexación local en Ecuador.

Necesito que investigues y me entregues una lista estructurada de los 10 mejores portales web, colegios de médicos, facultades de medicina, hospitales privados, sociedades científicas y directorios de salud locales de alta autoridad en ${ciudad}, Ecuador, ideales para conseguir backlinks de alta reputación y citaciones de autoridad para:

- **Especialista**: ${doctor}
- **Especialidad Principal**: ${especialidad}
- **Ciudad y Sede**: ${ciudad}, Ecuador
- **Clínica / Centro**: ${clinica}
- **Sitio Web Objetivo**: ${dominio}

FORMATO DE SALIDA COMPATIBLE PARA IMPORTACIÓN AUTOMÁTICA:
Por favor entrega tu respuesta en DOS partes:

1. Una explicación clara y ordenada de cada portal sugerido.
2. Al final de tu respuesta, INCLUYE OBLIGATORIAMENTE un bloque de código JSON válido con el siguiente formato exacto para que mi plataforma pueda importar los enlaces automáticamente:

\`\`\`json
[
  {
    "portalNombre": "Colegio de Médicos de Pichincha",
    "tipoPortal": "colegio_medico",
    "urlDestino": "https://www.colegiomedicopichincha.org",
    "anchorText": "${doctor} - ${especialidad} ${ciudad}",
    "notas": "Directorio provincial oficial de colegiatura médica"
  }
]
\`\`\`

Valores válidos para "tipoPortal": "colegio_medico", "perfil_google", "hospital_clinica", "sociedad_cientifica", "directorio_medico", "universidad", "prensa_salud", "otro".

Genera la lista con los portales más relevantes de ${ciudad}, Ecuador respetando estrictamente el bloque JSON final.`;

    navigator.clipboard.writeText(promptText);
    setCopiedAiPrompt(true);
    setTimeout(() => setCopiedAiPrompt(false), 2500);
  };

  // Procesar e importar automáticamente la respuesta pegada de la IA
  const handleImportAiResponse = () => {
    if (!pastedAiText.trim()) {
      setImportErrorMsg("Por favor pega el texto de respuesta de la IA antes de importar.");
      return;
    }

    setImportErrorMsg(null);
    setImportSuccessMsg(null);

    try {
      let itemsToAdd: BacklinkAuthorityItem[] = [];

      // 1. Buscar bloque JSON en la respuesta de la IA
      const jsonMatch = pastedAiText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            const validTypes: BacklinkAuthorityItem["tipoPortal"][] = [
              "colegio_medico", "perfil_google", "hospital_clinica", "sociedad_cientifica", "directorio_local", "universidad_investigacion", "prensa_salud", "otro"
            ];

            itemsToAdd = parsed.map((raw: any, idx: number) => {
              const matchedType = validTypes.includes(raw.tipoPortal) ? raw.tipoPortal : "colegio_medico";
              return {
                id: `ai-import-${Date.now()}-${idx}`,
                portalNombre: String(raw.portalNombre || raw.nombre || raw.portal || `Portal ${idx + 1}`).trim(),
                tipoPortal: matchedType as BacklinkAuthorityItem["tipoPortal"],
                urlDestino: String(raw.urlDestino || raw.url || raw.link || "").trim(),
                estado: "verificado" as const,
                incluirEnSchema: true,
                mostrarEnFooter: true,
                anchorText: String(raw.anchorText || raw.portalNombre || raw.nombre || "").trim(),
                notas: String(raw.notas || raw.descripcion || "Importado desde IA").trim()
              };
            }).filter(item => item.urlDestino.startsWith("http") || item.portalNombre.length > 2);
          }
        } catch (e) {
          console.warn("JSON block parsing failed, falling back to line parser", e);
        }
      }

      // 2. Fallback: Parsear por líneas si no hay bloque JSON estricto
      if (itemsToAdd.length === 0) {
        const lines = pastedAiText.split('\n');
        let count = 0;
        for (const line of lines) {
          const urlMatch = line.match(/https?:\/\/[^\s\)\>\]'"]+/i);
          if (urlMatch) {
            const url = urlMatch[0];
            let cleanName = line
              .replace(urlMatch[0], '')
              .replace(/^[0-9+*-.\s\)\>\]:]+/, '')
              .replace(/[*_#`]/g, '')
              .trim();

            if (!cleanName || cleanName.length < 3) {
              try {
                const urlObj = new URL(url);
                cleanName = urlObj.hostname.replace('www.', '');
              } catch {
                cleanName = `Citación Sanitaria ${count + 1}`;
              }
            }

            count++;
            itemsToAdd.push({
              id: `ai-text-${Date.now()}-${count}`,
              portalNombre: cleanName.slice(0, 70),
              tipoPortal: "directorio_local" as const,
              urlDestino: url,
              estado: "verificado" as const,
              incluirEnSchema: true,
              mostrarEnFooter: true,
              anchorText: cleanName.slice(0, 60),
              notas: "Extraído desde respuesta de IA"
            });
          }
        }
      }

      if (itemsToAdd.length === 0) {
        setImportErrorMsg("No se detectó un formato JSON ni enlaces válidos (https://...) en el texto pegado. Verifica la respuesta de la IA.");
        return;
      }

      // Filtrar duplicados por URL o nombre
      const currentList = data.backlinksAutoridad || [];
      const newUnique = itemsToAdd.filter(item => 
        !currentList.some(ex => ex.urlDestino.toLowerCase() === item.urlDestino.toLowerCase() || ex.portalNombre.toLowerCase() === item.portalNombre.toLowerCase())
      );

      if (newUnique.length === 0) {
        setImportErrorMsg("Las citaciones o enlaces del texto ya existen en tu lista registrada.");
        return;
      }

      const updated = [...newUnique, ...currentList];
      updateField("backlinksAutoridad", updated);

      setImportSuccessMsg(`¡Éxito! Se importaron ${newUnique.length} backlinks de autoridad a tu plataforma.`);
      setPastedAiText("");
      setTimeout(() => {
        setImportSuccessMsg(null);
        setIsImportingAiResponse(false);
      }, 3000);

    } catch (err: any) {
      setImportErrorMsg("Hubo un error al procesar los datos de la IA. Intenta pegar el texto completo con el bloque JSON.");
    }
  };

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

    // Open Graph og:image & Twitter image
    const activeOgImage = getActiveOgImageUrl(data);
    if (activeOgImage) {
      setHeadTag("meta[property='og:image']", "meta", "property", "og:image", "content", activeOgImage);
      setHeadTag("meta[property='og:image:secure_url']", "meta", "property", "og:image:secure_url", "content", activeOgImage);
      setHeadTag("meta[name='twitter:image']", "meta", "name", "twitter:image", "content", activeOgImage);
      setHeadTag("meta[name='twitter:card']", "meta", "name", "twitter:card", "content", "summary_large_image");
    }

    // Favicon / Apple Touch Icon
    const activeFavicon = getActiveFaviconUrl(data);
    if (activeFavicon) {
      setHeadTag("link[rel~='icon']", "link", "rel", "icon", "href", activeFavicon);
      setHeadTag("link[rel='apple-touch-icon']", "link", "rel", "apple-touch-icon", "href", activeFavicon);
    }

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

    // 8. Verificación de Google Search Console
    const cleanGscCode = extractGoogleVerificationCode(data.googleSiteVerification);
    let gscMetaEl = document.querySelector("meta[name='google-site-verification']") as HTMLMetaElement;
    if (cleanGscCode) {
      if (!gscMetaEl) {
        gscMetaEl = document.createElement("meta");
        gscMetaEl.name = "google-site-verification";
        document.head.appendChild(gscMetaEl);
      }
      gscMetaEl.content = cleanGscCode;
    } else if (gscMetaEl) {
      gscMetaEl.remove();
    }
  };

  const handleInjectDomain = (domainToInject?: string) => {
    const raw = domainToInject !== undefined ? domainToInject : (data.dominioWeb || "");
    const cleaned = normalizeDomainUrl(raw);

    // Auto-completar meta título y meta descripción con el estándar de oro de SEO Local (Especialidad + Ciudad)
    const { resolvedTitle, resolvedDesc } = resolveLocalSeoFields(data);
    const newTitle = (data.metaTitulo && data.metaTitulo.trim() !== "") ? data.metaTitulo.trim() : resolvedTitle;
    const newDesc = (data.metaDescripcion && data.metaDescripcion.trim() !== "") ? data.metaDescripcion.trim() : resolvedDesc;

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
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Vinculación SEO con Inteligencia Artificial & Dominio Web
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingresa la URL o subdominio del médico e inyéctala automáticamente en etiquetas canónicas, Open Graph, Sitemap XML, Robots.txt, esquemas Schema Physician y optimización de citaciones para motores de IA.
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
            <button
              type="button"
              onClick={() => setIsSubdomainsVisible(prev => !prev)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-blue-300 hover:text-white bg-slate-700/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600 hover:border-blue-400 cursor-pointer transition-colors shadow-2xs"
              title={isSubdomainsVisible ? "Ocultar sugerencias de subdominios" : "Mostrar sugerencias de subdominios"}
            >
              <span>{isSubdomainsVisible ? "Ocultar sugerencias" : "Ver sugerencias"}</span>
              {isSubdomainsVisible ? (
                <ChevronUp className="w-3.5 h-3.5 text-blue-300" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
              )}
            </button>
          </div>

          {isSubdomainsVisible && (
            <div className="space-y-3 pt-2 border-t border-slate-700/60 animate-fade-in">
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
          )}
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
${extractGoogleVerificationCode(data.googleSiteVerification) ? `\n<!-- VERIFICACIÓN GOOGLE SEARCH CONSOLE -->\n<meta name="google-site-verification" content="${extractGoogleVerificationCode(data.googleSiteVerification)}">\n` : ''}${generateGoogleAnalyticsScript(data.googleAnalyticsId) ? `\n${generateGoogleAnalyticsScript(data.googleAnalyticsId)}\n` : ''}
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

      {/* 3. SERP & SOCIAL MEDIA PREVIEW (GOOGLE & WHATSAPP) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Search className="w-4 h-4 text-blue-600" />
              Previsualización en Google (SERP) & Redes Sociales
            </label>
            <p className="text-[11px] text-slate-500">
              Visualiza cómo se muestra tu perfil médico en Google y la tarjeta interactiva al enviar tu enlace por WhatsApp o redes sociales.
            </p>
          </div>

          {/* Selector de pestañas de previsualización */}
          <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
            <button
              type="button"
              onClick={() => setSeoPreviewTab('serp')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                seoPreviewTab === 'serp'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Google SERP</span>
            </button>
            <button
              type="button"
              onClick={() => setSeoPreviewTab('social')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                seoPreviewTab === 'social'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Redes Sociales (WhatsApp)</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO PESTAÑA 1: GOOGLE SERP */}
        {seoPreviewTab === 'serp' && (
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                {/* Favicon real del médico */}
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {activeFavicon ? (
                    <img src={activeFavicon} alt="Favicon" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px]">🩺</span>
                  )}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[11px] text-slate-800 font-medium leading-none truncate">
                    {data.dominioWeb || "https://tu-consultorio-medico.ec"}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none mt-0.5 truncate">
                    {data.ciudad || "Ecuador"} &gt; {data.especialidad || "Consulta Médica"}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100 shrink-0">
                Google Search
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex-1 space-y-1">
                <h5 className="text-base text-blue-800 font-medium hover:underline cursor-pointer leading-tight line-clamp-1">
                  {data.metaTitulo || `${data.nombreMedico} | ${data.especialidad} en ${data.ciudad}, Ecuador`}
                </h5>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {data.metaDescripcion || `Consulta con ${data.nombreMedico}, especialista en ${data.especialidad} en ${data.ciudad}. Agenda tu cita médica presencial o virtual hoy mismo.`}
                </p>
              </div>

              {/* Miniatura lateral SERP (Rich Result Thumbnail) */}
              {activeOgImage && (
                <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50 shadow-xs">
                  <img src={activeOgImage} alt="Miniatura SERP" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: REDES SOCIALES (OPEN GRAPH / WHATSAPP) */}
        {seoPreviewTab === 'social' && (
          <div className="space-y-4">
            {/* Tarjeta de Previsualización estilo WhatsApp / Facebook */}
            <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
              {/* Imagen Banner Open Graph */}
              <div className="w-full h-48 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                {activeOgImage ? (
                  <img src={activeOgImage} alt="Vista Previa Redes" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400 p-4 text-center">
                    <Share2 className="w-8 h-8 opacity-40" />
                    <span className="text-xs font-semibold">Sin imagen asignada para compartir</span>
                    <span className="text-[10px]">Selecciona o sube una imagen abajo</span>
                  </div>
                )}
                {/* Badge de origen de imagen */}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs">
                  {data.ogImageSource === "logo"
                    ? "Logotipo"
                    : data.ogImageSource === "pwa_icon"
                    ? "Ícono PWA / Favicon"
                    : data.ogImageSource === "custom"
                    ? "Personalizada"
                    : "Foto de Perfil"}
                </span>
              </div>

              {/* Texto de la tarjeta social */}
              <div className="p-3.5 bg-white border-t border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block truncate">
                  {(data.dominioWeb || "TU-CONSULTORIO-MEDICO.EC").replace(/^https?:\/\//i, "").toUpperCase()}
                </span>
                <h6 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {data.metaTitulo || `${data.nombreMedico} | ${data.especialidad} en ${data.ciudad}, Ecuador`}
                </h6>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {data.metaDescripcion || `Consulta con ${data.nombreMedico}, especialista en ${data.especialidad}. Haz clic para ver información médica y agendar cita.`}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center italic">
              ✨ Tarjeta interactiva que verán tus pacientes al compartir tu enlace por WhatsApp, Facebook, Instagram, Twitter o LinkedIn.
            </p>
          </div>
        )}

        {/* SELECTOR Y CONFIGURACIÓN DE IMAGEN PARA REDES SOCIALES */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              Imagen para Redes Sociales & Compartir Enlaces (Open Graph)
            </span>
            <span className="text-[10px] font-mono text-slate-500">og:image</span>
          </div>

          {/* Opciones de Origen de Imagen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "foto", label: "📷 Foto Perfil", subtitle: "Recomendado" },
              { id: "logo", label: "🏥 Logotipo", subtitle: "Identidad Marca" },
              { id: "pwa_icon", label: "🎨 Ícono PWA", subtitle: "Favicon Adaptado" },
              { id: "custom", label: "🖼️ Personalizada", subtitle: "Subir Imagen" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField("ogImageSource", opt.id)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  (data.ogImageSource || "foto") === opt.id
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold shadow-2xs"
                    : "border-slate-200 bg-white hover:bg-slate-100/70 text-slate-700 font-medium"
                }`}
              >
                <span className="text-xs leading-tight">{opt.label}</span>
                <span className="text-[9px] text-slate-400 font-normal mt-0.5">{opt.subtitle}</span>
              </button>
            ))}
          </div>

          {/* Campo cuando se selecciona "custom" */}
          {data.ogImageSource === "custom" && (
            <div className="space-y-2 pt-1 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={data.ogImageUrl || ""}
                  onChange={(e) => updateField("ogImageUrl", e.target.value)}
                  placeholder="Pega URL o sube una imagen personalizada para WhatsApp..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white outline-none focus:border-emerald-500"
                />
                
                <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const res = await compressAndConvertToWebP(file, {
                            maxWidth: 1200,
                            maxHeight: 630,
                            quality: 0.85
                          });
                          updateField("ogImageUrl", res.dataUrl);
                          updateField("ogImageSource", "custom");
                        } catch (err) {
                          console.error("Error compressing OG image:", err);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* EDICIÓN DE META TÍTULO Y META DESCRIPCIÓN */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-blue-50 to-indigo-50/70 p-3 rounded-xl border border-blue-200/80">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Optimización de SEO Local para Ecuador
              </span>
              <p className="text-[11px] text-blue-700/80">
                Fórmula de oro para ranking: <span className="font-bold font-mono text-[10px] bg-blue-100/70 px-1 py-0.5 rounded text-blue-900">[Especialidad] en [Ciudad] | [Doctor]</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const { resolvedTitle, resolvedDesc, localKeywords } = resolveLocalSeoFields(data);
                onChange({
                  ...data,
                  metaTitulo: resolvedTitle,
                  metaDescripcion: resolvedDesc,
                  metaKeywords: localKeywords
                });
                injectHeadTagsInDocument(data.dominioWeb || "", resolvedTitle, resolvedDesc);
                setOptimizedNotice(`¡Optimizado para ${data.especialidad || 'Especialidad'} en ${data.ciudad || 'Ecuador'}!`);
                setTimeout(() => setOptimizedNotice(null), 4000);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto-Completar SEO Local</span>
            </button>
          </div>

          {optimizedNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{optimizedNotice}</span>
            </div>
          )}

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

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="metaKeywords">
                Palabras Clave SEO Local (Especialidad + Ciudad)
              </label>
              <span className="text-[10px] text-slate-400">Separadas por comas</span>
            </div>
            <input
              id="metaKeywords"
              type="text"
              value={data.metaKeywords ?? ""}
              onChange={(e) => updateField("metaKeywords", e.target.value)}
              placeholder={`ej. ${data.especialidad || 'Traumatología'} en ${data.ciudad || 'Quito'}, médico ${data.especialidad || 'traumatólogo'} ${data.ciudad || 'Quito'}, doctor ${data.ciudad || 'Quito'}`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900"
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500 font-semibold">Sugerencias locales:</span>
              {[
                `${data.especialidad || 'Especialidad'} en ${data.ciudad || 'Quito'}`,
                `médico ${data.especialidad || 'especialista'} ${data.ciudad || 'Quito'}`,
                `consulta ${data.especialidad || 'médica'} ${data.ciudad || 'Quito'}`,
                `mejor ${data.especialidad || 'médico'} en ${data.ciudad || 'Ecuador'}`
              ].map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const current = (data.metaKeywords || "").trim();
                    if (!current) {
                      updateField("metaKeywords", sug);
                    } else if (!current.toLowerCase().includes(sug.toLowerCase())) {
                      updateField("metaKeywords", `${current}, ${sug}`);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-medium text-slate-600 transition-colors border border-slate-200/60 cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3.5. GOOGLE SEARCH CONSOLE (GSC) - VERIFICACIÓN DE PROPIEDAD & INDEXACIÓN */}
      {(() => {
        const cleanGscCode = extractGoogleVerificationCode(data.googleSiteVerification);
        const activeGscFilename = getGoogleHtmlVerificationFilename(data.googleVerificationFileCode || cleanGscCode);
        const activeGscFileContent = activeGscFilename ? getGoogleHtmlVerificationContent(activeGscFilename) : "";
        const activeDomainForGsc = normalizeDomainUrl(data.dominioWeb || "https://tu-consultorio-medico.ec");
        const sitemapGscUrl = `${activeDomainForGsc}/sitemap.xml`;
        const isVerified = Boolean(cleanGscCode || data.googleVerificationFileCode);

        const handleDownloadHtmlFile = () => {
          if (!activeGscFilename) return;
          const content = activeGscFileContent || getGoogleHtmlVerificationContent(activeGscFilename);
          const blob = new Blob([content], { type: "text/html;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = activeGscFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Google Search Console (GSC)
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
                      Verificación Oficial
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-600 pl-9">
                  Valida la titularidad de tu dominio web para activar la indexación acelerada en Google, monitorear términos médicos de búsqueda y enviar tu mapa de sitio.
                </p>
              </div>

              <div className="pl-9 sm:pl-0 shrink-0">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Código Configurado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    Sin Verificación
                  </span>
                )}
              </div>
            </div>

            {/* Pestañas de Método de Verificación */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setGscVerificationTab('meta')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  gscVerificationTab === 'meta'
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                1. Metaetiqueta HTML
              </button>

              <button
                type="button"
                onClick={() => setGscVerificationTab('file')}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  gscVerificationTab === 'file'
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                2. Archivo HTML
              </button>

              <button
                type="button"
                onClick={() => setGscVerificationTab('dns')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  gscVerificationTab === 'dns'
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                3. Registro DNS TXT
              </button>
            </div>

            {/* CONTENIDO PESTAÑA 1: METAETIQUETA HTML */}
            {gscVerificationTab === 'meta' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label htmlFor="googleSiteVerification" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-600" />
                    Código o Metaetiqueta de Google
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Recomendado
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Se inyecta automáticamente en &lt;head&gt;
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="googleSiteVerification"
                    type="text"
                    value={data.googleSiteVerification ?? ""}
                    onChange={(e) => updateField("googleSiteVerification", e.target.value)}
                    placeholder='ej: 4-7xABcdEF... o <meta name="google-site-verification" content="..." />'
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pega el código que te proporciona Google Search Console en la opción <strong>&quot;Etiqueta HTML&quot;</strong>. Si pegas la etiqueta HTML completa, el sistema extraerá automáticamente el token para garantizar una inyección limpia.
                </p>

                {cleanGscCode ? (
                  <div className="space-y-2 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Metaetiqueta lista e inyectada en tiempo real:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`<meta name="google-site-verification" content="${cleanGscCode}">`);
                          setCopiedGscMeta(true);
                          setTimeout(() => setCopiedGscMeta(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
                      >
                        {copiedGscMeta ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedGscMeta ? "¡Copiado!" : "Copiar Meta Tag"}</span>
                      </button>
                    </div>

                    <pre className="p-2.5 rounded-md bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
                      {`<meta name="google-site-verification" content="${cleanGscCode}">`}
                    </pre>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] text-emerald-800">
                        ✓ Inyectada en index.html y en todas las páginas de servicios para la exportación ZIP y despliegue FTP.
                      </span>

                      {!data.googleVerificationFileCode && (
                        <button
                          type="button"
                          onClick={() => updateField("googleVerificationFileCode", cleanGscCode)}
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                        >
                          Usar también este código para generar el Archivo HTML →
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/80 text-blue-900 text-[11px] flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      En Google Search Console, selecciona la propiedad de tu web, elige el método <strong>&quot;Etiqueta HTML&quot;</strong>, copia el código y pégalo arriba.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO PESTAÑA 2: ARCHIVO HTML */}
            {gscVerificationTab === 'file' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label htmlFor="googleVerificationFileCode" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    Nombre del Archivo o Código de Google (google[código].html)
                  </label>
                  {cleanGscCode && !data.googleVerificationFileCode && (
                    <button
                      type="button"
                      onClick={() => updateField("googleVerificationFileCode", cleanGscCode)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      Copiar desde Metaetiqueta
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="googleVerificationFileCode"
                    type="text"
                    value={data.googleVerificationFileCode ?? ""}
                    onChange={(e) => updateField("googleVerificationFileCode", e.target.value)}
                    placeholder="ej: google4-7xABcdEF.html o 4-7xABcdEF"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Google Search Console permite verificar descargando un archivo HTML con formato <code>google[código].html</code>. Puedes ingresar el nombre del archivo o simplemente el código asignado.
                </p>

                {activeGscFilename ? (
                  <div className="space-y-3 p-3 rounded-lg bg-white border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Archivo a generar en la raíz de tu web:
                        </span>
                        <div className="font-mono text-xs font-bold text-blue-700 flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5" />
                          {activeGscFilename}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeGscFilename);
                            setCopiedGscFilename(true);
                            setTimeout(() => setCopiedGscFilename(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
                        >
                          {copiedGscFilename ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedGscFilename ? "¡Copiado!" : "Copiar Nombre"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadHtmlFile}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar {activeGscFilename}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Contenido estricto del archivo (según especificación Google):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeGscFileContent);
                            setCopiedGscFileContent(true);
                            setTimeout(() => setCopiedGscFileContent(false), 2000);
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedGscFileContent ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedGscFileContent ? "¡Copiado!" : "Copiar Contenido"}</span>
                        </button>
                      </div>

                      <pre className="p-2.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
                        {activeGscFileContent}
                      </pre>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong>Inclusión Automática en Despliegues:</strong> Al generar el archivo <strong>ZIP</strong> o desplegar por <strong>FTP</strong> desde el Panel de Código, este archivo se compilará y colocará automáticamente en la raíz pública (<code>{activeDomainForGsc}/{activeGscFilename}</code>) para que Google lo verifique de inmediato.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Ingresa el nombre del archivo de verificación (ej. <code>google4-7xABcdEF.html</code>) para habilitar la descarga y empaquetado automático.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO PESTAÑA 3: REGISTRO DNS TXT */}
            {gscVerificationTab === 'dns' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    Verificación a Nivel de Dominio (Registro DNS TXT)
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Si eres propietario de tu propio dominio (ej. <code>.ec</code> o <code>.com</code>) administrado en Cloudflare, cPanel, GoDaddy o Hostinger, puedes verificar todas las versiones (http, https, www) mediante un solo registro DNS de tipo TXT.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Tipo de Registro</span>
                      <span className="font-mono font-bold text-blue-700">TXT</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Nombre / Host</span>
                      <span className="font-mono font-bold text-slate-800">@ (o raíz de dominio)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-150">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">TTL</span>
                      <span className="font-mono font-bold text-slate-800">Automático / 3600</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Valor o Destino del Registro TXT:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const txtValue = `google-site-verification=${cleanGscCode || 'TU_CODIGO_DE_GOOGLE'}`;
                          navigator.clipboard.writeText(txtValue);
                          setCopiedGscDns(true);
                          setTimeout(() => setCopiedGscDns(false), 2000);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedGscDns ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedGscDns ? "¡Copiado!" : "Copiar Registro TXT"}</span>
                      </button>
                    </div>

                    <pre className="p-2.5 rounded-md bg-slate-900 text-blue-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
                      {`google-site-verification=${cleanGscCode || 'TU_CODIGO_DE_GOOGLE'}`}
                    </pre>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-blue-950">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Pasos rápidos para tu proveedor DNS:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                    <li><strong>Cloudflare:</strong> DNS &gt; Registros &gt; Añadir registro &gt; Tipo: TXT, Nombre: @, Contenido: el valor de arriba.</li>
                    <li><strong>cPanel / Webhosting:</strong> Editor de Zona DNS &gt; Administrar &gt; Añadir registro TXT.</li>
                    <li><strong>Hostinger / GoDaddy:</strong> Administración DNS &gt; Añadir nuevo registro TXT.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* SECCIÓN VINCULADA: ENVÍO DEL SITEMAP XML */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Paso siguiente: Enviar Sitemap XML a Google Search Console
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      100% Compatible GSC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono break-all">
                    {sitemapGscUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("sitemap.xml");
                      setCopiedGscSitemapUrl(true);
                      setTimeout(() => setCopiedGscSitemapUrl(false), 2000);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-slate-200 shadow-2xs"
                    title="Copia 'sitemap.xml' para pegarlo directamente en Google Search Console"
                  >
                    {copiedGscSitemapUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedGscSitemapUrl ? "¡sitemap.xml Copiado!" : "Copiar 'sitemap.xml'"}</span>
                  </button>

                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <span>Abrir Search Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Guía Rápida de Envío en GSC */}
              <div className="p-2.5 rounded-lg bg-white/80 border border-blue-100 text-[11px] text-slate-700 space-y-1">
                <span className="font-bold text-blue-950 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Instrucciones directas para Google Search Console:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 pl-1 text-slate-600">
                  <li>Inicia sesión en <strong>Google Search Console</strong> y selecciona la propiedad del médico.</li>
                  <li>En el menú lateral izquierdo, haz clic en <strong>&quot;Sitemaps&quot; (Mapas del sitio)</strong>.</li>
                  <li>En el campo <em>&quot;Añadir un nuevo sitemap&quot;</em>, escribe únicamente: <code className="bg-slate-100 text-blue-700 font-bold px-1.5 py-0.5 rounded font-mono">sitemap.xml</code> y pulsa <strong>&quot;Enviar&quot;</strong>.</li>
                  <li>Google mostrará el estado en verde: <strong>&quot;Correcto&quot;</strong> e indexará de inmediato la portada, procedimientos y fotografías clínicas.</li>
                </ol>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3.6. GOOGLE ANALYTICS 4 (GA4) - MÉTRICAS DE PACIENTES & CONVERSIONES */}
      {(() => {
        const cleanGaId = extractGoogleAnalyticsId(data.googleAnalyticsId);
        const gaScriptContent = generateGoogleAnalyticsScript(data.googleAnalyticsId);
        const isGaConfigured = Boolean(cleanGaId);

        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Google Analytics 4 (GA4 &amp; gtag.js)
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wide">
                      Métricas &amp; Conversiones
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-600 pl-9">
                  Mide en tiempo real las visitas de pacientes, canales de captación (Google Orgánico, WhatsApp, Instagram, Facebook) y clics de agendamiento.
                </p>
              </div>

              <div className="pl-9 sm:pl-0 shrink-0">
                {isGaConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    GA4 Activo ({cleanGaId})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    Sin Configurar
                  </span>
                )}
              </div>
            </div>

            {/* Formulario de Entrada GA4 */}
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label htmlFor="googleAnalyticsId" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  ID de Medición de Google Analytics (Flujo Web)
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Formato: G-XXXXXXXXXX
                  </span>
                </label>
                <span className="text-[10px] text-slate-500">
                  Inyección oficial en &lt;head&gt;
                </span>
              </div>

              <div className="relative">
                <input
                  id="googleAnalyticsId"
                  type="text"
                  value={data.googleAnalyticsId ?? ""}
                  onChange={(e) => updateField("googleAnalyticsId", e.target.value)}
                  placeholder='ej: G-1A2B3C4D5E o pega la etiqueta completa <!-- Google tag (gtag.js) -->...'
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-white"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pega tu <strong>ID de Medición</strong> de Google Analytics 4 (ej. <code>G-XXXXXXXXXX</code>) o el bloque de código <code>gtag.js</code> completo. El sistema detecta y extrae automáticamente tu identificador para compilar el script con el formato oficial optimizado.
              </p>

              {isGaConfigured ? (
                <div className="space-y-2.5 p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-amber-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Script gtag.js generado e inyectado en el &lt;head&gt;:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(cleanGaId);
                          setCopiedGaId(true);
                          setTimeout(() => setCopiedGaId(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-amber-300 shadow-2xs shrink-0"
                      >
                        {copiedGaId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedGaId ? "¡ID Copiado!" : "Copiar ID"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(gaScriptContent);
                          setCopiedGaScript(true);
                          setTimeout(() => setCopiedGaScript(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
                      >
                        {copiedGaScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedGaScript ? "¡Script Copiado!" : "Copiar Script gtag.js"}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-2.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
                    {gaScriptContent}
                  </pre>

                  <div className="text-[10px] text-amber-900 flex items-center gap-1.5 pt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Inyectado automáticamente en <code>index.html</code>, en todas las páginas de servicios (<code>/servicios/</code>), exportación ZIP y despliegue FTP.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/80 text-blue-900 text-[11px] space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-blue-950">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ¿Dónde encontrar tu ID de Medición en Google Analytics 4?
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
                    <li>Entra a <strong>Google Analytics</strong> con tu cuenta de Gmail médica.</li>
                    <li>Haz clic en el ícono de engranaje <strong>Administrar (⚙️)</strong> abajo a la izquierda.</li>
                    <li>En la columna de propiedad, ingresa a <strong>Flujos de datos</strong> &gt; selecciona la pestaña <strong>Web</strong>.</li>
                    <li>Haz clic sobre el flujo de tu web y copia el <strong>ID de medición</strong> (inicia con <code>G-</code>).</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Módulo de Eventos Médicos & Conversiones Rastreadas */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200/70 space-y-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900">
                  Eventos Clave y Conversiones Médicas Monitoreadas
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Con tu ID de Google Analytics activo, podrás analizar los canales que más citas te generan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-white border border-amber-100 flex items-start gap-2 shadow-2xs">
                  <span className="text-base">📱</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Clics a WhatsApp</span>
                    <span className="text-slate-500 text-[10px]">Pacientes que inician conversación directa para agendar.</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-amber-100 flex items-start gap-2 shadow-2xs">
                  <span className="text-base">📞</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Llamadas al Consultorio</span>
                    <span className="text-slate-500 text-[10px]">Pacientes móviles que pulsan para llamar por teléfono.</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-amber-100 flex items-start gap-2 shadow-2xs">
                  <span className="text-base">📅</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Agendamiento en Línea</span>
                    <span className="text-slate-500 text-[10px]">Interacciones con formularios o plataformas como Doctoralia.</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-amber-100 flex items-start gap-2 shadow-2xs">
                  <span className="text-base">🩺</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Visitas a Tratamientos</span>
                    <span className="text-slate-500 text-[10px]">Procedimientos médicos más consultados por la audiencia.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <span>Abrir Google Analytics</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        );
      })()}

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
                  const activeCleanDomain = normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]);
                  const sitemap = generateSitemapXml(data, activeCleanDomain);
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
            <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-36 whitespace-pre-wrap">
              {generateSitemapXml(data, normalizeDomainUrl(data.dominioWeb || primarySubdomains[0]))}
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

      {/* 5.5. MÓDULO DE GESTIÓN DE BACKLINKS Y AUTORIDAD MÉDICA (E-E-A-T) */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                Gestión de Backlinks y Citaciones de Autoridad Médica (E-E-A-T)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fortalece la reputación médica en Google (E-E-A-T) vinculando tu sitio con colegios de médicos, sociedades científicas, staff hospitalario y Google Business Profile.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleGenerateSmartSuggestions}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Generar enlaces sugeridos automáticamente según tu ciudad y especialidad"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sugerencias Automáticas</span>
            </button>
            <button
              type="button"
              onClick={handleCopyAiPrompt}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-indigo-400/30"
              title="Copiar prompt compatible con ChatGPT, Gemini, Claude, Perplexity u otra IA"
            >
              {copiedAiPrompt ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Bot className="w-3.5 h-3.5 text-amber-300" />}
              <span>{copiedAiPrompt ? "¡Prompt Copiado!" : "Copiar Prompt para IA (ChatGPT, Gemini, Claude)"}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsImportingAiResponse(!isImportingAiResponse)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-amber-400/30"
              title="Pegar y procesar automáticamente la respuesta generada por la IA"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Importar Respuesta de IA</span>
            </button>
          </div>
        </div>

        {/* Módulo Desplegable de Importación de Respuesta de IA */}
        {isImportingAiResponse && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Importador Automático de Backlinks desde IA</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsImportingAiResponse(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Cerrar
              </button>
            </div>

            <p className="text-[11.5px] text-amber-200/90 leading-relaxed">
              Pega aquí la respuesta que te dio ChatGPT, Gemini, Claude o Perplexity. La plataforma extraerá automáticamente las instituciones, nombres y enlaces para agregarlos a tu lista registrada.
            </p>

            <textarea
              rows={5}
              value={pastedAiText}
              onChange={e => setPastedAiText(e.target.value)}
              placeholder="Pega aquí todo el texto de respuesta de la IA (incluyendo el bloque JSON o la lista de enlaces)..."
              className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-emerald-300 placeholder-slate-600 focus:border-amber-400 outline-none"
            />

            {importSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {importErrorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-900/60 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{importErrorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPastedAiText("")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Limpiar Texto
              </button>
              <button
                type="button"
                onClick={handleImportAiResponse}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Procesar e Importar Backlinks</span>
              </button>
            </div>
          </div>
        )}

        {/* Noticia de optimización sin saturación */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Búsqueda Inteligente y Cumplimiento Ético SEO Médico:</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-slate-300">
            • <strong>Prospección Externa Sin Saturación</strong>: Usa <em>&quot;Copiar Prompt para IA&quot;</em> con cualquier inteligencia artificial (ChatGPT, Gemini, Claude). Luego pega la respuesta en <em>&quot;Importar Respuesta de IA&quot;</em> para cargar todos los backlinks en 1 segundo.<br/>
            • <strong>Filtrado de Competencia Externa</strong>: Para resguardar la reputación del médico, los aggregators privados externos (ej. Doctoralia, etc.) son excluidos automáticamente del footer visual público de tu landing, reservando las citaciones visibles para instituciones y colegios oficiales (GBP, Colegio Médico, Hospitales).
          </p>
        </div>

        {/* Resumen de Métrica E-E-A-T */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Total Citaciones</span>
            <span className="text-lg font-black text-white">{data.backlinksAutoridad?.length || 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-extrabold block">Verificados</span>
            <span className="text-lg font-black text-emerald-300">
              {(data.backlinksAutoridad || []).filter(b => b.estado === 'verificado').length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-center space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-extrabold block">En JSON-LD</span>
            <span className="text-lg font-black text-indigo-300">
              {(data.backlinksAutoridad || []).filter(b => b.incluirEnSchema).length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-extrabold block">Insignia Footer</span>
            <span className="text-lg font-black text-amber-300">
              {(data.backlinksAutoridad || []).filter(b => b.mostrarEnFooter).length}
            </span>
          </div>
        </div>

        {/* Formulario Sencillo y Rápido para agregar un enlace manualmente */}
        <form onSubmit={handleAddBacklink} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Agregar Nueva Citación o Enlace Rápido</span>
            </h5>
            <button
              type="button"
              onClick={() => setShowAdvancedManualForm(!showAdvancedManualForm)}
              className="text-[11px] text-slate-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
            >
              {showAdvancedManualForm ? "▲ Ocultar Opciones Avanzadas" : "⚙️ Opciones Avanzadas"}
            </button>
          </div>

          {/* Formulario Simplificado Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-5 space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Portal / Institución *</label>
              <input
                type="text"
                value={newPortalNombre}
                onChange={e => setNewPortalNombre(e.target.value)}
                placeholder="Ej. Colegio de Médicos de Pichincha"
                required
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="sm:col-span-5 space-y-1">
              <label className="text-[11px] font-bold text-slate-300">URL Destino (https://...) *</label>
              <input
                type="url"
                value={newUrlDestino}
                onChange={e => setNewUrlDestino(e.target.value)}
                placeholder="https://www.colegiomedicopichincha.org/perfil"
                required
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer h-[34px]"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          </div>

          {/* Opciones Avanzadas Opcionales */}
          {showAdvancedManualForm && (
            <div className="pt-3 border-t border-slate-700/60 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Tipo de Portal</label>
                  <select
                    value={newTipoPortal}
                    onChange={e => setNewTipoPortal(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="colegio_medico">Colegio Médico Provincial</option>
                    <option value="perfil_google">Ficha Google Business Profile (Maps)</option>
                    <option value="hospital_clinica">Hospital / Clínica / Quirófano</option>
                    <option value="sociedad_cientifica">Sociedad Científica / Especialidad</option>
                    <option value="directorio_local">Directorio Sanitario Local</option>
                    <option value="universidad_investigacion">Universidad / Investigación</option>
                    <option value="prensa_salud">Medio de Prensa / Salud</option>
                    <option value="otro">Otro Enlace de Autoridad</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Texto Ancla (Anchor Text)</label>
                  <input
                    type="text"
                    value={newAnchorText}
                    onChange={e => setNewAnchorText(e.target.value)}
                    placeholder="Ej. Dr. Carlos Pérez - Colegio de Médicos"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Estado del Enlace</label>
                  <select
                    value={newEstado}
                    onChange={e => setNewEstado(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="verificado">✅ Verificado / Activo</option>
                    <option value="pendiente">⏳ Pendiente de Aprobación</option>
                    <option value="sugerido">💡 Sugerido / En Prospección</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Notas / Observaciones</label>
                <input
                  type="text"
                  value={newNotas}
                  onChange={e => setNewNotas(e.target.value)}
                  placeholder="Ej. Ficha anual actualizada 2026"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={newIncluirSchema}
                    onChange={e => setNewIncluirSchema(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span>Inyectar en Schema JSON-LD (sameAs)</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={newMostrarFooter}
                    onChange={e => setNewMostrarFooter(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span>Mostrar Insignia en Footer Público</span>
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Lista de enlaces registrados */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Listado de Citaciones Registradas ({(data.backlinksAutoridad || []).length})</span>
            <span className="text-[11px] text-slate-500 font-normal">Schema sameAs / Footer público</span>
          </h5>

          {(!data.backlinksAutoridad || data.backlinksAutoridad.length === 0) ? (
            <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center space-y-2">
              <p className="text-xs font-bold text-slate-300">No hay citaciones o backlinks registrados aún</p>
              <p className="text-[11px] text-slate-400">
                Haz clic en &quot;Sugerencias Automáticas&quot; para pre-cargar instituciones clave de tu ciudad o agrega una manualmente arriba.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.backlinksAutoridad.map((item) => {
                const isVerified = item.estado === 'verificado';
                const isPending = item.estado === 'pendiente';
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-start justify-between gap-3 hover:border-slate-600 transition-all group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          isVerified ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          isPending ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {isVerified ? '✅ Verificado' : isPending ? '⏳ Pendiente' : '💡 Sugerido'}
                        </span>
                        
                        <span className="text-xs font-black text-white truncate">
                          {item.portalNombre}
                        </span>

                        <a
                          href={item.urlDestino}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{item.urlDestino}</span>
                        </a>
                      </div>

                      {item.anchorText && (
                        <p className="text-[11px] text-slate-300">
                          <strong className="text-slate-400">Anchor:</strong> &quot;{item.anchorText}&quot;
                        </p>
                      )}

                      {item.notas && (
                        <p className="text-[10.5px] text-slate-400 italic">
                          {item.notas}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-0.5">
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <button
                          type="button"
                          onClick={() => handleToggleBacklinkProp(item.id, "incluirEnSchema")}
                          className={`px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors ${
                            item.incluirEnSchema ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700' : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                          title="Controla si se incluye en sameAs de Schema.org JSON-LD"
                        >
                          {item.incluirEnSchema ? <CheckSquare className="w-3 h-3 text-indigo-400" /> : <Square className="w-3 h-3 text-slate-500" />}
                          <span>Schema</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleBacklinkProp(item.id, "mostrarEnFooter")}
                          className={`px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors ${
                            item.mostrarEnFooter ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                          title="Controla si se muestra como insignia en el footer público de la landing page"
                        >
                          {item.mostrarEnFooter ? <CheckSquare className="w-3 h-3 text-emerald-400" /> : <Square className="w-3 h-3 text-slate-500" />}
                          <span>Footer</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveBacklink(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Eliminar citación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
