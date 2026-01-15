/**
 * XOS Versand Status Update API
 *
 * PATCH /api/orders/[id]/versand - Versand-Status Updates für Versand-Team
 *
 * Enables shipping team to update versand status (versandbereit/versendet).
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { VersandStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { versandStatus, versandKommentar } = body;

    // Validate versandStatus is provided
    if (!versandStatus) {
      return NextResponse.json(
        { error: 'versandStatus ist erforderlich' },
        { status: 400 }
      );
    }

    // Validate versandStatus is a valid VersandStatus enum value
    if (!Object.values(VersandStatus).includes(versandStatus)) {
      return NextResponse.json(
        {
          error: `Ungültiger Versandstatus. Erlaubte Werte: ${Object.values(VersandStatus).join(', ')}`
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

    // Update versand status
    const updatedOrder = await prisma.auftrag.update({
      where: { auftragsnummer: id },
      data: {
        versandStatus: versandStatus as VersandStatus,
        versandKommentar: versandKommentar ?? null,
        versandUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Versand Status Update API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Versandstatus' },
      { status: 500 }
    );
  }
}
