# Claude Code Debugging Prompt — Bug #4: Spaces Never Render / Stuck on Skeleton Loaders

## What the bug looks like
The app shows 4 skeleton shimmer cards indefinitely. Real space cards never appear. The user never sees the SpaceList populated with actual data, even if a city is selected (or auto-detected via geolocation).

---

## Where to look — the full data pipeline

Trace the following chain in order. Every link is a potential failure point.

```
Browser geolocation API
  → useGeolocation() hook   [src/lib/geo/use-geolocation.ts]
  → reverseGeocode()        [src/lib/geo/reverse-geocode.ts]
  → /api/geocode            [src/app/api/geocode/route.ts]
  → /api/cities?q=          [src/app/api/cities/route.ts]
  → setActiveCity()         [src/lib/store.ts]
  → fetchSpaces()           [src/app/page.tsx lines 122–148]
  → /api/spaces?city=       [src/app/api/spaces/route.ts]
  → getSpacesByCity()       [src/lib/db/queries.ts]
  → PostgreSQL via Drizzle  [src/lib/db/client.ts + schema.ts]
```

---

## Specific failure vectors to investigate, in priority order

### 1. The `isLoading` flag has no timeout cap (MOST LIKELY ROOT CAUSE)

In `src/app/page.tsx` line 158:
```ts
const isLoading = (geoLoading && !geoError) || (spacesLoading && spaces.length === 0);
```

The comment above it says *"cap at 8s in case geo never fires"* — but **no 8-second cap is actually implemented**. If the browser's geolocation prompt never appears (dismissed, blocked at OS level, running in an iframe without permissions policy, or on some mobile browsers that silently suppress it), `geoLoading` stays `true` forever and `isLoading` is stuck at `true`. The skeleton cards show forever.

**How to verify:** Open DevTools → Console. Does `geoLoading` ever become false? Add a `console.log('[geo]', { geoLoading, geoError, geoCity })` inside the `Home` component and watch the sequence.

**Fix:** Add a real 8-second timeout to `useGeolocation()` in `src/lib/geo/use-geolocation.ts`. In the `useEffect`, set a `setTimeout` for 8000ms that calls `setState(s => ({ ...s, loading: false, error: s.error ?? "Location timed out. Search for a city." }))` if `loading` is still true. Clear the timeout on cleanup.

---

### 2. DATABASE_URL not set → API returns 500 → error state set but skeletons might linger

`src/lib/db/client.ts` throws at **module load time** if `DATABASE_URL` is missing:
```ts
if (!connectionString) {
  throw new Error("DATABASE_URL is not set...");
}
```

