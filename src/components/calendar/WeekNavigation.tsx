'use client';

/**
 * Week Navigation Component
 *
 * Navigiert zwischen Kalenderwochen
 */

import { addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

import { WeekInfo, getWeekStart, getWeekInfo } from '@/lib/calendar-queries';

interface WeekNavigationProps {
  currentWeek: WeekInfo;
}

export function WeekNavigation({ currentWeek }: WeekNavigationProps) {
  const navigateToWeek = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      // Force refresh to avoid stale cache
      window.location.href = '/calendar';
      return;
    }

    const weekStart = getWeekStart(currentWeek.year, currentWeek.weekNumber);
    const newDate = direction === 'prev' ? addDays(weekStart, -7) : addDays(weekStart, 7);
    const newWeek = getWeekInfo(newDate);

    // Use window.location for reliable navigation without cache issues
    window.location.href = `/calendar?year=${newWeek.year}&week=${newWeek.weekNumber}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigateToWeek('prev')}
          className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-ghl-border"
          aria-label="Vorherige Woche"
        >
          <ChevronLeft className="w-5 h-5 text-ghl-text-secondary" />
        </button>

        <h2 className="text-lg font-semibold text-ghl-text min-w-[140px] text-center">
          {currentWeek.label}
        </h2>

        <button
          onClick={() => navigateToWeek('next')}
          className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-ghl-border"
          aria-label="Nächste Woche"
        >
          <ChevronRight className="w-5 h-5 text-ghl-text-secondary" />
        </button>
      </div>

      <button
        onClick={() => navigateToWeek('today')}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-white border border-ghl-border hover:bg-gray-50 transition-colors text-ghl-text font-medium shadow-sm"
      >
        <Calendar className="w-4 h-4 text-ghl-text-secondary" />
        Heute
      </button>
    </div>
  );
}
