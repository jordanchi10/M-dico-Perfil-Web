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
  if (!mergeMode) {
    return {
      ...current,
      ...extracted,
      horarios: {
        ...current.horarios,
        ...(extracted.horarios || {})
      },
      servicios: extracted.servicios && extracted.servicios.length > 0 ? extracted.servicios : current.servicios,
      faqs: extracted.faqs && extracted.faqs.length > 0 ? extracted.faqs : current.faqs,
      resenas: extracted.resenas && extracted.resenas.length > 0 ? extracted.resenas : current.resenas,
      aseguradoras: extracted.aseguradoras && extracted.aseguradoras.length > 0 ? extracted.aseguradoras : current.aseguradoras,
      hospitalesdondeOpera: extracted.hospitalesdondeOpera && extracted.hospitalesdondeOpera.length > 0 ? extracted.hospitalesdondeOpera : current.hospitalesdondeOpera,
      asociaciones: extracted.asociaciones && extracted.asociaciones.length > 0 ? extracted.asociaciones : current.asociaciones,
    };
  }

  // Merge mode: only overwrite non-empty fields
  const updated: any = { ...current };
  for (const [key, value] of Object.entries(extracted)) {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          updated[key] = value;
        }
      } else if (typeof value === "object") {
        updated[key] = {
          ...updated[key],
          ...value
        };
      } else {
        updated[key] = value;
      }
    }
  }
  return updated as MedicalLandingData;
}
