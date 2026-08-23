/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  MedicalLandingData, 
  ECUADOR_ASEGURADORAS, 
  ECUADOR_HOSPITALES, 
  ECUADOR_ASOCIACIONES 
} from "../../types";
import { 
  ShieldCheck, 
  Building2, 
  Award, 
  BookOpen, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles,
  FileText
} from "lucide-react";

interface FormCredentialsProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormCredentials({
  data,
  onChange,
  updateField
}: FormCredentialsProps) {
  const handleArrayChange = (field: "aseguradoras" | "hospitalesdondeOpera" | "asociaciones", index: number, value: string) => {
    const arr = [...(data[field] || [])];
    arr[index] = value;
    onChange({
      ...data,
      [field]: arr
    });
  };

  const addArrayItem = (field: "aseguradoras" | "hospitalesdondeOpera" | "asociaciones") => {
    onChange({
      ...data,
      [field]: [...(data[field] || []), ""]
    });
  };

  const removeArrayItem = (field: "aseguradoras" | "hospitalesdondeOpera" | "asociaciones", index: number) => {
    const arr = (data[field] || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      [field]: arr
    });
  };

  return (
    <div id="form-credentials-section" className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Credenciales Clínicas, Hospitales & Seguros E-E-A-T
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Filosofía de atención, biografía curricular, convenios con aseguradoras y hospitales de Ecuador.
          </p>
        </div>
      </div>

      {/* 1. FILOSOFÍA & BIOGRAFÍA CURRICULAR */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Filosofía de Atención & Perfil Clínico
        </label>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="filosofia">
            Propuesta de Valor / Filosofía Médica
          </label>
          <textarea
            id="filosofia"
            rows={2}
            value={data.filosofia ?? ""}
            onChange={(e) => updateField("filosofia", e.target.value)}
            placeholder="ej. Brindar una atención médica humana, honesta y de máxima precisión tecnológica para salvaguardar tu bienestar..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none text-slate-800"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="biografiaCurta">
            Biografía Curricular Resumida
          </label>
          <textarea
            id="biografiaCurta"
            rows={3}
            value={data.biografiaCurta ?? ""}
            onChange={(e) => updateField("biografiaCurta", e.target.value)}
            placeholder="Resumen de trayectoria profesional, formación en posgrados, fellowship internacional y experiencia clínica acumulada..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none text-slate-800"
          />
        </div>
      </div>

      {/* 2. ASEGURADORAS Y MEDICINA PREPAGADA */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Aseguradoras y Medicina Prepagada en Ecuador
            </h4>
            <p className="text-[11px] text-slate-500">Transmite confianza a pacientes mostrando convenios y cobertura por reembolso.</p>
          </div>
          <button
            type="button"
            onClick={() => addArrayItem("aseguradoras")}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        {/* Sugerencias Rápidas */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase">Sugerencias rápidas en Ecuador:</span>
          <div className="flex flex-wrap gap-1.5">
            {ECUADOR_ASEGURADORAS.map((aseg) => {
              const exists = (data.aseguradoras || []).includes(aseg);
              return (
                <button
                  key={aseg}
                  type="button"
                  onClick={() => {
                    if (!exists) {
                      onChange({
                        ...data,
                        aseguradoras: [...(data.aseguradoras || []), aseg]
                      });
                    }
                  }}
                  disabled={exists}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                    exists 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default opacity-80" 
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                  }`}
                >
                  {exists && <Check className="w-3 h-3 text-emerald-600" />}
                  {aseg}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(data.aseguradoras || []).map((aseg, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={aseg ?? ""}
                onChange={(e) => handleArrayChange("aseguradoras", idx, e.target.value)}
                placeholder="Nombre de la Aseguradora"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => removeArrayItem("aseguradoras", idx)}
                className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. HOSPITALES Y CLÍNICAS DONDE OPERA */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Hospitales y Clínicas donde Opera en Ecuador
            </h4>
            <p className="text-[11px] text-slate-500">Centros hospitalarios donde el especialista realiza intervenciones y cirugías.</p>
          </div>
          <button
            type="button"
            onClick={() => addArrayItem("hospitalesdondeOpera")}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        {/* Sugerencias Rápidas */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase">Sugerencias rápidas de centros médicos:</span>
          <div className="flex flex-wrap gap-1.5">
            {ECUADOR_HOSPITALES.map((hosp) => {
              const exists = (data.hospitalesdondeOpera || []).includes(hosp);
              return (
                <button
                  key={hosp}
                  type="button"
                  onClick={() => {
                    if (!exists) {
                      onChange({
                        ...data,
                        hospitalesdondeOpera: [...(data.hospitalesdondeOpera || []), hosp]
                      });
                    }
                  }}
                  disabled={exists}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                    exists 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default opacity-80" 
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                  }`}
                >
                  {exists && <Check className="w-3 h-3 text-emerald-600" />}
                  {hosp}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(data.hospitalesdondeOpera || []).map((hosp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={hosp ?? ""}
                onChange={(e) => handleArrayChange("hospitalesdondeOpera", idx, e.target.value)}
                placeholder="Hospital (ej. Hospital Metropolitano)"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => removeArrayItem("hospitalesdondeOpera", idx)}
                className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. COLEGIOS MÉDICOS, MSP & AVALES */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              Colegios Médicos, Sociedades Científicas & Avales MSP
            </h4>
            <p className="text-[11px] text-slate-500">Sociedades de especialistas y registros oficiales que respaldan la práctica médica.</p>
          </div>
          <button
            type="button"
            onClick={() => addArrayItem("asociaciones")}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        {/* Sugerencias Rápidas */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase">Sugerencias de colegios y avales:</span>
          <div className="flex flex-wrap gap-1.5">
            {ECUADOR_ASOCIACIONES.map((asoc) => {
              const exists = (data.asociaciones || []).includes(asoc);
              return (
                <button
                  key={asoc}
                  type="button"
                  onClick={() => {
                    if (!exists) {
                      onChange({
                        ...data,
                        asociaciones: [...(data.asociaciones || []), asoc]
                      });
                    }
                  }}
                  disabled={exists}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                    exists 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default opacity-80" 
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                  }`}
                >
                  {exists && <Check className="w-3 h-3 text-emerald-600" />}
                  {asoc}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(data.asociaciones || []).map((asoc, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={asoc ?? ""}
                onChange={(e) => handleArrayChange("asociaciones", idx, e.target.value)}
                placeholder="Asociación / Colegio (ej. Colegio de Médicos de Pichincha)"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => removeArrayItem("asociaciones", idx)}
                className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
