/**
 * KPI Card Component
 *
 * Einzelne Kennzahl-Karte für das Dashboard
 */

import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number | string;
  suffix?: string;
  variant?: 'default' | 'critical' | 'warning' | 'success';
}

export function KPICard({ label, value, suffix = '', variant = 'default' }: KPICardProps) {
  const valueColorClass = {
    default: 'text-ghl-text',
    critical: 'text-capacity-red',
    warning: 'text-capacity-yellow',
    success: 'text-capacity-green',
  }[variant];

  return (
    <div className="bg-white rounded-lg p-6 border border-ghl-border transition-all duration-200 hover:shadow-md hover:border-blue-200 shadow-sm">
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <p className={cn('text-3xl font-semibold', valueColorClass)}>
        {value}
        {suffix && <span className="text-xl ml-0.5">{suffix}</span>}
      </p>
    </div>
  );
}

interface KPICardsGridProps {
  total: number;
  critical: number;
  avgCapacity: number;
  engpass: {
    name: string;
    auslastung: number;
  } | null;
}

export function KPICardsGrid({ total, critical, avgCapacity, engpass }: KPICardsGridProps) {
  // Determine capacity variant based on percentage
  const capacityVariant =
    avgCapacity > 90 ? 'critical' : avgCapacity > 70 ? 'warning' : avgCapacity > 0 ? 'success' : 'default';

  // Determine engpass variant
  const engpassVariant = engpass
    ? engpass.auslastung > 90
      ? 'critical'
      : engpass.auslastung > 70
        ? 'warning'
        : 'success'
    : 'default';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard label="Aktive Aufträge" value={total} />
      <KPICard
        label="Bald fällig (≤2 Tage)"
        value={critical}
        variant={critical > 0 ? 'warning' : 'default'}
      />
      <KPICard
        label="Ø Auslastung"
        value={avgCapacity}
        suffix="%"
        variant={capacityVariant}
      />
      <KPICard
        label="Engpass"
        value={engpass ? engpass.name : '–'}
        suffix={engpass ? ` ${engpass.auslastung}%` : ''}
        variant={engpassVariant}
      />
    </div>
  );
}
