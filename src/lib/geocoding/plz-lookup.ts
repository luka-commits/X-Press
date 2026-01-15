/**
 * PLZ Geocoding Lookup Utility
 *
 * Provides static lookup of German postal codes (PLZ) to lat/lng coordinates.
 * Uses the WZB plz_geocoord dataset with 8,000+ German PLZ entries.
 *
 * @see https://github.com/WZBSocialScienceCenter/plz_geocoord
 */

import plzData from './plz-data.json';

interface PlzCoordinate {
  plz: string;
  lat: number;
  lng: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Build lookup map on module load for O(1) access
const plzMap = new Map<string, Coordinates>();

// Initialize map from JSON data
(plzData as PlzCoordinate[]).forEach(({ plz, lat, lng }) => {
  plzMap.set(plz, { lat, lng });
});

/**
 * Get coordinates for a German postal code (PLZ)
 *
 * @param plz - German postal code (5 digits, will be normalized with leading zeros)
 * @returns Coordinates object with lat/lng or null if PLZ not found
 *
 * @example
 * getCoordinatesForPlz('10115') // { lat: 52.532, lng: 13.388 }
 * getCoordinatesForPlz('1234')  // { lat: ..., lng: ... } (normalized to 01234)
 * getCoordinatesForPlz('99999') // null (invalid PLZ)
 */
export function getCoordinatesForPlz(plz: string): Coordinates | null {
  // Normalize PLZ to 5 digits with leading zeros
  const normalizedPlz = plz.padStart(5, '0');
  return plzMap.get(normalizedPlz) ?? null;
}

/**
 * Check if a PLZ has coordinates in the dataset
 *
 * @param plz - German postal code to check
 * @returns true if coordinates exist for this PLZ
 */
export function hasCoordinatesForPlz(plz: string): boolean {
  const normalizedPlz = plz.padStart(5, '0');
  return plzMap.has(normalizedPlz);
}

/**
 * Get total count of PLZ entries in the dataset
 *
 * @returns Number of PLZ entries (8,298 for Germany)
 */
export function getPlzCount(): number {
  return plzMap.size;
}
