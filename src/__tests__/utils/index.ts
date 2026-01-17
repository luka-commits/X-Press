/**
 * Test Utilities - Central Export
 *
 * Re-exports all test utilities for convenient imports:
 *
 *   import { mockPrisma, mockSupabase, mockPrismaReset } from '@/__tests__/utils';
 */

// Prisma mocks
export { mockPrisma, mockPrismaReset, setupMockData, type MockPrisma } from './prisma-mock';

// Supabase mocks
export {
  mockSupabase,
  mockSupabaseReset,
  configureMockQuery,
  mockAuftraege,
  mockMaschinen,
  mockKunden,
  mockQueryError,
} from './supabase-mock';
