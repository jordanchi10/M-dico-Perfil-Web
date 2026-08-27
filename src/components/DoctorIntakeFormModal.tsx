/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  MessageSquare, 
  Mail, 
  Sparkles, 
  User, 
  MapPin, 
  Stethoscope, 
  Share2, 
  Image as ImageIcon, 
  ShieldCheck, 
  ArrowRight,
  ClipboardList
} from "lucide-react";

interface DoctorIntakeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiIngestion?: () => void;
}

export function DoctorIntakeFormModal({
  isOpen,
  onClose,
  onOpenAiIngestion
}: DoctorIntakeFormModalProps) {
  const [activeFormat, setActiveFormat] = useState<"whatsapp" | "email" | "document">("whatsapp");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Plantilla optimizada para WhatsApp
  const whatsappTemplate = `*FORMULARIO DE TOMA DE DATOS PARA TU LANDING PAGE MÉDICA* 🩺✨

¡Hola Doctor(a)! 👋 Para construir su sitio web médico profesional, optimizado para posicionamiento en Google (SEO Local en Ecuador) y agendamiento directo de pacientes, por favor responda las siguientes preguntas con la información de su consulta:

*1. DATOS PERSONALES Y REGISTRO PROFESIONAL* 👤
• Nombre completo:
• Especialidad médica / Subespecialidad:
• Registro MSP / SENESCYT (Ecuador):
• Universidad (Pregrado y Posgrado):
• Años de experiencia clínica:
• Breve biografía o filosofía de atención al paciente (2-3 párrafos):

*2. UBICACIÓN Y CONSULTORIO* 🏥
• Nombre comercial de la Clínica o Consultorio:
• Dirección exacta (Edificio, piso, número de consultorio):
• Ciudad y Provincia (Ecuador):
• Teléfono fijo del consultorio:
• WhatsApp exclusivo para citas de pacientes:
• Correo electrónico de contacto:
• Horarios de atención (Lunes-Viernes, Sábados, Domingos):
• Dominio web personalizado deseado (ej. drmedico.ec / drjuanperez.com):
• Enlace a Ficha de Google Business Profile / Google Maps (para integrar opiniones y widget de reseñas de Google):

*3. SERVICIOS Y PROCEDIMIENTOS CLAVE (Mínimo 3 - 5 principales)* 🩺
Para cada servicio indique:
- Servicio 1: [Nombre] | [Breve descripción] | [Precio aprox ($ USD)] | [Duración] | [Recuperación] | [Imagen opcional]
- Servicio 2: [Nombre] | [Breve descripción] | [Precio aprox ($ USD)] | [Duración] | [Recuperación] | [Imagen opcional]
- Servicio 3: [Nombre] | [Breve descripción] | [Precio aprox ($ USD)] | [Duración] | [Recuperación] | [Imagen opcional]
- Servicio 4: [Nombre] | [Breve descripción] | [Precio aprox ($ USD)] | [Duración] | [Recuperación] | [Imagen opcional]

*4. RECURSOS MÉDICOS, EBOOKS Y MATERIAL EDUCATIVO PARA PACIENTES* 📚 (Lead Magnet)
Si dispone o desea ofrecer material descargable para captar pacientes:
• Título de Guías / Ebooks / Fichas de Cuidados (ej. "Cuidados Postoperatorios de Rinoplastia", "Guía Nutricional para Pacientes Diabéticos"):
• Formato preferido (Ebook PDF, Ficha Imprimible, Checklist):
• Método de entrega preferido (Descarga Directa en el sitio, Enviar por WhatsApp, Enviar por Email):
• Enlace al PDF o ruta deseada en servidor/cPanel (ej. "/descargas/mi-guia.pdf"):

*5. REDES SOCIALES Y CONTENIDO DIGITAL* 📱
• Instagram (@usuario o enlace):
• Facebook:
• TikTok:
• YouTube / LinkedIn:
• Enlaces de Reels / Videos informativos destacados (Instagram/TikTok/Shorts) para incrustar en la web:
• Enlace a perfil de agendamiento o Ficha de Google Maps (si dispone):

*6. SEÑALES DE AUTORIDAD Y CONFIANZA (E-E-A-T)* 🛡️
• Aseguradoras privadas aceptadas para reembolso (ej. Saludsa, Humana, Ecuasanitas, Confiamed, BMI, etc.):
• Hospitales o clínicas de 3er nivel donde opera o atiende:
• Sociedades médicas, colegios profesionales o certificaciones a las que pertenece:

*7. VALOR DE CONSULTA Y MÉTODOS DE PAGO* 💳
• Valor aproximado de la consulta médica (Presencial / Telemedicina):
• Métodos de pago aceptados (Efectivo, Transferencia Banco Pichincha / Guayaquil / Produbanco, Tarjetas de Crédito, Deuna, Facturación Electrónica SRI):

*8. MATERIAL MULTIMEDIA ADJUNTO (Enviar por este medio)* 📸
• Foto de perfil profesional (alta resolución, fondo clínico o neutro).
• Logotipo de su consultorio o marca personal (PNG transparente si dispone).
• Imagen de portada para sus Guías/Ebooks (si dispone de diseño propio, o el sistema generará una portada adecuada).
• Fotos de sus instalaciones / consultorio / sala de espera (hasta 5-8 imágenes).
• Fotos de casos clínicos / Evolución Antes y Después (si aplica a su especialidad).

---
*Instrucciones:* Puede responder directamente este mensaje, enviar una nota de voz o adjuntar un documento Word con la información. ¡Procesaremos los datos para generar su Landing Page automáticamente en minutos! 🚀`;

  // 2. Plantilla formal para Correo Electrónico
  const emailTemplate = `Asunto: Formulario de Toma de Datos para su Landing Page Médica Profesional

Estimado(a) Doctor(a),

Con el fin de desarrollar su sitio web médico personalizado, optimizado para posicionamiento en Google (SEO Local en Ecuador) y agendamiento directo de pacientes, le solicitamos completar los siguientes datos clínicos y profesionales:

==================================================
FORMULARIO DE INGESTA DE INFORMACIÓN MÉDICA
==================================================

1. DATOS PERSONALES Y PROFESIONALES
--------------------------------------------------
- Nombre completo del médico:
- Especialidad / Subespecialidad principal:
- Registro del Ministerio de Salud Pública (MSP - Ecuador):
- Registro SENESCYT:
- Universidad de Egreso (Pregrado / Posgrado):
- Años de Experiencia Clínica:
- Resumen biográfico / Filosofía de atención al paciente:

2. UBICACIÓN Y DIRECCIÓN DEL CONSULTORIO
--------------------------------------------------
- Nombre comercial de la Clínica / Consultorio:
- Dirección exacta (Calle principal, intersección, edificio, piso, consultorio):
- Ciudad y Provincia (Ecuador):
- Teléfono directo del consultorio:
- Teléfono celular / WhatsApp exclusivo para citas:
- Correo electrónico de contacto para pacientes:
- Horarios de atención habituales (Lunes a Viernes, Sábados, Domingos):
- Dominio web personalizado preferido (ej. drjuanperez.ec / drmedico.com):

3. CATÁLOGO DE SERVICIOS Y PROCEDIMIENTOS
--------------------------------------------------
Por favor liste entre 3 y 8 de sus principales servicios médicos o quirúrgicos:

[Servicio 1]
- Título del servicio:
- Descripción detallada del procedimiento y beneficios:
- Precio estimado o rango tarifario ($ USD):
- Tiempo de duración de la consulta / procedimiento:
- Tiempo estimado de recuperación:

[Servicio 2]
- Título del servicio:
- Descripción detallada:
- Precio estimado ($ USD):
- Tiempo de duración:
- Tiempo de recuperación:

(Puede agregar más servicios si lo requiere)

4. GUÍAS, EBOOKS Y MATERIAL EDUCATIVO PARA PACIENTES (NUEVO)
--------------------------------------------------
Si cuenta con materiales informativos o desea ofrecer descargas gratuitas a sus pacientes (Lead Magnets):
- Título de Guías / Ebooks / Fichas de cuidados (ej. "Cuidados Postoperatorios", "Guía Nutricional"):
- Formato sugerido (Ebook PDF, Ficha Imprimible, Checklist):
- Método de entrega deseado (Descarga Directa, Envío automático por WhatsApp o Email):

5. REDES SOCIALES Y CONTENIDO DIGITAL
--------------------------------------------------
- Enlace o usuario de Instagram:
- Enlace o usuario de Facebook:
- Perfil de TikTok:
- Canal de YouTube / Perfil de LinkedIn:
- Enlaces de Reels o Videos educativos (Instagram Reels, TikToks, Shorts):
- Enlace a perfil de Doctoralia, TopDoctors o Ficha de Google Maps (si dispone):

6. ASEGURADORAS, HOSPITALES Y SOCIEDADES
--------------------------------------------------
- Aseguradoras médicas asociadas por reembolso (ej. Saludsa, Humana, Ecuasanitas, Confiamed, BMI, etc.):
- Hospitales o sanatorios de tercer nivel donde realiza procedimientos:
- Asociaciones, colegios médicos o certificaciones nacionales/internacionales:

7. VALORES DE CONSULTA Y FORMAS DE PAGO
--------------------------------------------------
- Precio estimado de consulta médica (Presencial / Telemedicina):
- Métodos de pago aceptados en consultorio (Efectivo, Transferencia Banco Pichincha / Guayaquil / Produbanco, Tarjeta de Crédito, DeUna, Factura electrónica SRI):

8. ARCHIVOS ADJUNTOS REQUERIDOS
--------------------------------------------------
Por favor adjunte a este correo:
1. Fotografía profesional en alta resolución (formato portrait 1:1 o vertical).
2. Logotipo con fondo transparente (PNG o vectorial).
3. Fotografías de las instalaciones de su consultorio, sala de recepción o equipos.
4. Portada de Guías / Ebooks (si dispone de imágenes específicas).
5. Fotos de Casos Clínicos / Evolución Antes y Después (si aplica a su especialidad médica/estética/dental).

Quedamos atentos a sus respuestas para proceder con el montaje de su sitio web.

Atentamente,
Su Equipo de Desarrollo Web y Marketing Médico`;

  // 3. Documento estructurado Markdown / Texto Plano
  const documentTemplate = `# FORMULARIO DE TOMA DE DATOS CLIENTE MÉDICO
  
Utilice este formulario para recopilar los datos requeridos para la creación automatizada de la Landing Page Médica.

## SECCIÓN 1: DATOS PERSONALES Y REGISTRO PROFESIONAL
- Nombre Médico: 
- Especialidad: 
- Reg. MSP / SENESCYT: 
- Universidad: 
- Años Exp.: 
- Biografía Curta / Filosofía: 

## SECCIÓN 2: UBICACIÓN Y CONTACTO LOCAL
- Nombre Clínica / Consultorio: 
- Dirección Física: 
- Ciudad / Provincia: 
- Teléfono Fijo: 
- WhatsApp Citas: 
- Email: 
- Horario Semana: 
- Horario Sábado: 
- Dominio Web Deseado: 

## SECCIÓN 3: SERVICIOS Y TRATAMIENTOS
- Servicio 1 (Título, Descripción, Precio, Duración, Recuperación)
- Servicio 2 (Título, Descripción, Precio, Duración, Recuperación)
- Servicio 3 (Título, Descripción, Precio, Duración, Recuperación)
- Servicio 4 (Título, Descripción, Precio, Duración, Recuperación)
- Servicio 5 (Título, Descripción, Precio, Duración, Recuperación)

## SECCIÓN 4: GUÍAS Y RECURSOS EDUCATIVOS PARA PACIENTES
- Guía / Ebook 1 (Título, Formato PDF/Ebook, Método de Entrega: Descarga Directa / WhatsApp / Email)
- Guía / Ebook 2 (Título, Formato PDF/Ebook, Método de Entrega)

## SECCIÓN 5: REDES SOCIALES & DIGITAL
- Instagram: 
- Facebook: 
- TikTok: 
- YouTube / LinkedIn: 
- Enlaces de Reels / Videos Destacados: 
- Ficha Google Maps / Agendamiento previo: 

## SECCIÓN 6: ASEGURADORAS Y HOSPITALES
- Aseguradoras Privadas por Reembolso: 
- Hospitales donde opera: 
- Certificaciones y Colegios Médicos: 

## SECCIÓN 7: VALOR DE CONSULTA Y MÉTODOS DE PAGO
- Valor Consulta Presencial / Online: 
- Formas de Pago Aceptadas (Efectivo, Pichincha, Guayaquil, Deuna, Tarjeta, SRI): 

## SECCIÓN 8: ARCHIVOS MULTIMEDIA REQUERIDOS
- Foto Profesional (Portrait)
- Logotipo del Consultorio (PNG Transparente)
- Fotos de Instalaciones / Consultorio (3-8 imágenes)
- Imagen de Portada de Ebooks/Guías (Opcional)
- Fotos de Casos Clínicos (Antes / Después)
`;

  const getCurrentText = () => {
    if (activeFormat === "whatsapp") return whatsappTemplate;
    if (activeFormat === "email") return emailTemplate;
    return documentTemplate;
  };

  const handleCopy = () => {
    const text = getCurrentText();
    navigator.clipboard.writeText(text);
    setCopiedFormat(activeFormat);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownload = () => {
    const text = getCurrentText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Formulario_Toma_Datos_Medico_${activeFormat.toUpperCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Formulario de Toma de Datos para Clientes Médicos</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; line-height: 1.6; color: #1e293b; }
            h1 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 16px; }
            pre { font-family: inherit; white-space: pre-wrap; word-wrap: break-word; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; }
            .footer { margin-top: 30px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Formulario de Toma de Datos para Landing Page Médica</h1>
          <p>Envíe este documento a su cliente médico para recopilar su información estructurada. Una vez completado, copie y pegue el texto en la herramienta "Organizar con IA" del sistema.</p>
          <pre>${getCurrentText()}</pre>
          <div class="footer">Medico.ec - Creador de Consultorio Digital 3.0</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* CABECERA DEL MODAL */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-start justify-between gap-4 shrink-0 border-b border-slate-700">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30 shrink-0">
                <ClipboardList className="w-5 h-5 text-blue-300" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                Formulario de Toma de Datos para Clientes Médicos
              </h2>
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Captura Rápida
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Descarga o copia este formulario listo para enviar a tus médicos clientes por WhatsApp o Email. Una vez que te devuelvan el texto respondido, solo pégalo en la herramienta <strong className="text-blue-300">"Organizar con IA"</strong> para generar su Landing Page automáticamente en segundos.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR DE FORMATO */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveFormat("whatsapp")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFormat === "whatsapp"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-300/60"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Plantilla WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveFormat("email")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFormat === "email"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-300/60"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Plantilla Correo / Word</span>
            </button>

            <button
              onClick={() => setActiveFormat("document")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFormat === "document"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-300/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Estructura Texto Plano</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
              title="Copiar plantilla al portapapeles"
            >
              {copiedFormat === activeFormat ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
              title="Descargar archivo de texto .txt"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Descargar .TXT</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-all cursor-pointer hidden md:flex items-center justify-center"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-100/50">
          
          {/* BANNER DE PASO A PASO */}
          <div className="p-3.5 bg-blue-50/90 border border-blue-200/90 rounded-2xl flex items-start gap-3">
            <span className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div className="space-y-1 text-xs">
              <p className="font-extrabold text-blue-950">
                Flujo de Trabajo Ultrarrápido para Agencias y Desarrolladores:
              </p>
              <ol className="list-decimal list-inside text-blue-900/90 space-y-0.5 text-[11px] leading-relaxed">
                <li>Haz clic en <strong>"Copiar Texto"</strong> o <strong>"Descargar .TXT"</strong> y envíaselo a tu cliente médico.</li>
                <li>Cuando el médico te devuelva el mensaje con sus respuestas, copia todo el texto.</li>
                <li>Abre el botón <strong>"Organizar con IA"</strong> en este panel, pega el texto respondido y presiona <strong>"Autocompletar Landing Page"</strong>.</li>
              </ol>
            </div>
          </div>

          {/* VISTA PREVIA DEL TEXTO A ENVIAR */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-950 text-slate-100">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Vista previa del formato ({activeFormat.toUpperCase()})
              </span>
              <span className="text-[10px] bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300">
                Listo para enviar
              </span>
            </div>

            <pre className="p-4 sm:p-5 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap max-h-[380px] overflow-y-auto selection:bg-blue-600 selection:text-white">
              {getCurrentText()}
            </pre>
          </div>
        </div>

        {/* PIE DEL MODAL CON ACCIÓN DIRECTA A IA */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            💡 Consejo: Si el médico te envía un PDF o documento Word, también puedes subirlo directamente en la Ingesta de IA.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenAiIngestion && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiIngestion();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tengo las respuestas → Ir a Ingesta con IA</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
