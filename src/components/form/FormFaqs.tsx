/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MedicalLandingData, FAQItem } from "../../types";
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Sparkles,
  Check
} from "lucide-react";

interface FormFaqsProps {
  data: MedicalLandingData;
  onChange: (newData: MedicalLandingData) => void;
  updateField: (field: keyof MedicalLandingData, value: any) => void;
}

export function FormFaqs({
  data,
  onChange,
  updateField
}: FormFaqsProps) {
  const handleFaqChange = (index: number, field: keyof FAQItem, value: string) => {
    const newFaqs = [...(data.faqs || [])];
    newFaqs[index] = {
      ...newFaqs[index],
      [field]: value
    };
    updateField("faqs", newFaqs);
  };

  const addFaq = (pregunta?: string, respuesta?: string) => {
    const newFaqItem: FAQItem = {
      id: `faq-${Date.now()}`,
      pregunta: pregunta || "¿Cuáles son los requisitos previos para la primera consulta médica?",
      respuesta: respuesta || "Para su primera cita, le sugerimos traer exámenes previos, lista de medicamentos habituales y cédula de identidad para su historia clínica."
    };
    updateField("faqs", [...(data.faqs || []), newFaqItem]);
  };

  const removeFaq = (index: number) => {
    const newFaqs = (data.faqs || []).filter((_, i) => i !== index);
    updateField("faqs", newFaqs);
  };

  const FAQS_SUGGESTIONS = [
    {
      p: "¿Cómo agendo mi primera consulta médica?",
      r: "Puedes agendar tu cita en segundos a través de nuestro botón de WhatsApp o llamando a recepción. Te confirmaremos la disponibilidad de fecha y horario de inmediato."
    },
    {
      p: "¿Aceptan seguros médicos privados y trámites de reembolso?",
      r: "Sí, emitimos la Factura Electrónica SRI oficial y entregamos el informe médico firmado para que tramites tu reembolso sin inconvenientes en Saludsa, Humana, Ecuasanitas, BMI, Confiamed y demás aseguradoras."
    },
    {
      p: "¿Cuáles son los métodos de pago disponibles en el consultorio?",
      r: "Aceptamos efectivo, transferencias bancarias directas (Banco Pichincha, Produbanco, Banco Guayaquil, DeUna) y tarjetas de crédito o débito con opción de diferidos."
    },
    {
      p: "¿Dónde está ubicado el consultorio y cuenta con parqueadero?",
      r: `Nos encontramos en una zona médica de fácil acceso en ${data.ciudad || "Ecuador"}, con instalaciones modernas y parqueadero seguro para la comodidad de nuestros pacientes.`
    },
    {
      p: "¿Qué documentos o exámenes debo llevar a mi primera cita?",
      r: "Te sugerimos traer tu documento de identidad, exámenes de laboratorio o imágenes previas relacionadas con tu motivo de consulta, y la lista de medicamentos que estés tomando actualmente."
    },
    {
      p: "¿Emiten factura electrónica autorizada por el SRI?",
      r: "Absolutamente. Todas nuestras atenciones incluyen factura electrónica enviada automáticamente a tu correo electrónico para la deducción de tus gastos personales de salud."
    },
    {
      p: "¿Atienden urgencias médicas o consultas fuera de horario habitual?",
      r: "Coordinamos atenciones prioritarias previa consulta y confirmación de disponibilidad por WhatsApp. En situaciones de emergencia vital, te recomendamos acudir de inmediato a la sala de urgencias hospitalarias más cercana."
    },
    {
      p: "¿Con cuánta anticipación puedo reprogramar o cancelar una cita?",
      r: "Te solicitamos notificar cualquier cambio o cancelación con al menos 24 horas de anticipación a través de WhatsApp para habilitar el turno a otro paciente que lo requiera."
    }
  ];

  return (
    <div id="form-faqs-section" className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Preguntas Frecuentes & FAQPage Schema
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Resuelve dudas frecuentes de los pacientes. Estas preguntas se indexan en Google con formato FAQ enriquecido.
          </p>
        </div>
      </div>

      {/* SUGERENCIAS RÁPIDAS DE FAQS */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
        <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Preguntas Frecuentes Sugeridas para Ecuador
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FAQS_SUGGESTIONS.map((sug, i) => {
            const alreadyAdded = (data.faqs || []).some(f => f.pregunta.trim().toLowerCase() === sug.p.trim().toLowerCase());
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (!alreadyAdded) {
                    addFaq(sug.p, sug.r);
                  }
                }}
                disabled={alreadyAdded}
                className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                  alreadyAdded
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default opacity-75"
                    : "bg-white text-slate-800 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold line-clamp-1">{sug.p}</span>
                  {alreadyAdded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2">{sug.r}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTADO DE FAQS ACTIVAS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>Listado de Preguntas Frecuentes</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {(data.faqs || []).length} { (data.faqs || []).length === 1 ? "pregunta" : "preguntas" }
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">Respuestas directas para guiar y tranquilizar al paciente antes de su cita.</p>
          </div>
          <button
            type="button"
            onClick={() => addFaq()}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Añadir Pregunta
          </button>
        </div>

        {(!data.faqs || data.faqs.length === 0) ? (
          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-3">No hay preguntas frecuentes registradas.</p>
            <button
              type="button"
              onClick={() => addFaq()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white border border-slate-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear primera pregunta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.faqs.map((faq, idx) => (
              <div key={faq.id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-[11px] font-extrabold text-slate-800 uppercase">Pregunta #{idx + 1}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    title="Eliminar pregunta"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`faq-p-${idx}`}>
                    Pregunta Frecuente
                  </label>
                  <input
                    id={`faq-p-${idx}`}
                    type="text"
                    value={faq.pregunta ?? ""}
                    onChange={(e) => handleFaqChange(idx, "pregunta", e.target.value)}
                    placeholder="ej. ¿Cuál es el tiempo de recuperación promedio?"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-white font-bold text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor={`faq-r-${idx}`}>
                    Respuesta Clara y Detallada
                  </label>
                  <textarea
                    id={`faq-r-${idx}`}
                    rows={2}
                    value={faq.respuesta ?? ""}
                    onChange={(e) => handleFaqChange(idx, "respuesta", e.target.value)}
                    placeholder="Explica de forma tranquilizadora y transparente la respuesta..."
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none bg-white text-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
