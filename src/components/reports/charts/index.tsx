'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Chart loading skeleton
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="w-full bg-ghl-card rounded-lg border border-ghl-border flex items-center justify-center"
      style={{ height }}
    >
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
}

// Dynamic imports with loading states
export const FunnelChartLazy = dynamic(
  () => import('../FunnelChart').then((mod) => ({ default: mod.FunnelChart })),
  { ssr: false, loading: () => <ChartSkeleton height={400} /> }
);

export const StageDistributionChartLazy = dynamic(
  () =>
    import('../StageDistributionChart').then((mod) => ({ default: mod.StageDistributionChart })),
  { ssr: false, loading: () => <ChartSkeleton height={350} /> }
);

export const ThroughputChartLazy = dynamic(
  () => import('../ThroughputChart').then((mod) => ({ default: mod.ThroughputChart })),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> }
);

export const PlzChartLazy = dynamic(
  () => import('../PlzChart').then((mod) => ({ default: mod.PlzChart })),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> }
);
