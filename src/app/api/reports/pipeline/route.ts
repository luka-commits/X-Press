/**
 * XOS Reports - Pipeline Analytics API
 *
 * GET /api/reports/pipeline - Pipeline throughput and KPIs
 *
 * Query params:
 * - from: ISO date string (required) - Start of date range
 * - to: ISO date string (required) - End of date range
 *
 * Returns:
 * - throughput: Orders that moved through each stage in the period
 * - snapshot: Current state metrics (independent of date range)
 * - periodKpis: Historical metrics for the selected period
 * - prevPeriodKpis: Same metrics for the equal length period before
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseISO, isValid, differenceInDays, addDays, differenceInCalendarDays } from 'date-fns';

export const dynamic = 'force-dynamic';

interface ThroughputStage {
  count: number;
  prevCount: number;
  changePercent: number;
}

interface ThroughputData {
  eingang: ThroughputStage;
  produktion: ThroughputStage;
  versandbereit: ThroughputStage;
  versendet: ThroughputStage;
}

interface SnapshotData {
  aktiveAuftraege: number;
  problemAuftraege: number;
  aeltesterAuftrag: number | null;
  morgenFaellig: number;
}

interface PeriodKpis {
  avgDaysToShip: number | null;
  onTimePercent: number;
  totalShipped: number;
}

interface PipelineResponse {
  throughput: ThroughputData;
  snapshot: SnapshotData;
  periodKpis: PeriodKpis;
  prevPeriodKpis: PeriodKpis;
  from: string;
  to: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get and validate date parameters
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: 'Fehlende Parameter: from und to sind erforderlich' },
        { status: 400 }
      );
    }

    const fromDate = parseISO(fromParam);
    const toDate = parseISO(toParam);

    if (!isValid(fromDate) || !isValid(toDate)) {
      return NextResponse.json(
        { error: 'Ungültiges Datumsformat. Verwende ISO 8601 (z.B. 2026-01-01)' },
        { status: 400 }
      );
    }

    // Calculate previous period (equal length before from date)
    const periodDays = differenceInDays(toDate, fromDate) + 1;
    const prevFromDate = addDays(fromDate, -periodDays);
    const prevToDate = addDays(fromDate, -1);
    const prevFromParam = prevFromDate.toISOString().split('T')[0];
    const prevToParam = prevToDate.toISOString().split('T')[0];

    // Fetch all data in parallel
    const [
      throughputData,
      prevThroughputData,
      snapshotData,
      periodKpisData,
      prevPeriodKpisData,
    ] = await Promise.all([
      fetchThroughput(fromParam, toParam),
      fetchThroughput(prevFromParam, prevToParam),
      fetchSnapshot(),
      fetchPeriodKpis(fromParam, toParam),
      fetchPeriodKpis(prevFromParam, prevToParam),
    ]);

    // Combine throughput with comparison
    const throughput: ThroughputData = {
      eingang: {
        count: throughputData.eingang,
        prevCount: prevThroughputData.eingang,
        changePercent: calcChangePercent(throughputData.eingang, prevThroughputData.eingang),
      },
      produktion: {
        count: throughputData.produktion,
        prevCount: prevThroughputData.produktion,
        changePercent: calcChangePercent(throughputData.produktion, prevThroughputData.produktion),
      },
      versandbereit: {
        count: throughputData.versandbereit,
        prevCount: prevThroughputData.versandbereit,
        changePercent: calcChangePercent(throughputData.versandbereit, prevThroughputData.versandbereit),
      },
      versendet: {
        count: throughputData.versendet,
        prevCount: prevThroughputData.versendet,
        changePercent: calcChangePercent(throughputData.versendet, prevThroughputData.versendet),
      },
    };

    const response: PipelineResponse = {
      throughput,
      snapshot: snapshotData,
      periodKpis: periodKpisData,
      prevPeriodKpis: prevPeriodKpisData,
      from: fromParam,
      to: toParam,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Pipeline Reports API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Pipeline-Daten' },
      { status: 500 }
    );
  }
}

/**
 * Calculate percentage change between current and previous value
 */
