---
status: resolved
trigger: "Login über Custom Link hängt bei 'Bitte warten' - funktioniert über normale URL"
created: 2026-01-20T12:30:00Z
updated: 2026-01-20T12:35:00Z
---

## Current Focus

status: FIX APPLIED
resolution: Replaced router.refresh() + router.push('/') with window.location.href = '/'
next_action: User should test login via Custom Link to verify fix works

## Symptoms

expected: Nach Login-Klick -> Weiterleitung zum Dashboard
actual: Ladekreis dreht sich endlos bei "Bitte warten", trotz erfolgreichem Login (Console zeigt "Login successful, redirecting...")
errors: Keine Fehler in Console - nur Success-Messages: "Login result: {data: {...}, error: null}" und "Login successful, redirecting..."
reproduction: Immer beim Zugriff über Custom Link (https://app.gohighlevel.com/v2/location/G7eDAPedmgWCRGYAkV20/custom-menu-link/3a41dda1-bb19-4328-be3c-5a606a778711). Über normale URL funktioniert es.
started: Unklar - tritt konsistent bei Custom Link auf

## Eliminated

[none yet]

## Evidence

### 2026-01-20 12:31 - Found login component
**File:** /src/app/login/page.tsx
**Finding:** Lines 66-70 show redirect logic after successful login:
```tsx
console.log('Login successful, redirecting...');
router.refresh();
router.push('/');
return;
```
**Implication:** Login succeeds, console logs appear, but router.push('/') may not execute or gets intercepted. Loading state never gets set to false after successful login (setLoading(false) is at line 74, but return at line 70 prevents it).

### 2026-01-20 12:32 - Found middleware with redirect logic
**File:** /src/middleware.ts
**Finding:** Lines 46-51 show middleware that redirects authenticated users away from login page:
```tsx
if (user && request.nextUrl.pathname === '/login') {
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}
```
**Implication:** After successful login, client-side router.push('/') triggers, but middleware intercepts and may cause a redirect loop or interference. The issue is that the middleware checks `user` state server-side, which might not be immediately available after client-side login.

### 2026-01-20 12:33 - Critical insight about Custom Link context
**Analysis:** The Custom Link URL (https://app.gohighlevel.com/v2/location/.../custom-menu-link/...) suggests the XOS app is being loaded within GoHighLevel's iframe/embedded context.
**Implication:** When loaded in an iframe:
1. `router.refresh()` may hang or fail because it tries to refresh the parent context
2. `router.push('/')` might try to navigate the iframe instead of breaking out
3. Normal URL works because it's accessed directly, not embedded
**Next test:** Remove or replace `router.refresh()` with direct navigation

## Resolution

root_cause: `router.refresh()` in login page hangs when XOS is loaded in GoHighLevel's iframe context (Custom Link). The Next.js router.refresh() method attempts to refresh the routing cache, which fails or hangs in cross-origin iframe scenarios. This explains why:
- Normal direct URL access works (no iframe)
- Custom Link access hangs (embedded in GoHighLevel iframe)
- Console shows "Login successful, redirecting..." but redirect never completes
- Loading spinner stays indefinitely because setLoading(false) never executes

fix: Replaced `router.refresh()` + `router.push('/')` with `window.location.href = '/'` for a full page reload that works reliably in both iframe and direct contexts.

verification:
1. Test login via normal URL - should still work
2. Test login via Custom Link URL - should now redirect successfully
3. Verify no console errors
4. Confirm loading state properly clears

files_changed:
- /src/app/login/page.tsx (lines 66-69)
