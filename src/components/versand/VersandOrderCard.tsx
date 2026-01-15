"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { VersandStatusType } from "./VersandStatusButtons";

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
  kunde: {
    firma: string | null;
    name: string | null;
  } | null;
}

interface VersandOrderCardProps {
  order: VersandOrder;
  isSelected: boolean;
  onSelect: (order: VersandOrder) => void;
}

/**
 * Status badge color mapping
 */
function getStatusColor(status: VersandStatusType | null): string {
  switch (status) {
    case "versandbereit":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "versendet":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "offen":
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

/**
 * Status display text
 */
function getStatusText(status: VersandStatusType | null): string {
  switch (status) {
    case "versandbereit":
      return "Versandbereit";
    case "versendet":
      return "Versendet";
    case "offen":
    default:
      return "Offen";
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
}: VersandOrderCardProps) {
  const formattedDate = order.liefertermin
    ? format(new Date(order.liefertermin), "dd.MM.yyyy", { locale: de })
    : "Kein Termin";

  const customerName = order.kunde?.firma || order.kunde?.name || "Unbekannt";

  return (
    <button
      onClick={() => onSelect(order)}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-colors",
        "bg-ghl-card border-ghl-border",
        isSelected
          ? "ring-2 ring-blue-500 border-blue-500"
          : "hover:border-gray-600"
      )}
    >
      {/* Header: Auftragsnummer + Status Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-white">
          {order.auftragsnummer}
        </span>
        <span
          className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full border",
            getStatusColor(order.versandStatus)
          )}
        >
          {getStatusText(order.versandStatus)}
        </span>
      </div>

      {/* Customer */}
      <div className="text-sm text-gray-300 mb-2">{customerName}</div>

      {/* Product Type */}
      {order.produkttyp && (
        <div className="text-xs text-gray-400 mb-3">{order.produkttyp}</div>
      )}

      {/* Address - PLZ emphasized for sorting visibility */}
      <div className="bg-ghl-bg/50 rounded-md p-2 mb-2">
        {order.lieferStrasse && (
          <div className="text-sm text-gray-300">{order.lieferStrasse}</div>
        )}
        <div className="flex items-baseline gap-1.5">
          <span className="font-semibold text-white text-lg">
            {order.lieferPlz || "—"}
          </span>
          <span className="text-sm text-gray-300">
            {order.lieferOrt || "Unbekannt"}
          </span>
        </div>
      </div>

      {/* Delivery Date */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Liefertermin</span>
        <span className="text-gray-300 font-medium">{formattedDate}</span>
      </div>
    </button>
  );
}
