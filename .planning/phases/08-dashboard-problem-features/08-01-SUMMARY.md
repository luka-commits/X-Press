---
phase: 08-dashboard-problem-features
plan: 01
subsystem: ui
tags: [dashboard, kpi, supabase, react]

# Dependency graph
requires:
  - phase: 07-dashboard-status-column
    provides: istStatus column and database field
provides:
  - Problem-Auftraege KPI card on dashboard
  - problemOrders count in DashboardKPIs interface
affects: [08-02 (problem filter may reuse query pattern)]

# Tech tracking
tech-stack:
  added: []
  patterns: [KPI card with conditional critical variant]

key-files:
  created: []
  modified: [src/lib/dashboard-queries.ts, src/components/dashboard/KPICard.tsx, src/app/page.tsx]

key-decisions:
  - "Added problemOrders to parallel query array for performance"
  - "Used 5-column grid layout to accommodate new KPI card"

patterns-established:
  - "Problem count query: status='aktiv' AND istStatus='problem'"

# Metrics
duration: 3 min
completed: 2026-01-16
---

# Phase 8 Plan 1: Problem-Zaehler Summary

**Problem-Auftraege KPI card with red critical styling when problem orders exist**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-16T01:47:00Z
- **Completed:** 2026-01-16T01:50:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added problemOrders count to DashboardKPIs interface and query
- Created Problem-Auftraege KPI card with critical (red) variant when count > 0
- Updated grid layout to 5 columns to accommodate new card

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getProblemOrdersCount query function** - `28e8aff` (feat)
2. **Task 2: Add Problem-Auftraege KPI card to dashboard** - `ca667b6` (feat)

## Files Created/Modified
- `src/lib/dashboard-queries.ts` - Added problemOrders to DashboardKPIs interface and parallel query
- `src/components/dashboard/KPICard.tsx` - Added problemOrders prop and Problem-Auftraege card
- `src/app/page.tsx` - Pass problemOrders to KPICardsGrid

## Decisions Made
- Added problemOrders query to the existing parallel Promise.all for performance
- Placed Problem-Auftraege card after "Bald faellig" card for logical grouping of problem indicators
- Changed grid from 4 to 5 columns to accommodate the new card

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Problem count KPI complete, ready for Phase 08-02
- Filter for problem orders can build on this foundation

---
*Phase: 08-dashboard-problem-features*
*Completed: 2026-01-16*
