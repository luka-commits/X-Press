'use client';

/**
 * Dashboard Date Navigation Component
 *
 * Kombinierte Wochen- und Tagesnavigation für das Dashboard
 */

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { WeekInfo, getWeekStart, getWeekInfo } from '@/lib/calendar-queries';
import { addDays, format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface DashboardDateNavigationProps {
  currentWeek: WeekInfo;
  selectedDate: Date;
}

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function DashboardDateNavigation({
  currentWeek,
  selectedDate,
}: DashboardDateNavigationProps) {
  const weekStart = getWeekStart(currentWeek.year, currentWeek.weekNumber);
  const today = new Date();

  const navigateToWeek = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      window.location.href = '/';
      return;
    }

    const newDate =
      direction === 'prev' ? addDays(weekStart, -7) : addDays(weekStart, 7);
    const newWeek = getWeekInfo(newDate);

    window.location.href = `/?year=${newWeek.year}&week=${newWeek.weekNumber}&day=1`;
  };

  const navigateToDay = (dayIndex: number) => {
    window.location.href = `/?year=${currentWeek.year}&week=${currentWeek.weekNumber}&day=${dayIndex}`;
  };

  // Generate days for the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      index: i + 1,
      name: DAY_NAMES[i],
      date,
      dateFormatted: format(date, 'dd.MM.', { locale: de }),
      isSelected: isSameDay(date, selectedDate),
      isToday: isSameDay(date, today),
    };
  });

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
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

      {/* Day Selection */}
      <div className="flex gap-2">
        {weekDays.map((day) => (
          <button
            key={day.index}
            onClick={() => navigateToDay(day.index)}
            className={`
              flex-1 py-2 px-1 rounded-lg text-center transition-all
              ${
                day.isSelected
                  ? 'bg-xpress-blue text-white font-semibold'
                  : day.isToday
                    ? 'bg-xpress-yellow/30 hover:bg-xpress-yellow/50 font-medium'
                    : 'bg-neutral-100 hover:bg-neutral-200'
              }
            `}
          >
            <div className="text-sm font-medium">{day.name}</div>
            <div className={`text-xs ${day.isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
              {day.dateFormatted}
            </div>
          </button>
        ))}
      </div>

      {/* Selected date label */}
      <div className="mt-3 text-center text-sm text-neutral-500">
        Anzeige für:{' '}
        <span className="font-medium text-xpress-text">
          {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
        </span>
      </div>
    </div>
  );
}