function calcChangePercent(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Fetch throughput data for a date range
 * Throughput = orders that MOVED through each stage in the period
 */
async function fetchThroughput(from: string, to: string): Promise<{
  eingang: number;
  produktion: number;
  versandbereit: number;
  versendet: number;
}> {
  // Add time to cover the full day range
  const fromWithTime = `${from}T00:00:00`;
  const toWithTime = `${to}T23:59:59`;

  const [eingangResult, produktionResult, versandbereitResult, versendetResult] = await Promise.all([
    // Eingang: Orders created in period
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', fromWithTime)
      .lte('createdAt', toWithTime),

    // Produktion: Orders with statusUpdatedAt in period AND istStatus='in_produktion'
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .eq('istStatus', 'in_produktion')
      .gte('statusUpdatedAt', fromWithTime)
      .lte('statusUpdatedAt', toWithTime),

    // Versandbereit: Orders with statusUpdatedAt in period AND (istStatus='fertig' OR versandStatus='bereit')
    // Note: We count fertig OR bereit - using two queries and combining
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .or('istStatus.eq.fertig,versandStatus.eq.bereit')
      .gte('statusUpdatedAt', fromWithTime)
      .lte('statusUpdatedAt', toWithTime),

    // Versendet: Orders shipped in period (or all shipped if versandUpdatedAt is NULL)
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .eq('versandStatus', 'versendet')
      .or(`versandUpdatedAt.gte.${fromWithTime},versandUpdatedAt.is.null`)
      .or(`versandUpdatedAt.lte.${toWithTime},versandUpdatedAt.is.null`),
  ]);

  return {
    eingang: eingangResult.count || 0,
    produktion: produktionResult.count || 0,
    versandbereit: versandbereitResult.count || 0,
    versendet: versendetResult.count || 0,
  };
}

/**
 * Fetch snapshot data - current state, independent of date range
 */
async function fetchSnapshot(): Promise<SnapshotData> {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const tomorrowStart = `${tomorrow.toISOString().split('T')[0]}T00:00:00`;
  const tomorrowEnd = `${tomorrow.toISOString().split('T')[0]}T23:59:59`;

  const [activeResult, problemResult, oldestResult, tomorrowDueResult] = await Promise.all([
    // Active orders: not yet shipped
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .neq('versandStatus', 'versendet'),

    // Problem orders: istStatus = 'problem' (consistent with funnel and dialog)
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .eq('istStatus', 'problem')
      .neq('versandStatus', 'versendet'),

    // Oldest unshipped order: MIN(createdAt) where not shipped
    supabase
      .from('Auftrag')
      .select('createdAt')
      .neq('versandStatus', 'versendet')
      .order('createdAt', { ascending: true })
      .limit(1),

    // Due tomorrow: lieferdatum = tomorrow AND not shipped
    supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .gte('liefertermin', tomorrowStart)
      .lte('liefertermin', tomorrowEnd)
      .neq('versandStatus', 'versendet'),
  ]);

  // Calculate days since oldest unshipped order
  let aeltesterAuftrag: number | null = null;
  if (oldestResult.data && oldestResult.data.length > 0 && oldestResult.data[0].createdAt) {
    const oldestDate = parseISO(oldestResult.data[0].createdAt);
    if (isValid(oldestDate)) {
      aeltesterAuftrag = differenceInCalendarDays(now, oldestDate);
    }
  }

  return {
    aktiveAuftraege: activeResult.count || 0,
    problemAuftraege: problemResult.count || 0,
    aeltesterAuftrag,
    morgenFaellig: tomorrowDueResult.count || 0,
  };
}

/**
 * Fetch period KPIs - historical metrics for a date range
 */
async function fetchPeriodKpis(from: string, to: string): Promise<PeriodKpis> {
  const fromWithTime = `${from}T00:00:00`;
  const toWithTime = `${to}T23:59:59`;

  // Get shipped orders in period with needed fields for calculations
  // Include orders with NULL versandUpdatedAt (legacy data)
  const { data: orders, error } = await supabase
    .from('Auftrag')
    .select('createdAt, liefertermin, versandUpdatedAt')
    .eq('versandStatus', 'versendet')
    .or(`versandUpdatedAt.gte.${fromWithTime},versandUpdatedAt.is.null`)
    .or(`versandUpdatedAt.lte.${toWithTime},versandUpdatedAt.is.null`);

  if (error || !orders) {
    console.error('Period KPIs fetch error:', error);
    return {
      avgDaysToShip: null,
      onTimePercent: 0,
      totalShipped: 0,
    };
  }

  const totalShipped = orders.length;

  if (totalShipped === 0) {
    return {
      avgDaysToShip: null,
      onTimePercent: 0,
      totalShipped: 0,
    };
  }

  // Calculate avgDaysToShip and onTimePercent
  let totalDaysToShip = 0;
  let validShipDaysCount = 0;
  let onTimeCount = 0;
  let ordersWithLiefertermin = 0;

  for (const order of orders) {
    // Avg days to ship: versandUpdatedAt - createdAt
    if (order.createdAt && order.versandUpdatedAt) {
      const createdDate = parseISO(order.createdAt);
      const shippedDate = parseISO(order.versandUpdatedAt);
      if (isValid(createdDate) && isValid(shippedDate)) {
        const daysDiff = differenceInCalendarDays(shippedDate, createdDate);
        if (daysDiff >= 0) {
          totalDaysToShip += daysDiff;
          validShipDaysCount++;
        }
      }
    }

    // On-time: shipped on or before liefertermin
    if (order.liefertermin && order.versandUpdatedAt) {
      ordersWithLiefertermin++;
      const dueDate = parseISO(order.liefertermin);
      const shippedDate = parseISO(order.versandUpdatedAt);
      if (isValid(dueDate) && isValid(shippedDate)) {
        if (differenceInCalendarDays(shippedDate, dueDate) <= 0) {
          onTimeCount++;
        }
      }
    }
  }

  const avgDaysToShip = validShipDaysCount > 0
    ? Math.round((totalDaysToShip / validShipDaysCount) * 10) / 10
    : null;

  const onTimePercent = ordersWithLiefertermin > 0
    ? Math.round((onTimeCount / ordersWithLiefertermin) * 100)
    : 0;

  return {
    avgDaysToShip,
    onTimePercent,
    totalShipped,
  };
}
