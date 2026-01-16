# Phase 19: Zeitraum-Analysen - Research

**Researched:** 2026-01-16
**Domain:** React charting for analytics dashboards with time-based data
**Confidence:** HIGH

<research_summary>
## Summary

Researched React charting libraries for building analytics dashboards with time-based data visualization. Key finding: **The project already uses Recharts v3.6.0** and date-fns v4.1.0, so no library migration needed.

The standard approach extends existing patterns from CapacityChart.tsx: use Recharts' ResponsiveContainer with LineChart/AreaChart for time series, add shadcn/ui Calendar component for date range selection, and use date-fns for all date calculations.

For date range presets (Last 7 days, Last 30 days, etc.), the johnpolacek/date-range-picker-for-shadcn extension provides a complete solution with presets, comparison mode, and accessibility built-in.

**Primary recommendation:** Extend existing Recharts patterns, add shadcn/ui Calendar + johnpolacek date-range-picker, implement time-grouped Prisma aggregations.
</research_summary>

<standard_stack>
## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| recharts | 3.6.0 | Charts (Line, Area, Bar, Composed) | ✅ In use |
| date-fns | 4.1.0 | Date formatting, calculations | ✅ In use |
| date-fns-tz | 3.2.0 | Timezone handling | ✅ In use |

### To Add
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-day-picker | ^9.x | Calendar component (shadcn/ui dependency) | Used by shadcn Calendar |
| @radix-ui/react-popover | ^1.x | Popover for date picker | shadcn dependency |

### Supporting (Already Available)
| Library | Purpose | Notes |
|---------|---------|-------|
| lucide-react | Icons (Calendar, ChevronLeft, etc.) | ✅ Already in project |
| @radix-ui/react-select | Preset dropdown | ✅ Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Chart.js/react-chartjs-2 | Chart.js has lower DOM overhead but project already uses Recharts |
| Recharts | Nivo | Nivo more beautiful but heavier bundle, Recharts already integrated |
| Recharts | Apache ECharts | ECharts better for massive datasets but overkill for this use case |

**Installation:**
```bash
npx shadcn@latest add calendar popover
# This adds react-day-picker as dependency
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/reports/
│   ├── page.tsx              # Reports landing/redirect
│   └── analytics/
│       └── page.tsx          # Zeitraum-Analysen page
├── components/reports/
│   ├── DateRangePicker.tsx   # Date range selector with presets
│   ├── VolumeChart.tsx       # Line/Area chart for order volume
│   ├── TrendChart.tsx        # Reusable time series chart
│   └── ReportCard.tsx        # Card wrapper for chart sections
└── lib/
    └── report-queries.ts     # Prisma aggregation queries
```

### Pattern 1: Existing Recharts Pattern (from CapacityChart.tsx)
**What:** Use ResponsiveContainer with explicit height
**When to use:** All charts in this project
**Example:**
```typescript
// Source: src/components/dashboard/CapacityChart.tsx (line 55-98)
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

<div style={{ width: '100%', height: 300, minHeight: 300 }}>
  <ResponsiveContainer width="100%" height={300} minHeight={300}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <XAxis dataKey="date" tickFormatter={(d) => format(d, 'dd.MM')} />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="count" stroke="#3b82f6" />
    </LineChart>
  </ResponsiveContainer>
</div>
```

### Pattern 2: Date Range State with Presets
**What:** Manage date range with preset options
**When to use:** Any analytics filter
**Example:**
```typescript
// Pattern from johnpolacek/date-range-picker-for-shadcn
import { type DateRange } from "react-day-picker";
import { subDays, startOfDay, endOfDay } from "date-fns";

type PresetKey = 'last7' | 'last30' | 'last90' | 'thisMonth' | 'custom';

const PRESETS: Record<PresetKey, { label: string; getRange: () => DateRange }> = {
  last7: {
    label: 'Letzte 7 Tage',
    getRange: () => ({ from: subDays(new Date(), 6), to: new Date() })
  },
  last30: {
    label: 'Letzte 30 Tage',
    getRange: () => ({ from: subDays(new Date(), 29), to: new Date() })
  },
  // ...
};

const [preset, setPreset] = useState<PresetKey>('last30');
const [dateRange, setDateRange] = useState<DateRange>(PRESETS.last30.getRange());
```

