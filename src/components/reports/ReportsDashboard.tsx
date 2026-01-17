'use client';

/**
 * ReportsDashboard Component
 *
 * Main reporting dashboard with global date range picker.
 * Combines:
 * - Current Pipeline Snapshot (FunnelChart + StageDistributionChart) - independent of date range
 * - Time-based Analytics (SnapshotKPIs, PipelineKPIs, Charts) - filtered by date range
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DateRangePicker, type DateRange } from './DateRangePicker';
import { FunnelChart } from './FunnelChart';
import { StageDistributionChart } from './StageDistributionChart';
import { SnapshotKPIs } from './SnapshotKPIs';
import { PipelineKPIs } from './PipelineKPIs';
import { ThroughputChart, type ThroughputData as TimeseriesDataPoint } from './ThroughputChart';
import { PlzChart, type PlzData } from './PlzChart';
import { CompletedOrdersTable } from './CompletedOrdersTable';
import { ReportsOrdersDialog } from './ReportsOrdersDialog';
import { cn } from '@/lib/utils';
import type { FunnelStage } from '@/lib/reporting-queries';

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
  snapshot: SnapshotData;
  periodKpis: PeriodKpis;
  prevPeriodKpis: PeriodKpis;
}

interface StageDistributionData {
  name: string;
  value: number;
  fill: string;
}

export function ReportsDashboard() {
  // Global date range state (default last 30 days)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
  });

  // Funnel / Stage Distribution (current snapshot, independent of date range)
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [stageDistribution, setStageDistribution] = useState<{ data: StageDistributionData[]; total: number }>({ data: [], total: 0 });
  const [funnelLoading, setFunnelLoading] = useState(true);

  // Pipeline data (time-based)
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesDataPoint[]>([]);
  const [plzData, setPlzData] = useState<PlzData[]>([]);

  // Loading states
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [timeseriesLoading, setTimeseriesLoading] = useState(true);
  const [plzLoading, setPlzLoading] = useState(true);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Collapsible state for completed orders
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // Dialog state for drilldown
  type StageType = 'offen' | 'in_produktion' | 'fertig' | 'versandbereit' | 'versendet' | 'problem';
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'problem' | 'oldest' | 'tomorrow' | 'stage';
    stage?: StageType;
    title: string;
  }>({
    isOpen: false,
    type: 'problem',
    title: '',
  });

  // Track if snapshot has been fetched
  const snapshotFetchedRef = useRef(false);
  const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);

  // Fetch funnel and stage distribution data (current snapshot, independent of date range)
  // Funnel: cumulative (stages show orders that REACHED that milestone)
  // Stage Distribution: exclusive (each order counted in only one stage)
  const fetchFunnelData = useCallback(async () => {
    setFunnelLoading(true);
    try {
      // Fetch both in parallel
      const [funnelResponse, stageResponse] = await Promise.all([
        fetch('/api/reports/funnel'),                     // cumulative (default)
        fetch('/api/reports/funnel?mode=exclusive'),      // exclusive for donut
      ]);

      if (!funnelResponse.ok) throw new Error('Fehler beim Laden der Funnel-Daten');
      if (!stageResponse.ok) throw new Error('Fehler beim Laden der Stage-Daten');

      const funnelResult = await funnelResponse.json();
      const stageResult = await stageResponse.json();

      setFunnelData(funnelResult.stages || []);
      setStageDistribution({ data: stageResult.stages || [], total: stageResult.totalValue || 0 });
    } catch (err) {
      console.error('Funnel fetch error:', err);
      setFunnelData([]);
    } finally {
      setFunnelLoading(false);
    }
  }, []);

  // Fetch funnel data once on mount
  useEffect(() => {
    fetchFunnelData();
  }, [fetchFunnelData]);

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

      // Update snapshot data from pipeline response (only first time)
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

  // Fetch timeseries chart data
  const fetchTimeseriesData = useCallback(async (range: DateRange) => {
    setTimeseriesLoading(true);

    try {
      const fromISO = format(range.from, 'yyyy-MM-dd');
      const toISO = format(range.to, 'yyyy-MM-dd');

      const response = await fetch(`/api/reports/timeseries?from=${fromISO}&to=${toISO}`);

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Zeitreihen-Daten');
      }

      const result = await response.json();
      setTimeseriesData(result || []);
    } catch (err) {
      console.error('Timeseries fetch error:', err);
      setTimeseriesData([]);
    } finally {
      setTimeseriesLoading(false);
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

  // Fetch all time-based data when dateRange changes
  useEffect(() => {
    if (dateRange) {
      fetchPipelineData(dateRange);
      fetchTimeseriesData(dateRange);
      fetchPlzData(dateRange);
    }
  }, [dateRange, fetchPipelineData, fetchTimeseriesData, fetchPlzData]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  // Handler for SnapshotKPIs click
  const handleKpiClick = (type: 'problem' | 'oldest' | 'tomorrow' | 'openOrders') => {
    // 'openOrders' maps to stage type with stage='offen'
    if (type === 'openOrders') {
      setDialogState({
        isOpen: true,
        type: 'stage',
        stage: 'offen',
        title: 'Offene Aufträge',
      });
      return;
    }

    const titles = {
      problem: 'Problem-Aufträge',
      oldest: 'Älteste Aufträge',
      tomorrow: 'Morgen fällig',
    };
    setDialogState({
      isOpen: true,
      type,
      title: titles[type],
    });
  };

  // Handler for PipelineKPIs click (shipped)
  const handlePipelineKpiClick = (type: 'shipped') => {
    if (type === 'shipped') {
      setDialogState({
        isOpen: true,
        type: 'stage',
        stage: 'versendet',
        title: 'Versendete Aufträge',
      });
    }
  };

  // Handler for FunnelChart and StageDistributionChart clicks
  const handleStageClick = (stageKey: string) => {
    const stageNames: Record<StageType, string> = {
      offen: 'Offen',
      in_produktion: 'In Produktion',
      fertig: 'Fertig',
      versandbereit: 'Versandbereit',
      versendet: 'Versendet',
      problem: 'Problem',
    };
    const stage = stageKey as StageType;
    setDialogState({
      isOpen: true,
      type: 'stage',
      stage,
      title: `Aufträge: ${stageNames[stage] || stageKey}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Global Header with DateRangePicker */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white border border-neutral-200 p-2 rounded-md shadow-sm">
              <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-ghl-text">Pipeline</h1>
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
            <button className="p-2.5 bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-500 hover:bg-neutral-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="px-4 py-2.5 bg-ghl-blue text-white rounded-md shadow-sm text-sm font-medium hover:bg-ghl-blue-hover flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Dashboard
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <button className="text-ghl-blue text-sm font-medium flex items-center gap-1 hover:text-ghl-blue-hover">
            <span>+</span> Quick Filters
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Section 1: Current Pipeline Snapshot */}
      <section className="space-y-4">
        {/* <h2 className="text-lg font-semibold text-ghl-text">Aktueller Pipeline-Stand</h2>  REMOVED HEADER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {funnelLoading ? (
            <>
              <div className="bg-white rounded-lg border border-neutral-200 p-6 h-80 animate-pulse" />
              <div className="bg-white rounded-lg border border-neutral-200 p-6 h-80 animate-pulse" />
            </>
          ) : (
            <>
              <FunnelChart data={funnelData} onStageClick={handleStageClick} />
              <StageDistributionChart
                data={stageDistribution.data}
                total={stageDistribution.total}
                onStageClick={handleStageClick}
              />
            </>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-neutral-200" />

      {/* Section 2: Time-based Analytics */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-ghl-text">Zeitraum-Analyse</h2>

        {/* Snapshot KPIs - Current state (independent of date range) */}
        <SnapshotKPIs
          data={snapshotData}
          loading={snapshotLoading}
          onKpiClick={handleKpiClick}
        />

        {/* Divider */}
        <div className="border-t border-neutral-200" />

        {/* Pipeline KPIs - Period metrics with comparison */}
        <PipelineKPIs
          kpis={pipelineData?.periodKpis ?? null}
          prevPeriod={pipelineData?.prevPeriodKpis ?? null}
          loading={pipelineLoading}
          onKpiClick={handlePipelineKpiClick}
        />

        {/* Two-column row: ThroughputChart + PlzChart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Throughput Chart (Eingang vs Versendet) */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="font-semibold text-ghl-text mb-1">Durchfluss Zeitreihe</h3>
            <p className="text-sm text-neutral-500 mb-4">Aufträge pro Tag: Eingang vs. Versendet</p>
            <ThroughputChart data={timeseriesData} loading={timeseriesLoading} />
          </div>

          {/* PLZ Distribution */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="font-semibold text-ghl-text mb-1">PLZ-Verteilung</h3>
            <p className="text-sm text-neutral-500 mb-4">Top 10 Lieferregionen nach PLZ-Bereich</p>
            <PlzChart data={plzData} loading={plzLoading} />
          </div>
        </div>

        {/* Collapsible section: Completed Orders Table */}
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
              <CompletedOrdersTable dateRange={dateRange} />
            </div>
          )}
        </div>
      </section>

      {/* Reports Orders Dialog for drilldowns */}
      <ReportsOrdersDialog
        kpiType={dialogState.type}
        stage={dialogState.stage}
        title={dialogState.title}
        isOpen={dialogState.isOpen}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, isOpen: open }))}
      />
    </div>
  );
}
