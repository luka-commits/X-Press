'use client';

import { BarChart3, PieChartIcon } from 'lucide-react';
import { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';

interface StageData {
  name: string;
  value: number;
  fill: string;
}

interface StageDistributionChartProps {
  data: StageData[];
  total: number;
  onStageClick?: (stage: string) => void;
}

// Map display names to API stage keys
function getStageKey(name: string): string {
  const mapping: Record<string, string> = {
    Offen: 'offen',
    'In Produktion': 'in_produktion',
    Fertig: 'fertig',
    Versandbereit: 'versandbereit',
    Versendet: 'versendet',
    Problem: 'problem',
  };
  return mapping[name] || name.toLowerCase().replace(/\s+/g, '_');
}

type ViewMode = 'pie' | 'bar';

export function StageDistributionChart({ data, total, onStageClick }: StageDistributionChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('bar');

  // Distinct Palette (synced with FunnelChart)
  const distinctColors = [
    '#2563EB', // Blue-600
    '#06B6D4', // Cyan-500
    '#8B5CF6', // Violet-500
    '#EC4899', // Pink-500
    '#6366F1', // Indigo-500
  ];

  const formattedData = data.map((d, i) => {
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
    return {
      ...d,
      fill: distinctColors[i % distinctColors.length],
      percentage: pct,
      label: `${d.value} (${pct}%)`,
    };
  });

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 flex flex-col">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-ghl-text">Stage Distribution</h2>
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('bar')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'bar'
                ? 'bg-white text-ghl-blue shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('pie')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'pie'
                ? 'bg-white text-ghl-blue shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
            title="Pie Chart"
          >
            <PieChartIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <span className="text-4xl font-bold text-ghl-text">{total}</span>
        <p className="text-xs text-neutral-500 mt-1">Total Orders</p>
      </div>

      {viewMode === 'pie' ? (
        <div className="flex-1 flex items-center justify-center mt-2 pr-6">
          {/* Pie Chart */}
          <div className="relative w-[220px] h-[220px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div className="bg-white border border-neutral-200 shadow-lg rounded-md p-2 text-xs">
                          <span className="font-semibold text-ghl-text">{d.name}</span>
                          <br />
                          <span className="text-neutral-600">
                            {d.value} ({pct}%)
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-ghl-text">{total}</span>
            </div>
          </div>

          {/* Legend - Right Side List */}
          <div className="flex-1 flex flex-col justify-center pl-6 space-y-4">
            {formattedData.map((item) => {
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00';
              return (
                <div
                  key={item.name}
                  className="flex items-start justify-between group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => onStageClick?.(getStageKey(item.name))}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-[4px] flex-shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-neutral-600 group-hover:text-ghl-blue transition-colors">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                        <span>
                          {item.value} ({pct}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Horizontal Bar Chart */
        <div className="flex-1 mt-2">
          <ResponsiveContainer width="100%" height={formattedData.length * 44 + 16}>
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 0, right: 80, left: 0, bottom: 0 }}
              barCategoryGap="24%"
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={100}
                tick={{ fontSize: 12, fill: '#525252' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 shadow-lg rounded-md p-2 text-xs">
                        <span className="font-semibold text-ghl-text">{d.name}</span>
                        <br />
                        <span className="text-neutral-600">
                          {d.value} ({d.percentage}%)
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => data.name && onStageClick?.(getStageKey(data.name))}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="label"
                  position="right"
                  style={{ fontSize: 11, fill: '#525252', fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
