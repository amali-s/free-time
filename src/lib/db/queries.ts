import { sql, eq, ilike, and, arrayContains } from "drizzle-orm";
import { db } from "./client";
import { spaces, cities } from "./schema";
import type { Amenity } from "../types/space";

/**
 * Fetch spaces for a city, optionally sorted by proximity and filtered by amenities.
 */
export async function getSpacesByCity(options: {
  city: string;
  lat?: number;
  lng?: number;
  filters?: Amenity[];
  limit?: number;
  offset?: number;
}) {
  const { city, lat, lng, filters, limit = 50, offset = 0 } = options;

  // Build WHERE conditions
  const conditions = [eq(spaces.city, city)];

  if (filters && filters.length > 0) {
    conditions.push(arrayContains(spaces.amenities, filters));
  }

  // If user coordinates provided, compute distance and sort by proximity
  if (lat !== undefined && lng !== undefined) {
    // Use sql.raw() for column names inside PostGIS functions to avoid
    // Drizzle treating column objects as bound parameters in this context.
    const result = await db.execute(sql`
      SELECT
        *,
        ST_Distance(
          ST_MakePoint(${sql.raw("lng")}, ${sql.raw("lat")})::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) / 1000 AS distance_km
      FROM ${spaces}
      WHERE ${and(...conditions)}
      ORDER BY distance_km ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    const countResult = await db.execute(sql`
      SELECT COUNT(*) AS total
      FROM ${spaces}
      WHERE ${and(...conditions)}
    `);

    const rows = countResult as unknown as Array<{ total: string | number }>;
    const total = Number(rows[0]?.total ?? 0);
    return { total, spaces: result as unknown as Record<string, unknown>[] };
  }

  // No coordinates — return ordered by name
  const result = await db
    .select()
    .from(spaces)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(spaces.name);

  const countResult = await db
    .select({ total: sql<number>`count(*)` })
    .from(spaces)
    .where(and(...conditions));

  const total = Number(countResult[0]?.total ?? 0);
  return { total, spaces: result };
}

/**
 * Fetch cities, optionally filtered by a search query.
 */
export async function getCities(query?: string) {
  if (query && query.trim().length > 0) {
    return db
      .select()
      .from(cities)
      .where(ilike(cities.name, `%${query.trim()}%`))
      .orderBy(cities.name);
  }

  return db.select().from(cities).orderBy(cities.name);
}
