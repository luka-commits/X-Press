'use client';

import { Loader2, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';

/**
 * Status type matching IstStatus enum from Prisma schema.
 * Used for type-safe status updates.
 */
export type IstStatusType = 'in_produktion' | 'fertig' | 'problem';

interface StatusButtonsProps {
  orderId: string;
  onStatusChange: (status: IstStatusType, comment?: string) => Promise<void>;
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
 * - "Problem" (problem) - Red/warning - REQUIRES comment
 *
 * Features:
 * - Large touch targets (min-h-14 = 56px) for mobile usability
 * - Full width buttons stacked vertically with gap-3
 * - Loading spinner on active button during API call
 * - Disabled state prevents double-clicks
 * - Comment textarea: optional for normal statuses, required for "Problem"
 * - Validation error shown when "Problem" clicked without comment
 * - Comment clears after successful submission
 */
export function StatusButtons({
  orderId,
  onStatusChange,
  disabled = false,
  loadingStatus = null,
  className,
}: StatusButtonsProps) {
  const isLoading = loadingStatus !== null;
  const [comment, setComment] = useState('');
  const [pendingStatus, setPendingStatus] = useState<IstStatusType | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shakeTextarea, setShakeTextarea] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus and expand textarea when "Problem" is clicked without comment
  // Also trigger shake animation for better visual feedback
  useEffect(() => {
    if (pendingStatus === 'problem' && validationError) {
      textareaRef.current?.focus();
      // Trigger shake animation
      setShakeTextarea(true);
      const timer = setTimeout(() => setShakeTextarea(false), 500);
      return () => clearTimeout(timer);
    }
  }, [pendingStatus, validationError]);

  // Clear comment after successful submit (when loading ends)
  useEffect(() => {
    if (loadingStatus === null && pendingStatus !== null) {
      // Loading finished, clear everything
      setComment('');
      setPendingStatus(null);
      setValidationError(null);
    }
  }, [loadingStatus, pendingStatus]);

  const handleClick = async (status: IstStatusType) => {
    if (disabled || isLoading) return;

    // Clear previous validation error
    setValidationError(null);

    // Require comment for "Problem" status
    if (status === 'problem' && !comment.trim()) {
      setPendingStatus('problem');
      setValidationError('Bitte beschreiben Sie das Problem');
      return;
    }

    setPendingStatus(status);
    await onStatusChange(status, comment.trim() || undefined);
  };

  const isProblemPending = pendingStatus === 'problem' && validationError;

  return (
    <div
      className={cn('flex flex-col gap-3', className)}
      role="group"
      aria-label={`Status-Update für Auftrag ${orderId}`}
    >
      {/* In Produktion - Blue */}
      <button
        onClick={() => handleClick('in_produktion')}
        disabled={disabled || isLoading}
        className={cn(
          'min-h-14 w-full rounded-lg border font-semibold text-white transition-colors',
          'bg-blue-500 border-blue-600 hover:bg-blue-600 active:bg-blue-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {loadingStatus === 'in_produktion' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird aktualisiert...</span>
          </>
        ) : (
          'In Produktion'
        )}
      </button>

      {/* Fertig - Green */}
      <button
        onClick={() => handleClick('fertig')}
        disabled={disabled || isLoading}
        className={cn(
          'min-h-14 w-full rounded-lg border font-semibold text-white transition-colors',
          'bg-green-500 border-green-600 hover:bg-green-600 active:bg-green-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {loadingStatus === 'fertig' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird aktualisiert...</span>
          </>
        ) : (
          'Fertig'
        )}
      </button>

      {/* Problem - Red */}
      <button
        onClick={() => handleClick('problem')}
        disabled={disabled || isLoading}
        className={cn(
          'min-h-14 w-full rounded-lg border font-semibold text-white transition-colors',
          'bg-red-500 border-red-600 hover:bg-red-600 active:bg-red-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {loadingStatus === 'problem' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Wird aktualisiert...</span>
          </>
        ) : (
          'Problem'
        )}
      </button>

      {/* Comment textarea with validation error */}
      <div className="relative">
        {/* Validation error banner - displayed prominently above textarea */}
        {validationError && (
          <div
            className="mb-2 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{validationError}</span>
          </div>
        )}

        {/* Label for textarea when Problem validation fails */}
        {isProblemPending && (
          <label className="block mb-1.5 text-sm font-semibold text-red-400">
            Problembeschreibung erforderlich *
          </label>
        )}

        <textarea
          ref={textareaRef}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            // Clear validation error when user starts typing
            if (validationError) setValidationError(null);
          }}
          placeholder={
            isProblemPending
              ? 'Was ist das Problem? Bitte hier beschreiben...'
              : 'Kommentar (optional)'
          }
          disabled={disabled || isLoading}
          rows={isProblemPending ? 3 : 2}
          className={cn(
            'w-full rounded-lg border px-4 py-3 text-sm resize-none transition-all',
            'bg-ghl-card border-ghl-border text-white placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isProblemPending && 'border-red-500 ring-2 ring-red-500/50 placeholder:text-red-400/70',
            shakeTextarea && 'animate-shake'
          )}
        />
      </div>
    </div>
  );
}
