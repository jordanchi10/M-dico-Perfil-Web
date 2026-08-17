/**
 * Utilidades para cálculo de horarios de atención en tiempo real (Abierto / Cerrado ahora)
 * y generación de especificación Schema.org MedicalBusiness.
 */

export interface DayTimeRange {
  dayName: string;
  dayOfWeekSchema: string[]; // e.g. ["Monday", "Tuesday", ...]
  opens: string; // "09:00"
  closes: string; // "18:00"
  isClosed: boolean;
  rawText: string;
}

export interface ConsultationStatus {
  isOpen: boolean;
  status: "open" | "opening_soon" | "closed_today" | "closed";
  badgeText: string;
  badgeDetail: string;
  dotColor: "emerald" | "amber" | "rose" | "slate";
  currentDayName: string;
  todayScheduleText: string;
}

/**
 * Parsea un string de horario (ej. "Lunes a Viernes: 09:00 - 18:00" o "09:00 - 18:00")
 */
export function parseTimeRange(text: string): { opens: string; closes: string; isClosed: boolean } {
  if (!text) return { opens: "09:00", closes: "18:00", isClosed: true };
  
  const lower = text.toLowerCase();
  if (lower.includes("cerrado") || lower.includes("no atiende") || lower.includes("sin atención")) {
    return { opens: "", closes: "", isClosed: true };
  }

  // Buscar horas en formato HH:MM o H:MM (ej. 09:00 - 18:00 o 9:00 a 19:00)
  const timeMatches = text.match(/(\d{1,2}:\d{2})/g);
  if (timeMatches && timeMatches.length >= 2) {
    const opens = timeMatches[0].padStart(5, "0");
    const closes = timeMatches[1].padStart(5, "0");
    return { opens, closes, isClosed: false };
  }

  // Buscar números enteros (ej. 9 a 18 o 9 - 18)
  const hourMatches = text.match(/(\d{1,2})\s*(?:am|pm)?\s*(?:-|a|hasta|to)\s*(\d{1,2})/i);
  if (hourMatches && hourMatches.length >= 3) {
    let h1 = parseInt(hourMatches[1], 10);
    let h2 = parseInt(hourMatches[2], 10);
    // Si la hora de cierre es menor a 12 pero es tarde (ej. 9 a 6 -> 18)
    if (h2 < 8) h2 += 12;
    return {
      opens: `${String(h1).padStart(2, "0")}:00`,
      closes: `${String(h2).padStart(2, "0")}:00`,
      isClosed: false
    };
  }

  return { opens: "09:00", closes: "18:00", isClosed: false };
}

/**
 * Convierte hora "HH:MM" a minutos del día para fácil comparación
 */
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Evalúa el estado de atención en tiempo real (Abierto / Cerrado ahora)
 */
export function getLiveConsultationStatus(
  horarios: { semana: string; sabado: string; domingo: string },
  simulatedDate?: Date
): ConsultationStatus {
  const now = simulatedDate || new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const dayNamesSpanish = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const currentDayName = dayNamesSpanish[dayOfWeek];

  let todayText = "";
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    todayText = horarios?.semana || "Lunes a Viernes: 09:00 - 18:00";
  } else if (dayOfWeek === 6) {
    todayText = horarios?.sabado || "Sábado: 09:00 - 14:00";
  } else {
    todayText = horarios?.domingo || "Domingo: Cerrado";
  }

  const { opens, closes, isClosed } = parseTimeRange(todayText);

  if (isClosed || !opens || !closes) {
    // Buscar próximo día de atención
    let nextOpening = "Lunes a las 09:00";
    if (dayOfWeek === 6 && !parseTimeRange(horarios?.domingo || "").isClosed) {
      const dom = parseTimeRange(horarios?.domingo || "");
      nextOpening = `Domingo a las ${dom.opens || "09:00"}`;
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      const sem = parseTimeRange(horarios?.semana || "");
      nextOpening = `Lunes a las ${sem.opens || "09:00"}`;
    }

    return {
      isOpen: false,
      status: "closed_today",
      badgeText: "Cerrado hoy",
      badgeDetail: `Próxima atención: ${nextOpening}`,
      dotColor: "slate",
      currentDayName,
      todayScheduleText: todayText
    };
  }

  const openMinutes = timeToMinutes(opens);
  const closeMinutes = timeToMinutes(closes);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    // Si faltan menos de 45 minutos para cerrar
    if (closeMinutes - currentMinutes <= 45) {
      return {
        isOpen: true,
        status: "open",
        badgeText: "Abierto ahora",
        badgeDetail: `Cierra pronto (${closes})`,
        dotColor: "amber",
        currentDayName,
        todayScheduleText: todayText
      };
    }
    return {
      isOpen: true,
      status: "open",
      badgeText: "Atendiendo ahora",
      badgeDetail: `Abierto hoy hasta las ${closes}`,
      dotColor: "emerald",
      currentDayName,
      todayScheduleText: todayText
    };
  }

  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      status: "opening_soon",
      badgeText: "Abre hoy",
      badgeDetail: `Atención a partir de las ${opens}`,
      dotColor: "amber",
      currentDayName,
      todayScheduleText: todayText
    };
  }

  // Si ya pasó la hora de cierre
  return {
    isOpen: false,
    status: "closed",
    badgeText: "Cerrado por hoy",
    badgeDetail: `Horario regular hoy fue hasta las ${closes}`,
    dotColor: "slate",
    currentDayName,
    todayScheduleText: todayText
  };
}

/**
 * Genera el array de OpeningHoursSpecification para Schema.org
 */
export function generateOpeningHoursSchema(horarios: { semana: string; sabado: string; domingo: string }): any[] {
  const specs: any[] = [];

  // Lunes a Viernes
  const sem = parseTimeRange(horarios?.semana || "");
  if (!sem.isClosed && sem.opens && sem.closes) {
    specs.push({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": sem.opens,
      "closes": sem.closes
    });
  }

  // Sábado
  const sab = parseTimeRange(horarios?.sabado || "");
  if (!sab.isClosed && sab.opens && sab.closes) {
    specs.push({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": sab.opens,
      "closes": sab.closes
    });
  }

  // Domingo
  const dom = parseTimeRange(horarios?.domingo || "");
  if (!dom.isClosed && dom.opens && dom.closes) {
    specs.push({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday"],
      "opens": dom.opens,
      "closes": dom.closes
    });
  }

  // Fallback si todo está vacío
  if (specs.length === 0) {
    specs.push({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    });
  }

  return specs;
}
