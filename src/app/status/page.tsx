'use client';

import { useState } from 'react';
import { MobileLayout } from '@/components/layout';
import { OrderSearch, type OrderSearchResult } from '@/components/status';
import { CheckCircle } from 'lucide-react';

export default function StatusPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderSearchResult | null>(null);

  const handleOrderSelect = (order: OrderSearchResult) => {
    setSelectedOrder(order);
  };

  return (
    <MobileLayout>
      <div className="space-y-4">
        {/* Order Search */}
        <OrderSearch onSelect={handleOrderSelect} />

        {/* Selected Order Confirmation (temporary - Phase 5 will replace with details) */}
        {selectedOrder && (
          <div className="bg-white rounded-lg border border-ghl-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-ghl-text">
                  Auftrag ausgewählt: {selectedOrder.auftragsnummer}
                </p>
                <p className="text-sm text-ghl-text-secondary">
                  {selectedOrder.kunde?.firma || selectedOrder.kunde?.name || 'Unbekannter Kunde'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
