import { startOfWeek } from 'date-fns';

import {
  KPICardsGrid,
  MachineCards,
  CriticalOrdersList,
  DashboardClient,
  WeekStatistics,
} from '@/components/dashboard';
import { MainLayout } from '@/components/layout';
import { getWeekInfo } from '@/lib/calendar-queries';
import {
  getDashboardKPIs,
  getMachineCapacityForDate,
  getCriticalOrders,
  getWeekStatistics,
} from '@/lib/dashboard-queries';

// Revalidate every 60 seconds for near-real-time data
export const revalidate = 60;

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

  return (
    <MainLayout headerRight={<DashboardClient />}>
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
        overdue={kpis.overdue}
        problem={kpis.problem}
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
