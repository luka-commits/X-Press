---
status: resolved
trigger: "Im Auftragslistentab bin ich mir nicht sicher ob die Pagination-Funktionalität funktioniert - wenn ich auf nächste Seite klicke steht da immernoch 1/2"
created: 2026-01-18T12:00:00Z
updated: 2026-01-18T12:05:00Z
---

## Current Focus

hypothesis: CONFIRMED - OrderSearch useEffect triggers on every navigation, resetting page to 1
test: N/A - root cause confirmed
expecting: N/A
next_action: Fix OrderSearch to only trigger search when value actually changes, not on searchParams changes

## Symptoms

expected: Seitenanzeige aktualisiert (z.B. von '1/2' zu '2/2') UND neue Daten werden geladen
actual: Gar nichts passiert - weder Daten noch Anzeige ändern sich bei Klick
errors: Nicht geprüft (User hat Konsole nicht gecheckt)
reproduction: Immer - jeder Klick auf Pagination funktioniert nicht
started: Nicht sicher ob es je funktioniert hat

## Eliminated

[none yet]

## Evidence

### 1. Initial file discovery (12:00)
**Checked:** File structure for pagination components
**Found:**
- `/src/app/orders/page.tsx` - Server component that handles pagination via URL params
- `/src/components/orders/OrderTable.tsx` - Contains pagination UI
- Pagination uses URL-based state (`page` search param)
**Implication:** Pagination logic relies on URL updates, need to check if button clicks update URL

### 2. OrderTable.tsx pagination review (12:01)
**Checked:** `/src/components/orders/OrderTable.tsx` lines 65-69 and 216-241
**Found:**
- `handlePageChange` correctly updates URL params via `router.push()`
- Buttons properly call `onClick={() => handlePageChange(page - 1)}` and `onClick={() => handlePageChange(page + 1)}`
- Button disabled states use correct conditions
**Implication:** Client-side onClick and URL update logic appears correct - need to investigate if page prop is correct or if there's an issue with URL param handling

### 3. OrderSearch useEffect race condition FOUND (12:03)
**Checked:** `/src/components/orders/OrderSearch.tsx` lines 15-35
**Found:**
- `debouncedSearch` callback depends on `searchParams` (line 26)
- useEffect depends on `debouncedSearch` (line 35)
- When pagination changes URL, searchParams change
- This recreates `debouncedSearch`, triggering useEffect
- After 300ms, this pushes URL with `page=1` (line 23)

**ROOT CAUSE IDENTIFIED:**
When user clicks pagination:
1. `handlePageChange(2)` pushes `/orders?page=2`
2. searchParams change triggers debouncedSearch recreation
3. useEffect runs due to debouncedSearch dependency change
4. After 300ms delay, pushes `/orders?...&page=1` (reset!)
5. Page appears stuck on page 1

**Implication:** The OrderSearch component's useEffect incorrectly fires on every navigation, not just when search value changes

## Resolution

root_cause: OrderSearch component's useEffect fired on every URL navigation (including pagination), resetting page to 1. The debouncedSearch callback was recreated on every searchParams change, which triggered the useEffect, which then pushed a new URL with page=1 after 300ms delay.
fix: Refactored OrderSearch to use refs to track initial mount and last submitted value. The search is now only triggered when the value actually changes from the last submission, preventing spurious page resets on navigation.
verification: Code inspection confirms the fix - useRef prevents re-triggering on searchParams changes
files_changed:
  - /Users/lukaknieling/Desktop/X-Press/src/components/orders/OrderSearch.tsx
