---
phase: 31-unit-tests-api
plan: 01
subsystem: testing
tags: [jest, api-testing, prisma-mock, orders-api, status-api, search-api]

# Dependency graph
requires:
  - Phase 30 test infrastructure (mocks, fixtures)
provides:
  - Comprehensive tests for Orders List API with 22 test cases
  - Comprehensive tests for Status Update API with 13 test cases
  - Comprehensive tests for Search API with 15 test cases
affects: [32-integration-tests, future-api-testing, code-quality]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@jest-environment node directive for API route tests"
    - "NextRequest mock construction with URL and body"
    - "Async params handling for Next.js 15 dynamic routes"

key-files:
  created:
    - src/app/api/orders/__tests__/orders.test.ts
    - src/app/api/orders/[id]/status/__tests__/status.test.ts
    - src/app/api/orders/search/__tests__/search.test.ts
  modified: []

key-decisions:
  - "Use @jest-environment node for API routes to access Request/Response globals"
  - "Test Prisma calls structure rather than database integration"
  - "Cover all filter/sort/validation paths documented in routes"

patterns-established:
  - "API test files co-located in __tests__/ directories"
  - "createRequest helper for constructing NextRequest with params"
  - "mockPrismaReset in beforeEach for clean test state"

# Metrics
duration: 8min
completed: 2026-01-18
---

# Phase 31 Plan 01: Unit Tests API Summary

**50 comprehensive API tests covering orders list, status update, and search endpoints with full validation and error handling coverage**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-18T13:00:00Z
- **Completed:** 2026-01-18T13:08:00Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments

- Created 22 tests for Orders List API covering pagination, status/deadline/produkttyp/sachbearbeiter filtering, search, sorting validation, computed status, and error handling
- Created 13 tests for Status Update API covering valid status transitions, statusKommentar, reset to null, validation errors, 404 handling, and database errors
- Created 15 tests for Search API covering query length validation, multi-field search, active-only filter, result limiting, ordering, response shape, and error handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Test Orders List API** - `d58acc8` (test)
2. **Task 2: Test Status Update API** - `76d7d84` (test)
3. **Task 3: Test Search API** - `b257203` (test)

## Files Created/Modified

**Created:**
- `src/app/api/orders/__tests__/orders.test.ts` - 22 test cases for list endpoint
- `src/app/api/orders/[id]/status/__tests__/status.test.ts` - 13 test cases for status update
- `src/app/api/orders/search/__tests__/search.test.ts` - 15 test cases for search endpoint

**Modified:** None

## Test Coverage Added

| Endpoint | Tests | Coverage Areas |
|----------|-------|----------------|
| GET /api/orders | 22 | Pagination, status filter, deadline filter, produkttyp/sachbearbeiter filter, search, sorting validation, computed status, error handling, response shape |
| PATCH /api/orders/[id]/status | 13 | Valid status updates (in_produktion, fertig, problem), statusKommentar, null reset, validation errors, 404, database errors |
| GET /api/orders/search | 15 | Query validation (min 2 chars), multi-field search, active-only filter, limit 10, orderBy liefertermin, response shape, error handling |

## Decisions Made

1. **@jest-environment node:** Required for API routes to access Web API globals (Request, Response, URL)
2. **Mock structure validation:** Test that Prisma is called with correct where/orderBy/select rather than database integration
3. **Comprehensive filter coverage:** Every documented filter path (status, deadline, produkttyp, sachbearbeiter) has dedicated test

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

1. **ESLint unused import:** Fixed by removing unused `sampleOrders` import from search.test.ts before commit

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 50 tests passing
- Test infrastructure proven for API route testing
- Pattern established for future API tests (machines, import, dashboard endpoints)
- Ready for phase 32 integration tests

---
*Phase: 31-unit-tests-api*
*Completed: 2026-01-18*
