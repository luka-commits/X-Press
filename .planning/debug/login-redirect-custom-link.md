---
status: investigating
trigger: "Login über Custom Link hängt bei 'Bitte warten' - funktioniert über normale URL"
created: 2026-01-20T12:30:00Z
updated: 2026-01-20T12:40:00Z
---

## Current Focus

status: FIX IMPLEMENTED - awaiting deployment and testing
root_cause: Third-party cookie blocking in iframe context
solution: Configure sameSite: 'none' + secure: true for all Supabase cookies
next_action: deploy to production and test with Custom Link URL

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

### 2026-01-20 12:45 - Previous fix deployed but still hanging
**File:** /src/app/login/page.tsx
**Finding:** Line 68 confirms `window.location.href = '/'` is deployed, but user reports it still hangs
**Implication:** The issue is NOT with the navigation method. The redirect executes but the session is not persisting.

### 2026-01-20 12:46 - GoHighLevel iframe confirmation
**Context:** URL bar shows https://app.gohighlevel.com/v2/location/... which confirms XOS is embedded
**Implication:** When running in iframe, browser treats Supabase cookies as third-party cookies and may block them

### 2026-01-20 12:47 - Cookie blocking hypothesis
**Analysis:** Modern browsers (Chrome, Safari, Firefox) block third-party cookies by default. When XOS runs in GoHighLevel iframe:
1. Login succeeds on client-side (in-memory session)
2. window.location.href = '/' triggers redirect
3. Middleware runs and calls supabase.auth.getUser()
4. No cookies found (blocked by browser) -> user = null
5. Middleware redirects back to /login (infinite loop or hang)

**Evidence supporting this:**
- Works in direct access (same-site cookies)
- Fails in iframe (third-party cookies blocked)
- Console shows "Login successful" but redirect never completes
- No cookie-related configuration in Supabase client setup

## Resolution

root_cause: Third-party cookie blocking prevents Supabase session persistence when XOS is embedded in GoHighLevel iframe. Even though login succeeds, the session cookies cannot be stored/retrieved due to browser security policies (default sameSite: 'lax' doesn't work in iframes). The middleware then sees no user and blocks access, creating a redirect loop or hang.

fix: Configure all Supabase cookie handlers to use sameSite: 'none' and secure: true, which allows cookies to work in cross-origin iframe contexts. This is required for:
- Modern browsers that block third-party cookies by default
- Embedded contexts like GoHighLevel Custom Links
- Cross-origin iframe scenarios

changes_made:
1. Updated browser client cookie options (src/lib/auth.ts)
2. Updated middleware cookie handler (src/middleware.ts)
3. Updated auth callback cookie handler (src/app/auth/callback/route.ts)
4. Updated server-side auth cookie handler (src/lib/auth-server.ts)
5. Added debug logging to track session persistence
6. Added iframe detection helper

verification_steps:
1. Deploy changes to production
2. Test login via Custom Link URL in GoHighLevel
3. Check browser console for:
   - "Running in iframe: true"
   - "Session after login: {session: {...}}" (should have session object)
   - Middleware logs showing cookies present
4. Verify successful redirect to dashboard
5. Test direct URL access still works

requirements:
- HTTPS must be enabled (required for sameSite: 'none')
- Browser must support SameSite=None cookies (all modern browsers do)

files_changed:
- /src/lib/auth.ts (added iframe detection and cookie options)
- /src/middleware.ts (updated cookie handler with sameSite: none)
- /src/app/auth/callback/route.ts (updated cookie handler with sameSite: none)
- /src/lib/auth-server.ts (updated cookie handler with sameSite: none)
- /src/app/login/page.tsx (added debug logging)

## Next Steps

1. **Deploy to Production**
   - Code is ready and builds successfully
   - Deploy to Vercel/production environment
   - Ensure HTTPS is enabled (required for sameSite: 'none')

2. **Test Login via Custom Link**
   - Open GoHighLevel Custom Link URL in browser
   - Open browser DevTools console
   - Enter login credentials
   - Look for these console logs:
     ```
     Login result: {data: {...}, error: null}
     Running in iframe: true
     Current location: https://app.gohighlevel.com/...
     Login successful, redirecting...
     Session after login: {session: {...}}  <- Should have session object
     [Middleware] {path: '/', hasUser: true, cookies: [...]}  <- Should show cookies
     ```
   - Verify redirect to dashboard succeeds

3. **Test Login via Direct URL**
   - Open XOS URL directly (not via GoHighLevel)
   - Login should still work normally
   - Console should show: `Running in iframe: false`

4. **Verify Cookie Settings in DevTools**
   - Open Application/Storage tab in DevTools
   - Check Cookies section
   - Supabase auth cookies should have:
     - SameSite: None
     - Secure: Yes
     - HttpOnly: Yes (Supabase default)

5. **If Still Not Working**
   - Check console for error messages
   - Verify HTTPS is enabled (required for sameSite: 'none')
   - Check if browser is blocking third-party cookies (Safari, Firefox strict mode)
   - Consider using localStorage fallback if cookies completely blocked

## Technical Background

### Why This Fix Works

Modern browsers (Chrome, Safari, Firefox) block third-party cookies by default to prevent cross-site tracking. When XOS is embedded in GoHighLevel's iframe:

1. **Without the fix:**
   - Supabase cookies use default `sameSite: 'lax'`
   - Browser blocks these cookies in iframe (third-party context)
   - Login succeeds in memory, but session is not persisted
   - After redirect, middleware finds no cookies → no user → redirect to login
   - Infinite loop or hang

2. **With the fix:**
   - All cookies configured with `sameSite: 'none'` + `secure: true`
   - Browser allows these cookies in iframe context
   - Session persists across redirects
   - Middleware finds cookies → user authenticated → allows access

### Browser Compatibility

- Chrome 80+: Full support for SameSite=None
- Safari 13+: Full support for SameSite=None
- Firefox 69+: Full support for SameSite=None
- Edge 80+: Full support for SameSite=None

All modern browsers support this approach.
