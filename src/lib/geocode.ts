/**
 * Geocoding utility using Nominatim (OpenStreetMap)
 * Free, no API key required, but please respect rate limits (1 req/sec)
 */

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Geocode an address to coordinates using Nominatim
 * @param address - The address string to geocode
 * @param countryCode - Optional country code to bias results (e.g., "no" for Norway)
 * @returns Coordinates and display name, or null if not found
 */
export async function geocodeAddress(
  address: string,
  countryCode: string = "no"
): Promise<GeocodingResult | null> {
  try {
    // Clean and encode the address
    const cleanAddress = address.trim();
    if (!cleanAddress) return null;

    // Build the Nominatim URL
    const params = new URLSearchParams({
      q: cleanAddress,
      format: "json",
      limit: "1",
      countrycodes: countryCode,
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          // Nominatim requires a valid User-Agent
          "User-Agent": "YouthPlatform/1.0 (job-platform)",
        },
      }
    );

    if (!response.ok) {
      console.error("Nominatim geocoding failed:", response.status);
      return null;
    }

    const data: NominatimResponse[] = await response.json();

    if (!data || data.length === 0) {
      console.log(`No geocoding results for: ${cleanAddress}`);
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Batch geocode multiple addresses with rate limiting
 * Nominatim requires 1 second between requests
 * @param addresses - Array of addresses to geocode
 * @returns Map of address to coordinates
 */
export async function batchGeocode(
  addresses: string[]
): Promise<Map<string, GeocodingResult | null>> {
  const results = new Map<string, GeocodingResult | null>();

  for (const address of addresses) {
    // Skip if we've already processed this address
    if (results.has(address)) continue;

    const result = await geocodeAddress(address);
    results.set(address, result);

    // Wait 1 second between requests to respect rate limits
    if (addresses.indexOf(address) < addresses.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  return results;
}

/**
 * Calculate distance between two points in kilometers using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Default map center (Oslo, Norway)
 */
export const DEFAULT_MAP_CENTER = {
  lat: 59.9139,
  lng: 10.7522,
};

/**
 * Default map zoom level
 */
export const DEFAULT_MAP_ZOOM = 11;
