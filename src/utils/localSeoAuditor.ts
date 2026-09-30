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

  // 7. META TÍTULO LOCAL CON ESPECIALIDAD Y CIUDAD
  const metaTituloVal = (data.metaTitulo || "").trim();
  const especialidadVal = (data.especialidad || "").toLowerCase().trim();
  const cleanCityLower = ciudadVal.toLowerCase();
  
  const hasTitleWithSpecialtyAndCity = metaTituloVal !== "" &&
    metaTituloVal.toLowerCase().includes(cleanCityLower) &&
    (especialidadVal === "" || metaTituloVal.toLowerCase().includes(especialidadVal.split(" ")[0]));

  items.push({
    id: "meta-titulo-local",
    field: "metaTitulo",
    title: "Meta Título Local (Especialidad + Ciudad)",
    isCritical: false,
    status: hasTitleWithSpecialtyAndCity 
      ? "pass" 
      : (metaTituloVal === "" ? "pass" : "warning"),
    currentValue: metaTituloVal || `Auto: "${data.especialidad} en ${data.ciudad} | Dr(a). ${data.nombreMedico}"`,
    message: hasTitleWithSpecialtyAndCity
      ? `Título optimizado con Especialidad y Ciudad: "${metaTituloVal}"`
      : (metaTituloVal === "" 
          ? `Generación automática activa: "${data.especialidad} en ${data.ciudad} | Dr(a). ${data.nombreMedico}"`
          : `El título personalizado no incluye explícitamente la ciudad "${data.ciudad}". Se recomienda la fórmula: "[Especialidad] en [Ciudad] | [Doctor]".`),
    recommendation:
      "Los pacientes buscan '[Especialidad] en [Ciudad]' (ej. 'Pediatra en Quito', 'Dermatólogo en Guayaquil'). Incluir ambos términos en el título multiplica la tasa de clics y el ranking local."
  });

  // 8. META DESCRIPCIÓN LOCAL CON LLAMADO A LA ACCIÓN
  const metaDescVal = (data.metaDescripcion || "").trim();
  const descIncludesCity = metaDescVal.toLowerCase().includes(cleanCityLower);
  const descLengthValid = metaDescVal.length >= 80 && metaDescVal.length <= 165;

  items.push({
    id: "meta-descripcion-local",
    field: "metaDescripcion",
    title: "Meta Descripción con Geolocalización",
    isCritical: false,
    status: (descIncludesCity && descLengthValid) 
      ? "pass" 
      : (metaDescVal === "" ? "pass" : "warning"),
    currentValue: metaDescVal ? `${metaDescVal.slice(0, 60)}... (${metaDescVal.length} caracteres)` : "Auto-generada con ciudad y llamado a la acción",
    message: (descIncludesCity && descLengthValid)
      ? `Descripción de longitud ideal (${metaDescVal.length} car.) que incluye la ciudad de atención.`
      : (metaDescVal === ""
          ? `Generación automática orientada a ${data.ciudad} con seguros y llamado a la acción.`
          : `Revisa la descripción: debe incluir la ciudad "${data.ciudad}" y tener entre 120 y 160 caracteres (actual: ${metaDescVal.length}).`),
    recommendation:
      "Una descripción persuasiva con la ciudad de origen convence al paciente antes de hacer clic en los resultados de Google."
  });

  // 9. CÓDIGO POSTAL DE ECUADOR (6 dígitos)
  const cpVal = (data.codigoPostal || "").trim();
  const isValidCp = /^\d{6}$/.test(cpVal);
  items.push({
    id: "codigo-postal-ec",
    field: "codigoPostal",
    title: "Código Postal Oficial Ecuador (6 dígitos)",
    isCritical: false,
    status: isValidCp ? "pass" : "warning",
    currentValue: cpVal || "Sin configurar",
    message: isValidCp
      ? `Código postal válido para Ecuador: ${cpVal}.`
      : "Se recomienda un código postal oficial de 6 dígitos de Ecuador (ej. 170504 para Quito, 090150 para Guayaquil).",
    recommendation:
      "El código postal valida la microzona física del consultorio para las búsquedas 'cerca de mí' en Google Maps."
  });

  // Cálculo de puntajes y estados
  const criticalItems = items.filter(i => i.isCritical);
  const criticalErrors = criticalItems.filter(i => i.status === "error");
  const warnings = items.filter(i => i.status === "warning");

  const totalPoints = items.reduce((acc, item) => {
    if (item.status === "pass") return acc + (item.isCritical ? 20 : 7);
    if (item.status === "warning") return acc + (item.isCritical ? 8 : 3);
    return acc;
  }, 0);

  // 4 críticos * 20 (80) + 5 secundarios * 7 (35) = 115 max
  const maxPoints = 115;
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
