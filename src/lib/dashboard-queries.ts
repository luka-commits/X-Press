/**
 * Dashboard Query Functions
 *
 * Supabase-basierte Abfragen für das Dashboard
 */

import { supabase } from './supabase';
import { startOfDay, endOfDay, addDays, differenceInDays, startOfWeek, endOfWeek, format } from 'date-fns';
import { de } from 'date-fns/locale';

// ============================================================
// Types
// ============================================================

export interface DashboardKPIs {
  total: number;
  critical: number;
  overdue: number;
  avgCapacity: number;
  engpass: {
    name: string;
    auslastung: number;
  } | null;
}

export interface MachineOrder {
  auftragsnummer: string;
  kunde: string;
  produkttyp: string | null;
  zeitMinuten: number;
}

export interface MachineCapacity {
  id: number;
  name: string;
  kurzname: string | null;
  kostenstelle: string;
  auslastung: number;
  gesamtZeit: number;
  kapazitaet: number;
  auftraege: MachineOrder[];
}

export interface CriticalOrder {
  auftragsnummer: string;
  kunde: string;
  produkttyp: string | null;
  liefertermin: string;
  tageUebrig: number;
}

// KPIOrderItem is an alias for CriticalOrder - same shape used for all KPI detail lists
export type KPIOrderItem = CriticalOrder;

export interface WeekStatistics {
  auftraegeGesamt: number;
  maschinenStunden: number;
  leitmaschinenAnzahl: number;
}

// ============================================================
// KPI Queries
// ============================================================

/**
 * Lädt alle KPIs für das Dashboard
 * @param date - Referenzdatum für die Berechnung (Default: heute)
 */
export async function getDashboardKPIs(date: Date = new Date()): Promise<DashboardKPIs> {
  const referenceDate = date;
  const twoDaysLater = addDays(referenceDate, 2);
  const dateStart = startOfDay(referenceDate);

  // Parallel queries for performance
  const [activeResult, criticalResult, overdueResult] = await Promise.all([
    // Total open orders (not yet shipped)
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .neq('versandStatus', 'versendet'),

    // Critical orders (liefertermin within 2 days from reference date)
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .neq('versandStatus', 'versendet')
      .gte('liefertermin', dateStart.toISOString())
      .lte('liefertermin', endOfDay(twoDaysLater).toISOString()),

    // Overdue orders (liefertermin before reference date)
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .neq('versandStatus', 'versendet')
      .lt('liefertermin', dateStart.toISOString()),
  ]);

  // Get average capacity and engpass (calculated from machine capacity)
  const machines = await getMachineCapacityForDate(referenceDate);
  const avgCapacity =
    machines.length > 0
      ? Math.round(machines.reduce((sum, m) => sum + m.auslastung, 0) / machines.length)
      : 0;

  // Find engpass (machine with highest utilization)
  const engpassMachine = machines.length > 0
    ? machines.reduce((max, m) => m.auslastung > max.auslastung ? m : max, machines[0])
    : null;

  return {
    total: activeResult.count || 0,
    critical: criticalResult.count || 0,
    overdue: overdueResult.count || 0,
    avgCapacity,
    engpass: engpassMachine ? {
      name: engpassMachine.kurzname || engpassMachine.name,
      auslastung: engpassMachine.auslastung,
    } : null,
  };
}

// ============================================================
// Machine Capacity Query
// ============================================================

/**
 * Lädt die Auslastung aller Leitmaschinen für ein Datum inkl. Auftragsdetails
 * @param date - Das Datum für die Abfrage (Default: heute)
 */
