# Coding Conventions

**Analysis Date:** 2026-01-16

## Naming Patterns

**Files:**
- PascalCase.tsx: React components (`KPICard.tsx`, `OrderFilters.tsx`, `CalendarCell.tsx`)
- kebab-case.ts: Services/utilities (`xml-parser.ts`, `import-service.ts`, `dashboard-queries.ts`)
- page.tsx, layout.tsx, loading.tsx: Next.js App Router conventions
- route.ts: API route handlers

**Functions:**
- camelCase for all functions (`parseXML()`, `getDashboardKPIs()`, `importAuftrag()`)
- No special prefix for async functions
- German domain terms preserved (`aggregiereZeit()`, `isLeitmaschine()`)

**Variables:**
- camelCase for variables (`searchParams`, `kundeIds`, `arbeitsgaenge`)
- UPPER_SNAKE_CASE for constants (`TIMEZONE = 'Europe/Berlin'`, `AUTO_REFRESH_INTERVAL`)
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces (`ParsedAuftrag`, `DashboardKPIs`, `MachineCapacity`)
- PascalCase for type aliases (`CriticalOrder`, `WeekStatistics`)
- No `I` prefix for interfaces

## Code Style

**Formatting:**
- 2-space indentation
- Double quotes for strings and imports
- Semicolons required
- No Prettier config (relies on IDE defaults)

**Linting:**
- ESLint with `eslint-config-next`
- TypeScript strict mode enabled
- Run: `npm run lint`

## Import Organization

**Order:**
1. React/Next.js imports (`'use client'`, `import { useRouter }`)
2. External packages (`date-fns`, `@supabase/supabase-js`)
3. Internal modules (`@/lib/supabase`, `@/components/ui/button`)
4. Relative imports (`./utils`, `../types`)

**Path Aliases:**
- `@/*` maps to `./src/*` (`tsconfig.json`)
- Example: `import { cn } from "@/lib/utils"`

## Error Handling

**Patterns:**
- Throw errors in service functions, catch at API/component boundary
- Prisma transactions for multi-step DB operations
- File operations wrapped in try/catch with error logging

**Error Types:**
- Throw on invalid XML structure with descriptive message
- Return JSON error responses from API routes
- Move failed files to `data/failed/` with error context

## Logging

**Framework:**
- Console.log (no structured logger)
- Prefix with `[XOS]` for clarity

**Patterns:**
- Log at service boundaries (import start/complete)
- Log errors with context before throwing
- Development-focused (no log levels)

## Comments

**When to Comment:**
- Explain "why" for non-obvious logic
- Document German domain terms
- Mark unresolved items with `// TBD`

**Section Headers:**
```typescript
// ============================================================
// Types
// ============================================================
```

**JSDoc:**
- Used for exported functions with `@param` and return descriptions
- German comments acceptable for domain logic

**Example:**
```typescript
/**
 * Konvertiert Excel OLE Datum (Tage seit 1900-01-01) zu JavaScript Date
 */
export function excelDateToJS(excelDate: number | string | null): Date | null
```

## Function Design

**Size:**
- Keep functions focused (single responsibility)
- Extract helpers for complex parsing logic

**Parameters:**
- Use object destructuring for multiple params
- Default values in function signature
- Example: `getDashboardKPIs(date: Date = new Date())`

**Return Values:**
- Explicit return types on exports
- Use `null` for missing values (not `undefined`)
- Return early for guard clauses

## Module Design

**Exports:**
- Named exports preferred
- Barrel exports via `index.ts` in component directories
- Default exports only for page components

**Component Structure:**
```typescript
'use client'; // if interactive

import { ... } from '...';

interface ComponentProps {
  // typed props
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // implementation
}
```

## Domain Language

**German Terms (preserved):**
- `Auftrag` (order), `Kunde` (customer)
- `Maschine` (machine), `Arbeitsgang` (work step)
- `Liefertermin`, `Drucktermin`, `WTV-Termin` (deadlines)
- `Kostenstelle` (cost center), `Sachbearbeiter` (account manager)

**UI Labels:**
- German locale via `date-fns/locale/de`
- Format: `dd.MM.yyyy` for dates

---

*Convention analysis: 2026-01-16*
*Update when patterns change*
