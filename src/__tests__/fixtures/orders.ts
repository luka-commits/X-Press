/**
 * Test Fixtures for Auftrag (Order) Data
 *
 * Provides factory functions and sample data for testing.
 * Types match Prisma schema exactly.
 *
 * Usage:
 *   import { createMockOrder, sampleOrders } from '@/__tests__/fixtures';
 *
 *   const order = createMockOrder({ status: 'problem' });
 */

import type { Auftrag, IstStatus, VersandStatus } from '@prisma/client';

// Default base order for factory function
const baseOrder: Auftrag = {
  auftragsnummer: 'GP26-0001',
  kundeId: 1,
  produkttyp: 'Fadengeheftete Broschuren',
  produktbeschreibung: 'A4 Broschure, 48 Seiten, 4/4-farbig',
  sachbearbeiter: 'Maria Mikalo',
  sachbearbeiterTelefon: '+49 30 12345678',
  sachbearbeiterEmail: 'maria.mikalo@xpress.de',
  auflage: 5000,
  liefertermin: new Date('2026-02-15T12:00:00Z'),
  drucktermin: new Date('2026-02-10T08:00:00Z'),
  wtvTermin: new Date('2026-02-08T08:00:00Z'),
  prioritaet: 5,
  status: 'aktiv',
  istStatus: null,
  statusKommentar: null,
  statusUpdatedAt: null,
  versandStatus: null,
  versandKommentar: null,
  versandUpdatedAt: null,
  lieferStrasse: 'Musterstrasse 123',
  lieferPlz: '10115',
  lieferOrt: 'Berlin',
  lieferLand: 'Deutschland',
  lieferLat: 52.52,
  lieferLng: 13.405,
  xmlImportDatum: new Date('2026-01-15T10:00:00Z'),
  createdAt: new Date('2026-01-15T10:00:00Z'),
  updatedAt: new Date('2026-01-15T10:00:00Z'),
};

/**
 * Create a mock order with optional overrides
 *
 * @param overrides - Partial order data to override defaults
 * @returns Complete Auftrag object
 *
 * Examples:
 *   createMockOrder() // Default order
 *   createMockOrder({ istStatus: 'fertig' }) // Completed order
 *   createMockOrder({ versandStatus: 'versendet' }) // Shipped order
 */
export function createMockOrder(overrides: Partial<Auftrag> = {}): Auftrag {
  const uniqueId = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return {
    ...baseOrder,
    auftragsnummer: `GP26-${uniqueId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create an order in "offen" state (no status set)
 */
export function createOffenOrder(overrides: Partial<Auftrag> = {}): Auftrag {
  return createMockOrder({
    istStatus: null,
    versandStatus: null,
    ...overrides,
  });
}

/**
 * Create an order in "in_produktion" state
 */
export function createInProduktionOrder(overrides: Partial<Auftrag> = {}): Auftrag {
  return createMockOrder({
    istStatus: 'in_produktion' as IstStatus,
    statusUpdatedAt: new Date(),
    ...overrides,
  });
}

/**
 * Create an order in "fertig" state
 */
export function createFertigOrder(overrides: Partial<Auftrag> = {}): Auftrag {
  return createMockOrder({
    istStatus: 'fertig' as IstStatus,
    statusUpdatedAt: new Date(),
    ...overrides,
  });
}

/**
 * Create an order in "problem" state
 */
export function createProblemOrder(overrides: Partial<Auftrag> = {}): Auftrag {
  return createMockOrder({
    istStatus: 'problem' as IstStatus,
    statusKommentar: 'Material nicht verfugbar',
    statusUpdatedAt: new Date(),
    ...overrides,
  });
}

/**
 * Create an order ready for shipping
 */
export function createVersandbereitOrder(overrides: Partial<Auftrag> = {}): Auftrag {
  return createMockOrder({
    istStatus: 'fertig' as IstStatus,
    versandStatus: 'versandbereit' as VersandStatus,
    versandUpdatedAt: new Date(),
    ...overrides,
  });
}

/**
 * Create a shipped order
 */
export function createVersendetOrder(overrides: Partial<Auftrag> = {}): Auftrag {
  return createMockOrder({
    istStatus: 'fertig' as IstStatus,
    versandStatus: 'versendet' as VersandStatus,
    versandKommentar: 'DHL Sendungsnummer: 1234567890',
    versandUpdatedAt: new Date(),
    ...overrides,
  });
}

/**
 * Pre-created sample orders covering all states
 * Ready to use in tests without factory function
 */
export const sampleOrders = {
  /** Order with no status (open/new) */
  offen: createMockOrder({
    auftragsnummer: 'GP26-TEST-OFFEN',
    produkttyp: 'Visitenkarten',
    istStatus: null,
    versandStatus: null,
  }),

  /** Order currently in production */
  inProduktion: createMockOrder({
    auftragsnummer: 'GP26-TEST-PROD',
    produkttyp: 'Plakate A1',
    istStatus: 'in_produktion' as IstStatus,
    statusUpdatedAt: new Date('2026-01-16T09:00:00Z'),
  }),

  /** Order completed in production */
  fertig: createMockOrder({
    auftragsnummer: 'GP26-TEST-FERTIG',
    produkttyp: 'Flyer DIN A5',
    istStatus: 'fertig' as IstStatus,
    statusUpdatedAt: new Date('2026-01-16T14:00:00Z'),
  }),

  /** Order with a problem */
  problem: createMockOrder({
    auftragsnummer: 'GP26-TEST-PROBLEM',
    produkttyp: 'Hardcover Buch',
    istStatus: 'problem' as IstStatus,
    statusKommentar: 'Papierlieferung verspaetet',
    statusUpdatedAt: new Date('2026-01-16T11:00:00Z'),
  }),

  /** Order ready for shipping */
  versandbereit: createMockOrder({
    auftragsnummer: 'GP26-TEST-BEREIT',
    produkttyp: 'Kataloge',
    istStatus: 'fertig' as IstStatus,
    versandStatus: 'versandbereit' as VersandStatus,
    versandUpdatedAt: new Date('2026-01-16T15:00:00Z'),
  }),

  /** Order already shipped */
  versendet: createMockOrder({
    auftragsnummer: 'GP26-TEST-VERSANDT',
    produkttyp: 'Broschueren',
    istStatus: 'fertig' as IstStatus,
    versandStatus: 'versendet' as VersandStatus,
    versandKommentar: 'Lieferschein: LS-2026-001',
    versandUpdatedAt: new Date('2026-01-16T16:00:00Z'),
  }),

  /** High priority order */
  hochPrioritaet: createMockOrder({
    auftragsnummer: 'GP26-TEST-PRIO',
    produkttyp: 'Eilauftrag Flyer',
    prioritaet: 1,
    istStatus: 'in_produktion' as IstStatus,
    liefertermin: new Date('2026-01-18T08:00:00Z'),
  }),
};

/**
 * Array of all sample orders for bulk testing
 */
export const allSampleOrders: Auftrag[] = Object.values(sampleOrders);
