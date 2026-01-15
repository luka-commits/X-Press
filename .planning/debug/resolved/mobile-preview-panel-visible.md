---
status: resolved
trigger: "Mobile App View - Vorschaufenster bleibt sichtbar wenn Auftrag geoeffnet"
created: 2026-01-16T12:00:00Z
updated: 2026-01-16T12:05:00Z
---

## Current Focus

hypothesis: CONFIRMED - The OrderSearch dropdown reappears after selection due to searchTerm change triggering debounced API call
test: Code analysis confirms the flow
expecting: Dropdown hidden initially, reappears after 300ms when useEffect re-runs with new searchTerm
next_action: Implement fix - add state to track selection, skip API call after selection

## Symptoms

expected: Vorschaufenster sollte verschwinden wenn voller Auftrag in Mobile View geoeffnet wird
actual: Vorschaufenster bleibt sichtbar auch nach Oeffnen des vollen Auftrags
errors: Keine - passiert still
reproduction: Mobile View oeffnen -> Auftrag aus Liste waehlen -> Preview erscheint -> Auftrag oeffnen -> Preview bleibt sichtbar
started: Nie funktioniert - war schon immer so

## Eliminated

[none yet]

## Evidence

### 12:01 - Initial code review
- **Checked:** /src/app/status/page.tsx - StatusPage component
- **Found:** Page uses OrderSearch, OrderDetails, and StatusButtons components
- **Found:** selectedOrder state controls visibility of OrderDetails
- **Found:** handleOrderSelect sets selectedOrder, handleClear resets it to null
- **Implication:** Need to find where "preview panel" vs "full order view" distinction is made - OrderSearch might have its own preview state

### 12:02 - OrderDetails review
- **Checked:** /src/components/status/OrderDetails.tsx
- **Found:** This is the "full order" card display - shows order details with clear button
- **Found:** No internal state management - purely display component receiving order prop
- **Implication:** Preview panel must be in OrderSearch component

### 12:03 - OrderSearch analysis - FOUND ROOT CAUSE
- **Checked:** /src/components/status/OrderSearch.tsx - handleSelect and useEffect logic
- **Found BUG:**
  1. handleSelect calls `setShowDropdown(false)` then `setSearchTerm(order.auftragsnummer)`
  2. setSearchTerm triggers the debounced useEffect
  3. After 300ms, useEffect makes API call with new searchTerm
  4. API returns results, useEffect calls `setShowDropdown(data.results.length > 0)` = TRUE
  5. Dropdown reappears because showDropdown is set back to true
- **Root Cause:** handleSelect sets searchTerm which triggers debounced search, re-showing dropdown after 300ms

## Resolution

root_cause: When user selects an order from dropdown, handleSelect sets searchTerm to the order number which triggers the debounced useEffect. After 300ms, the API call completes and sets showDropdown back to true, causing the dropdown to reappear.

fix: Added `hasSelected` state flag that is set to true in handleSelect and checked in useEffect to skip search API call. Flag is reset when user types again via handleInputChange.

verification: TypeScript check passed (npx tsc --noEmit). Flow analysis confirms:
1. User selects order -> hasSelected=true, showDropdown=false, searchTerm=orderNumber
2. useEffect triggers but immediately returns due to hasSelected check
3. Dropdown stays hidden
4. User types again -> hasSelected=false, normal search resumes

files_changed:
- /src/components/status/OrderSearch.tsx: Added hasSelected state, early return in useEffect, handleInputChange function
