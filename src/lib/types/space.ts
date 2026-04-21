/* ============================================
   FreeTime — Core Data Types
   Shared across all views, API routes, and store
   ============================================ */

export type SpaceType =
  | "cafe"
  | "coworking"
  | "library"
  | "park"
  | "plaza"
  | "transit"
  | "lobby"
  | "other";

export type Amenity =
  | "wifi"
  | "outlets"
  | "seating"
  | "bathroom"
  | "storage"
  | "quiet"
  | "parking";

export type Tag =
  | "free"
  | "paid"
  | "cafe"
  | "wifi"
  | "bathroom"
  | "storage"
  | "coworking"
  | "outdoor";

export type PriceType = "free" | "paid" | "purchase-required";

export type NoiseLevel = "quiet" | "moderate" | "loud";

export interface SpaceHours {
  open: string; // "09:00"
  close: string; // "20:00"
}

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  lat: number;
  lng: number;
  address: string;
  city: string; // city slug, e.g. "denver-co"
  amenities: Amenity[];
  tags: Tag[];
  priceType: PriceType;
  noiseLevel: NoiseLevel;
  hours: SpaceHours | null;
  description?: string;
  imageUrl?: string;
  websiteUrl?: string;
  distanceKm?: number;
}

export interface City {
  slug: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
}

/**
 * The shared contract for any space view (list, canvas, map).
 * Both ListView and the future CanvasView receive these same props.
 * This is the boundary that makes adding new views a drop-in.
 */
export interface SpaceViewProps {
  spaces: Space[];
  userLocation: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** API response shape for GET /api/spaces */
export interface SpacesResponse {
  total: number;
  spaces: Space[];
}

/** API response shape for GET /api/cities */
export interface CitiesResponse {
  cities: City[];
}
