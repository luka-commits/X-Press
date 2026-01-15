---
phase: 07-dashboard-status-column
plan: 01
subsystem: ui
tags: [react, next.js, tailwind, table, status-badge]

# Dependency graph
requires:
  - phase: 01-database-schema
    provides: istStatus field on Auftrag model
  - phase: 06-status-update-ui
    provides: mobile status update functionality that sets istStatus
provides:
  - IST-Status column in OrderTable with color-coded badges
  - Sortable istStatus column
  - Visual distinction between order lifecycle status and shopfloor IST-status
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - getIstStatusBadge() helper for status rendering (mirrors existing getStatusBadge)

key-files:
  created: []
  modified:
    - src/lib/supabase.ts
    - src/app/orders/page.tsx
    - src/components/orders/OrderTable.tsx

key-decisions:
  - "Added istStatus to Auftrag type in supabase.ts (was missing from initial type definition)"
  - "Used amber-100/amber-700 for 'in_produktion' to distinguish from green 'fertig'"

patterns-established:
  - "Status badge pattern: getXxxStatusBadge() functions with switch/case for each status value"

# Metrics
duration: 4min
completed: 2026-01-16
---

# Phase 7 Plan 01: Dashboard Status Column Summary

**IST-Status column added to OrderTable with color-coded badges showing shopfloor production status (fertig=green, in_produktion=yellow, problem=red)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-16T10:00:00Z
- **Completed:** 2026-01-16T10:04:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added istStatus field to Auftrag interface in supabase.ts
- Created getIstStatusBadge() helper with color-coded badges
- Added sortable IST-Status column to OrderTable (between Status and Aktion columns)
- Dashboard users can now see actual production status set by mobile workers

## Task Commits

Each task was committed atomically:

1. **Task 1: Add istStatus to orders query and interface** - `04871c1` (feat)
2. **Task 2: Add IST-Status column with color-coded badge** - `25b296b` (feat)

## Files Created/Modified
- `src/lib/supabase.ts` - Added istStatus, statusKommentar, statusUpdatedAt to Auftrag interface
- `src/app/orders/page.tsx` - Added istStatus to mapped order object
- `src/components/orders/OrderTable.tsx` - Added getIstStatusBadge(), IST-Status column header and cell

## Decisions Made
- Added istStatus to Auftrag type in supabase.ts since it was missing from initial type definition but exists in database
- Used amber-100/amber-700 for 'in_produktion' status to create visual distinction from green 'fertig' and red 'problem'

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added istStatus to Auftrag interface in supabase.ts**
- **Found during:** Task 1 (Add istStatus to orders query)
- **Issue:** TypeScript error - istStatus property not in Auftrag type, but exists in database
- **Fix:** Added istStatus, statusKommentar, statusUpdatedAt fields to Auftrag interface
- **Files modified:** src/lib/supabase.ts
- **Verification:** `npx tsc --noEmit` succeeds
- **Committed in:** 04871c1 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for TypeScript compilation. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- IST-Status column is visible and sortable in /orders table
- Ready for Phase 07-02 (if any) or Phase 08
- Mobile status updates from Phase 6 are now visible in the dashboard

---
*Phase: 07-dashboard-status-column*
*Completed: 2026-01-16*
