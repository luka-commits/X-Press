# Testing Patterns

**Last Updated:** 2026-01-17

## Test Framework

**Status:** Configured (Jest 30 + Testing Library)

**Framework Stack:**
- **Jest:** 30.2.0 with `next/jest` helper
- **Testing Library React:** 16.3.1
- **jest-dom:** 6.9.1 for extended matchers

**Configuration Files:**
- `jest.config.js` - Jest configuration with Next.js integration
- `jest.setup.js` - Testing Library matchers and global mocks

## Test File Organization

**Current Structure:**
```
src/
  __tests__/
    utils/                    # Test utilities (excluded from test discovery)
      prisma-mock.ts          # Mocked Prisma client
      supabase-mock.ts        # Mocked Supabase client
      index.ts                # Central exports
    fixtures/                 # Test data (excluded from test discovery)
      orders.ts               # Order factory functions and samples
      machines.ts             # Machine factory functions and samples
      index.ts                # Central exports
  components/
    dashboard/
      __tests__/
        KPICard.test.tsx      # Component tests
  hooks/
    __tests__/
      useOrderFormatter.test.ts  # Hook tests
```

**Pattern:** `__tests__/` directories co-located with source code

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- KPICard.test.tsx

# Run in watch mode
npm test -- --watch
```

## Test Utilities

**Location:** `src/__tests__/utils/`

**Prisma Mock Usage:**
```typescript
import { mockPrisma, mockPrismaReset, setupMockData } from '@/__tests__/utils';

// Mock the Prisma module
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));

// Reset before each test
beforeEach(() => mockPrismaReset());

// Configure mock data
setupMockData({
  auftraege: [mockOrder1, mockOrder2],
  maschinen: [mockMachine1],
});
```

**Supabase Mock Usage:**
```typescript
import { mockSupabase, mockSupabaseReset, mockAuftraege } from '@/__tests__/utils';

// Mock the Supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Reset before each test
beforeEach(() => mockSupabaseReset());

// Configure mock data
mockAuftraege([mockOrder1, mockOrder2]);
```

## Test Fixtures

**Location:** `src/__tests__/fixtures/`

**Order Fixtures:**
```typescript
import {
  createMockOrder,
  createInProduktionOrder,
  createProblemOrder,
  sampleOrders,
  allSampleOrders,
} from '@/__tests__/fixtures';

// Factory with overrides
const order = createMockOrder({ status: 'problem' });

// Pre-created samples
const { offen, inProduktion, fertig, problem } = sampleOrders;
```

**Machine Fixtures:**
```typescript
import {
  createMockMachine,
  createLeitmaschine,
  sampleMachines,
  allLeitmaschinen,
} from '@/__tests__/fixtures';

// Factory with overrides
const machine = createLeitmaschine({ name: 'Custom Machine' });

// Pre-created samples (actual X-Press machines)
const { speedmasterXL106, polarPace, sammelhefterST400 } = sampleMachines;
```

## Coverage

**Current State:**
- Tests: 30 tests in 2 suites
- Coverage: Not yet measured (run with `--coverage`)

**Tested Areas:**
- `KPICard` component - rendering, variants, click handling
- `useOrderFormatter` hook - date formatting, status badges, pipeline stages

## Priority Test Candidates

**Critical Business Logic (not yet tested):**
1. `src/lib/xml-parser.ts` - Complex encoding fixes, date conversion
2. `src/lib/import-service.ts` - Database transactions, machine creation
3. `src/lib/dashboard-queries.ts` - Date filtering, aggregation logic

**API Routes (not yet tested):**
1. `src/app/api/import/route.ts` - File upload, XML parsing
2. `src/app/api/orders/route.ts` - Query parameter handling
3. `src/app/api/orders/[id]/status/route.ts` - Status update validation

**Components (not yet tested):**
1. `src/components/orders/OrderFilters.tsx` - Filter state management
2. `src/components/dashboard/DashboardClient.tsx` - Auto-refresh logic

## Linting & Code Quality

**ESLint:**
- Installed: `eslint ^8.57.0`, `eslint-config-next 14.2.21`
- Configuration: Next.js default
- Script: `npm run lint`

**TypeScript:**
- Version: `^5.7.3`
- Strict mode: Enabled
- Config: `tsconfig.json`

**Prettier:**
- Configured via `.prettierrc`
- Integrated with lint-staged

---

*Updated: 2026-01-17 - Test infrastructure configured with Jest 30, mocks, and fixtures*
