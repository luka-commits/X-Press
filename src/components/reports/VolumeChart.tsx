'use client';

/**
 * VolumeChart Component
 *
 * Line chart showing order volume trends over time.
 * Displays daily order counts for completed orders.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

export interface VolumeData {
  date: string; // 'yyyy-MM-dd' format
  count: number;
}

interface VolumeChartProps {
  data: VolumeData[];
  loading?: boolean;
}

export function VolumeChart({ data, loading }: VolumeChartProps) {
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
        <p className="text-neutral-500">Keine Daten fur diesen Zeitraum</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300, minHeight: 300 }}>
      <ResponsiveContainer width="100%" height={300} minHeight={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              try {
                return format(parseISO(value), 'dd.MM', { locale: de });
              } catch {
                return value;
              }
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as VolumeData;
                return (
                  <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm">
                      {format(parseISO(item.date), 'EEEE, dd. MMMM', { locale: de })}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {item.count} {item.count === 1 ? 'Auftrag' : 'Auftrage'}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
