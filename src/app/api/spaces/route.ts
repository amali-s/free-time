import { NextRequest, NextResponse } from "next/server";
import { getSpacesByCity } from "@/lib/db/queries";
import type { Amenity, Space, SpacesResponse } from "@/lib/types/space";

const VALID_AMENITIES = new Set<string>([
  "wifi",
  "outlets",
  "seating",
  "bathroom",
  "storage",
  "quiet",
  "parking",
]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Required: city slug
  const city = params.get("city");
  if (!city) {
    return NextResponse.json(
      { error: "Missing required parameter: city" },
      { status: 400 }
    );
  }

  // Optional: user coordinates for proximity sorting
  const latStr = params.get("lat");
  const lngStr = params.get("lng");
  let lat: number | undefined;
  let lng: number | undefined;

  if (latStr !== null || lngStr !== null) {
    lat = Number(latStr);
    lng = Number(lngStr);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { error: "lat and lng must be valid numbers" },
        { status: 400 }
      );
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "lat must be [-90,90] and lng must be [-180,180]" },
        { status: 400 }
      );
    }
  }

  // Optional: amenity filters
  const filtersStr = params.get("filters");
  let filters: Amenity[] | undefined;
  if (filtersStr) {
    const parts = filtersStr.split(",").map((s) => s.trim());
    const invalid = parts.filter((p) => !VALID_AMENITIES.has(p));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid filter(s): ${invalid.join(", ")}` },
        { status: 400 }
      );
    }
    filters = parts as Amenity[];
  }

  // Optional: pagination
  const limit = Math.min(Math.max(parseInt(params.get("limit") ?? "50", 10) || 50, 1), 100);
  const offset = Math.max(parseInt(params.get("offset") ?? "0", 10) || 0, 0);

  try {
    const result = await getSpacesByCity({ city, lat, lng, filters, limit, offset });

    // Normalize raw SQL rows (snake_case) into the Space interface
    const spaces: Space[] = result.spaces.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: r.id as string,
        name: r.name as string,
        type: r.type as Space["type"],
        lat: r.lat as number,
        lng: r.lng as number,
        address: r.address as string,
        city: r.city as string,
        amenities: r.amenities as Space["amenities"],
        tags: r.tags as Space["tags"],
        priceType: (r.price_type ?? r.priceType) as Space["priceType"],
        noiseLevel: (r.noise_level ?? r.noiseLevel) as Space["noiseLevel"],
        hours: (r.hours ?? null) as Space["hours"],
        description: (r.description as string) || undefined,
        imageUrl: ((r.image_url ?? r.imageUrl) as string | undefined) || undefined,
        websiteUrl: ((r.website_url ?? r.websiteUrl) as string | undefined) || undefined,
        ...(r.distance_km !== undefined
          ? { distanceKm: Number(r.distance_km) }
          : {}),
      };
    });

    const response: SpacesResponse = { total: result.total, spaces };
    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/spaces failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