export async function getMachineCapacityForDate(date: Date = new Date()): Promise<MachineCapacity[]> {
  // Use date-only format for comparison (avoids timezone issues)
  // DB stores dates as "2026-01-10T00:00:00" without timezone
  const dateStr = format(date, 'yyyy-MM-dd');

  // Get all Leitmaschinen with their Arbeitsgänge and related Aufträge
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
        Auftrag(
          auftragsnummer,
          produkttyp,
          Kunde(firma, name)
        )
      )
    `
    )
    .eq('istLeitmaschine', true)
    .eq('aktiv', true)
    .order('kostenstelle', { ascending: true });

  if (error || !machines) {
    console.error('Error fetching machine capacity:', error);
    return [];
  }

  return machines.map((m) => {
    // Filter Arbeitsgänge für das gewählte Datum by comparing date part only
    const tagesArbeit =
      m.Arbeitsgang?.filter((ag: { geplantDatum: string | null }) => {
        if (!ag.geplantDatum) return false;
        // Extract date part from geplantDatum (e.g., "2026-01-10" from "2026-01-10T00:00:00")
        const agDateStr = ag.geplantDatum.substring(0, 10);
        return agDateStr === dateStr;
      }) || [];

    // Aggregate orders - group by Auftragsnummer and sum time
    const orderMap = new Map<string, MachineOrder>();

    for (const ag of tagesArbeit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawAuftrag = (ag as any).Auftrag;
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
      const zeit = (ag as { zeitMinuten: number | null }).zeitMinuten || 0;

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

    const auftraege = Array.from(orderMap.values());
    const gesamtZeit = auftraege.reduce((sum, o) => sum + o.zeitMinuten, 0);
    const auslastung = (gesamtZeit / m.tageskapazitaetMinuten) * 100;

    return {
      id: m.id,
      name: m.name,
      kurzname: m.kurzname,
      kostenstelle: m.kostenstelle || '',
      auslastung: Math.round(auslastung * 10) / 10,
      gesamtZeit,
      kapazitaet: m.tageskapazitaetMinuten,
      auftraege,
    };
  });
}

// ============================================================
// Critical Orders Query
// ============================================================

/**
 * Lädt alle kritischen Aufträge (Liefertermin ≤ 2 Tage vom Referenzdatum)
 * @param date - Referenzdatum (Default: heute)
 */
export async function getCriticalOrders(date: Date = new Date()): Promise<CriticalOrder[]> {
  const referenceDate = date;
  const twoDaysLater = addDays(referenceDate, 2);
  const dateStart = startOfDay(referenceDate);

  const { data, error } = await supabase
    .from('Auftrag')
    .select(
      `
      auftragsnummer,
      produkttyp,
      liefertermin,
      Kunde(firma, name)
    `
    )
    .neq('versandStatus', 'versendet')
    .gte('liefertermin', dateStart.toISOString())
    .lte('liefertermin', endOfDay(twoDaysLater).toISOString())
    .order('liefertermin', { ascending: true });

  if (error || !data) {
    console.error('Error fetching critical orders:', error);
    return [];
  }

  return data.map((order) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawKunde = order.Kunde as any;
    const kunde = Array.isArray(rawKunde) ? rawKunde[0] : rawKunde;
    const liefertermin = order.liefertermin ? new Date(order.liefertermin) : null;
    const tageUebrig = liefertermin ? differenceInDays(liefertermin, dateStart) : 0;

    return {
      auftragsnummer: order.auftragsnummer,
      kunde: kunde?.firma || kunde?.name || '–',
      produkttyp: order.produkttyp,
      liefertermin: order.liefertermin || '',
      tageUebrig,
    };
  });
}

// ============================================================
// Open Orders Query (for KPI Detail: "Offene Aufträge")
// ============================================================

/**
 * Lädt alle offenen Aufträge (nicht versendet)
 * @param date - Referenzdatum für tageUebrig-Berechnung (Default: heute)
 */
export async function getOpenOrders(date: Date = new Date()): Promise<KPIOrderItem[]> {
  const referenceDate = date;
  const dateStart = startOfDay(referenceDate);

  const { data, error } = await supabase
    .from('Auftrag')
    .select(
      `
      auftragsnummer,
      produkttyp,
      liefertermin,
      Kunde(firma, name)
    `
    )
    .neq('versandStatus', 'versendet')
    .order('liefertermin', { ascending: true });

  if (error || !data) {
    console.error('Error fetching open orders:', error);
    return [];
  }

  return data.map((order) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawKunde = order.Kunde as any;
    const kunde = Array.isArray(rawKunde) ? rawKunde[0] : rawKunde;
    const liefertermin = order.liefertermin ? new Date(order.liefertermin) : null;
    const tageUebrig = liefertermin ? differenceInDays(liefertermin, dateStart) : 0;

    return {
      auftragsnummer: order.auftragsnummer,
      kunde: kunde?.firma || kunde?.name || '–',
      produkttyp: order.produkttyp,
      liefertermin: order.liefertermin || '',
      tageUebrig,
    };
  });
}

// ============================================================
// Overdue Orders Query (for KPI Detail: "Überfällig")
// ============================================================

/**
 * Lädt alle überfälligen Aufträge (Liefertermin vor Referenzdatum, nicht versendet)
 * @param date - Referenzdatum (Default: heute)
 */
export async function getOverdueOrders(date: Date = new Date()): Promise<KPIOrderItem[]> {
  const referenceDate = date;
  const dateStart = startOfDay(referenceDate);

  const { data, error } = await supabase
    .from('Auftrag')
    .select(
      `
      auftragsnummer,
      produkttyp,
      liefertermin,
      Kunde(firma, name)
    `
    )
    .neq('versandStatus', 'versendet')
    .lt('liefertermin', dateStart.toISOString())
    .order('liefertermin', { ascending: true });

  if (error || !data) {
    console.error('Error fetching overdue orders:', error);
    return [];
  }

  return data.map((order) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawKunde = order.Kunde as any;
    const kunde = Array.isArray(rawKunde) ? rawKunde[0] : rawKunde;
    const liefertermin = order.liefertermin ? new Date(order.liefertermin) : null;
    const tageUebrig = liefertermin ? differenceInDays(liefertermin, dateStart) : 0;

    return {
      auftragsnummer: order.auftragsnummer,
      kunde: kunde?.firma || kunde?.name || '–',
      produkttyp: order.produkttyp,
      liefertermin: order.liefertermin || '',
      tageUebrig,
    };
  });
}

// ============================================================
// Week Statistics Query
// ============================================================

/**
 * Lädt Statistiken für eine Woche
 * @param weekStartDate - Wochenstart (Montag) - Default: aktuelle Woche
 */
export async function getWeekStatistics(weekStartDate?: Date): Promise<WeekStatistics> {
  const referenceDate = weekStartDate || new Date();
  const weekStart = startOfWeek(referenceDate, { locale: de, weekStartsOn: 1 }); // Montag
  const weekEnd = endOfWeek(referenceDate, { locale: de, weekStartsOn: 1 }); // Sonntag

  // Parallel queries for better performance
  const [arbeitsgaengeResult, maschinenResult] = await Promise.all([
    // Geplante Arbeitsgänge diese Woche (nur Leitmaschinen) - mit Auftrags-IDs
    supabase
      .from('Arbeitsgang')
      .select(`
        zeitMinuten,
        geplantDatum,
        auftragId,
        Maschine!inner(istLeitmaschine)
      `)
      .gte('geplantDatum', startOfDay(weekStart).toISOString())
      .lte('geplantDatum', endOfDay(weekEnd).toISOString())
      .eq('Maschine.istLeitmaschine', true),

    // Anzahl aktiver Leitmaschinen
    supabase
      .from('Maschine')
      .select('*', { count: 'exact', head: true })
      .eq('istLeitmaschine', true)
      .eq('aktiv', true),
  ]);

  const arbeitsgaenge = arbeitsgaengeResult.data;
  const maschinenCount = maschinenResult.count;

  // Zähle eindeutige Aufträge basierend auf geplantDatum (nicht Liefertermin)
  const uniqueAuftraege = new Set(
    arbeitsgaenge?.map(ag => ag.auftragId).filter(Boolean) || []
  );

  const gesamtMinuten = arbeitsgaenge?.reduce(
    (sum, ag) => sum + (ag.zeitMinuten || 0),
    0
  ) || 0;

  return {
    auftraegeGesamt: uniqueAuftraege.size,
    maschinenStunden: Math.round((gesamtMinuten / 60) * 10) / 10,
    leitmaschinenAnzahl: maschinenCount || 0,
  };
}