### Pattern 3: Time-Grouped Prisma Aggregation
**What:** Group orders by day/week/month for charts
**When to use:** Volume trends, completion rates
**Example:**
```typescript
// Prisma raw query for daily grouping
const dailyVolume = await prisma.$queryRaw`
  SELECT
    DATE(status_updated_at) as date,
    COUNT(*) as count,
    SUM(CASE WHEN status = 'ABGESCHLOSSEN' THEN 1 ELSE 0 END) as completed
  FROM "Order"
  WHERE status_updated_at >= ${startDate}
    AND status_updated_at <= ${endDate}
  GROUP BY DATE(status_updated_at)
  ORDER BY date
`;
```

### Anti-Patterns to Avoid
- **Creating ResponsiveContainer without explicit height:** Always set both height prop and parent div height
- **Fetching all orders then filtering in JS:** Use Prisma aggregations, don't load entire dataset
- **Multiple API calls for each chart:** Batch queries in single API route when possible
- **Hardcoding date formats:** Use date-fns format() with German locale consistently
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date range presets | Custom preset logic | johnpolacek/date-range-picker-for-shadcn | Handles edge cases (month boundaries, DST), accessibility |
| Chart responsiveness | Manual resize listeners | Recharts ResponsiveContainer | Already handles debouncing, SSR issues |
| Date formatting | Template strings | date-fns format() with de locale | Handles edge cases, consistent across project |
| Time aggregation | JS groupBy on full dataset | Prisma SQL GROUP BY | Performance - database does the work |
| Calendar UI | Custom calendar grid | shadcn/ui Calendar (react-day-picker) | Accessibility, keyboard navigation, localization |

**Key insight:** The project already has Recharts patterns established in CapacityChart.tsx. Follow that pattern exactly - it handles the ResponsiveContainer height issue that causes 90% of Recharts problems.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: ResponsiveContainer Zero Height
**What goes wrong:** Chart renders as 0px height, invisible
**Why it happens:** ResponsiveContainer needs explicit height from parent
**How to avoid:** Wrap in div with explicit height style, set minHeight on ResponsiveContainer
**Warning signs:** Chart area blank but no errors, works in dev but not production
**Solution (from CapacityChart.tsx):**
```tsx
<div style={{ width: '100%', height: 300, minHeight: 300 }}>
  <ResponsiveContainer width="100%" height={300} minHeight={300}>
```

### Pitfall 2: ResponsiveContainer SSR Issues
**What goes wrong:** Hydration errors or chart not rendering on page load
**Why it happens:** ResponsiveContainer needs browser dimensions, unavailable on server
**How to avoid:** Use 'use client' directive, check for window before render
**Warning signs:** Console errors about hydration mismatch
**Solution:** Always mark chart components as 'use client'

### Pitfall 3: Date Range Off-by-One
**What goes wrong:** "Last 7 days" shows 6 or 8 days
**Why it happens:** Confusion between inclusive/exclusive range boundaries
**How to avoid:** Use startOfDay/endOfDay from date-fns, be explicit about boundaries
**Warning signs:** Chart shows unexpected number of data points
**Solution:**
```tsx
const from = startOfDay(subDays(new Date(), 6)); // 7 days including today
const to = endOfDay(new Date());
```

### Pitfall 4: Recharts v3 Breaking Changes
**What goes wrong:** Code from tutorials doesn't work
**Why it happens:** Project uses Recharts v3, most examples are v2
**How to avoid:** Check v3 migration guide for breaking changes
**Warning signs:** Props like `alwaysShow`, `isFront` not working
**Key v3 changes:**
- No more `CategoricalChartState` in event handlers
- Z-index determined by JSX order (Tooltip below Legend)
- CartesianGrid needs matching xAxisId/yAxisId

### Pitfall 5: German Date Locale
**What goes wrong:** Dates display as "January 16" instead of "16. Januar"
**Why it happens:** Forgot to set German locale in date-fns
**How to avoid:** Import and use de locale consistently
**Solution:**
```tsx
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
format(date, 'dd. MMMM yyyy', { locale: de }); // "16. Januar 2026"
```
</common_pitfalls>

<code_examples>
## Code Examples

