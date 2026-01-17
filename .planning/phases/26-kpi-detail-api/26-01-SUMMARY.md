---
phase: 26-kpi-detail-api
plan: 01
subsystem: api
tags: [supabase, date-fns, kpi, dashboard, rest-api]

# Dependency graph
requires:
  - phase: 25-dialog-component
    provides: shadcn/ui Dialog component for UI integration
provides:
  - KPIOrderItem type for consistent order data shape
  - getOpenOrders() query function
  - getOverdueOrders() query function
  - Aligned getCriticalOrders() with versandStatus filter
  - /api/dashboard/kpi-orders endpoint
affects: [27-ui-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - KPI detail API pattern with type-based routing

key-files:
  created:
    - src/app/api/dashboard/kpi-orders/route.ts
  modified:
    - src/lib/dashboard-queries.ts

key-decisions:
  - "Reused CriticalOrder type as KPIOrderItem alias for consistent shape"
  - "Used versandStatus filter across all queries for consistency with KPI counts"
  - "Added T12:00:00 to date parsing to avoid timezone edge cases"

patterns-established:
  - "KPI detail API: GET /api/dashboard/kpi-orders?type=X with optional date param"

# Metrics
duration: 8min
completed: 2026-01-17
---

# Phase 26 Plan 01: KPI Detail API Summary

**REST API endpoint for fetching order lists by KPI type (total/critical/overdue) with consistent data shape and timezone-safe date handling**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-17T10:30:00Z
- **Completed:** 2026-01-17T10:38:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created KPIOrderItem type alias for consistent order data shape across all KPI detail queries
- Added getOpenOrders() and getOverdueOrders() query functions following existing patterns
- Aligned getCriticalOrders() to use versandStatus filter (matching KPI count logic)
- Created /api/dashboard/kpi-orders endpoint with type validation and German error messages
- Implemented timezone-safe date parameter parsing

## Task Commits

Each task was committed atomically:

1. **Task 1: Add KPI order list query functions** - `e6a5c53` (feat)
2. **Task 2: Create KPI orders API endpoint** - `071f80c` (feat)

## Files Created/Modified

- `src/lib/dashboard-queries.ts` - Added KPIOrderItem type, getOpenOrders(), getOverdueOrders(), aligned getCriticalOrders()
- `src/app/api/dashboard/kpi-orders/route.ts` - New API endpoint for KPI detail views

## Decisions Made

- **KPIOrderItem as alias:** Since CriticalOrder already had the exact shape needed (auftragsnummer, kunde, produkttyp, liefertermin, tageUebrig), created a type alias rather than duplicate interface
- **versandStatus filter alignment:** Changed getCriticalOrders() from `status='aktiv'` to `versandStatus!='versendet'` to match the KPI count in getDashboardKPIs
- **Timezone-safe date parsing:** Added explicit T12:00:00 when parsing date parameter to avoid UTC/local timezone edge cases

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed getCriticalOrders filter mismatch**
- **Found during:** Task 1 (Query function implementation)
- **Issue:** getCriticalOrders used `status='aktiv'` but KPI count uses `versandStatus!='versendet'` - could cause count mismatch
- **Fix:** Changed getCriticalOrders to use versandStatus filter
- **Files modified:** src/lib/dashboard-queries.ts
- **Verification:** Query now matches KPI count logic
- **Committed in:** e6a5c53 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed timezone date parsing issue**
- **Found during:** Task 2 (API endpoint testing)
- **Issue:** parseISO("2026-01-20") returned 2026-01-19 due to timezone conversion
- **Fix:** Append T12:00:00 to date string before parsing
- **Files modified:** src/app/api/dashboard/kpi-orders/route.ts
- **Verification:** Date parameter now returns correct date in response
- **Committed in:** 071f80c (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- API endpoint ready for Phase 27 UI integration
- All three KPI types (total, critical, overdue) return consistent data shape
- Response includes type, orders array, count, and date for easy consumption

---
*Phase: 26-kpi-detail-api*
*Completed: 2026-01-17*
