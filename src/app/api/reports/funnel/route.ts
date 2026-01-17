import { NextResponse } from 'next/server';
import { getFunnelData } from '@/lib/reporting-queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reports/funnel
 *
 * Returns current pipeline funnel data (snapshot of active orders).
 * Independent of date range - shows current state.
 */
export async function GET() {
  try {
    const funnelData = await getFunnelData();
    return NextResponse.json(funnelData);
  } catch (error) {
    console.error('Funnel API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
