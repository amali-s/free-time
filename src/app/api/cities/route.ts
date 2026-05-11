import { NextRequest, NextResponse } from "next/server";
import { getCities } from "@/lib/db/queries";
import type { CitiesResponse } from "@/lib/types/space";

// Reads request URL params + hits Postgres — never cache or pre-render.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q") ?? undefined;

  try {
    const rows = await getCities(query);

    const response: CitiesResponse = {
      cities: rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        region: row.region ?? "",
        country: row.country,
        lat: row.lat,
        lng: row.lng,
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    // Log full error to Vercel's runtime logs.
    console.error("GET /api/cities failed:", err);

    // Surface the underlying message so the browser console / Network tab
    // is usable for diagnosis. This is a non-secret error message
    // (Postgres / Drizzle errors don't leak data), and the project does not
    // expose any auth boundary on this route. If you ever add one, gate this
    // behind `process.env.NODE_ENV !== "production"`.
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Internal server error", detail: message },
      { status: 500 }
    );
  }
}
