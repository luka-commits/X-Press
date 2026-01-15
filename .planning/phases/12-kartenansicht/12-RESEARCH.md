# Phase 12: Kartenansicht - Research

**Researched:** 2026-01-16
**Domain:** React map integration with PLZ clustering for delivery visualization
**Confidence:** HIGH

<research_summary>
## Summary

Researched map library options for visualizing delivery addresses with PLZ (postal code) clustering in a Next.js 14 application. The standard approach uses Leaflet via react-leaflet for free, open-source mapping, with react-leaflet-cluster for marker clustering.

Key finding: Don't hand-roll geocoding or clustering. Use the static WZB plz_geocoord CSV dataset (8,000+ German PLZ → lat/lng mappings) for PLZ-based clustering. Store coordinates in database to avoid runtime geocoding. OpenStreetMap tiles are free with no API costs.

**Primary recommendation:** Use react-leaflet + react-leaflet-cluster with OpenStreetMap tiles. Pre-geocode PLZ on data import using static dataset. Dynamic import with `ssr: false` for Next.js compatibility.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| leaflet | 1.9.x | Map rendering | Lightweight (42kB), free, extensive plugin ecosystem |
| react-leaflet | 5.0.x | React bindings | Official React wrapper, declarative API |
| react-leaflet-cluster | 3.x | Marker clustering | Wrapper for Leaflet.markercluster, Next.js compatible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| leaflet-defaulticon-compatibility | 0.1.x | Icon fix for bundlers | Required - fixes marker icons in Next.js/webpack |
| @types/leaflet | latest | TypeScript types | Required for TypeScript projects |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Leaflet | Mapbox GL | Mapbox has better 3D/styling but costs money at scale |
| Leaflet | Google Maps | Google requires API key, has costs, Terms of Service restrictions |
| Leaflet | MapLibre GL | Better performance but more complex, overkill for pin clustering |
| react-leaflet-cluster | supercluster | Supercluster is lower-level, more manual work |

**Installation:**
```bash
npm install leaflet react-leaflet react-leaflet-cluster leaflet-defaulticon-compatibility @types/leaflet
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── map/
│       ├── MapContainer.tsx    # Dynamic import wrapper (ssr: false)
│       ├── DeliveryMap.tsx     # Main map component ("use client")
│       ├── ClusterMarkers.tsx  # Clustered order markers
│       └── OrderPopup.tsx      # Popup content for markers
├── lib/
│   └── geocoding/
│       ├── plz-coordinates.ts  # Static PLZ → lat/lng lookup
│       └── plz-data.json       # Cached PLZ dataset (from CSV)
└── app/
    └── versand/
        └── page.tsx            # Uses MapContainer
```

### Pattern 1: Dynamic Import for Next.js SSR Compatibility
**What:** Leaflet requires `window` object, which doesn't exist during SSR
**When to use:** Always in Next.js/SSR environments
**Example:**
```typescript
// src/components/map/MapContainer.tsx
import dynamic from 'next/dynamic'

const DeliveryMap = dynamic(
  () => import('./DeliveryMap'),
  {
    ssr: false,
    loading: () => <div className="h-[400px] bg-muted animate-pulse" />
  }
)

export default function MapContainer({ orders }) {
  return <DeliveryMap orders={orders} />
}
```

### Pattern 2: Client Component with Leaflet Setup
**What:** Proper initialization of Leaflet in React with CSS imports
**When to use:** The actual map component
**Example:**
```typescript
// src/components/map/DeliveryMap.tsx
"use client"

import { MapContainer, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'

export default function DeliveryMap({ orders }) {
  // Berlin center as default
  const center = [52.52, 13.405]

  return (
    <MapContainer center={center} zoom={10} className="h-[400px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {/* Markers here */}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
```

### Pattern 3: Static PLZ Geocoding Lookup
**What:** Use pre-computed PLZ → coordinates mapping instead of runtime API calls
**When to use:** When you have PLZ and need approximate coordinates
**Example:**
```typescript
// src/lib/geocoding/plz-coordinates.ts
import plzData from './plz-data.json'

type PlzCoord = { lat: number; lng: number }
const plzMap = new Map<string, PlzCoord>(
  plzData.map(({ plz, lat, lng }) => [plz, { lat, lng }])
)

export function getCoordinatesForPlz(plz: string): PlzCoord | null {
  return plzMap.get(plz) ?? null
}
```

