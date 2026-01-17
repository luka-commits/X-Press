'use client';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * VersandStatus type matching VersandStatus enum from Prisma schema.
 * Used for type-safe status updates.
 */
export type VersandStatusType = 'offen' | 'versandbereit' | 'versendet';

interface VersandStatusButtonsProps {
  orderId: string;
  onStatusChange: (status: VersandStatusType, comment?: string) => Promise<void>;
  disabled?: boolean;
  loadingStatus?: VersandStatusType | null;
  className?: string;
}

/**
 * VersandStatusButtons Component - Compact inline buttons for versand status updates
 *
 * 2 buttons side-by-side for quick versand status updates:
 * - "Versandbereit" (versandbereit) - Amber
 * - "Versendet" (versendet) - Green
 *
 * Features:
 * - Compact inline layout matching dashboard style
 * - Loading spinner on active button during API call
 * - Disabled state prevents double-clicks
 */
export function VersandStatusButtons({
  orderId,
  onStatusChange,
  disabled = false,
  loadingStatus = null,
  className,
}: VersandStatusButtonsProps) {
  const isLoading = loadingStatus !== null;

  const handleClick = async (status: VersandStatusType) => {
    if (disabled || isLoading) return;
    await onStatusChange(status);
  };

  return (
    <div
      className={cn('flex gap-2', className)}
      role="group"
      aria-label={`Versand-Status-Update für Auftrag ${orderId}`}
    >
      {/* Versandbereit - Amber */}
      <button
        onClick={() => handleClick('versandbereit')}
        disabled={disabled || isLoading}
        className={cn(
          'flex-1 py-2.5 px-4 rounded-lg border font-medium transition-colors',
          'bg-amber-500 border-amber-500 text-white hover:bg-amber-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2 text-sm'
        )}
      >
        {loadingStatus === 'versandbereit' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>...</span>
          </>
        ) : (
          'Versandbereit'
        )}
      </button>

      {/* Versendet - Green */}
      <button
        onClick={() => handleClick('versendet')}
        disabled={disabled || isLoading}
        className={cn(
          'flex-1 py-2.5 px-4 rounded-lg border font-medium transition-colors',
          'bg-green-500 border-green-500 text-white hover:bg-green-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2 text-sm'
        )}
      >
        {loadingStatus === 'versendet' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>...</span>
          </>
        ) : (
          'Versendet'
        )}
      </button>
    </div>
  );
}
