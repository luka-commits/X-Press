/**
 * useOrderFormatter Hook
 *
 * Shared formatting utilities for orders across the application.
 * Reduces code duplication for date formatting and status badge logic.
 */

import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface StatusBadgeConfig {
  label: string;
  className: string;
}

/**
 * Format a date string to German format (dd.MM.yyyy)
 * Returns '–' for null/invalid dates
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '–';
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  } catch {
    return '–';
  }
}

/**
 * Format a date with time (dd.MM.yyyy HH:mm)
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '–';
  try {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
  } catch {
    return '–';
  }
}

/**
 * Get status badge configuration based on istStatus and versandStatus
 * Priority: problem > versendet > versandbereit > fertig > in_produktion > offen
 */
export function getStatusBadge(
  istStatus: string | null | undefined,
  versandStatus: string | null | undefined
): StatusBadgeConfig {
  // Problem - highest priority
  if (istStatus === 'problem') {
    return {
      label: 'Problem',
      className: 'bg-red-100 text-red-700 border-red-200',
    };
  }

  // Versendet
  if (versandStatus === 'versendet') {
    return {
      label: 'Versendet',
      className: 'bg-green-100 text-green-700 border-green-200',
    };
  }

  // Versandbereit
  if (versandStatus === 'versandbereit') {
    return {
      label: 'Versandbereit',
      className: 'bg-blue-100 text-blue-700 border-blue-200',
    };
  }

  // Fertig (production complete)
  if (istStatus === 'fertig') {
    return {
      label: 'Fertig',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
  }

  // In Produktion
  if (istStatus === 'in_produktion') {
    return {
      label: 'In Produktion',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    };
  }

  // Default: Offen
  return {
    label: 'Offen',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };
}

/**
 * Get the pipeline stage from order status
 * Used for stage filtering and funnel visualization
 */
export function getPipelineStage(
  istStatus: string | null | undefined,
  versandStatus: string | null | undefined
): 'problem' | 'versendet' | 'versandbereit' | 'fertig' | 'in_produktion' | 'offen' {
  if (istStatus === 'problem') return 'problem';
  if (versandStatus === 'versendet') return 'versendet';
  if (versandStatus === 'versandbereit') return 'versandbereit';
  if (istStatus === 'fertig') return 'fertig';
  if (istStatus === 'in_produktion') return 'in_produktion';
  return 'offen';
}

/**
 * Custom hook that provides all order formatting utilities
 * Use this in React components for consistent formatting
 */
export function useOrderFormatter() {
  return {
    formatDate,
    formatDateTime,
    getStatusBadge,
    getPipelineStage,
  };
}

export default useOrderFormatter;