### Anti-Patterns to Avoid
- **Importing Leaflet at module level in SSR context:** Causes "window is not defined" error
- **Runtime geocoding API calls on render:** Slow, rate-limited, expensive - geocode on import/save
- **Not chunking cluster loading:** Large datasets freeze the UI without `chunkedLoading` prop
- **Using require() for marker icons:** Breaks in Next.js webpack - use leaflet-defaulticon-compatibility
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Marker clustering | Custom cluster logic | react-leaflet-cluster | Clustering algorithms are complex, handle zoom levels, animation |
| PLZ → coordinates | Runtime geocoding API | Static CSV dataset | 8,000 PLZ fit in 200KB JSON, no API limits/costs |
| Map tile serving | Self-hosted tiles | OpenStreetMap CDN | Tile serving is infrastructure-heavy, OSM is free |
| Icon compatibility | Manual icon path fixes | leaflet-defaulticon-compatibility | Webpack/Next.js icon issues are well-known, package solves them |
| SSR detection | Manual typeof window checks | next/dynamic with ssr: false | Dynamic import is the standard pattern |

**Key insight:** Map visualization is a solved problem. Leaflet + react-leaflet + clustering plugin handles 99% of use cases. The main engineering work is data preparation (geocoding addresses) not map rendering.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: "window is not defined" in Next.js
**What goes wrong:** Leaflet imports fail during SSR because Leaflet accesses `window`
**Why it happens:** Next.js pre-renders on server where browser APIs don't exist
**How to avoid:** Use `dynamic()` import with `ssr: false` option
**Warning signs:** Error during build or page load mentioning "window is not defined"

### Pitfall 2: Missing or Broken Marker Icons
**What goes wrong:** Default markers show broken image icons or don't appear
**Why it happens:** Leaflet uses `require()` for icon paths which breaks in Next.js/webpack
**How to avoid:** Install and import `leaflet-defaulticon-compatibility` before any Leaflet usage
**Warning signs:** Console errors about missing marker icons, markers visible but no icon

### Pitfall 3: Unstyled Clusters
**What goes wrong:** Clusters work but appear as plain numbers without visual styling
**Why it happens:** react-leaflet-cluster v3.x removed automatic CSS imports
**How to avoid:** Manually import both MarkerCluster.css and MarkerCluster.Default.css
**Warning signs:** Clustering works but looks ugly, no colored circles around cluster numbers

### Pitfall 4: Rate Limiting from Geocoding APIs
**What goes wrong:** Geocoding calls fail or get blocked after a few requests
**Why it happens:** Free tiers (Nominatim: 1 req/s, Google: quota limits) get exceeded
**How to avoid:** Pre-geocode and store coordinates in database, don't geocode at render time
**Warning signs:** 429 errors, empty coordinates, slow page loads

### Pitfall 5: Map Container Height
**What goes wrong:** Map doesn't appear or has zero height
**Why it happens:** Leaflet requires explicit height on container element
**How to avoid:** Always set explicit height class (h-[400px]) or use parent with defined height
**Warning signs:** Map component renders but is invisible, container has 0px height
</common_pitfalls>

<code_examples>
## Code Examples

### Complete Map Component Setup
```typescript
// src/components/map/DeliveryMap.tsx
"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'

// Critical: Import CSS for Leaflet and clustering
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css'

// Critical: Fix marker icons for Next.js
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'

interface Order {
  auftragsnummer: string
  kunde?: { name: string }
  lieferPlz?: string
  lieferOrt?: string
  lieferLat?: number
  lieferLng?: number
}

interface DeliveryMapProps {
  orders: Order[]
}

// Berlin center (X-Press location)
const BERLIN_CENTER: [number, number] = [52.52, 13.405]

export default function DeliveryMap({ orders }: DeliveryMapProps) {
  // Filter orders with coordinates
  const mappableOrders = orders.filter(o => o.lieferLat && o.lieferLng)

  return (
    <MapContainer
      center={BERLIN_CENTER}
      zoom={10}
      className="h-[500px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {mappableOrders.map((order) => (
          <Marker
            key={order.auftragsnummer}
            position={[order.lieferLat!, order.lieferLng!]}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{order.auftragsnummer}</div>
                <div>{order.kunde?.name}</div>
                <div>{order.lieferPlz} {order.lieferOrt}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
```

### Dynamic Import Wrapper
```typescript
// src/components/map/MapContainer.tsx
import dynamic from 'next/dynamic'

const DeliveryMap = dynamic(
  () => import('./DeliveryMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full rounded-lg bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">Karte wird geladen...</span>
      </div>
    )
  }
)

export { DeliveryMap }
```

