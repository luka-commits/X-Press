'use client';

/**
 * ThroughputChart Component
 *
 * Dual-line chart showing Eingang vs Versendet orders over time.
 * Displays daily counts for incoming and shipped orders.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

export interface ThroughputData {
  date: string; // 'yyyy-MM-dd' format
  eingang: number;
  versendet: number;
}

interface ThroughputChartProps {
  data: ThroughputData[];
  loading?: boolean;
}

export function ThroughputChart({ data, loading }: ThroughputChartProps) {
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
                const item = payload[0].payload as ThroughputData;
                return (
                  <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm mb-2">
                      {format(parseISO(item.date), 'EEEE, dd. MMMM', { locale: de })}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                        <span className="text-neutral-600">Eingang:</span>
                        <span className="ml-1 font-medium">{item.eingang}</span>
                      </p>
                      <p className="text-sm flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                        <span className="text-neutral-600">Versendet:</span>
                        <span className="ml-1 font-medium">{item.versendet}</span>
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => {
              const labels: Record<string, string> = {
                eingang: 'Eingang',
                versendet: 'Versendet',
              };
              return <span className="text-sm text-neutral-700">{labels[value] || value}</span>;
            }}
          />
          <Line
            type="monotone"
            dataKey="eingang"
            name="eingang"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="versendet"
            name="versendet"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
