'use client';

/**
 * KPI Card Component
 *
 * Einzelne Kennzahl-Karte für das Dashboard
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { KPIOrdersDialog } from './KPIOrdersDialog';

interface KPICardProps {
  label: string;
  value: number | string;
  suffix?: string;
  variant?: 'default' | 'critical' | 'warning' | 'success';
  onClick?: () => void;
}

export function KPICard({ label, value, suffix = '', variant = 'default', onClick }: KPICardProps) {
  const valueColorClass = {
    default: 'text-ghl-text',
    critical: 'text-capacity-red',
    warning: 'text-capacity-yellow',
    success: 'text-capacity-green',
  }[variant];

  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        'bg-white rounded-lg p-6 border border-ghl-border transition-all duration-200 hover:shadow-md shadow-sm',
        isClickable ? 'cursor-pointer hover:border-ghl-blue' : 'hover:border-blue-200'
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
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
  const [dialogState, setDialogState] = useState<{
    type: 'total' | 'critical' | null;
    isOpen: boolean;
  }>({
    type: null,
    isOpen: false,
  });

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

  const openDialog = (type: 'total' | 'critical') => {
    setDialogState({ type, isOpen: true });
  };

  const closeDialog = (open: boolean) => {
    if (!open) {
      setDialogState({ type: null, isOpen: false });
    }
  };

  const getDialogTitle = () => {
    if (dialogState.type === 'total') {
      return 'Offene Aufträge';
    }
    if (dialogState.type === 'critical') {
      return 'Bald fällig (≤2 Tage)';
    }
    return '';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Offene Aufträge"
          value={total}
          onClick={() => openDialog('total')}
        />
        <KPICard
          label="Bald fällig (≤2 Tage)"
          value={critical}
          variant={critical > 0 ? 'warning' : 'default'}
          onClick={() => openDialog('critical')}
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

      {dialogState.type && (
        <KPIOrdersDialog
          kpiType={dialogState.type}
          title={getDialogTitle()}
          isOpen={dialogState.isOpen}
          onOpenChange={closeDialog}
        />
      )}
    </>
  );
}
