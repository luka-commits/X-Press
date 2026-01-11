import { MainLayout } from '@/components/layout';
import {
  KPICardsGrid,
  MachineCards,
  CriticalOrdersList,
  DashboardClient,
  WeekStatistics,
  DashboardDateNavigation,
} from '@/components/dashboard';
import {
  getDashboardKPIs,
  getMachineCapacityForDate,
  getCriticalOrders,
  getWeekStatistics,
} from '@/lib/dashboard-queries';
import { getWeekInfo, getWeekStart } from '@/lib/calendar-queries';
import { format, addDays, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{
    year?: string;
    week?: string;
    day?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  // Determine selected date from URL params
  let selectedDate: Date;
  let weekStart: Date;

  if (params.year && params.week) {
    // Use URL params
    weekStart = getWeekStart(parseInt(params.year), parseInt(params.week));
    const dayOffset = params.day ? parseInt(params.day) - 1 : 0;
    selectedDate = addDays(weekStart, Math.min(Math.max(dayOffset, 0), 6));
  } else {
    // Default to today
    selectedDate = new Date();
    weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  }

  const weekInfo = getWeekInfo(weekStart);

  // Fetch all dashboard data in parallel for the selected date
  const [kpis, machines, criticalOrders, weekStats] = await Promise.all([
    getDashboardKPIs(selectedDate),
    getMachineCapacityForDate(selectedDate),
    getCriticalOrders(selectedDate),
    getWeekStatistics(weekStart),
  ]);

  const lastUpdated = format(new Date(), 'HH:mm:ss', { locale: de });

  return (
    <MainLayout headerRight={<DashboardClient lastUpdated={lastUpdated} />}>
      {/* Date Navigation */}
      <DashboardDateNavigation currentWeek={weekInfo} selectedDate={selectedDate} />

      {/* Week Statistics */}
      <WeekStatistics
        auftraegeGesamt={weekStats.auftraegeGesamt}
        maschinenStunden={weekStats.maschinenStunden}
        leitmaschinenAnzahl={weekStats.leitmaschinenAnzahl}
        kalenderwoche={weekInfo.weekNumber}
      />

      {/* KPI Cards */}
      <KPICardsGrid
        total={kpis.total}
        critical={kpis.critical}
        avgCapacity={kpis.avgCapacity}
        engpass={kpis.engpass}
      />

      {/* Machine Cards - Full Width */}
      <div className="mb-6">
        <MachineCards machines={machines} selectedDate={selectedDate} />
      </div>

      {/* Critical Orders */}
      <CriticalOrdersList orders={criticalOrders} />
    </MainLayout>
  );
}
