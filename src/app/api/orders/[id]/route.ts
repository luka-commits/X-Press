/**
 * XOS Order Detail API
 *
 * GET /api/orders/[id] - Einzelner Auftrag mit allen Details
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Berlin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.auftrag.findUnique({
      where: { auftragsnummer: id },
      include: {
        kunde: true,
        arbeitsgaenge: {
          include: {
            maschine: {
              select: {
                id: true,
                name: true,
                kurzname: true,
                kostenstelle: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Auftrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Automatischer Status-Wechsel
    const now = toZonedTime(new Date(), TIMEZONE);
    const todayStart = startOfDay(now);
    let computedStatus = order.status;
    if (order.liefertermin && order.liefertermin < todayStart && order.status === 'aktiv') {
      computedStatus = 'abgeschlossen';
    }

    // Gesamtzeit berechnen
    const gesamtZeit = order.arbeitsgaenge.reduce(
      (sum, ag) => sum + (ag.zeitMinuten || 0),
      0
    );

    return NextResponse.json({
      ...order,
      computedStatus,
      gesamtZeit,
    });
  } catch (error) {
    console.error('Order Detail API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Auftrags' },
      { status: 500 }
    );
  }
}
