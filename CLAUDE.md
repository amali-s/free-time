# CLAUDE.md -- Agent Guidelines for FreeTime

## Project Summary

FreeTime is a mobile-first web app that helps people find public and work-friendly spaces to spend extended time in. Spaces include cafes, coworking day-passes, libraries, parks, plazas, and transit hubs. Users filter by amenities (wifi, outlets, seating, bathrooms, storage) and flip through nearby spaces in a swipe deck — swipe right to save, left to pass, tap to open the space in their default map app.

## Agent Behavior

### Tone and approach
- Be practical and direct. This is a utility app -- favor function over decoration.
- Default to the simplest implementation that works. Don't over-abstract.
- When making UI decisions, think from the perspective of someone in a hurry (e.g., Brendon with a meeting in 15 minutes). Speed and clarity beat visual flair.

### Code conventions
- Use TypeScript throughout. Prefer strict types over `any`.
- Use functional components with hooks (no class components).
- Name files in kebab-case. Name components in PascalCase.
- Co-locate component styles, tests, and types in the same directory.
- Keep components small and composable. One component per file.
- Use CSS modules or Tailwind utility classes for styling (align with design tokens from Sage Component Kit).
- Write semantic HTML. Use landmarks (`<main>`, `<nav>`, `<aside>`) and ARIA labels where interactive elements aren't self-describing.

### Priorities
1. **Usability on mobile** -- Most users will be on their phone in an unfamiliar place. Mobile is the primary viewport.
2. **Fast time-to-result** -- Minimize taps/clicks between opening the app and finding a suitable space.
3. **Accessibility** -- WCAG 2.1 AA compliance. Touch targets >= 44px. Sufficient color contrast. Honor `prefers-reduced-motion` (the swipe deck disables springs/tilt when the OS setting is on).
4. **Performance** -- Lazy-load images and defer non-critical work. Target < 3s first contentful paint on 3G.

### What NOT to do
- Don't add features not described in README.md without asking first.
- Don't create new design tokens. Use the Sage Component Kit tokens defined in `design.md`.
- Don't install large dependencies without justification. Keep the bundle lean.
- Don't mock APIs in production code. Use environment-based configuration to switch between local and remote data sources.

---

## Technical Requirements

### Tech Stack
| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components for initial load; client components for the swipe deck and other interactive pieces |
| Language | TypeScript | Strict mode enabled |
| Styling | Tailwind CSS v4 + CSS variables | Sage design tokens defined in `src/styles/tokens.css` |
| Swipe gestures | framer-motion | Drag/spring physics for the swipe deck; `useReducedMotion` honors OS settings |
| State | Zustand (with `persist` middleware) | Filter state, selected space, geolocation in-memory; `savedSpaces` persisted to localStorage |
| API | Next.js Route Handlers | `/api/spaces`, `/api/cities`, `/api/geocode` |
| Database | Supabase Postgres + PostGIS | Geospatial queries for proximity sorting via `ST_Distance` |
| ORM | Drizzle ORM | Type-safe, lightweight |
| Storage | Supabase Storage | Holds enriched space photos uploaded by `scripts/enrich-images.ts` |
| Geolocation | Browser Geolocation API | Reverse-geocoded via `/api/geocode` (server-side Google call) |
| Image enrichment | Google Places Photos API | Backfills `image_url` for new spaces; run via `npm run db:enrich-images` |

### API Endpoints

#### `GET /api/spaces`
Returns spaces for a given city, with optional amenity filters.

Query parameters:
- `city` (required) -- city slug, e.g. `denver-co`
- `lat`, `lng` (optional) -- user coordinates for proximity sorting
- `filters` (optional) -- comma-separated amenity keys: `wifi`, `outlets`, `seating`, `bathroom`, `storage`, `quiet`
- `limit` (optional, default 50) -- max results
- `offset` (optional, default 0) -- pagination offset

