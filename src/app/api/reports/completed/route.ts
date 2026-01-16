/**
 * XOS Reports - Completed Orders API
 *
 * GET /api/reports/completed - Liste abgeschlossener Aufträge
 *
 * Returns orders where versandStatus='versendet' (shipped orders only)
 * Sorted by versandUpdatedAt (most recent first)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Query shipped orders: versandStatus = 'versendet'
    const { data: orders, error, count } = await supabase
      .from('Auftrag')
      .select(`
        auftragsnummer,
        produkttyp,
        liefertermin,
        istStatus,
        versandStatus,
        statusUpdatedAt,
        versandUpdatedAt,
        Kunde(name, firma)
      `, { count: 'exact' })
      .eq('versandStatus', 'versendet')
      .order('versandUpdatedAt', { ascending: false, nullsFirst: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Completed Orders API Error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der abgeschlossenen Aufträge' },
        { status: 500 }
      );
    }

    // Transform data to match response shape
    const transformedOrders = (orders || []).map((order) => {
      // Handle Kunde - Supabase may return array or object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawKunde = order.Kunde as any;
      const kunde = Array.isArray(rawKunde) ? rawKunde[0] : rawKunde;

      // All orders are shipped, so completedAt is versandUpdatedAt
      return {
        auftragsnummer: order.auftragsnummer,
        kunde: kunde ? { name: kunde.name, firma: kunde.firma } : null,
        produkttyp: order.produkttyp,
        liefertermin: order.liefertermin,
        istStatus: order.istStatus,
        versandStatus: order.versandStatus,
        completedAt: order.versandUpdatedAt,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      orders: transformedOrders,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Completed Orders API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der abgeschlossenen Aufträge' },
      { status: 500 }
    );
  }
}
