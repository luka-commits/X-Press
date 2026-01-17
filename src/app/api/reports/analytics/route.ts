/**
 * XOS Reports - Analytics API
 *
 * GET /api/reports/analytics - Time-grouped order volume aggregation
 *
 * Query params:
 * - from: ISO date string (required) - Start of date range
 * - to: ISO date string (required) - End of date range
 *
 * Returns daily order counts for completed orders (istStatus='fertig' OR versandStatus='versendet')
 * within the specified date range, grouped by day.
 */

import { format, parseISO, isValid } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface DailyCount {
  date: string;
  count: number;
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

    // Query completed orders within date range
    // Completed = istStatus='fertig' OR versandStatus='versendet'
    const { data: orders, error } = await supabase
      .from('Auftrag')
      .select('id, statusUpdatedAt, versandUpdatedAt, istStatus, versandStatus')
      .or('istStatus.eq.fertig,versandStatus.eq.versendet')
      .gte('statusUpdatedAt', fromParam)
      .lte('statusUpdatedAt', toParam);

    if (error) {
      console.error('Analytics API Error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden der Analysedaten' }, { status: 500 });
    }

    // Group orders by day using statusUpdatedAt
    const countsByDate = new Map<string, number>();

    for (const order of orders || []) {
      // Use statusUpdatedAt as the primary date, fallback to versandUpdatedAt
      const dateField = order.statusUpdatedAt || order.versandUpdatedAt;
      if (!dateField) continue;

      const dateKey = format(parseISO(dateField), 'yyyy-MM-dd');
      countsByDate.set(dateKey, (countsByDate.get(dateKey) || 0) + 1);
    }

    // Convert to sorted array
    const data: DailyCount[] = Array.from(countsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      data,
      from: fromParam,
      to: toParam,
      totalOrders: orders?.length || 0,
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Analysedaten' }, { status: 500 });
  }
}
