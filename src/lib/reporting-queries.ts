import { startOfDay, addDays, differenceInDays, endOfDay } from 'date-fns';

import type { KPIOrderItem } from './dashboard-queries';
import { supabase } from './supabase';

// Re-export KPIOrderItem for convenience
export type { KPIOrderItem } from './dashboard-queries';

export interface FunnelStage {
  name: string;
  value: number;
  fill: string;
}

export interface FunnelData {
  stages: FunnelStage[];
  totalValue: number;
  trend: number;
}

/**
 * Calculates the Production Funnel metrics using real-time order data.
 * Uses the same pipeline stages as the Auftragsliste:
 * - Offen: No istStatus set
 * - In Produktion: istStatus = 'in_produktion'
 * - Fertig: istStatus = 'fertig'
 * - Versandbereit: versandStatus = 'versandbereit'
 * - Versendet: versandStatus = 'versendet'
 * - Problem: istStatus = 'problem'
 */
export async function getFunnelData(): Promise<FunnelData> {
  const { data: orders, error } = await supabase
    .from('Auftrag')
    .select(
      `
            auftragsnummer,
            status,
            istStatus,
            versandStatus
        `
    )
    .eq('status', 'aktiv');

  if (error || !orders) {
    console.error('Error fetching funnel data:', error);
    return { stages: [], totalValue: 0, trend: 0 };
  }

  // Initialize counters matching Auftragsliste pipeline
  let countOffen = 0;
  let countInProduktion = 0;
  let countFertig = 0;
  let countVersandbereit = 0;
  let countVersendet = 0;
  let countProblem = 0;

  // Categorize orders using same logic as OrderTable.getPipelineBadge()
  for (const order of orders) {
    // Problem overrides everything
    if (order.istStatus === 'problem') {
      countProblem++;
      continue;
    }

    // Versand phases (later pipeline stages)
    if (order.versandStatus === 'versendet') {
      countVersendet++;
      continue;
    }

    if (order.versandStatus === 'versandbereit') {
      countVersandbereit++;
      continue;
    }

    // Production phases
    if (order.istStatus === 'fertig') {
      countFertig++;
      continue;
    }

    if (order.istStatus === 'in_produktion') {
      countInProduktion++;
      continue;
    }

    // Default: Offen (nothing started)
    countOffen++;
  }

  const countTotal = orders.length;

  // Colors matching OrderTable badges
  const stages: FunnelStage[] = [
    { name: 'Offen', value: countOffen, fill: '#737373' }, // neutral-500
    { name: 'In Produktion', value: countInProduktion, fill: '#F59E0B' }, // amber-500
    { name: 'Fertig', value: countFertig, fill: '#22C55E' }, // green-500
    { name: 'Versandbereit', value: countVersandbereit, fill: '#A855F7' }, // purple-500
    { name: 'Versendet', value: countVersendet, fill: '#3B82F6' }, // blue-500
  ];

  // Add Problem count if > 0 (separate indicator)
  if (countProblem > 0) {
    stages.push({ name: 'Problem', value: countProblem, fill: '#EF4444' }); // red-500
  }

  return {
    stages,
    totalValue: countTotal,
    trend: 0, // TODO: Calculate real trend from historical data
  };
}

/**
 * Stage Distribution for Pie Chart
 * Returns all pipeline stages for the Donut view (exclusive stages)
 */
export async function getStageDistribution() {
  const funnel = await getFunnelData();

  return {
    data: funnel.stages,
    total: funnel.totalValue,
  };
}

/**
 * CUMULATIVE Funnel Data - each stage counts orders that have
 * REACHED that milestone or beyond.
 *
 * Pipeline progression: Offen → In Produktion → Fertig → Versandbereit → Versendet
 *
 * Cumulative counts (each includes all orders from later stages):
 * - "In Produktion": Orders in in_produktion, fertig, versandbereit, or versendet
 * - "Fertig": Orders in fertig, versandbereit, or versendet
 * - "Versandbereit": Orders in versandbereit or versendet
 * - "Versendet": Orders in versendet only
 * - "Offen": Orders that haven't started (no progression yet) - NOT cumulative
 * - "Problem": Orders with issues (separate track)
 */
