# Phase 40: API-Caching - Research

**Researched:** 2026-01-18
**Domain:** Next.js 14 API Route Caching with Supabase
**Confidence:** HIGH

<research_summary>
## Summary

Researched caching strategies for Next.js 14 App Router API routes with Supabase backend. The project currently uses `export const dynamic = 'force-dynamic'` on all API routes, meaning no caching occurs. This is correct for data that must be real-time but leaves performance on the table for KPI routes that aggregate data.

The standard approach for this type of application is a two-tier strategy:
1. **HTTP Cache-Control headers** for CDN/browser caching (client-side)
2. **Next.js Data Cache** with time-based revalidation for server-side caching

Key finding: Since Supabase client doesn't use the native `fetch()` wrapper, standard Next.js data caching doesn't apply automatically. Solutions include HTTP Cache-Control headers (simplest), `unstable_cache` wrapper (explicit server cache), or Supabase Cache Helpers library (React Query integration).

**Primary recommendation:** Add Cache-Control headers to read-only KPI routes. Use `s-maxage=60, stale-while-revalidate=300` for dashboard KPIs that can tolerate 1-minute staleness. Keep `force-dynamic` for routes that modify data or require real-time accuracy.
</research_summary>

<standard_stack>
## Standard Stack

### Core (Already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 14.2.21 | Framework | App Router with built-in caching primitives |
| @supabase/supabase-js | 2.90.1 | Database client | Production-ready, but bypasses Next.js fetch cache |

### Supporting (Consider adding if needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase-cache-helpers/postgrest-react-query | latest | Client-side query caching | If adding React Query for client-side data fetching |
| @tanstack/react-query | 5.x | Client-side state/cache | If client components need smart refetching |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HTTP Cache-Control | unstable_cache | unstable_cache is server-only, can't benefit CDN; headers work everywhere |
| Manual Cache-Control | Vercel Edge Config | Overkill for simple KPI caching; adds complexity |
| Time-based revalidation | On-demand revalidation | On-demand requires webhook setup; time-based is simpler for KPIs |

**No additional installation required** - all caching can be achieved with built-in Next.js APIs and HTTP headers.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended: Cache-Control Header Strategy

```typescript
// KPI Route with caching (read-only, aggregated data)
export async function GET(request: NextRequest) {
  try {
    const data = await fetchKPIData();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    // Errors should not be cached
    return NextResponse.json({ error: 'Failed' }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
}
```

### Pattern 1: Tiered Caching by Route Type
**What:** Different cache strategies for different data freshness requirements
**When to use:** Always - prevents over-caching sensitive data

| Route Type | Cache Strategy | Headers |
|------------|---------------|---------|
| Dashboard KPIs | 60s CDN, 5min stale | `s-maxage=60, stale-while-revalidate=300` |
| Reports (date-ranged) | 5min CDN, 30min stale | `s-maxage=300, stale-while-revalidate=1800` |
| Order mutations | Never cache | `no-store` |
| Order detail (by ID) | Short cache | `s-maxage=10, stale-while-revalidate=60` |

### Pattern 2: Query-Param-Aware Caching with Vary Header
**What:** Include Vary header when response depends on query params
**When to use:** Routes like `/api/dashboard/kpi-orders?type=critical`

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'Vary': 'Accept-Encoding', // CDN will cache per query params automatically
  },
});
```

### Pattern 3: Remove force-dynamic Selectively
**What:** Remove `export const dynamic = 'force-dynamic'` from cacheable routes
**When to use:** Routes that don't use cookies/headers/searchParams dynamically

```typescript
// Before: Prevents all caching
export const dynamic = 'force-dynamic';

