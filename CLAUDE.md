# CLAUDE.md -- Agent Guidelines for FreeTime

## Project Summary

FreeTime is a map-based web app that helps people find public and work-friendly spaces to spend extended time in. Spaces include cafes, coworking day-passes, libraries, parks, plazas, and transit hubs. Users filter by amenities (wifi, outlets, seating, bathrooms, storage) and browse via map or list view.

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
3. **Accessibility** -- WCAG 2.1 AA compliance. Touch targets >= 44px. Sufficient color contrast.
4. **Performance** -- Lazy-load map tiles and list items. Target < 3s first contentful paint on 3G.

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
| Framework | Next.js (App Router) | Server components for initial load; client components for map/interactivity |
| Language | TypeScript | Strict mode enabled |
| Styling | Tailwind CSS | Configured with Sage design tokens |
| Map | Mapbox GL JS | Interactive vector map with custom pins; fallback to Leaflet + OSM if no Mapbox token |
| State | Zustand | Lightweight; used for filter state, selected space, view mode |
| API | Next.js Route Handlers | `/api/spaces`, `/api/cities` |
| Database | PostgreSQL + PostGIS | Geospatial queries for proximity sorting |
| ORM | Drizzle ORM | Type-safe, lightweight |
| Geolocation | Browser Geolocation API | Reverse geocode to city via Mapbox or Nominatim |

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
2. If granted, reverse geocode coordinates to a city name (Mapbox Geocoding API or Nominatim).
3. Set detected city as the active city and fetch spaces.
4. If denied or unavailable, prompt the user to search for a city manually.

### Project Structure
```
free-time/
  src/
    app/                  # Next.js App Router pages and layouts
      api/
        spaces/route.ts
        cities/route.ts
      page.tsx
      layout.tsx
    components/
      map/                # Map view, pins, popups
      list/               # List view, list items
      filters/            # Filter bar, filter chips
      space-card/         # Space detail card
      search/             # City search
      common/             # Shared UI primitives (Button, Tag, Input)
    lib/
      db/                 # Database client, schema, queries
      geo/                # Geolocation utilities
      types/              # Shared TypeScript types
    styles/               # Global styles, Tailwind config, design tokens
  public/                 # Static assets, icons
  drizzle/                # Migration files
```
