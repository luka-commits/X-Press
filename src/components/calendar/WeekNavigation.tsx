'use client';

/**
 * Week Navigation Component
 *
 * Navigiert zwischen Kalenderwochen
 */

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { WeekInfo, getWeekStart, getWeekInfo } from '@/lib/calendar-queries';
import { addDays } from 'date-fns';

interface WeekNavigationProps {
  currentWeek: WeekInfo;
}

export function WeekNavigation({ currentWeek }: WeekNavigationProps) {
  const router = useRouter();

  const navigateToWeek = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      // Force refresh to avoid stale cache
      window.location.href = '/calendar';
      return;
    }

    const weekStart = getWeekStart(currentWeek.year, currentWeek.weekNumber);
    const newDate =
      direction === 'prev' ? addDays(weekStart, -7) : addDays(weekStart, 7);
    const newWeek = getWeekInfo(newDate);

    // Use window.location for reliable navigation without cache issues
    window.location.href = `/calendar?year=${newWeek.year}&week=${newWeek.weekNumber}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigateToWeek('prev')}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Vorherige Woche"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-600" />
        </button>

        <h2 className="text-lg font-semibold text-xpress-text min-w-[140px] text-center">
          {currentWeek.label}
        </h2>

        <button
          onClick={() => navigateToWeek('next')}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Nächste Woche"
        >
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      <button
        onClick={() => navigateToWeek('today')}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-xpress-yellow hover:bg-xpress-yellow-hover transition-colors text-xpress-text font-medium"
      >
        <Calendar className="w-4 h-4" />
        Heute
      </button>
    </div>
  );
}
