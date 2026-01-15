'use client';

import { useState, useRef } from 'react';
import { MobileLayout } from '@/components/layout';
import { OrderSearch, OrderDetails, type OrderSearchResult } from '@/components/status';

export default function StatusPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderSearchResult | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleOrderSelect = (order: OrderSearchResult) => {
    setSelectedOrder(order);
  };

  const handleClear = () => {
    setSelectedOrder(null);
    // Re-focus search input after clearing
    const input = searchRef.current?.querySelector('input');
    if (input) {
      input.focus();
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-4">
        {/* Order Search */}
        <div ref={searchRef}>
          <OrderSearch onSelect={handleOrderSelect} />
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <OrderDetails order={selectedOrder} onClear={handleClear} />
        )}
      </div>
    </MobileLayout>
  );
}
