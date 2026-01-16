"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap, useLoadScript, InfoWindowF } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

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
const BERLIN_CENTER = { lat: 52.52, lng: 13.405 };

// Map container style
const containerStyle = {
  width: "100%",
  height: "400px",
};

/**
 * DeliveryMap Component - Interactive map showing delivery addresses
 *
 * Features:
 * - Centered on Berlin area
 * - Google Maps (familiar UX, future route planning capability)
 * - Marker clustering for PLZ-grouped orders
 * - InfoWindow with order details on marker click
 */
export default function DeliveryMap({ orders }: DeliveryMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MapOrder | null>(null);

  // Filter orders with valid coordinates
  const mappableOrders = orders.filter(
    (o) =>
      o.lieferLat !== null &&
      o.lieferLng !== null &&
      o.lieferLat !== undefined &&
      o.lieferLng !== undefined
  );

  // Callback when map loads
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Create markers for each order
      const markers = mappableOrders.map((order) => {
        const marker = new google.maps.Marker({
          position: { lat: order.lieferLat!, lng: order.lieferLng! },
          map: null, // Will be managed by clusterer
        });

        // Click handler to show InfoWindow
        marker.addListener("click", () => {
          setSelectedOrder(order);
        });

        return marker;
      });

      markersRef.current = markers;

      // Create clusterer
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      clustererRef.current = new MarkerClusterer({
        map,
        markers,
      });
    },
    [mappableOrders]
  );

  // Update markers when orders change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    const markers = mappableOrders.map((order) => {
      const marker = new google.maps.Marker({
        position: { lat: order.lieferLat!, lng: order.lieferLng! },
        map: null,
      });

      marker.addListener("click", () => {
        setSelectedOrder(order);
      });

      return marker;
    });

    markersRef.current = markers;

    // Update clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(markers);
    }
  }, [mappableOrders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, []);

  // Error state - API key missing or invalid
  if (loadError) {
    return (
      <div className="h-[400px] w-full rounded-lg bg-ghl-card border border-ghl-border flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p>Google Maps konnte nicht geladen werden.</p>
          <p className="text-sm mt-1">Bitte API-Key prüfen.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full rounded-lg bg-ghl-card border border-ghl-border flex items-center justify-center">
        <span className="text-gray-400">Karte wird geladen...</span>
      </div>
    );
  }

  // Check if API key is missing
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-[400px] w-full rounded-lg bg-ghl-card border border-ghl-border flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p>Google Maps API-Key fehlt.</p>
          <p className="text-sm mt-1">
            Bitte NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env setzen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={BERLIN_CENTER}
        zoom={10}
        onLoad={onMapLoad}
        onClick={() => setSelectedOrder(null)}
      >
        {/* InfoWindow for selected order */}
        {selectedOrder && selectedOrder.lieferLat && selectedOrder.lieferLng && (
          <InfoWindowF
            position={{
              lat: selectedOrder.lieferLat,
              lng: selectedOrder.lieferLng,
            }}
            onCloseClick={() => setSelectedOrder(null)}
          >
            <div className="text-sm text-gray-800">
              <div className="font-bold">{selectedOrder.auftragsnummer}</div>
              <div>
                {selectedOrder.kunde?.firma ||
                  selectedOrder.kunde?.name ||
                  "Unbekannt"}
              </div>
              <div>
                {selectedOrder.lieferPlz} {selectedOrder.lieferOrt}
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
