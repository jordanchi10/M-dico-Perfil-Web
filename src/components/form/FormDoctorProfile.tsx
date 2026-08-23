/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalLandingData } from "../../types";
import { 
  User, 
  Stethoscope, 
  GraduationCap, 
  Award, 
  Upload, 
  Share2, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  RotateCcw, 
  Send, 
  Globe, 
  Mail,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Zap,
  Loader2,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2
} from "lucide-react";
import { compressAndConvertToWebP, formatBytes, CompressResult } from "../../utils/imageCompressor";

interface FormDoctorProfileProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData | ((prev: MedicalLandingData) => MedicalLandingData)) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
  updateFields?: (fields: Partial<MedicalLandingData>) => void;
}

export function FormDoctorProfile({
  data,
  onChange,
  updateField,
  updateFields
}: FormDoctorProfileProps) {
  const applyFields = (fields: Partial<MedicalLandingData>) => {
    if (updateFields) {
      updateFields(fields);
    } else {
      onChange((prev) => ({
        ...prev,
        ...fields
      }));
    }
  };

  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const [logoStats, setLogoStats] = useState<CompressResult | null>(null);

  const handleLogoUpload = async (file: File) => {
    try {
      setIsCompressingLogo(true);
      const result = await compressAndConvertToWebP(file, {
        maxWidth: 600,
        maxHeight: 300,
        quality: 0.85
      });
      updateField("logoUrl", result.dataUrl);
      setLogoStats(result);
    } catch (err) {
      console.error("Error comprimiendo logo:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateField("logoUrl", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingLogo(false);
    }
  };
  return (
    <div id="form-doctor-profile-section" className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Perfil Profesional & Canales de Contacto
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Información del especialista médico, imágenes corporativas, WhatsApp y redes sociales.
          </p>
        </div>
      </div>

      {/* 1. INFORMACIÓN CLÍNICA BÁSICA */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          Datos del Especialista
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="nombreMedico">
              Nombre Completo con Título
            </label>
            <input
              id="nombreMedico"
              type="text"
              value={data.nombreMedico ?? ""}
              onChange={(e) => updateField("nombreMedico", e.target.value)}
              placeholder="ej. Dr. Alejandro Ruiz"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="especialidad">
              Especialidad Médica
            </label>
            <input
              id="especialidad"
              type="text"
              value={data.especialidad ?? ""}
              onChange={(e) => updateField("especialidad", e.target.value)}
              placeholder="ej. Cardiólogo Pediatra"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="cedulaProfesional">
              Registro SENESCYT / MSP
            </label>
            <input
              id="cedulaProfesional"
              type="text"
              value={data.cedulaProfesional ?? ""}
              onChange={(e) => updateField("cedulaProfesional", e.target.value)}
              placeholder="ej. 1005-2018-984321"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-slate-800"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="anosExperiencia">
              Años de Experiencia
            </label>
            <input
              id="anosExperiencia"
              type="number"
              min="1"
              max="60"
              value={data.anosExperiencia ?? 0}
              onChange={(e) => updateField("anosExperiencia", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="universidad">
              Universidad de Graduación
            </label>
            <input
              id="universidad"
              type="text"
              value={data.universidad ?? ""}
              onChange={(e) => updateField("universidad", e.target.value)}
              placeholder="ej. Universidad San Francisco de Quito (USFQ)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 2. LOGOTIPO & FAVICON PERSONALIZADO */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-indigo-600" />
          Logotipo Oficial & Favicon de Pestaña
        </label>

        {/* LOGO OFICIAL */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="sm:col-span-3 flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 bg-white aspect-video w-full max-w-[140px] mx-auto overflow-hidden relative shadow-2xs">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center text-[10px] text-slate-400 font-bold">Sin Logo (Usa Texto)</div>
            )}
          </div>
          <div className="sm:col-span-9 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Logotipo con Fondo Transparente (PNG/SVG)</span>
              {data.logoUrl && (
                <button
                  type="button"
                  onClick={() => updateField("logoUrl", "")}
                  className="text-[10px] text-rose-600 font-bold hover:underline"
                >
                  Quitar logo
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all">
                {isCompressingLogo ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                )}
                <span>{isCompressingLogo ? "Optimizando..." : "Subir Logo (Auto WebP)"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isCompressingLogo}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                />
              </label>
              <input
                id="logoUrl"
                type="text"
                value={data.logoUrl || ""}
                onChange={(e) => {
                  updateField("logoUrl", e.target.value);
                  setLogoStats(null);
                }}
                placeholder="O pega URL de logo..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* BADGE DE COMPRESIÓN WEBP DEL LOGO */}
            {logoStats && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-900 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Logo optimizado a <strong>{logoStats.format}</strong> ({formatBytes(logoStats.compressedSize)})
                  </span>
                </div>
                <span className="bg-emerald-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md">
                  -{logoStats.savingsPercent}% SEO
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AJUSTE DE TAMAÑO RESPONSIVO DEL LOGOTIPO */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
              Ajuste de Tamaño del Logotipo (Alto en Pixeles)
            </label>
            <button
              type="button"
              onClick={() => {
                applyFields({
                  logoTamanoMobile: 36,
                  logoTamanoTablet: 48,
                  logoTamanoDesktop: 60
                });
              }}
              className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer Tamaños
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Móvil */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  Móvil
                </span>
                <span className="text-xs font-extrabold text-indigo-600 font-mono">
                  {data.logoTamanoMobile || 36}px
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="2"
                value={data.logoTamanoMobile || 36}
                onChange={(e) => updateField("logoTamanoMobile", parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>20px</span>
                <span>120px</span>
              </div>
            </div>

            {/* Tablet */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Tablet className="w-3.5 h-3.5 text-slate-500" />
                  Tablet
                </span>
                <span className="text-xs font-extrabold text-indigo-600 font-mono">
                  {data.logoTamanoTablet || 48}px
                </span>
              </div>
              <input
                type="range"
                min="24"
                max="160"
                step="2"
                value={data.logoTamanoTablet || 48}
                onChange={(e) => updateField("logoTamanoTablet", parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>24px</span>
                <span>160px</span>
              </div>
            </div>

            {/* Desktop */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  Escritorio (PC)
                </span>
                <span className="text-xs font-extrabold text-indigo-600 font-mono">
                  {data.logoTamanoDesktop || 60}px
                </span>
              </div>
              <input
                type="range"
                min="28"
                max="200"
                step="2"
                value={data.logoTamanoDesktop || 60}
                onChange={(e) => updateField("logoTamanoDesktop", parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>28px</span>
                <span>200px</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAVICON PERSONALIZADO */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>🩺</span> Favicon de Navegador / PWA
            </span>
            <span className="text-[10px] text-slate-400">Pestaña de Chrome & Acceso Directo</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="faviconUrl"
              type="text"
              value={data.faviconUrl || ""}
              onChange={(e) => updateField("faviconUrl", e.target.value)}
              placeholder="Pega URL o usa un emoji médico inteligente abajo: 🩺"
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white outline-none focus:border-indigo-500"
            />
            {data.faviconUrl && (
              <button
                type="button"
                onClick={() => updateField("faviconUrl", "")}
                className="text-[10px] text-slate-400 hover:text-rose-600 font-bold px-2"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Selector rápido de emojis médicos */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-bold">Presets recomendados:</span>
            {[
              { emoji: "🩺", label: "Esteto" },
              { emoji: "🏥", label: "Clínica" },
              { emoji: "❤️", label: "Cardio" },
              { emoji: "🦷", label: "Dental" },
              { emoji: "🧠", label: "Cerebro" },
              { emoji: "👶", label: "Pediatra" },
              { emoji: "👁️", label: "Ojo" },
              { emoji: "🩹", label: "Trauma" },
              { emoji: "🥗", label: "Nutri" },
              { emoji: "🤰", label: "Gine" }
            ].map((item) => (
              <button
                key={item.emoji}
                type="button"
                onClick={() => {
                  const svgDataUrl = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>${item.emoji}</text></svg>`;
                  updateField("faviconUrl", svgDataUrl);
                }}
                className={`px-2 py-1 text-xs rounded-lg border transition-all flex items-center gap-1 bg-white hover:bg-slate-50 cursor-pointer ${
                  data.faviconUrl && decodeURIComponent(data.faviconUrl).includes(item.emoji)
                    ? "border-indigo-500 text-indigo-700 bg-indigo-50/40 font-bold"
                    : "border-slate-200 text-slate-600"
                }`}
                title={`Usar ${item.label}`}
              >
                <span>{item.emoji}</span>
                <span className="text-[9px] font-medium text-slate-400">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CANALES DE CONTACTO DIRECTO (TELÉFONO & WHATSAPP) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-emerald-600" />
          Canales de Contacto Directo
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5" htmlFor="telefonoGBP">
              <Phone className="w-3.5 h-3.5 text-slate-500" /> Teléfono Clínico Ecuador (NAP)
            </label>
            <input
              id="telefonoGBP"
              type="text"
              value={data.telefonoGBP ?? ""}
              onChange={(e) => updateField("telefonoGBP", e.target.value)}
              placeholder="ej. +593 99 123 4567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5" htmlFor="whatsappUrl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Enlace / Número WhatsApp (+593)
            </label>
            <input
              id="whatsappUrl"
              type="text"
              value={data.whatsappUrl ?? ""}
              onChange={(e) => updateField("whatsappUrl", e.target.value)}
              placeholder="https://wa.me/593991234567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/20 text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* EDITOR DE PLANTILLA DE MENSAJE DE WHATSAPP CON SIMULADOR */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border border-emerald-200/90 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Mensaje de Bienvenida de WhatsApp
              </h4>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
              Variables Dinámicas
            </span>
          </div>

          {/* Botones de inserción de variables */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { tag: "{{medico}}", label: "Médico" },
              { tag: "{{especialidad}}", label: "Especialidad" },
              { tag: "{{ciudad}}", label: "Ciudad" },
              { tag: "{{clinica}}", label: "Clínica" },
              { tag: "{{fecha}}", label: "Fecha" },
              { tag: "{{hora}}", label: "Hora" },
              { tag: "{{nombre}}", label: "Nombre Paciente" }
            ].map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => {
                  const current = data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.";
                  updateField("whatsappMensajePlantilla", `${current} ${item.tag}`);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 shadow-2xs transition-all cursor-pointer"
              >
                <span className="font-mono text-emerald-600">{item.tag}</span>
              </button>
            ))}
          </div>

          {/* Textarea de plantilla */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="whatsappMensajePlantilla" className="text-[11px] font-bold text-slate-700">
                Texto de Plantilla
              </label>
              <button
                type="button"
                onClick={() => {
                  updateField(
                    "whatsappMensajePlantilla",
                    "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad."
                  );
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Restablecer
              </button>
            </div>
            <textarea
              id="whatsappMensajePlantilla"
              rows={2}
              value={data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad."}
              onChange={(e) => updateField("whatsappMensajePlantilla", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none bg-white"
            />
          </div>

          {/* Micro preview de WhatsApp */}
          <div className="p-3 rounded-xl bg-[#e5ddd5] dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 space-y-1">
            <span className="text-[9px] font-extrabold uppercase text-slate-600 dark:text-slate-400 block">
              Vista previa para el paciente:
            </span>
            {(() => {
              const template = data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.";
              const evaluated = template
                .replace(/\{\{medico\}\}/gi, data.nombreMedico || "Dr. Especialista")
                .replace(/\{\{especialidad\}\}/gi, data.especialidad || "Medicina")
                .replace(/\{\{ciudad\}\}/gi, data.ciudad || "Quito")
                .replace(/\{\{clinica\}\}/gi, data.nombreClinicaGBP || "Consultorio")
                .replace(/\{\{fecha\}\}/gi, "martes, 18 de agosto")
                .replace(/\{\{hora\}\}/gi, "10:30 AM")
                .replace(/\{\{nombre\}\}/gi, " Mi nombre es María Gómez.");

              return (
                <div className="flex justify-end">
                  <div className="max-w-[90%] p-2.5 rounded-xl rounded-tr-xs bg-[#d9fdd3] text-slate-900 text-[11px] leading-relaxed shadow-xs">
                    {evaluated}
                    <div className="text-right text-[9px] text-slate-500 mt-0.5">10:30 AM ✓✓</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* REDES SOCIALES & PERFILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="emailContacto">Correo Electrónico</label>
            <input
              id="emailContacto"
              type="email"
              value={data.emailContacto ?? ""}
              onChange={(e) => updateField("emailContacto", e.target.value)}
              placeholder="contacto@consultoriomedico.ec"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="instagramUrl">Instagram URL</label>
            <input
              id="instagramUrl"
              type="text"
              value={data.instagramUrl ?? ""}
              onChange={(e) => updateField("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/dr.medico.ec"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="facebookUrl">Facebook URL</label>
            <input
              id="facebookUrl"
              type="text"
              value={data.facebookUrl ?? ""}
              onChange={(e) => updateField("facebookUrl", e.target.value)}
              placeholder="https://facebook.com/drmedicoecuador"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
