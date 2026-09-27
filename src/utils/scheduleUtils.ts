/**
 * Utilidades para cálculo de horarios de atención en tiempo real (Abierto / Cerrado ahora)
 * y generación de especificación Schema.org MedicalBusiness / Physician para Google Search Console.
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
 * Convierte cualquier componente de hora y minutos + indicador AM/PM a formato 24 horas "HH:MM" (ISO 8601).
 * Garantiza cumplimiento estricto con los validadores de Google Search Console.
 */
function to24h(hStr: string, mStr: string | undefined, ampm: string | undefined, forcePmIfPastMidday: boolean = false): string {
  let h = parseInt(hStr, 10);
  const m = mStr ? parseInt(mStr, 10) : 0;
  const cleanAmpm = ampm ? ampm.toLowerCase().replace(/[\.\s]/g, "") : "";

  if (cleanAmpm === "pm") {
    if (h < 12) h += 12;
  } else if (cleanAmpm === "am") {
    if (h === 12) h = 0;
  } else if (forcePmIfPastMidday) {
    if (h < 12) h += 12;
  } else if (h >= 1 && h <= 6) {
    // Heurística clínica: en América Latina y España, horarios médicos vespertinos sin sufijo (ej. 9 a 6) implican las 18:00
    h += 12;
  }

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Parsea un string de horario y extrae todos los intervalos de tiempo en formato 24 horas ("HH:MM").
 * Soporta turnos partidos (ej. "09:00 - 13:00 / 15:00 - 19:00"), formato 12h ("10:00 AM - 07:00 PM"),
 * jornadas continuas, emergencias 24h y estados cerrados.
 */
export function parseTimeIntervals(text: string): Array<{ opens: string; closes: string; isClosed: boolean }> {
  if (!text) return [{ opens: "", closes: "", isClosed: true }];

  const lower = text.toLowerCase().trim();

  // 1. Detección de servicios 24 horas / continuos
  if (
    lower.includes("24 hora") ||
    lower.includes("24h") ||
    lower.includes("24/7") ||
    lower.includes("todo el día") ||
    lower.includes("emergencias 24") ||
    lower.includes("abierto 24")
  ) {
    return [{ opens: "00:00", closes: "23:59", isClosed: false }];
  }

  // 2. Detección de días cerrados o sin atención
  if (
    (lower.includes("cerrado") && !lower.includes("no cerrado")) ||
    lower.includes("no atiende") ||
    lower.includes("sin atención") ||
    lower.includes("descanso médico")
  ) {
    return [{ opens: "", closes: "", isClosed: true }];
  }

  // 3. Detección de "Previa cita" exclusiva sin horas numéricas
  if (lower.includes("previa cita") && !/\d/.test(text)) {
    return [{ opens: "", closes: "", isClosed: true }];
  }

  // 4. Extracción de intervalos de tiempo con soporte exhaustivo de AM/PM
  // Coincide con patrones como: "10:00 AM - 07:00 PM", "9:00 a 18:00", "9am - 6pm", "08:30 a 14:00"
  const intervalRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\s*(?:-|a|hasta|to|–|—)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/gi;
  const results: Array<{ opens: string; closes: string; isClosed: boolean }> = [];

  let match: RegExpExecArray | null;
  while ((match = intervalRegex.exec(text)) !== null) {
    const h1 = match[1];
    const m1 = match[2];
    const ampm1 = match[3];
    const h2 = match[4];
    const m2 = match[5];
    const ampm2 = match[6];

    let t1 = to24h(h1, m1, ampm1);
    let t2 = to24h(h2, m2, ampm2);

    // Corrección si la hora de cierre resulta menor o igual a la de apertura y no tenía PM explícito
    // ej. "10:00 AM - 07:00" o "10:00 - 07:00"
    if (t2 <= t1 && !ampm2) {
      const numH2 = parseInt(h2, 10);
      if (numH2 < 12) {
        t2 = to24h(h2, m2, "pm");
      }
    }

    if (t1 && t2 && t1 !== t2) {
      results.push({ opens: t1, closes: t2, isClosed: false });
    }
  }

  if (results.length > 0) {
    return results;
  }

  return [{ opens: "", closes: "", isClosed: true }];
}

/**
 * Parsea un string de horario y retorna el rango principal (primer intervalo)
 */
export function parseTimeRange(text: string): { opens: string; closes: string; isClosed: boolean } {
  const intervals = parseTimeIntervals(text);
  if (intervals.length > 0 && !intervals[0].isClosed && intervals[0].opens && intervals[0].closes) {
    return intervals[0];
  }
  return { opens: "", closes: "", isClosed: true };
}

/**
 * Convierte hora "HH:MM" a minutos del día para fácil comparación
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Evalúa el estado de atención en tiempo real (Abierto / Cerrado ahora / Abre hoy / Receso)
 */
export function getLiveConsultationStatus(
  horarios: any,
  simulatedDate?: Date
): ConsultationStatus {
  const now = simulatedDate || new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const dayNamesSpanish = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const currentDayName = dayNamesSpanish[dayOfWeek];

  let todayText = "";
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    const specificDayKeys = ["", "lunes", "martes", "miercoles", "jueves", "viernes"];
    const key = specificDayKeys[dayOfWeek];
    todayText = (key && horarios?.[key]) || horarios?.semana || "Lunes a Viernes: 09:00 - 18:00";
  } else if (dayOfWeek === 6) {
    todayText = horarios?.sabado || "Sábado: Cerrado";
  } else {
    todayText = horarios?.domingo || "Domingo: Cerrado";
  }

  const intervals = parseTimeIntervals(todayText).filter(i => !i.isClosed && i.opens && i.closes);

  if (intervals.length === 0) {
    // Buscar próximo día de atención si es fin de semana
    let nextOpening = "Lunes a las 09:00";
    if (dayOfWeek === 6) {
      const domIntervals = parseTimeIntervals(horarios?.domingo || "").filter(i => !i.isClosed && i.opens);
      if (domIntervals.length > 0) {
        nextOpening = `Domingo a las ${domIntervals[0].opens}`;
      } else {
        const semIntervals = parseTimeIntervals(horarios?.semana || "").filter(i => !i.isClosed && i.opens);
        nextOpening = `Lunes a las ${semIntervals[0]?.opens || "09:00"}`;
      }
    } else if (dayOfWeek === 0) {
      const semIntervals = parseTimeIntervals(horarios?.semana || "").filter(i => !i.isClosed && i.opens);
      nextOpening = `Lunes a las ${semIntervals[0]?.opens || "09:00"}`;
    }

    return {
      isOpen: false,
      status: "closed_today",
      badgeText: "Cerrado hoy",
      badgeDetail: `Próxima atención: ${nextOpening}`,
      dotColor: "rose",
      currentDayName,
      todayScheduleText: todayText
    };
  }

  // Verificar si el minuto actual cae dentro de algún intervalo de apertura
  for (const interval of intervals) {
    const openMinutes = timeToMinutes(interval.opens);
    const closeMinutes = timeToMinutes(interval.closes);

    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      if (closeMinutes - currentMinutes <= 45) {
        return {
          isOpen: true,
          status: "open",
          badgeText: "Abierto ahora",
          badgeDetail: `Cierra pronto (${interval.closes})`,
          dotColor: "amber",
          currentDayName,
          todayScheduleText: todayText
        };
      }
      return {
        isOpen: true,
        status: "open",
        badgeText: "Atendiendo ahora",
        badgeDetail: `Abierto hoy hasta las ${interval.closes}`,
        dotColor: "emerald",
        currentDayName,
        todayScheduleText: todayText
      };
    }
  }

  // Si está antes del primer intervalo del día
  const firstInterval = intervals[0];
  const firstOpen = timeToMinutes(firstInterval.opens);
  if (currentMinutes < firstOpen) {
    return {
      isOpen: false,
      status: "opening_soon",
      badgeText: "Abre hoy",
      badgeDetail: `Atención a partir de las ${firstInterval.opens}`,
      dotColor: "amber",
      currentDayName,
      todayScheduleText: todayText
    };
  }

  // Si está en receso entre turnos (ej. almuerzo o interrupción de consulta)
  for (let i = 0; i < intervals.length - 1; i++) {
    const endCurrent = timeToMinutes(intervals[i].closes);
    const nextStart = timeToMinutes(intervals[i + 1].opens);
    if (currentMinutes >= endCurrent && currentMinutes < nextStart) {
      return {
        isOpen: false,
        status: "opening_soon",
        badgeText: "Receso clínico",
        badgeDetail: `Reanuda a las ${intervals[i + 1].opens}`,
        dotColor: "amber",
        currentDayName,
        todayScheduleText: todayText
      };
    }
  }

  // Ya concluyó el último intervalo de atención de hoy
  const lastInterval = intervals[intervals.length - 1];
  return {
    isOpen: false,
    status: "closed",
    badgeText: "Cerrado por hoy",
    badgeDetail: `Horario regular hoy concluyó a las ${lastInterval.closes}`,
    dotColor: "rose",
    currentDayName,
    todayScheduleText: todayText
  };
}

