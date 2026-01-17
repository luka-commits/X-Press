# Codebase Concerns

**Analysis Date:** 2026-01-16

## Critical Security Issues

**Exposed Database Credentials:**
- Issue: `.env` file contains production Supabase credentials
- Files: `.env` (DATABASE_URL, DIRECT_URL, SUPABASE_ANON_KEY)
- Risk: Database fully accessible if repository is public
- Fix approach:
  1. Rotate all Supabase credentials immediately
  2. Remove `.env` from git history (BFG Repo-Cleaner)
  3. Add `.env` to `.gitignore`
  4. Update `.env.example` with all required vars (no real values)

**Debug Endpoint Exposed:**
- Issue: `/api/debug/orders` returns order data without authentication
- File: `src/app/api/debug/orders/route.ts`
- Risk: Information disclosure (customer names, order details)
- Fix approach: Delete route or wrap in `NODE_ENV === 'development'` check

## Tech Debt

**Duplicate Filter Logic:**
- Issue: Order filtering implemented twice with different clients
- Files: `src/app/orders/page.tsx` (Supabase), `src/app/api/orders/route.ts` (Prisma)
- Why: Rapid development, different data access patterns
- Impact: Bugs fixed in one place don't apply to other
- Fix approach: Extract to shared `src/lib/order-filters.ts`

**Type Suppressions:**
- Issue: `eslint-disable-next-line @typescript-eslint/no-explicit-any` used 3 times
- Files:
  - `src/lib/dashboard-queries.ts:176`
  - `src/lib/dashboard-queries.ts:256`
  - `src/lib/calendar-queries.ts:255`
- Why: Supabase nested relation typing complex
- Impact: Silent data transformation bugs possible
- Fix approach: Create typed response wrappers

## Performance Concerns

**N+1 Query in Machine Lookup:**
- Issue: Each work step triggers separate DB query for machine
- File: `src/lib/import-service.ts:101-112`
- Problem: Loop with `prisma.maschine.findUnique()` inside
- Cause: Kostenstelle lookup per Arbeitsgang
- Fix approach: Batch lookup with `findMany()` using `IN` clause before loop

**Sequential Dashboard Queries:**
- Issue: Two sequential queries in week statistics
- File: `src/lib/dashboard-queries.ts:280-320`
- Problem: Arbeitsgaenge query + Maschinen count query not parallelized
- Fix approach: Use `Promise.all()` or combine with Supabase JOIN

## Missing Validations

**API Parameter Validation:**
- Issue: No input validation on query parameters
- File: `src/app/api/orders/route.ts:14-26`
- Problem: No checks for negative pages, excessive limits, invalid sort columns
- Fix approach: Add Zod schema validation

**Raw XML Size Not Checked:**
- Issue: File size validation only for FormData uploads
- File: `src/app/api/import/route.ts:60`
- Problem: Raw XML body has no size limit (DoS risk)
- Fix approach: Check `xmlContent.length` or use streaming parser

## Documentation Gaps

**Magic Numbers in Date Conversion:**
- Issue: Excel epoch offset (25569) unexplained
- File: `src/lib/xml-parser.ts:105`
- Problem: `(numericDate - 25569) * 86400 * 1000` without context
- Fix approach: Add comment explaining Excel vs JS epoch difference

**Unverified Machine IDs:**
- Issue: Leitmaschinen kostenstellen hardcoded with "TBD" comment
- File: `src/lib/import-service.ts:217-223`
- Problem: `'4240', // Speedmaster CX 102-6+L (TBD - geschätzt)`
- Fix approach: Confirm all 5 kostenstellen with X-Press customer

## Test Coverage

**No Tests:**
- Issue: Zero test coverage
- Files: No `*.test.ts` files exist
- Risk:
  - Encoding bugs (`fixEncoding()`) undetected
  - Date conversion edge cases
  - Query aggregation errors
- Priority areas:
  1. `src/lib/xml-parser.ts` - encoding, date conversion
  2. `src/lib/import-service.ts` - transactions
  3. `src/lib/dashboard-queries.ts` - aggregation

## Logging

**Console.logs in Production:**
- Issue: 15+ console.log calls in production code paths
- Files:
  - `src/app/api/import/route.ts:68-70`
  - `src/lib/hotfolder-watcher.ts` (throughout)
  - `src/lib/import-service.ts:198`
- Impact: Log clutter, minor CPU overhead
- Fix approach: Conditional logging or structured logger (Pino)

## Env Template

**Incomplete .env.example:**
- Issue: Template missing 3 required variables
- File: `.env.example` vs `.env`
- Missing: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DIRECT_URL`
- Fix approach: Update template with all vars (placeholder values)

---

## Summary Table

| Issue | Severity | File | Fix Effort | Status |
|-------|----------|------|------------|--------|
| Exposed credentials in .env | CRITICAL | `.env` | High (git history rewrite) | ⚠️ Needs credential rotation |
| Debug endpoint exposed | HIGH | `api/debug/orders/route.ts` | Low (delete or guard) | ✅ Fixed (NODE_ENV guard) |
| Missing file size check | HIGH | `api/import/route.ts` | Low | ✅ Fixed |
| Duplicate filter logic | MEDIUM | `orders/page.tsx`, `api/orders/route.ts` | Medium | Open |
| N+1 queries | MEDIUM | `import-service.ts` | Low | ✅ Fixed (batch findMany) |
| No test coverage | MEDIUM | All | High (setup + write tests) | Open |
| Type suppressions | MEDIUM | `dashboard-queries.ts`, `calendar-queries.ts` | Medium | Open |
| No input validation | MEDIUM | `api/orders/route.ts` | Low (add Zod) | ✅ Fixed (inline validation) |
| Sequential queries | MEDIUM | `dashboard-queries.ts` | Low | ✅ Fixed (Promise.all) |
| Magic number undocumented | LOW | `xml-parser.ts` | Trivial | ✅ Already documented |
| Console.logs in production | LOW | Multiple | Low | Open |
| Incomplete .env.example | LOW | `.env.example` | Trivial | ✅ Fixed |

---

*Concerns audit: 2026-01-16*
*Last updated: 2026-01-17*
*Update as issues are fixed or new ones discovered*
