'use client';

/**
 * PlzChart Component
 *
 * Horizontal bar chart showing PLZ (postal code) distribution.
 * Displays top PLZ regions by 2-digit prefix for regional shipping analysis.
 */

import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface PlzData {
  plz: string;
  count: number;
}

interface PlzChartProps {
  data: PlzData[];
  loading?: boolean;
}

export function PlzChart({ data, loading }: PlzChartProps) {
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="mt-2 text-sm text-neutral-500">Lade Daten...</p>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-neutral-500">Keine PLZ-Daten fur diesen Zeitraum</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300, minHeight: 300 }}>
      <ResponsiveContainer width="100%" height={300} minHeight={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="plz" tick={{ fontSize: 12 }} width={40} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as PlzData;
                return (
                  <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm">PLZ-Region {item.plz}xxx</p>
                    <p className="text-sm text-neutral-600">
                      {item.count} {item.count === 1 ? 'Sendung' : 'Sendungen'}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
