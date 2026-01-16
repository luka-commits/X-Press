---
phase: 22-reports-navigation
plan: 01
subsystem: ui
tags: [navigation, sidebar, reports, api, filtering]

# Dependency graph
requires:
  - phase: 21-pipeline-view
    provides: Pipeline-Status consolidation
provides:
  - Reports accessible from main sidebar navigation
  - Abgeschlossene tab shows only shipped orders
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sidebar navigation array pattern"
    - "Supabase eq() filter for single value"

key-files:
  created: []
  modified:
    - src/components/layout/Sidebar.tsx
    - src/app/api/reports/completed/route.ts
    - src/app/reports/page.tsx

key-decisions:
  - "Abgeschlossene shows only shipped orders - orders with istStatus='fertig' but not shipped belong in Aufträge tab with versandStatus filtering"

patterns-established: []

# Metrics
duration: 2min
completed: 2026-01-17
---

# Phase 22 Plan 01: Sidebar Reports + Abgeschlossene Filter Summary

**Reports now accessible from main sidebar navigation, Abgeschlossene tab restricted to shipped orders only (versandStatus='versendet')**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-17T09:45:00Z
- **Completed:** 2026-01-17T09:47:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added Reports link to sidebar navigation after Versand
- Changed /api/reports/completed to only return shipped orders (versandStatus='versendet')
- Simplified completedAt logic since all orders now have versandUpdatedAt
- Updated documentation comments to reflect new behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Reports to Sidebar navigation** - `7fd95db` (feat)
2. **Task 2: Restrict Abgeschlossene to shipped orders only** - `c12eb7a` (feat)

## Files Created/Modified

- `src/components/layout/Sidebar.tsx` - Added Reports to navigation array
- `src/app/api/reports/completed/route.ts` - Changed filter to eq('versandStatus', 'versendet'), simplified completedAt logic
- `src/app/reports/page.tsx` - Updated JSDoc comment to reflect new behavior

## Decisions Made

- **Abgeschlossene shows only shipped orders:** Orders with istStatus='fertig' but not yet shipped should remain in the Aufträge tab where users can filter by versandStatus. The Reports/Abgeschlossene section is for fully completed orders that have been shipped.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 22 complete - all plans finished
- v1.5 System-Konsolidierung milestone complete
- System now has clear navigation and data separation

---
*Phase: 22-reports-navigation*
*Completed: 2026-01-17*
