'use client';

/**
 * VersandView Component
 *
 * Shipping analytics dashboard showing delivery performance metrics.
 * Includes KPI cards for on-time delivery, delays, and total shipments,
 * plus a PLZ distribution chart for regional analysis.
 */

import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { CheckCircle2, AlertTriangle, Package } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { DateRangePicker, type DateRange } from './DateRangePicker';
import { PlzChart, type PlzData } from './PlzChart';

interface DeliveryMetrics {
  total: number;
  onTime: number;
  late: number;
  onTimePercent: number;
  avgDelayDays: number;
}

interface VersandData {
  deliveryMetrics: DeliveryMetrics;
  plzDistribution: PlzData[];
}

export function VersandView() {
  // Default to last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
  });
  const [data, setData] = useState<VersandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      const fromISO = format(range.from, 'yyyy-MM-dd');
      const toISO = format(range.to, 'yyyy-MM-dd');

      const response = await fetch(`/api/reports/versand?from=${fromISO}&to=${toISO}`);

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Versanddaten');
      }

      const result = await response.json();
      setData({
        deliveryMetrics: result.deliveryMetrics,
        plzDistribution: result.plzDistribution || [],
      });
    } catch (err) {
      console.error('Versand fetch error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setData(null);
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Liefertreue (On-Time Delivery) */}
        <KpiCard
          title="Liefertreue"
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          loading={loading}
          value={data ? `${data.deliveryMetrics.onTimePercent}%` : '-'}
          subtext={
            data
              ? `${data.deliveryMetrics.onTime} von ${data.deliveryMetrics.onTime + data.deliveryMetrics.late} punktlich`
              : undefined
          }
          valueColor="text-green-600"
        />

        {/* Verspatungen (Delays) */}
        <KpiCard
          title="Verspatungen"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          loading={loading}
          value={data ? data.deliveryMetrics.late.toString() : '-'}
          subtext={
            data && data.deliveryMetrics.avgDelayDays > 0
              ? `Ø ${data.deliveryMetrics.avgDelayDays} Tage verspatet`
              : undefined
          }
          valueColor="text-amber-600"
        />

        {/* Versendungen (Total Shipments) */}
        <KpiCard
          title="Versendungen"
          icon={<Package className="w-5 h-5 text-blue-600" />}
          loading={loading}
          value={data ? data.deliveryMetrics.total.toString() : '-'}
          subtext="im Zeitraum"
          valueColor="text-ghl-text"
        />
      </div>

      {/* PLZ Distribution Chart */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="font-semibold text-ghl-text mb-1">PLZ-Verteilung</h3>
        <p className="text-sm text-neutral-500 mb-4">Top 10 Lieferregionen nach PLZ-Bereich</p>
        <PlzChart data={data?.plzDistribution || []} loading={loading} />
      </div>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  icon: React.ReactNode;
  loading: boolean;
  value: string;
  subtext?: string;
  valueColor?: string;
}

function KpiCard({
  title,
  icon,
  loading,
  value,
  subtext,
  valueColor = 'text-ghl-text',
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-neutral-200">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm font-medium text-neutral-600">{title}</span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          <span className="text-sm text-neutral-500">Lade...</span>
        </div>
      ) : (
        <>
          <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
          {subtext && <p className="text-sm text-neutral-500 mt-1">{subtext}</p>}
        </>
      )}
    </div>
  );
}
