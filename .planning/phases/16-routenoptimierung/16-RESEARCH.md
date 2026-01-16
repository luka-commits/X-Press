# Phase 16: Routenoptimierung - Research

**Researched:** 2026-01-16
**Domain:** Google Routes API for waypoint optimization
**Confidence:** HIGH

<research_summary>
## Summary

Researched Google Routes API for implementing route optimization in the existing /versand page. The project already uses `@react-google-maps/api` for map display - the Routes API must be called server-side via a Next.js API route, then the optimized route rendered client-side using the existing map.

Key finding: Google Routes API provides `optimizeWaypointOrder` parameter that returns the optimal order of intermediate waypoints based on travel time, distance, and turns. The response includes `optimizedIntermediateWaypointIndex` array with reordered indices.

**Primary recommendation:** Create a Next.js API route (`/api/routes/optimize`) that calls Google Routes API server-side, returns optimized order + encoded polyline, then decode and render polyline on existing DeliveryMap component.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-google-maps/api | ^2.20.8 | Map rendering | Already in use, React wrapper for Maps JS API |
| Routes API (REST) | v2 | Route optimization | Official Google API for routing since March 2025 |
| google.maps.geometry | - | Polyline decoding | Built into Maps JS API, decodes encoded polylines |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @googlemaps/routing | ^1.4.0 | Node.js client | Optional - can use direct REST calls instead |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| REST API calls | @googlemaps/routing | Direct REST is simpler for this use case, fewer dependencies |
| Server-side Routes API | Client-side Directions Service | Directions Service deprecated, Routes API is current standard |

**Installation:**
```bash
# No new packages needed - use REST API directly from Next.js API routes
# Optional if you prefer typed client:
npm install @googlemaps/routing
```

**API Key Setup:**
Routes API requires a server-side API key (not the existing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`):
```bash
# .env (NOT .env.local for security)
GOOGLE_ROUTES_API_KEY="your-server-side-api-key"
```
Enable "Routes API" in Google Cloud Console (in addition to existing "Maps JavaScript API").
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── routes/
│           └── optimize/
│               └── route.ts       # POST handler for route optimization
├── components/
│   └── map/
│       └── DeliveryMap.tsx        # Existing - extend to render polylines
├── lib/
│   └── google-routes.ts           # Routes API helper functions
└── types/
    └── route.ts                   # TypeScript types for route data
```

### Pattern 1: Server-Side Routes API Call
**What:** Call Routes API from Next.js API route, not client-side
**When to use:** Always - API key must not be exposed to browser
**Example:**
```typescript
// src/app/api/routes/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Waypoint {
  lat: number;
  lng: number;
}

export async function POST(request: NextRequest) {
  const { origin, destination, waypoints } = await request.json();

  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_ROUTES_API_KEY!,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex',
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      intermediates: waypoints.map((wp: Waypoint) => ({
        location: { latLng: { latitude: wp.lat, longitude: wp.lng } }
      })),
      travelMode: 'DRIVE',
      optimizeWaypointOrder: true,
      languageCode: 'de-DE',
      units: 'METRIC',
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

### Pattern 2: Polyline Decoding and Rendering
**What:** Decode encoded polyline from Routes API, render on map
**When to use:** After receiving optimized route
**Example:**
```typescript
// Client-side rendering in DeliveryMap.tsx
import { useEffect, useRef } from 'react';

function useRoutePolyline(map: google.maps.Map | null, encodedPolyline: string | null) {
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !encodedPolyline) {
      polylineRef.current?.setMap(null);
      return;
    }

    // Decode polyline using geometry library
    const path = google.maps.geometry.encoding.decodePath(encodedPolyline);

    // Clear existing polyline
    polylineRef.current?.setMap(null);

    // Create new polyline
    polylineRef.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#3B82F6', // Blue
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map,
    });

    return () => {
      polylineRef.current?.setMap(null);
    };
  }, [map, encodedPolyline]);

  return polylineRef;
}
```

### Pattern 3: Reorder Orders Based on Optimized Indices
**What:** Map optimizedIntermediateWaypointIndex back to original order data
**When to use:** After receiving optimization response
**Example:**
```typescript
interface OptimizedRoute {
  orders: Order[];                      // Reordered orders
  totalDuration: number;                // Seconds
  totalDistance: number;                // Meters
  encodedPolyline: string;
}

