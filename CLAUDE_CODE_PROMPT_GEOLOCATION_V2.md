# Claude Code Prompt: Fix Geolocation Detection (Bug #1)

## Context

FreeTime is a Next.js (App Router) + TypeScript app. On load, it requests browser geolocation, reverse-geocodes coordinates to a city via Nominatim, matches the city against `/api/cities`, then fetches spaces. This entire flow is broken — users see "Search for a city above" after granting permission.

This bug blocks every other flow. Fix it first.

---

## Root Causes (Already Identified — Fix These Exactly)

### Bug A — `src/lib/geo/reverse-geocode.ts`: `res` used before assignment

The variable `res` is declared outside the `try` block but assigned inside it. If `fetch()` throws (network error, CORS block, AbortError), `res` is never assigned. The code then falls through to `if (!res.ok)` outside the `try`, which either throws a TypeScript strict-mode error or a runtime ReferenceError — silently killing the whole flow.

**Current code (broken):**
```typescript
let res: Response;
try {
  res = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeout);
}
if (!res.ok) return null;         // ← crashes if fetch threw
const data = await res.json();
```

**Fix:**
```typescript
let res: Response;
try {
  res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
} catch {
  clearTimeout(timeout);
  return null;
}
if (!res.ok) return null;
const data = await res.json();
```

---

### Bug B — `src/lib/geo/reverse-geocode.ts`: Missing `User-Agent` header on Nominatim request

Nominatim's [usage policy](https://operations.osmfoundation.org/policies/nominatim/) requires a valid `User-Agent` identifying your application. Browser `fetch()` without a custom header sends a generic agent. Nominatim may return `403 Forbidden` or throttle the request, causing `reverseGeocode` to return `null` silently — which propagates as "Could not determine city from your location."

**Current code (broken):**
```typescript
const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=10`;
// ...
res = await fetch(url, { signal: controller.signal });
```

**Fix — move this call to a server-side Next.js route handler so the `User-Agent` header can be set reliably and the API key is never exposed client-side:**

1. Create `src/app/api/geocode/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=10`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "FreeTime/1.0 (amaya.mali3@gmail.com)",
      "Accept-Language": "en",
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return NextResponse.json(null);

  const data = await res.json();
  return NextResponse.json(data);
}
```

2. Update `src/lib/geo/reverse-geocode.ts` to call `/api/geocode` instead of Nominatim directly:
```typescript
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  let res: Response;
  try {
    res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`, {
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const data = await res.json();
  if (!data) return null;

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
```

---

### Bug C — Silent error swallowing in `src/lib/geo/use-geolocation.ts`

The outer `catch` in the geolocation success callback swallows all errors with a generic message. Add `console.error` so failures are visible in DevTools during debugging:

```typescript
} catch (err) {
  console.error("[useGeolocation] reverse-geocode failed:", err);  // ← add this
  setState((s) => ({
    ...s,
    loading: false,
    error: "Failed to reverse geocode your location.",
  }));
}
```

---

## Files to Modify (in order)

| File | Change |
|---|---|
| `src/app/api/geocode/route.ts` | **Create** — server-side proxy for Nominatim with proper User-Agent |
| `src/lib/geo/reverse-geocode.ts` | Fix `res` assignment bug; point URL to `/api/geocode` instead of Nominatim |
| `src/lib/geo/use-geolocation.ts` | Add `console.error` in catch block; no other changes needed |

Do NOT modify `src/app/page.tsx` or `src/lib/store.ts` — the orchestration logic there is correct.

---

## Files to Read First (for full context)

Before making any changes, read these files in full:
- `src/lib/geo/use-geolocation.ts`
- `src/lib/geo/reverse-geocode.ts`
- `src/app/api/spaces/route.ts` (to understand the API pattern for the new route)
- `src/app/api/cities/route.ts` (same reason)

---

## Verification Steps After Fixing

1. Run the dev server: `npm run dev`
2. Open `http://localhost:3000` in Chrome
3. Open DevTools → Console tab
4. Allow location permission when prompted
5. Confirm you see no errors in Console
6. Confirm a request to `/api/geocode?lat=...&lng=...` appears in Network tab (status 200)
7. Confirm the response contains `address.city` (or `.town`)
8. Confirm a request to `/api/cities?q=<city-name>` follows (status 200)
9. Confirm `activeCity` is set in the app (city name appears in the header area)
10. Confirm a request to `/api/spaces?city=<slug>` fires and returns spaces

If geolocation permission is denied: user should see the banner "Location permission denied. Search for a city instead." — verify this appears and is dismissable.

---

## Do Not

- Do not add Mapbox. The app uses Nominatim (free, no key needed).
- Do not change the `toCitySlug` function — it's correct.
- Do not change `page.tsx` or `store.ts` — they are correct.
- Do not install new packages.
- Do not add mock data or hardcoded fallback cities.

---

## After This Fix

Move immediately to **Bug #4 (data loading / skeleton cards)** — it may resolve automatically once the geolocation flow correctly sets `activeCity`, which triggers `fetchSpaces`. Confirm before starting that fix.