export async function getCumulativeFunnelData(): Promise<FunnelData> {
  const { data: orders, error } = await supabase
    .from('Auftrag')
    .select(
      `
            auftragsnummer,
            status,
            istStatus,
            versandStatus
        `
    )
    .eq('status', 'aktiv');

  if (error || !orders) {
    console.error('Error fetching cumulative funnel data:', error);
    return { stages: [], totalValue: 0, trend: 0 };
  }

  // Count orders at each checkpoint (cumulative)
  let countOffen = 0;
  let countInProduktion = 0; // Started production or beyond
  let countFertig = 0; // Finished production or beyond
  let countVersandbereit = 0; // Ready for shipping or shipped
  let countVersendet = 0; // Shipped
  let countProblem = 0;

  for (const order of orders) {
    // Problem is a separate track
    if (order.istStatus === 'problem') {
      countProblem++;
      continue;
    }

    // Check progression level
    const hasStartedProduction =
      order.istStatus === 'in_produktion' ||
      order.istStatus === 'fertig' ||
      order.versandStatus === 'versandbereit' ||
      order.versandStatus === 'versendet';

    const hasFinishedProduction =
      order.istStatus === 'fertig' ||
      order.versandStatus === 'versandbereit' ||
      order.versandStatus === 'versendet';

    const isReadyForShipping =
      order.versandStatus === 'versandbereit' || order.versandStatus === 'versendet';

    const hasShipped = order.versandStatus === 'versendet';

    // Cumulative counting - add to all applicable milestones
    if (hasShipped) {
      countVersendet++;
    }
    if (isReadyForShipping) {
      countVersandbereit++;
    }
    if (hasFinishedProduction) {
      countFertig++;
    }
    if (hasStartedProduction) {
      countInProduktion++;
    }
    if (!hasStartedProduction) {
      countOffen++;
    }
  }

  const countTotal = orders.length;

  // Build stages array - cumulative values
  const stages: FunnelStage[] = [
    { name: 'Offen', value: countOffen, fill: '#737373' },
    { name: 'In Produktion', value: countInProduktion, fill: '#F59E0B' },
    { name: 'Fertig', value: countFertig, fill: '#22C55E' },
    { name: 'Versandbereit', value: countVersandbereit, fill: '#A855F7' },
    { name: 'Versendet', value: countVersendet, fill: '#3B82F6' },
  ];

  // Add Problem count if > 0 (separate indicator)
  if (countProblem > 0) {
    stages.push({ name: 'Problem', value: countProblem, fill: '#EF4444' });
  }

  return {
    stages,
    totalValue: countTotal,
    trend: 0,
  };
}

// ============================================================
// Reports KPI Order List Queries
// ============================================================

/**
 * Helper to map order data to KPIOrderItem
 */
function mapOrderToKPIItem(
  order: {
    auftragsnummer: string;
    produkttyp: string | null;
    liefertermin: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kunde: any;
  },
  referenceDate: Date
): KPIOrderItem {
  const rawKunde = order.Kunde;
  const kunde = Array.isArray(rawKunde) ? rawKunde[0] : rawKunde;
  const liefertermin = order.liefertermin ? new Date(order.liefertermin) : null;
  const dateStart = startOfDay(referenceDate);
  const tageUebrig = liefertermin ? differenceInDays(liefertermin, dateStart) : 0;

  return {
    auftragsnummer: order.auftragsnummer,
    kunde: kunde?.firma || kunde?.name || '–',
    produkttyp: order.produkttyp,
    liefertermin: order.liefertermin || '',
    tageUebrig,
  };
}

/**
 * Lädt alle Problem-Aufträge (istStatus = 'problem')
 * @param date - Referenzdatum für tageUebrig-Berechnung (Default: heute)
 */
export async function getProblemOrders(date: Date = new Date()): Promise<KPIOrderItem[]> {
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
    .eq('istStatus', 'problem')
    .order('liefertermin', { ascending: true });

  if (error || !data) {
    console.error('Error fetching problem orders:', error);
    return [];
  }

  return data.map((order) => mapOrderToKPIItem(order, date));
}

/**
 * Lädt die ältesten offenen Aufträge (nach Liefertermin sortiert)
 * @param date - Referenzdatum für tageUebrig-Berechnung (Default: heute)
 * @param limit - Maximale Anzahl zurückgegebener Aufträge (Default: 10)
 */
