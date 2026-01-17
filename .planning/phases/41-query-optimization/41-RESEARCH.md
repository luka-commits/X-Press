# Phase 41: Query-Optimization - Research

**Researched:** 2026-01-18
**Domain:** PostgreSQL/Prisma/Supabase query optimization, DB-level aggregation
**Confidence:** HIGH

<research_summary>
## Summary

Researched query optimization patterns for the XOS Next.js 14 + Prisma + Supabase stack. The codebase currently uses a hybrid approach (Prisma for CRUD, Supabase client for complex queries) with several opportunities for optimization.

**Current issues identified:**
1. **JS-based aggregation**: Timeseries, analytics, and period KPI routes fetch individual orders and aggregate in JavaScript using Map/Set operations
2. **Over-fetching**: Some routes fetch more fields than needed for aggregation
3. **Missing DB-level grouping**: Date grouping should use PostgreSQL's DATE_TRUNC instead of JS string operations

**Primary recommendation:** Move aggregations to PostgreSQL using Supabase RPC functions for complex queries (avgDaysToShip, onTimePercent, date grouping). Keep Prisma for simple CRUD. Add partial indexes for frequently filtered columns.
</research_summary>

<standard_stack>
## Standard Stack

### Core (Already in Use)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @prisma/client | 6.x | ORM for CRUD operations | Type-safe, schema-driven |
| @supabase/supabase-js | 2.x | Direct PostgreSQL access | Complex queries, RPC functions |
| PostgreSQL | 15+ (Supabase) | Database | Powerful aggregation, DATE_TRUNC |

### Supporting (Recommended Additions)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Prisma TypedSQL | Preview | Type-safe raw SQL | Complex aggregations not expressible with Prisma |
| pg_cron (Supabase) | Built-in | Scheduled jobs | Materialized view refresh |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase RPC | Prisma $queryRaw | RPC better for reuse; $queryRaw better for one-off |
| Materialized Views | Regular Views | Mat. views need refresh but much faster (100x for dashboards) |
| Prisma groupBy | Supabase RPC | groupBy limited to simple cases; RPC for complex aggregation |

**No new dependencies needed** - optimization uses existing stack features.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Approach

```
src/
├── lib/
│   ├── prisma.ts           # Prisma client (keep for CRUD)
│   ├── supabase.ts         # Supabase client (keep for complex queries)
│   └── db-functions/       # NEW: Type definitions for RPC functions
│       └── index.ts
├── app/api/
│   └── reports/
│       └── pipeline/       # Use RPC for period KPIs
└── prisma/
    └── migrations/         # Add RPC functions via migrations
```

### Pattern 1: Supabase RPC for Complex Aggregations
**What:** Move JS aggregation to PostgreSQL functions
**When to use:** Calculations requiring multiple passes, date grouping, averages
**Example:**
```sql
-- Migration: Create RPC function for period KPIs
CREATE OR REPLACE FUNCTION get_period_kpis(from_date TIMESTAMPTZ, to_date TIMESTAMPTZ)
RETURNS TABLE (
  avg_days_to_ship NUMERIC,
  on_time_percent NUMERIC,
  total_shipped BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(
      EXTRACT(EPOCH FROM ("versandUpdatedAt" - "createdAt")) / 86400
    )::NUMERIC, 1) as avg_days_to_ship,
    ROUND(
      (COUNT(*) FILTER (WHERE "versandUpdatedAt" <= "liefertermin")::NUMERIC /
       NULLIF(COUNT(*) FILTER (WHERE "liefertermin" IS NOT NULL), 0)) * 100
    , 0) as on_time_percent,
    COUNT(*) as total_shipped
  FROM "Auftrag"
  WHERE "versandStatus" = 'versendet'
    AND ("versandUpdatedAt" >= from_date AND "versandUpdatedAt" <= to_date
         OR "versandUpdatedAt" IS NULL);
END;
$$ LANGUAGE plpgsql;
```

**TypeScript usage:**
```typescript
const { data, error } = await supabase.rpc('get_period_kpis', {
  from_date: fromParam,
  to_date: toParam,
});
```

