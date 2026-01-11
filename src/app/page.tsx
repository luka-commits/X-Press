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
  getMachineCapacityToday,
  getCriticalOrders,
  getWeekStatistics,
} from '@/lib/dashboard-queries';
import { format, getWeek } from 'date-fns';
import { de } from 'date-fns/locale';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch all dashboard data in parallel
  const [kpis, machines, criticalOrders, weekStats] = await Promise.all([
    getDashboardKPIs(),
    getMachineCapacityToday(),
    getCriticalOrders(),
    getWeekStatistics(),
  ]);

  const lastUpdated = format(new Date(), 'HH:mm:ss', { locale: de });
  const kalenderwoche = getWeek(new Date(), { locale: de, weekStartsOn: 1 });

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Übersicht aller Aufträge und Maschinen"
      headerRight={<DashboardClient lastUpdated={lastUpdated} />}
    >
      {/* Week Statistics */}
      <WeekStatistics
        auftraegeGesamt={weekStats.auftraegeGesamt}
        maschinenStunden={weekStats.maschinenStunden}
        leitmaschinenAnzahl={weekStats.leitmaschinenAnzahl}
        kalenderwoche={kalenderwoche}
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
        <MachineCards machines={machines} />
      </div>

      {/* Critical Orders */}
      <CriticalOrdersList orders={criticalOrders} />
    </MainLayout>
  );
}
