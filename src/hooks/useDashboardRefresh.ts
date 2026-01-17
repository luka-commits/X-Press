/**
 * useDashboardRefresh Hook
 *
 * Handles auto-refresh and manual refresh functionality for dashboard pages.
 * Extracted from DashboardClient for reusability.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

interface UseDashboardRefreshOptions {
  /** Auto-refresh interval in milliseconds (default: 5 minutes) */
  intervalMs?: number;
  /** Callback to run after refresh completes */
  onRefresh?: () => void;
}

interface UseDashboardRefreshReturn {
  /** Whether a refresh is in progress */
  isRefreshing: boolean;
  /** Whether the last refresh was successful (shown briefly) */
  showSuccess: boolean;
  /** Countdown in seconds until next auto-refresh */
  countdown: number;
  /** Formatted countdown string (e.g., "4:32") */
  countdownText: string;
  /** Trigger a manual refresh */
  handleRefresh: () => void;
}

const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useDashboardRefresh(
  options: UseDashboardRefreshOptions = {}
): UseDashboardRefreshReturn {
  const { intervalMs = DEFAULT_INTERVAL, onRefresh } = options;

  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(intervalMs / 1000);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setShowSuccess(false);
    router.refresh();
    // Reset countdown
    setCountdown(intervalMs / 1000);
    // Show success state after refresh
    setTimeout(() => {
      setIsRefreshing(false);
      setShowSuccess(true);
      onRefresh?.();
      // Hide success after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    }, 500);
  }, [router, intervalMs, onRefresh]);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return intervalMs / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleRefresh, intervalMs]);

  // Format countdown as "M:SS"
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const countdownText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    isRefreshing,
    showSuccess,
    countdown,
    countdownText,
    handleRefresh,
  };
}

export default useDashboardRefresh;
