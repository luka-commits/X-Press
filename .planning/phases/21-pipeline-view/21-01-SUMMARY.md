---
phase: 21-pipeline-view
plan: 01
subsystem: ui
tags: [orders, pipeline, status, filters, supabase]

requires:
  - phase: 13
    provides: VersandStatus enum and database fields
provides:
  - Combined Pipeline-Status column on orders page
  - VersandStatus filter dropdown
  - Full pipeline visibility: In Produktion → Fertig → Versandbereit → Versendet + Problem
affects: [orders-detail, reports]

tech-stack:
  added: []
  patterns:
    - "Combined pipeline badge with priority logic (problem > versand > production)"

key-files:
  created: []
  modified:
    - src/lib/supabase.ts
    - src/app/orders/page.tsx
    - src/components/orders/OrderFilters.tsx
    - src/components/orders/OrderTable.tsx

key-decisions:
  - "Pipeline priority: Problem always takes precedence, then versandStatus (later stage), then istStatus"
  - "Removed separate Status and IST-Status columns in favor of unified Pipeline-Status"

duration: 3min
completed: 2026-01-16
---

# Phase 21 Plan 01: Pipeline-Status Column Summary

**Combined Pipeline-Status column replaces fragmented Status + IST-Status columns with unified workflow visibility including versandStatus**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-16T15:34:09Z
- **Completed:** 2026-01-16T15:37:43Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- Added versandStatus fields to Supabase Auftrag interface
- Implemented VersandStatus URL parameter filtering on orders page
- Added VersandStatus dropdown to OrderFilters component
- Replaced separate Status + IST-Status columns with combined Pipeline-Status column
- Pipeline stages now visible: In Produktion → Fertig → Versandbereit → Versendet + Problem

## Task Commits

Each task was committed atomically:

1. **Task 1: Add versandStatus fields to Supabase types** - `70da5c5` (feat)
2. **Task 2: Update orders page to query and filter versandStatus** - `27201dc` (feat)
3. **Task 3: Add VersandStatus dropdown to OrderFilters** - `30a97b8` (feat)
4. **Task 4: Replace Status columns with combined Pipeline-Status** - `0c655d7` (feat)

## Files Created/Modified

- `src/lib/supabase.ts` - Added versandStatus, versandKommentar, versandUpdatedAt to Auftrag interface
- `src/app/orders/page.tsx` - Added versandStatus to searchParams, query filter, and order mapping
- `src/components/orders/OrderFilters.tsx` - Added VersandStatus dropdown with offen/versandbereit/versendet options
- `src/components/orders/OrderTable.tsx` - Replaced Status + IST-Status columns with combined Pipeline-Status column using getPipelineStatusBadge function

## Decisions Made

1. **Pipeline priority order:** Problem status always takes precedence (shown with warning icon), followed by versandStatus (later stages), then istStatus (production stages)
2. **Column consolidation:** Removed separate Status and IST-Status columns entirely in favor of single Pipeline-Status column for cleaner UX

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Pipeline-Status column ready for use
- VersandStatus filter functional
- Orders page now shows complete workflow visibility
- Ready for phase 22 (IST-Status cleanup/consolidation)

---
*Phase: 21-pipeline-view*
*Completed: 2026-01-16*