### Time Series Line Chart (based on existing CapacityChart.tsx)
```typescript
// Source: Extended from src/components/dashboard/CapacityChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface VolumeData {
  date: Date;
  count: number;
}

export function VolumeChart({ data }: { data: VolumeData[] }) {
  return (
    <div style={{ width: '100%', height: 300, minHeight: 300 }}>
      <ResponsiveContainer width="100%" height={300} minHeight={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(new Date(d), 'dd.MM', { locale: de })}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(d) => format(new Date(d), 'EEEE, dd. MMMM', { locale: de })}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Date Range Presets Configuration
```typescript
// Source: Adapted from johnpolacek/date-range-picker-for-shadcn
import { subDays, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export const DATE_PRESETS = [
  {
    key: 'last7',
    label: 'Letzte 7 Tage',
    getRange: (): DateRange => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date())
    })
  },
  {
    key: 'last30',
    label: 'Letzte 30 Tage',
    getRange: (): DateRange => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date())
    })
  },
  {
    key: 'thisMonth',
    label: 'Dieser Monat',
    getRange: (): DateRange => ({
      from: startOfMonth(new Date()),
      to: endOfDay(new Date())
    })
  },
  {
    key: 'lastMonth',
    label: 'Letzter Monat',
    getRange: (): DateRange => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1))
    })
  },
] as const;
```

### Prisma Time-Grouped Query
```typescript
// Source: Common Prisma pattern for time series
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function getOrderVolumeByDay(from: Date, to: Date) {
  const result = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT
      DATE("statusUpdatedAt") as date,
      COUNT(*)::int as count
    FROM "Order"
    WHERE "statusUpdatedAt" >= ${startOfDay(from)}
      AND "statusUpdatedAt" <= ${endOfDay(to)}
      AND status = 'ABGESCHLOSSEN'
    GROUP BY DATE("statusUpdatedAt")
    ORDER BY date
  `;

  return result.map(r => ({
    date: r.date,
    count: Number(r.count)
  }));
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts v2 with state hacks | Recharts v3 rewritten state | 2024 | Cleaner API, better custom components |
| react-dates (Airbnb) | react-day-picker v9 | 2023 | react-dates deprecated, shadcn uses rdp |
| moment.js | date-fns v4 | 2023+ | Smaller bundle, tree-shakeable |
| Create React App | Next.js 14 / Vite | 2024+ | CRA deprecated, project uses Next.js ✅ |

**New tools/patterns to consider:**
- **Recharts v3 `responsive` prop**: Can replace ResponsiveContainer in some cases
- **react-day-picker v9**: New version with better TypeScript support
- **TanStack Charts**: Emerging headless option for complex cases (not needed here)

**Deprecated/outdated:**
- **moment.js**: Use date-fns (already in project)
- **react-dates**: Unmaintained, use react-day-picker
- **Recharts v2 `CategoricalChartState`**: Removed in v3
</sota_updates>

<open_questions>
## Open Questions

1. **Granularity Toggle**
   - What we know: Need daily, weekly, monthly views
   - What's unclear: Should user choose, or auto-select based on range?
   - Recommendation: Auto-select (7 days = daily, 30+ days = weekly, 90+ days = monthly)

2. **Data Availability**
   - What we know: Orders have statusUpdatedAt, liefertermin, createdAt
   - What's unclear: How far back does production data go?
   - Recommendation: Add "no data" state for empty ranges, validate during implementation
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- Existing project: src/components/dashboard/CapacityChart.tsx - verified working Recharts v3 pattern
- Existing project: package.json - Recharts 3.6.0, date-fns 4.1.0 versions confirmed
- [Recharts v3 Migration Guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) - breaking changes
- [shadcn/ui Date Picker docs](https://ui.shadcn.com/docs/components/date-picker) - official

### Secondary (MEDIUM confidence)
- [LogRocket React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) - library comparison
- [johnpolacek/date-range-picker-for-shadcn](https://github.com/johnpolacek/date-range-picker-for-shadcn) - presets pattern
- [npm trends: recharts vs react-chartjs-2](https://npmtrends.com/react-chartjs-vs-react-chartjs-2-vs-recharts) - download stats

### Tertiary (LOW confidence - needs validation)
- None - all critical findings verified against existing codebase
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Recharts v3 (already installed)
- Ecosystem: shadcn/ui Calendar, date-fns, react-day-picker
- Patterns: Time series charts, date range selection, Prisma aggregations
- Pitfalls: ResponsiveContainer height, SSR, date boundaries, v3 changes

**Confidence breakdown:**
- Standard stack: HIGH - already installed and working in project
- Architecture: HIGH - extends verified CapacityChart.tsx pattern
- Pitfalls: HIGH - documented in Recharts issues, v3 migration guide
- Code examples: HIGH - adapted from working project code

**Research date:** 2026-01-16
**Valid until:** 2026-02-16 (30 days - stack is stable, already in use)
</metadata>

---

*Phase: 19-zeitraum-analysen*
*Research completed: 2026-01-16*
*Ready for planning: yes*
