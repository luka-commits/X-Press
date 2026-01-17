'use client';

/**
 * PipelineFunnel Component
 *
 * Horizontal funnel visualization showing throughput through 4 pipeline stages.
 * IMPORTANT: Shows THROUGHPUT (Durchfluss im Zeitraum) not current snapshot.
 * Each stage shows orders that reached that stage within the selected period.
 */

import { ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FunnelStage {
  count: number;
  prevCount: number;
  changePercent: number;
}

interface PipelineFunnelProps {
  data: {
    eingang: FunnelStage;
    produktion: FunnelStage;
    versandbereit: FunnelStage;
    versendet: FunnelStage;
  } | null;
  loading: boolean;
}

interface StageConfig {
  key: keyof NonNullable<PipelineFunnelProps['data']>;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const STAGES: StageConfig[] = [
  {
    key: 'eingang',
    label: 'Eingang',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  {
    key: 'produktion',
    label: 'Produktion',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  {
    key: 'versandbereit',
    label: 'Versandbereit',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  {
    key: 'versendet',
    label: 'Versendet',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
];

export function PipelineFunnel({ data, loading }: PipelineFunnelProps) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      {/* Header with info icon */}
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-semibold text-ghl-text">Durchfluss im Zeitraum</h3>
        <span
          title="Aufträge die im gewählten Zeitraum diese Stage erreicht haben"
          className="cursor-help"
        >
          <Info className="w-4 h-4 text-neutral-400" />
        </span>
      </div>

      {/* Funnel stages */}
      <div className="flex items-center justify-between gap-2">
        {STAGES.map((stage, index) => (
          <div key={stage.key} className="flex items-center flex-1">
            {/* Stage box */}
            <div
              className={cn(
                'flex-1 rounded-lg border p-4 text-center',
                stage.bgColor,
                stage.borderColor
              )}
            >
              {/* Label */}
              <p className={cn('text-xs font-medium mb-1', stage.textColor)}>
                {stage.label}
              </p>

              {/* Count */}
              {loading ? (
                <div className="h-8 flex items-center justify-center">
                  <div className="w-12 h-6 bg-neutral-200 rounded animate-pulse" />
                </div>
              ) : (
                <p className={cn('text-2xl font-bold', stage.textColor)}>
                  {data ? data[stage.key].count : 0}
                </p>
              )}

              {/* Comparison badge */}
              {loading ? (
                <div className="h-5 flex items-center justify-center mt-1">
                  <div className="w-10 h-4 bg-neutral-200 rounded animate-pulse" />
                </div>
              ) : (
                <ComparisonBadge
                  changePercent={data ? data[stage.key].changePercent : 0}
                />
              )}
            </div>

            {/* Arrow between stages */}
            {index < STAGES.length - 1 && (
              <ChevronRight className="w-5 h-5 text-neutral-300 mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ComparisonBadgeProps {
  changePercent: number;
}

function ComparisonBadge({ changePercent }: ComparisonBadgeProps) {
  if (changePercent === 0) {
    return (
      <span className="inline-flex items-center text-xs text-neutral-500 mt-1">
        0% vs Vorperiode
      </span>
    );
  }

  const isPositive = changePercent > 0;
  const arrow = isPositive ? '\u2191' : '\u2193';
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <span className={cn('inline-flex items-center text-xs font-medium mt-1', colorClass)}>
      {arrow} {Math.abs(changePercent)}%
    </span>
  );
}
