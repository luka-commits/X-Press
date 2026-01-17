/**
 * Machine Calendar Grid Component
 *
 * Zeigt die Wochenansicht aller Leitmaschinen
 */

import { format } from 'date-fns';

import { MachineWeekCapacity } from '@/lib/calendar-queries';

import { CalendarCell } from './CalendarCell';

interface MachineCalendarGridProps {
  machines: MachineWeekCapacity[];
}

export function MachineCalendarGrid({ machines }: MachineCalendarGridProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  if (machines.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <p className="text-neutral-500 text-center py-8">Keine Leitmaschinen konfiguriert</p>
      </div>
    );
  }

  // Get date headers from first machine (all machines have same days)
  const days = machines[0]?.days || [];

  // Find which column index is today
  const todayIndex = days.findIndex((d) => format(new Date(d.date), 'yyyy-MM-dd') === todayStr);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-8 border-b border-neutral-200 bg-neutral-50">
        <div className="p-3 font-medium text-neutral-600 text-sm">Maschine</div>
        {days.map((day, index) => {
          const isToday = index === todayIndex;
          return (
            <div
              key={index}
              className={`p-3 text-center font-medium text-sm border-l border-neutral-200 ${
                isToday ? 'bg-ghl-blue/5 text-ghl-blue' : 'text-neutral-600'
              }`}
            >
              {day.dateFormatted}
              {isToday && <span className="ml-1 text-xs font-normal">(Heute)</span>}
            </div>
          );
        })}
      </div>

      {/* Machine rows */}
      {machines.map((machine) => (
        <div
          key={machine.id}
          className="grid grid-cols-8 border-b border-neutral-100 last:border-b-0"
        >
          {/* Machine name */}
          <div className="p-3 flex flex-col justify-center">
            <p className="font-medium text-ghl-text text-sm">{machine.kurzname || machine.name}</p>
            {machine.kurzname && (
              <p className="text-xs text-neutral-400 truncate">{machine.name}</p>
            )}
          </div>

          {/* Day cells */}
          {machine.days.map((day, index) => {
            const isToday = index === todayIndex;
            return (
              <div
                key={index}
                className={`p-2 border-l border-neutral-100 ${isToday ? 'bg-ghl-blue/5' : ''}`}
              >
                <CalendarCell machineId={machine.id} day={day} isToday={isToday} />
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
        <div className="flex items-center justify-end gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-neutral-600">&lt;70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }} />
            <span className="text-neutral-600">70-90%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-neutral-600">&gt;90%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
