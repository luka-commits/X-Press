/**
 * Supabase Mock Utilities for Testing
 *
 * Provides a mocked Supabase client for testing components and services
 * that use Supabase REST API for data fetching.
 *
 * Usage:
 *   import { mockSupabase, mockSupabaseReset, configureMockQuery } from '@/__tests__/utils';
 *
 *   jest.mock('@/lib/supabase', () => ({
 *     supabase: mockSupabase,
 *   }));
 *
 *   beforeEach(() => mockSupabaseReset());
 */

// Import types from supabase module - these match the Prisma schema
// Re-defined here to avoid path resolution issues in test environment
export interface Auftrag {
  auftragsnummer: string;
  kundeId: number | null;
  produkttyp: string | null;
  produktbeschreibung: string | null;
  liefertermin: string | null;
  drucktermin: string | null;
  wtvTermin: string | null;
  prioritaet: number | null;
  status: string;
  istStatus: 'in_produktion' | 'fertig' | 'problem' | null;
  statusKommentar: string | null;
  statusUpdatedAt: string | null;
  versandStatus: 'offen' | 'versandbereit' | 'versendet' | null;
  versandKommentar: string | null;
  versandUpdatedAt: string | null;
  xmlImportDatum: string;
  createdAt: string;
  updatedAt: string;
}

export interface Maschine {
  id: number;
  name: string;
  kurzname: string | null;
  kostenstelle: string | null;
  tageskapazitaetMinuten: number;
  istLeitmaschine: boolean;
  aktiv: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Kunde {
  id: number;
  name: string | null;
  firma: string | null;
  telefon: string | null;
  mobil: string | null;
  email: string | null;
  adresse: string | null;
  externeNummer: string | null;
  createdAt: string;
  updatedAt: string;
}

// Type for chained query builder
interface MockQueryBuilder<T = unknown> {
  select: jest.Mock<MockQueryBuilder<T>>;
  insert: jest.Mock<MockQueryBuilder<T>>;
  update: jest.Mock<MockQueryBuilder<T>>;
  delete: jest.Mock<MockQueryBuilder<T>>;
  eq: jest.Mock<MockQueryBuilder<T>>;
  neq: jest.Mock<MockQueryBuilder<T>>;
  gt: jest.Mock<MockQueryBuilder<T>>;
  gte: jest.Mock<MockQueryBuilder<T>>;
  lt: jest.Mock<MockQueryBuilder<T>>;
  lte: jest.Mock<MockQueryBuilder<T>>;
  like: jest.Mock<MockQueryBuilder<T>>;
  ilike: jest.Mock<MockQueryBuilder<T>>;
  is: jest.Mock<MockQueryBuilder<T>>;
  in: jest.Mock<MockQueryBuilder<T>>;
  order: jest.Mock<MockQueryBuilder<T>>;
  limit: jest.Mock<MockQueryBuilder<T>>;
  range: jest.Mock<MockQueryBuilder<T>>;
  single: jest.Mock<MockQueryBuilder<T>>;
  maybeSingle: jest.Mock<MockQueryBuilder<T>>;
  then: jest.Mock<Promise<{ data: T[] | null; error: null | Error }>>;
}

// Store for configured mock responses per table
const mockResponses: Map<string, { data: unknown[] | null; error: Error | null }> = new Map();

// Create a chainable query builder mock
function createQueryBuilder<T = unknown>(tableName: string): MockQueryBuilder<T> {
  const builder: MockQueryBuilder<T> = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    neq: jest.fn(() => builder),
    gt: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    lt: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    like: jest.fn(() => builder),
    ilike: jest.fn(() => builder),
    is: jest.fn(() => builder),
    in: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    range: jest.fn(() => builder),
    single: jest.fn(() => builder),
    maybeSingle: jest.fn(() => builder),
    then: jest.fn((resolve) => {
      const response = mockResponses.get(tableName) || { data: [], error: null };
      return Promise.resolve(response).then(resolve);
    }),
  };
  return builder;
}

// Mocked Supabase client
export const mockSupabase = {
  from: jest.fn((tableName: string) => createQueryBuilder(tableName)),
  rpc: jest.fn(),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: null, error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signIn: jest.fn(),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
};

/**
 * Reset all mock implementations and stored responses
 * Call this in beforeEach() for clean test state
 */
export function mockSupabaseReset(): void {
  mockResponses.clear();
  mockSupabase.from.mockClear();
  mockSupabase.rpc.mockClear();
  mockSupabase.auth.getUser.mockClear();
  mockSupabase.auth.getSession.mockClear();
}

/**
 * Configure mock data for a specific table query
 *
 * Example:
 *   configureMockQuery('Auftrag', { data: [mockOrder1, mockOrder2] });
 *   configureMockQuery('Maschine', { data: [mockMachine1] });
 *   configureMockQuery('Auftrag', { error: new Error('Database error') });
 */
export function configureMockQuery<T>(
  tableName: string,
  response: { data?: T[] | null; error?: Error | null }
): void {
  mockResponses.set(tableName, {
    data: response.data ?? null,
    error: response.error ?? null,
  });
}

/**
 * Configure mock data for Auftrag table
 */
export function mockAuftraege(auftraege: Auftrag[]): void {
  configureMockQuery('Auftrag', { data: auftraege });
}

/**
 * Configure mock data for Maschine table
 */
export function mockMaschinen(maschinen: Maschine[]): void {
  configureMockQuery('Maschine', { data: maschinen });
}

/**
 * Configure mock data for Kunde table
 */
export function mockKunden(kunden: Kunde[]): void {
  configureMockQuery('Kunde', { data: kunden });
}

/**
 * Configure a database error for a table
 */
export function mockQueryError(tableName: string, errorMessage: string): void {
  configureMockQuery(tableName, {
    data: null,
    error: new Error(errorMessage),
  });
}
