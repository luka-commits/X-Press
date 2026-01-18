---
status: resolved
trigger: "Versandtab zeigt 18 Aufträge in Liste als versandbereit, aber Feld darüber sagt nur 10"
created: 2026-01-18T12:00:00Z
updated: 2026-01-18T12:12:00Z
resolved: 2026-01-18T12:12:00Z
---

## Current Focus

hypothesis: CONFIRMED - Pagination limit (25) restricts "allOrders" fetch for KPIs
test: Code analysis shows allOrders fetch uses default limit=25
expecting: Setting higher limit or removing pagination for KPI fetch will fix mismatch
next_action: Fix by adding limit=1000 to the allParams in VersandOrderList.tsx

## Symptoms

expected: Zähler-Feld und Listenanzahl sollten übereinstimmen
actual: Liste zeigt 18 Aufträge, Zähler zeigt 10
errors: Keine Fehler in Browser-Konsole
reproduction: Immer - jedes Mal beim Öffnen des Versandtabs
started: Unbekannt

## Eliminated

[none yet]

## Evidence

### 2026-01-18T12:05:00Z - Initial Code Analysis

**Files examined:**
- `/Users/lukaknieling/Desktop/X-Press/src/app/versand/page.tsx` - Main page, renders VersandOrderList
- `/Users/lukaknieling/Desktop/X-Press/src/components/versand/VersandOrderList.tsx` - Core component
- `/Users/lukaknieling/Desktop/X-Press/src/components/versand/VersandKPIs.tsx` - KPI display component
- `/Users/lukaknieling/Desktop/X-Press/src/app/api/versand/orders/route.ts` - API endpoint

**Key Findings:**

1. **VersandOrderList (line 107-150):** Makes TWO API calls:
   - `filteredResponse`: Fetches with deadline + versandStatus filters
   - `allResponse`: Fetches with deadline only (no versandStatus filter) for KPIs

2. **VersandKPIs (line 30-44):** Receives `orders` array and counts by filtering:
   - `offen`: versandStatus === 'offen' OR null
   - `versandbereit`: versandStatus === 'versandbereit'
   - `versendet`: versandStatus === 'versendet'
   - `ueberfaellig`: liefertermin < today AND not versendet

3. **API Endpoint (line 28):** Uses default pagination `limit: 25`

4. **CRITICAL BUG IDENTIFIED:**
   - When `statusFilter !== 'all'` (e.g., 'versandbereit'), the filtered list shows 18 orders
   - But `allOrders` fetch for KPIs also uses pagination (limit=25)
   - If total orders > 25, only first 25 are fetched for KPI calculation
   - KPIs count "versandbereit" from only the first 25 orders, not all orders

**Root Cause Hypothesis:**
The allOrders API call for KPIs uses default pagination (limit=25), but there are more than 25 total orders.
The KPIs are calculated from a subset of orders, causing the "Versandbereit" count (10) to differ from
the actual displayed filtered list (18 versandbereit orders).

### 2026-01-18T12:10:00Z - Root Cause Confirmed

**Analysis confirmed:**
- API endpoint `/api/versand/orders` uses default `limit: 25` (line 28)
- `VersandOrderList` makes two API calls:
  1. Filtered for display (e.g., versandStatus=versandbereit) - returns up to 25 matching orders
  2. For KPIs (no status filter) - returns first 25 orders regardless of status
- When there are >25 total orders, the KPI counts come from only the first 25
- This causes mismatch: filtered list shows all 18 versandbereit orders, but KPI shows only 10 (those in first 25 total)

## Resolution

root_cause: API pagination limit (25) applied to KPI data fetch, causing incomplete order set for count calculations
fix: Added explicit `limit=1000` to both API fetches in VersandOrderList.tsx to ensure all orders are retrieved
verification: Build succeeded, all 24 VersandKPIs tests pass, 230 total unit tests pass
files_changed:
  - /Users/lukaknieling/Desktop/X-Press/src/components/versand/VersandOrderList.tsx (lines 115-125)