// After: Allow caching, use headers for control
// (remove the export entirely or use 'auto')
export const revalidate = 60; // Alternative: segment config
```

### Anti-Patterns to Avoid
- **Caching user-specific data:** Never cache responses that vary by user session
- **Caching error responses:** Always set `no-store` on error responses
- **Long stale-while-revalidate without monitoring:** Can serve very stale data silently
- **Mixing Cache-Control with revalidate config:** Choose one strategy, not both
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CDN caching | Custom caching layer | HTTP Cache-Control headers | Standard, works everywhere, no code needed |
| Client-side query caching | useState + useEffect + manual cache | React Query or SWR | Handles stale-while-revalidate, deduplication, window focus refetch |
| Cache key generation | Manual query string hashing | Supabase Cache Helpers | Parses Supabase queries into unique keys automatically |
| Cache invalidation | Manual timestamp checks | `revalidateTag` / `revalidatePath` | Built-in, integrates with Data Cache |
| In-memory server cache | Global variable cache | Next.js Data Cache / `unstable_cache` | Survives deployments, works across serverless functions |

**Key insight:** HTTP caching is a solved problem. Cache-Control headers are universally understood by browsers, CDNs, and proxies. Custom in-memory caches don't work in serverless environments and add complexity without benefit.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Supabase Client Bypasses Next.js Fetch Cache
**What goes wrong:** Setting `revalidate` or expecting automatic caching doesn't work
**Why it happens:** Supabase-js doesn't use the native `fetch()` wrapper that Next.js intercepts
**How to avoid:** Use HTTP Cache-Control headers (works regardless of client library) or wrap with `unstable_cache`
**Warning signs:** Data fetches on every request despite `revalidate` config

### Pitfall 2: Development vs Production Caching Behavior
**What goes wrong:** Caching works in production but not in development (or vice versa)
**Why it happens:** `next dev` has different caching behavior than `next build && next start`
**How to avoid:** Always test caching behavior with production build locally: `npm run build && npm run start`
**Warning signs:** "It works on my machine" but not in production

### Pitfall 3: stale-while-revalidate Serves Very Old Data
**What goes wrong:** Users see data that's hours or days old
**Why it happens:** `stale-while-revalidate` without a time value serves stale indefinitely
**How to avoid:** Always specify time: `stale-while-revalidate=300` (5 minutes), not just `stale-while-revalidate`
**Warning signs:** After deployments, old data persists longer than expected

### Pitfall 4: Caching Error Responses
**What goes wrong:** 500 errors get cached and served repeatedly
**Why it happens:** Default caching doesn't distinguish success from error
**How to avoid:** Explicitly set `Cache-Control: no-store` on error responses
**Warning signs:** Intermittent errors become persistent for cache duration

### Pitfall 5: Query Parameters Ignored in Cache Key
**What goes wrong:** `/api/kpi?type=critical` returns same as `/api/kpi?type=total`
**Why it happens:** Some CDNs ignore query params by default
**How to avoid:** Include `Vary` header or configure CDN to include query params in cache key
**Warning signs:** Wrong data returned when navigating between filtered views

### Pitfall 6: Router Cache Stale After Mutation
**What goes wrong:** User updates data, but sees old data when navigating
**Why it happens:** Client-side Router Cache isn't invalidated by API route changes
**How to avoid:** Call `router.refresh()` after mutations or use `revalidatePath` in Server Actions
**Warning signs:** Refresh fixes the issue, navigation doesn't
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns for this project's architecture:

### KPI Route with Cache-Control (Recommended for Phase 40)
```typescript
// src/app/api/dashboard/kpi-orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOpenOrders, getCriticalOrders } from '@/lib/dashboard-queries';

