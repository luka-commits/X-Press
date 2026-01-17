---
phase: 29-reports-drilldown-ui
plan: 01
subsystem: ui
tags: [react, dialog, shadcn, reports, kpi, drilldown]

# Dependency graph
requires:
  - phase: 28-reports-kpi-api
    provides: /api/reports/kpi-orders endpoint for problem/oldest/tomorrow/stage queries
provides:
  - ReportsOrdersDialog component for displaying KPI order lists
  - Clickable SnapshotKPIs cards with onKpiClick callback
affects: [29-reports-drilldown-ui-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Clickable KPI cards with keyboard accessibility
    - Reusable dialog pattern for Reports page drilldowns

key-files:
  created:
    - src/components/reports/ReportsOrdersDialog.tsx
  modified:
    - src/components/reports/SnapshotKPIs.tsx

key-decisions:
  - "Follow KPIOrdersDialog pattern from dashboard for consistency"
  - "aktiveAuftraege not clickable (just a total count, no meaningful drilldown)"

patterns-established:
  - "Reports dialog fetches from /api/reports/kpi-orders with type and optional stage params"
  - "Clickable KPI cards use role=button, tabIndex=0, and Enter/Space handlers for accessibility"

# Metrics
duration: 3min
completed: 2026-01-17
---

# Phase 29 Plan 01: Reports Drilldown UI Summary

**ReportsOrdersDialog component and clickable SnapshotKPIs cards establishing drilldown pattern for Reports page**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-17T04:47:43Z
- **Completed:** 2026-01-17T04:50:07Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created ReportsOrdersDialog component following dashboard KPIOrdersDialog pattern
- Made 3 KPI cards clickable (problem, oldest, tomorrow) with hover effects
- Added keyboard accessibility (role, tabIndex, Enter/Space handlers)
- Established drilldown pattern for Reports page KPIs

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ReportsOrdersDialog component** - `6acb154` (feat)
2. **Task 2: Make SnapshotKPIs cards clickable** - `7da6cd5` (feat)

## Files Created/Modified

- `src/components/reports/ReportsOrdersDialog.tsx` - Dialog component for Reports KPI drilldowns with table display
- `src/components/reports/SnapshotKPIs.tsx` - Added onKpiClick prop and click handlers for 3 KPI cards

## Decisions Made

- Follow KPIOrdersDialog pattern from dashboard for API fetching and table display
- Keep aktiveAuftraege non-clickable since it's just a total count without meaningful drilldown
- Use same color-coded badge logic for Tage übrig: red (<=0), yellow (1), green (2+)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dialog component ready to be integrated with SnapshotKPIs on Reports page
- onKpiClick callback ready for parent component to manage dialog state
- Pattern established for FunnelChart and StageDistributionChart drilldowns in next plan

---
*Phase: 29-reports-drilldown-ui*
*Completed: 2026-01-17*
