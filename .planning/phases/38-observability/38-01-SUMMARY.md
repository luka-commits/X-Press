---
phase: 38-observability
plan: 01
subsystem: infra
tags: [sentry, pino, logging, health-check, observability, monitoring]

# Dependency graph
requires: []
provides:
  - Sentry error tracking with source maps
  - Structured JSON logging via pino
  - Health check endpoint for load balancer probes
affects: [deployment, production, monitoring, debugging]

# Tech tracking
tech-stack:
  added: ["@sentry/nextjs", "pino", "next-logger", "pino-pretty"]
  patterns: ["Instrumentation initialization order: Sentry -> logging -> hotfolder"]

key-files:
  created:
    - sentry.client.config.ts
    - sentry.server.config.ts
    - sentry.edge.config.ts
    - src/app/global-error.tsx
    - src/app/api/health/route.ts
    - src/types/next-logger.d.ts
  modified:
    - src/instrumentation.ts
    - next.config.mjs
    - .env.example
    - package.json

key-decisions:
  - "tracesSampleRate 0.5 for low-traffic internal tool (avoid quota)"
  - "replaysOnErrorSampleRate 1.0 to capture all errors with replay"
  - "Health endpoint uses Prisma raw query for minimal overhead"

patterns-established:
  - "Sentry initialization via instrumentation.ts for server/edge runtime"
  - "Structured logging via next-logger patching console"

# Metrics
duration: 6min
completed: 2026-01-18
---

# Phase 38 Plan 01: Observability Summary

**Sentry error tracking with session replay, structured JSON logging via pino, and /api/health endpoint for production readiness**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-18T02:52:00Z
- **Completed:** 2026-01-18T02:58:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Sentry SDK installed and configured for client, server, and edge runtimes
- Structured JSON logging active via pino + next-logger
- Health check endpoint at /api/health with database connectivity check
- Global error boundary captures unhandled React errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install and configure Sentry for Next.js** - `11cbe0f` (feat)
2. **Task 2: Add structured logging with pino + next-logger** - `c4e151d` (feat)
3. **Task 3: Create health check endpoint** - `de6d297` (feat)

## Files Created/Modified

- `sentry.client.config.ts` - Client-side Sentry with session replay
- `sentry.server.config.ts` - Server-side Sentry initialization
- `sentry.edge.config.ts` - Edge runtime Sentry initialization
- `src/app/global-error.tsx` - React error boundary capturing errors to Sentry
- `src/app/api/health/route.ts` - Health endpoint for load balancer probes
- `src/types/next-logger.d.ts` - Type declaration for next-logger module
- `src/instrumentation.ts` - Updated to initialize Sentry, logging, hotfolder
- `next.config.mjs` - Wrapped with withSentryConfig for source maps
- `.env.example` - Added SENTRY_DSN and SENTRY_AUTH_TOKEN
- `package.json` - Added @sentry/nextjs, pino, next-logger, pino-pretty

## Decisions Made

- **tracesSampleRate 0.5:** Low-traffic internal tool doesn't need 100% tracing, avoids quota issues
- **replaysOnErrorSampleRate 1.0:** Capture all errors with session replay for debugging
- **Health endpoint raw query:** SELECT 1 is minimal overhead for connectivity check

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added type declaration for next-logger**
- **Found during:** Task 2 (structured logging setup)
- **Issue:** TypeScript build failed - no declaration file for 'next-logger' module
- **Fix:** Created src/types/next-logger.d.ts with module declaration
- **Files modified:** src/types/next-logger.d.ts
- **Verification:** Build succeeds without type errors
- **Committed in:** c4e151d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for TypeScript compilation. No scope creep.

## Issues Encountered

- Sentry deprecation warnings about config file locations (informational only, current setup works)
- next-logger lacks TypeScript types (resolved with custom declaration)

## User Setup Required

None - no external service configuration required for local development.

**Note:** For production deployment, users need to configure:
- `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` from Sentry project
- `SENTRY_AUTH_TOKEN` for source map uploads

These are already documented in `.env.example`.

## Next Phase Readiness

- Observability stack fully configured
- Ready for Phase 39 (CI/CD) to leverage error tracking
- Health endpoint ready for deployment health checks

---
*Phase: 38-observability*
*Plan: 01*
*Completed: 2026-01-18*
