/**
 * Dashboard Loading State
 *
 * Zeigt Skeleton-Loader während das Dashboard lädt
 */

import { MainLayout } from '@/components/layout';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-6 border border-neutral-200 animate-pulse">
      <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
      <div className="h-8 w-16 bg-neutral-200 rounded" />
    </div>
  );
}

function SkeletonMachineCard() {
  return (
    <div className="bg-white rounded-lg p-4 border border-neutral-200 animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="h-5 w-32 bg-neutral-200 rounded" />
        <div className="h-5 w-12 bg-neutral-200 rounded" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 w-full bg-neutral-100 rounded" />
        <div className="h-4 w-3/4 bg-neutral-100 rounded" />
      </div>
      <div className="h-2 w-full bg-neutral-200 rounded-full" />
    </div>
  );
}

function SkeletonWeekStats() {
  return (
    <div className="bg-neutral-100 rounded-lg border border-neutral-200 p-4 mb-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-neutral-200 rounded" />
        <div className="flex gap-6">
          <div className="h-5 w-28 bg-neutral-200 rounded" />
          <div className="h-5 w-24 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <MainLayout>
      {/* Week Statistics Skeleton */}
      <SkeletonWeekStats />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Machine Cards Skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <SkeletonMachineCard />
          <SkeletonMachineCard />
          <SkeletonMachineCard />
          <SkeletonMachineCard />
        </div>
      </div>

      {/* Critical Orders Skeleton */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200 animate-pulse">
        <div className="h-6 w-32 bg-neutral-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-10 w-full bg-neutral-100 rounded" />
          <div className="h-10 w-full bg-neutral-100 rounded" />
          <div className="h-10 w-full bg-neutral-100 rounded" />
        </div>
      </div>
    </MainLayout>
  );
}
