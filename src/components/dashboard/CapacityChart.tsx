'use client';

/**
 * Capacity Chart Component
 *
 * Horizontales Balkendiagramm mit Ampel-Farben für Maschinenauslastung
 */

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MachineCapacity } from '@/lib/dashboard-queries';

interface CapacityChartProps {
  machines: MachineCapacity[];
}

// Ampel-Farben
const COLORS = {
  green: '#22c55e',  // <70%
  yellow: '#eab308', // 70-90%
  red: '#ef4444',    // >90%
};

function getBarColor(auslastung: number): string {
  if (auslastung > 90) return COLORS.red;
  if (auslastung > 70) return COLORS.yellow;
  return COLORS.green;
}

export function CapacityChart({ machines }: CapacityChartProps) {
  if (machines.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h2 className="text-lg font-semibold text-ghl-text mb-4">Maschinen-Auslastung</h2>
        <p className="text-neutral-500 text-center py-8">
          Keine Leitmaschinen konfiguriert
        </p>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = machines.map((m) => ({
    name: m.kurzname || m.name.split(' ')[0],
    fullName: m.name,
    auslastung: m.auslastung,
    gesamtZeit: m.gesamtZeit,
    kapazitaet: m.kapazitaet,
  }));

  return (
    <div className="bg-white rounded-lg p-6 border border-ghl-border shadow-sm">
      <h2 className="text-lg font-semibold text-ghl-text mb-4">
        Maschinen-Auslastung (Heute)
      </h2>
      <div style={{ width: '100%', height: 256, minHeight: 256 }}>
        <ResponsiveContainer width="100%" height={256} minHeight={256}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-sm">{data.fullName}</p>
                      <p className="text-sm text-neutral-600">
                        {data.gesamtZeit} / {data.kapazitaet} min
                      </p>
                      <p className="text-sm font-medium" style={{ color: getBarColor(data.auslastung) }}>
                        {data.auslastung}% Auslastung
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="auslastung" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.auslastung)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.green }} />
          <span className="text-neutral-600">&lt;70%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.yellow }} />
          <span className="text-neutral-600">70-90%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.red }} />
          <span className="text-neutral-600">&gt;90%</span>
        </div>
      </div>
    </div>
  );
}
