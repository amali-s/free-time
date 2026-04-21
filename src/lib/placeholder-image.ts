import type { SpaceType } from "./types/space";

/**
 * Maps a space type to its illustrated placeholder image path.
 *
 * Four categories:
 * - storage: spaces with luggage storage (transit hubs, lockers)
 * - cafe: cafes and food/drink purchase spaces
 * - paid: coworking and paid day-pass spaces
 * - public: libraries, parks, plazas, lobbies, and other free public spaces
 */

const PLACEHOLDER_PATHS = {
  storage: "/illustrations/placeholder-storage.svg",
  cafe: "/illustrations/placeholder-cafe.svg",
  paid: "/illustrations/placeholder-paid.svg",
  public: "/illustrations/placeholder-public.svg",
} as const;

export type PlaceholderCategory = keyof typeof PLACEHOLDER_PATHS;

export function getPlaceholderCategory(type: SpaceType): PlaceholderCategory {
  switch (type) {
    case "cafe":
      return "cafe";
    case "coworking":
      return "paid";
    case "transit":
      return "storage";
    case "library":
    case "park":
    case "plaza":
    case "lobby":
    case "other":
    default:
      return "public";
  }
}

/**
 * Returns the placeholder image path for a space.
 * If the space has a real imageUrl, returns that instead.
 */
export function getSpaceImage(
  type: SpaceType,
  imageUrl?: string
): string {
  if (imageUrl) return imageUrl;
  const category = getPlaceholderCategory(type);
  return PLACEHOLDER_PATHS[category];
}
