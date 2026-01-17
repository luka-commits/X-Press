import { MainLayout } from '@/components/layout';
import { FunnelChart } from '@/components/reports/FunnelChart';
import { StageDistributionChart } from '@/components/reports/StageDistributionChart';
import { PipelineDashboard } from '@/components/reports/PipelineDashboard';
import { getFunnelData, getStageDistribution } from '@/lib/reporting-queries';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const funnelData = await getFunnelData();
  const distribution = await getStageDistribution();

  return (
    <MainLayout
      headerRight={
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <FileText className="w-4 h-4" />
          <span>Reports</span>
        </div>
      }
    >
      <div className="p-6 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-ghl-text">Reporting Dashboard</h1>
          <p className="text-sm text-ghl-text-secondary mt-1">
            Produktions-Insights & Pipeline Analytics
          </p>
        </div>

        {/* Section 1: Current Pipeline Snapshot */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ghl-text">Aktueller Pipeline-Stand</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelChart data={funnelData.stages} />
            <StageDistributionChart
              data={distribution.data}
              total={distribution.total}
            />
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-neutral-200" />

        {/* Section 2: Time-based Analytics (PipelineDashboard) */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ghl-text">Zeitraum-Analyse</h2>
          <PipelineDashboard />
        </section>
      </div>
    </MainLayout>
  );
}
