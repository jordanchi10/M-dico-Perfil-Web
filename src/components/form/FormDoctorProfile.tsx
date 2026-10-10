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
  Maximize2,
  Building2
} from "lucide-react";
import { compressAndConvertToWebP, formatBytes, CompressResult } from "../../utils/imageCompressor";
import { formatSocialUrl } from "../../utils/generators";

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
  const isClinica = data.tipoEnfoqueLanding === "clinica";

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
            Información del especialista médico o clínica, imágenes corporativas, WhatsApp y redes sociales.
          </p>
        </div>
      </div>

      {/* 0. ENFOQUE Y MODELO DE PRESENTACIÓN DE LA LANDING */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md border border-slate-700/80 space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Enfoque & Modelo de Presentación de la Landing Page
          </label>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            {isClinica ? "🏥 Centro / Empresa" : "👨‍⚕️ Médico / Profesional"}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Selecciona cómo se adaptarán los textos principales de la web. Si tu servicio es para una <strong>Clínica o Centro Médico</strong>, la landing cambiará automáticamente las frases de primera persona (<em>"Doctor / Especialista"</em>) a formato institucional (<em>"Nosotros / Centro Médico"</em>).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Opción 1: Médico / Especialista */}
          <button
            type="button"
            onClick={() => updateField("tipoEnfoqueLanding", "medico")}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer ${
              !isClinica
                ? "bg-blue-600/90 border-blue-400 text-white shadow-md ring-2 ring-blue-400/50"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-lg ${
              !isClinica ? "bg-white text-blue-700 shadow-sm" : "bg-slate-700 text-slate-300"
            }`}>
              👨‍⚕️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide">Especialista / Doctor</span>
                {!isClinica && <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-extrabold">Activo</span>}
              </div>
              <p className={`text-[11px] leading-tight mt-1 ${!isClinica ? "text-blue-100" : "text-slate-400"}`}>
                Marca personal para un médico, especialista o profesional independiente.
              </p>
            </div>
          </button>

          {/* Opción 2: Centro Médico / Clínica */}
          <button
            type="button"
            onClick={() => updateField("tipoEnfoqueLanding", "clinica")}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer ${
              isClinica
                ? "bg-emerald-600/90 border-emerald-400 text-white shadow-md ring-2 ring-emerald-400/50"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-lg ${
              isClinica ? "bg-white text-emerald-700 shadow-sm" : "bg-slate-700 text-slate-300"
            }`}>
              🏥
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide">Centro Médico / Clínica</span>
                {isClinica && <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-extrabold">Activo</span>}
              </div>
              <p className={`text-[11px] leading-tight mt-1 ${isClinica ? "text-emerald-100" : "text-slate-400"}`}>
                Presentación institucional "Nosotros" para clínicas, centros de salud o empresas.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 1. INFORMACIÓN CLÍNICA BÁSICA */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          {isClinica ? "Datos del Centro Médico / Clínica" : "Datos del Especialista"}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="nombreMedico">
              {isClinica ? "Nombre de la Clínica / Centro" : "Nombre Completo con Título"}
            </label>
            <input
              id="nombreMedico"
              type="text"
              value={data.nombreMedico ?? ""}
              onChange={(e) => updateField("nombreMedico", e.target.value)}
              placeholder={isClinica ? "ej. Clínica Santa Ana / Centro de Especialidades" : "ej. Dr. Alejandro Ruiz"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="especialidad">
              {isClinica ? "Especialidades / Enfoque Institucional" : "Especialidad Médica"}
            </label>
            <input
              id="especialidad"
              type="text"
              value={data.especialidad ?? ""}
              onChange={(e) => updateField("especialidad", e.target.value)}
              placeholder={isClinica ? "ej. Centro de Especialidades Médicas & Diagnóstico" : "ej. Cardiólogo Pediatra"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Registros Sanitarios & Acreditación Médica (SENESCYT & MSP / ACESS Ecuador) */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                🛡️
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  Sello de Acreditación Médica & E-E-A-T (Ecuador)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Registros oficiales requeridos por Google para posicionamiento prioritario YMYL / Salud.
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all">
              <input
                type="checkbox"
                checked={data.mostrarRegistroPublico ?? false}
                onChange={(e) => updateField("mostrarRegistroPublico", e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded-md focus:ring-blue-500"
              />
              <span>{data.mostrarRegistroPublico ? "👁️ Visible en Diseño Público" : "🔒 Oculto en Diseño (Solo Indexable SEO)"}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase" htmlFor="registroSenescyt">
                1. Registro SENESCYT
              </label>
              <input
                id="registroSenescyt"
                type="text"
                value={data.registroSenescyt ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField("registroSenescyt", val);
                  // Sync cedulaProfesional combined string
                  const combined = [
                    data.codigoAcessMsp ? `MSP Reg. ${data.codigoAcessMsp}` : '',
                    val ? `SENESCYT ${val}` : ''
                  ].filter(Boolean).join(" / ");
                  if (combined) updateField("cedulaProfesional", combined);
                }}
                placeholder="ej. 1005-2015-884920"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-slate-800 bg-white"
              />
              <span className="text-[10px] text-slate-500">Número de Título Profesional SENESCYT</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase" htmlFor="codigoAcessMsp">
                2. Código MSP / ACESS
              </label>
              <input
                id="codigoAcessMsp"
                type="text"
                value={data.codigoAcessMsp ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField("codigoAcessMsp", val);
                  // Sync cedulaProfesional combined string
                  const combined = [
                    val ? `MSP Reg. ${val}` : '',
                    data.registroSenescyt ? `SENESCYT ${data.registroSenescyt}` : ''
                  ].filter(Boolean).join(" / ");
                  if (combined) updateField("cedulaProfesional", combined);
                }}
                placeholder="ej. 171829401-2"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-slate-800 bg-white"
              />
              <span className="text-[10px] text-slate-500">Habilitación Sanitaria MSP Ecuador</span>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase" htmlFor="cedulaProfesional">
                3. Registro Combinado / Cédula
              </label>
              <input
                id="cedulaProfesional"
                type="text"
                value={data.cedulaProfesional ?? ""}
                onChange={(e) => updateField("cedulaProfesional", e.target.value)}
                placeholder="ej. MSP Reg. 171829401-2 / SENESCYT 1005-2015-884920"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-slate-800 bg-white"
              />
              <span className="text-[10px] text-slate-500">Texto completo inyectado en Schema.org</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900 leading-relaxed">
            <span className="shrink-0 text-xs">🔒</span>
            <div>
              <strong>Protección de Privacidad & Garantía SEO:</strong> Esta información se inyecta de forma limpia e invisible en el código fuente estructurado (Schema.org JSON-LD <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[10px]">EducationalOccupationalCredential</code>) para certificar la legitimidad médica ante los algoritmos YMYL de Google sin exponer datos confidenciales a simple vista a los visitantes.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="anosExperiencia">
              {isClinica ? "Trayectoria (Años)" : "Años de Experiencia"}
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
              {isClinica ? "Convenios & Avales" : "Universidad de Graduación"}
            </label>
            <input
              id="universidad"
              type="text"
              value={data.universidad ?? ""}
              onChange={(e) => updateField("universidad", e.target.value)}
              placeholder={isClinica ? "ej. Avalado por MSP y Red de Salud" : "ej. Universidad San Francisco de Quito (USFQ)"}
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

        {/* FAVICON Y LOGOTIPO DE APLICACIÓN PWA (INDEPENDIENTE DEL LOGO PRINCIPAL) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Favicon de Navegador & Logotipo de Aplicación PWA
              </h4>
              <p className="text-[11px] text-slate-500">
                Logotipo modificado o isotipo cuadrado (1:1) independiente del menú principal. Se usa en la pestaña del navegador y al instalar tu app en el celular.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
              Acceso Directo PWA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Formulario de Entrada e Icono Adaptado */}
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="pwaIconUrl" className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                  <span>Ícono Cuadrado para App & Favicon</span>
                  <span className="text-[10px] text-indigo-600 font-normal">Formato 1:1 recomendado</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="pwaIconUrl"
                    type="text"
                    value={data.pwaIconUrl || data.faviconUrl || ""}
                    onChange={(e) => {
                      updateField("pwaIconUrl", e.target.value);
                      updateField("faviconUrl", e.target.value);
                    }}
                    placeholder="Pega URL o sube un logotipo modificado cuadrado..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  
                  {/* Botón Subir Archivo Icono */}
                  <label className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Ícono</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await compressAndConvertToWebP(file, {
                              maxWidth: 512,
                              maxHeight: 512,
                              squareCrop: true,
                              quality: 0.9
                            });
                            updateField("pwaIconUrl", res.dataUrl);
                            updateField("faviconUrl", res.dataUrl);
                          } catch (err) {
                            console.error("Error compressing icon:", err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Título de la Aplicación en la pantalla de inicio */}
              <div className="flex flex-col gap-1">
                <label htmlFor="pwaAppTitle" className="text-xs font-bold text-slate-700 uppercase">
                  Nombre Corto de la App en Pantalla de Inicio
                </label>
                <input
                  id="pwaAppTitle"
                  type="text"
                  value={data.pwaAppTitle || ""}
                  onChange={(e) => updateField("pwaAppTitle", e.target.value)}
                  placeholder={`ej. ${data.nombreMedico || "Dr. Ruiz"}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Botones de Selección Rápida */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Copiado Rápido de Recursos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (data.logoUrl) {
                        updateField("pwaIconUrl", data.logoUrl);
                        updateField("faviconUrl", data.logoUrl);
                      }
                    }}
                    disabled={!data.logoUrl}
                    className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <span>🏥 Usar Logotipo Principal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (data.fotoUrl) {
                        updateField("pwaIconUrl", data.fotoUrl);
                        updateField("faviconUrl", data.fotoUrl);
                      }
                    }}
                    disabled={!data.fotoUrl}
                    className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <span>📷 Usar Foto de Perfil</span>
                  </button>
                </div>
              </div>

              {/* Presets de Emojis Médicos */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">Presets Médicos en Vector SVG:</span>
                <div className="flex flex-wrap gap-1">
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
                        updateField("pwaIconUrl", svgDataUrl);
                        updateField("faviconUrl", svgDataUrl);
                      }}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer flex items-center gap-1"
                      title={`Usar ${item.label}`}
                    >
                      <span>{item.emoji}</span>
                      <span className="text-[9px] text-slate-400">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Muestras de Previsualización Real */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-3 flex flex-col justify-between border border-slate-800">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 block border-b border-slate-800 pb-1.5">
                Previsualización del Ícono en Dispositivos:
              </span>

              {/* Muestra 1: Pestaña del Navegador */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">1. Pestaña en Navegador Web (Chrome / Safari):</span>
                <div className="bg-slate-800 p-2 rounded-t-lg border-t border-x border-slate-700 flex items-center gap-2 max-w-[240px]">
                  <div className="w-4 h-4 rounded bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {data.pwaIconUrl || data.faviconUrl ? (
                      <img src={data.pwaIconUrl || data.faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px]">🩺</span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 truncate">
                    {data.metaTitulo || data.nombreMedico || "Consulta Médica"}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto cursor-pointer">✕</span>
                </div>
              </div>

              {/* Muestra 2: Pantalla de Inicio de Smartphone (PWA App Icon) */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">2. Ícono Instalado en Pantalla de Inicio del Celular:</span>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-0.5 shadow-md shrink-0 flex items-center justify-center relative overflow-hidden">
                    {data.pwaIconUrl || data.faviconUrl ? (
                      <img src={data.pwaIconUrl || data.faviconUrl} alt="PWA Icon" className="w-full h-full object-cover rounded-[14px]" />
                    ) : data.logoUrl ? (
                      <img src={data.logoUrl} alt="PWA Icon" className="w-full h-full object-contain p-1 rounded-[14px] bg-white" />
                    ) : (
                      <span className="text-xl">🩺</span>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold text-white truncate">
                      {data.pwaAppTitle || data.nombreMedico || "App Médica"}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Aplicación Instalada</span>
                  </div>
                </div>
              </div>
            </div>
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
              { tag: "{{servicio}}", label: "Servicio / Tratamiento" },
              { tag: "{{modalidad}}", label: "Modalidad" },
              { tag: "{{precio}}", label: "Tarifa / Precio" },
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
                  const current = data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una valoración médica para {{servicio}} en modalidad {{modalidad}} el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.";
                  updateField("whatsappMensajePlantilla", `${current} ${item.tag}`);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 shadow-2xs transition-all cursor-pointer"
              >
                <span className="font-mono text-emerald-600">{item.tag}</span>
                <span className="text-[9px] text-slate-500 font-normal">({item.label})</span>
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
                    "Hola Dr(a). {{medico}}, deseo agendar una valoración médica para {{servicio}} en modalidad {{modalidad}} el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad."
                  );
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Restablecer Plantilla
              </button>
            </div>
            <textarea
              id="whatsappMensajePlantilla"
              rows={2}
              value={data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una valoración médica para {{servicio}} en modalidad {{modalidad}} el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad."}
              onChange={(e) => updateField("whatsappMensajePlantilla", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none bg-white"
            />
          </div>

          {/* Micro preview de WhatsApp */}
          <div className="p-3 rounded-xl bg-[#e5ddd5] dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 space-y-1">
            <span className="text-[9px] font-extrabold uppercase text-slate-600 dark:text-slate-400 block">
              Vista previa para el paciente al hacer clic en un servicio:
            </span>
            {(() => {
              const template = data.whatsappMensajePlantilla ?? "Hola Dr(a). {{medico}}, deseo agendar una valoración médica para {{servicio}} en modalidad {{modalidad}} el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.";
              const sampleService = data.servicios?.[0]?.titulo || "Consulta Médica de Especialidad";
              const evaluated = template
                .replace(/\{\{medico\}\}/gi, data.nombreMedico || "Dr. Especialista")
                .replace(/\{\{servicio\}\}/gi, sampleService)
                .replace(/\{\{tratamiento\}\}/gi, sampleService)
                .replace(/\{\{modalidad\}\}/gi, "Presencial (Consultorio)")
                .replace(/\{\{precio\}\}/gi, data.precioConsulta || "$50 USD")
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
              onBlur={(e) => {
                const formatted = formatSocialUrl("instagram", e.target.value);
                if (formatted && formatted !== e.target.value) {
                  updateField("instagramUrl", formatted);
                }
              }}
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
              onBlur={(e) => {
                const formatted = formatSocialUrl("facebook", e.target.value);
                if (formatted && formatted !== e.target.value) {
                  updateField("facebookUrl", formatted);
                }
              }}
              placeholder="https://facebook.com/drmedicoecuador"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
