'use client';

import { useState, useRef } from 'react';
import { MobileLayout } from '@/components/layout';
import { OrderSearch, OrderDetails, StatusButtons, type OrderSearchResult, type IstStatusType } from '@/components/status';

export default function StatusPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderSearchResult | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<IstStatusType | null>(null);
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

  /**
   * Handle status change - calls PATCH /api/orders/[id]/status
   * Plan 06-02 will add proper feedback UI (toast notifications, etc.)
   */
  const handleStatusChange = async (status: IstStatusType) => {
    if (!selectedOrder) return;

    setLoadingStatus(status);
    try {
      const response = await fetch(`/api/orders/${selectedOrder.auftragsnummer}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ istStatus: status }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Status updated successfully:', result);
        // Plan 06-02 will add proper success feedback
      } else {
        const error = await response.json();
        console.error('Status update failed:', error);
        // Plan 06-02 will add proper error feedback
      }
    } catch (error) {
      console.error('Status update error:', error);
      // Plan 06-02 will add proper error feedback
    } finally {
      setLoadingStatus(null);
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

        {/* Status Update Buttons */}
        {selectedOrder && (
          <StatusButtons
            orderId={selectedOrder.auftragsnummer}
            onStatusChange={handleStatusChange}
            loadingStatus={loadingStatus}
            disabled={loadingStatus !== null}
          />
        )}
      </div>
    </MobileLayout>
  );
}
