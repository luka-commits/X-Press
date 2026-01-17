'use client';

import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { GoogleMap, useLoadScript, InfoWindowF } from '@react-google-maps/api';
import { useEffect, useRef, useState, useCallback } from 'react';

import { cn } from '@/lib/utils';

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
  className?: string;
  /** Callback when a marker is clicked - emits order's auftragsnummer */
  onOrderSelect?: (orderId: string) => void;
  /** Externally controlled selected order - map will pan to and highlight this marker */
  selectedOrderId?: string | null;
  /** Route planning mode - when true, shows numbered markers and route line */
  routePlanningMode?: boolean;
  /** Ordered list of orders selected for route (in route sequence) */
  routeOrders?: MapOrder[];
  /** Encoded polyline from Google Routes API for optimized route rendering */
  encodedPolyline?: string | null;
}

// Berlin center (X-Press location area)
const BERLIN_CENTER = { lat: 52.52, lng: 13.405 };

// Map container style - uses 100% to fill parent container
const containerStyle = {
  width: '100%',
  height: '100%',
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
export default function DeliveryMap({
  orders,
  className,
  onOrderSelect,
  selectedOrderId,
  routePlanningMode = false,
  routeOrders = [],
  encodedPolyline = null,
}: DeliveryMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['geometry'], // Required for decoding polylines
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  // Map of orderId -> marker for quick lookup
  const markerMapRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const [selectedOrder, setSelectedOrder] = useState<MapOrder | null>(null);
  // Route polyline ref
  const polylineRef = useRef<google.maps.Polyline | null>(null);

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
      markerMapRef.current.clear();

      // Create markers for each order
      const markers = mappableOrders.map((order) => {
        const marker = new google.maps.Marker({
          position: { lat: order.lieferLat!, lng: order.lieferLng! },
          map: null, // Will be managed by clusterer
        });

        // Store in marker map for quick lookup
        markerMapRef.current.set(order.auftragsnummer, marker);

        // Click handler to show InfoWindow and emit callback
        marker.addListener('click', () => {
          setSelectedOrder(order);
          onOrderSelect?.(order.auftragsnummer);
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
    [mappableOrders, onOrderSelect]
  );

  // Update markers when orders change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    markerMapRef.current.clear();

    // Create new markers
    const markers = mappableOrders.map((order) => {
      const marker = new google.maps.Marker({
        position: { lat: order.lieferLat!, lng: order.lieferLng! },
        map: null,
      });

      // Store in marker map for quick lookup
      markerMapRef.current.set(order.auftragsnummer, marker);

      marker.addListener('click', () => {
        setSelectedOrder(order);
        onOrderSelect?.(order.auftragsnummer);
      });

      return marker;
    });

    markersRef.current = markers;

    // Update clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(markers);
    }
  }, [mappableOrders, onOrderSelect]);

  // React to external selectedOrderId changes - pan to marker and highlight
  useEffect(() => {
    if (!mapRef.current) return;

    // Reset all markers to default icon
    markerMapRef.current.forEach((marker) => {
      marker.setIcon(null); // Use default icon
    });

    if (!selectedOrderId) {
      setSelectedOrder(null);
      return;
    }

    // Find the order and marker
    const order = mappableOrders.find((o) => o.auftragsnummer === selectedOrderId);
    const marker = markerMapRef.current.get(selectedOrderId);

    if (order && marker) {
      // Pan to marker position
      const position = marker.getPosition();
      if (position) {
        mapRef.current.panTo(position);
      }

      // Highlight selected marker with red circle
      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      });

      // Set selected order to show InfoWindow
      setSelectedOrder(order);
    }
  }, [selectedOrderId, mappableOrders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, []);

  // Route planning mode effect - update markers and polyline
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (routePlanningMode) {
      // Disable clusterer in route planning mode - show individual markers
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }

      // Update all markers based on route selection
      markerMapRef.current.forEach((marker, orderId) => {
        const routeIndex = routeOrders.findIndex((o) => o.auftragsnummer === orderId);
        const isInRoute = routeIndex >= 0;

        // Show marker directly on map (not through clusterer)
        marker.setMap(mapRef.current);

        if (isInRoute) {
          // Numbered marker for route stops
          const position = routeIndex + 1;
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: '#3B82F6', // Blue
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          });
          marker.setLabel({
            text: String(position),
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 'bold',
          });
          marker.setZIndex(1000 + position); // Route markers on top
        } else {
          // Semi-transparent gray marker for non-route orders
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#9CA3AF', // Gray
            fillOpacity: 0.5,
            strokeColor: '#ffffff',
            strokeWeight: 1,
          });
          marker.setLabel(null);
          marker.setZIndex(100);
        }
      });

      // Draw route polyline
      if (encodedPolyline) {
        // Optimized route: decode encoded polyline from Google Routes API
        try {
          const decodedPath = google.maps.geometry.encoding.decodePath(encodedPolyline);
          polylineRef.current = new google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: '#2563EB', // Darker blue for optimized route
            strokeOpacity: 0.9,
            strokeWeight: 4,
            map: mapRef.current,
          });
        } catch (error) {
          console.error('Failed to decode polyline:', error);
        }
      } else if (routeOrders.length >= 2) {
        // Fallback: straight lines between stops (before optimization)
        const path = routeOrders
          .filter((o) => o.lieferLat !== null && o.lieferLng !== null)
          .map((o) => ({ lat: o.lieferLat!, lng: o.lieferLng! }));

        polylineRef.current = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#3B82F6', // Lighter blue for straight-line fallback
          strokeOpacity: 0.7,
          strokeWeight: 3,
          map: mapRef.current,
        });
      }
    } else {
      // Normal mode - restore clustered view
      markerMapRef.current.forEach((marker) => {
        marker.setMap(null); // Remove from direct map
        marker.setIcon(null); // Reset to default icon
        marker.setLabel(null);
        marker.setZIndex(undefined);
      });

      // Re-add markers to clusterer
      if (clustererRef.current) {
        clustererRef.current.addMarkers(markersRef.current);
      }
    }
  }, [routePlanningMode, routeOrders, encodedPolyline]);

  // Error state - API key missing or invalid
  if (loadError) {
    return (
      <div
        className={cn(
          'h-[400px] w-full rounded-lg bg-ghl-card border border-ghl-border flex items-center justify-center',
          className
        )}
      >
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
      <div
        className={cn(
          'h-[400px] w-full rounded-lg bg-ghl-card border border-ghl-border flex items-center justify-center',
          className
        )}
      >
        <span className="text-gray-400">Karte wird geladen...</span>
      </div>
    );
  }

  // Check if API key is missing
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={cn(
          'h-[400px] w-full rounded-lg bg-ghl-card border border-ghl-border flex items-center justify-center',
          className
        )}
      >
        <div className="text-center text-gray-400">
          <p>Google Maps API-Key fehlt.</p>
          <p className="text-sm mt-1">Bitte NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env setzen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-[400px] w-full rounded-lg overflow-hidden', className)}>
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
              <div>{selectedOrder.kunde?.firma || selectedOrder.kunde?.name || 'Unbekannt'}</div>
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
