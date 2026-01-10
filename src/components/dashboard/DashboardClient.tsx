'use client';

/**
 * Dashboard Client Component
 *
 * Handles auto-refresh and manual refresh functionality
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardClientProps {
  lastUpdated: string;
}

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function DashboardClient({ lastUpdated }: DashboardClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL / 1000);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    router.refresh();
    // Reset countdown
    setCountdown(AUTO_REFRESH_INTERVAL / 1000);
    // Reset isRefreshing after a short delay
    setTimeout(() => setIsRefreshing(false), 500);
  }, [router]);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return AUTO_REFRESH_INTERVAL / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleRefresh]);

  // Format countdown
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const countdownText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-4 text-sm text-neutral-500">
      <span>
        Aktualisiert: {lastUpdated}
      </span>
      <span className="text-neutral-400">|</span>
      <span>
        Nächste Aktualisierung in {countdownText}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="ml-2"
      >
        <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        Aktualisieren
      </Button>
    </div>
  );
}