Response:
```json
{
  "total": 142,
  "spaces": [
    {
      "id": "sp_abc123",
      "name": "Central Library",
      "type": "library",
      "lat": 39.7392,
      "lng": -104.9903,
      "address": "10 W 14th Ave Pkwy, Denver, CO",
      "amenities": ["wifi", "outlets", "seating", "bathroom"],
      "tags": ["free", "wifi", "bathroom"],
      "priceType": "free",
      "noiseLevel": "quiet",
      "hours": { "open": "09:00", "close": "20:00" },
      "distanceKm": 0.8
    }
  ]
}
```

#### `GET /api/cities`
Returns searchable city list.

Query parameters:
- `q` (optional) -- search query string

Response:
```json
{
  "cities": [
    { "slug": "denver-co", "name": "Denver", "region": "CO", "country": "US", "lat": 39.7392, "lng": -104.9903 }
  ]
}
```

### Space Data Model

```typescript
interface Space {
  id: string;
  name: string;
  type: "cafe" | "coworking" | "library" | "park" | "plaza" | "transit" | "lobby" | "other";
  lat: number;
  lng: number;
  address: string;
  city: string;
  amenities: Amenity[];
  tags: Tag[];
  priceType: "free" | "paid" | "purchase-required";
  noiseLevel: "quiet" | "moderate" | "loud";
  hours: { open: string; close: string } | null;
  description?: string;
  imageUrl?: string;
  websiteUrl?: string;
}

type Amenity = "wifi" | "outlets" | "seating" | "bathroom" | "storage" | "quiet" | "parking";
type Tag = "free" | "paid" | "cafe" | "wifi" | "bathroom" | "storage" | "coworking" | "outdoor";
```

### Geolocation Flow
1. On app load, request browser geolocation permission.
2. If granted, hit `/api/geocode` to reverse-geocode coordinates to a city slug.
3. Set detected city as the active city and fetch spaces from `/api/spaces`.
4. If denied or unavailable, prompt the user to search for a city manually via `CitySearch`.

### Swipe Deck Interaction Model
The primary browse view is a 3-card pile rendered by `src/components/canvas/SwipeDeck.tsx`. The interaction contract:

- **Swipe right** → `useAppStore.saveSpace(id)` adds the space to `savedSpaces` (persisted to localStorage). Card flies right and the next card cycles in.
- **Swipe left** → dismiss. Card flies left and the next card cycles in. No persistence.
- **Tap** → opens the space in the user's native map app via `getMapsHref()` (`maps://` on iOS, `geo:` on Android, Google Maps web fallback elsewhere).
- **Below threshold drag** → spring-back to center.

Thresholds: 80px offset OR 450px/s velocity triggers a swipe. The new top card springs in from its previous middle-pile rotation; mid/back cards have deterministic ±5° rotation seeded by space id so the pile feels organic but not random per-render.

When `prefers-reduced-motion: reduce` is set, the deck disables rotation, scale offsets, and spring animations — the gesture still works but resolves instantly.

### Project Structure
```
free-time/
  src/
    app/                  # Next.js App Router pages and layouts
      api/
        spaces/route.ts
        cities/route.ts
        geocode/route.ts
      layout.tsx          # Exports viewport meta (device-width, viewportFit: cover)
      page.tsx            # Wires geolocation → city → SwipeDeck
    components/
      canvas/             # SwipeDeck (pile + gesture engine) and SpaceProfileCard
      list/               # SpaceList — alternate list rendering, currently unused at root
      filters/            # FilterBar, filter chips
      space-card/         # SpaceCard — accordion tile (used elsewhere; still includes Directions deep link)
      search/             # CitySearch + autocomplete
      common/             # AmenityTag, Chevron
    lib/
      db/                 # Drizzle client, schema, queries
      geo/                # use-geolocation hook, reverse-geocode, google-places, maps-link
      storage/            # upload-space-photo (Supabase Storage helper)
      types/              # Shared TypeScript types (Space, Amenity, City, …)
      placeholder-image.ts# Maps space type → fallback illustration
      store.ts            # Zustand store (with localStorage persist for savedSpaces)
    styles/               # tokens.css (Sage variables), global styles, motion easings
    utils/supabase/       # SSR-safe Supabase client/server/middleware factories
  public/                 # Static assets, illustrations, leaf-texture
  scripts/                # setup-db, seed, enrich-images
  drizzle/                # Migration files
```
