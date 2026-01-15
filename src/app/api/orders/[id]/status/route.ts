/**
 * XOS Order Status Update API
 *
 * PATCH /api/orders/[id]/status - Mobile Status-Updates für Shopfloor
 *
 * Enables mobile workers to update order status (IST-Zustand) with 3 clicks.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { IstStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { istStatus, statusKommentar } = body;

    // Validate istStatus is provided
    if (!istStatus) {
      return NextResponse.json(
        { error: 'istStatus ist erforderlich' },
        { status: 400 }
      );
    }

    // Validate istStatus is a valid IstStatus enum value
    if (!Object.values(IstStatus).includes(istStatus)) {
      return NextResponse.json(
        {
          error: `Ungültiger Status. Erlaubte Werte: ${Object.values(IstStatus).join(', ')}`
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.auftrag.findUnique({
      where: { auftragsnummer: id },
      select: { auftragsnummer: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Auftrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.auftrag.update({
      where: { auftragsnummer: id },
      data: {
        istStatus: istStatus as IstStatus,
        statusKommentar: statusKommentar ?? null,
        statusUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order Status Update API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Auftragsstatus' },
      { status: 500 }
    );
  }
}
