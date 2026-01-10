/**
 * Calendar Query Functions
 *
 * Supabase-basierte Abfragen für den Maschinen-Kalender
 */

import { supabase } from './supabase';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  eachDayOfInterval,
} from 'date-fns';
import { de } from 'date-fns/locale';

// ============================================================
// Types
// ============================================================

export interface DayCapacity {
  date: string; // ISO date string
  dateFormatted: string; // "Mo 13.01."
  dayName: string; // "Mo", "Di", etc.
  auslastung: number; // 0-100+
  gesamtZeit: number; // minutes
  kapazitaet: number; // minutes
  auftragsCount: number; // number of orders
}

export interface MachineWeekCapacity {
  id: number;
  name: string;
  kurzname: string | null;
  kostenstelle: string;
  tageskapazitaet: number;
  days: DayCapacity[];
}

export interface WeekInfo {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  label: string; // "KW 2 / 2026"
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get week info for a given date
 */
export function getWeekInfo(date: Date): WeekInfo {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

  // Get ISO week number
  const weekNumber = getISOWeek(date);
  const year = date.getFullYear();

  return {
    weekNumber,
    year,
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
    label: `KW ${weekNumber} / ${year}`,
  };
}

/**
 * Get ISO week number
 */
function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get the start of a specific week
 */
export function getWeekStart(year: number, weekNumber: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);
  return addDays(firstMonday, (weekNumber - 1) * 7);
}

// ============================================================
// Calendar Query
// ============================================================

/**
 * Lädt die Auslastung aller Leitmaschinen für eine Woche
 */
export async function getMachineCapacityForWeek(
  weekStart: Date
): Promise<MachineWeekCapacity[]> {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekStartISO = startOfDay(weekStart).toISOString();
  const weekEndISO = endOfDay(weekEnd).toISOString();

  // Get all days in the week
  const daysInWeek = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  // Get all Leitmaschinen with their Arbeitsgänge for the week
  const { data: machines, error } = await supabase
    .from('Maschine')
    .select(
      `
      id,
      name,
      kurzname,
      kostenstelle,
      tageskapazitaetMinuten,
      Arbeitsgang(
        zeitMinuten,
        geplantDatum,
        Auftrag(auftragsnummer)
      )
    `
    )
    .eq('istLeitmaschine', true)
    .eq('aktiv', true)
    .order('kostenstelle', { ascending: true });

  if (error || !machines) {
    console.error('Error fetching machine capacity for week:', error);
    return [];
  }

  return machines.map((m) => {
    // Calculate capacity for each day
    const days: DayCapacity[] = daysInWeek.map((day) => {
      const dayStart = startOfDay(day).toISOString();
      const dayEnd = endOfDay(day).toISOString();

      // Filter Arbeitsgänge for this day
      const tagesArbeit =
        m.Arbeitsgang?.filter((ag: { geplantDatum: string | null }) => {
          if (!ag.geplantDatum) return false;
          return ag.geplantDatum >= dayStart && ag.geplantDatum <= dayEnd;
        }) || [];

      // Count unique orders
      const uniqueOrders = new Set(
        tagesArbeit
          .map((ag: { Auftrag: { auftragsnummer: string } | { auftragsnummer: string }[] | null }) => {
            const auftrag = ag.Auftrag;
            if (!auftrag) return null;
            // Handle both single object and array (Supabase may return either)
            if (Array.isArray(auftrag)) {
              return auftrag[0]?.auftragsnummer;
            }
            return auftrag.auftragsnummer;
          })
          .filter(Boolean)
      );

      // Sum up time
      const gesamtZeit = tagesArbeit.reduce(
        (sum: number, ag: { zeitMinuten: number | null }) =>
          sum + (ag.zeitMinuten || 0),
        0
      );

      const auslastung = (gesamtZeit / m.tageskapazitaetMinuten) * 100;

      return {
        date: day.toISOString(),
        dateFormatted: format(day, 'EEE dd.MM.', { locale: de }),
        dayName: format(day, 'EEEEEE', { locale: de }), // Mo, Di, Mi, etc.
        auslastung: Math.round(auslastung * 10) / 10,
        gesamtZeit: Math.round(gesamtZeit),
        kapazitaet: m.tageskapazitaetMinuten,
        auftragsCount: uniqueOrders.size,
      };
    });

    return {
      id: m.id,
      name: m.name,
      kurzname: m.kurzname,
      kostenstelle: m.kostenstelle || '',
      tageskapazitaet: m.tageskapazitaetMinuten,
      days,
    };
  });
}

/**
 * Lädt die Aufträge für eine bestimmte Maschine an einem bestimmten Tag
 */
export async function getMachineOrdersForDay(
  machineId: number,
  date: Date
): Promise<
  {
    auftragsnummer: string;
    kunde: string;
    produkttyp: string | null;
    zeitMinuten: number;
  }[]
> {
  const dayStart = startOfDay(date).toISOString();
  const dayEnd = endOfDay(date).toISOString();

  const { data: arbeitsgaenge, error } = await supabase
    .from('Arbeitsgang')
    .select(
      `
      zeitMinuten,
      Auftrag(
        auftragsnummer,
        produkttyp,
        Kunde(firma, name)
      )
    `
    )
    .eq('maschineId', machineId)
    .gte('geplantDatum', dayStart)
    .lte('geplantDatum', dayEnd);

  if (error || !arbeitsgaenge) {
    console.error('Error fetching machine orders:', error);
    return [];
  }

  // Aggregate by order
  const orderMap = new Map<
    string,
    {
      auftragsnummer: string;
      kunde: string;
      produkttyp: string | null;
      zeitMinuten: number;
    }
  >();

  for (const ag of arbeitsgaenge) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawAuftrag = ag.Auftrag as any;
    if (!rawAuftrag) continue;

    // Handle array or single object from Supabase
    const auftragData = Array.isArray(rawAuftrag) ? rawAuftrag[0] : rawAuftrag;
    if (!auftragData) continue;

    // Handle Kunde nested relation
    const kundeData = Array.isArray(auftragData.Kunde)
      ? auftragData.Kunde[0]
      : auftragData.Kunde;

    const key = auftragData.auftragsnummer;
    const existing = orderMap.get(key);
    const zeit = ag.zeitMinuten || 0;

    if (existing) {
      existing.zeitMinuten += zeit;
    } else {
      orderMap.set(key, {
        auftragsnummer: auftragData.auftragsnummer,
        kunde: kundeData?.firma || kundeData?.name || '–',
        produkttyp: auftragData.produkttyp,
        zeitMinuten: zeit,
      });
    }
  }

  return Array.from(orderMap.values());
}
