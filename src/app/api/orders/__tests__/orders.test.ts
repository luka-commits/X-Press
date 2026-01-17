/**
 * Tests for Orders List API (/api/orders)
 *
 * Tests pagination, filtering, search, sorting, validation, and error handling.
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { createMockOrder, sampleOrders } from '@/__tests__/fixtures';
import { mockPrisma, mockPrismaReset } from '@/__tests__/utils';

// Mock Prisma - must be before importing the route
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock date-fns-tz to control timezone behavior in tests
jest.mock('date-fns-tz', () => ({
  toZonedTime: jest.fn((date: Date) => date),
}));

// Import the route handler after mocking
import { GET } from '../route';

describe('GET /api/orders', () => {
  beforeEach(() => {
    mockPrismaReset();
  });

  // Helper to create NextRequest with query params
  function createRequest(params: Record<string, string> = {}): NextRequest {
    const url = new URL('http://localhost:3000/api/orders');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  }

  describe('Pagination', () => {
    it('returns paginated orders with default params (page=1, limit=25)', async () => {
      const mockOrders = [sampleOrders.offen, sampleOrders.inProduktion];
      mockPrisma.auftrag.findMany.mockResolvedValue(mockOrders);
      mockPrisma.auftrag.count.mockResolvedValue(2);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(2);
      expect(data.page).toBe(1);
      expect(data.total).toBe(2);
      expect(data.totalPages).toBe(1);

      // Verify Prisma was called with correct pagination
      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 25,
        })
      );
    });

    it('respects custom page and limit parameters', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(100);

      const request = createRequest({ page: '3', limit: '10' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3-1) * 10
          take: 10,
        })
      );
    });

    it('validates page to be a positive integer', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      // Invalid page should default to 1
      const request = createRequest({ page: '-1' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
        })
      );
    });

    it('limits the limit parameter to 100 maximum', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ limit: '500' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });
  });

  describe('Status Filtering', () => {
    it('filters by status aktiv', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ status: 'aktiv' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'aktiv',
          }),
        })
      );
    });

    it('filters by status abgeschlossen', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ status: 'abgeschlossen' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'abgeschlossen',
          }),
        })
      );
    });

    it('does not filter by status when status=all', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ status: 'all' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBeUndefined();
    });
  });

  describe('Deadline Filtering', () => {
    it('filters by deadline today', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ deadline: 'today' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.where.liefertermin).toBeDefined();
      expect(callArgs.where.liefertermin.gte).toBeDefined();
      expect(callArgs.where.liefertermin.lte).toBeDefined();
    });

    it('filters by deadline week', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ deadline: 'week' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.where.liefertermin).toBeDefined();
      expect(callArgs.where.liefertermin.gte).toBeDefined();
      expect(callArgs.where.liefertermin.lte).toBeDefined();
    });

    it('filters by deadline overdue with active status', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ deadline: 'overdue' });
      await GET(request);

      const callArgs = mockPrisma.auftrag.findMany.mock.calls[0][0];
      expect(callArgs.where.liefertermin).toBeDefined();
      expect(callArgs.where.liefertermin.lt).toBeDefined();
      // Overdue only shows active orders
      expect(callArgs.where.status).toBe('aktiv');
    });
  });

  describe('Additional Filters', () => {
    it('filters by produkttyp', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ produkttyp: 'Visitenkarten' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            produkttyp: 'Visitenkarten',
          }),
        })
      );
    });

    it('filters by sachbearbeiter', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ sachbearbeiter: 'Maria Mikalo' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sachbearbeiter: 'Maria Mikalo',
          }),
        })
      );
    });
  });

  describe('Search', () => {
    it('searches across auftragsnummer, produkttyp, kunde.name, kunde.firma', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ search: 'test' });
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
  });

  describe('Sorting', () => {
    it('sorts by default liefertermin asc', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest();
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { liefertermin: 'asc' },
        })
      );
    });

    it('sorts by custom column and direction', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ sortBy: 'prioritaet', sortOrder: 'desc' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { prioritaet: 'desc' },
        })
      );
    });

    it('validates and sanitizes sortBy (rejects invalid columns)', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      // Invalid sortBy should default to liefertermin
      const request = createRequest({ sortBy: 'invalid_column' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { liefertermin: 'asc' },
        })
      );
    });

    it('validates sortOrder (only accepts asc or desc)', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      // Invalid sortOrder should default to asc
      const request = createRequest({ sortOrder: 'invalid' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { liefertermin: 'asc' },
        })
      );
    });

    it('handles kunde sorting with nested orderBy', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest({ sortBy: 'kunde', sortOrder: 'asc' });
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { kunde: { firma: 'asc' } },
        })
      );
    });
  });

  describe('Computed Status', () => {
    it('computes status to abgeschlossen for past liefertermin on aktiv orders', async () => {
      const pastOrder = createMockOrder({
        auftragsnummer: 'GP26-PAST',
        status: 'aktiv',
        liefertermin: new Date('2020-01-01'), // Well in the past
      });
      mockPrisma.auftrag.findMany.mockResolvedValue([pastOrder]);
      mockPrisma.auftrag.count.mockResolvedValue(1);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.orders[0].computedStatus).toBe('abgeschlossen');
    });

    it('keeps original status for future liefertermin', async () => {
      const futureOrder = createMockOrder({
        auftragsnummer: 'GP26-FUTURE',
        status: 'aktiv',
        liefertermin: new Date('2099-12-31'), // Well in the future
      });
      mockPrisma.auftrag.findMany.mockResolvedValue([futureOrder]);
      mockPrisma.auftrag.count.mockResolvedValue(1);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.orders[0].computedStatus).toBe('aktiv');
    });
  });

  describe('Error Handling', () => {
    it('returns 500 on database errors', async () => {
      mockPrisma.auftrag.findMany.mockRejectedValue(new Error('Database error'));

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Fehler beim Laden der Aufträge');
    });
  });

  describe('Response Shape', () => {
    it('includes kunde relation and arbeitsgaenge count', async () => {
      mockPrisma.auftrag.findMany.mockResolvedValue([]);
      mockPrisma.auftrag.count.mockResolvedValue(0);

      const request = createRequest();
      await GET(request);

      expect(mockPrisma.auftrag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            kunde: {
              select: {
                id: true,
                name: true,
                firma: true,
              },
            },
            _count: {
              select: { arbeitsgaenge: true },
            },
          },
        })
      );
    });
  });
});
