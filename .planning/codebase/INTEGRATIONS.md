# External Integrations

**Analysis Date:** 2026-01-16

## Data Storage

**PostgreSQL (Supabase):**
- Provider: Supabase (cloud-hosted PostgreSQL)
- Region: AWS ap-south-1
- Connection: `DATABASE_URL` env var (pooled), `DIRECT_URL` (migrations)
- Client: Prisma ORM v6.2.1 (`src/lib/prisma.ts`)
- REST API: Supabase JS v2.90.1 (`src/lib/supabase.ts`)
- Models: Auftrag, Kunde, Arbeitsgang, Maschine (`prisma/schema.prisma`)

**Dual Client Strategy:**
- Prisma: Server-side writes (imports, transactions)
- Supabase REST: UI reads (avoids connection pooler issues)

## Data Ingestion

**Heidelberg Prinance ERP (Read-Only):**
- Format: JDF/XML-compatible XML files
- Integration: Hotfolder file watching (`chokidar`)
- Parser: `fast-xml-parser` v4.5.1 (`src/lib/xml-parser.ts`)
- Watcher: `src/lib/hotfolder-watcher.ts`
- Directories:
  - Input: `data/hotfolder/`
  - Success: `data/processed/`
  - Failure: `data/failed/`

## APIs & External Services

**Payment Processing:**
- Not integrated

**Email/SMS:**
- Not integrated

**Analytics:**
- Not integrated

**Error Tracking:**
- Not integrated (no Sentry, etc.)

## Authentication & Identity

**Auth Provider:**
- Not integrated (no authentication layer)
- Supabase anon key used for public access

## CI/CD & Deployment

**Hosting:**
- Vercel (configured in `.vercel/`)
- Project: `x-press-xos`
- Team: `lukas-projects-8eaf2d00`

**CI Pipeline:**
- Not configured (no GitHub Actions)

## Environment Configuration

**Development:**
- Required vars: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Secrets location: `.env` (currently committed - SECURITY ISSUE)
- Template: `.env.example` (incomplete)

**Production:**
- Vercel environment variables
- OIDC token: `.env.vercel`

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## Third-Party APIs

**None currently integrated**

The application is focused on:
1. Reading XML exports from Prinance ERP (file-based)
2. Storing data in Supabase PostgreSQL
3. Displaying dashboards (no external API calls)

## Future Integration Candidates

Based on PRD (Säule 1):
- No live sensor integration planned
- No automatic stock booking
- No time tracking integration
- Read-only from Prinance (no write-back)

---

*Integration audit: 2026-01-16*
*Update when adding/removing external services*
