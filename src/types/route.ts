/**
 * Types for route optimization API
 */

/**
 * Waypoint with coordinates and order reference
 */
export interface RouteWaypoint {
  lat: number;
  lng: number;
  orderId: string;
}

/**
 * Request body for POST /api/routes/optimize
 */
export interface OptimizeRouteRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: RouteWaypoint[];
}

/**
 * Response from POST /api/routes/optimize
 */
export interface OptimizeRouteResponse {
  optimizedOrderIds: string[];
  duration: string; // e.g., "3600s"
  distanceMeters: number;
  encodedPolyline: string;
}

/**
 * Error response from route optimization API
 */
export interface OptimizeRouteError {
  error: string;
  details?: unknown;
}
