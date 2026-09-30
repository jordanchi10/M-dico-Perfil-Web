/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MedicalLandingData, ECUADOR_CITIES, EcuadorCityPreset } from "../../types";
import { 
  Building2, 
  MapPin, 
  Clock, 
  Banknote, 
  DollarSign, 
  CreditCard, 
  Check, 
  Map, 
  CheckCircle2, 
  Sparkles,
  Camera,
  Video,
  Globe,
  FileCheck,
  ShieldCheck,
  Laptop
} from "lucide-react";
import { getLiveConsultationStatus } from "../../utils/scheduleUtils";

interface FormClinicLocationProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormClinicLocation({
  data,
  onChange,
  updateField
}: FormClinicLocationProps) {
  const handleCitySelect = (cityPreset: EcuadorCityPreset) => {
    const prevCity = data.ciudad || "";
    let newClinicName = data.nombreClinicaGBP || "";
    if (newClinicName.includes("{{CIUDAD}}")) {
      newClinicName = newClinicName.replace(/\{\{CIUDAD\}\}/g, cityPreset.ciudad);
    } else if (prevCity && prevCity !== cityPreset.ciudad && newClinicName.includes(prevCity)) {
      newClinicName = newClinicName.replace(new RegExp(prevCity, "gi"), cityPreset.ciudad);
    }

    let newMetaTitulo = data.metaTitulo;
    if (newMetaTitulo && prevCity && prevCity !== cityPreset.ciudad && newMetaTitulo.includes(prevCity)) {
      newMetaTitulo = newMetaTitulo.replace(new RegExp(prevCity, "gi"), cityPreset.ciudad);
    }

    let newMetaDesc = data.metaDescripcion;
    if (newMetaDesc && prevCity && prevCity !== cityPreset.ciudad && newMetaDesc.includes(prevCity)) {
      newMetaDesc = newMetaDesc.replace(new RegExp(prevCity, "gi"), cityPreset.ciudad);
    }

    let newKeywords = data.metaKeywords;
    if (newKeywords && prevCity && prevCity !== cityPreset.ciudad && newKeywords.includes(prevCity)) {
      newKeywords = newKeywords.replace(new RegExp(prevCity, "gi"), cityPreset.ciudad);
    }

    onChange({
      ...data,
      ciudad: cityPreset.ciudad,
      estadoRegion: cityPreset.provincia,
      codigoPostal: cityPreset.codigoPostal,
      latitud: cityPreset.latitud,
      longitud: cityPreset.longitud,
      nombreClinicaGBP: newClinicName,
      ...(newMetaTitulo ? { metaTitulo: newMetaTitulo } : {}),
      ...(newMetaDesc ? { metaDescripcion: newMetaDesc } : {}),
      ...(newKeywords ? { metaKeywords: newKeywords } : {})
    });
  };

  const updateNestedField = (parent: keyof MedicalLandingData, field: string, value: any) => {
    onChange({
      ...data,
      [parent]: {
        ...(data[parent] as any),
        [field]: value
      }
    });
  };

  return (
    <div id="form-clinic-location-section" className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Ubicación Física, Consultorio & Horarios
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura la sede del consultorio en Ecuador, geolocalización Google Maps, horarios y tarifas.
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Ecuador 🇪🇨
        </span>
      </div>

      {/* 1. SELECTOR RÁPIDO DE CIUDADES DE ECUADOR */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5 text-blue-600" />
            Selector Rápido de Ciudades Principales en Ecuador
          </label>
          <span className="text-[10px] text-slate-400 font-medium">Auto-rellena provincia, CP y GPS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ECUADOR_CITIES.map((city) => {
            const isSelected = data.ciudad.toLowerCase().trim() === city.ciudad.toLowerCase().trim();
            return (
              <button
                key={city.ciudad}
                type="button"
                onClick={() => handleCitySelect(city)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">{city.ciudad}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">{city.provincia}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DIRECCIÓN Y COORDENADAS GPS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-blue-600" />
          Ficha Local del Consultorio (NAP)
        </label>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="nombreClinicaGBP">
            Nombre de la Clínica o Centro Médico (Google Business Profile)
          </label>
          <input
            id="nombreClinicaGBP"
            type="text"
            value={data.nombreClinicaGBP ?? ""}
            onChange={(e) => updateField("nombreClinicaGBP", e.target.value)}
            placeholder="ej. Centro Médico Especializado Quito"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="direccionFisica">
            Dirección Física Detallada en Ecuador
          </label>
          <input
            id="direccionFisica"
            type="text"
            value={data.direccionFisica ?? ""}
            onChange={(e) => updateField("direccionFisica", e.target.value)}
            placeholder="ej. Av. Mariana de Jesús y Nicolás Arteta, Edificio Meditrópoli, Piso 4"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="ciudad">Ciudad</label>
            <input
              id="ciudad"
              type="text"
              value={data.ciudad ?? ""}
              onChange={(e) => updateField("ciudad", e.target.value)}
              placeholder="ej. Quito"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="estadoRegion">Provincia</label>
            <input
              id="estadoRegion"
              type="text"
              value={data.estadoRegion ?? ""}
              onChange={(e) => updateField("estadoRegion", e.target.value)}
              placeholder="ej. Pichincha"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="codigoPostal">Código Postal</label>
            <input
              id="codigoPostal"
              type="text"
              value={data.codigoPostal ?? ""}
              onChange={(e) => updateField("codigoPostal", e.target.value)}
              placeholder="ej. 170504"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-mono"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="pais">País</label>
            <input
              id="pais"
              type="text"
              value={data.pais ?? ""}
              readOnly
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-blue-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="latitud">Latitud Google Maps</label>
            <input
              id="latitud"
              type="text"
              value={data.latitud ?? ""}
              onChange={(e) => updateField("latitud", e.target.value)}
              placeholder="ej. -0.1807"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-mono"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="longitud">Longitud Google Maps</label>
            <input
              id="longitud"
              type="text"
              value={data.longitud ?? ""}
              onChange={(e) => updateField("longitud", e.target.value)}
              placeholder="ej. -78.4678"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. HORARIOS DE CONSULTA CON ESTADO EN VIVO */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Horarios de Atención & Estado en Vivo
            </label>
            <p className="text-[11px] text-slate-500">
              Calcula si el consultorio está "Atendiendo hoy", "Abierto ahora" o "Cerrado".
            </p>
          </div>

          {/* Badge Simulador de Estado en Vivo */}
          {(() => {
            const live = getLiveConsultationStatus(data.horarios);
            return (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${live.dotColor === 'emerald' ? 'bg-emerald-400' : live.dotColor === 'amber' ? 'bg-amber-400' : 'bg-slate-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${live.dotColor === 'emerald' ? 'bg-emerald-500' : live.dotColor === 'amber' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                </span>
                <span>{live.badgeText}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 text-[11px] font-medium">{live.badgeDetail}</span>
              </div>
            );
          })()}
        </div>

        {/* Presets Rápidos de Horarios Médicos */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
            Plantillas Rápidas de Horarios Clínicos en Ecuador:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...data,
                  horarios: {
                    semana: "Lunes a Viernes: 09:00 - 18:00",
                    sabado: "Sábados: 09:00 - 13:00",
                    domingo: "Domingos: Cerrado"
                  }
                });
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              🩺 Estándar Clínico (09:00 - 18:00)
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...data,
                  horarios: {
                    semana: "Lunes a Viernes: 08:00 - 19:00",
                    sabado: "Sábados: 08:30 - 14:00",
                    domingo: "Domingos: Cerrado"
                  }
                });
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              🏥 Jornada Continua (08:00 - 19:00)
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...data,
                  horarios: {
                    semana: "Lunes a Viernes: 14:00 - 20:00",
                    sabado: "Sábados: 09:00 - 14:00",
                    domingo: "Domingos: Cerrado"
                  }
                });
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              🌙 Vespertino (14:00 - 20:00)
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...data,
                  horarios: {
                    semana: "Lunes a Viernes: 09:00 - 17:00 (Previa Cita)",
                    sabado: "Sábados: 09:00 - 13:00 (Previa Cita)",
                    domingo: "Domingos: Cerrado"
                  }
                });
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              📋 Cita Previa (09:00 - 17:00)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="horarioSemana">Lunes a Viernes</label>
            <input
              id="horarioSemana"
              type="text"
              value={data.horarios?.semana ?? ""}
              onChange={(e) => updateNestedField("horarios", "semana", e.target.value)}
              placeholder="Lunes a Viernes: 09:00 - 18:00"
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-medium"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="horarioSabado">Sábados</label>
            <input
              id="horarioSabado"
              type="text"
              value={data.horarios?.sabado ?? ""}
              onChange={(e) => updateNestedField("horarios", "sabado", e.target.value)}
              placeholder="Sábados: 09:00 - 13:00"
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-medium"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="horarioDomingo">Domingos</label>
            <input
              id="horarioDomingo"
              type="text"
              value={data.horarios?.domingo ?? ""}
              onChange={(e) => updateNestedField("horarios", "domingo", e.target.value)}
              placeholder="Domingos: Cerrado"
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. TARIFAS Y MODALIDADES DE ATENCIÓN (PRESENCIAL VS. TELECONSULTA) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-emerald-600" />
            Tarifas & Modalidades de Atención (CRO / Conversión)
          </label>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Presencial & Teleconsulta
          </span>
        </div>

        {/* Tarifas de Consulta Presencial */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Consulta Presencial en Consultorio
            </span>
            <span className="text-[10px] font-bold text-slate-500">Atención Física</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="precioConsulta">
                Tarifa Consulta Presencial
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="precioConsulta"
                  type="text"
                  value={data.precioConsulta || ""}
                  onChange={(e) => updateField("precioConsulta", e.target.value)}
                  placeholder="ej. $50 USD"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 bg-white"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["$40 USD", "$50 USD", "$60 USD", "$80 USD", "$100 USD"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateField("precioConsulta", preset)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      data.precioConsulta === preset 
                        ? "bg-blue-600 text-white" 
                        : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Métodos de Pago Presencial y Online
              </label>
              <div className="space-y-2 pt-1">
                {[
                  { key: "Efectivo", icon: Banknote, desc: "Pago presencial en consultorio" },
                  { key: "Transferencia bancaria", icon: Building2, desc: "Bancos locales, DeUna y transferencias" },
                  { key: "Tarjetas de crédito", icon: CreditCard, desc: "Visa, Mastercard, diferido" }
                ].map((metodo) => {
                  const currentMetodos = data.metodosPago || ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"];
                  const isChecked = currentMetodos.includes(metodo.key);
                  const IconComponent = metodo.icon;
                  return (
                    <label
                      key={metodo.key}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                        isChecked 
                          ? "bg-white border-emerald-300 text-emerald-950 font-bold shadow-2xs" 
                          : "bg-slate-100/50 border-slate-200 text-slate-600 opacity-60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateField("metodosPago", [...currentMetodos, metodo.key]);
                          } else {
                            updateField("metodosPago", currentMetodos.filter((m) => m !== metodo.key));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <IconComponent className={`w-4 h-4 ${isChecked ? "text-emerald-600" : "text-slate-400"}`} />
                      <div className="flex flex-col">
                        <span className="text-xs">{metodo.key}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{metodo.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sección Teleconsulta / Videoconsulta para pacientes de otras provincias */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-blue-50/50 border border-teal-200/80 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  Teleconsulta & Videoconsultas (Pacientes Nacionales e Internacionales)
                </h4>
                <p className="text-[11px] text-slate-600">
                  Permite a pacientes de otras ciudades o provincias agendar citas virtuales con tarifas y requisitos claros.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={data.habilitarTeleconsulta ?? true}
                onChange={(e) => updateField("habilitarTeleconsulta", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {(data.habilitarTeleconsulta ?? true) && (
            <div className="space-y-4 pt-2 border-t border-teal-200/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Costo Teleconsulta */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="precioTeleconsulta">
                    Tarifa de Teleconsulta Online
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="precioTeleconsulta"
                      type="text"
                      value={data.precioTeleconsulta || "$40 USD"}
                      onChange={(e) => updateField("precioTeleconsulta", e.target.value)}
                      placeholder="ej. $40 USD"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["$30 USD", "$35 USD", "$40 USD", "$45 USD", "$50 USD"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateField("precioTeleconsulta", preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                          data.precioTeleconsulta === preset 
                            ? "bg-teal-600 text-white" 
                            : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plataformas Soportadas */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Plataformas de Videollamada
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Zoom", "Google Meet", "WhatsApp Video", "Microsoft Teams"].map((plat) => {
                      const currentPlats = data.plataformasTeleconsulta || ["Zoom", "Google Meet", "WhatsApp Video"];
                      const isSelected = currentPlats.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              updateField("plataformasTeleconsulta", currentPlats.filter(p => p !== plat));
                            } else {
                              updateField("plataformasTeleconsulta", [...currentPlats, plat]);
                            }
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-teal-600 text-white border-teal-700 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{plat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Requisitos y Cobertura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="requisitosTeleconsulta">
                    Requisitos para el Paciente
                  </label>
                  <textarea
                    id="requisitosTeleconsulta"
                    rows={2}
                    value={data.requisitosTeleconsulta || "Conexión a internet estable, espacio privado y documentos/estudios médicos previos digitales en PDF o fotos."}
                    onChange={(e) => updateField("requisitosTeleconsulta", e.target.value)}
                    placeholder="ej. Conexión a internet estable, espacio privado..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase" htmlFor="coberturaTeleconsulta">
                    Cobertura Geográfica
                  </label>
                  <input
                    id="coberturaTeleconsulta"
                    type="text"
                    value={data.coberturaTeleconsulta || "Nacional e Internacional (Todas las provincias del Ecuador y pacientes en el exterior)"}
                    onChange={(e) => updateField("coberturaTeleconsulta", e.target.value)}
                    placeholder="ej. Todo el Ecuador y exterior..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Beneficios Incluidos en Teleconsulta */}
              <div className="p-3 rounded-xl bg-white border border-teal-200/80 space-y-2">
                <span className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Garantías & Documentos Médicos Emitidos en Teleconsulta
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Receta Médica Digital con firma electrónica válida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Órdenes de exámenes y laboratorio en PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Informe clínico de valoración diagnóstica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Revisión posterior de resultados sin costo adicional</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
