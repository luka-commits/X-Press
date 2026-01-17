'use client';

import { MainLayout } from '@/components/layout';
import { PipelineDashboard } from '@/components/reports';
import { FileText } from 'lucide-react';

/**
 * Reports Page - Pipeline Analytics Dashboard
 *
 * Consolidated view replacing the previous 3-tab structure.
 * Shows at-a-glance pipeline performance with drill-down capability.
 */
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
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ghl-text">Reports</h1>
          <p className="text-sm text-ghl-text-secondary mt-1">
            Pipeline-Analytics und Versand-Performance
          </p>
        </div>

        {/* Pipeline Dashboard */}
        <PipelineDashboard />
      </div>
    </MainLayout>
  );
}
