import dynamic from "next/dynamic";

/**
 * Order data structure for map markers
 */
interface MapOrder {
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
}

/**
 * Dynamic import wrapper for DeliveryMap
 *
 * CRITICAL: Leaflet requires window object, which doesn't exist during SSR.
 * Using next/dynamic with ssr: false to disable server-side rendering.
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