This means any call to `/api/spaces` will return a 500. In `page.tsx` lines 139–144, a 500 is caught and sets `spacesError` and clears `spacesLoading`. So skeletons *should* go away — but only after a city resolves. If geolocation is also stuck (see #1 above), the error from the API is hidden behind the skeleton indefinitely.

**How to verify:** Open DevTools → Network tab → filter by `/api/spaces`. Does a request get made? What is the response code? Check `.env.local` at the project root — it must contain a valid `DATABASE_URL` pointing to a running PostgreSQL instance with PostGIS enabled.

**Fix (if missing):** Set `DATABASE_URL=postgresql://user:password@host:port/dbname` in `.env.local`. Restart the dev server.

---

### 3. Database tables exist but are empty → EmptyState shows (not skeletons, but still broken)

If `DATABASE_URL` is set and the DB connection works, but the `spaces` and `cities` tables have no rows (migrations ran but seed script never ran), then:
- `/api/cities` returns `{ cities: [] }` → geolocation hook finds no match → sets `geoError` → `geoLoading` goes to `false`
- `/api/spaces` returns `{ total: 0, spaces: [] }` → `setSpaces([])`, `setTotal(0)`, `setSpacesLoading(false)`
- With `spaces.length === 0` and `loading = false`, `SpaceList` renders `<EmptyState>` instead of skeletons

This means the user sees the "No spaces found here yet" message, not skeletons. If you're seeing skeletons and not an empty state, the issue is upstream (geo not resolving, or `activeCity` is still null).

**How to verify:** In a terminal at the project root, run:
```bash
psql $DATABASE_URL -c "SELECT count(*) FROM spaces;"
psql $DATABASE_URL -c "SELECT count(*) FROM cities;"
```
If both return 0, seed the database. Check `scripts/` or `drizzle/` for a seed script.

---

### 4. The `activeCity` is never set → `SpaceList` is never rendered at all

In `page.tsx` line 251:
```tsx
{(activeCity || geoLoading) && (
  <main>
    ...
    <SpaceList ... loading={isLoading} />
  </main>
)}
```

If `geoLoading` is `false` (geo completed or errored) AND `activeCity` is `null` (no city set from geo, no city searched manually), this entire block is skipped. The user sees the "Search for a city above" prompt instead of skeletons.

The skeletons are only shown when `(activeCity || geoLoading)` is truthy AND `isLoading` is true. So skeletons require at least one of: geo still loading, or a city selected but spaces fetch in progress.

**How to verify:** Add `console.log('[state]', { activeCity, geoLoading, geoError, isLoading })` in `Home()`.

---

### 5. `fetchSpaces` useCallback dependency causes re-abort loop

In `page.tsx` lines 122–154:

```ts
const fetchSpaces = useCallback(async (signal: AbortSignal) => { ... },
  [activeCity, activeFilters, lat, lng]  // deps
);

useEffect(() => {
  const controller = new AbortController();
  fetchSpaces(controller.signal);
  return () => controller.abort();
}, [fetchSpaces]);  // re-runs whenever fetchSpaces changes identity
```

`lat` and `lng` come from `useGeolocation()`. If `lat`/`lng` are updated as a new state object (not primitives), `fetchSpaces` would get a new identity every render, causing: fetch starts → re-render → old signal aborted → `spacesLoading` set back to `true` → skeletons → repeat.

**How to verify:** Check `useGeolocation()` in `src/lib/geo/use-geolocation.ts` — `lat` and `lng` are primitives (`number | null`), so they shouldn't cause extra re-renders. However, double-check by adding a `console.count('fetchSpaces identity change')` log or wrapping `fetchSpaces` identity tracking with a ref.

**If this is happening:** The fix is to either move `lat` and `lng` into a ref instead of dependencies of `fetchSpaces`, or debounce the effect.

---

### 6. PostGIS query crashes when `lat`/`lng` are provided

In `src/lib/db/queries.ts` lines 30–42, when user coordinates are present, a raw `db.execute(sql`...`)` is used with `ST_Distance`. If PostGIS is not installed or the `geography` type is not available, this throws and the API returns 500.

The non-coordinates path (Drizzle `.select()` query, lines 55–70) does not use PostGIS and would succeed even without it.

**How to verify:** Hit the API directly in the browser or via curl:
```bash
# Without coordinates — should work even without PostGIS
curl "http://localhost:3000/api/spaces?city=denver-co"

# With coordinates — requires PostGIS
curl "http://localhost:3000/api/spaces?city=denver-co&lat=39.73&lng=-104.99"
```
If the first works and the second returns 500, PostGIS is missing. Check server logs for `function st_distance(geography...) does not exist`.

**Fix:** Enable PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;` on your database. Or if PostGIS is unavailable, add a fallback in `getSpacesByCity` to skip the proximity sort when the PostGIS query fails.

---

## Debugging checklist — run these in order

1. **Open browser DevTools → Console.** Look for any errors on load. Copy the full error messages.

2. **Open DevTools → Network tab, filter by `api`.** Reload the page. Do you see requests to `/api/geocode`, `/api/cities`, `/api/spaces`? What are their status codes?

3. **Check geolocation prompt.** Does the browser ask for location permission? What happens if you click "Allow" vs "Block"? Does the loading state ever resolve?

4. **Add these console logs to `page.tsx` (inside the `Home` component body, before the return):**
   ```ts
   console.log('[page]', { geoLoading, geoError, geoCity, activeCity, spacesLoading, spacesError, spaces: spaces.length, isLoading });
   ```
   Watch the sequence of log lines. The skeletons disappear when `isLoading` becomes false. Figure out which flag is keeping `isLoading` stuck at `true`.

5. **Test the API directly:**
   ```bash
   # Replace with a city slug that exists in your database
   curl "http://localhost:3000/api/spaces?city=denver-co"
   ```
   - `200` with `{ spaces: [...] }` → API is fine, issue is in geo/state flow
   - `200` with `{ spaces: [] }` → DB is empty, needs seeding
   - `500` → DB connection error; check `DATABASE_URL` in `.env.local` and server logs

6. **Check server terminal output.** Any errors printed there are from the API routes and DB layer — they won't appear in the browser console.

---

## Fix summary (implement after identifying root cause)

**If cause is #1 (geo timeout missing):** Add an 8s timeout to `useGeolocation.ts`. Example:
```ts
// Inside the useEffect, after calling navigator.geolocation.getCurrentPosition(...)
const geoTimeout = setTimeout(() => {
  setState(s => {
    if (!s.loading) return s; // already resolved, do nothing
    return { ...s, loading: false, error: "Location timed out. Search for a city instead." };
  });
}, 8000);
return () => clearTimeout(geoTimeout);
```

**If cause is #2 (missing DATABASE_URL):** Set it in `.env.local`, restart dev server.

**If cause is #3 (empty DB):** Run the seed script to populate `cities` and `spaces` tables.

**If cause is #6 (PostGIS missing):** Run `CREATE EXTENSION postgis;` on the database, or add a try/catch around the PostGIS query in `queries.ts` that falls back to a name-ordered query without distance.

---

## Files to edit (by likely fix)

| Fix | File |
|---|---|
| Geo timeout | `src/lib/geo/use-geolocation.ts` |
| DATABASE_URL | `.env.local` (project root) |
| DB seeding | `scripts/seed.ts` or `drizzle/` migrations |
| PostGIS fallback | `src/lib/db/queries.ts` |
| Fetch loop | `src/app/page.tsx` (fetchSpaces deps) |

Do not add placeholder data or mock responses. Fix the actual data pipeline.
