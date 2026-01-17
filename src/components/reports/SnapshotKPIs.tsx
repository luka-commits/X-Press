'use client';

/**
 * SnapshotKPIs Component
 *
 * Shows CURRENT STATE metrics - independent of DateRangePicker.
 * These are real-time values, NOT period comparisons.
 * No comparison badges since these are snapshot values, not trends.
 */

import { Package, AlertTriangle, Clock, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type KpiClickType = 'problem' | 'oldest' | 'tomorrow';

interface SnapshotKPIsProps {
  data: {
    aktiveAuftraege: number;
    problemAuftraege: number;
    aeltesterAuftrag: number | null;
    morgenFaellig: number;
  } | null;
  loading: boolean;
  onKpiClick?: (type: KpiClickType) => void;
}

interface KpiCardConfig {
  key: keyof NonNullable<SnapshotKPIsProps['data']>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass: string;
  getValue: (value: number | null) => string;
  getHighlightCondition?: (value: number | null) => boolean;
  highlightColorClass?: string;
  clickType?: KpiClickType;
}

const KPI_CARDS: KpiCardConfig[] = [
  {
    key: 'aktiveAuftraege',
    label: 'Offene Aufträge',
    icon: Package,
    iconColorClass: 'text-blue-600',
    getValue: (v) => String(v ?? 0),
    // No clickType - not clickable (just a total count)
  },
  {
    key: 'problemAuftraege',
    label: 'Problem-Aufträge',
    icon: AlertTriangle,
    iconColorClass: 'text-neutral-400',
    getValue: (v) => String(v ?? 0),
    getHighlightCondition: (v) => (v ?? 0) > 0,
    highlightColorClass: 'text-red-600',
    clickType: 'problem',
  },
  {
    key: 'aeltesterAuftrag',
    label: 'Ältester Auftrag',
    icon: Clock,
    iconColorClass: 'text-neutral-400',
    getValue: (v) => (v !== null ? `${v} Tage` : '-'),
    getHighlightCondition: (v) => (v ?? 0) > 7,
    highlightColorClass: 'text-amber-600',
    clickType: 'oldest',
  },
  {
    key: 'morgenFaellig',
    label: 'Morgen fällig',
    icon: Calendar,
    iconColorClass: 'text-neutral-400',
    getValue: (v) => String(v ?? 0),
    getHighlightCondition: (v) => (v ?? 0) > 0,
    highlightColorClass: 'text-amber-600',
    clickType: 'tomorrow',
  },
];

export function SnapshotKPIs({ data, loading, onKpiClick }: SnapshotKPIsProps) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <h3 className="font-semibold text-ghl-text">Aktueller Stand</h3>

      {/* 4-column grid of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const value = data ? data[card.key] : null;
          const isHighlighted = card.getHighlightCondition?.(value) ?? false;
          const IconComponent = card.icon;
          const iconColor = isHighlighted && card.highlightColorClass
            ? card.highlightColorClass
            : card.iconColorClass;
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
                <IconComponent className={cn('w-5 h-5', iconColor)} />
                <span className="text-sm font-medium text-neutral-600">
                  {card.label}
                </span>
              </div>

              {/* Value */}
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                  <span className="text-sm text-neutral-500">Lade...</span>
                </div>
              ) : (
                <p
                  className={cn(
                    'text-2xl font-bold',
                    isHighlighted && card.highlightColorClass
                      ? card.highlightColorClass
                      : 'text-ghl-text'
                  )}
                >
                  {card.getValue(value)}
                </p>
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

          // Non-clickable cards (aktiveAuftraege)
          return (
            <div
              key={card.key}
              className="bg-white rounded-lg border border-neutral-200 p-4"
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
