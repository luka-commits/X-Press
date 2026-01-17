'use client';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  istStatus: 'in_produktion' | 'fertig' | 'problem' | null;
  versandStatus: 'offen' | 'versandbereit' | 'versendet' | null;
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

  const getPipelineBadge = (order: Order) => {
    // Problem überschreibt alles
    if (order.istStatus === 'problem') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-capacity-red/10 text-capacity-red">
          ⚠ Problem
        </span>
      );
    }

    // Versand-Phasen (spätere Pipeline-Stufen)
    if (order.versandStatus === 'versendet') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          ✓ Versendet
        </span>
      );
    }

    if (order.versandStatus === 'versandbereit') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          Versandbereit
        </span>
      );
    }

    // Produktions-Phasen
    if (order.istStatus === 'fertig') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-capacity-green/10 text-capacity-green">
          Fertig
        </span>
      );
    }

    if (order.istStatus === 'in_produktion') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          In Produktion
        </span>
      );
    }

    // Default: Offen (noch nichts gestartet)
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500">
        Offen
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
              onClick={() => handleSort('pipeline')}
            >
              Pipeline <SortIcon column="pipeline" />
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
                <TableCell>{getPipelineBadge(order)}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/orders/${order.auftragsnummer}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-ghl-blue hover:text-ghl-blue-hover"
                    >
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
