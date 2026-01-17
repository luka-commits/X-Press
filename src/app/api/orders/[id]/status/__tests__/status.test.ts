/**
 * Tests for Order Status Update API (/api/orders/[id]/status)
 *
 * Tests status updates, validation, not found handling, and error cases.
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
import { PATCH } from '../route';

describe('PATCH /api/orders/[id]/status', () => {
  beforeEach(() => {
    mockPrismaReset();
  });

  // Helper to create NextRequest with JSON body
  function createRequest(body: Record<string, unknown>): NextRequest {
    const url = new URL('http://localhost:3000/api/orders/GP26-0001/status');
    return new NextRequest(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Helper to create params object (mimics Next.js App Router)
  function createParams(id: string): { params: Promise<{ id: string }> } {
    return {
      params: Promise.resolve({ id }),
    };
  }

  describe('Valid Status Updates', () => {
    it('updates istStatus to in_produktion', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-0001' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.auftrag.update.mockResolvedValue({
        ...mockOrder,
        istStatus: 'in_produktion',
        statusUpdatedAt: new Date(),
      });

      const request = createRequest({ istStatus: 'in_produktion' });
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.istStatus).toBe('in_produktion');
      expect(mockPrisma.auftrag.update).toHaveBeenCalledWith({
        where: { auftragsnummer: 'GP26-0001' },
        data: expect.objectContaining({
          istStatus: 'in_produktion',
          statusUpdatedAt: expect.any(Date),
        }),
      });
    });

    it('updates istStatus to fertig', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-0001' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.auftrag.update.mockResolvedValue({
        ...mockOrder,
        istStatus: 'fertig',
        statusUpdatedAt: new Date(),
      });

      const request = createRequest({ istStatus: 'fertig' });
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.istStatus).toBe('fertig');
    });

    it('updates istStatus to problem', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-0001' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.auftrag.update.mockResolvedValue({
        ...mockOrder,
        istStatus: 'problem',
        statusKommentar: 'Material fehlt',
        statusUpdatedAt: new Date(),
      });

      const request = createRequest({
        istStatus: 'problem',
        statusKommentar: 'Material fehlt',
      });
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.istStatus).toBe('problem');
      expect(data.statusKommentar).toBe('Material fehlt');
    });

    it('updates statusKommentar along with new status', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-0001' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.auftrag.update.mockResolvedValue({
        ...mockOrder,
        istStatus: 'fertig',
        statusKommentar: 'Vorzeitig fertig',
        statusUpdatedAt: new Date(),
      });

      const request = createRequest({
        istStatus: 'fertig',
        statusKommentar: 'Vorzeitig fertig',
      });
      const response = await PATCH(request, createParams('GP26-0001'));

      expect(response.status).toBe(200);
      expect(mockPrisma.auftrag.update).toHaveBeenCalledWith({
        where: { auftragsnummer: 'GP26-0001' },
        data: expect.objectContaining({
          istStatus: 'fertig',
          statusKommentar: 'Vorzeitig fertig',
        }),
      });
    });

    it('resets status when istStatus is null', async () => {
      const mockOrder = createMockOrder({
        auftragsnummer: 'GP26-0001',
        istStatus: 'fertig' as const,
      });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.auftrag.update.mockResolvedValue({
        ...mockOrder,
        istStatus: null,
        statusKommentar: null,
        statusUpdatedAt: new Date(),
      });

      const request = createRequest({ istStatus: null });
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.istStatus).toBeNull();
    });

    it('sets statusUpdatedAt to current timestamp', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-0001' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.auftrag.update.mockResolvedValue({
        ...mockOrder,
        istStatus: 'fertig',
        statusUpdatedAt: new Date(),
      });

      const request = createRequest({ istStatus: 'fertig' });
      await PATCH(request, createParams('GP26-0001'));

      expect(mockPrisma.auftrag.update).toHaveBeenCalledWith({
        where: { auftragsnummer: 'GP26-0001' },
        data: expect.objectContaining({
          statusUpdatedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('Validation Errors', () => {
    it('returns 400 when istStatus is undefined', async () => {
      const request = createRequest({});
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('istStatus');
    });

    it('returns 400 for invalid istStatus values', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-0001' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);

      const request = createRequest({ istStatus: 'invalid_status' });
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Ungültiger Status');
    });

    it('returns 400 for status not in enum', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-0001' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);

      const request = createRequest({ istStatus: 'completed' });
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Erlaubte Werte');
    });
  });

  describe('Not Found', () => {
    it('returns 404 when order not found', async () => {
      mockPrisma.auftrag.findUnique.mockResolvedValue(null);

      const request = createRequest({ istStatus: 'fertig' });
      const response = await PATCH(request, createParams('GP26-NOTFOUND'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('nicht gefunden');
    });
  });

  describe('Error Handling', () => {
    it('returns 500 on database errors during findUnique', async () => {
      mockPrisma.auftrag.findUnique.mockRejectedValue(new Error('Database connection error'));

      const request = createRequest({ istStatus: 'fertig' });
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Fehler');
    });

    it('returns 500 on database errors during update', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-0001' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.auftrag.update.mockRejectedValue(new Error('Update failed'));

      const request = createRequest({ istStatus: 'fertig' });
      const response = await PATCH(request, createParams('GP26-0001'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Fehler');
    });
  });

  describe('ID Parameter Handling', () => {
    it('uses order ID from params correctly', async () => {
      const mockOrder = createMockOrder({ auftragsnummer: 'GP26-CUSTOM' });
      mockPrisma.auftrag.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.auftrag.update.mockResolvedValue(mockOrder);

      const request = createRequest({ istStatus: 'fertig' });
      await PATCH(request, createParams('GP26-CUSTOM'));

      expect(mockPrisma.auftrag.findUnique).toHaveBeenCalledWith({
        where: { auftragsnummer: 'GP26-CUSTOM' },
        select: { auftragsnummer: true },
      });
      expect(mockPrisma.auftrag.update).toHaveBeenCalledWith({
        where: { auftragsnummer: 'GP26-CUSTOM' },
        data: expect.any(Object),
      });
    });
  });
});