export async function getOldestOrders(
  date: Date = new Date(),
  limit: number = 10
): Promise<KPIOrderItem[]> {
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
    .order('liefertermin', { ascending: true })
    .limit(limit);

  if (error || !data) {
    console.error('Error fetching oldest orders:', error);
    return [];
  }

  return data.map((order) => mapOrderToKPIItem(order, date));
}

/**
 * Lädt alle Aufträge die morgen fällig sind
 * @param date - Referenzdatum (Default: heute) - morgen = date + 1
 */
export async function getTomorrowOrders(date: Date = new Date()): Promise<KPIOrderItem[]> {
  const tomorrow = addDays(startOfDay(date), 1);
  const tomorrowEnd = endOfDay(tomorrow);

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
    .gte('liefertermin', tomorrow.toISOString())
    .lte('liefertermin', tomorrowEnd.toISOString())
    .order('liefertermin', { ascending: true });

  if (error || !data) {
    console.error('Error fetching tomorrow orders:', error);
    return [];
  }

  return data.map((order) => mapOrderToKPIItem(order, date));
}

/**
 * Stage-Typen für getOrdersByStage
 */
export type StageType =
  | 'offen'
  | 'in_produktion'
  | 'fertig'
  | 'versandbereit'
  | 'versendet'
  | 'problem';

/**
 * Lädt Aufträge für eine bestimmte Pipeline-Stage
 * Logik entspricht getFunnelData() Kategorisierung:
 * - 'problem': istStatus = 'problem'
 * - 'versendet': versandStatus = 'versendet'
 * - 'versandbereit': versandStatus = 'versandbereit'
 * - 'fertig': istStatus = 'fertig'
 * - 'in_produktion': istStatus = 'in_produktion'
 * - 'offen': no istStatus AND versandStatus NOT in ('versandbereit', 'versendet')
 *
 * @param stage - Die Pipeline-Stage
 * @param date - Referenzdatum für tageUebrig-Berechnung (Default: heute)
 */
export async function getOrdersByStage(
  stage: StageType,
  date: Date = new Date()
): Promise<KPIOrderItem[]> {
  let query = supabase
    .from('Auftrag')
    .select(
      `
            auftragsnummer,
            produkttyp,
            liefertermin,
            istStatus,
            versandStatus,
            Kunde(firma, name)
        `
    )
    .eq('status', 'aktiv');

  // Apply stage-specific filters
  // Note: For cumulative funnel, these return ALL orders that have REACHED that milestone
  // (e.g., 'fertig' includes orders with istStatus=fertig even if versandStatus is also set)
  switch (stage) {
    case 'problem':
      query = query.eq('istStatus', 'problem');
      break;
    case 'versendet':
      query = query.eq('versandStatus', 'versendet');
      break;
    case 'versandbereit':
      // Orders that are ready to ship OR already shipped
      query = query.or('versandStatus.eq.versandbereit,versandStatus.eq.versendet');
      break;
    case 'fertig':
      // Orders with istStatus=fertig OR already in versand stages (they passed through fertig)
      query = query.or(
        'istStatus.eq.fertig,versandStatus.eq.versandbereit,versandStatus.eq.versendet'
      );
      break;
    case 'in_produktion':
      // Orders that have started production (in_produktion or beyond)
      query = query.or(
        'istStatus.eq.in_produktion,istStatus.eq.fertig,versandStatus.eq.versandbereit,versandStatus.eq.versendet'
      );
      break;
    case 'offen':
      // Offen: no istStatus AND versandStatus NOT in ('versandbereit', 'versendet')
      query = query
        .is('istStatus', null)
        .not('versandStatus', 'in', '("versandbereit","versendet")');
      break;
  }

  const { data, error } = await query.order('liefertermin', { ascending: true });

  if (error || !data) {
    console.error(`Error fetching ${stage} orders:`, error);
    return [];
  }

  // For stages that match the switch, we can return directly
  // But for 'offen', we need to filter out cases where other stages would match
  // The query already handles this with the .is('istStatus', null)

  return data.map((order) => mapOrderToKPIItem(order, date));
}
