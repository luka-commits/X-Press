'use client';

/**
 * Calendar Cell Component
 *
 * Einzelne Zelle im Kalender mit Auslastung und Ampel-Farbe
 */

import { format } from 'date-fns';
import Link from 'next/link';

import { DayCapacity } from '@/lib/calendar-queries';

interface CalendarCellProps {
  machineId: number;
  day: DayCapacity;
  isToday: boolean;
}

// Ampel-Farben (identisch mit Dashboard)
const COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  empty: '#e5e5e5',
};

function getStatusColor(auslastung: number): string {
  if (auslastung === 0) return COLORS.empty;
  if (auslastung > 90) return COLORS.red;
  if (auslastung > 70) return COLORS.yellow;
  return COLORS.green;
}

function getStatusBgClass(auslastung: number): string {
  if (auslastung === 0) return 'bg-neutral-50';
  if (auslastung > 90) return 'bg-capacity-red/10';
  if (auslastung > 70) return 'bg-capacity-yellow/10';
  return 'bg-capacity-green/10';
}

function getStatusTextClass(auslastung: number): string {
  if (auslastung === 0) return 'text-neutral-400';
  if (auslastung > 90) return 'text-capacity-red';
  if (auslastung > 70) return 'text-capacity-yellow';
  return 'text-capacity-green';
}

export function CalendarCell({ machineId, day, isToday: _isToday }: CalendarCellProps) {
  const statusColor = getStatusColor(day.auslastung);
  const statusBgClass = getStatusBgClass(day.auslastung);
  const statusTextClass = getStatusTextClass(day.auslastung);

  // Format date for link (avoiding timezone issues)
  const dateParam = format(new Date(day.date), 'yyyy-MM-dd');

  return (
    <Link
      href={`/calendar/${machineId}/${dateParam}`}
      className={`
        block p-2 rounded-lg transition-all
        ${statusBgClass}
        hover:ring-2 hover:ring-neutral-300 hover:ring-offset-1
        cursor-pointer
      `}
    >
      {/* Capacity bar */}
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(day.auslastung, 100)}%`,
            backgroundColor: statusColor,
          }}
        />
      </div>

      {/* Percentage */}
      <p className={`text-center text-sm font-semibold ${statusTextClass}`}>
        {day.auslastung === 0 ? '–' : `${Math.round(day.auslastung)}%`}
      </p>

      {/* Order count (small, subtle) */}
      {day.auftragsCount > 0 && (
        <p className="text-center text-xs text-neutral-400 mt-0.5">
          {day.auftragsCount} {day.auftragsCount === 1 ? 'Auftrag' : 'Aufträge'}
        </p>
      )}
    </Link>
  );
}
