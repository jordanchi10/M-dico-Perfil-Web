/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PREDEFINED_MEDICAL_ICONS, MedicalIconDefinition } from "../utils/medicalIcons";
import { MedicalIconRenderer } from "./MedicalIconRenderer";
import { Check, ChevronDown, Sparkles, Search, Grid } from "lucide-react";

interface MedicalIconSelectorProps {
  id?: string;
  value: string;
  onChange: (iconName: string) => void;
}

export const MedicalIconSelector: React.FC<MedicalIconSelectorProps> = ({ id, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const currentIconDef = PREDEFINED_MEDICAL_ICONS.find(
    (i) => i.id.toLowerCase() === (value || "Stethoscope").toLowerCase()
  ) || PREDEFINED_MEDICAL_ICONS[0];

  const categories = ["Todos", "General y Consulta", "Órganos y Anatomía", "Especialidades", "Instrumental y Tratamientos"];

  const filteredIcons = PREDEFINED_MEDICAL_ICONS.filter((icon) => {
    const matchesCategory = activeCategory === "Todos" || icon.category === activeCategory;
    const matchesSearch = 
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative">
      {/* Selector Principal con Preview */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id={id ? `${id}-btn` : undefined}
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MedicalIconRenderer name={currentIconDef.id} className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 block truncate">{currentIconDef.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{currentIconDef.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2">
            <Grid className="w-3.5 h-3.5" />
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        {/* Dropdown Nativo Sincronizado para Accesibilidad Rápida */}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Seleccionar icono médico"
          className="sr-only sm:not-sr-only sm:w-28 text-[11px] font-medium border border-slate-200 rounded-lg px-2 py-2 bg-white text-slate-700 outline-none focus:border-blue-500"
        >
          {PREDEFINED_MEDICAL_ICONS.map((icon) => (
            <option key={icon.id} value={icon.id}>
              {icon.name} ({icon.id})
            </option>
          ))}
        </select>
      </div>

      {/* Popover / Panel de Selección Visual de Iconos Médicos */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 p-3 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-3 min-w-[290px] sm:min-w-[340px] max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Catálogo de Iconos Médicos ({PREDEFINED_MEDICAL_ICONS.length})
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Clic para asignar</span>
            </div>

            {/* Búsqueda rápida */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por órgano, síntoma o especialidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Píldoras de Categorías */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid Visual de Iconos */}
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredIcons.map((icon) => {
                const isSelected = icon.id.toLowerCase() === (value || "Stethoscope").toLowerCase();
                return (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => {
                      onChange(icon.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-start gap-2 p-2 rounded-xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 ring-1 ring-blue-500 text-blue-900"
                        : "bg-slate-50/60 border-slate-100 hover:bg-slate-100 hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-blue-600 text-white" : "bg-white text-slate-700 shadow-2xs"
                    }`}>
                      <MedicalIconRenderer name={icon.id} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold truncate block">{icon.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0 ml-1" />}
                      </div>
                      <span className="text-[9px] text-slate-500 line-clamp-1 leading-tight">{icon.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
