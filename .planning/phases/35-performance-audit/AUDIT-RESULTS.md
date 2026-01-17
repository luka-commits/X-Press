# Performance Audit Results

**Audit Date:** 2026-01-18
**Build:** npm run build (production)
**Environment:** localhost:3000 (production build)
**Tool:** Lighthouse CLI 12.x

## Summary

| Route | Perf | A11y | BP | SEO | LCP | CLS | TBT | TTI |
|-------|------|------|-----|-----|-----|-----|-----|-----|
| / (Dashboard) | 47 | 96 | 96 | 100 | 17.3s | 0 | 2,030ms | 17.8s |
| /status | 80 | 100 | 96 | 100 | 1.5s | 0 | 850ms | 11.2s |
| /versand | 52 | 95 | 96 | 100 | 14.1s | 0 | 990ms | 14.2s |
| /orders | 53 | 90 | 96 | 100 | 9.7s | 0.007 | 990ms | 12.6s |
| /reports | 70 | 96 | 96 | 100 | 2.3s | 0 | 1,750ms | 21.2s |

**Score Legend:** 0-49 (Poor), 50-89 (Needs Improvement), 90-100 (Good)

## Bundle Analysis

**Total First Load JS:** 87.5 kB (shared chunks)

### Per-Route Bundle Sizes

| Route | First Load JS | Notes |
|-------|---------------|-------|
| / (Dashboard) | 238 kB | Largest - includes all KPI components |
| /calendar | 162 kB | Calendar grid + date-fns |
| /orders | 144 kB | Order table + filters |
| /versand | 120 kB | Google Maps integration |
| /status | 116 kB | Mobile status workflow |
| /calendar/[machineId]/[date] | 104 kB | Detail view |
| /orders/[id] | 106 kB | Order detail |
| /reports | 283 kB | Recharts + all analytics components |

### Shared Chunks Analysis

| Chunk | Size | Contents |
|-------|------|----------|
| fd9d1056 | 53.7 kB | React runtime + core libraries |
| 117 | 31.7 kB | Next.js router + utilities |
| Other shared | 2.06 kB | Misc |

### Largest Dependencies