function applyOptimizedOrder(
  originalOrders: Order[],
  optimizedIndices: number[]
): Order[] {
  // optimizedIndices contains new order: [3, 0, 2, 1] means
  // original order[3] should be first, order[0] second, etc.
  return optimizedIndices.map(index => originalOrders[index]);
}
```

### Anti-Patterns to Avoid
- **Calling Routes API from client-side:** Exposes API key, security risk
- **Using Directions Service:** Deprecated as of March 2025, use Routes API
- **Hard-coding coordinates in requests:** Always use dynamic data from orders
- **Ignoring field mask:** Response will be empty without proper X-Goog-FieldMask header
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route optimization (TSP) | Custom TSP algorithm | `optimizeWaypointOrder: true` | NP-hard problem, Google's solution is battle-tested |
| Polyline encoding/decoding | Custom encoder | `google.maps.geometry.encoding` | Complex algorithm with precision requirements |
| Distance/duration calculation | Haversine + estimates | Routes API response | Accounts for actual roads, traffic, turns |
| Address geocoding | Manual coordinate lookup | Already have lat/lng in database | Orders already geocoded in v1.1 |

**Key insight:** Route optimization is the Traveling Salesman Problem - a famously hard combinatorial optimization problem. Google's implementation uses sophisticated algorithms that account for real road networks, turn restrictions, and traffic. Any custom solution will be inferior and buggy.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Missing Field Mask
**What goes wrong:** API returns empty response or minimal data
**Why it happens:** Routes API requires explicit field selection via X-Goog-FieldMask header
**How to avoid:** Always include field mask header with required fields
```typescript
headers: {
  'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex'
}
```
**Warning signs:** Response has `routes: [{}]` with empty objects

### Pitfall 2: Using TRAFFIC_AWARE_OPTIMAL with Optimization
**What goes wrong:** API request fails with error
**Why it happens:** `optimizeWaypointOrder` is incompatible with `TRAFFIC_AWARE_OPTIMAL` routing preference
**How to avoid:** Use `TRAFFIC_AWARE` or `TRAFFIC_UNAWARE` instead
**Warning signs:** Error response mentioning routing preference conflict

### Pitfall 3: Waypoint Limit Exceeded
**What goes wrong:** API returns error for large delivery batches
**Why it happens:** Maximum 25 waypoints with place IDs, or 98 with lat/lng coordinates
**How to avoid:** Use lat/lng coordinates (already have them), split into multiple batches if needed
**Warning signs:** Error "Too many waypoints"

### Pitfall 4: Via Waypoints with Optimization
**What goes wrong:** Request fails when optimizing
**Why it happens:** `via` waypoints (pass-through, non-stop) incompatible with optimization
**How to avoid:** Ensure all waypoints are stopovers (default behavior)
**Warning signs:** Error mentioning via waypoints

### Pitfall 5: Exposing Server API Key
**What goes wrong:** API key leaked, potential billing abuse
**Why it happens:** Using NEXT_PUBLIC_ prefix or calling from client-side
**How to avoid:** Server-side only key without NEXT_PUBLIC_ prefix, call from API route
**Warning signs:** Key visible in browser network tab

### Pitfall 6: Low Timeout for Large Requests
**What goes wrong:** Request times out for many waypoints
**Why it happens:** Optimization takes longer with more waypoints
**How to avoid:** Set appropriate timeout (10-30 seconds for 20+ waypoints)
**Warning signs:** Timeout errors with large batches
</common_pitfalls>

<code_examples>
## Code Examples

### Complete API Route Handler
```typescript
// src/app/api/routes/optimize/route.ts
// Source: Based on Google Routes API documentation

import { NextRequest, NextResponse } from 'next/server';

interface OptimizeRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: Array<{ lat: number; lng: number; orderId: string }>;
}

