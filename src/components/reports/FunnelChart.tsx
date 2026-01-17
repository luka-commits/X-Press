'use client';

import { FunnelStage } from '@/lib/reporting-queries';

interface FunnelChartProps {
  data: FunnelStage[];
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

export function FunnelChart({ data, onStageClick }: FunnelChartProps) {
  // Calculate total orders
  const totalOrders = data.reduce((sum, stage) => sum + stage.value, 0);

  // Find max value for bar width calculation
  const maxValue = Math.max(...data.map((s) => s.value), 1);

  // Distinct color palette for funnel stages
  const stageColors = [
    '#2563EB', // Blue-600
    '#06B6D4', // Cyan-500
    '#8B5CF6', // Violet-500
    '#EC4899', // Pink-500
    '#6366F1', // Indigo-500
  ];

  // Calculate cumulative and next-step conversion
  // Note: With exclusive data, 'cumulative' is actually just % of total
  const formattedData = data.map((stage, index) => {
    const percentOfTotal = totalOrders > 0 ? ((stage.value / totalOrders) * 100).toFixed(1) : '0.0';

    // Placeholder for Avg Time (would need real data)
    // For now, leave empty or mock logic?
    // User asked to remove "Next Step Conversion" confusion?
    // Let's just put "-" or a placeholder.
    const avgTime = '-';

    return {
      ...stage,
      fill: stageColors[index % stageColors.length], // New distinct palette
      cumulative: `${percentOfTotal}%`,
      nextStep: avgTime,
      barWidth: (stage.value / maxValue) * 100,
    };
  });

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-ghl-text">Funnel</h2>
      </div>

      {/* Main Value */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-ghl-text">{totalOrders}</span>
        <p className="text-xs text-neutral-500 mt-1">Total Orders</p>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-4 text-[10px] uppercase font-bold text-neutral-400 mb-2 px-1">
        <div className="col-span-6"></div>
        <div className="col-span-3 text-center">% Of Total</div>
        <div className="col-span-3 text-center">Avg. Time</div>
      </div>

      {/* Funnel Bars */}
      <div className="space-y-3">
        {formattedData.map((stage) => (
          <div key={stage.name} className="grid grid-cols-12 gap-4 items-center group">
            {/* Bar with label */}
            <div className="col-span-6 relative">
              {/* Bar Overlay */}
              <div
                className="relative h-12 rounded-md flex flex-col justify-center px-4 cursor-pointer hover:opacity-90 transition shadow-sm border-l-4 border-black/5"
                style={{
                  backgroundColor: stage.fill,
                  width: '100%',
                }}
                role="button"
                tabIndex={0}
                onClick={() => onStageClick?.(getStageKey(stage.name))}
              >
                <div className="flex justify-between items-center z-10 w-full">
                  <span className="text-white text-sm font-medium truncate">{stage.name}</span>
                  <span className="text-white/90 text-sm font-bold bg-black/10 px-2 py-0.5 rounded">
                    {stage.value}
                  </span>
                </div>
              </div>
            </div>

            {/* Cumulative */}
            <div className="col-span-3">
              <div className="h-12 bg-neutral-50 rounded-md border border-neutral-100 flex items-center justify-center relative arrow-left-decoration">
                <span className="text-sm font-semibold text-neutral-700">{stage.cumulative}</span>
              </div>
            </div>

            {/* Next Step Conversion */}
            <div className="col-span-3">
              <div className="h-12 bg-neutral-50 rounded-md border border-neutral-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-neutral-700">{stage.nextStep}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
