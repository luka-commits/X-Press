/**
 * Test Fixtures - Central Export
 *
 * Re-exports all test fixtures for convenient imports:
 *
 *   import {
 *     createMockOrder,
 *     sampleOrders,
 *     createMockMachine,
 *     sampleMachines,
 *   } from '@/__tests__/fixtures';
 */

// Order fixtures
export {
  createMockOrder,
  createOffenOrder,
  createInProduktionOrder,
  createFertigOrder,
  createProblemOrder,
  createVersandbereitOrder,
  createVersendetOrder,
  sampleOrders,
  allSampleOrders,
} from './orders';

// Machine fixtures
export {
  createMockMachine,
  createLeitmaschine,
  sampleMachines,
  allLeitmaschinen,
  allSampleMachines,
  getMachineByKostenstelle,
} from './machines';
