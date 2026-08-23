/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData, ServiceItem, BlogPostItem } from "../types";
import { 
  X, 
  MapPin, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  MessageSquare, 
  Calendar, 
  Tag, 
  FileText,
  Megaphone,
  Building2,
  CheckCircle2,
  Download
} from "lucide-react";

interface GbpPostExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MedicalLandingData;
}

type PostType = "novedad" | "servicio" | "blog" | "oferta";

export function GbpPostExporterModal({
  isOpen,
  onClose,
  data
}: GbpPostExporterModalProps) {
  const [postType, setPostType] = useState<PostType>("novedad");
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);
  const [selectedBlogIndex, setSelectedBlogIndex] = useState<number>(0);
  const [offerDiscount, setOfferDiscount] = useState<string>("Valoración Inicial / Chequeo Preventivo");

  const [copiedText, setCopiedText] = useState(false);
  const [copiedCta, setCopiedCta] = useState(false);

  if (!isOpen) return null;

  const doctorName = data.nombreMedico || "Dr. Especialista";
  const specialty = data.especialidad || "Medicina Especializada";
  const city = data.ciudad || "Ecuador";
  const clinic = data.nombreClinicaGBP || "Consultorio Médico";
  const address = data.direccionFisica || "Dirección del Consultorio";
  const phone = data.telefonoGBP || "";
  const webUrl = data.dominioWeb && !data.dominioWeb.includes("{{") ? data.dominioWeb : "https://mi-consultorio-medico.ec";
  const whatsappUrl = data.whatsappUrl || webUrl;

  const activeServices = data.servicios || [];
  const selectedService: ServiceItem | undefined = activeServices[selectedServiceIndex];

  const activeBlogs = data.blogPosts || [];
  const selectedBlog: BlogPostItem | undefined = activeBlogs[selectedBlogIndex];

  // Generador de texto para Google Business Profile (Google Maps)
  const generateGbpPostText = (): string => {
    switch (postType) {
      case "servicio": {
        const srvTitle = selectedService?.titulo || "Consulta Médica Especializada";
        const srvDesc = selectedService?.descripcion || "Atención diagnóstica integral con altos estándares de calidad y calidez médica.";
        const srvPrice = selectedService?.precio ? `\n💰 Inversión / Tarifa: ${selectedService.precio}` : "";

        return `🩺 ${srvTitle.toUpperCase()} EN ${city.toUpperCase()}

¿Buscas atención profesional en ${srvTitle.toLowerCase()}? En la consulta del ${doctorName} (${specialty}) te ofrecemos diagnóstico certero, equipos modernos y un plan de tratamiento personalizado.

📍 Ubicación: ${clinic} (${address}, ${city}).${srvPrice}

✨ Beneficios principales:
• Valoración clínica detallada y protocolizada.
• Emisión de Factura Electrónica autorizada por el SRI.
• Documentación completa para reembolso con aseguradoras privadas (Saludsa, Humana, Ecuasanitas, Confiamed, BMI, etc.).

📲 Agenda tu cita directamente por WhatsApp o ingresa a nuestra web oficial:
🔗 ${webUrl}

📞 Teléfono de Recepción: ${phone || "WhatsApp directo en nuestra web"}

#${specialty.replace(/[^a-zA-Z0-9]/g, "")} #${city.replace(/[^a-zA-Z0-9]/g, "")} #MedicoEcuador #ConsultorioMedico #${clinic.replace(/[^a-zA-Z0-9]/g, "")}`;
      }

      case "blog": {
        const blogTitle = selectedBlog?.titulo || "Recomendaciones Médicas para la Salud";
        const blogDesc = selectedBlog?.extracto || selectedBlog?.contenido || "Descubre consejos de prevención e información médica actualizada de primera mano.";
        const blogCategory = selectedBlog?.categoria || "Salud y Bienestar";

        return `📰 NUEVO ARTÍCULO MÉDICO: ${blogTitle.toUpperCase()}

El ${doctorName}, especialista en ${specialty} en ${city}, comparte recomendaciones esenciales sobre ${blogCategory.toLowerCase()}:

"${blogDesc}"

Aprender a identificar síntomas a tiempo es la clave para un tratamiento oportuno y efectivo. 

📍 Te atendemos en ${clinic} (${address}, ${city}).

👉 Lee el artículo completo y agenda tu cita en nuestra página web:
🔗 ${webUrl}

#SaludEcuador #${specialty.replace(/[^a-zA-Z0-9]/g, "")} #${city.replace(/[^a-zA-Z0-9]/g, "")} #MedicinaPreventiva #${doctorName.replace(/[^a-zA-Z0-9]/g, "")}`;
      }

      case "oferta": {
        return `🌟 ${offerDiscount.toUpperCase()} - ${specialty.toUpperCase()} EN ${city.toUpperCase()}

Cuida tu salud con el ${doctorName} en ${clinic}. Agenda tu ${offerDiscount.toLowerCase()} y accede a una atención integral con tecnología médica de vanguardia.

✅ Incluye:
• Evaluación clínica exhaustiva.
• Revisión de antecedentes e historial de salud.
• Plan terapéutico a la medida.
• Emisión de factura SRI válida para reembolso con tu seguro privado.

📍 Dirección: ${address}, ${city}.

📲 Reserva tu turno fácilmente dando clic en el enlace:
🔗 ${webUrl}

📞 Consultas por WhatsApp: ${phone}

#ConsultaMedica #${specialty.replace(/[^a-zA-Z0-9]/g, "")} #${city.replace(/[^a-zA-Z0-9]/g, "")} #SaludEcuador #Consultorio`;
      }

      case "novedad":
      default: {
        return `🏥 CONSULTA DE ${specialty.toUpperCase()} CON EL ${doctorName.toUpperCase()} EN ${city.toUpperCase()}

¿Necesitas evaluación médica especializada en ${city}? En ${clinic} estamos comprometidos con tu bienestar y el de tu familia.

👨‍⚕️ ${doctorName}
📋 ${data.cedulaProfesional ? `Registro Sanitario: ${data.cedulaProfesional}` : "Especialista Certificado"}
⭐ Más de ${data.anosExperiencia || 10} años de trayectoria profesional.

📍 Visítanos en: ${address}, ${city}.
🕒 Horarios de Atención: Lunes a Viernes (08:30 - 18:30) | Sábados previa cita.

💳 Aceptamos pagos en efectivo, transferencias bancarias y tarjetas de crédito. Facturación SRI inmediata para reembolso con aseguradoras privadas.

📲 Haz clic en "Reservar" o escríbenos a nuestro sitio web oficial:
🔗 ${webUrl}

#EspecialistaMedico #${specialty.replace(/[^a-zA-Z0-9]/g, "")} #${city.replace(/[^a-zA-Z0-9]/g, "")} #ConsultorioEcuador #Medicina`;
      }
    }
  };

  const currentGbpText = generateGbpPostText();

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentGbpText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([currentGbpText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Publicacion-GoogleMaps-${postType}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const googleBusinessManagerUrl = data.googleMapsReviewsUrl || "https://business.google.com/locations";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* CABECERA DE LA VENTANA */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Megaphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Exportador de Novedades para Google Maps (GBP)
              </h3>
              <p className="text-xs text-blue-100/90">
                Crea publicaciones de alto impacto local para Google Business Profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TIPO DE PUBLICACIÓN */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide block mb-2">
              1. Selecciona el Tipo de Publicación para Google Maps:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              <button
                type="button"
                onClick={() => setPostType("novedad")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  postType === "novedad" 
                    ? "bg-blue-50 border-blue-600 text-blue-900 font-extrabold shadow-xs" 
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                }`}
              >
                <Megaphone className={`w-5 h-5 ${postType === "novedad" ? "text-blue-600" : "text-slate-400"}`} />
                <span className="text-xs">Novedad Médico</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType("servicio")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  postType === "servicio" 
                    ? "bg-teal-50 border-teal-600 text-teal-900 font-extrabold shadow-xs" 
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                }`}
              >
                <Tag className={`w-5 h-5 ${postType === "servicio" ? "text-teal-600" : "text-slate-400"}`} />
                <span className="text-xs">Tratamiento</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType("blog")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  postType === "blog" 
                    ? "bg-purple-50 border-purple-600 text-purple-900 font-extrabold shadow-xs" 
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                }`}
              >
                <FileText className={`w-5 h-5 ${postType === "blog" ? "text-purple-600" : "text-slate-400"}`} />
                <span className="text-xs">Noticia / Blog</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType("oferta")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  postType === "oferta" 
                    ? "bg-amber-50 border-amber-600 text-amber-900 font-extrabold shadow-xs" 
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                }`}
              >
                <Sparkles className={`w-5 h-5 ${postType === "oferta" ? "text-amber-600" : "text-slate-400"}`} />
                <span className="text-xs">Promoción / Chequeo</span>
              </button>

            </div>
          </div>

          {/* PARÁMETROS ESPECÍFICOS SEGÚN EL TIPO */}
          {postType === "servicio" && activeServices.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
              <label className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                Selecciona el Servicio / Tratamiento a Destacar:
              </label>
              <select
                value={selectedServiceIndex}
                onChange={(e) => setSelectedServiceIndex(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-teal-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
              >
                {activeServices.map((srv, idx) => (
                  <option key={srv.id || idx} value={idx}>
                    {srv.titulo} {srv.precio ? `(${srv.precio})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {postType === "blog" && activeBlogs.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1.5">
              <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                Selecciona el Artículo de Blog a Promocionar:
              </label>
              <select
                value={selectedBlogIndex}
                onChange={(e) => setSelectedBlogIndex(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
              >
                {activeBlogs.map((blog, idx) => (
                  <option key={blog.id || idx} value={idx}>
                    {blog.titulo} ({blog.categoria})
                  </option>
                ))}
              </select>
            </div>
          )}

          {postType === "oferta" && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Título de la Consulta de Valoración o Chequeo:
              </label>
              <input
                type="text"
                value={offerDiscount}
                onChange={(e) => setOfferDiscount(e.target.value)}
                placeholder="Ej. Chequeo Preventivo de Salud / Primera Consulta"
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* TEXTO GENERADO PARA COPIAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                Texto Generado Optimizado para Google Maps:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="Descargar como archivo de texto .txt"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Descargar .txt</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? "¡Texto Copiado!" : "Copiar Texto"}</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={11}
              value={currentGbpText}
              className="w-full p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed border border-slate-800 focus:outline-none resize-none selection:bg-blue-600 selection:text-white"
            />
          </div>

          {/* BOTÓN OBLIGATORIO Y RECOMENDACIONES DE GOOGLE MAPS */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-extrabold text-blue-900 block">
                  ⚙️ Botón de Acción recomendado en Google Business Profile:
                </span>
                <span className="text-xs text-slate-600">
                  Usa el botón <strong>"RESERVAR"</strong> o <strong>"MÁS INFORMACIÓN"</strong> con la URL:
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                {webUrl}
              </span>
            </div>

            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between flex-wrap gap-3">
              <a
                href={googleBusinessManagerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md hover:scale-102 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>Abrir Gestor de Google Business Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
              </a>

              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Cumple las políticas de publicación de Google Maps
              </span>
            </div>
          </div>

        </div>

        {/* PIE DE PÁGINA DEL MODAL */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span className="font-semibold text-slate-500">
            📍 Posicionamiento Local en Google Maps Ecuador 🇪🇨
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
