# Testing Patterns

**Analysis Date:** 2026-01-16

## Test Framework

**Status:** Not configured

**Current State:**
- No test files found (`*.test.ts`, `*.spec.ts`, `__tests__/`)
- No test framework installed (no Jest, Vitest, Testing Library)
- No test scripts in `package.json`

## Linting & Code Quality

**ESLint:**
- Installed: `eslint ^8.57.0`, `eslint-config-next 14.2.21`
- Configuration: Next.js default (no `.eslintrc` file)
- Script: `npm run lint`

**TypeScript:**
- Version: `^5.7.3`
- Strict mode: Enabled (`"strict": true`)
- Config: `tsconfig.json`

**Prettier:**
- Not configured (no `.prettierrc`)

## Test File Organization

**Recommended Structure (not implemented):**
```
src/
  lib/
    xml-parser.ts
    xml-parser.test.ts      # Co-located
  components/
    dashboard/
      KPICard.tsx
      KPICard.test.tsx      # Co-located
```

## Priority Test Candidates

**Critical Business Logic:**
1. `src/lib/xml-parser.ts` - Complex encoding fixes, date conversion
2. `src/lib/import-service.ts` - Database transactions, machine creation
3. `src/lib/dashboard-queries.ts` - Date filtering, aggregation logic

**API Routes:**
1. `src/app/api/import/route.ts` - File upload, XML parsing
2. `src/app/api/orders/route.ts` - Query parameter handling

**Components (if testing added):**
1. `src/components/orders/OrderFilters.tsx` - Filter state management
2. `src/components/dashboard/DashboardClient.tsx` - Auto-refresh logic

## Recommended Framework

**For this codebase:**
- Vitest (fast, TypeScript-first, Next.js compatible)
- React Testing Library (component testing)
- MSW (API mocking)

**Minimal Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Coverage

**Current:** 0% (no tests)

**Target Areas:**
- XML encoding fix (`fixEncoding()`) - edge cases for umlauts
- Date conversion (`excelDateToJS()`) - Excel date edge cases
- Query aggregation - verify correct grouping

## Recommendations

**Phase 1 - Critical Path:**
1. Add Vitest configuration
2. Test `xml-parser.ts` with sample XMLs from `data/samples/`
3. Test `import-service.ts` with mocked Prisma

**Phase 2 - API Layer:**
1. Test API routes with request mocking
2. Verify error responses

**Phase 3 - Components:**
1. Test interactive components (filters, search)
2. Snapshot tests for presentational components

---

*Testing analysis: 2026-01-16*
*Update when test infrastructure added*
