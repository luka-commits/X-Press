'use client';

/**
 * Dashboard Client Component
 *
 * Handles auto-refresh and manual refresh functionality.
 * Uses the useDashboardRefresh hook for state management.
 */

import { RefreshCw, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useDashboardRefresh } from '@/hooks';

interface DashboardClientProps {
  lastUpdated: string;
}

export function DashboardClient({ lastUpdated }: DashboardClientProps) {
  const { isRefreshing, showSuccess, countdownText, handleRefresh } = useDashboardRefresh();

  return (
    <div className="flex items-center gap-4 text-sm text-neutral-500">
      <span className="transition-opacity duration-300">Aktualisiert: {lastUpdated}</span>
      <span className="text-neutral-400">|</span>
      <span>Nächste Aktualisierung in {countdownText}</span>
      <Button
        variant={showSuccess ? 'default' : 'outline'}
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`ml-2 transition-all duration-300 ${
          showSuccess
            ? 'bg-capacity-green hover:bg-capacity-green/90 text-white border-capacity-green'
            : ''
        }`}
      >
        {showSuccess ? (
          <>
            <Check className="w-4 h-4 mr-1.5" />
            Aktualisiert
          </>
        ) : (
          <>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </>
        )}
      </Button>
    </div>
  );
}
