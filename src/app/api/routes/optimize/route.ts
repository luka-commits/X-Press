import { NextRequest, NextResponse } from "next/server";
import type {
  OptimizeRouteRequest,
  OptimizeRouteResponse,
  OptimizeRouteError,
} from "@/types/route";

/**
 * Response shape from Google Routes API
 */
interface GoogleRoutesResponse {
  routes: Array<{
    duration: string;
    distanceMeters: number;
    polyline: { encodedPolyline: string };
    optimizedIntermediateWaypointIndex?: number[];
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * X-Press location (Nunsdorfer Ring 13, 12277 Berlin-Marienfelde)
 * Used as default origin/destination for route optimization
 */
const XPRESS_LOCATION = { lat: 52.4046, lng: 13.3718 };

/**
 * POST /api/routes/optimize
 *
 * Optimizes delivery route order using Google Routes API.
 * Returns optimized order sequence, total duration/distance, and encoded polyline.
 */
export async function POST(request: NextRequest) {
  try {
    const body: OptimizeRouteRequest = await request.json();
    const { origin, destination, waypoints } = body;

    // Check for API key
    if (!process.env.GOOGLE_ROUTES_API_KEY) {
      console.error("Route optimization: GOOGLE_ROUTES_API_KEY not configured");
      const errorResponse: OptimizeRouteError = {
        error: "Routes API key not configured",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Validate waypoints
    if (!waypoints || waypoints.length < 1) {
      const errorResponse: OptimizeRouteError = {
        error: "At least one waypoint is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Use X-Press location as default origin/destination if not provided
    const routeOrigin = origin || XPRESS_LOCATION;
    const routeDestination = destination || XPRESS_LOCATION;

    // Call Google Routes API
    const routesResponse = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_ROUTES_API_KEY,
          "X-Goog-FieldMask": [
            "routes.duration",
            "routes.distanceMeters",
            "routes.polyline.encodedPolyline",
            "routes.optimizedIntermediateWaypointIndex",
          ].join(","),
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: routeOrigin.lat,
                longitude: routeOrigin.lng,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: routeDestination.lat,
                longitude: routeDestination.lng,
              },
            },
          },
          intermediates: waypoints.map((wp) => ({
            location: {
              latLng: {
                latitude: wp.lat,
                longitude: wp.lng,
              },
            },
          })),
          travelMode: "DRIVE",
          optimizeWaypointOrder: true,
          languageCode: "de-DE",
          units: "METRIC",
        }),
      }
    );

    // Handle Google Routes API error
    if (!routesResponse.ok) {
      const errorData = await routesResponse.json();
      console.error("Routes API error:", errorData);
      const errorResponse: OptimizeRouteError = {
        error: "Route optimization failed",
        details: errorData,
      };
      return NextResponse.json(errorResponse, { status: routesResponse.status });
    }

    const data: GoogleRoutesResponse = await routesResponse.json();

    // Check for API error in response body
    if (data.error) {
      console.error("Routes API returned error:", data.error);
      const errorResponse: OptimizeRouteError = {
        error: data.error.message || "Route optimization failed",
        details: data.error,
      };
      return NextResponse.json(errorResponse, { status: data.error.code || 500 });
    }

    // Validate response has routes
    if (!data.routes || data.routes.length === 0) {
      console.error("Routes API returned no routes");
      const errorResponse: OptimizeRouteError = {
        error: "No routes found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const route = data.routes[0];

    // Map optimized indices back to order IDs
    // If optimizedIntermediateWaypointIndex is not present, keep original order
    const optimizedOrderIds = route.optimizedIntermediateWaypointIndex
      ? route.optimizedIntermediateWaypointIndex.map((idx) => waypoints[idx].orderId)
      : waypoints.map((wp) => wp.orderId);

    const response: OptimizeRouteResponse = {
      optimizedOrderIds,
      duration: route.duration,
      distanceMeters: route.distanceMeters,
      encodedPolyline: route.polyline.encodedPolyline,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Route optimization error:", error);
    const errorResponse: OptimizeRouteError = {
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
