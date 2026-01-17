import { MainLayout } from '@/components/layout';
import { FunnelChart } from '@/components/reports/FunnelChart';
import { StageDistributionChart } from '@/components/reports/StageDistributionChart';
import { getFunnelData, getStageDistribution } from '@/lib/reporting-queries';
import { FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const funnelData = await getFunnelData();
  const distribution = await getStageDistribution();

  return (
    <MainLayout
      headerRight={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white border-ghl-border text-ghl-text-secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Letzte 30 Tage
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ghl-text">Reporting Dashboard</h1>
            <p className="text-sm text-ghl-text-secondary mt-1">
              Produktions-Insights & Funnel Analytics
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart data={funnelData.stages} />
          <StageDistributionChart
            data={distribution.data}
            total={distribution.total}
          />
        </div>
      </div>
    </MainLayout>
  );
}