### Pattern 2: DATE_TRUNC for Timeseries Grouping
**What:** Group by date in PostgreSQL instead of JS
**When to use:** Any date-based aggregation (daily, weekly, monthly counts)
**Example:**
```sql
CREATE OR REPLACE FUNCTION get_timeseries(from_date DATE, to_date DATE)
RETURNS TABLE (
  date DATE,
  eingang BIGINT,
  versendet BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(from_date, to_date, '1 day'::INTERVAL)::DATE as date
  ),
  eingang_counts AS (
    SELECT DATE_TRUNC('day', "createdAt")::DATE as date, COUNT(*) as count
    FROM "Auftrag"
    WHERE "createdAt" >= from_date AND "createdAt" < to_date + 1
    GROUP BY 1
  ),
  versendet_counts AS (
    SELECT DATE_TRUNC('day', COALESCE("versandUpdatedAt", "createdAt"))::DATE as date, COUNT(*) as count
    FROM "Auftrag"
    WHERE "versandStatus" = 'versendet'
      AND COALESCE("versandUpdatedAt", "createdAt") >= from_date
      AND COALESCE("versandUpdatedAt", "createdAt") < to_date + 1
    GROUP BY 1
  )
  SELECT
    ds.date,
    COALESCE(ec.count, 0) as eingang,
    COALESCE(vc.count, 0) as versendet
  FROM date_series ds
  LEFT JOIN eingang_counts ec ON ds.date = ec.date
  LEFT JOIN versendet_counts vc ON ds.date = vc.date
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql;
```

### Pattern 3: Partial Indexes for Common Filters
**What:** Create indexes only for rows that match common WHERE conditions
**When to use:** Queries frequently filter on specific values (e.g., not shipped)
**Example:**
```sql
-- Index for "not shipped" queries (covers most dashboard KPIs)
CREATE INDEX CONCURRENTLY idx_auftrag_not_shipped
ON "Auftrag" ("liefertermin", "istStatus")
WHERE "versandStatus" != 'versendet';

-- Index for problem orders
CREATE INDEX CONCURRENTLY idx_auftrag_problems
ON "Auftrag" ("liefertermin")
WHERE "istStatus" = 'problem' AND "versandStatus" != 'versendet';
```

### Anti-Patterns to Avoid
- **JS Map/Set aggregation**: Moving data to JS for counting/grouping wastes bandwidth and CPU
- **SELECT * for counts**: Use `{ count: 'exact', head: true }` (already correct in most places)
- **N+1 in loops**: Never query inside a loop; use JOINs or batch queries
- **Missing indexes on filtered columns**: Always index columns used in WHERE clauses
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date grouping | `Map<string, number>` in JS | `DATE_TRUNC()` + `GROUP BY` | 10-100x faster, less bandwidth |
| Average calculation | Loop with sum/count | PostgreSQL `AVG()` | Database optimized for this |
| Date range filling | `eachDayOfInterval` + map | `generate_series()` | Single query vs fetch + transform |
| Percentage calculation | JS division after fetch | SQL `FILTER` clause | Computed at source |
| Running totals | JS reduce | Window functions `SUM() OVER` | Database handles efficiently |

**Key insight:** Every row transferred from DB to JS costs bandwidth, memory, and CPU. Aggregations that touch thousands of rows should NEVER transfer all rows - only the aggregated result.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Fetching Rows to Count Them
**What goes wrong:** Route fetches 1000 orders just to return `orders.length`
**Why it happens:** Easy to write with ORM; counting in JS "feels" simpler
**How to avoid:** Use `{ count: 'exact', head: true }` for Supabase or `prisma.model.count()`
**Warning signs:** Network tab shows large response body for simple KPI

### Pitfall 2: Supabase Aggregate Functions Disabled
**What goes wrong:** `.count()` or other aggregates throw "Use of aggregate functions is not allowed"
**Why it happens:** Supabase disabled aggregates by default for security
**How to avoid:** Enable in Supabase dashboard or via SQL:
```sql
ALTER ROLE authenticator SET pgrst.db_aggregates_enabled = 'true';
NOTIFY pgrst, 'reload config';
```
**Warning signs:** Runtime error mentioning aggregate functions

### Pitfall 3: Missing Indexes on Foreign Keys
**What goes wrong:** JOINs become slow as data grows
**Why it happens:** Prisma creates FK constraints but not always indexes
**How to avoid:** Verify indexes exist for all FK columns and commonly filtered columns
**Warning signs:** EXPLAIN shows "Seq Scan" on large tables

### Pitfall 4: Timezone Issues in Date Grouping
**What goes wrong:** Orders appear on wrong day in grouped results
**Why it happens:** PostgreSQL uses UTC; app expects Europe/Berlin
**How to avoid:** Use `AT TIME ZONE 'Europe/Berlin'` in queries:
```sql
DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Europe/Berlin')::DATE
```
**Warning signs:** Off-by-one errors on day boundaries

### Pitfall 5: Materialized View Staleness
**What goes wrong:** Dashboard shows outdated data
**Why it happens:** Forgot to set up refresh schedule
**How to avoid:** Use pg_cron for automatic refresh:
```sql
SELECT cron.schedule('refresh-kpi-mat-view', '*/15 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY kpi_summary');
```
**Warning signs:** Data doesn't change after updates
</common_pitfalls>

<code_examples>
## Code Examples

