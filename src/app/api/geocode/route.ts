import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=10`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "FreeTime/1.0 (+https://freetime.app)",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return NextResponse.json(null);
  }

  if (!res.ok) return NextResponse.json(null);

  const data = await res.json();
  return NextResponse.json(data);
}
