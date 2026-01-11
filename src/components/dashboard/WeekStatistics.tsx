/**
 * Week Statistics Component
 *
 * Zeigt Gesamtstatistiken für die aktuelle Woche
 */

import { Calendar, Clock, Printer } from 'lucide-react';

interface WeekStatisticsProps {
  auftraegeGesamt: number;
  maschinenStunden: number;
  leitmaschinenAnzahl: number;
  kalenderwoche: number;
}

export function WeekStatistics({
  auftraegeGesamt,
  maschinenStunden,
  leitmaschinenAnzahl,
  kalenderwoche,
}: WeekStatisticsProps) {
  return (
    <div className="bg-gradient-to-r from-xpress-blue/5 to-xpress-blue/10 rounded-lg border border-xpress-blue/20 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-xpress-blue" />
          <span className="font-medium text-xpress-text">
            Woche {kalenderwoche}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-600">
              <span className="font-semibold text-xpress-text">{auftraegeGesamt}</span> Aufträge
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-600">
              <span className="font-semibold text-xpress-text">{maschinenStunden}h</span> geplant
            </span>
          </div>
          <div className="text-neutral-400 text-xs">
            auf {leitmaschinenAnzahl} Leitmaschinen
          </div>
        </div>
      </div>
    </div>
  );
}
