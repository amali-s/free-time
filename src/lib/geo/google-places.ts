import "server-only";

export class PlacesRateLimitError extends Error {
  constructor() {
    super("Google Places rate limit hit (429)");
    this.name = "PlacesRateLimitError";
  }
}

interface PlacesSearchResponse {
  places?: Array<{ photos?: Array<{ name: string }> }>;
}

export async function fetchPlacePhotoUrl(
  name: string,
  address: string
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  let res: Response;
  try {
    res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos",
      },
      body: JSON.stringify({ textQuery: `${name} ${address}` }),
    });
  } catch {
    return null;
  }

  if (res.status === 429) throw new PlacesRateLimitError();
  if (!res.ok) return null;

  let data: PlacesSearchResponse;
  try {
    data = (await res.json()) as PlacesSearchResponse;
  } catch {
    return null;
  }

  const photoName = data.places?.[0]?.photos?.[0]?.name;
  if (!photoName) return null;

  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&skipHttpRedirect=true&key=${apiKey}`;
}
