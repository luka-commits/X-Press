"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

// Critical: Import CSS for Leaflet and clustering (order matters)
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.Default.css";

// Critical: Fix marker icons for Next.js/webpack
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

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

// Berlin center (X-Press location area)
const BERLIN_CENTER: [number, number] = [52.52, 13.405];

/**
 * DeliveryMap Component - Interactive map showing delivery addresses
 *
 * Features:
 * - Centered on Berlin area
 * - OpenStreetMap tiles (free, no API key)
 * - Marker clustering for PLZ-grouped orders
 * - Popup with order details on marker click
 */
export default function DeliveryMap({ orders }: DeliveryMapProps) {
  // Filter orders with valid coordinates
  const mappableOrders = orders.filter(
    (o) => o.lieferLat !== null && o.lieferLng !== null && o.lieferLat !== undefined && o.lieferLng !== undefined
  );

  return (
    <MapContainer
      center={BERLIN_CENTER}
      zoom={10}
      className="h-[400px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {mappableOrders.map((order) => (
          <Marker
            key={order.auftragsnummer}
            position={[order.lieferLat!, order.lieferLng!]}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{order.auftragsnummer}</div>
                <div>{order.kunde?.firma || order.kunde?.name || "Unbekannt"}</div>
                <div>
                  {order.lieferPlz} {order.lieferOrt}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
