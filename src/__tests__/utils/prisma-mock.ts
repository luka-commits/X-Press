/**
 * Prisma Mock Utilities for Testing
 *
 * Provides a mocked PrismaClient for testing API routes and services
 * without touching the database.
 *
 * Usage:
 *   import { mockPrisma, mockPrismaReset } from '@/__tests__/utils';
 *
 *   jest.mock('@/lib/prisma', () => ({
 *     prisma: mockPrisma,
 *     default: mockPrisma,
 *   }));
 *
 *   beforeEach(() => mockPrismaReset());
 */

import type { Auftrag, Kunde, Maschine, Arbeitsgang } from '@prisma/client';

// Type for mocked Prisma methods
type MockedMethods = {
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  findMany: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  deleteMany: jest.Mock;
  count: jest.Mock;
  aggregate: jest.Mock;
  groupBy: jest.Mock;
};

// Create mock methods for a model
function createModelMock(): MockedMethods {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  };
}

// Mocked Prisma client
export const mockPrisma = {
  auftrag: createModelMock(),
  kunde: createModelMock(),
  maschine: createModelMock(),
  arbeitsgang: createModelMock(),

  // Transaction mock
  $transaction: jest.fn((operations: unknown[]) => Promise.resolve(operations)),

  // Connection lifecycle mocks
  $connect: jest.fn(() => Promise.resolve()),
  $disconnect: jest.fn(() => Promise.resolve()),

  // Raw query mocks
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

// Type the mock for better autocomplete
export type MockPrisma = typeof mockPrisma;

/**
 * Reset all mock implementations and call history
 * Call this in beforeEach() for clean test state
 */
export function mockPrismaReset(): void {
  // Reset model mocks
  Object.values(mockPrisma.auftrag).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
  Object.values(mockPrisma.kunde).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
  Object.values(mockPrisma.maschine).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
  Object.values(mockPrisma.arbeitsgang).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });

  // Reset other mocks
  mockPrisma.$transaction.mockReset();
  mockPrisma.$connect.mockReset();
  mockPrisma.$disconnect.mockReset();
  mockPrisma.$queryRaw.mockReset();
  mockPrisma.$executeRaw.mockReset();

  // Re-setup default transaction behavior
  mockPrisma.$transaction.mockImplementation((operations: unknown[]) =>
    Promise.resolve(operations)
  );
}

/**
 * Helper to setup mock return values for common queries
 *
 * Example:
 *   setupMockData({
 *     auftraege: [mockOrder1, mockOrder2],
 *     maschinen: [mockMachine1],
 *   });
 */
export function setupMockData(data: {
  auftraege?: Auftrag[];
  kunden?: Kunde[];
  maschinen?: Maschine[];
  arbeitsgaenge?: Arbeitsgang[];
}): void {
  if (data.auftraege) {
    mockPrisma.auftrag.findMany.mockResolvedValue(data.auftraege);
    mockPrisma.auftrag.count.mockResolvedValue(data.auftraege.length);
  }
  if (data.kunden) {
    mockPrisma.kunde.findMany.mockResolvedValue(data.kunden);
    mockPrisma.kunde.count.mockResolvedValue(data.kunden.length);
  }
  if (data.maschinen) {
    mockPrisma.maschine.findMany.mockResolvedValue(data.maschinen);
    mockPrisma.maschine.count.mockResolvedValue(data.maschinen.length);
  }
  if (data.arbeitsgaenge) {
    mockPrisma.arbeitsgang.findMany.mockResolvedValue(data.arbeitsgaenge);
    mockPrisma.arbeitsgang.count.mockResolvedValue(data.arbeitsgaenge.length);
  }
}
