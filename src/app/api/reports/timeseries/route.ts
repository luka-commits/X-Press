/**
 * XOS Reports - Timeseries API
 *
 * GET /api/reports/timeseries - Daily eingang vs versendet counts
 *
 * Query params:
 * - from: ISO date string (required) - Start of date range
 * - to: ISO date string (required) - End of date range
 *
 * Returns:
 * - Array of { date, eingang, versendet } for each day in range
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseISO, isValid, eachDayOfInterval, format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface TimeseriesDataPoint {
  date: string; // 'yyyy-MM-dd' format
  eingang: number;
  versendet: number;
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

    // Get all days in range
    const days = eachDayOfInterval({ start: fromDate, end: toDate });

    // Fetch eingang and versendet counts for the entire range
    const [eingangResult, versendetResult] = await Promise.all([
      // Eingang: Orders created in period, grouped by date
      supabase
        .from('Auftrag')
        .select('createdAt')
        .gte('createdAt', `${fromParam}T00:00:00`)
        .lte('createdAt', `${toParam}T23:59:59`),

      // Versendet: Orders shipped in period, grouped by date
      supabase
        .from('Auftrag')
        .select('versandUpdatedAt')
        .eq('versandStatus', 'versendet')
        .gte('versandUpdatedAt', `${fromParam}T00:00:00`)
        .lte('versandUpdatedAt', `${toParam}T23:59:59`),
    ]);

    // Count orders per day for eingang
    const eingangByDay = new Map<string, number>();
    if (eingangResult.data) {
      for (const order of eingangResult.data) {
        if (order.createdAt) {
          const dateStr = order.createdAt.substring(0, 10);
          eingangByDay.set(dateStr, (eingangByDay.get(dateStr) || 0) + 1);
        }
      }
    }

    // Count orders per day for versendet
    const versendetByDay = new Map<string, number>();
    if (versendetResult.data) {
      for (const order of versendetResult.data) {
        if (order.versandUpdatedAt) {
          const dateStr = order.versandUpdatedAt.substring(0, 10);
          versendetByDay.set(dateStr, (versendetByDay.get(dateStr) || 0) + 1);
        }
      }
    }

    // Build response with all days in range
    const data: TimeseriesDataPoint[] = days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return {
        date: dateStr,
        eingang: eingangByDay.get(dateStr) || 0,
        versendet: versendetByDay.get(dateStr) || 0,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Timeseries API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Zeitreihen-Daten' },
      { status: 500 }
    );
  }
}
