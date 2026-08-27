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
  FileText,
  Target,
  Eye,
  HeartHandshake
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
  const isClinica = data.tipoEnfoqueLanding === "clinica";

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
          {isClinica ? "Misión Institucional & Perfil del Centro" : "Filosofía de Atención & Perfil Clínico"}
        </label>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="filosofia">
            {isClinica ? "Misión & Propuesta Institucional" : "Propuesta de Valor / Filosofía Médica"}
          </label>
          <textarea
            id="filosofia"
            rows={2}
            value={data.filosofia ?? ""}
            onChange={(e) => updateField("filosofia", e.target.value)}
            placeholder={isClinica ? "ej. Brindar atención médica integral con estándares internacionales, calidez humana y tecnología de punta..." : "ej. Brindar una atención médica humana, honesta y de máxima precisión tecnológica para salvaguardar tu bienestar..."}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none text-slate-800"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="biografiaCurta">
            {isClinica ? "Presentación Institucional / Quiénes Somos (Nosotros)" : "Biografía Curricular Resumida"}
          </label>
          <textarea
            id="biografiaCurta"
            rows={3}
            value={data.biografiaCurta ?? ""}
            onChange={(e) => updateField("biografiaCurta", e.target.value)}
            placeholder={isClinica ? "Resumen de la trayectoria del centro médico, infraestructura tecnológica, especialidades disponibles y compromiso con la salud..." : "Resumen de trayectoria profesional, formación en posgrados, fellowship internacional y experiencia clínica acumulada..."}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none text-slate-800"
          />
        </div>

        {/* MISIÓN, VISIÓN Y VALORES INSTITUCIONALES / PROFESIONALES */}
        <div className="pt-3 border-t border-slate-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-600" />
              {isClinica ? "Misión, Visión & Valores Institucionales" : "Misión, Visión & Valores Profesionales"}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Perfil Completo
            </span>
          </div>

          {/* MISIÓN */}
          <div className="flex flex-col gap-1.5 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
            <label className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5" htmlFor="mision">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              {isClinica ? "Misión del Centro Médico" : "Misión del Especialista"}
            </label>
            <textarea
              id="mision"
              rows={2}
              value={data.mision ?? ""}
              onChange={(e) => updateField("mision", e.target.value)}
              placeholder={isClinica ? "ej. Proporcionar atención médica especializada de excelencia con estándares internacionales..." : "ej. Brindar atención médica y quirúrgica especializada de máxima precisión y sentido humano..."}
              className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-medium resize-none text-slate-800 bg-white"
            />
          </div>

          {/* VISIÓN */}
          <div className="flex flex-col gap-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <label className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5" htmlFor="vision">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              {isClinica ? "Visión Institucional" : "Visión Profesional"}
            </label>
            <textarea
              id="vision"
              rows={2}
              value={data.vision ?? ""}
              onChange={(e) => updateField("vision", e.target.value)}
              placeholder={isClinica ? "ej. Ser el centro médico líder en la región, reconocido por la vanguardia tecnológica y confianza..." : "ej. Ser el profesional de referencia nacional e internacional en mi especialidad médica..."}
              className="w-full px-3 py-2 rounded-lg border border-blue-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none text-slate-800 bg-white"
            />
          </div>

          {/* VALORES Y PRINCIPIOS */}
          <div className="flex flex-col gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                Valores & Principios Fundamentales
              </label>
              <button
                type="button"
                onClick={() => {
                  const arr = [...(data.valores || [])];
                  arr.push("");
                  updateField("valores", arr);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3" /> Agregar valor
              </button>
            </div>

            {/* Sugerencias de Valores */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Excelencia Médica", "Ética & Transparencia", "Calidez Humana", "Innovación Tecnológica", "Empatía con el Paciente", "Responsabilidad Social"].map((val) => {
                const exists = (data.valores || []).includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      if (!exists) {
                        updateField("valores", [...(data.valores || []), val]);
                      }
                    }}
                    disabled={exists}
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-all flex items-center gap-1 ${
                      exists
                        ? "bg-emerald-200 text-emerald-900 border-emerald-300 opacity-70 cursor-default"
                        : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer"
                    }`}
                  >
                    {exists && <Check className="w-2.5 h-2.5 text-emerald-700" />}
                    {val}
                  </button>
                );
              })}
            </div>

            {/* Lista de Valores Editables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {(data.valores || []).map((val, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const arr = [...(data.valores || [])];
                      arr[idx] = e.target.value;
                      updateField("valores", arr);
                    }}
                    placeholder="ej. Calidez Humana"
                    className="flex-1 px-2.5 py-1 rounded-md border border-emerald-200 text-xs bg-white focus:border-emerald-500 outline-none font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr = (data.valores || []).filter((_, i) => i !== idx);
                      updateField("valores", arr);
                    }}
                    className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
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
