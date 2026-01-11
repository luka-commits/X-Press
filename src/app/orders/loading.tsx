/**
 * Orders Loading State
 */

import { MainLayout } from '@/components/layout';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-neutral-100 animate-pulse">
      <div className="h-5 w-24 bg-neutral-200 rounded" />
      <div className="h-5 w-40 bg-neutral-200 rounded" />
      <div className="h-5 w-32 bg-neutral-200 rounded flex-1" />
      <div className="h-5 w-24 bg-neutral-200 rounded" />
      <div className="h-5 w-16 bg-neutral-200 rounded" />
    </div>
  );
}

export default function OrdersLoading() {
  return (
    <MainLayout
      title="Aufträge"
      subtitle="Alle Aufträge durchsuchen und filtern"
    >
      {/* Search & Filter Skeleton */}
      <div className="flex flex-wrap gap-4 mb-6 animate-pulse">
        <div className="h-10 w-64 bg-neutral-200 rounded" />
        <div className="h-10 w-32 bg-neutral-200 rounded" />
        <div className="h-10 w-32 bg-neutral-200 rounded" />
        <div className="h-10 w-32 bg-neutral-200 rounded" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        {/* Header */}
        <div className="flex items-center gap-4 py-3 border-b border-neutral-200 mb-2">
          <div className="h-4 w-20 bg-neutral-300 rounded" />
          <div className="h-4 w-32 bg-neutral-300 rounded" />
          <div className="h-4 w-28 bg-neutral-300 rounded flex-1" />
          <div className="h-4 w-24 bg-neutral-300 rounded" />
          <div className="h-4 w-16 bg-neutral-300 rounded" />
        </div>

        {/* Rows */}
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </MainLayout>
  );
}
