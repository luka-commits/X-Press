'use client';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { cn } from '@/lib/utils';

import type { VersandStatusType } from './VersandStatusButtons';

/**
 * Order data structure from GET /api/versand/orders
 */
export interface VersandOrder {
  auftragsnummer: string;
  produkttyp: string | null;
  liefertermin: string | null;
  versandStatus: VersandStatusType | null;
  versandKommentar: string | null;
  versandUpdatedAt: string | null;
  lieferStrasse: string | null;
  lieferPlz: string | null;
  lieferOrt: string | null;
  lieferLand: string | null;
  lieferLat: number | null;
  lieferLng: number | null;
  kunde: {
    firma: string | null;
    name: string | null;
  } | null;
}

interface VersandOrderCardProps {
  order: VersandOrder;
  isSelected: boolean;
  onSelect: (order: VersandOrder) => void;
  /** Route planning mode - shows checkbox and disables normal selection */
  routePlanningMode?: boolean;
  /** Position in route (1-based), null if not selected for route */
  routePosition?: number | null;
  /** Callback to toggle this order in/out of the route */
  onRouteToggle?: () => void;
}

/**
 * Status badge color mapping - light theme style
 */
function getStatusColor(status: VersandStatusType | null): string {
  switch (status) {
    case 'versandbereit':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'versendet':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'offen':
    default:
      return 'bg-neutral-100 text-neutral-600 border-neutral-200';
  }
}

/**
 * Status display text
 */
function getStatusText(status: VersandStatusType | null): string {
  switch (status) {
    case 'versandbereit':
      return 'Versandbereit';
    case 'versendet':
      return 'Versendet';
    case 'offen':
    default:
      return 'Offen';
  }
}

/**
 * VersandOrderCard Component - Order Card for Versand-Team
 *
 * Displays order info with address prominently for PLZ sorting visibility.
 * Features:
 * - Auftragsnummer, Kunde (firma/name), Produkttyp
 * - Address: lieferStrasse, lieferPlz (emphasized), lieferOrt
 * - Liefertermin formatted as dd.MM.yyyy
 * - VersandStatus badge with color-coded styling
 * - Touch-friendly selection for status updates
 */
export function VersandOrderCard({
  order,
  isSelected,
  onSelect,
  routePlanningMode = false,
  routePosition = null,
  onRouteToggle,
}: VersandOrderCardProps) {
  const formattedDate = order.liefertermin
    ? format(new Date(order.liefertermin), 'dd.MM.yyyy', { locale: de })
    : 'Kein Termin';

  const customerName = order.kunde?.firma || order.kunde?.name || 'Unbekannt';

  // Handle click based on mode
  const handleClick = () => {
    if (routePlanningMode) {
      // In route planning mode, toggle route selection
      onRouteToggle?.();
    } else {
      // Normal mode, expand/collapse
      onSelect(order);
    }
  };

  // Determine if this card is selected for route
  const isInRoute = routePosition !== null;

  return (
    <button
      id={`order-card-${order.auftragsnummer}`}
      onClick={handleClick}
      className={cn(
        'w-full text-left p-4 rounded-lg border transition-all duration-200 shadow-sm',
        'bg-white border-ghl-border',
        // Route planning mode styling
        routePlanningMode && isInRoute
          ? 'ring-2 ring-blue-400 border-blue-400 shadow-md border-l-4 border-l-blue-500'
          : routePlanningMode
            ? 'hover:shadow-md hover:border-blue-200'
            : // Normal mode styling
              isSelected
              ? 'ring-2 ring-blue-400 border-blue-400 shadow-md'
              : 'hover:shadow-md hover:border-blue-200'
      )}
    >
      {/* Route Planning Mode: Checkbox and Position Badge */}
      {routePlanningMode && (
        <div className="flex items-center gap-3 mb-3">
          {/* Checkbox */}
          <div
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              isInRoute ? 'bg-blue-500 border-blue-500' : 'border-neutral-300 bg-white'
            )}
          >
            {isInRoute && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>

          {/* Route Position Badge */}
          {isInRoute && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold">
              {routePosition}
            </span>
          )}

          {/* Label */}
          <span className="text-sm text-neutral-500">
            {isInRoute ? `Stopp ${routePosition}` : 'Zur Route hinzufügen'}
          </span>
        </div>
      )}

      {/* Header: Auftragsnummer + Status Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-ghl-text">{order.auftragsnummer}</span>
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full border',
            getStatusColor(order.versandStatus)
          )}
        >
          {getStatusText(order.versandStatus)}
        </span>
      </div>

      {/* Customer */}
      <div className="text-sm text-neutral-700 mb-1">{customerName}</div>

      {/* Product Type */}
      {order.produkttyp && <div className="text-xs text-neutral-500 mb-3">{order.produkttyp}</div>}

      {/* Address - PLZ emphasized for sorting visibility */}
      <div className="bg-neutral-50 rounded-md p-2.5 mb-3 border border-neutral-100">
        {order.lieferStrasse && (
          <div className="text-sm text-neutral-600">{order.lieferStrasse}</div>
        )}
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="font-semibold text-ghl-text text-lg">{order.lieferPlz || '—'}</span>
          <span className="text-sm text-neutral-600">{order.lieferOrt || 'Unbekannt'}</span>
        </div>
      </div>

      {/* Delivery Date */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">Liefertermin</span>
        <span className="text-neutral-700 font-medium">{formattedDate}</span>
      </div>
    </button>
  );
}
