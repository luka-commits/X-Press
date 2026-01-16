/**
 * XOS Reports - Versand (Shipping) API
 *
 * GET /api/reports/versand - Shipping performance metrics
 *
 * Query params:
 * - from: ISO date string (required) - Start of date range
 * - to: ISO date string (required) - End of date range
 *
 * Returns:
 * - deliveryMetrics: on-time delivery stats
 * - plzDistribution: top 10 PLZ regions by shipment count
 * - shippingTimes: average days from versandbereit to versendet
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseISO, isValid, differenceInDays, differenceInCalendarDays } from 'date-fns';

export const dynamic = 'force-dynamic';

interface DeliveryMetrics {
  total: number;
  onTime: number;
  late: number;
  onTimePercent: number;
  avgDelayDays: number;
}

interface PlzEntry {
  plz: string;
  count: number;
}

interface ShippingTimes {
  avgDaysToShip: number;
  count: number;
}

interface VersandReport {
  deliveryMetrics: DeliveryMetrics;
  plzDistribution: PlzEntry[];
  shippingTimes: ShippingTimes;
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

    // Query shipped orders within date range
    // versandStatus='versendet' AND versandUpdatedAt within range
    const { data: orders, error } = await supabase
      .from('Auftrag')
      .select('auftragsnummer, liefertermin, versandUpdatedAt, statusUpdatedAt, lieferPlz, versandStatus')
      .eq('versandStatus', 'versendet')
      .gte('versandUpdatedAt', fromParam)
      .lte('versandUpdatedAt', toParam);

    if (error) {
      console.error('Versand Reports API Error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Versanddaten' },
        { status: 500 }
      );
    }

    // Calculate delivery metrics
    const deliveryMetrics = calculateDeliveryMetrics(orders || []);

    // Calculate PLZ distribution (top 10 by first 2 digits)
    const plzDistribution = calculatePlzDistribution(orders || []);

    // Calculate shipping times (versandbereit -> versendet)
    // Since we don't have a versandbereitAt field, we use statusUpdatedAt as proxy
    // when istStatus was set to 'fertig' (ready for shipping)
    const shippingTimes = calculateShippingTimes(orders || []);

    const response: VersandReport = {
      deliveryMetrics,
      plzDistribution,
      shippingTimes,
      from: fromParam,
      to: toParam,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Versand Reports API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Versanddaten' },
      { status: 500 }
    );
  }
}

interface OrderData {
  auftragsnummer: string;
  liefertermin: string | null;
  versandUpdatedAt: string | null;
  statusUpdatedAt: string | null;
  lieferPlz: string | null;
  versandStatus: string | null;
}

function calculateDeliveryMetrics(orders: OrderData[]): DeliveryMetrics {
  const total = orders.length;
  let onTime = 0;
  let late = 0;
  let totalDelayDays = 0;
  let ordersWithLiefertermin = 0;

  for (const order of orders) {
    // Skip orders without versandUpdatedAt or liefertermin for on-time calculation
    if (!order.versandUpdatedAt || !order.liefertermin) {
      continue;
    }

    ordersWithLiefertermin++;

    const shippedDate = parseISO(order.versandUpdatedAt);
    const dueDate = parseISO(order.liefertermin);

    if (!isValid(shippedDate) || !isValid(dueDate)) {
      continue;
    }

    // On-time = shipped on or before due date
    const daysDiff = differenceInCalendarDays(shippedDate, dueDate);

    if (daysDiff <= 0) {
      onTime++;
    } else {
      late++;
      totalDelayDays += daysDiff;
    }
  }

  // Calculate percentages based on orders with liefertermin
  const onTimePercent = ordersWithLiefertermin > 0
    ? Math.round((onTime / ordersWithLiefertermin) * 100)
    : 0;

  const avgDelayDays = late > 0
    ? Math.round((totalDelayDays / late) * 10) / 10  // Round to 1 decimal
    : 0;

  return {
    total,
    onTime,
    late,
    onTimePercent,
    avgDelayDays,
  };
}

function calculatePlzDistribution(orders: OrderData[]): PlzEntry[] {
  const plzCounts = new Map<string, number>();

  for (const order of orders) {
    if (!order.lieferPlz) continue;

    // Use first 2 digits for regional grouping
    const plzPrefix = order.lieferPlz.substring(0, 2);
    if (plzPrefix.length < 2) continue;

    plzCounts.set(plzPrefix, (plzCounts.get(plzPrefix) || 0) + 1);
  }

  // Convert to array, sort by count descending, take top 10
  return Array.from(plzCounts.entries())
    .map(([plz, count]) => ({ plz, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateShippingTimes(orders: OrderData[]): ShippingTimes {
  let totalDays = 0;
  let count = 0;

  for (const order of orders) {
    // We need both statusUpdatedAt (when marked as fertig/versandbereit) and versandUpdatedAt
    if (!order.statusUpdatedAt || !order.versandUpdatedAt) {
      continue;
    }

    const readyDate = parseISO(order.statusUpdatedAt);
    const shippedDate = parseISO(order.versandUpdatedAt);

    if (!isValid(readyDate) || !isValid(shippedDate)) {
      continue;
    }

    // Only count positive differences (shipped after ready)
    const daysDiff = differenceInDays(shippedDate, readyDate);
    if (daysDiff >= 0) {
      totalDays += daysDiff;
      count++;
    }
  }

  const avgDaysToShip = count > 0
    ? Math.round((totalDays / count) * 10) / 10  // Round to 1 decimal
    : 0;

  return {
    avgDaysToShip,
    count,
  };
}
