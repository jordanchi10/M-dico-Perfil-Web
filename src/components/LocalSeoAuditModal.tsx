/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MedicalLandingData, ECUADOR_CITIES, EcuadorCityPreset } from "../types";
import { runLocalSeoAudit, LocalSeoAuditReport } from "../utils/localSeoAuditor";
import { 
  MapPin, 
  Phone, 
  Compass, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Save, 
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";

interface LocalSeoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MedicalLandingData;
  onSaveData?: (updatedData: MedicalLandingData) => void;
  onProceedDownload: (updatedData?: MedicalLandingData) => void;
}

export const LocalSeoAuditModal: React.FC<LocalSeoAuditModalProps> = ({
  isOpen,
  onClose,
  data,
  onSaveData,
  onProceedDownload
}) => {
  // Estado local para los campos editables rápidos
  const [formValues, setFormValues] = useState({
    direccionFisica: data.direccionFisica || "",
    telefonoGBP: data.telefonoGBP || "",
    latitud: data.latitud || "",
    longitud: data.longitud || "",
    nombreClinicaGBP: data.nombreClinicaGBP || "",
    ciudad: data.ciudad || "",
    estadoRegion: data.estadoRegion || ""
  });

  // Sincronizar estado cuando cambie `data` o se abra el modal
  useEffect(() => {
    if (isOpen) {
      setFormValues({
        direccionFisica: data.direccionFisica || "",
        telefonoGBP: data.telefonoGBP || "",
        latitud: data.latitud || "",
        longitud: data.longitud || "",
        nombreClinicaGBP: data.nombreClinicaGBP || "",
        ciudad: data.ciudad || "",
        estadoRegion: data.estadoRegion || ""
      });
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  // Calcular reporte actual combinando data y los valores del formulario
  const currentPreviewData: MedicalLandingData = {
    ...data,
    direccionFisica: formValues.direccionFisica,
    telefonoGBP: formValues.telefonoGBP,
    latitud: formValues.latitud,
    longitud: formValues.longitud,
    nombreClinicaGBP: formValues.nombreClinicaGBP,
    ciudad: formValues.ciudad,
    estadoRegion: formValues.estadoRegion
  };

  const audit: LocalSeoAuditReport = runLocalSeoAudit(currentPreviewData);

  // Manejador para rellenar coordenadas y ciudad con presets de Ecuador
  const handleApplyCityPreset = (preset: EcuadorCityPreset) => {
    setFormValues(prev => ({
      ...prev,
      ciudad: preset.ciudad,
      estadoRegion: preset.provincia,
      latitud: preset.latitud,
      longitud: preset.longitud,
      direccionFisica: prev.direccionFisica.trim() === "" || prev.direccionFisica.includes("{{") 
        ? preset.ejemploDireccion 
        : prev.direccionFisica,
      nombreClinicaGBP: prev.nombreClinicaGBP.trim() === "" || prev.nombreClinicaGBP.includes("{{")
        ? preset.ejemploHospital
        : prev.nombreClinicaGBP
    }));
  };

  // Guardar datos y proceder con la descarga
  const handleSaveAndDownload = () => {
    if (onSaveData) {
      onSaveData(currentPreviewData);
    }
    onProceedDownload();
    onClose();
  };

  // Omitir advertencias y descargar de todos modos
  const handleSkipAndDownload = () => {
    onProceedDownload();
    onClose();
  };

  return (
    <div 
      id="local-seo-audit-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA DEL MODAL */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              audit.isComplete 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                : "bg-amber-50 text-amber-600 border border-amber-200"
            }`}>
              {audit.isComplete ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Auditoría de SEO Local
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                  audit.isComplete 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}>
                  Puntaje: {audit.score}/100
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Verificación de Google Business Profile (NAP) & Coordenadas GPS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          
          {/* BANNER DE ALERTA O ÉXITO */}
          {audit.isComplete ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-emerald-900">
                  ¡Excelente! Datos de SEO Local 100% Completos
                </h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Tu landing page cuenta con dirección física exacta, teléfono verificado y coordenadas GPS. La información coincide con los estándares de Google Business Profile y Schema.org.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-900">
                  Atención: Faltan {audit.criticalErrorsCount} datos críticos de SEO Local
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Antes de descargar el proyecto para producción, te recomendamos completar los siguientes campos. Google Maps penaliza o no indexa fichas médicas con dirección incompleta, sin teléfono o sin coordenadas.
                </p>
              </div>
            </div>
          )}

          {/* LISTA DE ESTADO DE CADA CAMPO CLAVE */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Verificación de Campos Clave
            </h4>

            <div className="grid grid-cols-1 gap-2">
              {audit.items.map((item) => {
                const isPass = item.status === "pass";
                const isWarning = item.status === "warning";

                return (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isPass 
                        ? "bg-emerald-50/40 border-emerald-200/80 text-slate-800" 
                        : isWarning
                          ? "bg-amber-50/40 border-amber-200/80 text-slate-800"
                          : "bg-red-50/50 border-red-200 text-slate-900"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isPass ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900">
                            {item.title}
                          </span>
                          {item.isCritical && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-red-100 text-red-700 border border-red-200">
                              Crítico
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                        isPass 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                          : isWarning
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-red-100 text-red-800 border-red-200"
                      }`}>
                        {isPass ? "Completo" : isWarning ? "Revisar" : "Faltante"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORMULARIO DE COMPLETADO RÁPIDO INCORPORADO (SI HAY ERRORES CRÍTICOS O SE DESEA MEJORAR) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Completar Datos Directamente Aquí
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ingresa o corrige los datos faltantes para que queden guardados en tu proyecto al descargar.
                </p>
              </div>

              {/* Botón rápido con preset de ciudades de Ecuador */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">Autocompletar Ciudad:</span>
                <div className="flex items-center gap-1">
                  {ECUADOR_CITIES.slice(0, 3).map((city) => (
                    <button
                      key={city.ciudad}
                      type="button"
                      onClick={() => handleApplyCityPreset(city)}
                      className="text-[10px] font-extrabold px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded-lg shadow-2xs transition-all cursor-pointer"
                      title={`Autocompletar coordenadas de ${city.ciudad}`}
                    >
                      {city.ciudad}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* 1. DIRECCIÓN DETALLADA */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dirección Física Detallada</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formValues.direccionFisica}
                  onChange={(e) => setFormValues(prev => ({ ...prev, direccionFisica: e.target.value }))}
                  placeholder="ej. Av. Mariana de Jesús y Calle Nicolás Arteta, Edificio Meditrópoli, Piso 4, Cons. 402"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium text-slate-800"
                />
              </div>

              {/* 2. TELÉFONO GBP Y NOMBRE DE CLÍNICA EN 2 COLUMNAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Teléfono Oficial GBP (NAP)</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formValues.telefonoGBP}
                    onChange={(e) => setFormValues(prev => ({ ...prev, telefonoGBP: e.target.value }))}
                    placeholder="ej. +593 99 123 4567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nombre de Clínica / Consultorio</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formValues.nombreClinicaGBP}
                    onChange={(e) => setFormValues(prev => ({ ...prev, nombreClinicaGBP: e.target.value }))}
                    placeholder="ej. Centro Médico Especializado"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* 3. COORDENADAS GPS: LATITUD Y LONGITUD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-600" />
                    <span>Latitud Google Maps</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formValues.latitud}
                    onChange={(e) => setFormValues(prev => ({ ...prev, latitud: e.target.value }))}
                    placeholder="ej. -0.1807"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white font-mono text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-600" />
                    <span>Longitud Google Maps</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formValues.longitud}
                    onChange={(e) => setFormValues(prev => ({ ...prev, longitud: e.target.value }))}
                    placeholder="ej. -78.4678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* 4. CIUDAD Y PROVINCIA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Ciudad</label>
                  <input
                    type="text"
                    value={formValues.ciudad}
                    onChange={(e) => setFormValues(prev => ({ ...prev, ciudad: e.target.value }))}
                    placeholder="ej. Quito"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Provincia</label>
                  <input
                    type="text"
                    value={formValues.estadoRegion}
                    onChange={(e) => setFormValues(prev => ({ ...prev, estadoRegion: e.target.value }))}
                    placeholder="ej. Pichincha"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white font-medium"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* PIE DE ACCIONES DEL MODAL */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Volver al Editor
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {!audit.isComplete && (
              <button
                type="button"
                onClick={handleSkipAndDownload}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-xs font-bold transition-all cursor-pointer text-center"
                title="Descargar el proyecto omitiendo los campos pendientes"
              >
                Omitir y Descargar
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAndDownload}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{audit.isComplete ? "Descargar Proyecto ZIP" : "Guardar Datos y Descargar ZIP"}</span>
              <Download className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
