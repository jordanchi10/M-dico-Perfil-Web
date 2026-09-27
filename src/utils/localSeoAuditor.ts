/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalLandingData } from "../types";

export interface LocalSeoAuditItem {
  id: string;
  field: keyof MedicalLandingData | string;
  title: string;
  isCritical: boolean;
  status: "pass" | "error" | "warning";
  currentValue: string;
  message: string;
  recommendation: string;
}

export interface LocalSeoAuditReport {
  isComplete: boolean; // true si todos los campos críticos están en 'pass'
  criticalErrorsCount: number;
  warningsCount: number;
  score: number; // 0 - 100
  items: LocalSeoAuditItem[];
  missingCriticalFields: string[];
}

/**
 * Validador estricto de SEO Local & Google Business Profile (GBP)
 * Verifica si los datos fundamentales de geolocalización, NAP y contacto
 * están configurados antes de la exportación a producción.
 */
export function runLocalSeoAudit(data: MedicalLandingData): LocalSeoAuditReport {
  const items: LocalSeoAuditItem[] = [];

  // Helper para verificar texto limpio sin placeholders
  const isPlaceholder = (val?: string): boolean => {
    if (!val) return true;
    const trimmed = val.trim();
    return trimmed === "" || trimmed.includes("{{") || trimmed.includes("}}");
  };

  // 1. DIRECCIÓN DETALLADA (Calle, número, consultorio, piso)
  const direccionVal = (data.direccionFisica || "").trim();
  const hasValidDireccion = !isPlaceholder(direccionVal) && direccionVal.length >= 10;
  items.push({
    id: "direccion-detallada",
    field: "direccionFisica",
    title: "Dirección Física Detallada",
    isCritical: true,
    status: hasValidDireccion ? "pass" : "error",
    currentValue: direccionVal || "Sin configurar",
    message: hasValidDireccion
      ? `Dirección configurada: "${direccionVal}"`
      : "Falta la dirección física detallada del consultorio (calle, número, edificio o piso/consultorio).",
    recommendation:
      "Google Business Profile y Google Maps requieren una dirección física exacta para validar la ubicación del consultorio e indexar en el Local Pack (mapa de 3 resultados)."
  });

  // 2. TELÉFONO GBP (Oficial de la ficha de Google)
  const telefonoVal = (data.telefonoGBP || "").trim();
  const digitsOnly = telefonoVal.replace(/\D/g, "");
  const hasValidTelefono = !isPlaceholder(telefonoVal) && digitsOnly.length >= 8 && digitsOnly !== "12345678";
  items.push({
    id: "telefono-gbp",
    field: "telefonoGBP",
    title: "Teléfono Google Business Profile (NAP)",
    isCritical: true,
    status: hasValidTelefono ? "pass" : "error",
    currentValue: telefonoVal || "Sin configurar",
    message: hasValidTelefono
      ? `Teléfono de ficha verificado: "${telefonoVal}"`
      : "Falta el teléfono oficial asignado a tu ficha de Google Business Profile (NAP).",
    recommendation:
      "La consistencia NAP (Name, Address, Phone) entre tu sitio web y tu ficha de Google Maps es el factor #1 de posicionamiento local para médicos y clínicas."
  });

  // 3. COORDENADAS GPS: LATITUD Y LONGITUD
  const latVal = (data.latitud || "").trim();
  const lngVal = (data.longitud || "").trim();
  const latNum = parseFloat(latVal);
  const lngNum = parseFloat(lngVal);

  const isValidLat = !isPlaceholder(latVal) && !isNaN(latNum) && latNum >= -90 && latNum <= 90 && latNum !== 0;
  const isValidLng = !isPlaceholder(lngVal) && !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180 && lngNum !== 0;
  const hasValidCoords = isValidLat && isValidLng;

  items.push({
    id: "coordenadas-gps",
    field: "latitud / longitud",
    title: "Coordenadas Geográficas (Latitud / Longitud)",
    isCritical: true,
    status: hasValidCoords ? "pass" : "error",
    currentValue: hasValidCoords ? `[${latVal}, ${lngVal}]` : (latVal || lngVal ? `Incompletas (${latVal || '?'}, ${lngVal || '?'})` : "Sin configurar"),
    message: hasValidCoords
      ? `Coordenadas Google Maps válidas: Latitud ${latVal}, Longitud ${lngVal}.`
      : "Faltan las coordenadas geográficas exactas (Latitud y Longitud) de Google Maps.",
    recommendation:
      "Las coordenadas alimentan la etiqueta Schema.org GeoCoordinates y centran el mapa interactivo del paciente. Sin ellas, los algoritmos de Google no pueden ubicar con precisión el consultorio."
  });

  // 4. NOMBRE DE LA CLÍNICA / CONSULTORIO EN GBP
  const clinicaVal = (data.nombreClinicaGBP || "").trim();
  const hasValidClinica = !isPlaceholder(clinicaVal) && clinicaVal.length >= 3;
  items.push({
    id: "clinica-gbp",
    field: "nombreClinicaGBP",
    title: "Nombre del Centro Médico / Consultorio en GBP",
    isCritical: true,
    status: hasValidClinica ? "pass" : "error",
    currentValue: clinicaVal || "Sin configurar",
    message: hasValidClinica
      ? `Nombre de clínica registrado: "${clinicaVal}"`
      : "Falta el nombre exacto de la clínica o consultorio tal como aparece en Google Maps.",
    recommendation:
      "El nombre comercial debe coincidir con el título de tu ficha de Google Business Profile para evitar penalizaciones por discrepancia de identidad."
  });

  // 5. CIUDAD Y PROVINCIA (Localidad y Orientación Geográfica)
  const ciudadVal = (data.ciudad || "").trim();
  const provinciaVal = (data.estadoRegion || "").trim();
  const hasValidCity = !isPlaceholder(ciudadVal) && ciudadVal.length >= 3;
  const hasValidRegion = !isPlaceholder(provinciaVal);
  const isCityComplete = hasValidCity && hasValidRegion;

  items.push({
    id: "ciudad-region",
    field: "ciudad / estadoRegion",
    title: "Ciudad y Provincia (Orientación Geográfica)",
    isCritical: false,
    status: isCityComplete ? "pass" : (hasValidCity ? "warning" : "error"),
    currentValue: `${ciudadVal || "Sin ciudad"}${provinciaVal ? `, ${provinciaVal}` : ""}`,
    message: isCityComplete
      ? `Ubicación geográfica: ${ciudadVal}, ${provinciaVal}.`
      : "Se recomienda especificar la ciudad y provincia para búsquedas como '[Especialidad] en [Ciudad]'.",
    recommendation:
      "Los pacientes buscan especialistas por ciudad o cantón. Configurar ambos valores mejora la tasa de clics locales."
  });

  // 6. HORARIOS DE CONSULTA
  const horariosVal = data.horarios?.semana || "";
  const hasHorarios = !isPlaceholder(horariosVal) && horariosVal.length >= 5;
  items.push({
    id: "horarios-gbp",
    field: "horarios",
    title: "Horarios de Atención Semanal",
    isCritical: false,
    status: hasHorarios ? "pass" : "warning",
    currentValue: horariosVal || "Sin configurar",
    message: hasHorarios
      ? `Horario registrado: "${horariosVal}"`
      : "No se han definido horarios de atención semanal.",
    recommendation:
      "Google prioriza a los consultorios que muestran horarios claros en los microdatos Schema openingHoursSpecification."
  });

  // Cálculo de puntajes y estados
  const criticalItems = items.filter(i => i.isCritical);
  const criticalErrors = criticalItems.filter(i => i.status === "error");
  const warnings = items.filter(i => i.status === "warning");

  const totalPoints = items.reduce((acc, item) => {
    if (item.status === "pass") return acc + (item.isCritical ? 25 : 10);
    if (item.status === "warning") return acc + (item.isCritical ? 10 : 5);
    return acc;
  }, 0);

  // Puntos máximos posibles: 4 críticos * 25 (100) + 2 secundarios * 10 (20) = 120
  const maxPoints = 120;
  const calculatedScore = Math.min(100, Math.round((totalPoints / maxPoints) * 100));

  const missingCriticalFields = criticalErrors.map(i => i.title);

  return {
    isComplete: criticalErrors.length === 0,
    criticalErrorsCount: criticalErrors.length,
    warningsCount: warnings.length,
    score: calculatedScore,
    items,
    missingCriticalFields
  };
}
