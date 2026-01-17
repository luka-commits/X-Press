# Codebase Structure

**Analysis Date:** 2026-01-17

## Directory Layout

```
X-Press/
├── src/                    # Application source code
│   ├── app/               # Next.js App Router pages & API
│   ├── components/        # React components
│   ├── lib/               # Business logic & utilities
│   ├── __tests__/         # Test utilities and fixtures
│   └── instrumentation.ts # Server startup hook
├── e2e/                    # Playwright E2E tests
├── prisma/                 # Database schema
├── data/                   # XML processing directories
│   ├── hotfolder/         # Input XMLs
│   ├── processed/         # Successfully imported
│   ├── failed/            # Import errors
│   └── samples/           # Test data
├── public/                 # Static assets
└── .planning/              # GSD planning docs
```

## Directory Purposes

**src/app/**
- Purpose: Next.js 14 App Router (pages, layouts, API routes)
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `api/` routes
- Key files:
  - `page.tsx` - Dashboard (/)
  - `orders/page.tsx` - Orders list
  - `calendar/page.tsx` - Machine calendar
  - `api/import/route.ts` - XML import endpoint
  - `api/orders/route.ts` - Orders API

**src/components/**
- Purpose: Reusable React components
- Contains: Feature-specific and UI primitive components
- Subdirectories:
  - `dashboard/` - KPICard, CapacityChart, MachineCards, KPI-Overlay-Dialoge
  - `calendar/` - MachineCalendarGrid, CalendarCell, WeekNavigation
  - `orders/` - OrderFilters, OrderSearch, OrderTable
  - `layout/` - Header, MainLayout, Sidebar
  - `ui/` - shadcn/ui primitives (button, input, select, table)
  - `reports/` - PipelineDashboard, FunnelChart, SnapshotKPIs, ThroughputChart, Drilldown
  - `versand/` - VersandKPIs, VersandList, RouteBuilder, RouteOptimizer
  - `map/` - GoogleMap, MarkerClusterer, MapMarker
  - `status/` - StatusButtons, OrderSearch, StatusConfirmation

**src/lib/**
- Purpose: Business logic, services, utilities
- Contains: All non-UI TypeScript code
- Key files:
  - `xml-parser.ts` - Prinance XML extraction
  - `import-service.ts` - Database import with transactions
  - `hotfolder-watcher.ts` - File system monitoring
  - `dashboard-queries.ts` - Dashboard KPI queries
  - `calendar-queries.ts` - Machine timeline queries
  - `reporting-queries.ts` - Reports/Pipeline Analytics queries
  - `route-utils.ts` - Routenoptimierung (Nearest-Neighbor)
  - `prisma.ts` - Prisma client singleton
  - `supabase.ts` - Supabase REST client
  - `utils.ts` - Tailwind utilities (cn function)
  - `geocoding/` - Google Maps Geocoding utilities

**prisma/**
- Purpose: Database schema and migrations
- Contains: `schema.prisma` with Auftrag, Kunde, Arbeitsgang, Maschine models
- Migrations: Managed via Supabase

**data/**
- Purpose: XML file processing pipeline
- Subdirectories:
  - `hotfolder/` - Drop XMLs here for auto-import
  - `processed/` - Successfully imported files (42 files)
  - `failed/` - Failed imports with error logs (81 files)
  - `samples/` - Test XML files

## Key File Locations

**Entry Points:**
- `src/instrumentation.ts` - Server startup (hotfolder init)
- `src/app/page.tsx` - Dashboard page
- `src/app/layout.tsx` - Root layout

**Configuration:**
- `next.config.mjs` - Next.js config
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind theme
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables

**Core Logic:**
- `src/lib/xml-parser.ts` - XML → TypeScript objects
- `src/lib/import-service.ts` - Objects → Database
- `src/lib/dashboard-queries.ts` - Dashboard data

**Testing:**
- `src/__tests__/utils/` - Prisma/Supabase mocks, test helpers
- `src/__tests__/fixtures/` - Order/Machine factory functions
- `src/components/**/__tests__/` - Component tests (Jest + Testing Library)
- `e2e/` - E2E tests (Playwright)

**E2E Tests (e2e/):**
- Purpose: End-to-end browser tests with Playwright
- Key files:
  - `smoke.spec.ts` - Smoke tests for all main pages

**Configuration:**
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Testing Library matchers
- `playwright.config.ts` - Playwright configuration

## Naming Conventions

**Files:**
- PascalCase.tsx: React components (`KPICard.tsx`, `OrderFilters.tsx`)
- kebab-case.ts: Services/utilities (`xml-parser.ts`, `import-service.ts`)
- page.tsx, layout.tsx: Next.js conventions
- route.ts: API route handlers

**Directories:**
- kebab-case: All directories (`dashboard/`, `calendar/`, `orders/`)
- Plural for collections (`components/`, `orders/`)

**Special Patterns:**
- `index.ts`: Barrel exports in component directories
- `[param]`: Dynamic route segments (`[id]`, `[machineId]`, `[date]`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/lib/` for logic, `src/components/` for UI
- Unit tests: `src/components/{feature}/__tests__/`
- E2E tests: `e2e/`
- Config: `src/lib/` or project root

**New Component:**
- Implementation: `src/components/{feature}/ComponentName.tsx`
- Types: Inline in component file
- Export: Add to `index.ts` barrel file

**New API Route:**
- Definition: `src/app/api/{path}/route.ts`
- Handler: Same file (Next.js convention)
- Shared logic: `src/lib/`

**New Page:**
- Implementation: `src/app/{path}/page.tsx`
- Loading state: `src/app/{path}/loading.tsx`
- Layout: `src/app/{path}/layout.tsx` (if needed)

**Utilities:**
- Shared helpers: `src/lib/utils.ts`
- Query functions: `src/lib/{domain}-queries.ts`

## Special Directories

**data/**
- Purpose: XML file pipeline (not source code)
- Source: External (Prinance ERP exports)
- Committed: No (in .gitignore, but samples/ may be tracked)

**.next/**
- Purpose: Next.js build output
- Source: Generated by `npm run build`
- Committed: No (.gitignore)

**node_modules/**
- Purpose: npm dependencies
- Source: `npm install`
- Committed: No (.gitignore)

---

*Structure analysis: 2026-01-18*
*Update when directory structure changes*
