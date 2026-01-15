/**
 * XOS Orders Search API
 *
 * GET /api/orders/search - Lightweight search endpoint optimized for mobile autocomplete
 * Returns minimal data (top 10 matches) for fast mobile response
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface OrderSearchResult {
  auftragsnummer: string;
  produkttyp: string | null;
  liefertermin: Date | null;
  kunde: {
    firma: string | null;
    name: string | null;
  } | null;
}

interface SearchResponse {
  results: OrderSearchResult[];
}

export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    // Return empty results if query is missing or too short
    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search across multiple fields with case-insensitive matching
    const orders = await prisma.auftrag.findMany({
      where: {
        status: 'aktiv',
        OR: [
          { auftragsnummer: { contains: q, mode: 'insensitive' } },
          { produkttyp: { contains: q, mode: 'insensitive' } },
          { kunde: { name: { contains: q, mode: 'insensitive' } } },
          { kunde: { firma: { contains: q, mode: 'insensitive' } } },
        ],
      },
      select: {
        auftragsnummer: true,
        produkttyp: true,
        liefertermin: true,
        kunde: {
          select: {
            firma: true,
            name: true,
          },
        },
      },
      orderBy: {
        liefertermin: 'asc',
      },
      take: 10,
    });

    const results: OrderSearchResult[] = orders;

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Suche' },
      { status: 500 }
    );
  }
}
