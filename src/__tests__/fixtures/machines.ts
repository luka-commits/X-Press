/**
 * Test Fixtures for Maschine (Machine) Data
 *
 * Provides factory functions and sample data for testing.
 * Includes actual Leitmaschinen from X-Press production floor.
 *
 * Usage:
 *   import { createMockMachine, sampleMachines } from '@/__tests__/fixtures';
 *
 *   const machine = createMockMachine({ istLeitmaschine: true });
 */

import type { Maschine } from '@prisma/client';

// Default base machine for factory function
const baseMachine: Maschine = {
  id: 1,
  name: 'Test Maschine',
  kurzname: 'TM',
  kostenstelle: '000000',
  tageskapazitaetMinuten: 480, // 8 hours default
  istLeitmaschine: false,
  aktiv: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

let machineIdCounter = 1000;

/**
 * Create a mock machine with optional overrides
 *
 * @param overrides - Partial machine data to override defaults
 * @returns Complete Maschine object
 *
 * Examples:
 *   createMockMachine() // Default machine
 *   createMockMachine({ istLeitmaschine: true }) // Leitmaschine
 *   createMockMachine({ aktiv: false }) // Inactive machine
 */
export function createMockMachine(overrides: Partial<Maschine> = {}): Maschine {
  const id = overrides.id ?? machineIdCounter++;

  return {
    ...baseMachine,
    id,
    kostenstelle: `KST-${id.toString().padStart(4, '0')}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a Leitmaschine (lead machine for capacity tracking)
 */
export function createLeitmaschine(overrides: Partial<Maschine> = {}): Maschine {
  return createMockMachine({
    istLeitmaschine: true,
    tageskapazitaetMinuten: 480,
    ...overrides,
  });
}

/**
 * Pre-created sample machines matching actual X-Press Leitmaschinen
 *
 * Tier 1 - Critical Print Capacity
 * Tier 2 - Critical Path (Finishing)
 * Tier 3 - Premium Finishing
 */
export const sampleMachines = {
  // Tier 1 - Critical Print Capacity
  /** Flagship 8-color + coating press, ~300 EUR/hour */
  speedmasterXL106: createMockMachine({
    id: 1,
    name: 'Heidelberg Speedmaster XL 106-8P',
    kurzname: 'XL106',
    kostenstelle: 'SM-XL106-8P',
    tageskapazitaetMinuten: 480,
    istLeitmaschine: true,
    aktiv: true,
  }),

  /** 6-color + UV coating */
  speedmasterCX102: createMockMachine({
    id: 2,
    name: 'Heidelberg Speedmaster CX 102-6+L',
    kurzname: 'CX102',
    kostenstelle: 'SM-CX102-6L',
    tageskapazitaetMinuten: 480,
    istLeitmaschine: true,
    aktiv: true,
  }),

  /** 5-color + coating */
  speedmasterCD102: createMockMachine({
    id: 3,
    name: 'Heidelberg Speedmaster CD 102-5L',
    kurzname: 'CD102',
    kostenstelle: 'SM-CD102-5L',
    tageskapazitaetMinuten: 480,
    istLeitmaschine: true,
    aktiv: true,
  }),

  /** 5-color + coating smaller format */
  speedmasterCD74: createMockMachine({
    id: 4,
    name: 'Heidelberg Speedmaster CD 74-5P+LX',
    kurzname: 'CD74',
    kostenstelle: 'SM-CD74-5PX',
    tageskapazitaetMinuten: 420,
    istLeitmaschine: true,
    aktiv: true,
  }),

  /** 5-color + coating compact */
  speedmasterSX52: createMockMachine({
    id: 5,
    name: 'Heidelberg Speedmaster SX 52-5L',
    kurzname: 'SX52',
    kostenstelle: 'SM-SX52-5L',
    tageskapazitaetMinuten: 360,
    istLeitmaschine: true,
    aktiv: true,
  }),

  // Tier 2 - Critical Path (often bottleneck)
  /** Fully automatic cutting robot - BOTTLENECK */
  polarPace: createMockMachine({
    id: 6,
    name: 'POLAR PACE 137 LW',
    kurzname: 'POLAR',
    kostenstelle: 'POLAR-PACE',
    tageskapazitaetMinuten: 480,
    istLeitmaschine: true,
    aktiv: true,
  }),

  /** High-performance saddle stitcher */
  sammelhefterST400: createMockMachine({
    id: 7,
    name: 'Heidelberg Sammelhefter ST-400',
    kurzname: 'ST400',
    kostenstelle: 'HB-ST400',
    tageskapazitaetMinuten: 480,
    istLeitmaschine: true,
    aktiv: true,
  }),

  // Tier 3 - Premium Finishing
  /** Die-cutting automat */
  stanzautomat: createMockMachine({
    id: 8,
    name: 'IMG Brausse 1050 SEF',
    kurzname: 'STANZ',
    kostenstelle: 'IMG-1050',
    tageskapazitaetMinuten: 420,
    istLeitmaschine: false,
    aktiv: true,
  }),

  /** Partial UV coating, glitter effects */
  uvLackierung: createMockMachine({
    id: 9,
    name: 'SPS Vitessa XP',
    kurzname: 'UV-LACK',
    kostenstelle: 'SPS-VITESSA',
    tageskapazitaetMinuten: 360,
    istLeitmaschine: false,
    aktiv: true,
  }),

  /** Lamination machine */
  kaschierung: createMockMachine({
    id: 10,
    name: 'Billhofer EK-Trendline',
    kurzname: 'KASCH',
    kostenstelle: 'BH-TREND',
    tageskapazitaetMinuten: 420,
    istLeitmaschine: false,
    aktiv: true,
  }),

  // Inactive machine for testing
  inaktiv: createMockMachine({
    id: 99,
    name: 'Alte Maschine (deaktiviert)',
    kurzname: 'INAKTIV',
    kostenstelle: 'OLD-MACHINE',
    tageskapazitaetMinuten: 0,
    istLeitmaschine: false,
    aktiv: false,
  }),
};

/**
 * Array of all Leitmaschinen (active, capacity-tracked machines)
 */
export const allLeitmaschinen: Maschine[] = Object.values(sampleMachines).filter(
  (m) => m.istLeitmaschine && m.aktiv
);

/**
 * Array of all sample machines including inactive
 */
export const allSampleMachines: Maschine[] = Object.values(sampleMachines);

/**
 * Get machine by Kostenstelle (cost center)
 */
export function getMachineByKostenstelle(kostenstelle: string): Maschine | undefined {
  return allSampleMachines.find((m) => m.kostenstelle === kostenstelle);
}
