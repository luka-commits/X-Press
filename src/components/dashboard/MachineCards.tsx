'use client';

/**
 * Machine Cards Component
 *
 * Zeigt Karten für jede Leitmaschine mit Auftragsdetails
 */

import Link from 'next/link';
import { MachineCapacity } from '@/lib/dashboard-queries';

interface MachineCardsProps {
  machines: MachineCapacity[];
}

// Ampel-Farben
const COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

function getStatusColor(auslastung: number): string {
  if (auslastung > 90) return COLORS.red;
  if (auslastung > 70) return COLORS.yellow;
  return COLORS.green;
}

function getStatusBgClass(auslastung: number): string {
  if (auslastung > 90) return 'bg-capacity-red/10 border-capacity-red/30';
  if (auslastung > 70) return 'bg-capacity-yellow/10 border-capacity-yellow/30';
  return 'bg-capacity-green/10 border-capacity-green/30';
}

function MachineCard({ machine }: { machine: MachineCapacity }) {
  const statusColor = getStatusColor(machine.auslastung);
  const statusBgClass = getStatusBgClass(machine.auslastung);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header with machine name and utilization */}
      <div
        className={`px-4 py-3 border-b ${statusBgClass} flex items-center justify-between`}
      >
        <div>
          <h3 className="font-semibold text-xpress-text">
            {machine.kurzname || machine.name}
          </h3>
          <p className="text-xs text-neutral-500">{machine.name}</p>
        </div>
        <div className="text-right">
          <p
            className="text-2xl font-bold"
            style={{ color: statusColor }}
          >
            {machine.auslastung}%
          </p>
          <p className="text-xs text-neutral-500">
            {Math.round(machine.gesamtZeit)} / {machine.kapazitaet} min
          </p>
        </div>
      </div>

      {/* Orders list */}
      <div className="p-4">
        {machine.auftraege.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-4">
            Keine Aufträge heute
          </p>
        ) : (
          <div className="space-y-2">
            {machine.auftraege.map((order) => (
              <Link
                key={order.auftragsnummer}
                href={`/orders/${order.auftragsnummer}`}
                className="block p-2 rounded hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-xpress-blue truncate">
                      {order.auftragsnummer}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {order.kunde}
                      {order.produkttyp && ` • ${order.produkttyp}`}
                    </p>
                  </div>
                  <div className="ml-2 text-right flex-shrink-0">
                    <p className="text-sm font-medium text-neutral-700">
                      {Math.round(order.zeitMinuten)} min
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer with capacity bar */}
      <div className="px-4 pb-3">
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(machine.auslastung, 100)}%`,
              backgroundColor: statusColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function MachineCards({ machines }: MachineCardsProps) {
  if (machines.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h2 className="text-lg font-semibold text-xpress-text mb-4">
          Maschinen-Übersicht (Heute)
        </h2>
        <p className="text-neutral-500 text-center py-8">
          Keine Leitmaschinen konfiguriert
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-xpress-text">
          Maschinen-Übersicht (Heute)
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS.green }}
            />
            <span className="text-neutral-600">&lt;70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS.yellow }}
            />
            <span className="text-neutral-600">70-90%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS.red }}
            />
            <span className="text-neutral-600">&gt;90%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((machine) => (
          <MachineCard key={machine.id} machine={machine} />
        ))}
      </div>
    </div>
  );
}
