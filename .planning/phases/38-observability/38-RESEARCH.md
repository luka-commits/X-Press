# Phase 38: Observability - Research

**Researched:** 2026-01-18
**Domain:** Sentry Error-Tracking, Structured Logging, Health Checks for Next.js
**Confidence:** HIGH

<research_summary>
## Summary

Researched the observability ecosystem for Next.js 14 production deployments. The standard approach uses Sentry for error tracking (with automatic instrumentation), pino via next-logger for structured JSON logging, and a simple health check API endpoint.

Key finding: Sentry's wizard-based setup handles most configuration automatically, including source map uploads. For logging, next-logger patches Next.js internals to output JSON logs without code changes - it integrates via the existing instrumentation hook. Health checks are straightforward API routes with optional database connectivity checks.

**Primary recommendation:** Use `@sentry/nextjs` via wizard setup (4 config files generated), add `next-logger` + `pino` for structured logs via existing instrumentation.ts, and create `/api/health` endpoint. The Sentry SDK v10.18.0+ has built-in pino integration for unified error+log capture.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @sentry/nextjs | ^10.18.0 | Error tracking, performance monitoring | Official Sentry SDK for Next.js, auto-instrumentation |
| pino | ^8.x or ^9.x | High-performance JSON logging | Fastest Node.js logger, 10x faster than winston |
| next-logger | ^5.x | Patches Next.js to use pino | Zero code changes, uses instrumentation hook |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pino-pretty | ^11.x | Human-readable logs in dev | Development only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pino | winston | Winston more features, pino 10x faster |
| next-logger | Manual pino setup | next-logger = zero code changes, but less control |
| Sentry | Datadog, New Relic | Sentry has best Next.js integration, cheaper for small teams |

**Installation:**
```bash
# Sentry (use wizard for automatic setup)
npx @sentry/wizard@latest -i nextjs

# Logging
npm install pino next-logger pino-pretty
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── instrumentation.ts     # Sentry + pino + hotfolder init
├── app/
│   ├── global-error.tsx   # Sentry error boundary (App Router)
│   └── api/
│       └── health/
│           └── route.ts   # Health check endpoint
├── lib/
│   └── logger.ts          # Optional: custom pino instance
├── sentry.client.config.ts  # Browser Sentry config
├── sentry.server.config.ts  # Server Sentry config
└── sentry.edge.config.ts    # Edge runtime config (if used)
```

### Pattern 1: Sentry Initialization with Pino Integration
**What:** Initialize Sentry with pinoIntegration to capture logs as Sentry events
**When to use:** When you want both error tracking AND log aggregation in Sentry
**Example:**
```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust based on traffic
  integrations: [
    Sentry.pinoIntegration({
      log: { levels: ['info', 'warn', 'error'] },
      error: { levels: ['error'] },
    }),
  ],
});
```

### Pattern 2: next-logger via Instrumentation Hook
**What:** Patch Next.js logging to output structured JSON
**When to use:** Always - replaces console.log with structured output
**Example:**
```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry first
    await import('../sentry.server.config');

    // Then patch logging
    await import('pino');
    await import('next-logger');

    // Existing hotfolder watcher code...
  }
}
```

### Pattern 3: Health Check with Database Connectivity
**What:** API endpoint returning service health status
**When to use:** Production deployments, load balancer health probes
**Example:**
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      },
      { status: 503 }
    );
  }
}
```

### Anti-Patterns to Avoid
- **Not using global-error.tsx:** App Router errors won't be captured without it
- **Setting tracesSampleRate to 1.0 in high-traffic prod:** Will exceed quota fast
- **Committing .env.sentry-build-plugin:** Contains auth token, must stay gitignored
- **Using console.log for structured data:** Use pino logger instance instead
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error tracking | Custom try/catch logging | Sentry | Stack traces, source maps, release tracking, alerting |
| Structured logging | Custom JSON formatter | pino + next-logger | Performance-optimized, tested edge cases |
| Source map uploads | Manual upload scripts | Sentry wizard/plugin | Handles auth, versioning, cleanup automatically |
| Log aggregation | File-based logging | Sentry Logs or Vercel Logs | Searchable, indexed, retention managed |
| Health checks | Complex monitoring | Simple /api/health endpoint | KISS - load balancers just need 200/503 |

**Key insight:** Sentry's SDK handles the hard parts (source maps, release tracking, error grouping, App Router instrumentation). next-logger patches Next.js internals correctly. Don't try to replicate this complexity.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Source Maps Not Working in Production
**What goes wrong:** Errors show minified code, not original source
**Why it happens:** SENTRY_AUTH_TOKEN not set in CI/CD, or source maps deleted before upload
**How to avoid:** Set SENTRY_AUTH_TOKEN in CI environment, verify uploads in Sentry UI
**Warning signs:** Stack traces show `webpack:///` paths with hashed filenames

### Pitfall 2: Missing App Router Errors
**What goes wrong:** Client-side React errors not captured
**Why it happens:** Missing `app/global-error.tsx` file
**How to avoid:** Sentry wizard creates this file - don't delete it
**Warning signs:** Console shows errors but Sentry dashboard is empty

### Pitfall 3: SSR Errors Not Correlated
**What goes wrong:** Server errors disconnected from client context
**Why it happens:** Sentry.setUser() on server doesn't propagate to client
**How to avoid:** Call setUser() separately on both server and client
**Warning signs:** User info missing on server-side errors

