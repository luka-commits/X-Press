/**
 * Soon Due Orders List Component
 *
 * Zeigt Aufträge mit geplantem Liefertermin ≤ 2 Tage (SOLL-Daten)
 */

import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CriticalOrder } from '@/lib/dashboard-queries';
import { cn } from '@/lib/utils';

interface CriticalOrdersListProps {
  orders: CriticalOrder[];
}

export function CriticalOrdersList({ orders }: CriticalOrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h2 className="text-lg font-semibold text-ghl-text mb-4">Bald fällig</h2>
        <div className="text-center py-8">
          <p className="text-capacity-green font-medium">Keine Aufträge bald fällig</p>
          <p className="text-neutral-500 text-sm mt-1">Alles im grünen Bereich!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-ghl-border shadow-sm">
      <h2 className="text-lg font-semibold text-ghl-text mb-4">
        Bald fällig ({orders.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ghl-border">
              <th className="text-left py-2 px-3 font-medium text-ghl-text-secondary">Auftrag</th>
              <th className="text-left py-2 px-3 font-medium text-ghl-text-secondary">Kunde</th>
              <th className="text-left py-2 px-3 font-medium text-ghl-text-secondary">Liefertermin</th>
              <th className="text-right py-2 px-3 font-medium text-ghl-text-secondary">Tage</th>
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
                <td className="py-2 px-3 text-ghl-text">
                  {order.liefertermin
                    ? format(new Date(order.liefertermin), 'dd.MM.yyyy', { locale: de })
                    : '–'}
                </td>
                <td className="py-2 px-3 text-right">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-8 h-6 rounded text-xs font-medium',
                      order.tageUebrig === 0
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
      </div>
    </div>
  );
}
