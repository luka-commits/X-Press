---
phase: 02-status-api
plan: 01
subsystem: api
tags: [next.js, api-routes, prisma, rest, status-update]

# Dependency graph
requires:
  - phase: 01-database-schema
    provides: IstStatus enum and status tracking fields on Auftrag model
provides:
  - PATCH /api/orders/[id]/status endpoint
  - IstStatus validation with German error messages
  - Atomic status update with timestamp
affects: [06-status-update-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PATCH endpoint pattern for status updates with enum validation"

key-files:
  created:
    - src/app/api/orders/[id]/status/route.ts
  modified: []

key-decisions:
  - "Used Object.values(IstStatus).includes() for enum validation - type-safe approach"
  - "Optional statusKommentar set to null when not provided (not undefined)"

patterns-established:
  - "Status update endpoints: validate enum, check existence, update with timestamp"

# Metrics
duration: 2min
completed: 2026-01-15
---

# Phase 02 Plan 01: API-Route mit Status-Validierung Summary

**PATCH /api/orders/[id]/status endpoint enabling mobile workers to update order status with IstStatus enum validation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-15T14:14:06Z
- **Completed:** 2026-01-15T14:16:04Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Created PATCH endpoint at /api/orders/[id]/status
- Validates IstStatus enum (in_produktion, fertig, problem)
- Supports optional statusKommentar field
- Automatically sets statusUpdatedAt timestamp on update
- Returns appropriate HTTP status codes (200, 400, 404, 500)
- German error messages following codebase conventions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PATCH /api/orders/[id]/status endpoint** - `1ed32e6` (feat)
2. **Task 2: Verify endpoint with curl tests** - No commit (verification only)

## Files Created/Modified

- `src/app/api/orders/[id]/status/route.ts` - PATCH endpoint for mobile status updates

## Decisions Made

1. **Used Object.values(IstStatus).includes() for enum validation**
   - Rationale: Type-safe approach that automatically adapts if enum values change in schema

2. **Optional statusKommentar set to null when not provided**
   - Rationale: Explicit null vs undefined - consistent with Prisma field definition

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Status API endpoint fully functional
- Ready for Phase 6 (Status Update UI) integration
- Endpoint tested with all four scenarios (valid update, with comment, invalid status, non-existent order)

---
*Phase: 02-status-api*
*Completed: 2026-01-15*
