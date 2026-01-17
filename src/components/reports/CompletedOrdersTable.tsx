'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

interface Kunde {
  name: string | null;
  firma: string | null;
}

interface CompletedOrder {
  auftragsnummer: string;
  kunde: Kunde | null;
  produkttyp: string | null;
  liefertermin: string | null;
  istStatus: string | null;
  versandStatus: string | null;
  completedAt: string | null;
}

interface APIResponse {
  orders: CompletedOrder[];
  total: number;
  page: number;
  totalPages: number;
}

interface CompletedOrdersTableProps {
  dateRange?: DateRange;
}

/**
 * CompletedOrdersTable - Table component for completed orders
 *
 * Displays orders with istStatus='fertig' OR versandStatus='versendet'
 * Includes pagination and status badges
 * Optionally filters by date range
 */
export function CompletedOrdersTable({ dateRange }: CompletedOrdersTableProps) {
  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Reset page when dateRange changes
  useEffect(() => {
    setPage(1);
  }, [dateRange]);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);

      try {
        let url = `/api/reports/completed?page=${page}&pageSize=${pageSize}`;

        // Add date range parameters if provided
        if (dateRange) {
          const fromISO = format(dateRange.from, 'yyyy-MM-dd');
          const toISO = format(dateRange.to, 'yyyy-MM-dd');
          url += `&from=${fromISO}&to=${toISO}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Daten');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [page, dateRange]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
    } catch {
      return '-';
    }
  };

  const getKundenName = (kunde: Kunde | null) => {
    if (!kunde) return '-';
    return kunde.firma || kunde.name || '-';
  };

  const getStatusBadge = (istStatus: string | null, versandStatus: string | null) => {
    if (versandStatus === 'versendet') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-capacity-green/10 text-capacity-green">
          Versendet
        </span>
      );
    }
    if (istStatus === 'fertig') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-capacity-green/10 text-capacity-green">
          Fertig
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-400">
        -
      </span>
    );
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
        <p className="text-neutral-500">Laden...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
        <p className="text-capacity-red">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!data || data.orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
        <p className="text-neutral-500">Keine abgeschlossenen Auftrage gefunden</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Auftragsnr.</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Produkt</TableHead>
            <TableHead>Liefertermin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Abgeschlossen am</TableHead>
            <TableHead className="text-right">Aktion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.orders.map((order) => (
            <TableRow key={order.auftragsnummer} className="hover:bg-neutral-50">
              <TableCell className="font-medium">{order.auftragsnummer}</TableCell>
              <TableCell>{getKundenName(order.kunde)}</TableCell>
              <TableCell>{order.produkttyp || '-'}</TableCell>
              <TableCell>{formatDate(order.liefertermin)}</TableCell>
              <TableCell>{getStatusBadge(order.istStatus, order.versandStatus)}</TableCell>
              <TableCell>{formatDate(order.completedAt)}</TableCell>
              <TableCell className="text-right">
                <Link href={`/orders/${order.auftragsnummer}`}>
                  <Button variant="ghost" size="sm" className="text-ghl-blue hover:text-ghl-blue-hover">
                    Details <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
          <p className="text-sm text-neutral-500">
            {data.total} Auftrage, Seite {data.page} von {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Zuruck
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= data.totalPages}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
