---
status: resolved
trigger: "Versand page shows 'Fehler beim Laden der Aufträge' error"
created: 2026-01-16T12:00:00Z
updated: 2026-01-16T12:10:00Z
---

## Current Focus

hypothesis: CONFIRMED - Database connection pool exhausted due to orphaned dev servers
test: Killed orphaned processes and verified API works
expecting: N/A - resolved
next_action: Archive debug file

## Symptoms

expected: Orders should load and display on the Versand page
actual: Red error banner "Fehler beim Laden der Aufträge", all counts show 0
errors: GET http://localhost:3004/api/versand/orders?deadline=all 500 (Internal Server Error)
reproduction: Open /versand page
started: Unknown - user just reported

## Eliminated

- API code logic: Code inspection showed no bugs, standard Prisma query pattern
- Database schema: Schema is correctly defined with all required fields
- Geocoding module: PLZ lookup working correctly

## Evidence

[2026-01-16 12:05] Tested direct Prisma query
- Checked: prisma.auftrag.findMany() with same parameters as API
- Found: PrismaClientInitializationError: "FATAL: MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size"
- Implication: Database connection pool is exhausted. This is a Supabase-specific error when using Session Mode pooler and too many connections are open.

[2026-01-16 12:06] Root cause identified
- The error is NOT in the API code logic
- The error is in the database connection layer
- Supabase's connection pooler (Transaction or Session mode) has reached its limit
- This typically happens when: (1) Too many Prisma clients are created, (2) connections aren't being released, or (3) the pool_size limit is too low

[2026-01-16 12:07] Found multiple Next.js dev server instances
- Checked: `pgrep -f "next dev"` and `ps aux | grep next`
- Found: 5 separate Next.js dev server processes running simultaneously (PIDs: 82032, 87821, 90506, 91451, 97061)
- Implication: Each dev server creates its own Prisma client, multiplying connection count. Supabase free tier has limited pool_size, so 5 servers exhausted it.

[2026-01-16 12:08] Killed orphaned dev servers
- Action: `kill 82032 87821 90506 91451`
- Kept only PID 97061 (most recent/active)
- Result: API now returns 200 with order data

## Resolution

root_cause: Multiple orphaned Next.js dev server processes (5 instances) each creating their own Prisma client connections, exceeding Supabase's session mode connection pool limit
fix: Killed 4 orphaned dev server processes, keeping only the active one (PID 97061)
verification: API call to /api/versand/orders?deadline=all now returns 200 with 48 orders
files_changed: []
