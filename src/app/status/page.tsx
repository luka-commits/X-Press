'use client';

import { Check, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { MobileLayout } from '@/components/layout';
import {
  OrderSearch,
  OrderDetails,
  StatusButtons,
  type OrderSearchResult,
  type IstStatusType,
} from '@/components/status';

/**
 * Feedback state for success/error messages
 */
interface Feedback {
  type: 'success' | 'error';
  message: string;
}

export default function StatusPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderSearchResult | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<IstStatusType | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss feedback after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

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
   * Includes optional comment parameter (required for "Problem" status)
   * Shows success/error feedback to user
   */
  const handleStatusChange = async (status: IstStatusType, comment?: string) => {
    if (!selectedOrder) return;

    // Clear any previous feedback
    setFeedback(null);
    setLoadingStatus(status);

    try {
      const response = await fetch(`/api/orders/${selectedOrder.auftragsnummer}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ istStatus: status, comment }),
      });

      if (response.ok) {
        // Success - show feedback, keep order selected for potential next update
        setFeedback({
          type: 'success',
          message: 'Status aktualisiert',
        });
      } else {
        // Error from API - extract message from response
        const error = await response.json();
        setFeedback({
          type: 'error',
          message: error.error || 'Status konnte nicht aktualisiert werden',
        });
      }
    } catch {
      // Network or other error
      setFeedback({
        type: 'error',
        message: 'Verbindungsfehler - bitte erneut versuchen',
      });
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
        {selectedOrder && <OrderDetails order={selectedOrder} onClear={handleClear} />}

        {/* Status Update Buttons */}
        {selectedOrder && (
          <StatusButtons
            orderId={selectedOrder.auftragsnummer}
            onStatusChange={handleStatusChange}
            loadingStatus={loadingStatus}
            disabled={loadingStatus !== null}
          />
        )}

        {/* Feedback Banner - Success/Error */}
        {feedback && (
          <div
            className={`
              flex items-center gap-3 p-4 rounded-lg border
              transition-all duration-300 animate-in fade-in slide-in-from-top-2
              ${
                feedback.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }
            `}
            role="alert"
            aria-live="polite"
          >
            {feedback.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
