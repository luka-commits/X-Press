import dynamic from "next/dynamic";

/**
 * Order data structure for map markers
 */
export interface MapOrder {
  auftragsnummer: string;
  kunde?: {
    firma: string | null;
    name: string | null;
  } | null;
  lieferPlz?: string | null;
  lieferOrt?: string | null;
  lieferLat?: number | null;
  lieferLng?: number | null;
}

interface DeliveryMapProps {
  orders: MapOrder[];
  className?: string;
  /** Callback when a marker is clicked - emits order's auftragsnummer */
  onOrderSelect?: (orderId: string) => void;
  /** Externally controlled selected order - map will pan to and highlight this marker */
  selectedOrderId?: string | null;
  /** Route planning mode - when true, shows numbered markers and route line */
  routePlanningMode?: boolean;
  /** Ordered list of orders selected for route (in route sequence) */
  routeOrders?: MapOrder[];
}

/**
 * Dynamic import wrapper for DeliveryMap
 *
 * While Google Maps handles its own script loading via useLoadScript,
 * we still use dynamic import to prevent hydration mismatches and
 * ensure the component only renders on the client.
 */
const DeliveryMap = dynamic<DeliveryMapProps>(
  () => import("./DeliveryMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-lg bg-ghl-card border border-ghl-border flex items-center justify-center">
        <span className="text-gray-400">Karte wird geladen...</span>
      </div>
    ),
  }
);

export { DeliveryMap };