| Package | Estimated Size | Route Impact |
|---------|----------------|--------------|
| recharts | ~40 kB gzipped | /reports, / (dashboard) |
| @react-google-maps/api | ~35 kB gzipped | /versand |
| date-fns | ~15 kB gzipped | All routes |
| lucide-react | ~10 kB gzipped | All routes |
| @radix-ui/* | ~20 kB gzipped | All routes (dialogs, popovers) |

## Core Web Vitals Analysis

### LCP (Largest Contentful Paint) - Target: < 2.5s

| Route | LCP | Status | Cause |
|-------|-----|--------|-------|
| /status | 1.5s | GOOD | Minimal initial data fetch |
| /reports | 2.3s | GOOD | Static page with lazy data |
| /orders | 9.7s | POOR | Large order list rendering |
| /versand | 14.1s | POOR | Google Maps + order data |
| / (Dashboard) | 17.3s | POOR | KPIs + machine cards + critical orders |

### TBT (Total Blocking Time) - Target: < 200ms

| Route | TBT | Status | Cause |
|-------|-----|--------|-------|
| /status | 850ms | NEEDS WORK | React hydration |
| /orders | 990ms | NEEDS WORK | Table rendering + filters |
| /versand | 990ms | NEEDS WORK | Map initialization |
| /reports | 1,750ms | POOR | Chart rendering |
| / (Dashboard) | 2,030ms | POOR | Multiple data fetches + renders |

### CLS (Cumulative Layout Shift) - Target: < 0.1

| Route | CLS | Status |
|-------|-----|--------|
| / (Dashboard) | 0 | GOOD |
| /status | 0 | GOOD |
| /versand | 0 | GOOD |
| /orders | 0.007 | GOOD |
| /reports | 0 | GOOD |

**Note:** CLS is excellent across all routes.

## Critical Issues Identified

### 1. Massive Unused JavaScript on Dashboard (HIGH PRIORITY)

**Finding:** Dashboard page.js is 1.5MB with 97% unused code.
**Impact:** LCP delayed by ~6.5s
**Root Cause:** All dashboard components bundled together without code splitting.

**Files to investigate:**
- `src/app/page.tsx` - Main dashboard
- `src/components/dashboard/` - All KPI components

### 2. Google Maps Blocking Render on /versand (HIGH PRIORITY)

**Finding:** Google Maps JS loads synchronously, blocking main thread.
**Impact:** LCP 14.1s, TBT 990ms
**Estimated Savings:** ~150ms TBT, ~2s LCP

**Components affected:**
- `src/components/map/DeliveryMap.tsx`

### 3. Recharts Bundle on /reports (MEDIUM PRIORITY)

**Finding:** Recharts loads synchronously on reports page.
**Impact:** TBT 1,750ms
**Estimated Savings:** ~500ms TBT with lazy loading

**Components affected:**
- `src/components/reports/ThroughputChart.tsx`
- `src/components/reports/VolumeChart.tsx`
- `src/components/reports/StageDistributionChart.tsx`

### 4. No Dynamic Imports (MEDIUM PRIORITY)

**Finding:** All components load synchronously on page load.
**Impact:** Higher initial bundle, longer TTI.
**Opportunity:** Lazy load dialogs, charts, and secondary UI.

**Candidates for lazy loading:**
- KPI drilldown dialogs
- Reports drilldown dialogs
- Google Maps component
- Recharts components

## Optimization Opportunities

### High Priority (Phase 36)

1. **Code-split dashboard components**
   - Use `next/dynamic` for KPI cards with dialogs
   - Lazy load machine cards below fold
   - Estimated impact: -1MB bundle, -5s LCP

2. **Lazy load Google Maps**
   - Load map only when viewport scrolls to it
   - Use intersection observer
   - Estimated impact: -100ms TBT, -2s LCP

3. **Dynamic import Recharts**
   - Load charts after initial paint
   - Use React.lazy() or next/dynamic
   - Estimated impact: -500ms TBT

4. **Optimize dashboard data fetching**
   - Parallelize KPI API calls
   - Use streaming/suspense for progressive loading
   - Estimated impact: -2s LCP

### Medium Priority

5. **Image optimization**
   - Ensure all images use next/image
   - Add proper width/height to prevent CLS

6. **Font optimization**
   - Preload critical fonts
   - Use font-display: swap

7. **Bundle tree-shaking**
   - Audit lucide-react imports (import specific icons only)
   - Check date-fns imports (use date-fns/esm)

### Low Priority / Future

8. **Service Worker for caching**
   - Cache static assets
   - Offline support for /status route

9. **Server Components optimization**
   - Move more logic to server components
   - Reduce client-side hydration cost

10. **Edge runtime for API routes**
    - Faster cold starts
    - Better latency

## Baseline Metrics for Phase 36

Before optimization work begins, these are the baseline metrics to improve:

| Metric | Current Worst | Target | Route |
|--------|---------------|--------|-------|
| Performance Score | 47 | 80+ | Dashboard |
| LCP | 17.3s | <2.5s | Dashboard |
| TBT | 2,030ms | <500ms | Dashboard |
| First Load JS | 283 kB | <150 kB | Reports |
| Unused JS | 1.5 MB | <100 KB | Dashboard |

## Test Methodology

- All tests run on localhost production build
- Chrome headless via Lighthouse CLI
- Mobile emulation (Moto G4)
- 4G throttling simulated
- 5 routes tested

## Appendix: Raw Reports

Full Lighthouse JSON reports stored in:
`.planning/phases/35-performance-audit/lighthouse-reports/`

- `dashboard.json`
- `status.json`
- `versand.json`
- `orders.json`
- `reports.json`
