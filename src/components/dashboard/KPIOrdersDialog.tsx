'use client';

/**
 * KPI Orders Dialog Component
 *
 * Dialog that displays orders for a specific KPI type (total or critical).
 * Fetches data from /api/dashboard/kpi-orders when opened.
 */

import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface KPIOrder {
  auftragsnummer: string;
  kunde: string;
  produkttyp: string | null;
  liefertermin: string | null;
  tageUebrig: number;
}

interface KPIOrdersResponse {
  type: 'total' | 'critical' | 'overdue' | 'problem';
  orders: KPIOrder[];
  count: number;
  date: string;
}

interface KPIOrdersDialogProps {
  kpiType: 'total' | 'critical' | 'overdue' | 'problem';
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KPIOrdersDialog({ kpiType, title, isOpen, onOpenChange }: KPIOrdersDialogProps) {
  const [orders, setOrders] = useState<KPIOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);

      fetch(`/api/dashboard/kpi-orders?type=${kpiType}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Fehler beim Laden der Aufträge');
          }
          return res.json();
        })
        .then((data: KPIOrdersResponse) => {
          setOrders(data.orders);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [isOpen, kpiType]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-neutral-500">Lädt...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-capacity-red">{error}</div>
            </div>
          )}

          {!isLoading && !error && orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-capacity-green font-medium">Keine Aufträge</p>
              <p className="text-neutral-500 text-sm mt-1">
                Für diesen KPI gibt es derzeit keine Aufträge.
              </p>
            </div>
          )}

          {!isLoading && !error && orders.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ghl-border">
                  <th className="text-left py-2 px-3 font-medium text-ghl-text-secondary">
                    Auftrag
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-ghl-text-secondary">Kunde</th>
                  <th className="text-left py-2 px-3 font-medium text-ghl-text-secondary">
                    Produkttyp
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-ghl-text-secondary">
                    Liefertermin
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-ghl-text-secondary">
                    Tage übrig
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.auftragsnummer}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 px-3">
                      <Link
                        href={`/orders/${order.auftragsnummer}`}
                        className="text-ghl-blue hover:underline font-medium"
                      >
                        {order.auftragsnummer}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-ghl-text">{order.kunde}</td>
                    <td className="py-2 px-3 text-ghl-text">{order.produkttyp || '–'}</td>
                    <td className="py-2 px-3 text-ghl-text">
                      {order.liefertermin
                        ? format(new Date(order.liefertermin), 'dd.MM.yyyy', {
                            locale: de,
                          })
                        : '–'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-8 h-6 rounded text-xs font-medium',
                          order.tageUebrig <= 0
                            ? 'bg-capacity-red text-white'
                            : order.tageUebrig === 1
                              ? 'bg-capacity-yellow text-white'
                              : 'bg-capacity-green text-white'
                        )}
                      >
                        {order.tageUebrig}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