### Pitfall 4: Log Output in Wrong Format
**What goes wrong:** Logs are plaintext in production, not JSON
**Why it happens:** pino-pretty loaded in production, or next-logger not initialized
**How to avoid:** Only import pino-pretty in dev, verify instrumentation runs
**Warning signs:** Log aggregator can't parse log entries

### Pitfall 5: High Sentry Costs
**What goes wrong:** Quota exceeded, errors dropped
**Why it happens:** tracesSampleRate set too high for traffic volume
**How to avoid:** Start with 0.1-0.2 sample rate, adjust based on traffic
**Warning signs:** Sentry dashboard shows "events dropped" or quota warnings
</common_pitfalls>

<code_examples>
## Code Examples

### Sentry Configuration Files (Generated by Wizard)

**instrumentation-client.ts** (browser):
```typescript
// Source: Sentry wizard output
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2, // Adjust for traffic
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

**sentry.server.config.ts** (Node.js):
```typescript
// Source: Sentry docs + pino integration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  integrations: [
    Sentry.pinoIntegration({
      log: { levels: ['info', 'warn', 'error'] },
    }),
  ],
});
```

### Extended instrumentation.ts
```typescript
// Source: Project pattern + next-logger docs
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 1. Initialize Sentry (server-side)
    await import('../sentry.server.config');

    // 2. Initialize structured logging
    await import('pino');
    await import('next-logger');

    // 3. Existing hotfolder watcher
    const isDev = process.env.NODE_ENV === 'development';
    const isEnabled = process.env.HOTFOLDER_ENABLED === 'true';

    if (isDev || isEnabled) {
      const { startHotfolderWatcher } = await import('./lib/hotfolder-watcher');
      console.log('[XOS] Hotfolder-Watcher wird gestartet...');
      await startHotfolderWatcher();
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
```

### global-error.tsx (App Router Error Boundary)
```typescript
// Source: Sentry docs - required for App Router
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Etwas ist schiefgelaufen</h2>
        <button onClick={() => reset()}>Erneut versuchen</button>
      </body>
    </html>
  );
}
```

### next-logger.config.js (Optional Custom Config)
```javascript
// Source: next-logger docs
const pino = require('pino');

module.exports = {
  logger: (defaultConfig) =>
    pino({
      ...defaultConfig,
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
    }),
};
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual Sentry setup | Wizard with auto-config | 2024 | 4 files generated automatically |
| Separate logging + error tracking | Sentry pinoIntegration | SDK v10.18.0 | Unified observability |
| winston for server logging | pino + next-logger | 2023+ | Better performance, zero code changes |
| Custom source map scripts | Sentry build plugin | 2023 | Automatic upload during build |

**New tools/patterns to consider:**
- **Sentry Logs (Beta):** Direct log ingestion in Sentry, may replace need for separate log aggregator
- **OpenTelemetry integration:** Sentry supports OTLP for traces if you need multi-vendor

**Deprecated/outdated:**
- **Manual instrumentation.ts Sentry init:** Use sentry.server.config.ts instead
- **@sentry/browser separate package:** Use @sentry/nextjs which bundles everything
- **Source maps via CLI upload:** Build plugin is preferred
</sota_updates>

<open_questions>
## Open Questions

1. **Sentry Logs vs separate log aggregator**
   - What we know: Sentry Logs is in beta, captures pino output
   - What's unclear: Production readiness, pricing impact
   - Recommendation: Start with pinoIntegration, evaluate Sentry Logs later

2. **Sample rates for this project**
   - What we know: Low traffic internal tool
   - What's unclear: Exact traffic volume
   - Recommendation: Start with tracesSampleRate: 0.5, adjust after 1 week
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Sentry Next.js Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) - Config files, App Router setup
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/) - Installation, features
- [Sentry Pino Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/integrations/pino/) - pinoIntegration setup
- [pino-nextjs-example](https://github.com/pinojs/pino-nextjs-example) - Official pino example
- [next-logger npm](https://www.npmjs.com/package/next-logger) - Instrumentation hook usage

### Secondary (MEDIUM confidence)
- [Arcjet Structured Logging for Next.js](https://blog.arcjet.com/structured-logging-in-json-for-next-js/) - Patterns verified against docs
- [Complete Guide to Next.js Production Monitoring](https://eastondev.com/blog/en/posts/dev/20251220-nextjs-production-monitoring/) - Dec 2025 best practices
- [Hyperping Health Check Guide](https://hyperping.com/blog/nextjs-health-check-endpoint) - Health check patterns

### Tertiary (LOW confidence - needs validation)
- None - all findings verified with primary sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Sentry for Next.js 14
- Ecosystem: pino, next-logger, health checks
- Patterns: Error boundaries, instrumentation, structured logging
- Pitfalls: Source maps, sample rates, App Router errors

**Confidence breakdown:**
- Standard stack: HIGH - official docs, widely used
- Architecture: HIGH - from Sentry wizard output and next-logger docs
- Pitfalls: HIGH - documented in official troubleshooting guides
- Code examples: HIGH - from official sources and project patterns

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - Sentry SDK stable)
</metadata>

---

*Phase: 38-observability*
*Research completed: 2026-01-18*
*Ready for planning: yes*
