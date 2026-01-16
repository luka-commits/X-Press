/**
 * Route URL utilities for Google Maps navigation link generation.
 *
 * Google Maps URLs API format:
 * https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&waypoints={lat},{lng}|{lat},{lng}|...&travelmode=driving&dir_action=navigate
 *
 * Key parameters:
 * - api=1: Required for Maps URLs API
 * - destination: Final stop (X-Press for return trip)
 * - waypoints: All delivery stops, pipe-separated coordinates
 * - travelmode: driving (for delivery routes)
 * - dir_action: navigate (starts turn-by-turn navigation immediately)
 *
 * Note: Origin is omitted to use the device's current location,
 * which enables instant navigation when the driver is already at X-Press.
 *
 * @see https://developers.google.com/maps/documentation/urls/get-started
 */

/** X-Press location (Nunsdorfer Ring 13, 12277 Berlin-Marienfelde) */
const XPRESS_LOCATION = { lat: 52.4046, lng: 13.3718 };

/** Maximum URL length for browser compatibility */
const MAX_URL_LENGTH = 2048;

/**
 * Generates a Google Maps navigation URL for a multi-stop delivery route.
 *
 * The URL:
 * - Omits origin to use device's current location (driver already at X-Press)
 * - Sets X-Press as destination (return trip)
 * - Includes all delivery stops as waypoints in the given order
 * - Uses driving mode with immediate navigation launch
 *
 * @param orders - Array of orders with delivery coordinates (in optimized order)
 * @returns Google Maps navigation URL
 *
 * @example
 * const url = generateGoogleMapsUrl([
 *   { lieferLat: 52.5200, lieferLng: 13.4050 },
 *   { lieferLat: 52.4800, lieferLng: 13.3900 }
 * ]);
 * // https://www.google.com/maps/dir/?api=1&destination=52.404600,13.371800&waypoints=52.520000,13.405000|52.480000,13.390000&travelmode=driving&dir_action=navigate
 */
export function generateGoogleMapsUrl(
  orders: Array<{ lieferLat: number; lieferLng: number }>
): string {
  // Round coordinates to 6 decimal places (11cm precision, sufficient for delivery)
  const round = (n: number) => n.toFixed(6);

  // X-Press as destination (return trip)
  const destination = `${round(XPRESS_LOCATION.lat)},${round(XPRESS_LOCATION.lng)}`;

  // All delivery stops as waypoints (in optimized order)
  const waypoints = orders
    .map((o) => `${round(o.lieferLat)},${round(o.lieferLng)}`)
    .join("|");

  // Build URL using URL API for proper encoding
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", destination);
  url.searchParams.set("waypoints", waypoints);
  url.searchParams.set("travelmode", "driving");
  url.searchParams.set("dir_action", "navigate");

  return url.toString();
}

/**
 * Validates a Google Maps URL for browser compatibility.
 *
 * Google Maps URLs have a 2048 character limit. URLs exceeding this may be
 * truncated or fail to load correctly.
 *
 * @param url - The Google Maps URL to validate
 * @returns Validation result with optional German error message
 *
 * @example
 * const result = validateRouteUrl(longUrl);
 * if (!result.valid) {
 *   alert(result.message); // "URL zu lang (2100 Zeichen)..."
 * }
 */
export function validateRouteUrl(url: string): {
  valid: boolean;
  message?: string;
} {
  if (url.length > MAX_URL_LENGTH) {
    return {
      valid: false,
      message: `URL zu lang (${url.length} Zeichen). Maximum: ${MAX_URL_LENGTH}. Bitte weniger Stopps auswählen.`,
    };
  }
  return { valid: true };
}

/**
 * Copies text to the clipboard.
 *
 * Uses the modern Clipboard API when available (secure contexts).
 * Falls back to the deprecated execCommand approach for older browsers.
 *
 * @param text - The text to copy to clipboard
 * @returns Promise resolving to true on success, false on failure
 *
 * @example
 * const success = await copyToClipboard(url);
 * if (success) {
 *   showFeedback("Link kopiert!");
 * }
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Modern Clipboard API (secure contexts)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Clipboard write failed:", err);
      return false;
    }
  }

  // Fallback for non-secure contexts or older browsers
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    return true;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}
