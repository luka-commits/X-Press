---
phase: 29-reports-drilldown-ui
plan: 02
subsystem: ui
tags: [react, recharts, accessibility, reports, drilldown]

# Dependency graph
requires:
  - phase: 29-reports-drilldown-ui-01
    provides: ReportsOrdersDialog component, onKpiClick callback pattern
provides:
  - Clickable FunnelChart bars with onStageClick callback
  - Clickable StageDistributionChart legend items with onStageClick callback
affects: [29-reports-drilldown-ui-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - getStageKey helper for mapping German names to API stage keys
    - Clickable chart elements with keyboard accessibility

key-files:
  created: []
  modified:
    - src/components/reports/FunnelChart.tsx
    - src/components/reports/StageDistributionChart.tsx

key-decisions:
  - "Pie chart slices not clickable - legend provides better UX"
  - "Same getStageKey mapping used in both charts for consistency"

patterns-established:
  - "Chart click handlers use role=button, tabIndex=0, Enter/Space for accessibility"
  - "Stage name mapping: German display name to lowercase underscore API key"

# Metrics
duration: 3min
completed: 2026-01-17
---

# Phase 29 Plan 02: FunnelChart and StageDistributionChart Clickable Summary

**Clickable FunnelChart bars and StageDistributionChart legend items with stage-to-API key mapping and keyboard accessibility**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-17T05:00:00Z
- **Completed:** 2026-01-17T05:03:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Made FunnelChart bars clickable with hover:opacity-80 transition effect
- Made StageDistributionChart legend items clickable with hover:bg-neutral-50 effect
- Added getStageKey helper in both components for German-to-API stage key mapping
- Added keyboard accessibility (role=button, tabIndex=0, Enter/Space handlers)

## Task Commits

Each task was committed atomically:

1. **Task 1: Make FunnelChart bars clickable** - `d90ba92` (feat)
2. **Task 2: Make StageDistributionChart legend items clickable** - `f0b9a5a` (feat)

## Files Created/Modified

- `src/components/reports/FunnelChart.tsx` - Added onStageClick prop, getStageKey helper, clickable bars with accessibility
- `src/components/reports/StageDistributionChart.tsx` - Added onStageClick prop, getStageKey helper, clickable legend items with accessibility

## Decisions Made

- Pie chart slices are not clickable - legend items provide better UX and Recharts Pie onClick is complex
- Both components use the same getStageKey mapping for consistency (Offen -> offen, In Produktion -> in_produktion, etc.)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- FunnelChart and StageDistributionChart now have onStageClick callbacks
- Ready for 29-03 to wire up dialog state management in Reports page
- Both charts will call onStageClick with API stage key (offen, in_produktion, etc.)

---
*Phase: 29-reports-drilldown-ui*
*Completed: 2026-01-17*
