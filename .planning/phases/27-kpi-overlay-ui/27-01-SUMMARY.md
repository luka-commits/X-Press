---
phase: 27-kpi-overlay-ui
plan: 01
subsystem: ui
tags: [dialog, shadcn, kpi, dashboard, react]

# Dependency graph
requires:
  - phase: 25-dialog-komponente
    provides: shadcn/ui Dialog component
  - phase: 26-kpi-detail-api
    provides: /api/dashboard/kpi-orders endpoint
provides:
  - KPIOrdersDialog component for displaying orders by KPI type
  - Clickable KPI cards with drill-down to order list
affects: [dashboard, kpi, orders]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Dialog with fetch-on-open pattern", "Clickable card with accessibility (role, tabIndex, keyboard)"]

key-files:
  created: [src/components/dashboard/KPIOrdersDialog.tsx]
  modified: [src/components/dashboard/KPICard.tsx]

key-decisions:
  - "Added keyboard accessibility to clickable cards for screen reader support"
  - "Dialog fetches data on open rather than preloading for performance"

patterns-established:
  - "Clickable card pattern: onClick prop, cursor-pointer, hover:border-ghl-blue, keyboard handlers"
  - "Dialog fetch pattern: useState + useEffect triggered by isOpen"

# Metrics
duration: 4min
completed: 2026-01-17
---

# Phase 27 Plan 01: KPI Overlay UI Summary

**Clickable KPI cards with drill-down dialog showing order lists from /api/dashboard/kpi-orders**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-17T04:15:00Z
- **Completed:** 2026-01-17T04:19:46Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- KPIOrdersDialog component that fetches and displays orders by KPI type
- KPICard now supports optional onClick with visual and accessibility feedback
- "Offene Aufträge" and "Bald fällig" cards open dialogs with corresponding order lists
- Table with order links, kunde, produkttyp, liefertermin, and color-coded urgency badges

## Task Commits

Each task was committed atomically:

1. **Task 1: Create KPIOrdersDialog component** - `d74142d` (feat)
2. **Task 2: Make KPICards clickable and integrate dialogs** - `1002a0e` (feat)

## Files Created/Modified
- `src/components/dashboard/KPIOrdersDialog.tsx` - Dialog component for KPI order lists
- `src/components/dashboard/KPICard.tsx` - Added onClick support and dialog integration

## Decisions Made
- Added keyboard accessibility (Enter/Space triggers onClick) for screen reader support
- Dialog fetches data when opened rather than preloading to reduce initial page load
- Kept "Ø Auslastung" and "Engpass" cards non-clickable as they don't have associated order lists

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 27 complete
- Milestone v1.7 KPI-Klick-Overlay complete
- All 3 phases (25, 26, 27) finished

---
*Phase: 27-kpi-overlay-ui*
*Completed: 2026-01-17*
