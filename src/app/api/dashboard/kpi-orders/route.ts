/**
 * XOS Dashboard - KPI Orders API
 *
 * GET /api/dashboard/kpi-orders - Fetch order lists by KPI type
 *
 * Query params:
 * - type (required): 'total' | 'critical' | 'overdue'
 * - date (optional): ISO date string (YYYY-MM-DD), defaults to today
 *
 * Returns:
 * - type: The requested KPI type
 * - orders: Array of KPIOrderItem
 * - count: Number of orders
 * - date: The reference date used for calculation
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseISO, isValid } from 'date-fns';
import {
  getOpenOrders,
  getCriticalOrders,
  getOverdueOrders,
  type KPIOrderItem,
} from '@/lib/dashboard-queries';

export const dynamic = 'force-dynamic';

type KPIType = 'total' | 'critical' | 'overdue';

interface KPIOrdersResponse {
  type: KPIType;
  orders: KPIOrderItem[];
  count: number;
  date: string;
}

const VALID_TYPES: KPIType[] = ['total', 'critical', 'overdue'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get and validate type parameter (required)
    const typeParam = searchParams.get('type');

    if (!typeParam) {
      return NextResponse.json(
        { error: 'Fehlender Parameter: type ist erforderlich (total | critical | overdue)' },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(typeParam as KPIType)) {
      return NextResponse.json(
        { error: `Ungültiger Typ: "${typeParam}". Erlaubte Werte: total, critical, overdue` },
        { status: 400 }
      );
    }

    const type = typeParam as KPIType;

    // Get and validate date parameter (optional, defaults to today)
    const dateParam = searchParams.get('date');
    let referenceDate = new Date();

    if (dateParam) {
      // Append time to ensure consistent parsing (noon to avoid timezone edge cases)
      const parsedDate = parseISO(`${dateParam}T12:00:00`);
      if (!isValid(parsedDate)) {
        return NextResponse.json(
          { error: 'Ungültiges Datumsformat. Verwende ISO 8601 (z.B. 2026-01-17)' },
          { status: 400 }
        );
      }
      referenceDate = parsedDate;
    }

    // Fetch orders based on type
    let orders: KPIOrderItem[];

    switch (type) {
      case 'total':
        orders = await getOpenOrders(referenceDate);
        break;
      case 'critical':
        orders = await getCriticalOrders(referenceDate);
        break;
      case 'overdue':
        orders = await getOverdueOrders(referenceDate);
        break;
    }

    const response: KPIOrdersResponse = {
      type,
      orders,
      count: orders.length,
      date: referenceDate.toISOString().split('T')[0],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('KPI Orders API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der KPI-Aufträge' },
      { status: 500 }
    );
  }
}
