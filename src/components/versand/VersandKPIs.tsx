"use client";

import { cn } from "@/lib/utils";
import type { VersandOrder } from "./VersandOrderCard";
import type { VersandStatusType } from "./VersandStatusButtons";

/**
 * Filter type for status clicks
 */
export type VersandStatusFilter = "all" | "offen" | "versandbereit";

interface VersandKPIsProps {
  orders: VersandOrder[];
  onFilterClick?: (status: VersandStatusFilter) => void;
}

/**
 * VersandKPIs Component - Compact KPI bar for shipping overview
 *
 * Shows order counts at a glance for Geschäftsführer quick overview:
 * - Offen: Orders waiting to be processed
 * - Versandbereit: Orders ready for shipping
 * - Versendet: Orders already shipped
 * - Überfällig: Orders past due date (not yet shipped)
 */
export function VersandKPIs({ orders, onFilterClick }: VersandKPIsProps) {
  // Calculate counts from orders array
  const counts = {
    offen: orders.filter((o) => o.versandStatus === "offen" || o.versandStatus === null).length,
    versandbereit: orders.filter((o) => o.versandStatus === "versandbereit").length,
    versendet: orders.filter((o) => o.versandStatus === "versendet").length,
    ueberfaellig: orders.filter((o) => {
      // Überfällig: lieferdatum < today AND versandStatus !== 'versendet'
      if (!o.liefertermin) return false;
      if (o.versandStatus === "versendet") return false;
      const lieferDate = new Date(o.liefertermin);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return lieferDate < today;
    }).length,
  };

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <KPIStat
        count={counts.offen}
        label="Offen"
        onClick={onFilterClick ? () => onFilterClick("offen") : undefined}
      />
      <KPIStat
        count={counts.versandbereit}
        label="Versandbereit"
        variant="amber"
        onClick={onFilterClick ? () => onFilterClick("versandbereit") : undefined}
      />
      <KPIStat
        count={counts.versendet}
        label="Versendet"
        variant="green"
        onClick={onFilterClick ? () => onFilterClick("all") : undefined}
      />
      {counts.ueberfaellig > 0 && (
        <KPIStat
          count={counts.ueberfaellig}
          label="Überfällig"
          variant="red"
        />
      )}
    </div>
  );
}

/**
 * Individual KPI stat display
 */
interface KPIStatProps {
  count: number;
  label: string;
  variant?: "default" | "amber" | "green" | "red";
  onClick?: () => void;
}

function KPIStat({ count, label, variant = "default", onClick }: KPIStatProps) {
  const colorClasses = {
    default: "text-gray-300",
    amber: "text-amber-400",
    green: "text-green-400",
    red: "text-red-400",
  };

  const content = (
    <>
      <span className={cn("font-bold", colorClasses[variant])}>{count}</span>
      <span className="text-gray-500 ml-1">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex items-baseline hover:opacity-80 transition-opacity"
      >
        {content}
      </button>
    );
  }

  return <span className="flex items-baseline">{content}</span>;
}
