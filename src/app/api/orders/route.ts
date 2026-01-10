/**
 * XOS Orders API
 *
 * GET /api/orders - Liste aller Aufträge mit Filter, Suche & Pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Berlin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query-Parameter
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const deadline = searchParams.get('deadline') || 'all';
    const produkttyp = searchParams.get('produkttyp') || '';
    const sachbearbeiter = searchParams.get('sachbearbeiter') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const sortBy = searchParams.get('sortBy') || 'liefertermin';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    // Basis-Where-Bedingungen
    const where: Record<string, unknown> = {};

    // Status-Filter
    if (status === 'aktiv') {
      where.status = 'aktiv';
    } else if (status === 'abgeschlossen') {
      where.status = 'abgeschlossen';
    }
    // 'all' = keine Status-Filterung

    // Deadline-Filter
    const now = toZonedTime(new Date(), TIMEZONE);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Montag
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    if (deadline === 'today') {
      where.liefertermin = {
        gte: todayStart,
        lte: todayEnd,
      };
    } else if (deadline === 'week') {
      where.liefertermin = {
        gte: weekStart,
        lte: weekEnd,
      };
    } else if (deadline === 'overdue') {
      where.liefertermin = {
        lt: todayStart,
      };
      // Nur aktive Aufträge die überfällig sind
      where.status = 'aktiv';
    }

    // Produkttyp-Filter
    if (produkttyp) {
      where.produkttyp = produkttyp;
    }

    // Sachbearbeiter-Filter
    if (sachbearbeiter) {
      where.sachbearbeiter = sachbearbeiter;
    }

    // Volltext-Suche (OR über mehrere Felder)
    if (search) {
      where.OR = [
        { auftragsnummer: { contains: search, mode: 'insensitive' } },
        { produkttyp: { contains: search, mode: 'insensitive' } },
        { kunde: { name: { contains: search, mode: 'insensitive' } } },
        { kunde: { firma: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Sortierung
    const orderBy: Record<string, unknown> = {};
    if (sortBy === 'kunde') {
      orderBy.kunde = { firma: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Daten abrufen mit Pagination
    const [orders, total] = await Promise.all([
      prisma.auftrag.findMany({
        where,
        include: {
          kunde: {
            select: {
              id: true,
              name: true,
              firma: true,
            },
          },
          _count: {
            select: { arbeitsgaenge: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auftrag.count({ where }),
    ]);

    // Automatischer Status-Wechsel: Liefertermin < heute → abgeschlossen
    const ordersWithComputedStatus = orders.map((order) => {
      let computedStatus = order.status;
      if (order.liefertermin && order.liefertermin < todayStart && order.status === 'aktiv') {
        computedStatus = 'abgeschlossen';
      }
      return {
        ...order,
        computedStatus,
      };
    });

    return NextResponse.json({
      orders: ordersWithComputedStatus,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Orders API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Aufträge' },
      { status: 500 }
    );
  }
}
