---
phase: 10-versand-api-liste
plan: 01
subsystem: api
tags: [next.js, prisma, versand, shipping, plz-sorting, pagination]

# Dependency graph
requires:
  - phase: 09-versand-datenmodell
    provides: VersandStatus enum and address fields on Auftrag
provides:
  - PATCH /api/orders/[id]/versand endpoint for status updates
  - GET /api/versand/orders endpoint with deadline/status filters and PLZ sorting
affects: [11-versand-ui, 12-kartenansicht]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Versand PATCH endpoint mirrors IstStatus pattern for consistency"
    - "Shipping list endpoint with PLZ sorting for route optimization"

key-files:
  created:
    - src/app/api/orders/[id]/versand/route.ts
    - src/app/api/versand/orders/route.ts
  modified: []

key-decisions:
  - "PLZ sorting as default for route optimization"
  - "Only active orders shown in shipping list (status: aktiv)"

patterns-established:
  - "Versand API mirrors existing Status API patterns"
  - "Specialized list endpoints under /api/versand/ namespace"

# Metrics
duration: 2min
completed: 2026-01-15
---

# Phase 10 Plan 01: Versand-API & Liste Summary

**REST endpoints for shipping team: VersandStatus update PATCH and order list GET with PLZ sorting for route optimization**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-15T16:34:23Z
- **Completed:** 2026-01-15T16:36:23Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- PATCH /api/orders/[id]/versand endpoint for updating VersandStatus (offen/versandbereit/versendet)
- GET /api/versand/orders endpoint with deadline filters (today/week/all) and versandStatus filters
- PLZ sorting for route optimization (default sort)
- German error messages following codebase convention

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PATCH /api/orders/[id]/versand endpoint** - `e524b40` (feat)
2. **Task 2: Create GET /api/versand/orders endpoint** - `2cc3580` (feat)

## Files Created/Modified

- `src/app/api/orders/[id]/versand/route.ts` - PATCH endpoint for versand status updates
- `src/app/api/versand/orders/route.ts` - GET endpoint for shipping team order list

## Decisions Made

1. **PLZ sorting as default for route optimization**
   - Rationale: Shipping team benefits from route-optimized lists. PLZ proximity clusters deliveries efficiently.

2. **Only active orders shown in shipping list**
   - Rationale: Completed orders (status: abgeschlossen) are not relevant for shipping workflow.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- API endpoints ready for Phase 11 Versand-UI
- PLZ sorting enables route optimization in UI
- Address fields available for Phase 12 map visualization
- No blockers for next phases

---
*Phase: 10-versand-api-liste*
*Completed: 2026-01-15*
