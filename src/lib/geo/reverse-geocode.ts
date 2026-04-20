/**
 * Reverse geocode lat/lng to a city name using the Nominatim API (OpenStreetMap).
 * Free, no API key required. Rate limit: 1 request/second.
 * https://nominatim.org/release-docs/develop/api/Reverse/
 */

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country_code?: string;
}

interface ReverseGeocodeResult {
  cityName: string;
  region: string;
  countryCode: string;
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=10`;

  const res = await fetch(url);

  if (!res.ok) return null;

  const data = await res.json();
  const address: NominatimAddress | undefined = data.address;
  if (!address) return null;

  const cityName =
    address.city || address.town || address.village || address.municipality;
  if (!cityName) return null;

  return {
    cityName,
    region: address.state ?? "",
    countryCode: (address.country_code ?? "").toUpperCase(),
  };
}

/**
 * Convert a reverse-geocoded city name + region into a slug.
 * Example: ("Denver", "Colorado", "US") → "denver-co"
 *
 * Uses the US state abbreviation when possible, otherwise the full region name.
 */
export function toCitySlug(cityName: string, region: string): string {
  const city = cityName.toLowerCase().replace(/\s+/g, "-");
  const abbr = US_STATE_ABBR[region.toLowerCase()] ?? region.toLowerCase().replace(/\s+/g, "-");
  return `${city}-${abbr}`;
}

const US_STATE_ABBR: Record<string, string> = {
  alabama: "al", alaska: "ak", arizona: "az", arkansas: "ar",
  california: "ca", colorado: "co", connecticut: "ct", delaware: "de",
  florida: "fl", georgia: "ga", hawaii: "hi", idaho: "id",
  illinois: "il", indiana: "in", iowa: "ia", kansas: "ks",
  kentucky: "ky", louisiana: "la", maine: "me", maryland: "md",
  massachusetts: "ma", michigan: "mi", minnesota: "mn", mississippi: "ms",
  missouri: "mo", montana: "mt", nebraska: "ne", nevada: "nv",
  "new hampshire": "nh", "new jersey": "nj", "new mexico": "nm",
  "new york": "ny", "north carolina": "nc", "north dakota": "nd",
  ohio: "oh", oklahoma: "ok", oregon: "or", pennsylvania: "pa",
  "rhode island": "ri", "south carolina": "sc", "south dakota": "sd",
  tennessee: "tn", texas: "tx", utah: "ut", vermont: "vt",
  virginia: "va", washington: "wa", "west virginia": "wv",
  wisconsin: "wi", wyoming: "wy", "district of columbia": "dc",
};
