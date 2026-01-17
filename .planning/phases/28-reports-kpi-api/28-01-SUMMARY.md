---
phase: 28-reports-kpi-api
plan: 01
subsystem: api
tags: [supabase, typescript, date-fns, kpi, reports]

# Dependency graph
requires:
  - phase: 26-kpi-detail-api
    provides: KPIOrderItem type pattern, dashboard kpi-orders endpoint pattern
provides:
  - Reports KPI order list query functions
  - /api/reports/kpi-orders endpoint for problem/oldest/tomorrow/stage queries
  - StageType for type-safe stage parameters
affects: [29-reports-kpi-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Stage-based order filtering with Supabase queries
    - Re-exporting types for module convenience

key-files:
  created:
    - src/app/api/reports/kpi-orders/route.ts
  modified:
    - src/lib/reporting-queries.ts

key-decisions:
  - "Match getFunnelData() logic exactly for stage categorization"
  - "Re-export KPIOrderItem from dashboard-queries for API consistency"

patterns-established:
  - "Reports API uses same response shape as dashboard API (type, orders, count, date)"
  - "Stage parameter required when type=stage for explicit stage selection"

# Metrics
duration: 5min
completed: 2026-01-17
---

# Phase 28 Plan 01: Reports KPI API Summary

**Supabase query functions and API endpoint for Reports page KPI drilldowns including problem orders, oldest orders, tomorrow due, and stage-based filtering**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-17T17:15:00Z
- **Completed:** 2026-01-17T17:20:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added 5 query functions to reporting-queries.ts for Reports page KPIs
- Created comprehensive API endpoint supporting 4 query types and 6 stage values
- Maintained consistency with existing dashboard API patterns
- Added proper German error messages for validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Reports KPI order list query functions** - `cffc990` (feat)
2. **Task 2: Create Reports KPI orders API endpoint** - `1544de0` (feat)

## Files Created/Modified

- `src/lib/reporting-queries.ts` - Added getProblemOrders, getOldestOrders, getTomorrowOrders, getOrdersByStage functions and StageType export
- `src/app/api/reports/kpi-orders/route.ts` - New API endpoint with type/stage/date/limit parameters

## Decisions Made

- Match getFunnelData() categorization logic exactly for stage queries to ensure consistency
- Re-export KPIOrderItem from dashboard-queries.ts for convenience and single source of truth
- Use mapOrderToKPIItem helper to reduce code duplication in query functions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- API ready for UI integration in phase 29
- All query types tested: problem, oldest, tomorrow, stage
- Error handling verified with German error messages
- Response shape matches dashboard API for consistent frontend handling

---
*Phase: 28-reports-kpi-api*
*Completed: 2026-01-17*
