/**
 * XOS Reports - KPI Orders API
 *
 * GET /api/reports/kpi-orders - Fetch order lists for Reports page KPIs
 *
 * Query params:
 * - type (required): 'problem' | 'oldest' | 'tomorrow' | 'stage'
 * - stage (required if type='stage'): 'offen' | 'in_produktion' | 'fertig' | 'versandbereit' | 'versendet' | 'problem'
 * - date (optional): ISO date string (YYYY-MM-DD), defaults to today
 * - limit (optional, only for type='oldest'): number, defaults to 10
 *
 * Returns:
 * - type: The requested KPI type
 * - orders: Array of KPIOrderItem
 * - count: Number of orders
 * - date: The reference date used for calculation
 * - stage?: The stage (when type='stage')
 */

import { parseISO, isValid } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

import {
  getProblemOrders,
  getOldestOrders,
  getTomorrowOrders,
  getOrdersByStage,
  type KPIOrderItem,
  type StageType,
} from '@/lib/reporting-queries';

export const dynamic = 'force-dynamic';

type KPIType = 'problem' | 'oldest' | 'tomorrow' | 'stage';

interface KPIOrdersResponse {
  type: KPIType;
  orders: KPIOrderItem[];
  count: number;
  date: string;
  stage?: StageType;
}

const VALID_TYPES: KPIType[] = ['problem', 'oldest', 'tomorrow', 'stage'];
const VALID_STAGES: StageType[] = [
  'offen',
  'in_produktion',
  'fertig',
  'versandbereit',
  'versendet',
  'problem',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get and validate type parameter (required)
    const typeParam = searchParams.get('type');

    if (!typeParam) {
      return NextResponse.json(
        {
          error: 'Fehlender Parameter: type ist erforderlich (problem | oldest | tomorrow | stage)',
        },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(typeParam as KPIType)) {
      return NextResponse.json(
        {
          error: `Ungültiger Typ: "${typeParam}". Erlaubte Werte: problem, oldest, tomorrow, stage`,
        },
        { status: 400 }
      );
    }

    const type = typeParam as KPIType;

    // Get and validate stage parameter (required if type='stage')
    const stageParam = searchParams.get('stage');
    let stage: StageType | undefined;

    if (type === 'stage') {
      if (!stageParam) {
        return NextResponse.json(
          {
            error:
              'Fehlender Parameter: stage ist erforderlich für type=stage (offen | in_produktion | fertig | versandbereit | versendet | problem)',
          },
          { status: 400 }
        );
      }

      if (!VALID_STAGES.includes(stageParam as StageType)) {
        return NextResponse.json(
          {
            error: `Ungültige Stage: "${stageParam}". Erlaubte Werte: offen, in_produktion, fertig, versandbereit, versendet, problem`,
          },
          { status: 400 }
        );
      }

      stage = stageParam as StageType;
    }

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

    // Get limit parameter for 'oldest' type
    const limitParam = searchParams.get('limit');
    let limit = 10;

    if (type === 'oldest' && limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    // Fetch orders based on type
    let orders: KPIOrderItem[];

    switch (type) {
      case 'problem':
        orders = await getProblemOrders(referenceDate);
        break;
      case 'oldest':
        orders = await getOldestOrders(referenceDate, limit);
        break;
      case 'tomorrow':
        orders = await getTomorrowOrders(referenceDate);
        break;
      case 'stage':
        orders = await getOrdersByStage(stage!, referenceDate);
        break;
    }

    const response: KPIOrdersResponse = {
      type,
      orders,
      count: orders.length,
      date: referenceDate.toISOString().split('T')[0],
    };

    // Include stage in response if type='stage'
    if (type === 'stage' && stage) {
      response.stage = stage;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Reports KPI Orders API Error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der KPI-Aufträge' }, { status: 500 });
  }
}
