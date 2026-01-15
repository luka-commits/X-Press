"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * VersandStatus type matching VersandStatus enum from Prisma schema.
 * Used for type-safe status updates.
 */
export type VersandStatusType = "offen" | "versandbereit" | "versendet";

interface VersandStatusButtonsProps {
  orderId: string;
  onStatusChange: (status: VersandStatusType, comment?: string) => Promise<void>;
  disabled?: boolean;
  loadingStatus?: VersandStatusType | null;
  className?: string;
}

/**
 * VersandStatusButtons Component - Mobile Status-Updates for Versand-Team
 *
 * 2 large, mobile-friendly buttons for quick versand status updates:
 * - "Versandbereit" (versandbereit) - Amber accent
 * - "Versendet" (versendet) - Green/success
 *
 * Features:
 * - Large touch targets (min-h-14 = 56px) for mobile usability
 * - Full width buttons stacked vertically with gap-3
 * - Loading spinner on active button during API call
 * - Disabled state prevents double-clicks
 * - Optional comment textarea (simpler than StatusButtons - no required comment)
 */
export function VersandStatusButtons({
  orderId,
  onStatusChange,
  disabled = false,
  loadingStatus = null,
  className,
}: VersandStatusButtonsProps) {
  const isLoading = loadingStatus !== null;
  const [comment, setComment] = useState("");

  const handleClick = async (status: VersandStatusType) => {
    if (disabled || isLoading) return;
    await onStatusChange(status, comment.trim() || undefined);
    setComment(""); // Clear comment after submission
  };

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      role="group"
      aria-label={`Versand-Status-Update für Auftrag ${orderId}`}
    >
      {/* Versandbereit - Amber */}
      <button
        onClick={() => handleClick("versandbereit")}
        disabled={disabled || isLoading}
        className={cn(
          "min-h-14 w-full rounded-lg border font-semibold text-white transition-colors",
          "bg-amber-500 border-amber-600 hover:bg-amber-600 active:bg-amber-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {loadingStatus === "versandbereit" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird aktualisiert...</span>
          </>
        ) : (
          "Versandbereit"
        )}
      </button>

      {/* Versendet - Green */}
      <button
        onClick={() => handleClick("versendet")}
        disabled={disabled || isLoading}
        className={cn(
          "min-h-14 w-full rounded-lg border font-semibold text-white transition-colors",
          "bg-green-500 border-green-600 hover:bg-green-600 active:bg-green-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {loadingStatus === "versendet" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird aktualisiert...</span>
          </>
        ) : (
          "Versendet"
        )}
      </button>

      {/* Optional comment textarea */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Kommentar (optional)"
        disabled={disabled || isLoading}
        rows={2}
        className={cn(
          "w-full rounded-lg border px-4 py-3 text-sm resize-none transition-all",
          "bg-ghl-card border-ghl-border text-white placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      />
    </div>
  );
}