### Current Pattern (Before - JS Aggregation)
```typescript
// timeseries/route.ts - BEFORE
const eingangByDay = new Map<string, number>();
if (eingangResult.data) {
  for (const order of eingangResult.data) {
    if (order.createdAt) {
      const dateStr = order.createdAt.substring(0, 10);
      eingangByDay.set(dateStr, (eingangByDay.get(dateStr) || 0) + 1);
    }
  }
}
```

### Optimized Pattern (After - DB Aggregation)
```typescript
// timeseries/route.ts - AFTER (using RPC)
const { data, error } = await supabase.rpc('get_timeseries', {
  from_date: fromParam,
  to_date: toParam,
});

// Returns already grouped: [{ date: '2026-01-15', eingang: 12, versendet: 8 }, ...]
return NextResponse.json(data);
```

### Prisma GroupBy Example
```typescript
// For simpler grouping - Prisma native
const dailyCounts = await prisma.auftrag.groupBy({
  by: ['createdAt'], // Note: groupBy on date part requires raw SQL
  _count: { auftragsnummer: true },
  where: {
    createdAt: { gte: fromDate, lte: toDate },
  },
});
```

### Supabase Count with Filter
```typescript
// Already correct pattern in codebase - keep using this
const { count } = await supabase
  .from('Auftrag')
  .select('*', { count: 'exact', head: true })
  .neq('versandStatus', 'versendet')
  .lt('liefertermin', dateStart.toISOString());
```

### Creating RPC via Prisma Migration
```typescript
// prisma/migrations/YYYYMMDD_add_timeseries_rpc/migration.sql
CREATE OR REPLACE FUNCTION get_timeseries(from_date DATE, to_date DATE)
RETURNS TABLE (date DATE, eingang BIGINT, versendet BIGINT)
LANGUAGE sql STABLE
AS $$
  -- Function body here
$$;

// Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION get_timeseries TO authenticated;
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma $queryRaw untyped | Prisma TypedSQL (Preview) | 2025 | Type-safe raw SQL |
| Manual aggregate enable | PostgREST 12 aggregate support | 2024 | Built-in aggregate syntax |
| No materialized view support | Supabase mat. view refresh | 2024 | pg_cron integration |

**New tools/patterns to consider:**
- **Prisma TypedSQL**: GA expected 2025-2026, enables type-safe complex queries
- **Supabase Edge Functions**: Can run aggregation logic closer to DB if needed
- **PostgREST aggregate syntax**: `.select('*, count(*)')` now possible

**Current limitations:**
- Prisma groupBy cannot group by date part (day from timestamp) - use raw SQL
- Supabase JS client doesn't have native groupBy - use RPC or raw endpoint
</sota_updates>

<open_questions>
## Open Questions

1. **Materialized views needed?**
   - What we know: Dashboard loads are fast currently (~100 Lighthouse score)
   - What's unclear: Will performance degrade at scale (1000s of orders)?
   - Recommendation: Monitor query times; add materialized views if >200ms

2. **RPC function security**
   - What we know: RPC functions run as authenticated user
   - What's unclear: RLS policies apply to function queries?
   - Recommendation: Test RLS behavior with RPC functions during implementation

3. **pg_cron availability**
   - What we know: Supabase supports pg_cron on paid plans
   - What's unclear: Available on current project tier?
   - Recommendation: Check Supabase plan; use app-level cron if needed
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Prisma Aggregation Docs](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing) - groupBy, aggregate syntax
- [Prisma TypedSQL](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql) - type-safe raw SQL
- [Supabase PostgREST Aggregate Functions](https://supabase.com/blog/postgrest-aggregate-functions) - aggregate enabling
- [PostgreSQL Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html) - partial index syntax

### Secondary (MEDIUM confidence)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions) - RPC pattern
- [Prisma Query Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance) - performance tips
- [Supabase Performance Tuning](https://supabase.com/docs/guides/platform/performance) - query debugging

### Tertiary (LOW confidence - verify during implementation)
- WebSearch results on materialized view refresh patterns
- Community patterns for Prisma + Supabase hybrid usage
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: PostgreSQL 15+ via Supabase
- Ecosystem: Prisma + Supabase JS client hybrid
- Patterns: RPC functions, DATE_TRUNC grouping, partial indexes
- Pitfalls: JS aggregation, missing indexes, timezone handling

**Confidence breakdown:**
- Standard stack: HIGH - already in use, verified patterns
- Architecture: HIGH - PostgreSQL aggregation is well-documented
- Pitfalls: HIGH - identified from codebase analysis
- Code examples: MEDIUM - need validation during implementation

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - stable tech stack)
</metadata>

---

*Phase: 41-query-optimization*
*Research completed: 2026-01-18*
*Ready for planning: yes*
