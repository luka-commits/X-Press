import { MainLayout } from '@/components/layout';
import { ReportsDashboard } from '@/components/reports/ReportsDashboard';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  return (
    <MainLayout
      headerRight={
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <FileText className="w-4 h-4" />
          <span>Reports</span>
        </div>
      }
    >
      <div className="p-6">
        <ReportsDashboard />
      </div>
    </MainLayout>
  );
}