interface RouteResponse {
  routes: Array<{
    duration: string;
    distanceMeters: number;
    polyline: { encodedPolyline: string };
    optimizedIntermediateWaypointIndex?: number[];
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeRequest = await request.json();
    const { origin, destination, waypoints } = body;

    if (!process.env.GOOGLE_ROUTES_API_KEY) {
      return NextResponse.json(
        { error: 'Routes API key not configured' },
        { status: 500 }
      );
    }

    const routesResponse = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_ROUTES_API_KEY,
          'X-Goog-FieldMask': [
            'routes.duration',
            'routes.distanceMeters',
            'routes.polyline.encodedPolyline',
            'routes.optimizedIntermediateWaypointIndex',
          ].join(','),
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: { latitude: origin.lat, longitude: origin.lng },
            },
          },
          destination: {
            location: {
              latLng: { latitude: destination.lat, longitude: destination.lng },
            },
          },
          intermediates: waypoints.map((wp) => ({
            location: {
              latLng: { latitude: wp.lat, longitude: wp.lng },
            },
          })),
          travelMode: 'DRIVE',
          optimizeWaypointOrder: true,
          languageCode: 'de-DE',
          units: 'METRIC',
        }),
      }
    );

    if (!routesResponse.ok) {
      const error = await routesResponse.json();
      console.error('Routes API error:', error);
      return NextResponse.json(
        { error: 'Route optimization failed', details: error },
        { status: routesResponse.status }
      );
    }

    const data: RouteResponse = await routesResponse.json();
    const route = data.routes[0];

    // Map optimized indices back to order IDs
    const optimizedOrderIds = route.optimizedIntermediateWaypointIndex
      ? route.optimizedIntermediateWaypointIndex.map((idx) => waypoints[idx].orderId)
      : waypoints.map((wp) => wp.orderId);

    return NextResponse.json({
      optimizedOrderIds,
      duration: route.duration,
      distanceMeters: route.distanceMeters,
      encodedPolyline: route.polyline.encodedPolyline,
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Google Maps Deep Link Generation
```typescript
// src/lib/navigation.ts
// Source: Google Maps URLs documentation

interface NavigationWaypoint {
  lat: number;
  lng: number;
  label?: string;
}

/**
 * Generate Google Maps navigation deep link
 * Note: Maximum 9 intermediate waypoints (10 stops total)
 */
export function generateGoogleMapsLink(
  origin: NavigationWaypoint,
  destination: NavigationWaypoint,
  waypoints: NavigationWaypoint[]
): string {
  const baseUrl = 'https://www.google.com/maps/dir/';
  const params = new URLSearchParams();

  params.set('api', '1');
  params.set('origin', `${origin.lat},${origin.lng}`);
  params.set('destination', `${destination.lat},${destination.lng}`);
  params.set('travelmode', 'driving');
  params.set('dir_action', 'navigate'); // Start navigation immediately

  if (waypoints.length > 0) {
    // Max 9 waypoints in URL
    const limitedWaypoints = waypoints.slice(0, 9);
    const waypointStr = limitedWaypoints
      .map((wp) => `${wp.lat},${wp.lng}`)
      .join('|');
    params.set('waypoints', waypointStr);
  }

  return `${baseUrl}?${params.toString()}`;
}
```

### Loading Geometry Library for Polyline Decoding
```typescript
// In DeliveryMap.tsx or similar
// Source: Google Maps JavaScript API documentation

import { useLoadScript } from '@react-google-maps/api';

// Add 'geometry' to libraries array
const { isLoaded } = useLoadScript({
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  libraries: ['geometry'], // Required for decoding polylines
});

// Then use in component:
if (isLoaded && encodedPolyline) {
  const decodedPath = google.maps.geometry.encoding.decodePath(encodedPolyline);
  // decodedPath is an array of google.maps.LatLng objects
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Directions API | Routes API | March 2025 | Must migrate, Directions API deprecated |
| Distance Matrix API | Routes API (computeRouteMatrix) | March 2025 | Unified API for routing |
| Client-side DirectionsService | Server-side Routes API | 2024+ | Better security, server-side key |
| optimizeWaypoints (Directions) | optimizeWaypointOrder (Routes) | March 2025 | Same feature, new parameter name |

**New tools/patterns to consider:**
- **Routes API Field Masks:** Only request fields you need - reduces response size and cost
- **Maps JavaScript API Route class:** New component for route rendering (beta)

**Deprecated/outdated:**
- **google.maps.DirectionsService:** Replaced by Routes API REST calls
- **google.maps.DirectionsRenderer:** Use Polyline instead with decoded route
- **Directions API URLs:** Migrate to Routes API endpoints
</sota_updates>

<open_questions>
## Open Questions

1. **Waypoint Optimization Feature Enablement**
   - What we know: Documentation mentions contacting support to enable for high-volume use
   - What's unclear: Whether feature works by default for low-volume projects
   - Recommendation: Test with small batch first, contact support if 403/feature disabled errors

2. **Starting Point (Origin)**
   - What we know: X-Press location should be origin (Nunsdorfer Ring 13, Berlin)
   - What's unclear: Whether drivers start from X-Press or their homes
   - Recommendation: Use X-Press as default origin, make configurable later if needed
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Google Routes API Documentation](https://developers.google.com/maps/documentation/routes) - Official API docs
- [Waypoint Optimization Guide](https://developers.google.com/maps/documentation/routes/opt-way) - `optimizeWaypointOrder` details
- [Routes API Web Service Best Practices](https://developers.google.com/maps/documentation/routes/web-service-best-practices) - Error handling, rate limits
- [Routes API Usage and Billing](https://developers.google.com/maps/documentation/routes/usage-and-billing) - Pricing tiers
- [Maps URLs Documentation](https://developers.google.com/maps/documentation/urls/get-started) - Deep link format

### Secondary (MEDIUM confidence)
- [AFI Blog: Routes API Developer Guide](https://blog.afi.io/blog/a-developers-guide-to-the-google-routes-api/) - Practical examples
- [Medium: Render Routes API to Maps](https://medium.com/@unnikrisb/how-to-render-google-routes-api-response-to-maps-typescript-angular-eb7e2d8106b5) - Polyline rendering

### Tertiary (LOW confidence - needs validation)
- None - all findings verified against official documentation
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Google Routes API v2
- Ecosystem: @react-google-maps/api (existing), REST API calls
- Patterns: Server-side route optimization, client-side polyline rendering
- Pitfalls: Field masks, waypoint limits, API key security

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing libraries + documented REST API
- Architecture: HIGH - Server-side pattern well-documented
- Pitfalls: HIGH - From official documentation and troubleshooting guides
- Code examples: HIGH - Based on official documentation patterns

**Research date:** 2026-01-16
**Valid until:** 2026-02-16 (30 days - Routes API is stable)
</metadata>

---

*Phase: 16-routenoptimierung*
*Research completed: 2026-01-16*
*Ready for planning: yes*
