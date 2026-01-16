"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Map, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { VersandOrderCard, type VersandOrder } from "./VersandOrderCard";
import { VersandStatusButtons, type VersandStatusType } from "./VersandStatusButtons";
import { VersandKPIs, type VersandStatusFilter } from "./VersandKPIs";
import { DeliveryMap } from "@/components/map";

/**
 * Deadline filter options
 */
type DeadlineFilter = "today" | "week" | "all";

/**
 * API response structure from GET /api/versand/orders
 */
interface VersandOrdersResponse {
  orders: VersandOrder[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Feedback state for success/error messages
 */
interface Feedback {
  type: "success" | "error";
  message: string;
}

/**
 * VersandOrderList Component - Order List for Versand-Team
 *
 * Features:
 * - Fetches orders from GET /api/versand/orders
 * - Deadline filter: Heute / Diese Woche / Alle
 * - VersandStatus filter: Alle / Offen / Versandbereit
 * - PLZ sorting (default from API)
 * - Expandable order cards with status buttons
 * - Success/error feedback after status updates
 */
export function VersandOrderList() {
  // State - orders for display (filtered) and allOrders for KPI counts
  const [orders, setOrders] = useState<VersandOrder[]>([]);
  const [allOrders, setAllOrders] = useState<VersandOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<VersandOrder | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<VersandStatusType | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Filters
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("today");
  const [statusFilter, setStatusFilter] = useState<VersandStatusFilter>("offen");

  // Map toggle (mobile only)
  const [showMap, setShowMap] = useState(false);

  // Auto-dismiss feedback after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Fetch orders (filtered for display) and all orders (for KPIs)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch filtered orders for display
      const params = new URLSearchParams();
      params.set("deadline", deadlineFilter);
      if (statusFilter !== "all") {
        params.set("versandStatus", statusFilter);
      }

      // Fetch all orders for KPIs (same deadline, no status filter)
      const allParams = new URLSearchParams();
      allParams.set("deadline", deadlineFilter);

      const [filteredResponse, allResponse] = await Promise.all([
        fetch(`/api/versand/orders?${params.toString()}`),
        fetch(`/api/versand/orders?${allParams.toString()}`),
      ]);

      if (!filteredResponse.ok || !allResponse.ok) {
        throw new Error("Fehler beim Laden der Aufträge");
      }

      const filteredData: VersandOrdersResponse = await filteredResponse.json();
      const allData: VersandOrdersResponse = await allResponse.json();

      setOrders(filteredData.orders);
      setAllOrders(allData.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, [deadlineFilter, statusFilter]);

  // Fetch on mount and filter change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle order selection from list
  const handleOrderSelect = (order: VersandOrder) => {
    if (selectedOrder?.auftragsnummer === order.auftragsnummer) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(order);
      // On mobile: auto-show map if order has coordinates
      if (order.lieferLat && order.lieferLng && !showMap) {
        // Check if we're on mobile (no md breakpoint)
        if (window.innerWidth < 768) {
          setShowMap(true);
        }
      }
    }
  };

  // Handle order selection from map marker click
  const handleMapOrderSelect = (orderId: string) => {
    const order = orders.find((o) => o.auftragsnummer === orderId);
    if (order) {
      setSelectedOrder(order);
      // Scroll to the order card in the list
      const element = document.getElementById(`order-card-${orderId}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Handle status change
  const handleStatusChange = async (status: VersandStatusType, comment?: string) => {
    if (!selectedOrder) return;

    setFeedback(null);
    setLoadingStatus(status);

    try {
      const response = await fetch(`/api/orders/${selectedOrder.auftragsnummer}/versand`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versandStatus: status, versandKommentar: comment }),
      });

      if (response.ok) {
        setFeedback({
          type: "success",
          message: "Versandstatus aktualisiert",
        });
        setSelectedOrder(null);
        // Re-fetch to reflect changes
        fetchOrders();
      } else {
        const errorData = await response.json();
        setFeedback({
          type: "error",
          message: errorData.error || "Fehler beim Aktualisieren des Versandstatus",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Verbindungsfehler - bitte erneut versuchen",
      });
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className="md:grid md:grid-cols-2 md:gap-6 md:h-[calc(100vh-200px)]">
      {/* Left Column: KPIs + Filters + Order List */}
      <div className="md:overflow-y-auto md:pr-2 space-y-4">
        {/* KPIs - always visible, shows counts from all orders in deadline scope */}
        <VersandKPIs orders={allOrders} onFilterClick={setStatusFilter} />

        {/* Filters */}
        <div className="space-y-3">
          {/* Deadline Filter */}
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={deadlineFilter === "today"}
              onClick={() => setDeadlineFilter("today")}
            >
              Heute
            </FilterPill>
            <FilterPill
              active={deadlineFilter === "week"}
              onClick={() => setDeadlineFilter("week")}
            >
              Diese Woche
            </FilterPill>
            <FilterPill
              active={deadlineFilter === "all"}
              onClick={() => setDeadlineFilter("all")}
            >
              Alle
            </FilterPill>
          </div>

          {/* VersandStatus Filter */}
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            >
              Alle Status
            </FilterPill>
            <FilterPill
              active={statusFilter === "offen"}
              onClick={() => setStatusFilter("offen")}
            >
              Offen
            </FilterPill>
            <FilterPill
              active={statusFilter === "versandbereit"}
              onClick={() => setStatusFilter("versandbereit")}
            >
              Versandbereit
            </FilterPill>
          </div>
        </div>

        {/* Map Toggle Button - mobile only */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMap(!showMap)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg border transition-colors",
              showMap
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "bg-ghl-card border-ghl-border text-gray-300 hover:border-gray-500"
            )}
          >
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              <span className="font-medium">Karte anzeigen</span>
            </div>
            {showMap ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Map (collapsible) */}
        {showMap && (
          <div className="md:hidden overflow-hidden rounded-lg">
            <DeliveryMap
              orders={orders}
              className="h-[400px]"
              selectedOrderId={selectedOrder?.auftragsnummer ?? null}
              onOrderSelect={handleMapOrderSelect}
            />
          </div>
        )}

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border",
              "transition-all duration-300 animate-in fade-in slide-in-from-top-2",
              feedback.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            )}
            role="alert"
            aria-live="polite"
          >
            {feedback.type === "success" ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-lg bg-ghl-card border border-ghl-border animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            Keine Aufträge gefunden
          </div>
        )}

        {/* Order List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.auftragsnummer} className="space-y-3">
                <VersandOrderCard
                  order={order}
                  isSelected={selectedOrder?.auftragsnummer === order.auftragsnummer}
                  onSelect={handleOrderSelect}
                />

                {/* Status Buttons (shown when order is selected) */}
                {selectedOrder?.auftragsnummer === order.auftragsnummer && (
                  <VersandStatusButtons
                    orderId={order.auftragsnummer}
                    onStatusChange={handleStatusChange}
                    loadingStatus={loadingStatus}
                    disabled={loadingStatus !== null}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Map - always visible on desktop */}
      <div className="hidden md:block md:sticky md:top-0 md:h-[calc(100vh-200px)]">
        <DeliveryMap
          orders={orders}
          className="h-full rounded-lg"
          selectedOrderId={selectedOrder?.auftragsnummer ?? null}
          onOrderSelect={handleMapOrderSelect}
        />
      </div>
    </div>
  );
}

/**
 * FilterPill Component - Rounded pill button for filters
 */
interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterPill({ active, onClick, children }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
        active
          ? "bg-blue-500 text-white"
          : "bg-ghl-card border border-ghl-border text-gray-300 hover:border-gray-500"
      )}
    >
      {children}
    </button>
  );
}
