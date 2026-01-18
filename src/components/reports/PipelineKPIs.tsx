'use client';

/**
 * PipelineKPIs Component
 *
 * Shows PERIOD metrics with comparison badges.
 * These depend on DateRangePicker selection.
 * Includes: Versendet, Ø Versanddauer, Liefertreue
 */

import { Truck, Clock, CheckCircle2, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type PipelineKpiClickType = 'shipped';

interface PipelineKPIsProps {
  kpis: {
    avgDaysToShip: number | null;
    onTimePercent: number;
    totalShipped: number;
  } | null;
  prevPeriod: {
    avgDaysToShip: number | null;
    onTimePercent: number;
    totalShipped: number;
  } | null;
  loading: boolean;
  onKpiClick?: (type: PipelineKpiClickType) => void;
}

interface KpiCardConfig {
  key: 'totalShipped' | 'avgDaysToShip' | 'onTimePercent';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass: string;
  getValue: (kpis: NonNullable<PipelineKPIsProps['kpis']>) => string;
  // For avgDaysToShip, lower is better, so we invert the comparison
  invertComparison?: boolean;
  clickType?: PipelineKpiClickType;
}

const KPI_CARDS: KpiCardConfig[] = [
  {
    key: 'totalShipped',
    label: 'Versendet',
    icon: Truck,
    iconColorClass: 'text-neutral-700',
    getValue: (kpis) => String(kpis.totalShipped),
    clickType: 'shipped',
  },
  {
    key: 'avgDaysToShip',
    label: 'Ø Versanddauer',
    icon: Clock,
    iconColorClass: 'text-neutral-700',
    getValue: (kpis) => (kpis.avgDaysToShip !== null ? `${kpis.avgDaysToShip} Tage` : '-'),
    invertComparison: true, // Lower is better
  },
  {
    key: 'onTimePercent',
    label: 'Liefertreue',
    icon: CheckCircle2,
    iconColorClass: 'text-neutral-700',
    getValue: (kpis) => `${kpis.onTimePercent}%`,
  },
];

export function PipelineKPIs({ kpis, prevPeriod, loading, onKpiClick }: PipelineKPIsProps) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <h3 className="font-semibold text-ghl-text">Versand-Performance</h3>

      {/* 3-column grid of KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {KPI_CARDS.map((card) => {
          const IconComponent = card.icon;
          const currentValue = kpis ? kpis[card.key] : null;
          const prevValue = prevPeriod ? prevPeriod[card.key] : null;
          const isClickable = !!card.clickType && !!onKpiClick;

          const handleClick = () => {
            if (card.clickType && onKpiClick) {
              onKpiClick(card.clickType);
            }
          };

          const handleKeyDown = (e: React.KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && card.clickType && onKpiClick) {
              e.preventDefault();
              onKpiClick(card.clickType);
            }
          };

          const cardContent = (
            <>
              {/* Icon and label */}
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className={cn('w-5 h-5', card.iconColorClass)} />
                <span className="text-sm font-medium text-neutral-600">{card.label}</span>
              </div>

              {/* Value */}
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                  <span className="text-sm text-neutral-500">Lade...</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-ghl-text">
                    {kpis ? card.getValue(kpis) : '-'}
                  </p>

                  {/* Comparison badge */}
                  <ComparisonBadge
                    current={currentValue}
                    previous={prevValue}
                    invertComparison={card.invertComparison}
                  />
                </>
              )}
            </>
          );

          // Clickable cards have hover effect and keyboard accessibility
          if (isClickable) {
            return (
              <div
                key={card.key}
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={cn(
                  'bg-white rounded-lg border border-neutral-200 p-4',
                  'cursor-pointer transition-all',
                  'hover:border-ghl-blue hover:shadow-sm',
                  'focus:outline-none focus:ring-2 focus:ring-ghl-blue focus:ring-offset-2'
                )}
              >
                {cardContent}
              </div>
            );
          }

          // Non-clickable cards
          return (
            <div key={card.key} className="bg-white rounded-lg border border-neutral-200 p-4">
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ComparisonBadgeProps {
  current: number | null;
  previous: number | null;
  invertComparison?: boolean;
}

function ComparisonBadge({ current, previous, invertComparison }: ComparisonBadgeProps) {
  // Cannot compare if either is null
  if (current === null || previous === null) {
    return <span className="text-xs text-neutral-400 mt-1 block">vs Vorperiode</span>;
  }

  // Calculate change
  let changePercent: number;
  if (previous === 0) {
    changePercent = current > 0 ? 100 : 0;
  } else {
    changePercent = Math.round(((current - previous) / previous) * 100);
  }

  if (changePercent === 0) {
    return <span className="text-xs text-neutral-500 mt-1 block">0% vs Vorperiode</span>;
  }

  // For inverted comparison (like avgDaysToShip), lower is better
  // So a negative change is good, positive is bad
  const isIncrease = changePercent > 0;
  const isGood = invertComparison ? !isIncrease : isIncrease;

  const arrow = isIncrease ? '\u2191' : '\u2193';
  const colorClass = isGood ? 'text-green-600' : 'text-red-600';

  return (
    <span className={cn('text-xs font-medium mt-1 block', colorClass)}>
      {arrow} {Math.abs(changePercent)}% vs Vorperiode
    </span>
  );
}