// Remove force-dynamic to allow caching
// export const dynamic = 'force-dynamic'; // DELETE THIS

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // ... existing logic ...

    const orders = await fetchOrdersByType(type);

    return NextResponse.json({
      type,
      orders,
      count: orders.length,
    }, {
      headers: {
        // Cache for 60 seconds at CDN, serve stale up to 5 minutes while revalidating
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('KPI Orders API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI orders' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' } // Never cache errors
      }
    );
  }
}
```

### Reports Route with Longer Cache (Historical Data)
```typescript
// src/app/api/reports/pipeline/route.ts
// Reports show historical data - can cache longer

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Historical data can be cached aggressively
    const data = await fetchPipelineData(from, to);

    return NextResponse.json(data, {
      headers: {
        // 5 min CDN cache, 30 min stale (historical data changes rarely)
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
}
```

### Route That Should NOT Be Cached (Mutations)
```typescript
// src/app/api/orders/[id]/status/route.ts
// PATCH - mutations should never be cached (already correct)

export const dynamic = 'force-dynamic'; // Keep for mutation routes

export async function PATCH(request: NextRequest) {
  // ... mutation logic ...
  // No Cache-Control needed - PATCH isn't cached by default
}
```

### Health Check with No-Cache
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getStaticProps` + ISR | Route Handlers + Cache-Control | Next.js 13+ | Route Handlers are more flexible |
| `unstable_cache` (experimental) | Still experimental in Next.js 14 | Ongoing | Prefer HTTP headers for stability |
| Default cache-all behavior | No caching by default | Next.js 15 | More explicit caching, but 14.x still caches by default |

**New tools/patterns to consider:**
- **`use cache` directive (Next.js 15):** Canary feature for granular caching - not stable yet
- **Edge Functions:** Can add caching logic at edge for Vercel deployments
- **Supabase Realtime for invalidation:** Use database triggers to invalidate cache on data changes

**Deprecated/outdated:**
- **`unstable_cache`:** Still works but "unstable" - prefer Cache-Control headers
- **In-memory caching:** Doesn't work in serverless; use external cache or HTTP headers
</sota_updates>

<open_questions>
## Open Questions

1. **CDN/Hosting Environment**
   - What we know: Project uses Vercel (implied by Next.js)
   - What's unclear: Custom CDN configuration? Edge caching rules?
   - Recommendation: Test Cache-Control headers with Vercel Edge Network, verify behavior

2. **Cache Invalidation After Data Import**
   - What we know: XML imports via `/api/import` add new orders
   - What's unclear: Should KPI cache be invalidated immediately after import?
   - Recommendation: For MVP, time-based (60s) is fine; add on-demand revalidation later if needed

3. **Multi-user Cache Sharing**
   - What we know: No authentication currently (stated in PROJECT.md "out of scope")
   - What's unclear: When auth is added, caching strategy needs review
   - Recommendation: Document that `public` cache headers assume no user-specific data
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Next.js Caching Guide](https://nextjs.org/docs/app/guides/caching) - Official caching documentation
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) - Route Handler behavior
- [Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) - dynamic, revalidate, fetchCache options
- [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control) - HTTP header specification

### Secondary (MEDIUM confidence)
- [Supabase: Fetching and caching in Next.js](https://supabase.com/blog/fetching-and-caching-supabase-data-in-next-js-server-components) - Official Supabase blog
- [Supabase Cache Helpers](https://github.com/psteinroe/supabase-cache-helpers) - Community library for React Query integration
- [KeyCDN HTTP Cache Headers Guide](https://www.keycdn.com/blog/http-cache-headers) - Cache-Control patterns

### Tertiary (Verified via official sources)
- GitHub discussions on Next.js caching - Verified patterns against official docs
- Community blog posts on stale-while-revalidate - Cross-referenced with MDN
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Next.js 14 App Router caching
- Ecosystem: HTTP Cache-Control, CDN caching, Supabase client
- Patterns: Tiered caching, query-param awareness, error handling
- Pitfalls: Supabase bypass, stale data, error caching

**Confidence breakdown:**
- Standard stack: HIGH - verified with official Next.js docs
- Architecture: HIGH - HTTP caching is well-documented standard
- Pitfalls: HIGH - documented in Next.js discussions and confirmed
- Code examples: HIGH - adapted from official patterns for this project

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - Next.js caching API is stable in 14.x)
</metadata>

---

*Phase: 40-api-caching*
*Research completed: 2026-01-18*
*Ready for planning: yes*
