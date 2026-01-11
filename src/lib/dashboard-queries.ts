/**
 * Dashboard Query Functions
 *
 * Supabase-basierte Abfragen für das Dashboard
 */

import { supabase } from './supabase';
import { startOfDay, endOfDay, addDays, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
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
 */
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const today = new Date();
  const twoDaysLater = addDays(today, 2);
  const todayStart = startOfDay(today);

  // Parallel queries for performance
  const [activeResult, criticalResult, overdueResult] = await Promise.all([
    // Total active orders
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktiv'),

    // Critical orders (liefertermin within 2 days, including today)
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktiv')
      .gte('liefertermin', todayStart.toISOString())
      .lte('liefertermin', endOfDay(twoDaysLater).toISOString()),

    // Overdue orders (liefertermin before today)
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktiv')
      .lt('liefertermin', todayStart.toISOString()),
  ]);

  // Get average capacity and engpass (calculated from machine capacity)
  const machines = await getMachineCapacityToday();
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
 * Lädt die Auslastung aller Leitmaschinen für heute inkl. Auftragsdetails
 */
export async function getMachineCapacityToday(): Promise<MachineCapacity[]> {
  const today = new Date();
  const dayStart = startOfDay(today).toISOString();
  const dayEnd = endOfDay(today).toISOString();

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
    // Filter Arbeitsgänge für heute
    const tagesArbeit =
      m.Arbeitsgang?.filter((ag: { geplantDatum: string | null }) => {
        if (!ag.geplantDatum) return false;
        return ag.geplantDatum >= dayStart && ag.geplantDatum <= dayEnd;
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
 * Lädt alle kritischen Aufträge (Liefertermin ≤ 2 Tage)
 */
export async function getCriticalOrders(): Promise<CriticalOrder[]> {
  const today = new Date();
  const twoDaysLater = addDays(today, 2);
  const todayStart = startOfDay(today);

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
    .eq('status', 'aktiv')
    .gte('liefertermin', todayStart.toISOString())
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
    const tageUebrig = liefertermin ? differenceInDays(liefertermin, todayStart) : 0;

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
 * Lädt Statistiken für die aktuelle Woche
 */
export async function getWeekStatistics(): Promise<WeekStatistics> {
  const today = new Date();
  const weekStart = startOfWeek(today, { locale: de, weekStartsOn: 1 }); // Montag
  const weekEnd = endOfWeek(today, { locale: de, weekStartsOn: 1 }); // Sonntag

  // Aufträge mit Liefertermin diese Woche
  const { count: auftraegeCount } = await supabase
    .from('Auftrag')
    .select('*', { count: 'exact', head: true })
    .gte('liefertermin', startOfDay(weekStart).toISOString())
    .lte('liefertermin', endOfDay(weekEnd).toISOString());

  // Geplante Maschinenzeit diese Woche (nur Leitmaschinen)
  const { data: arbeitsgaenge } = await supabase
    .from('Arbeitsgang')
    .select(`
      zeitMinuten,
      geplantDatum,
      Maschine!inner(istLeitmaschine)
    `)
    .gte('geplantDatum', startOfDay(weekStart).toISOString())
    .lte('geplantDatum', endOfDay(weekEnd).toISOString())
    .eq('Maschine.istLeitmaschine', true);

  // Anzahl aktiver Leitmaschinen
  const { count: maschinenCount } = await supabase
    .from('Maschine')
    .select('*', { count: 'exact', head: true })
    .eq('istLeitmaschine', true)
    .eq('aktiv', true);

  const gesamtMinuten = arbeitsgaenge?.reduce(
    (sum, ag) => sum + (ag.zeitMinuten || 0),
    0
  ) || 0;

  return {
    auftraegeGesamt: auftraegeCount || 0,
    maschinenStunden: Math.round((gesamtMinuten / 60) * 10) / 10,
    leitmaschinenAnzahl: maschinenCount || 0,
  };
}
