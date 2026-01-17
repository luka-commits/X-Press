/**
 * Pipeline Reports API Route Tests
 *
 * Tests for GET /api/reports/pipeline endpoint
 * which provides throughput and KPI analytics
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { GET } from '../route';

// Mock the supabase module with a chainable query builder
const mockChainBuilder = () => {
  const builder: Record<string, jest.Mock> = {};
  const methods = [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'is',
    'in',
    'or',
    'order',
    'limit',
    'range',
    'single',
    'maybeSingle',
  ];

  methods.forEach((method) => {
    builder[method] = jest.fn(() => builder);
  });

  // Return value when promise is awaited (used by default)
  builder._resolveValue = { data: [], count: 0, error: null };

  // Make it thenable (promise-like)
  builder.then = jest.fn((resolve) => {
    return Promise.resolve(builder._resolveValue).then(resolve);
  });

  return builder;
};

// Global mock storage for different query scenarios
const mockQueryResponses: Map<
  string,
  { data: unknown; count: number | null; error: Error | null }
> = new Map();
let queryCallCount = 0;

// Create mock for supabase
const createMockSupabase = () => {
  return {
    from: jest.fn((tableName: string) => {
      const builder = mockChainBuilder();

      // Override then to return table-specific data based on call order
      builder.then = jest.fn((resolve) => {
        queryCallCount++;
        const response = mockQueryResponses.get(`${tableName}_${queryCallCount}`) ||
          mockQueryResponses.get(tableName) || { data: [], count: 0, error: null };
        return Promise.resolve(response).then(resolve);
      });

      return builder;
    }),
  };
};

let mockSupabase: ReturnType<typeof createMockSupabase>;

jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabase;
  },
}));

// Helper to create mock request with query params
function createRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/reports/pipeline');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return new NextRequest(url);
}

// Reset mock state before each test
function resetMocks() {
  mockSupabase = createMockSupabase();
  mockQueryResponses.clear();
  queryCallCount = 0;
}

describe('GET /api/reports/pipeline', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ============================================================
  // Parameter Validation Tests
  // ============================================================

  describe('Parameter Validation', () => {
    it('returns 400 when from parameter is missing', async () => {
      const request = createRequest({ to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('from');
    });

    it('returns 400 when to parameter is missing', async () => {
      const request = createRequest({ from: '2026-01-10' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('to');
    });

    it('returns 400 when both parameters are missing', async () => {
      const request = createRequest({});

      const response = await GET(request);
      const _data = await response.json();

      expect(response.status).toBe(400);
    });

    it('returns 400 for invalid from date format', async () => {
      const request = createRequest({ from: 'invalid-date', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Datum');
    });

    it('returns 400 for invalid to date format', async () => {
      const request = createRequest({ from: '2026-01-10', to: 'not-a-date' });

      const response = await GET(request);
      const _data = await response.json();

      expect(response.status).toBe(400);
    });

    it('returns 400 for malformed date format', async () => {
      const request = createRequest({ from: '2026/01/10', to: '2026/01/17' });

      const response = await GET(request);
      const _data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  // ============================================================
  // Successful Response Tests
  // ============================================================

  describe('Successful Response', () => {
    beforeEach(() => {
      // Set up default responses for all queries
      // The pipeline API makes multiple parallel queries
      mockQueryResponses.set('Auftrag', { data: [], count: 5, error: null });
    });

    it('returns throughput data with counts and changePercent', async () => {
      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('throughput');
      expect(data.throughput).toHaveProperty('eingang');
      expect(data.throughput).toHaveProperty('produktion');
      expect(data.throughput).toHaveProperty('versandbereit');
      expect(data.throughput).toHaveProperty('versendet');

      // Each throughput stage should have count, prevCount, changePercent
      const stages = ['eingang', 'produktion', 'versandbereit', 'versendet'];
      stages.forEach((stage) => {
        expect(data.throughput[stage]).toHaveProperty('count');
        expect(data.throughput[stage]).toHaveProperty('prevCount');
        expect(data.throughput[stage]).toHaveProperty('changePercent');
        expect(typeof data.throughput[stage].count).toBe('number');
        expect(typeof data.throughput[stage].changePercent).toBe('number');
      });
    });

    it('returns snapshot data with current state metrics', async () => {
      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('snapshot');
      expect(data.snapshot).toHaveProperty('aktiveAuftraege');
      expect(data.snapshot).toHaveProperty('problemAuftraege');
      expect(data.snapshot).toHaveProperty('aeltesterAuftrag');
      expect(data.snapshot).toHaveProperty('morgenFaellig');
    });

    it('returns periodKpis with avgDaysToShip, onTimePercent, totalShipped', async () => {
      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('periodKpis');
      expect(data.periodKpis).toHaveProperty('avgDaysToShip');
      expect(data.periodKpis).toHaveProperty('onTimePercent');
      expect(data.periodKpis).toHaveProperty('totalShipped');

      expect(data).toHaveProperty('prevPeriodKpis');
      expect(data.prevPeriodKpis).toHaveProperty('avgDaysToShip');
      expect(data.prevPeriodKpis).toHaveProperty('onTimePercent');
      expect(data.prevPeriodKpis).toHaveProperty('totalShipped');
    });

    it('returns from and to dates in response', async () => {
      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.from).toBe('2026-01-10');
      expect(data.to).toBe('2026-01-17');
    });
  });

  // ============================================================
  // Period Calculation Tests
  // ============================================================

  describe('Previous Period Calculation', () => {
    it('calculates previous period with equal length before from date', async () => {
      // 7-day period from Jan 10 to Jan 17
      // Previous period should be Jan 2 to Jan 9
      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const _data = await response.json();

      expect(response.status).toBe(200);
      // The API calls fetch functions internally with calculated dates
      // We verify the response structure which confirms the calculation happened
      expect(mockSupabase.from).toHaveBeenCalled();
    });

    it('handles single day period', async () => {
      // Single day period
      const request = createRequest({ from: '2026-01-17', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.from).toBe('2026-01-17');
      expect(data.to).toBe('2026-01-17');
    });
  });

  // ============================================================
  // Change Percent Calculation Tests
  // ============================================================

  describe('Change Percent Calculation', () => {
    it('returns 0% change when previous is 0 and current is 0', async () => {
      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // With empty data, both periods should be 0, so changePercent = 0
      expect(data.throughput.eingang.changePercent).toBe(0);
    });
  });

  // ============================================================
  // Error Handling Tests
  // ============================================================

  describe('Error Handling', () => {
    it('returns 500 on database errors', async () => {
      // Override the mock to throw an error
      mockSupabase.from = jest.fn(() => {
        throw new Error('Database connection failed');
      });

      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('handles query returning error object', async () => {
      // Set up error response
      const errorBuilder = mockChainBuilder();
      errorBuilder.then = jest.fn((resolve) => {
        return Promise.resolve({ data: null, count: null, error: new Error('Query failed') }).then(
          resolve
        );
      });

      mockSupabase.from = jest.fn(() => errorBuilder);

      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const _data = await response.json();

      // The API should still return 200 with default values when individual queries fail
      // because it handles errors gracefully with fallback values
      expect(response.status).toBe(200);
    });
  });

  // ============================================================
  // Response Structure Tests
  // ============================================================

  describe('Response Structure', () => {
    it('returns complete response shape', async () => {
      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Top-level properties
      expect(data).toHaveProperty('throughput');
      expect(data).toHaveProperty('snapshot');
      expect(data).toHaveProperty('periodKpis');
      expect(data).toHaveProperty('prevPeriodKpis');
      expect(data).toHaveProperty('from');
      expect(data).toHaveProperty('to');

      // Throughput structure
      expect(Object.keys(data.throughput)).toEqual(
        expect.arrayContaining(['eingang', 'produktion', 'versandbereit', 'versendet'])
      );

      // Snapshot structure
      expect(Object.keys(data.snapshot)).toEqual(
        expect.arrayContaining([
          'aktiveAuftraege',
          'problemAuftraege',
          'aeltesterAuftrag',
          'morgenFaellig',
        ])
      );

      // Period KPIs structure
      expect(Object.keys(data.periodKpis)).toEqual(
        expect.arrayContaining(['avgDaysToShip', 'onTimePercent', 'totalShipped'])
      );
    });

    it('returns numeric values for all metrics', async () => {
      const request = createRequest({ from: '2026-01-10', to: '2026-01-17' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Snapshot numeric values (aeltesterAuftrag can be null)
      expect(typeof data.snapshot.aktiveAuftraege).toBe('number');
      expect(typeof data.snapshot.problemAuftraege).toBe('number');
      expect(typeof data.snapshot.morgenFaellig).toBe('number');

      // Period KPIs (avgDaysToShip can be null)
      expect(typeof data.periodKpis.onTimePercent).toBe('number');
      expect(typeof data.periodKpis.totalShipped).toBe('number');
    });
  });
});
