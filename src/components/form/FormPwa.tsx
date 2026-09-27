import React, { useState } from "react";
import { MedicalLandingData } from "../../types";
import { 
  Smartphone, 
  Palette, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  Info, 
  Download, 
  Layers, 
  Monitor, 
  Sun, 
  Moon, 
  Share2, 
  RotateCcw,
  Plus
} from "lucide-react";
import { getActiveFaviconUrl } from "../../utils/generators";
import { compressAndConvertToWebP } from "../../utils/imageCompressor";

interface FormPwaProps {
  data: MedicalLandingData;
  onChange?: (data: MedicalLandingData) => void;
  updateField: <K extends keyof MedicalLandingData>(field: K, value: MedicalLandingData[K]) => void;
}

export const FormPwa: React.FC<FormPwaProps> = ({ data, updateField }) => {
  const [deviceTab, setDeviceTab] = useState<"homescreen" | "app" | "prompt">("homescreen");
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const activeIcon = getActiveFaviconUrl(data) || data.fotoUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=512&auto=format&fit=crop";
  const shortName = data.pwaShortName || data.pwaAppTitle || (data.nombreMedico || data.especialidad || "App Médica").slice(0, 14);
  const fullTitle = data.pwaAppTitle || `${data.nombreMedico || 'Dr. Especialista'} | ${data.especialidad || 'Consultorio'}`;
  const themeColor = data.pwaThemeColor || data.colorPrimarioHex || "#1e6fd9";
  const statusBarStyle = data.pwaStatusBarStyle || "default";
  const bgColor = data.pwaBackgroundColor || "#ffffff";

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleSyncThemeColorWithPrimary = () => {
    const brandPrimary = data.colorPrimarioHex || "#1e6fd9";
    updateField("pwaThemeColor", brandPrimary);
    triggerNotification("Color de tema PWA sincronizado con la paleta de la marca");
  };

  const generateAutoShortName = () => {
    let name = "";
    if (data.nombreMedico) {
      // E.g. "Dr. Ruiz" or "Lic. Velez"
      const parts = data.nombreMedico.trim().split(" ");
      if (parts.length >= 2) {
        name = `${parts[0]} ${parts[1]}`;
      } else {
        name = parts[0];
      }
    } else if (data.especialidad) {
      name = data.especialidad.slice(0, 14);
    } else {
      name = "Consultorio";
    }
    updateField("pwaShortName", name);
    if (!data.pwaAppTitle) {
      updateField("pwaAppTitle", `${data.nombreMedico || "Consultorio Médico"} - ${data.especialidad || "Atención Médica"}`);
    }
    triggerNotification("Nombre corto PWA generado automáticamente");
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE LA SECCIÓN */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Aplicación Móvil PWA & Experiencia "Add to Home Screen"
            </h3>
            <p className="text-xs text-slate-500">
              Personaliza el icono, color de tema y barra de estado para cuando los pacientes instalen tu sitio web como una App nativa en su celular.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="space-y-6 max-w-full">
        {/* BLOQUE 1: IDENTIFICACIÓN DE LA APP EN PANTALLA DE INICIO */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            Nombres e Identidad de la PWA
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Corto (Icon Label) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800" htmlFor="pwa-short-name">
                  Nombre Corto (Texto bajo el Icono)
                </label>
                <button
                  type="button"
                  onClick={generateAutoShortName}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Sugerir
                </button>
              </div>
              <input
                id="pwa-short-name"
                type="text"
                maxLength={18}
                value={data.pwaShortName ?? ""}
                onChange={(e) => updateField("pwaShortName", e.target.value)}
                placeholder={data.nombreMedico ? `${data.nombreMedico.slice(0, 14)}` : "ej. Dr. Ruiz"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 shadow-2xs"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Recomendado: 8-14 caracteres para evitar puntos suspensivos</span>
                <span className={(data.pwaShortName?.length || 0) > 14 ? "text-amber-600 font-bold" : ""}>
                  {data.pwaShortName?.length || 0} / 14
                </span>
              </div>
            </div>

            {/* Nombre Completo (Splash Screen & Manifest) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800" htmlFor="pwa-full-title">
                Nombre Completo de la Aplicación
              </label>
              <input
                id="pwa-full-title"
                type="text"
                value={data.pwaAppTitle ?? ""}
                onChange={(e) => updateField("pwaAppTitle", e.target.value)}
                placeholder="ej. Dr. Alejandro Ruiz | Cardiología Pediatra"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 shadow-2xs"
              />
              <p className="text-[10px] text-slate-400">
                Se mostrará en el banner emergente de instalación y en la pantalla de bienvenida.
              </p>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: COLORES Y BARRA DE ESTADO MÓVIL */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Palette className="w-4 h-4 text-purple-600" />
            Color de Tema y Barra de Estado Móvil
          </h4>

          {/* VISTA APILADA VERTICALMENTE (STACK) */}
          <div className="space-y-5">
            {/* Color de Tema (Theme Color) */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="pwa-theme-color">
                  Color de Tema Móvil
                  <span className="text-[10px] font-mono font-normal text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">theme-color</span>
                </label>
                <button
                  type="button"
                  onClick={handleSyncThemeColorWithPrimary}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-3xs transition-all hover:bg-blue-50"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sincronizar Marca</span>
                </button>
              </div>

              <div className="flex items-center flex-wrap gap-2.5 pt-1">
                <input
                  id="pwa-theme-color"
                  type="color"
                  value={themeColor}
                  onChange={(e) => updateField("pwaThemeColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white shadow-2xs"
                />
                <input
                  type="text"
                  value={themeColor}
                  onChange={(e) => updateField("pwaThemeColor", e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white outline-none focus:border-blue-500 shadow-2xs"
                />
                
                {/* Muestras rápidas con etiqueta */}
                <div className="flex items-center gap-1.5 pl-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Paleta:</span>
                  {["#1e6fd9", "#0d9488", "#059669", "#7c3aed", "#1e293b", "#ffffff"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateField("pwaThemeColor", c)}
                      className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-pointer shadow-3xs ${
                        themeColor.toLowerCase() === c.toLowerCase() ? "ring-2 ring-blue-500 ring-offset-1 border-blue-600" : "border-slate-300"
                      }`}
                      style={{ backgroundColor: c }}
                      title={`Usar ${c}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Tiñe la barra superior del navegador Chrome y Safari cuando los pacientes visiten la web desde teléfonos Android e iOS.
              </p>
            </div>

            {/* Color de Fondo Splash Screen (UBICADO ABAJO) */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="pwa-bg-color">
                  Color de Fondo Splash Screen
                  <span className="text-[10px] font-mono font-normal text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">background_color</span>
                </label>
              </div>

              <div className="flex items-center flex-wrap gap-2.5 pt-1">
                <input
                  id="pwa-bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => updateField("pwaBackgroundColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white shadow-2xs"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => updateField("pwaBackgroundColor", e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white outline-none focus:border-blue-500 shadow-2xs"
                />
                
                {/* Muestras rápidas con etiqueta */}
                <div className="flex items-center gap-1.5 pl-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Fondo:</span>
                  {["#ffffff", "#f8fafc", "#f0fdf4", "#eff6ff", "#0f172a"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateField("pwaBackgroundColor", c)}
                      className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-pointer shadow-3xs ${
                        bgColor.toLowerCase() === c.toLowerCase() ? "ring-2 ring-blue-500 ring-offset-1 border-blue-600" : "border-slate-300"
                      }`}
                      style={{ backgroundColor: c }}
                      title={`Usar ${c}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Color de fondo para la pantalla de carga de bienvenida cuando el paciente abre la aplicación desde su pantalla de inicio.
              </p>
            </div>
          </div>

          {/* Selector de Estilo de Barra de Estado Móvil */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Estilo de Barra de Estado Móvil (iOS Status Bar Style)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { 
                  id: "default", 
                  title: "Por Defecto (Light)", 
                  desc: "Fondo claro con textos e íconos oscuros (Recomendado)", 
                  icon: Sun,
                  bg: "bg-white border-slate-200 text-slate-900"
                },
                { 
                  id: "black", 
                  title: "Negro Sólido", 
                  desc: "Barra negra fija con textos e íconos blancos", 
                  icon: Moon,
                  bg: "bg-slate-900 border-slate-800 text-white"
                },
                { 
                  id: "black-translucent", 
                  title: "Negro Translúcido", 
                  desc: "Superposición inmersiva sobre el header de la app", 
                  icon: Layers,
                  bg: "bg-gradient-to-r from-slate-900 to-blue-950 border-blue-900 text-white"
                }
              ].map((styleOpt) => (
                <button
                  key={styleOpt.id}
                  type="button"
                  onClick={() => updateField("pwaStatusBarStyle", styleOpt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    statusBarStyle === styleOpt.id
                      ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xs bg-blue-50/40"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <styleOpt.icon className={`w-3.5 h-3.5 ${statusBarStyle === styleOpt.id ? "text-blue-600" : "text-slate-500"}`} />
                      {styleOpt.title}
                    </span>
                    {statusBarStyle === styleOpt.id && (
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {styleOpt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOQUE 3: SIMULADOR INTERACTIVO PWA "ADD TO HOME SCREEN" */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-emerald-600" />
                Simulador Móvil PWA
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Observa cómo se integrará tu sitio web en los dispositivos móviles de los pacientes.
              </p>
            </div>

            {/* Pestañas del simulador */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto gap-1">
              <button
                type="button"
                onClick={() => setDeviceTab("homescreen")}
                className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  deviceTab === "homescreen"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pantalla Inicio</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceTab("app")}
                className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  deviceTab === "app"
                    ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>App Standalone</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceTab("prompt")}
                className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  deviceTab === "prompt"
                    ? "bg-white text-purple-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Banner Instalar</span>
              </button>
            </div>
          </div>

          {/* VISTA 1: HOME SCREEN (ICONO PANTALLA DE INICIO) */}
          {deviceTab === "homescreen" && (
            <div className="max-w-xs mx-auto p-4 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 relative overflow-hidden border-4 border-slate-800">
              {/* Barra de estado simulada */}
              <div className={`flex justify-between items-center text-[10px] px-2 pt-1 font-mono ${
                statusBarStyle === "black-translucent" ? "text-slate-300 opacity-90" : statusBarStyle === "black" ? "text-white" : "text-slate-300"
              }`}>
                <span>9:41</span>
                <div className="w-12 h-3 bg-black rounded-full mx-auto shrink-0" />
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-3.5 h-2 border border-white rounded-xs p-0.5"><div className="w-full h-full bg-white" /></div>
                </div>
              </div>

              {/* Wallpaper simulado */}
              <div className="py-6 px-2 grid grid-cols-4 gap-4 text-center">
                {/* Apps ficticias */}
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-xs">WhatsApp</div>
                  <span className="text-[9px]">WhatsApp</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-xs">Safari</div>
                  <span className="text-[9px]">Safari</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="w-11 h-11 bg-red-500 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-xs">Fotos</div>
                  <span className="text-[9px]">Fotos</span>
                </div>

                {/* TU APP PWA DESTACADA */}
                <div className="flex flex-col items-center gap-1 relative group scale-105">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-lg shadow-blue-500/30 bg-white relative">
                    <img src={activeIcon} alt="PWA Icon" className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-slate-900" />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-tight drop-shadow-md truncate max-w-[64px]">
                    {shortName}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400">
                  Así lucirá el acceso directo en la pantalla del celular del paciente.
                </span>
              </div>
            </div>
          )}

          {/* VISTA 2: APP STANDALONE (MODO APLICACIÓN ABIERTA) */}
          {deviceTab === "app" && (
            <div className="max-w-sm mx-auto rounded-3xl border-4 border-slate-800 bg-slate-100 overflow-hidden shadow-xl space-y-0">
              {/* Barra de estado con el tema configurado */}
              <div 
                className="px-4 py-2 flex items-center justify-between text-xs font-medium transition-colors"
                style={{ 
                  backgroundColor: themeColor,
                  color: statusBarStyle === "default" && themeColor === "#ffffff" ? "#0f172a" : "#ffffff"
                }}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img src={activeIcon} alt="Favicon" className="w-4 h-4 rounded-md object-cover bg-white" />
                  <span className="font-bold text-xs truncate max-w-[180px]">
                    {shortName}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/20 font-mono">PWA App</span>
              </div>

              {/* Pantalla Standalone Simulada */}
              <div className="p-4 bg-white space-y-3 min-h-[160px]">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wide">
                    {data.especialidad || "Consulta Médica"}
                  </span>
                  <h5 className="text-sm font-bold text-slate-900">
                    {data.nombreMedico || "Atención Especializada"}
                  </h5>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {data.filosofia || "Agenda tu cita directamente desde nuestra aplicación oficial."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold text-center">
                    Agendar Cita Directa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 3: PROMPT DE INSTALACIÓN "ADD TO HOME SCREEN" */}
          {deviceTab === "prompt" && (
            <div className="max-w-sm mx-auto p-4 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 shadow-2xs">
                  <img src={activeIcon} alt="PWA Icon" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider block">
                    Aplicación Web Oficial
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 truncate">
                    {fullTitle}
                  </h5>
                  <p className="text-[10px] text-slate-500 truncate">
                    {data.dominioWeb || "https://tu-consultorio.ec"}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-tight">
                Instala esta aplicación en tu teléfono para acceder a tus citas y consultas sin necesidad de abrir el navegador.
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" className="px-3 py-1.5 text-xs text-slate-500 font-bold">
                  Ahora no
                </button>
                <button 
                  type="button" 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5"
                  style={{ backgroundColor: themeColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Instalar App
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICACIÓN FLOTANTE / DE ÉXITO */}
        {notificationMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* BLOQUE 4: CONSEJOS Y RECOMENDACIONES DE INSTALACIÓN */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Beneficios PWA para el Paciente
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
            <li><strong>Acceso Instantáneo</strong>: Los pacientes abren tu consultorio con un solo toque desde su pantalla de inicio.</li>
            <li><strong>Navegación Fluida</strong>: Oculta la barra de direcciones para dar la apariencia de una App descargada de la App Store o Play Store.</li>
            <li><strong>Optimización Móvil</strong>: Se adapta al color primario de tu clínica para dar una experiencia de marca unificada.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
