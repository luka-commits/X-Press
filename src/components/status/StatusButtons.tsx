"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Status type matching IstStatus enum from Prisma schema.
 * Used for type-safe status updates.
 */
export type IstStatusType = "in_produktion" | "fertig" | "problem";

interface StatusButtonsProps {
  orderId: string;
  onStatusChange: (status: IstStatusType) => Promise<void>;
  disabled?: boolean;
  loadingStatus?: IstStatusType | null;
  className?: string;
}

/**
 * StatusButtons Component - Mobile Status-Updates für Shopfloor
 *
 * 3 large, mobile-friendly buttons for quick status updates:
 * - "In Produktion" (in_produktion) - Blue accent
 * - "Fertig" (fertig) - Green/success
 * - "Problem" (problem) - Red/warning
 *
 * Design:
 * - Large touch targets (min-h-14 = 56px) for mobile usability
 * - Full width buttons stacked vertically with gap-3
 * - Loading spinner on active button during API call
 * - Disabled state prevents double-clicks
 */
export function StatusButtons({
  orderId,
  onStatusChange,
  disabled = false,
  loadingStatus = null,
  className,
}: StatusButtonsProps) {
  const isLoading = loadingStatus !== null;

  const handleClick = async (status: IstStatusType) => {
    if (disabled || isLoading) return;
    await onStatusChange(status);
  };

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      role="group"
      aria-label={`Status-Update für Auftrag ${orderId}`}
    >
      {/* In Produktion - Blue */}
      <button
        onClick={() => handleClick("in_produktion")}
        disabled={disabled || isLoading}
        className={cn(
          "min-h-14 w-full rounded-lg border font-semibold text-white transition-colors",
          "bg-blue-500 border-blue-600 hover:bg-blue-600 active:bg-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {loadingStatus === "in_produktion" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird aktualisiert...</span>
          </>
        ) : (
          "In Produktion"
        )}
      </button>

      {/* Fertig - Green */}
      <button
        onClick={() => handleClick("fertig")}
        disabled={disabled || isLoading}
        className={cn(
          "min-h-14 w-full rounded-lg border font-semibold text-white transition-colors",
          "bg-green-500 border-green-600 hover:bg-green-600 active:bg-green-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {loadingStatus === "fertig" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird aktualisiert...</span>
          </>
        ) : (
          "Fertig"
        )}
      </button>

      {/* Problem - Red */}
      <button
        onClick={() => handleClick("problem")}
        disabled={disabled || isLoading}
        className={cn(
          "min-h-14 w-full rounded-lg border font-semibold text-white transition-colors",
          "bg-red-500 border-red-600 hover:bg-red-600 active:bg-red-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {loadingStatus === "problem" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird aktualisiert...</span>
          </>
        ) : (
          "Problem"
        )}
      </button>
    </div>
  );
}
