/**
 * XOS Versand Orders List API
 *
 * GET /api/versand/orders - Liste für Versand-Team mit Liefertermin-Filter und PLZ-Sortierung
 *
 * Enables shipping team to view orders filtered by delivery date with PLZ sorting for route optimization.
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
    const deadline = searchParams.get('deadline') || 'all';
    const versandStatus = searchParams.get('versandStatus') || 'all';
    const sortBy = searchParams.get('sortBy') || 'plz';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    // Basis-Where-Bedingungen: nur aktive Aufträge für Versand
    const where: Record<string, unknown> = {
      status: 'aktiv',
    };

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
    }
    // 'all' = keine Deadline-Filterung

    // VersandStatus-Filter
    if (versandStatus !== 'all') {
      where.versandStatus = versandStatus;
    }

    // Sortierung
    let orderBy: Record<string, unknown>;
    if (sortBy === 'plz') {
      orderBy = { lieferPlz: sortOrder };
    } else if (sortBy === 'liefertermin') {
      orderBy = { liefertermin: sortOrder };
    } else {
      orderBy = { lieferPlz: sortOrder }; // Default: PLZ für Routenoptimierung
    }

    // Daten abrufen mit Pagination
    const [orders, total] = await Promise.all([
      prisma.auftrag.findMany({
        where,
        select: {
          auftragsnummer: true,
          produkttyp: true,
          liefertermin: true,
          versandStatus: true,
          versandKommentar: true,
          versandUpdatedAt: true,
          lieferStrasse: true,
          lieferPlz: true,
          lieferOrt: true,
          lieferLand: true,
          kunde: {
            select: {
              firma: true,
              name: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auftrag.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Versand Orders API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Versand-Aufträge' },
      { status: 500 }
    );
  }
}
