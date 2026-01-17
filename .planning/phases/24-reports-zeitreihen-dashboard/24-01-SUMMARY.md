---
phase: 24-reports-zeitreihen-dashboard
plan: 01
subsystem: reports
tags: [recharts, timeseries, dashboard, kpi]

# Dependency graph
requires:
  - phase: 23-reports-neu
    provides: PipelineDashboard, SnapshotKPIs (with problemAuftraege)
provides:
  - ThroughputChart component (eingang vs versendet time series)
  - /api/reports/timeseries endpoint
  - Streamlined Dashboard with 4 KPI cards
affects: [dashboard, reports]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Time series API with daily aggregation
    - Dual-line chart with legend and custom tooltip

key-files:
  created:
    - src/app/api/reports/timeseries/route.ts
    - src/components/reports/ThroughputChart.tsx
  modified:
    - src/components/reports/PipelineDashboard.tsx
    - src/components/reports/index.ts
    - src/components/dashboard/KPICard.tsx
    - src/lib/dashboard-queries.ts
    - src/app/page.tsx

key-decisions:
  - "Replace VolumeChart with ThroughputChart - versendet data already covers completed orders"
  - "Problem-KPI removed from Dashboard since it's now shown in Reports SnapshotKPIs"

patterns-established:
  - "Time series endpoint pattern with eachDayOfInterval aggregation"

# Metrics
duration: 8min
completed: 2026-01-17
---

# Phase 24 Plan 01: Zeitreihen Dashboard Summary

**ThroughputChart with dual-line (eingang/versendet) time series, Dashboard streamlined to 4 KPIs with Problem-KPI moved to Reports**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-17T02:37:21Z
- **Completed:** 2026-01-17T02:45:24Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Created /api/reports/timeseries endpoint for daily eingang/versendet counts
- Built ThroughputChart component with dual-line recharts visualization
- Replaced VolumeChart with ThroughputChart in PipelineDashboard
- Removed Problem-KPI from Dashboard (now exclusive to Reports SnapshotKPIs)
- Dashboard streamlined from 5 to 4 KPI cards

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ThroughputChart API and Component** - `f200ea1` (feat)
2. **Task 2: Add ThroughputChart to PipelineDashboard** - `b5641fc` (feat)
3. **Task 3: Remove Problem-KPI from Dashboard** - `46b281c` (feat)

## Files Created/Modified

- `src/app/api/reports/timeseries/route.ts` - New API endpoint for daily eingang/versendet counts
- `src/components/reports/ThroughputChart.tsx` - Dual-line time series chart component
- `src/components/reports/index.ts` - Export ThroughputChart
- `src/components/reports/PipelineDashboard.tsx` - Replace VolumeChart with ThroughputChart
- `src/components/dashboard/KPICard.tsx` - Remove problemOrders prop, 4-column grid
- `src/lib/dashboard-queries.ts` - Remove problemOrders from DashboardKPIs
- `src/app/page.tsx` - Remove problemOrders prop from KPICardsGrid

## Decisions Made

- **VolumeChart replaced:** ThroughputChart shows versendet (shipped) which covers the same data as VolumeChart (completed orders). Dual-line chart provides more value by comparing eingang vs versendet.
- **Problem-KPI consolidation:** Problem orders are now shown exclusively in Reports SnapshotKPIs, avoiding redundancy between Dashboard and Reports.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Type naming conflict:** ThroughputData interface existed locally in PipelineDashboard for funnel data. Resolved by aliasing the import as TimeseriesDataPoint.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 24 complete (1/1 plans)
- v1.6 Pipeline-Analytics milestone complete
- Ready for milestone completion

---
*Phase: 24-reports-zeitreihen-dashboard*
*Completed: 2026-01-17*