### PLZ Lookup Utility
```typescript
// src/lib/geocoding/plz-lookup.ts
// Data source: https://github.com/WZBSocialScienceCenter/plz_geocoord

interface PlzCoordinate {
  plz: string
  lat: number
  lng: number
}

// Import JSON version of PLZ dataset (converted from CSV)
import plzData from './plz-data.json'

const plzMap = new Map<string, { lat: number; lng: number }>()

// Initialize map on module load
;(plzData as PlzCoordinate[]).forEach(({ plz, lat, lng }) => {
  plzMap.set(plz, { lat, lng })
})

export function getCoordinatesForPlz(plz: string): { lat: number; lng: number } | null {
  // Normalize PLZ (ensure 5 digits with leading zeros)
  const normalizedPlz = plz.padStart(5, '0')
  return plzMap.get(normalizedPlz) ?? null
}

export function hasCoordinatesForPlz(plz: string): boolean {
  return plzMap.has(plz.padStart(5, '0'))
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-leaflet v4 | react-leaflet v5 | 2024 | React 19 support, better TypeScript |
| react-leaflet-markercluster | react-leaflet-cluster | 2023 | Better maintained, Next.js compatible |
| Runtime geocoding | Pre-computed coordinates | Best practice | No API limits, instant lookup |
| Manual icon fixes | leaflet-defaulticon-compatibility | 2022+ | Standard solution for bundler issues |

**New tools/patterns to consider:**
- **MapLibre GL:** Open-source fork of Mapbox GL for vector tiles (overkill for this use case)
- **deck.gl:** For heavy data visualization (thousands of points) - not needed for delivery clustering

**Deprecated/outdated:**
- **react-leaflet-markercluster:** Original package, less maintained, use react-leaflet-cluster
- **Google Maps for simple use cases:** API costs and ToS restrictions make it less attractive
</sota_updates>

<open_questions>
## Open Questions

1. **Database field addition for coordinates**
   - What we know: Current schema has lieferPlz, lieferStrasse, lieferOrt
   - What's unclear: Should we add lieferLat/lieferLng fields or compute at query time?
   - Recommendation: Add fields to database, geocode on XML import (one-time cost)

2. **Geocoding source for addresses without PLZ**
   - What we know: WZB dataset covers all German PLZ
   - What's unclear: Are there orders with addresses but no PLZ?
   - Recommendation: Fall back to Nominatim for edge cases (cache results)

3. **Map interaction with Versand workflow**
   - What we know: Map shows delivery locations
   - What's unclear: Should clicking a marker open order details? Navigate to order?
   - Recommendation: Decide during planning - popup with quick actions is simplest
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- react-leaflet official docs - installation, patterns
- Leaflet.markercluster GitHub - clustering API
- WZBSocialScienceCenter/plz_geocoord - German PLZ coordinates dataset

### Secondary (MEDIUM confidence)
- [LogRocket React map library comparison](https://blog.logrocket.com/react-map-library-comparison/) - verified against official docs
- [Medium: react-leaflet in Next.js](https://andresmpa.medium.com/how-to-use-react-leaflet-in-nextjs-with-typescript-surviving-it-21a3379d4d18) - verified dynamic import pattern
- [react-leaflet-cluster npm](https://www.npmjs.com/package/react-leaflet-cluster) - peer dependencies, CSS requirements
- [PlaceKit: React-Leaflet with Next.js](https://placekit.io/blog/articles/making-react-leaflet-work-with-nextjs-493i) - SSR workaround verified

### Tertiary (LOW confidence - needs validation)
- None - all findings verified against official sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Leaflet + react-leaflet for React map rendering
- Ecosystem: react-leaflet-cluster, leaflet-defaulticon-compatibility
- Patterns: Dynamic import for SSR, static geocoding lookup
- Pitfalls: SSR errors, icon issues, CSS imports, rate limits

**Confidence breakdown:**
- Standard stack: HIGH - widely used, well-documented
- Architecture: HIGH - from official docs and verified tutorials
- Pitfalls: HIGH - common issues with known solutions
- Code examples: HIGH - verified patterns from official sources

**Research date:** 2026-01-16
**Valid until:** 2026-02-16 (30 days - React Leaflet ecosystem stable)
</metadata>

---

*Phase: 12-kartenansicht*
*Research completed: 2026-01-16*
*Ready for planning: yes*