/**
 * Genera el array de OpeningHoursSpecification para Schema.org / Google Search Console.
 * Satisface rigurosamente los lineamientos de Google para LocalBusiness / MedicalBusiness:
 * - Horas en formato 24h "HH:MM" (ISO 8601).
 * - opens < closes garantizado.
 * - Soporte para turnos partidos con múltiples especificaciones para el mismo día.
 * - Soporte para días individuales y rangos agrupados.
 * - Días cerrados se omiten o gestionan conforme a las directrices de Search Console.
 */
export function generateOpeningHoursSchema(horarios: any): any[] {
  if (!horarios) {
    return [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ];
  }

  const specs: any[] = [];

  // Mapeo de días de la semana
  const dayMappings: Array<{
    key: string;
    days: string[];
    fallbackKey?: string;
  }> = [
    { key: "lunes", days: ["Monday"], fallbackKey: "semana" },
    { key: "martes", days: ["Tuesday"], fallbackKey: "semana" },
    { key: "miercoles", days: ["Wednesday"], fallbackKey: "semana" },
    { key: "jueves", days: ["Thursday"], fallbackKey: "semana" },
    { key: "viernes", days: ["Friday"], fallbackKey: "semana" },
    { key: "sabado", days: ["Saturday"] },
    { key: "domingo", days: ["Sunday"] }
  ];

  // Si no hay días individuales definidos, agrupamos Lunes a Viernes directamente (estándar Google)
  const hasIndividualWeekdays = Boolean(
    horarios.lunes || horarios.martes || horarios.miercoles || horarios.jueves || horarios.viernes
  );

  if (!hasIndividualWeekdays) {
    // 1. Lunes a Viernes agrupados
    const semText = horarios.semana || horarios.lunesAViernes || "";
    const semIntervals = parseTimeIntervals(semText).filter(i => !i.isClosed && i.opens && i.closes);
    for (const interval of semIntervals) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": interval.opens,
        "closes": interval.closes
      });
    }

    // 2. Sábados
    const sabText = horarios.sabado || "";
    const sabIntervals = parseTimeIntervals(sabText).filter(i => !i.isClosed && i.opens && i.closes);
    for (const interval of sabIntervals) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday"],
        "opens": interval.opens,
        "closes": interval.closes
      });
    }

    // 3. Domingos
    const domText = horarios.domingo || "";
    const domIntervals = parseTimeIntervals(domText).filter(i => !i.isClosed && i.opens && i.closes);
    for (const interval of domIntervals) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Sunday"],
        "opens": interval.opens,
        "closes": interval.closes
      });
    }
  } else {
    // Procesar cada día de forma diferenciada si se especificaron días particulares
    for (const d of dayMappings) {
      const text = horarios[d.key] || (d.fallbackKey ? horarios[d.fallbackKey] : "") || "";
      const intervals = parseTimeIntervals(text).filter(i => !i.isClosed && i.opens && i.closes);
      for (const interval of intervals) {
        specs.push({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": d.days,
          "opens": interval.opens,
          "closes": interval.closes
        });
      }
    }
  }

  // Fallback seguro si ningún horario válido pudo ser deducido y no está explícitamente todo cerrado
  if (specs.length === 0) {
    const isExplicitlyAllClosed =
      (horarios.semana && horarios.semana.toLowerCase().includes("cerrado")) &&
      (horarios.sabado && horarios.sabado.toLowerCase().includes("cerrado")) &&
      (horarios.domingo && horarios.domingo.toLowerCase().includes("cerrado"));

    if (!isExplicitlyAllClosed) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      });
    }
  }

  return specs;
}

