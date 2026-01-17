import { MainLayout } from '@/components/layout';
import {
  KPICardsGrid,
  MachineCards,
  CriticalOrdersList,
  DashboardClient,
  WeekStatistics,
} from '@/components/dashboard';
import {
  getDashboardKPIs,
  getMachineCapacityForDate,
  getCriticalOrders,
  getWeekStatistics,
} from '@/lib/dashboard-queries';
import { getWeekInfo } from '@/lib/calendar-queries';
import { format, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Always use today's date
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekInfo = getWeekInfo(weekStart);

  // Fetch all dashboard data in parallel for today
  const [kpis, machines, criticalOrders, weekStats] = await Promise.all([
    getDashboardKPIs(today),
    getMachineCapacityForDate(today),
    getCriticalOrders(today),
    getWeekStatistics(weekStart),
  ]);

  const lastUpdated = format(new Date(), 'HH:mm:ss', { locale: de });

  return (
    <MainLayout headerRight={<DashboardClient lastUpdated={lastUpdated} />}>
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
        <MachineCards machines={machines} selectedDate={today} />
      </div>

      {/* Critical Orders */}
      <CriticalOrdersList orders={criticalOrders} />
    </MainLayout>
  );
}
