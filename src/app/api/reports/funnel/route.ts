import { NextRequest, NextResponse } from 'next/server';
import { getFunnelData, getCumulativeFunnelData } from '@/lib/reporting-queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reports/funnel
 *
 * Returns current pipeline funnel data (snapshot of active orders).
 * Independent of date range - shows current state.
 *
 * Query params:
 * - mode: 'cumulative' (default) | 'exclusive'
 *   - cumulative: Each stage counts orders that have REACHED that milestone or beyond
 *   - exclusive: Each stage counts only orders currently AT that stage (mutually exclusive)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'cumulative';

    if (mode === 'exclusive') {
      // Exclusive mode - each order counted in only one stage
      const data = await getFunnelData();
      return NextResponse.json(data);
    }

    // Default: Cumulative mode - stages show orders that have REACHED that milestone
    const funnelData = await getCumulativeFunnelData();
    return NextResponse.json(funnelData);
  } catch (error) {
    console.error('Funnel API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
