'use client';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { X, Circle, CheckCircle2, AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { OrderSearchResult } from './OrderSearch';

type IstStatusType = 'in_produktion' | 'fertig' | 'problem' | null;

/**
 * Status badge component with color-coded display
 */
function StatusBadge({ status }: { status: IstStatusType }) {
  const config = {
    in_produktion: {
      label: 'In Produktion',
      icon: Circle,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500/30',
    },
    fertig: {
      label: 'Fertig',
      icon: CheckCircle2,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
      borderColor: 'border-green-500/30',
    },
    problem: {
      label: 'Problem',
      icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
      borderColor: 'border-red-500/30',
    },
  };

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
        <Circle className="w-4 h-4" />
        Kein Status
      </span>
    );
  }

  const { label, icon: Icon, bgColor, textColor, borderColor } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
        bgColor,
        textColor,
        borderColor
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
}

interface OrderDetailsProps {
  order: OrderSearchResult;
  onClear?: () => void;
  className?: string;
}

/**
 * Mobile-optimized order details component.
 * Displays selected order information in a card format.
 * Large, readable text with clear visual hierarchy for mobile usability.
 */
export function OrderDetails({ order, onClear, className }: OrderDetailsProps) {
  // Format date to German locale (dd.MM.yyyy)
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Nicht angegeben';
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch {
      return 'Ungültiges Datum';
    }
  };

  return (
    <div className={cn('bg-white rounded-lg border border-ghl-border p-4', className)}>
      {/* Header with order number and clear button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ghl-text">{order.auftragsnummer}</h2>
        {onClear && (
          <button
            onClick={onClear}
            className="min-h-12 min-w-12 flex items-center justify-center text-ghl-text-secondary hover:text-ghl-text active:bg-ghl-bg rounded-lg transition-colors"
            aria-label="Auswahl aufheben"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Order details sections */}
      <div className="space-y-3">
        {/* Status section - prominently displayed */}
        <div>
          <p className="text-sm font-semibold text-ghl-text-secondary">Aktueller Status</p>
          <StatusBadge status={order.istStatus} />
        </div>

        {/* Kunde section */}
        <div>
          <p className="text-sm font-semibold text-ghl-text-secondary">Kunde</p>
          <p className="text-ghl-text">
            {order.kunde?.firma || order.kunde?.name || 'Unbekannter Kunde'}
          </p>
        </div>

        {/* Produkt section */}
        <div>
          <p className="text-sm font-semibold text-ghl-text-secondary">Produkt</p>
          <p className="text-ghl-text">{order.produkttyp || 'Nicht angegeben'}</p>
        </div>

        {/* Liefertermin section */}
        <div>
          <p className="text-sm font-semibold text-ghl-text-secondary">Liefertermin</p>
          <p className="text-ghl-text">{formatDate(order.liefertermin)}</p>
        </div>
      </div>

      {/* Alternative clear action */}
      {onClear && (
        <button
          onClick={onClear}
          className="mt-4 w-full min-h-12 text-sm text-ghl-text-secondary hover:text-ghl-text active:bg-ghl-bg rounded-lg transition-colors"
        >
          Anderen Auftrag wählen
        </button>
      )}
    </div>
  );
}
