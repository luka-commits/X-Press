import { MainLayout } from '@/components/layout';
import {
  KPICardsGrid,
  MachineCards,
  CriticalOrdersList,
  DashboardClient,
} from '@/components/dashboard';
import {
  getDashboardKPIs,
  getMachineCapacityToday,
  getCriticalOrders,
} from '@/lib/dashboard-queries';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Revalidate every 60 seconds (in addition to client-side refresh)
export const revalidate = 60;

export default async function DashboardPage() {
  // Fetch all dashboard data in parallel
  const [kpis, machines, criticalOrders] = await Promise.all([
    getDashboardKPIs(),
    getMachineCapacityToday(),
    getCriticalOrders(),
  ]);

  const lastUpdated = format(new Date(), 'HH:mm:ss', { locale: de });

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Übersicht aller Aufträge und Maschinen"
      headerRight={<DashboardClient lastUpdated={lastUpdated} />}
    >
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
