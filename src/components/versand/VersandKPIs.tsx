"use client";

import { cn } from "@/lib/utils";
import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import type { VersandOrder } from "./VersandOrderCard";

/**
 * Filter type for status clicks
 */
export type VersandStatusFilter = "all" | "offen" | "versandbereit";

interface VersandKPIsProps {
  orders: VersandOrder[];
  onFilterClick?: (status: VersandStatusFilter) => void;
  activeFilter?: VersandStatusFilter;
}

/**
 * VersandKPIs Component - Card-based KPI display matching dashboard style
 *
 * Shows order counts at a glance for Geschäftsführer quick overview:
 * - Offen: Orders waiting to be processed
 * - Versandbereit: Orders ready for shipping
 * - Versendet: Orders already shipped
 * - Überfällig: Orders past due date (not yet shipped)
 */
export function VersandKPIs({ orders, onFilterClick, activeFilter }: VersandKPIsProps) {
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPICard
        icon={Package}
        count={counts.offen}
        label="Offen"
        isActive={activeFilter === "offen"}
        onClick={onFilterClick ? () => onFilterClick("offen") : undefined}
      />
      <KPICard
        icon={Truck}
        count={counts.versandbereit}
        label="Versandbereit"
        variant="amber"
        isActive={activeFilter === "versandbereit"}
        onClick={onFilterClick ? () => onFilterClick("versandbereit") : undefined}
      />
      <KPICard
        icon={CheckCircle}
        count={counts.versendet}
        label="Versendet"
        variant="green"
        onClick={onFilterClick ? () => onFilterClick("all") : undefined}
      />
      <KPICard
        icon={AlertTriangle}
        count={counts.ueberfaellig}
        label="Überfällig"
        variant={counts.ueberfaellig > 0 ? "red" : "default"}
      />
    </div>
  );
}

/**
 * Individual KPI card - matches dashboard KPICard style
 */
interface KPICardProps {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  label: string;
  variant?: "default" | "amber" | "green" | "red";
  isActive?: boolean;
  onClick?: () => void;
}

function KPICard({ icon: Icon, count, label, variant = "default", isActive, onClick }: KPICardProps) {
  const variantStyles = {
    default: {
      iconBg: "bg-neutral-100",
      iconColor: "text-neutral-500",
      valueColor: "text-ghl-text",
    },
    amber: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      valueColor: "text-amber-600",
    },
    green: {
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      valueColor: "text-green-600",
    },
    red: {
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      valueColor: "text-red-600",
    },
  };

  const styles = variantStyles[variant];

  const content = (
    <div
      className={cn(
        "bg-white rounded-lg p-4 border transition-all duration-200 shadow-sm",
        onClick ? "cursor-pointer hover:shadow-md" : "",
        isActive ? "border-blue-400 ring-1 ring-blue-400" : "border-ghl-border hover:border-blue-200"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", styles.iconBg)}>
          <Icon className={cn("w-5 h-5", styles.iconColor)} />
        </div>
        <div>
          <p className={cn("text-2xl font-semibold", styles.valueColor)}>{count}</p>
          <p className="text-xs text-neutral-500">{label}</p>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full">
        {content}
      </button>
    );
  }

  return content;
}
