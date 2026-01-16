'use client';

import { MainLayout } from '@/components/layout';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'abgeschlossene', name: 'Abgeschlossene', active: true, disabled: false },
  { id: 'zeitraum', name: 'Zeitraum-Analysen', active: false, disabled: true },
  { id: 'versand', name: 'Versand-Reports', active: false, disabled: true },
];

/**
 * Reports Page - Historical data and analytics
 *
 * Sub-navigation tabs:
 * - Abgeschlossene: Completed orders (istStatus='fertig' OR versandStatus='versendet')
 * - Zeitraum-Analysen: Time-period analysis (Phase 19)
 * - Versand-Reports: Shipping reports (Phase 20)
 */
export default function ReportsPage() {
  return (
    <MainLayout
      headerRight={
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <FileText className="w-4 h-4" />
          <span>Reports</span>
        </div>
      }
    >
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ghl-text">Reports</h1>
          <p className="text-sm text-ghl-text-secondary mt-1">
            Historische Daten und Analysen
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-neutral-200 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              disabled={tab.disabled}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-t-md",
                tab.active
                  ? "bg-ghl-blue/10 text-ghl-blue"
                  : tab.disabled
                  ? "text-neutral-400 cursor-not-allowed"
                  : "text-ghl-text-secondary hover:text-ghl-text hover:bg-gray-100"
              )}
            >
              {tab.name}
              {tab.disabled && (
                <span className="ml-1 text-xs text-neutral-400">(Demnachst)</span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <p className="text-neutral-500">Tabelle wird geladen...</p>
        </div>
      </div>
    </MainLayout>
  );
}
