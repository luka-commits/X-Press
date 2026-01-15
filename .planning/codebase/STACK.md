# Technology Stack

**Analysis Date:** 2026-01-16

## Languages

**Primary:**
- TypeScript 5.7.3 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript - Build scripts, config files
- CSS - Tailwind utilities (`src/app/globals.css`)

## Runtime

**Environment:**
- Node.js (version not pinned, no `.nvmrc`)
- Next.js 14.2.21 server runtime

**Package Manager:**
- npm (inferred from `package-lock.json`)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.2.21 - Full-stack React framework (`next.config.mjs`)
- React 18.3.1 - UI library

**Testing:**
- Not configured (no test framework installed)

**Build/Dev:**
- TypeScript 5.7.3 - Compilation
- ESLint 8.57.0 - Linting (`eslint-config-next`)
- PostCSS 8.4.49 - CSS processing

## Key Dependencies

**Critical:**
- `@supabase/supabase-js 2.90.1` - Database REST client (`src/lib/supabase.ts`)
- `@prisma/client 6.2.1` - Database ORM (`src/lib/prisma.ts`)
- `fast-xml-parser 4.5.1` - Prinance XML parsing (`src/lib/xml-parser.ts`)
- `chokidar 5.0.0` - Hotfolder file watching (`src/lib/hotfolder-watcher.ts`)

**UI:**
- `tailwindcss 3.4.17` - Utility CSS (`tailwind.config.ts`)
- `@radix-ui/react-select 2.2.6` - Headless select components
- `lucide-react 0.562.0` - Icon library
- `recharts 3.6.0` - Data visualization

**Infrastructure:**
- `date-fns 4.1.0` - Date utilities
- `date-fns-tz 3.2.0` - Timezone handling (Europe/Berlin)
- `pg 8.16.3` - PostgreSQL driver

## Configuration

**Environment:**
- `.env` - Database URLs, Supabase credentials
- `.env.example` - Template (incomplete)
- Required vars: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Build:**
- `next.config.mjs` - Next.js config (strict mode, instrumentation hook)
- `tsconfig.json` - TypeScript (strict: true, bundler resolution)
- `tailwind.config.ts` - Custom GoHiLevel theme
- `components.json` - shadcn/ui (New York style)

## Platform Requirements

**Development:**
- Any platform with Node.js
- PostgreSQL via Supabase (cloud)
- No Docker required

**Production:**
- Vercel hosting (configured in `.vercel/`)
- Supabase PostgreSQL (AWS ap-south-1)

---

*Stack analysis: 2026-01-16*
*Update after major dependency changes*
