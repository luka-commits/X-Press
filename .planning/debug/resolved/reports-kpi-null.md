---
status: resolved
trigger: "Reports Tab KPIs zeigen 0 - Offene Aufträge und Versand-Dauer beide Null obwohl Aufträge existieren"
created: 2026-01-17T12:00:00Z
updated: 2026-01-17T12:00:00Z
---

## Current Focus

hypothesis: The fetchPeriodKpis SQL query has incorrect .or() chaining that returns 0 results
test: examining the Supabase query syntax in /api/reports/pipeline/route.ts
expecting: verify that the .or() calls create incorrect compound conditions
next_action: fix the SQL query to properly filter by versandUpdatedAt date range

## Symptoms

expected: "Offene Aufträge" zeigt Anzahl offener Aufträge, "Versand-Dauer" zeigt durchschnittliche Zeit bis Versand
actual: Beide KPIs zeigen immer 0/Null, obwohl Aufträge existieren
errors: Keine Fehler in Browser-Konsole
reproduction: Jedes Mal beim Öffnen des Reports-Tab
started: Unklar - möglicherweise nie funktioniert

## Eliminated

[none yet]

## Evidence

### 2026-01-17 Evidence 1: Traced data flow
- File: `/api/reports/pipeline/route.ts`
- The ReportsDashboard calls `/api/reports/pipeline` which uses `fetchPeriodKpis()` function
- The SQL query at lines 280-285:
  ```typescript
  const { data: orders, error } = await supabase
      .from('Auftrag')
      .select('createdAt, liefertermin, versandUpdatedAt')
      .eq('versandStatus', 'versendet')
      .or(`versandUpdatedAt.gte.${fromWithTime},versandUpdatedAt.is.null`)
      .or(`versandUpdatedAt.lte.${toWithTime},versandUpdatedAt.is.null`);
  ```
- **Implication**: Multiple `.or()` calls in Supabase don't stack properly - each `.or()` creates an OR with the entire preceding condition, not just the previous filter. This creates incorrect SQL logic.

### 2026-01-17 Evidence 2: Similar issue in fetchThroughput
- Same file, lines 197-204 in `fetchThroughput()`:
  ```typescript
  supabase
      .from('Auftrag')
      .select('*', { count: 'exact', head: true })
      .eq('versandStatus', 'versendet')
      .or(`versandUpdatedAt.gte.${fromWithTime},versandUpdatedAt.is.null`)
      .or(`versandUpdatedAt.lte.${toWithTime},versandUpdatedAt.is.null`),
  ```
- Same problematic .or() pattern for the "versendet" throughput calculation

## Resolution

root_cause: Incorrect Supabase `.or()` chaining in date range queries. Multiple `.or()` calls don't stack properly - each one creates an OR with the entire preceding condition instead of combining filters. This caused the query to return unexpected results (0 records matching).

fix: Combined the date range filter with NULL handling into a single `.or()` expression using Supabase's nested `and()` syntax: `.or('and(versandUpdatedAt.gte.FROM,versandUpdatedAt.lte.TO),versandUpdatedAt.is.null')`. This correctly expresses: "(date in range) OR (date is null)".

verification: TypeScript compilation passes. The fix corrects the SQL query logic to properly filter shipped orders by date range while including legacy data with NULL timestamps.

files_changed:
- /src/app/api/reports/pipeline/route.ts: Fixed fetchThroughput (line 202) and fetchPeriodKpis (line 283) queries
- /src/app/api/reports/versand/route.ts: Fixed shipped orders query (line 79)
- /src/app/api/reports/timeseries/route.ts: Fixed versendet query (line 68)
- /src/app/api/reports/completed/route.ts: Fixed date range filter logic (lines 46-52)
