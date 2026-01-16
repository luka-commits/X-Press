"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, X, Map, ChevronDown, ChevronUp, Calendar, Package, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { VersandOrderCard, type VersandOrder } from "./VersandOrderCard";
import { VersandStatusButtons, type VersandStatusType } from "./VersandStatusButtons";
import { VersandKPIs, type VersandStatusFilter } from "./VersandKPIs";
import { DeliveryMap, type MapOrder } from "@/components/map";

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

const deadlineLabels: Record<DeadlineFilter, string> = {
  today: "Heute",
  week: "Diese Woche",
  all: "Alle Termine",
};

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
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("all");
  const [statusFilter, setStatusFilter] = useState<VersandStatusFilter>("all");

  // Map toggle (mobile only)
  const [showMap, setShowMap] = useState(false);

  // Route planning mode
  const [routePlanningMode, setRoutePlanningMode] = useState(false);
  const [routeOrders, setRouteOrders] = useState<string[]>([]);

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

  // Toggle route planning mode
  const handleRoutePlanningToggle = () => {
    if (routePlanningMode) {
      // Exiting mode - clear selected route orders
      setRouteOrders([]);
    }
    setRoutePlanningMode(!routePlanningMode);
    // Also clear selected order when entering/exiting route planning mode
    setSelectedOrder(null);
  };

  // Toggle an order in/out of the route
  const handleRouteOrderToggle = (orderId: string) => {
    setRouteOrders((prev) => {
      if (prev.includes(orderId)) {
        // Remove from route
        return prev.filter((id) => id !== orderId);
      } else {
        // Add to end of route
        return [...prev, orderId];
      }
    });
  };

  // Get route position for an order (1-based, null if not in route)
  const getRoutePosition = (orderId: string): number | null => {
    const index = routeOrders.indexOf(orderId);
    return index >= 0 ? index + 1 : null;
  };

  // Build ordered list of mappable route orders for the map
  const routeOrdersForMap: MapOrder[] = useMemo(() => {
    return routeOrders
      .map((orderId) => orders.find((o) => o.auftragsnummer === orderId))
      .filter((o): o is VersandOrder => o !== undefined && o.lieferLat !== null && o.lieferLng !== null);
  }, [routeOrders, orders]);

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
    <div className="space-y-6">
      {/* KPIs - Card-based, matching dashboard style */}
      <VersandKPIs orders={allOrders} onFilterClick={setStatusFilter} activeFilter={statusFilter} />

      {/* Filter Bar - Clean horizontal layout */}
      <div className="bg-white rounded-lg border border-ghl-border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Deadline Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-500">Zeitraum:</span>
            <div className="flex gap-1">
              {(["today", "week", "all"] as DeadlineFilter[]).map((filter) => (
                <FilterChip
                  key={filter}
                  active={deadlineFilter === filter}
                  onClick={() => setDeadlineFilter(filter)}
                >
                  {deadlineLabels[filter]}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-neutral-200" />

          {/* Route Planning Toggle */}
          <button
            onClick={handleRoutePlanningToggle}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              routePlanningMode
                ? "bg-blue-500 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <Route className="w-4 h-4" />
            Routenplanung
          </button>

          {/* Map Toggle - mobile only, inline */}
          <div className="md:hidden ml-auto">
            <button
              onClick={() => setShowMap(!showMap)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                showMap
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              <Map className="w-4 h-4" />
              Karte
              {showMap ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border shadow-sm",
            "transition-all duration-300 animate-in fade-in slide-in-from-top-2",
            feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
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

      {/* Main Content: List + Map Grid */}
      <div className="md:grid md:grid-cols-5 md:gap-6">
        {/* Left Column: Order List (3 cols on desktop) */}
        <div className="md:col-span-3 space-y-4">
          {/* Mobile Map (collapsible) */}
          {showMap && (
            <div className="md:hidden overflow-hidden rounded-lg border border-ghl-border shadow-sm">
              <DeliveryMap
                orders={orders}
                className="h-[350px]"
                selectedOrderId={selectedOrder?.auftragsnummer ?? null}
                onOrderSelect={handleMapOrderSelect}
                routePlanningMode={routePlanningMode}
                routeOrders={routeOrdersForMap}
              />
            </div>
          )}

          {/* Order Count Header */}
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-500">
                {orders.length} {orders.length === 1 ? "Auftrag" : "Aufträge"}
              </h2>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-lg bg-white border border-ghl-border animate-pulse shadow-sm"
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && (
            <div className="p-12 text-center bg-white rounded-lg border border-ghl-border shadow-sm">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">Keine Aufträge gefunden</p>
              <p className="text-sm text-neutral-400 mt-1">
                Versuche einen anderen Filter
              </p>
            </div>
          )}

          {/* Order List */}
          {!loading && !error && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.auftragsnummer} className="space-y-2">
                  <VersandOrderCard
                    order={order}
                    isSelected={selectedOrder?.auftragsnummer === order.auftragsnummer}
                    onSelect={handleOrderSelect}
                    routePlanningMode={routePlanningMode}
                    routePosition={getRoutePosition(order.auftragsnummer)}
                    onRouteToggle={() => handleRouteOrderToggle(order.auftragsnummer)}
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

        {/* Right Column: Map (2 cols on desktop) - always visible */}
        <div className="hidden md:block md:col-span-2">
          <div className="sticky top-6">
            <div className="rounded-lg border border-ghl-border overflow-hidden shadow-sm">
              <DeliveryMap
                orders={orders}
                className="h-[calc(100vh-280px)]"
                selectedOrderId={selectedOrder?.auftragsnummer ?? null}
                onOrderSelect={handleMapOrderSelect}
                routePlanningMode={routePlanningMode}
                routeOrders={routeOrdersForMap}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FilterChip Component - Small chip button for filters (dashboard style)
 */
interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-blue-500 text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      )}
    >
      {children}
    </button>
  );
}
