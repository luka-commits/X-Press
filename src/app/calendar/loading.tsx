/**
 * Calendar Loading State
 */

import { MainLayout } from '@/components/layout';

function SkeletonCalendarRow() {
  return (
    <div className="flex gap-2 animate-pulse">
      <div className="w-32 h-20 bg-neutral-200 rounded flex-shrink-0" />
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex-1 h-20 bg-neutral-100 rounded" />
      ))}
    </div>
  );
}

export default function CalendarLoading() {
  return (
    <MainLayout>
      {/* Navigation Skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="h-10 w-10 bg-neutral-200 rounded" />
        <div className="h-6 w-40 bg-neutral-200 rounded" />
        <div className="h-10 w-10 bg-neutral-200 rounded" />
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        {/* Header */}
        <div className="flex gap-2 mb-4 animate-pulse">
          <div className="w-32 h-10 bg-neutral-200 rounded flex-shrink-0" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 h-10 bg-neutral-200 rounded" />
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-2">
          <SkeletonCalendarRow />
          <SkeletonCalendarRow />
          <SkeletonCalendarRow />
          <SkeletonCalendarRow />
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="flex items-center gap-6 mt-4 animate-pulse">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-4 w-24 bg-neutral-200 rounded" />
      </div>
    </MainLayout>
  );
}
