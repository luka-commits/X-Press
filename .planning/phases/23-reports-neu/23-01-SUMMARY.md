# Plan 23-01 Summary: Pipeline Analytics Dashboard

**Phase:** 23-reports-neu
**Plan:** 01
**Completed:** 2026-01-17
**Duration:** ~8 min

## Objective

Create a consolidated Pipeline Analytics dashboard replacing the 3-tab reports structure with a focused single-view layout showing at-a-glance performance metrics.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Create Pipeline Analytics API endpoint | 2cf2ecb |
| 2 | Create PipelineFunnel component | 897bfa8 |
| 3 | Create SnapshotKPIs component | d9faf16 |
| 4 | Create PipelineKPIs component | aaa2e2b |
| 5 | Create PipelineDashboard and update Reports page | 1977afe |

## Files Created/Modified

**Created:**
- `src/app/api/reports/pipeline/route.ts` - Pipeline Analytics API endpoint
- `src/components/reports/PipelineFunnel.tsx` - Horizontal funnel visualization
- `src/components/reports/SnapshotKPIs.tsx` - Current state metrics (4 cards)
- `src/components/reports/PipelineKPIs.tsx` - Period metrics with comparison
- `src/components/reports/PipelineDashboard.tsx` - Combined dashboard component

**Modified:**
- `src/components/reports/index.ts` - Added exports for new components
- `src/app/reports/page.tsx` - Replaced tabs with PipelineDashboard

## Implementation Details

### API Endpoint (`/api/reports/pipeline`)

Returns three data sections:

1. **Throughput** (period-dependent): Orders that moved through each stage
   - eingang: orders created in period
   - produktion: orders entering production in period
   - versandbereit: orders becoming ready for shipping in period
   - versendet: orders shipped in period

2. **Snapshot** (independent of date range): Current state metrics
   - aktiveAuftraege: unshipped orders count
   - problemAuftraege: orders with hatProblem=true
   - aeltesterAuftrag: days since oldest unshipped order
   - morgenFaellig: orders due tomorrow

3. **Period KPIs**: Historical shipping performance
   - avgDaysToShip: average time from creation to shipping
   - onTimePercent: percentage shipped on/before due date
   - totalShipped: count of shipped orders

### Visual Components

**PipelineFunnel:**
- 4-stage horizontal funnel with colored boxes
- Comparison badges showing % change vs previous period
- Stage colors: blue (eingang), amber (produktion), purple (versandbereit), green (versendet)

**SnapshotKPIs:**
- 4-column grid of current state cards
- Conditional highlighting (red for problems, amber for warnings)
- No comparison badges (snapshot values)

**PipelineKPIs:**
- 3-column grid of period metrics
- Smart comparison logic (inverted for avgDaysToShip - lower is better)
- Comparison badges with proper color coding

**PipelineDashboard:**
- Combines all sections with shared DateRangePicker
- Reuses VolumeChart and PlzChart from existing components
- Collapsible CompletedOrdersTable section

## Verification

- [x] `npm run build` succeeds
- [x] `npm run lint` passes (no new warnings)
- [x] API returns correct data structure
- [x] Clear separation: Snapshot vs Period metrics
- [x] Funnel labeled as "Durchfluss" not "aktueller Stand"

## Notes

- Removed tooltip component dependency (used title attribute instead)
- Previous tab-based navigation (Abgeschlossene, Zeitraum-Analysen, Versand-Reports) replaced with single consolidated view
- CompletedOrdersTable preserved but made collapsible to reduce visual noise
