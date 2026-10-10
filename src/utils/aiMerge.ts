/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalLandingData } from "../types";

export function applyExtractedMedicalData(
  current: MedicalLandingData,
  extracted: Partial<MedicalLandingData>,
  mergeMode: boolean = false
): MedicalLandingData {
  if (!extracted || typeof extracted !== "object") {
    return current;
  }

  // Filtrar campos undefined o vacíos accidentales
  const cleanExtracted: Record<string, any> = {};
  for (const [key, val] of Object.entries(extracted)) {
    if (val !== undefined && val !== null && val !== "") {
      cleanExtracted[key] = val;
    }
  }

  // Mapeo de alias para máxima compatibilidad
  if (cleanExtracted.telefono && !cleanExtracted.telefonoGBP) {
    cleanExtracted.telefonoGBP = cleanExtracted.telefono;
  }
  if (cleanExtracted.whatsapp && !cleanExtracted.whatsappUrl) {
    cleanExtracted.whatsappUrl = cleanExtracted.whatsapp;
  }
  if (cleanExtracted.email && !cleanExtracted.emailContacto) {
    cleanExtracted.emailContacto = cleanExtracted.email;
  }
  if (cleanExtracted.nombreClinicaConsultorio && !cleanExtracted.nombreClinicaGBP) {
    cleanExtracted.nombreClinicaGBP = cleanExtracted.nombreClinicaConsultorio;
  }
  if (cleanExtracted.direccionConsultorio && !cleanExtracted.direccionFisica) {
    cleanExtracted.direccionFisica = cleanExtracted.direccionConsultorio;
  }
  if (cleanExtracted.preguntasFrecuentes && (!cleanExtracted.faqs || cleanExtracted.faqs.length === 0)) {
    cleanExtracted.faqs = cleanExtracted.preguntasFrecuentes;
  }
  if (cleanExtracted.posgradoEspecialidad && (!cleanExtracted.universidad || cleanExtracted.universidad.includes("Central del Ecuador"))) {
    cleanExtracted.universidad = cleanExtracted.posgradoEspecialidad;
  }
  if (typeof cleanExtracted.anosExperiencia === "string") {
    const num = parseInt(cleanExtracted.anosExperiencia, 10);
    if (!isNaN(num)) cleanExtracted.anosExperiencia = num;
  }

  // Generar o actualizar SEO tags amigables si se extrajo nombre o especialidad
  const targetNombre = cleanExtracted.nombreMedico || current.nombreMedico;
  const targetEsp = cleanExtracted.especialidad || current.especialidad;
  const targetCiudad = cleanExtracted.ciudad || current.ciudad;

  if (cleanExtracted.nombreMedico || cleanExtracted.especialidad) {
    cleanExtracted.metaTitulo = cleanExtracted.metaTitulo || `${targetNombre} | ${targetEsp} en ${targetCiudad} - Agenda de Citas`;
    cleanExtracted.metaDescripcion = cleanExtracted.metaDescripcion || `Consulta médica con ${targetNombre}, especialista en ${targetEsp} en ${targetCiudad}. Citas inmediatas, atención con seguros privados y facturación electrónica SRI.`;
    cleanExtracted.metaKeywords = cleanExtracted.metaKeywords || `${targetEsp.toLowerCase()}, ${targetEsp.toLowerCase()} ${targetCiudad.toLowerCase()}, citas ${targetNombre.toLowerCase()}, consultorio ${targetCiudad.toLowerCase()}, seguros saludsa ${targetCiudad.toLowerCase()}`;
  }

  if (!mergeMode) {
    const updated: MedicalLandingData = {
      ...current,
      ...cleanExtracted,
      // Horarios: fusión profunda
      horarios: {
        ...(current?.horarios || {}),
        ...(cleanExtracted.horarios || {})
      },
      // Colecciones y listas prioritarias
      servicios: Array.isArray(cleanExtracted.servicios) && cleanExtracted.servicios.length > 0 
        ? cleanExtracted.servicios 
        : current.servicios,
      faqs: Array.isArray(cleanExtracted.faqs) && cleanExtracted.faqs.length > 0 
        ? cleanExtracted.faqs 
        : current.faqs,
      resenas: Array.isArray(cleanExtracted.resenas) && cleanExtracted.resenas.length > 0 
        ? cleanExtracted.resenas 
        : current.resenas,
      aseguradoras: Array.isArray(cleanExtracted.aseguradoras) && cleanExtracted.aseguradoras.length > 0 
        ? cleanExtracted.aseguradoras 
        : current.aseguradoras,
      hospitalesdondeOpera: Array.isArray(cleanExtracted.hospitalesdondeOpera) && cleanExtracted.hospitalesdondeOpera.length > 0 
        ? cleanExtracted.hospitalesdondeOpera 
        : current.hospitalesdondeOpera,
      asociaciones: Array.isArray(cleanExtracted.asociaciones) && cleanExtracted.asociaciones.length > 0 
        ? cleanExtracted.asociaciones 
        : current.asociaciones,
      certificados: Array.isArray(cleanExtracted.certificados) && cleanExtracted.certificados.length > 0 
        ? cleanExtracted.certificados 
        : current.certificados,
      reconocimientos: Array.isArray(cleanExtracted.reconocimientos) && cleanExtracted.reconocimientos.length > 0 
        ? cleanExtracted.reconocimientos 
        : current.reconocimientos,
      valores: Array.isArray(cleanExtracted.valores) && cleanExtracted.valores.length > 0 
        ? cleanExtracted.valores 
        : current.valores,
      metodosPago: Array.isArray(cleanExtracted.metodosPago) && cleanExtracted.metodosPago.length > 0 
        ? cleanExtracted.metodosPago 
        : current.metodosPago,
      blogPosts: Array.isArray(cleanExtracted.blogPosts) && cleanExtracted.blogPosts.length > 0 
        ? cleanExtracted.blogPosts 
        : current.blogPosts,
      guiasPacientes: Array.isArray(cleanExtracted.guiasPacientes) && cleanExtracted.guiasPacientes.length > 0 
        ? cleanExtracted.guiasPacientes 
        : current.guiasPacientes,
      casosAntesDespues: Array.isArray(cleanExtracted.casosAntesDespues) && cleanExtracted.casosAntesDespues.length > 0 
        ? cleanExtracted.casosAntesDespues 
        : current.casosAntesDespues,
    };

    // Sincronizar Asistente con FAQs si no tiene preguntas propias
    if (cleanExtracted.faqs && cleanExtracted.faqs.length > 0) {
      updated.asistentePreguntas = cleanExtracted.faqs;
    }
    if (cleanExtracted.nombreMedico) {
      updated.asistenteNombre = `Asistente de ${cleanExtracted.nombreMedico}`;
    }

    return updated;
  }

  // Merge Mode: sólo sobreescribir campos donde se haya detectado un valor no vacío
  const merged: any = { ...current };
  for (const [key, value] of Object.entries(cleanExtracted)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        merged[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      merged[key] = {
        ...merged[key],
        ...value
      };
    } else {
      merged[key] = value;
    }
  }

  if (cleanExtracted.faqs && cleanExtracted.faqs.length > 0) {
    merged.asistentePreguntas = cleanExtracted.faqs;
  }
  if (cleanExtracted.nombreMedico) {
    merged.asistenteNombre = `Asistente de ${cleanExtracted.nombreMedico}`;
  }

  return merged as MedicalLandingData;
}
