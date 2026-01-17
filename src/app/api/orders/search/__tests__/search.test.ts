/**
 * Tests for Orders Search API (/api/orders/search)
 *
 * Tests lightweight search endpoint optimized for mobile autocomplete.
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { createMockOrder } from '@/__tests__/fixtures';
import { mockPrisma, mockPrismaReset } from '@/__tests__/utils';

// Mock Prisma - must be before importing the route
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Import the route handler after mocking
import { GET } from '../route';

describe('GET /api/orders/search', () => {
  beforeEach(() => {
    mockPrismaReset();
  });

  // Helper to create NextRequest with query params
  function createRequest(params: Record<string, string> = {}): NextRequest {
    const url = new URL('http://localhost:3000/api/orders/search');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  }

  describe('Query Validation', () => {
    it('returns empty results for query less than 2 characters', async () => {
      const request = createRequest({ q: 'a' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      // Should NOT call Prisma for short queries
      expect(mockPrisma.auftrag.findMany).not.toHaveBeenCalled();
    });

    it('returns empty results for single character query', async () => {
      const request = createRequest({ q: 'X' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
    });

    it('returns empty results for missing query parameter', async () => {
      const request = createRequest({});
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      expect(mockPrisma.auftrag.findMany).not.toHaveBeenCalled();
    });

    it('returns empty results for empty query string', async () => {
      const request = createRequest({ q: '' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
    });

    it('processes query with exactly 2 characters', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'GP' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
      // Should call Prisma for 2+ character queries
      expect(mockPrisma.auftrag.findMany).toHaveBeenCalled();
    });
  });

  describe('Search Behavior', () => {
    it('searches across auftragsnummer, produkttyp, kunde.name, kunde.firma', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.where.OR).toHaveLength(4);
      expect(callArgs.where.OR).toEqual([
        { auftragsnummer: { contains: 'test', mode: 'insensitive' } },
        { produkttyp: { contains: 'test', mode: 'insensitive' } },
        { kunde: { name: { contains: 'test', mode: 'insensitive' } } },
        { kunde: { firma: { contains: 'test', mode: 'insensitive' } } },
      ]);
    });

    it('only returns active orders (status=aktiv)', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('aktiv');
    });

    it('returns matching orders', async () => {
      const mockResults = [
        createMockOrder({
          auftragsnummer: 'GP26-0001',
          produkttyp: 'Broschueren',
          liefertermin: new Date('2026-02-15'),
          istStatus: null,
        }),
      ];
      mockPrisma.auftrag.findMany.mockResolvedValue(mockResults);

      const request = createRequest({ q: 'GP26' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toHaveLength(1);
      expect(data.results[0].auftragsnummer).toBe('GP26-0001');
    });
  });

  describe('Result Limiting', () => {
    it('limits results to 10', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.take).toBe(10);
    });
  });

  describe('Result Ordering', () => {
    it('orders by liefertermin ascending', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.orderBy).toEqual({ liefertermin: 'asc' });
    });
  });

  describe('Response Shape', () => {
    it('returns OrderSearchResult interface shape', async () => {
      const mockResult = {
        auftragsnummer: 'GP26-0001',
        produkttyp: 'Visitenkarten',
        liefertermin: new Date('2026-02-15'),
        istStatus: 'in_produktion',
        kunde: {
          firma: 'Test GmbH',
          name: 'Max Mustermann',
        },
      };
      mockPrisma.auftrag.findMany.mockResolvedValue([mockResult]);

      const request = createRequest({ q: 'GP26' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results[0]).toHaveProperty('auftragsnummer');
      expect(data.results[0]).toHaveProperty('produkttyp');
      expect(data.results[0]).toHaveProperty('liefertermin');
      expect(data.results[0]).toHaveProperty('istStatus');
      expect(data.results[0]).toHaveProperty('kunde');
      expect(data.results[0].kunde).toHaveProperty('firma');
      expect(data.results[0].kunde).toHaveProperty('name');
    });

    it('uses correct select fields', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.select).toEqual({
        auftragsnummer: true,
        produkttyp: true,
        liefertermin: true,
        istStatus: true,
        kunde: {
          select: {
            firma: true,
            name: true,
          },
        },
      });
    });

    it('wraps results in results array', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test' });
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('returns 500 on database errors', async () => {
      mockPrisma.auftrag.findMany.mockRejectedValue(new Error('Database error'));

      const request = createRequest({ q: 'test' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Fehler bei der Suche');
    });

    it('returns 500 on connection errors', async () => {
      mockPrisma.auftrag.findMany.mockRejectedValue(new Error('Connection failed'));

      const request = createRequest({ q: 'Broschueren' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
