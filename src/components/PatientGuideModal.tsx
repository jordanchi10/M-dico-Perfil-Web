import React, { useState } from "react";
import { MedicalLandingData, PatientGuideItem } from "../types";
import {
  FileText,
  Download,
  MessageSquare,
  Mail,
  Copy,
  Check,
  Send,
  X,
  Share2,
  Lock,
  CheckCircle2,
  Building2,
  ArrowRight,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface PatientGuideModalProps {
  guide: PatientGuideItem | null;
  data: MedicalLandingData;
  isOpen: boolean;
  onClose: () => void;
  onDownloadDirect?: (guide: PatientGuideItem) => void;
}

export const PatientGuideModal: React.FC<PatientGuideModalProps> = ({
  guide,
  data,
  isOpen,
  onClose,
  onDownloadDirect
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  if (!isOpen || !guide) return null;

  // Construir enlace amigable personalizado (ej. https://midominio.com/descargar/guia-gastritis o /ebook/guia)
  const baseDomain = data.dominioWeb || "https://tu-dominio.com";
  const prefix = (guide.tipoEnlace || "Ebook").toLowerCase().trim();
  const slugClean = guide.slug || guide.titulo.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const fullCustomUrl = prefix === "descargar" 
    ? `${baseDomain.replace(/\/$/, "")}/descargar/${slugClean}`
    : `${baseDomain.replace(/\/$/, "")}/${prefix}/${slugClean}`;

  // Ruta cPanel (ej. /descargas/guia-post-operatoria.pdf)
  const cpanelFilePath = guide.rutaCpanel || guide.archivoUrl || `/descargas/${slugClean}.pdf`;

  // Copiar enlace al portapapeles
  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullCustomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Enviar guía por WhatsApp al paciente
  const handleSendWhatsAppToPatient = () => {
    const phone = data.telefonoGBP ? data.telefonoGBP.replace(/[^0-9]/g, "") : "";
    const msg = encodeURIComponent(
      `Hola paciente, te comparto la guía médica oficial "${guide.titulo}" preparada por el ${data.nombreMedico} (${data.especialidad}).\n\nPuedes acceder y descargarla aquí:\n${fullCustomUrl}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  // Solicitar guía paciente -> doctor por WhatsApp
  const handlePatientRequestWhatsApp = () => {
    const phone = data.telefonoGBP ? data.telefonoGBP.replace(/[^0-9]/g, "") : "";
    const msg = encodeURIComponent(
      `Hola ${data.nombreMedico}, desearía solicitar la guía médica "${guide.titulo}" (${guide.formato || "PDF"}). Mi nombre es:`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  // Solicitar por Email
  const handlePatientRequestEmail = () => {
    const subject = encodeURIComponent(`Solicitud de Guía Médica: ${guide.titulo}`);
    const body = encodeURIComponent(
      `Estimado(a) ${data.nombreMedico},\n\nMe gustaría recibir la guía médica "${guide.titulo}". Por favor enviarla a este correo electrónico.\n\nAtentamente,\n[Nombre del Paciente]`
    );
    window.open(`mailto:${data.emailContacto || "contacto@medico.com"}?subject=${subject}&body=${body}`, "_blank");
  };

  // Ejecutar descarga directa
  const handleTriggerDownload = () => {
    if (onDownloadDirect) {
      onDownloadDirect(guide);
    } else {
      // Simulación de descarga con la ruta de cPanel
      const dummyContent = `%PDF-1.4\n% Guía Médica Oficial: ${guide.titulo}\n% Especialista: ${data.nombreMedico}\n% Ruta cPanel: ${cpanelFilePath}\n% Fecha: ${new Date().toLocaleDateString()}`;
      const blob = new Blob([dummyContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cpanelFilePath.split("/").pop() || `${slugClean}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadContact.trim()) return;
    setLeadSubmitted(true);
    handleTriggerDownload();
    setTimeout(() => {
      setLeadSubmitted(false);
    }, 2500);
  };

  const metodo = guide.metodoEntrega || (guide.requiereRegistro ? "registro_lead" : "todos");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 my-8">
        {/* Cabecera Adaptada con Marca y Logotipo del Médico */}
        <div className="p-6 sm:p-8 bg-white border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            {/* Branding del Doctor & Logotipo */}
            <div className="flex items-center gap-3.5">
              {data.logoUrl ? (
                <div className="h-12 max-w-[160px] flex items-center justify-center p-1 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
                  <img 
                    src={data.logoUrl || undefined} 
                    alt="Logotipo" 
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  {data.nombreMedico ? data.nombreMedico.charAt(0) : "M"}
                </div>
              )}

              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">
                  {data.nombreClinicaGBP || "Centro Médico Especializado"}
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {data.nombreMedico}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {data.especialidad}
                </p>
              </div>
            </div>

            {/* Badge de Formato / Ebook */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>{guide.tipoEnlace || "Ebook"} Oficial</span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Componente Ebook/Guía */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Tarjeta Visual de la Guía */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg bg-blue-600 text-white shadow-2xs">
                {guide.categoria || "Preparación Pacientes"}
              </span>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{guide.formato || "PDF"}</span>
                <span>•</span>
                <span>{guide.tamano || "1.8 MB"}</span>
              </span>
            </div>

            {guide.imagenPortadaUrl && (
              <div className="w-full h-40 sm:h-52 rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs">
                <img
                  src={guide.imagenPortadaUrl || undefined}
                  alt={guide.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-snug">
                {guide.titulo}
              </h2>
              {guide.descripcion && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-2">
                  {guide.descripcion}
                </p>
              )}
            </div>

            {/* Indicador de archivo en cPanel */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/90 text-xs flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium truncate">
                Ruta cPanel: <code className="text-blue-700 font-bold">{cpanelFilePath}</code>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                PDF Listo
              </span>
            </div>
          </div>

          {/* Formulario de Lead Magnet si requiere registro */}
          {(metodo === "registro_lead" || (guide.requiereRegistro && metodo !== "descarga_directa")) && !leadSubmitted && (
            <form onSubmit={handleLeadSubmit} className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">
                  Registra tus datos para desbloquear la descarga
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre completo"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none font-medium"
                />
                <input
                  type="text"
                  required
                  placeholder="WhatsApp o Correo electrónico"
                  value={leadContact}
                  onChange={(e) => setLeadContact(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Desbloquear y Descargar Guía</span>
              </button>
            </form>
          )}

          {leadSubmitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>¡Gracias! La descarga ha comenzado automáticamente.</span>
            </div>
          )}

          {/* Opciones de descarga y contacto directas */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Opciones de Entrega y Descarga
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Botón 1: Descarga Directa desde cPanel / Servidor */}
              {(metodo === "descarga_directa" || metodo === "todos" || !guide.requiereRegistro) && (
                <button
                  type="button"
                  onClick={handleTriggerDownload}
                  className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group"
                >
                  <Download className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  <span>Descargar Directo</span>
                  <span className="text-[10px] opacity-80 font-normal">PDF ({guide.tamano || "1.8 MB"})</span>
                </button>
              )}

              {/* Botón 2: Solicitar por WhatsApp */}
              {(metodo === "whatsapp" || metodo === "todos" || true) && (
                <button
                  type="button"
                  onClick={handlePatientRequestWhatsApp}
                  className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group"
                >
                  <MessageSquare className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  <span>Pedir por WhatsApp</span>
                  <span className="text-[10px] opacity-80 font-normal">Envío al celular</span>
                </button>
              )}

              {/* Botón 3: Solicitar por Email */}
              {(metodo === "email" || metodo === "todos" || true) && (
                <button
                  type="button"
                  onClick={handlePatientRequestEmail}
                  className="p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group"
                >
                  <Mail className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  <span>Solicitar por Correo</span>
                  <span className="text-[10px] opacity-80 font-normal">Recibir en Email</span>
                </button>
              )}
            </div>
          </div>

          {/* Panel de Enlace Compartible (Para enviar directamente a Pacientes) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">
                  Herramientas para enviar a Pacientes
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Enlace Directo
              </span>
            </div>

            {/* URL Completa Amigable */}
            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
              <input
                type="text"
                readOnly
                value={fullCustomUrl}
                className="w-full bg-transparent text-xs text-slate-200 font-mono outline-none px-2 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "¡Copiado!" : "Copiar"}</span>
              </button>
            </div>

            {/* Enviar al Paciente por WhatsApp */}
            <button
              type="button"
              onClick={handleSendWhatsAppToPatient}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Enviar este enlace directo al Paciente vía WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Footer Informativo con Marca */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Material Informativo Médico Oficial</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
};
