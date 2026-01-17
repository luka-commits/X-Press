'use client';

/**
 * PipelineDashboard Component
 *
 * Consolidated Pipeline Analytics dashboard combining:
 * - SnapshotKPIs (current state, independent of date range)
 * - PipelineFunnel (throughput in period)
 * - PipelineKPIs (period metrics with comparison)
 * - VolumeChart + PlzChart (side by side)
 * - CompletedOrdersTable (collapsible)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DateRangePicker, type DateRange } from './DateRangePicker';
import { SnapshotKPIs } from './SnapshotKPIs';
import { PipelineFunnel } from './PipelineFunnel';
import { PipelineKPIs } from './PipelineKPIs';
import { VolumeChart, type VolumeData } from './VolumeChart';
import { PlzChart, type PlzData } from './PlzChart';
import { CompletedOrdersTable } from './CompletedOrdersTable';
import { cn } from '@/lib/utils';

interface ThroughputStage {
  count: number;
  prevCount: number;
  changePercent: number;
}

interface ThroughputData {
  eingang: ThroughputStage;
  produktion: ThroughputStage;
  versandbereit: ThroughputStage;
  versendet: ThroughputStage;
}

interface SnapshotData {
  aktiveAuftraege: number;
  problemAuftraege: number;
  aeltesterAuftrag: number | null;
  morgenFaellig: number;
}

interface PeriodKpis {
  avgDaysToShip: number | null;
  onTimePercent: number;
  totalShipped: number;
}

interface PipelineData {
  throughput: ThroughputData;
  snapshot: SnapshotData;
  periodKpis: PeriodKpis;
  prevPeriodKpis: PeriodKpis;
}

export function PipelineDashboard() {
  // Date range state (default last 30 days)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
  });

  // Data states
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [plzData, setPlzData] = useState<PlzData[]>([]);

  // Loading states
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [volumeLoading, setVolumeLoading] = useState(true);
  const [plzLoading, setPlzLoading] = useState(true);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Collapsible state for completed orders
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // Track if snapshot has been fetched
  const snapshotFetchedRef = useRef(false);
  const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);

  // Fetch pipeline data (throughput + period KPIs) when dateRange changes
  const fetchPipelineData = useCallback(async (range: DateRange) => {
    setPipelineLoading(true);
    setError(null);

    try {
      const fromISO = format(range.from, 'yyyy-MM-dd');
      const toISO = format(range.to, 'yyyy-MM-dd');

      const response = await fetch(`/api/reports/pipeline?from=${fromISO}&to=${toISO}`);

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Pipeline-Daten');
      }

      const result = await response.json();
      setPipelineData(result);

      // Update snapshot data from pipeline response (only once or always?)
      // Snapshot is independent but we get it from pipeline API for efficiency
      if (!snapshotFetchedRef.current) {
        setSnapshotData(result.snapshot);
        setSnapshotLoading(false);
        snapshotFetchedRef.current = true;
      }
    } catch (err) {
      console.error('Pipeline fetch error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setPipelineLoading(false);
    }
  }, []);

  // Fetch volume chart data
  const fetchVolumeData = useCallback(async (range: DateRange) => {
    setVolumeLoading(true);

    try {
      const fromISO = format(range.from, 'yyyy-MM-dd');
      const toISO = format(range.to, 'yyyy-MM-dd');

      const response = await fetch(`/api/reports/analytics?from=${fromISO}&to=${toISO}`);

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Volumendaten');
      }

      const result = await response.json();
      setVolumeData(result.data || []);
    } catch (err) {
      console.error('Volume fetch error:', err);
      setVolumeData([]);
    } finally {
      setVolumeLoading(false);
    }
  }, []);

  // Fetch PLZ chart data
  const fetchPlzData = useCallback(async (range: DateRange) => {
    setPlzLoading(true);

    try {
      const fromISO = format(range.from, 'yyyy-MM-dd');
      const toISO = format(range.to, 'yyyy-MM-dd');

      const response = await fetch(`/api/reports/versand?from=${fromISO}&to=${toISO}`);

      if (!response.ok) {
        throw new Error('Fehler beim Laden der PLZ-Daten');
      }

      const result = await response.json();
      setPlzData(result.plzDistribution || []);
    } catch (err) {
      console.error('PLZ fetch error:', err);
      setPlzData([]);
    } finally {
      setPlzLoading(false);
    }
  }, []);

  // Fetch all data when dateRange changes
  useEffect(() => {
    if (dateRange) {
      fetchPipelineData(dateRange);
      fetchVolumeData(dateRange);
      fetchPlzData(dateRange);
    }
  }, [dateRange, fetchPipelineData, fetchVolumeData, fetchPlzData]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-6">
      {/* Header row with DateRangePicker */}
      <div className="flex justify-end">
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 1. Snapshot KPIs - Current state (independent of date range) */}
      <SnapshotKPIs
        data={snapshotData}
        loading={snapshotLoading}
      />

      {/* Divider */}
      <div className="border-t border-neutral-200" />

      {/* 2. Pipeline Funnel - Throughput in period */}
      <PipelineFunnel
        data={pipelineData?.throughput ?? null}
        loading={pipelineLoading}
      />

      {/* 3. Pipeline KPIs - Period metrics with comparison */}
      <PipelineKPIs
        kpis={pipelineData?.periodKpis ?? null}
        prevPeriod={pipelineData?.prevPeriodKpis ?? null}
        loading={pipelineLoading}
      />

      {/* 4. Two-column row: VolumeChart + PlzChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <h3 className="font-semibold text-ghl-text mb-1">Auftragsvolumen</h3>
          <p className="text-sm text-neutral-500 mb-4">Abgeschlossene Aufträge pro Tag</p>
          <VolumeChart data={volumeData} loading={volumeLoading} />
        </div>

        {/* PLZ Distribution */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <h3 className="font-semibold text-ghl-text mb-1">PLZ-Verteilung</h3>
          <p className="text-sm text-neutral-500 mb-4">Top 10 Lieferregionen nach PLZ-Bereich</p>
          <PlzChart data={plzData} loading={plzLoading} />
        </div>
      </div>

      {/* 5. Collapsible section: Completed Orders Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {/* Collapsible header */}
        <button
          onClick={() => setIsTableExpanded(!isTableExpanded)}
          className={cn(
            'w-full flex items-center justify-between p-4 text-left',
            'hover:bg-neutral-50 transition-colors'
          )}
        >
          <div>
            <h3 className="font-semibold text-ghl-text">Abgeschlossene Aufträge</h3>
            <p className="text-sm text-neutral-500">
              Alle versendeten Aufträge mit Details
            </p>
          </div>
          {isTableExpanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          )}
        </button>

        {/* Collapsible content */}
        {isTableExpanded && (
          <div className="border-t border-neutral-200">
            <CompletedOrdersTable />
          </div>
        )}
      </div>
    </div>
  );
}
