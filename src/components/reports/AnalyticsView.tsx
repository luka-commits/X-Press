'use client';

/**
 * AnalyticsView Component
 *
 * Analytics dashboard showing order volume trends over time.
 * Includes DateRangePicker for selecting time period and VolumeChart for visualization.
 */

import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

import { DateRangePicker, type DateRange } from './DateRangePicker';
import { VolumeChart, type VolumeData } from './VolumeChart';

export function AnalyticsView() {
  // Default to last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
  });
  const [data, setData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      const fromISO = format(range.from, 'yyyy-MM-dd');
      const toISO = format(range.to, 'yyyy-MM-dd');

      const response = await fetch(`/api/reports/analytics?from=${fromISO}&to=${toISO}`);

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Daten');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when dateRange changes
  useEffect(() => {
    if (dateRange) {
      fetchData(dateRange);
    }
  }, [dateRange, fetchData]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-6">
      {/* Header row with DateRangePicker */}
      <div className="flex justify-end">
        <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Chart card */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="font-semibold text-ghl-text mb-1">Auftragsvolumen</h3>
        <p className="text-sm text-neutral-500 mb-4">Abgeschlossene Auftrage pro Tag</p>
        <VolumeChart data={data} loading={loading} />
      </div>
    </div>
  );
}
