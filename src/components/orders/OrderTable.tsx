'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

interface Kunde {
  id: number;
  name: string | null;
  firma: string | null;
}

interface Order {
  auftragsnummer: string;
  kunde: Kunde | null;
  produkttyp: string | null;
  liefertermin: string | null;
  status: string;
  computedStatus: string;
  _count: {
    arbeitsgaenge: number;
  };
}

interface OrderTableProps {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export function OrderTable({ orders, total, page, totalPages }: OrderTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get('sortBy') || 'liefertermin';
  const currentSortOrder = searchParams.get('sortOrder') || 'asc';

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSortBy === column) {
      params.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sortBy', column);
      params.set('sortOrder', 'asc');
    }
    params.set('page', '1');
    router.push(`/orders?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/orders?${params.toString()}`);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (currentSortBy !== column) return null;
    return currentSortOrder === 'asc' ? (
      <ChevronUp className="inline h-4 w-4" />
    ) : (
      <ChevronDown className="inline h-4 w-4" />
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '–';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
    } catch {
      return '–';
    }
  };

  const getKundenName = (kunde: Kunde | null) => {
    if (!kunde) return '–';
    return kunde.firma || kunde.name || '–';
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === 'aktiv';
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-capacity-green/10 text-capacity-green'
            : 'bg-neutral-100 text-neutral-500'
        }`}
      >
        {isActive ? 'Aktiv' : 'Abgeschlossen'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-neutral-50"
              onClick={() => handleSort('auftragsnummer')}
            >
              Auftragsnr. <SortIcon column="auftragsnummer" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-neutral-50"
              onClick={() => handleSort('kunde')}
            >
              Kunde <SortIcon column="kunde" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-neutral-50"
              onClick={() => handleSort('produkttyp')}
            >
              Produkt <SortIcon column="produkttyp" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-neutral-50"
              onClick={() => handleSort('liefertermin')}
            >
              Liefertermin <SortIcon column="liefertermin" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-neutral-50"
              onClick={() => handleSort('status')}
            >
              Status <SortIcon column="status" />
            </TableHead>
            <TableHead className="text-right">Aktion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                Keine Aufträge gefunden
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.auftragsnummer} className="hover:bg-neutral-50">
                <TableCell className="font-medium">{order.auftragsnummer}</TableCell>
                <TableCell>{getKundenName(order.kunde)}</TableCell>
                <TableCell>{order.produkttyp || '–'}</TableCell>
                <TableCell>{formatDate(order.liefertermin)}</TableCell>
                <TableCell>{getStatusBadge(order.computedStatus)}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/orders/${order.auftragsnummer}`}>
                    <Button variant="ghost" size="sm" className="text-xpress-blue hover:text-xpress-blue-light">
                      Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
          <p className="text-sm text-neutral-500">
            {total} Aufträge, Seite {page} von {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
