/**
 * KPI Orders API Route Tests
 *
 * Tests for GET /api/dashboard/kpi-orders endpoint
 * which provides drilldown data for dashboard KPI cards
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import * as dashboardQueries from '@/lib/dashboard-queries';

import { GET } from '../route';

// Mock the dashboard-queries module
jest.mock('@/lib/dashboard-queries', () => ({
  getOpenOrders: jest.fn(),
  getCriticalOrders: jest.fn(),
  getOverdueOrders: jest.fn(),
  getProblemOrders: jest.fn(),
}));

// Sample KPIOrderItem data
const sampleKPIOrders = [
  {
    auftragsnummer: 'GP26-0001',
    kunde: 'Test Firma GmbH',
    produkttyp: 'Broschueren',
    liefertermin: '2026-01-20',
    tageUebrig: 3,
  },
  {
    auftragsnummer: 'GP26-0002',
    kunde: 'Another Company',
    produkttyp: 'Plakate',
    liefertermin: '2026-01-18',
    tageUebrig: 1,
  },
];

// Helper to create mock request with query params
function createRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/dashboard/kpi-orders');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return new NextRequest(url);
}

describe('GET /api/dashboard/kpi-orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // Parameter Validation Tests
  // ============================================================

  describe('Parameter Validation', () => {
    it('returns 400 when type parameter is missing', async () => {
      const request = createRequest({});

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('type');
    });

    it('returns 400 for invalid type value', async () => {
      const request = createRequest({ type: 'invalid' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('invalid');
    });

    it('returns 400 for type value not in allowed list', async () => {
      const request = createRequest({ type: 'shipped' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('shipped');
    });

    it('returns 400 for invalid date format', async () => {
      const request = createRequest({ type: 'total', date: 'invalid-date' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Datum');
    });

    it('returns 400 for malformed date format', async () => {
      const request = createRequest({ type: 'total', date: '2026/01/17' });

      const response = await GET(request);
      const _data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  // ============================================================
  // KPI Type Routing Tests
  // ============================================================

  describe('KPI Type Routing', () => {
    it('returns orders for type=total (calls getOpenOrders)', async () => {
      (dashboardQueries.getOpenOrders as jest.Mock).mockResolvedValue(sampleKPIOrders);
      const request = createRequest({ type: 'total' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(dashboardQueries.getOpenOrders).toHaveBeenCalled();
      expect(data.type).toBe('total');
      expect(data.orders).toEqual(sampleKPIOrders);
      expect(data.count).toBe(2);
    });

    it('returns orders for type=critical (calls getCriticalOrders)', async () => {
      (dashboardQueries.getCriticalOrders as jest.Mock).mockResolvedValue(sampleKPIOrders);
      const request = createRequest({ type: 'critical' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(dashboardQueries.getCriticalOrders).toHaveBeenCalled();
      expect(data.type).toBe('critical');
      expect(data.orders).toEqual(sampleKPIOrders);
    });

    it('returns orders for type=overdue (calls getOverdueOrders)', async () => {
      (dashboardQueries.getOverdueOrders as jest.Mock).mockResolvedValue([sampleKPIOrders[0]]);
      const request = createRequest({ type: 'overdue' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(dashboardQueries.getOverdueOrders).toHaveBeenCalled();
      expect(data.type).toBe('overdue');
      expect(data.orders).toHaveLength(1);
    });

    it('returns orders for type=problem (calls getProblemOrders)', async () => {
      (dashboardQueries.getProblemOrders as jest.Mock).mockResolvedValue(sampleKPIOrders);
      const request = createRequest({ type: 'problem' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(dashboardQueries.getProblemOrders).toHaveBeenCalled();
      expect(data.type).toBe('problem');
    });
  });

  // ============================================================
  // Date Parameter Tests
  // ============================================================

  describe('Date Parameter Handling', () => {
    it('uses provided date parameter', async () => {
      (dashboardQueries.getOpenOrders as jest.Mock).mockResolvedValue([]);
      const request = createRequest({ type: 'total', date: '2026-01-15' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.date).toBe('2026-01-15');

      // Verify the function was called with a date representing 2026-01-15
      const callArg = (dashboardQueries.getOpenOrders as jest.Mock).mock.calls[0][0];
      expect(callArg instanceof Date).toBe(true);
      expect(callArg.getFullYear()).toBe(2026);
      expect(callArg.getMonth()).toBe(0); // January
      expect(callArg.getDate()).toBe(15);
    });

    it('defaults to today when no date provided', async () => {
      (dashboardQueries.getOpenOrders as jest.Mock).mockResolvedValue([]);
      const request = createRequest({ type: 'total' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Date should be today's date
      const today = new Date().toISOString().split('T')[0];
      expect(data.date).toBe(today);
    });
  });

  // ============================================================
  // Response Shape Tests
  // ============================================================

  describe('Response Shape', () => {
    it('returns correct response shape with all required fields', async () => {
      (dashboardQueries.getOpenOrders as jest.Mock).mockResolvedValue(sampleKPIOrders);
      const request = createRequest({ type: 'total', date: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('orders');
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('date');

      expect(data.type).toBe('total');
      expect(Array.isArray(data.orders)).toBe(true);
      expect(typeof data.count).toBe('number');
      expect(data.count).toBe(data.orders.length);
      expect(data.date).toBe('2026-01-17');
    });

    it('returns empty array when no orders found', async () => {
      (dashboardQueries.getOpenOrders as jest.Mock).mockResolvedValue([]);
      const request = createRequest({ type: 'total' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toEqual([]);
      expect(data.count).toBe(0);
    });
  });

  // ============================================================
  // Error Handling Tests
  // ============================================================

  describe('Error Handling', () => {
    it('returns 500 on query errors', async () => {
      (dashboardQueries.getOpenOrders as jest.Mock).mockRejectedValue(new Error('Database error'));
      const request = createRequest({ type: 'total' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('returns 500 when getCriticalOrders throws', async () => {
      (dashboardQueries.getCriticalOrders as jest.Mock).mockRejectedValue(
        new Error('Connection failed')
      );
      const request = createRequest({ type: 'critical' });

      const response = await GET(request);
      const _data = await response.json();

      expect(response.status).toBe(500);
    });

    it('returns 500 when getOverdueOrders throws', async () => {
      (dashboardQueries.getOverdueOrders as jest.Mock).mockRejectedValue(new Error('Timeout'));
      const request = createRequest({ type: 'overdue' });

      const response = await GET(request);
      const _data = await response.json();

      expect(response.status).toBe(500);
    });

    it('returns 500 when getProblemOrders throws', async () => {
      (dashboardQueries.getProblemOrders as jest.Mock).mockRejectedValue(new Error('Query error'));
      const request = createRequest({ type: 'problem' });

      const response = await GET(request);
      const _data = await response.json();

      expect(response.status).toBe(500);
    });
  });
});
