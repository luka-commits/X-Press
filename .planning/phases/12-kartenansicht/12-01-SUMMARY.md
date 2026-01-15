---
phase: 12-kartenansicht
plan: 01
subsystem: database, api, geocoding
tags: [prisma, plz, geocoding, coordinates, lat-lng, versand]

# Dependency graph
requires:
  - phase: 11-versand-ui-seite
    provides: VersandOrder interface, /api/versand/orders endpoint
provides:
  - Database fields lieferLat/lieferLng for map markers
  - Static PLZ geocoding lookup (8,298 German postal codes)
  - API returns coordinates for all orders with PLZ
affects: [12-02 map component, future route optimization]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Static dataset for geocoding (plz-data.json)
    - On-demand coordinate lookup with DB fallback

key-files:
  created:
    - src/lib/geocoding/plz-lookup.ts
    - src/lib/geocoding/plz-data.json
  modified:
    - prisma/schema.prisma
    - src/components/versand/VersandOrderCard.tsx
    - src/app/api/versand/orders/route.ts

key-decisions:
  - "Use static WZB dataset for PLZ coordinates - avoids API rate limits"
  - "Lookup at API response time, not stored in DB - keeps flexibility"

patterns-established:
  - "PLZ lookup via static Map for O(1) access"
  - "Fallback geocoding pattern: DB first, then static lookup"

# Metrics
duration: 8min
completed: 2026-01-16
---

# Phase 12 Plan 01: Geocoding Setup Summary

**Database coordinate fields and PLZ geocoding utility for map marker visualization**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-16T03:52:00Z
- **Completed:** 2026-01-16T04:00:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added lieferLat/lieferLng Float? fields to Auftrag model
- Created PLZ geocoding utility with 8,298 German postal code coordinates
- API now returns coordinates for orders with PLZ (fallback to static lookup)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add coordinate fields to Prisma schema** - `b60337f` (feat)
2. **Task 2: Create PLZ lookup utility with static dataset** - `ca4b129` (feat)
3. **Task 3: Update VersandOrder type and API to include coordinates** - `68fb5bc` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - Added lieferLat/lieferLng Float? fields to Auftrag model
- `src/lib/geocoding/plz-data.json` - Static dataset with 8,298 German PLZ coordinates (WZB source)
- `src/lib/geocoding/plz-lookup.ts` - getCoordinatesForPlz() utility with O(1) Map lookup
- `src/components/versand/VersandOrderCard.tsx` - VersandOrder interface extended with lieferLat/lieferLng
- `src/app/api/versand/orders/route.ts` - API enriches orders with coordinates from PLZ lookup

## Decisions Made

1. **Static dataset over runtime geocoding API** - WZB dataset provides 8,298 German PLZ coordinates in ~428KB JSON. No API rate limits, no costs, instant O(1) lookup.

2. **Lookup at API time, not stored in DB** - Coordinates computed on GET rather than stored. Keeps flexibility, avoids migration complexity. DB fields available for future optimization if needed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **GitHub raw file URL**: Initial download attempt using `/raw/main/` path failed with redirect HTML. Resolved by using `raw.githubusercontent.com/...master/` URL format.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All coordinate infrastructure ready for map visualization
- Next plan (12-02) can use lieferLat/lieferLng from API response
- PLZ lookup available for any future geocoding needs

---
*Phase: 12-kartenansicht*
*Completed: 2026-01-16*