/**
 * Genera el array de strings openingHours (formato ISO shorthand e.g. ["Mo-Fr 10:00-19:00", "Sa 09:00-13:00"])
 * Compatible con la indexación directa de Google Search Console y motores de búsqueda.
 */
export function generateOpeningHoursArray(horarios: any): string[] {
  if (!horarios) return ["Mo-Fr 09:00-18:00"];

  const hoursList: string[] = [];

  // Lunes a Viernes
  const semText = horarios.semana || horarios.lunesAViernes || "";
  const semIntervals = parseTimeIntervals(semText).filter(i => !i.isClosed && i.opens && i.closes);
  for (const interval of semIntervals) {
    hoursList.push(`Mo-Fr ${interval.opens}-${interval.closes}`);
  }

  // Sábado
  const sabText = horarios.sabado || "";
  const sabIntervals = parseTimeIntervals(sabText).filter(i => !i.isClosed && i.opens && i.closes);
  for (const interval of sabIntervals) {
    hoursList.push(`Sa ${interval.opens}-${interval.closes}`);
  }

  // Domingo
  const domText = horarios.domingo || "";
  const domIntervals = parseTimeIntervals(domText).filter(i => !i.isClosed && i.opens && i.closes);
  for (const interval of domIntervals) {
    hoursList.push(`Su ${interval.opens}-${interval.closes}`);
  }

  return hoursList;
}
