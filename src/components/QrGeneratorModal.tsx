/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { MedicalLandingData } from "../types";
import { 
  QrCode, 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Globe, 
  MessageSquare, 
  MapPin, 
  Sparkles,
  Smartphone,
  ShieldCheck,
  UserCheck
} from "lucide-react";

interface QrGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MedicalLandingData;
}

export const QrGeneratorModal: React.FC<QrGeneratorModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen) return null;

  // URL Base por defecto del entorno o dominio personalizado
  const currentAppUrl = typeof window !== "undefined" ? window.location.href.split('#')[0] : "https://mi-consultorio-medico.ec";
  const customDomain = data.dominioWeb && data.dominioWeb !== "https://tu-dominio.com" ? data.dominioWeb : "";

  // Tipos de QR seleccionables
  const [selectedType, setSelectedType] = useState<"landing" | "whatsapp" | "maps" | "custom">("landing");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [qrFgColor, setQrFgColor] = useState<string>("#0284c7"); // Azul clínico por defecto
  const [includeMargin, setIncludeMargin] = useState<boolean>(true);

  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // Determinar la URL final según la opción seleccionada
  const getTargetUrl = (): string => {
    switch (selectedType) {
      case "landing":
        return customDomain || currentAppUrl;
      case "whatsapp":
        return data.whatsappUrl || "https://wa.me/593991234567";
      case "maps":
        if (data.googleMapsReviewsUrl) return data.googleMapsReviewsUrl;
        return `https://maps.google.com/maps?q=${data.latitud || "-0.1807"},${data.longitud || "-78.4678"}`;
      case "custom":
        return customUrl || customDomain || currentAppUrl;
      default:
        return currentAppUrl;
    }
  };

  const targetUrl = getTargetUrl();

  // Descargar imagen PNG en alta resolución
  const handleDownloadPng = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const doctorSlug = (data.nombreMedico || "doctor")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-");

    link.download = `codigo-qr-${selectedType}-${doctorSlug}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copiar URL al portapapeles
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar enlace:", err);
    }
  };

  // Compartir en móviles / Web Share API
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Consulta Médica - Dr(a). ${data.nombreMedico}`,
          text: `Agenda tu cita médica con el Dr(a). ${data.nombreMedico} (${data.especialidad}):`,
          url: targetUrl,
        });
      } catch (err) {
        console.error("Error compartiendo:", err);
      }
    } else {
      handleCopyUrl();
    }
  };

  // Imprimir Ficha de Consultorio para Mostrar en Recepción / Mostrador
  const handlePrintStand = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const qrDataUrl = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const doctorName = data.nombreMedico || "Dr. Especialista";
    const specialty = data.especialidad || "Consulta Médica Especializada";
    const clinic = data.nombreClinicaGBP || "Consultorio Médico";
    const city = data.ciudad || "Ecuador";
    const address = data.direccionFisica || "Dirección de Consultorio";
    const phone = data.telefonoGBP || data.whatsappUrl || "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ficha de Agendamiento QR - ${doctorName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background: #f8fafc;
            color: #0f172a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .stand-card {
            background: #ffffff;
            width: 100%;
            max-width: 500px;
            border-radius: 32px;
            border: 2px solid #e2e8f0;
            padding: 48px 40px;
            text-align: center;
            box-shadow: 0 20px 40px -15px rgba(0,0,0,0.08);
          }
          .badge {
            display: inline-block;
            background: #eff6ff;
            color: #1d4ed8;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 6px 16px;
            border-radius: 999px;
            margin-bottom: 20px;
            border: 1px solid #dbeafe;
          }
          .doctor-name {
            font-size: 26px;
            font-weight: 900;
            margin: 0 0 6px 0;
            color: #0f172a;
          }
          .specialty {
            font-size: 15px;
            font-weight: 700;
            color: #0284c7;
            margin: 0 0 24px 0;
          }
          .qr-wrapper {
            background: #ffffff;
            border: 3px solid #f1f5f9;
            border-radius: 24px;
            padding: 24px;
            display: inline-block;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
          }
          .qr-wrapper img {
            width: 220px;
            height: 220px;
            display: block;
          }
          .instruction {
            font-size: 16px;
            font-weight: 800;
            color: #1e293b;
            margin: 0 0 8px 0;
          }
          .subinstruction {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 24px 0;
            line-height: 1.5;
          }
          .footer-info {
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
          }
          .footer-info strong {
            color: #0f172a;
          }
          @media print {
            body { background: #ffffff; padding: 0; }
            .stand-card { border: none; box-shadow: none; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="stand-card">
          <div class="badge">Escanear para Cita Médica</div>
          <h1 class="doctor-name">${doctorName}</h1>
          <p class="specialty">${specialty}</p>

          <div class="qr-wrapper">
            <img src="${qrDataUrl}" alt="Código QR de Cita Médica" />
          </div>

          <p class="instruction">📱 Apunta la cámara de tu teléfono</p>
          <p class="subinstruction">Para agendar tu consulta, revisar horarios de atención o enviar un mensaje directo por WhatsApp.</p>

          <div class="footer-info">
            <p><strong>${clinic}</strong> • ${city}</p>
            <p>${address}</p>
            ${phone ? `<p style="margin-top:4px; font-weight:700; color:#0284c7;">${phone}</p>` : ''}
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const COLOR_PALETTE = [
    { name: "Azul Clínico", value: "#0284c7" },
    { name: "Verde Esmeralda", value: "#059669" },
    { name: "Índigo Elegante", value: "#4f46e5" },
    { name: "Oscuro Sobrio", value: "#0f172a" },
    { name: "Vino Médico", value: "#9f1239" },
    { name: "Teal Sanidad", value: "#0d9488" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* CABECERA DE MODAL */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2 text-white">
                Generador de Código QR
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  Alta Resolución
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Apunta tus pacientes a tu sitio web, WhatsApp o ubicación exacta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO CON SCROLL */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* SELECCIÓN DE TIPO DE ENLACE */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              Selecciona el Destino del Código QR:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType("landing")}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  selectedType === "landing"
                    ? "bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 font-bold"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Globe className="w-4 h-4 text-blue-600" />
                  {selectedType === "landing" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-xs font-extrabold">Web Principal</span>
                <span className="text-[10px] text-slate-500 line-clamp-1">Landing Page Oficial</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("whatsapp")}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  selectedType === "whatsapp"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 font-bold"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  {selectedType === "whatsapp" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-xs font-extrabold">WhatsApp Citas</span>
                <span className="text-[10px] text-slate-500 line-clamp-1">Agendamiento Directo</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("maps")}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  selectedType === "maps"
                    ? "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 font-bold"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  {selectedType === "maps" && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <span className="text-xs font-extrabold">Ubicación Maps</span>
                <span className="text-[10px] text-slate-500 line-clamp-1">Google Business</span>
              </button>
            </div>
          </div>

          {/* CAMPO DE URL PERSONALIZADA SI APLICA */}
          {selectedType === "custom" && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="custom-qr-url">
                Introduce la URL o enlace personalizado:
              </label>
              <input
                id="custom-qr-url"
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://tu-dominio.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          )}

          {/* ÁREA DE VISUALIZACIÓN DEL QR + PERSONALIZACIÓN DE COLOR */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
            
            {/* CANVAS QR */}
            <div className="sm:col-span-6 flex flex-col items-center justify-center space-y-2">
              <div 
                ref={qrCanvasRef}
                className="bg-white p-4 rounded-2xl border-2 border-slate-200/90 shadow-md flex items-center justify-center"
              >
                <QRCodeCanvas
                  value={targetUrl}
                  size={180}
                  fgColor={qrFgColor}
                  bgColor="#FFFFFF"
                  level="H" // Alta corrección de errores
                  includeMargin={includeMargin}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Código QR Optimizado Escaneo Móvil
              </span>
            </div>

            {/* OPCIONES DE ESTILO */}
            <div className="sm:col-span-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-2">
                  Color del Código QR:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setQrFgColor(c.value)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer border ${
                        qrFgColor === c.value ? "scale-110 ring-2 ring-blue-500 ring-offset-2 border-slate-400" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* ENLACE DESTINO MOSTRADO */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Destino de escaneo:</span>
                <p className="font-mono text-[11px] text-blue-700 break-all line-clamp-2 leading-snug">
                  {targetUrl}
                </p>
              </div>

              {/* TOGGLE DE MARGEN */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMargin}
                  onChange={(e) => setIncludeMargin(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Incluir margen blanco de seguridad</span>
              </label>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN RÁPIDA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Descargar Imagen PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrintStand}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir Ficha de Recepción</span>
            </button>
          </div>

          {/* ACCIONES SECUNDARIAS: COPIAR Y COMPARTIR */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copiar Enlace Directo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Compartir</span>
            </button>
          </div>

        </div>

        {/* PIE DE MODAL */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            E-E-A-T & Paciente Digital • Medico.ec
          </span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
