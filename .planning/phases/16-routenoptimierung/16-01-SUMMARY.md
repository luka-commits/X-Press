# Plan 16-01 Summary: Google Routes API Integration

**Phase:** 16-routenoptimierung
**Plan:** 01
**Completed:** 2026-01-16
**Duration:** ~10 min

## What Was Built

Integrated Google Routes API to optimize delivery route order and display actual road paths on the map.

### Task 1: Route Optimization API Endpoint
- Created `src/types/route.ts` with TypeScript types for route optimization
- Created `POST /api/routes/optimize` endpoint that:
  - Calls Google Routes API with `optimizeWaypointOrder: true`
  - Uses X-Press location (Nunsdorfer Ring 13) as default origin/destination
  - Returns optimized order IDs, duration, distance, and encoded polyline
  - Proper error handling for missing API key and API errors

### Task 2: Optimieren Button and Route Stats UI
- Added "Optimieren" button to VersandOrderList (visible in route planning mode with 2+ orders)
- Added `handleOptimizeRoute` function to call the optimization API
- Added route stats bar showing:
  - Duration formatted as "X Std Y Min"
  - Distance formatted as "X.X km"
  - Number of stops
- State management to clear optimization results when exiting mode or changing selections

### Task 3: Actual Road Route Rendering
- Added "geometry" library to Google Maps for polyline decoding
- Updated DeliveryMap to decode and render encoded polylines from Routes API
- Distinctive styling:
  - Optimized route: darker blue (#2563EB), strokeWeight 4, opacity 0.9
  - Straight-line fallback: lighter blue (#3B82F6), strokeWeight 3, opacity 0.7

## Files Modified

| File | Change |
|------|--------|
| `src/types/route.ts` | NEW - Route optimization types |
| `src/app/api/routes/optimize/route.ts` | NEW - POST endpoint for route optimization |
| `src/components/versand/VersandOrderList.tsx` | Added Optimieren button, route stats UI, optimization logic |
| `src/components/map/MapContainer.tsx` | Added encodedPolyline prop to interface |
| `src/components/map/DeliveryMap.tsx` | Added geometry library, polyline decoding and rendering |

## Verification

- [x] `npm run build` succeeds without errors
- [x] No TypeScript errors
- [x] Route optimization endpoint exists at /api/routes/optimize
- [x] Optimieren button appears in route planning mode with 2+ orders selected
- [x] Route stats (duration/distance) display after optimization
- [x] Map shows decoded road path after optimization

## User Setup Required

Before using route optimization:

1. **Enable Routes API** in Google Cloud Console:
   - Go to APIs & Services > Library
   - Search "Routes API" > Enable
   - Same project as existing Maps JavaScript API

2. **Create Server-Side API Key**:
   - Go to APIs & Services > Credentials
   - Create Credentials > API Key
   - Add to `.env` as `GOOGLE_ROUTES_API_KEY`

## Commits

| Hash | Message |
|------|---------|
| bc129ab | feat(16): add route optimization API endpoint |
| c90c9b4 | feat(16): add Optimieren button and route stats to VersandOrderList |
| b01f8f2 | feat(16): render actual road route on map using encoded polyline |

## Notes

- Uses existing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for map rendering
- Requires separate `GOOGLE_ROUTES_API_KEY` (server-side only) for route optimization
- Route optimization supports up to 98 waypoints with lat/lng coordinates
- Optimization returns shortest travel time route, accounting for real road networks
