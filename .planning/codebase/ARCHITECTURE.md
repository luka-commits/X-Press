# Architecture

**Analysis Date:** 2026-01-16

## Pattern Overview

**Overall:** Full-Stack Next.js Monolith with Layered Architecture

**Key Characteristics:**
- Server-side rendering with React Server Components
- File-based data ingestion (XML hotfolder)
- Dual database client strategy (Prisma for writes, Supabase REST for reads)
- Read-only dashboard (no manual data entry)

## Layers

```
┌─────────────────────────────────────────────┐
│  Pages (App Router - Next.js 14)            │
├─────────────────────────────────────────────┤
│  React Components (UI Layer)                │
├─────────────────────────────────────────────┤
│  API Routes (HTTP Endpoints)                │
├─────────────────────────────────────────────┤
│  Service Layer (Business Logic)             │
├─────────────────────────────────────────────┤
│  Data Access Layer (Prisma + Supabase)      │
├─────────────────────────────────────────────┤
│  Database: PostgreSQL (Supabase)            │
└─────────────────────────────────────────────┘
```

**Presentation Layer:**
- Purpose: Render UI, handle user interactions
- Contains: React components, page layouts
- Location: `src/app/`, `src/components/`
- Depends on: Service layer for data

**API Layer:**
- Purpose: HTTP endpoints for data operations
- Contains: REST endpoints (GET, POST)
- Location: `src/app/api/`
- Depends on: Service layer, Prisma client

**Service Layer:**
- Purpose: Business logic, data transformation
- Contains: XML parsing, import logic, query aggregation
- Location: `src/lib/`
- Depends on: Data access layer

**Data Access Layer:**
- Purpose: Database operations
- Contains: Prisma client (writes), Supabase client (reads)
- Location: `src/lib/prisma.ts`, `src/lib/supabase.ts`
- Depends on: PostgreSQL

## Data Flow

**Import Flow (XML → Database):**

1. XML file placed in `data/hotfolder/`
2. Chokidar watcher detects file (`src/lib/hotfolder-watcher.ts`)
3. Parser extracts data (`src/lib/xml-parser.ts`)
4. Import service saves to DB (`src/lib/import-service.ts`)
5. File moved to `data/processed/` or `data/failed/`

**Dashboard Flow (Query → UI):**

1. Page component calls query function
2. Supabase REST API fetches data (`src/lib/dashboard-queries.ts`)
3. Data aggregated (KPIs, machine capacity)
4. React components render results
5. Auto-refresh every 5 minutes

**State Management:**
- Minimal client state (React hooks only)
- Server Components for data fetching
- No Redux/Context needed

## Key Abstractions

**Service Functions:**
- Purpose: Encapsulate business logic
- Examples: `parseXML()`, `importAuftrag()`, `getDashboardKPIs()`
- Location: `src/lib/*.ts`
- Pattern: Pure functions, async/await

**Query Functions:**
- Purpose: Aggregated data retrieval
- Examples: `getMachineCapacityForDate()`, `getCriticalOrders()`
- Location: `src/lib/dashboard-queries.ts`, `src/lib/calendar-queries.ts`
- Pattern: Supabase queries with Map-based aggregation

**Components:**
- Purpose: Reusable UI elements
- Examples: `KPICard`, `OrderTable`, `CalendarCell`
- Location: `src/components/`
- Pattern: Functional components with TypeScript props

## Entry Points

**Server Startup:**
- Location: `src/instrumentation.ts`
- Triggers: Next.js server start
- Responsibilities: Initialize hotfolder watcher

**Dashboard Page:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to /
- Responsibilities: Fetch KPIs, render dashboard

**API Import:**
- Location: `src/app/api/import/route.ts`
- Triggers: POST request with XML
- Responsibilities: Parse and import order data

## Error Handling

**Strategy:** Throw at service level, catch at API/component boundary

**Patterns:**
- XML parser throws on invalid structure
- Import service uses Prisma transactions (rollback on failure)
- Hotfolder moves failed files to `data/failed/` with error logs
- API routes return JSON error responses

## Cross-Cutting Concerns

**Logging:**
- Console.log throughout (no structured logger)
- Hotfolder watcher logs all operations

**Timezone:**
- `Europe/Berlin` for all date operations
- `date-fns-tz` for conversions

**Caching:**
- Disabled (`export const dynamic = 'force-dynamic'`)
- Real-time data priority

---

*Architecture analysis: 2026-01-16*
*Update when major patterns change*
