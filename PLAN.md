# FreeTime Implementation Plan

**Approach**: List view first, canvas/map view later.
**Aesthetic**: Studio Ghibli / Kiki's Delivery Service 2D warmth, built on Sage Component Kit tokens.
**Animations**: CSS-only (transitions, @keyframes, custom easing). Zero animation dependencies.
**Data**: PostgreSQL + PostGIS connected from day one via Drizzle ORM.

---

## Architecture Principle: View-Agnostic Data Layer

The single most important architectural decision is keeping the data and state layers completely independent of the view. This is what makes the future canvas/map addition a drop-in rather than a rewrite.

```
page.tsx (data fetching, filter state, selection state)
├── CitySearchBar          ← shared across all views
├── FilterBar              ← shared across all views
├── ViewToggle             ← hidden until Phase 2; wired to a view state
├── ListView               ← Phase 1 (receives spaces[], selectedId, onSelect)
├── CanvasView             ← Phase 2 (same props interface as ListView)
└── SpaceDetail            ← shared across all views
```

Both `ListView` and the future `CanvasView` receive identical props:

```typescript
interface SpaceViewProps {
  spaces: Space[];
  userLocation: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}
```

This contract is the boundary. Everything above it (fetching, filtering, geolocation) is shared. Everything below it (how spaces are rendered) is view-specific.

---

## Phase 1: Foundation (Database, Tokens, Shell)

### 1A — PostgreSQL + PostGIS + Drizzle Setup

Set up the real data layer from the start so there's no mock-to-real migration later.

**Files to create:**

```
src/lib/db/client.ts          — Drizzle client initialization (postgres + drizzle-orm)
src/lib/db/schema.ts          — Drizzle schema: spaces, cities tables with PostGIS geography columns
src/lib/db/queries.ts         — Query functions: getSpacesByCity, getCities, proximity sort via ST_Distance
drizzle/0001_initial.sql      — Migration: create tables, PostGIS extension, spatial indexes
scripts/seed.ts               — Seed script: 20-30 real spaces across 2-3 cities (Denver, Austin, Bologna)
```

**Schema (Drizzle):**

```typescript
// src/lib/db/schema.ts
import { pgTable, text, real, varchar, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const spaceTypeEnum = pgEnum("space_type", [
  "cafe", "coworking", "library", "park", "plaza", "transit", "lobby", "other"
]);

export const pricetypeEnum = pgEnum("price_type", ["free", "paid", "purchase-required"]);
export const noiseLevelEnum = pgEnum("noise_level", ["quiet", "moderate", "loud"]);

export const spaces = pgTable("spaces", {
  id: text("id").primaryKey(),            // "sp_abc123"
  name: text("name").notNull(),
  type: spaceTypeEnum("type").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),  // city slug: "denver-co"
  amenities: text("amenities").array().notNull(),
  tags: text("tags").array().notNull(),
  priceType: pricetypeEnum("price_type").notNull(),
  noiseLevel: noiseLevelEnum("noise_level").notNull(),
  hours: jsonb("hours"),                  // { open: "09:00", close: "20:00" } | null
  description: text("description"),
  imageUrl: text("image_url"),
  websiteUrl: text("website_url"),
});

export const cities = pgTable("cities", {
  slug: varchar("slug", { length: 100 }).primaryKey(),
  name: text("name").notNull(),
  region: varchar("region", { length: 50 }),
  country: varchar("country", { length: 10 }).notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
});
```

**Proximity query pattern:**

```sql
SELECT *, ST_Distance(
  ST_MakePoint(lng, lat)::geography,
  ST_MakePoint($userLng, $userLat)::geography
) / 1000 AS distance_km
FROM spaces
WHERE city = $citySlug
ORDER BY distance_km ASC
LIMIT $limit OFFSET $offset;
```

**Environment:**

```
DATABASE_URL=postgresql://user:pass@localhost:5432/freetime
```

### 1B — Tailwind Configuration with Sage Design Tokens

Extend Tailwind to use the Sage Component Kit tokens natively, so every utility class maps to the design system.

**File: `tailwind.config.ts`** (or extend within `src/styles/`)

```typescript
// Token integration in Tailwind v4 via CSS theme variables
// Added to globals.css or a dedicated tokens.css file
```

**File: `src/styles/tokens.css`** — All Sage tokens as CSS custom properties:

```css
:root {
  /* Brand */
  --color-brand-blue: #1E526F;
  --color-brand-red: #7D0A16;

  /* Actions */
  --color-primary-action: #30B6E7;
  --color-secondary-action: #575040;
  --color-active-state: #85CEDE;
  --color-active-state-secondary: #BF9A49;

  /* Surfaces */
  --color-background: #EDE6DE;
  --color-foreground: #FFFDFB;
  --color-accent: #E8DDA2;

  /* Text */
  --color-text-primary: #1B2323;
  --color-text-secondary: #595640;
  --color-text-disabled: #ADABA5;
  --color-neutral-text: #6C7276;

  /* Semantic */
  --color-error: #CC3926;
  --color-warning: #D98900;
  --color-warning-yellow: #FFB80F;
  --color-success: #00803F;
  --color-disabled: #A5B1B8;

  /* Extended */
  --color-light-blue: #60E1F0;
  --color-dark-blue: #096694;
  --color-dark-orange: #875C00;
  --color-bright-magenta: #FF4978;
  --color-pale-mustard: #D9D059;
  --color-lime-green: #16D113;
  --color-dark-magenta: #902944;

  /* Typography */
  --font-sans: "Hiragino Sans", "Hiragino Kaku Gothic Pro", "Noto Sans", system-ui, sans-serif;

  /* Spacing (base: 16px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 50%;

  /* Shadows (warm, never pure black) */
  --shadow-sm: 0 2px 8px rgba(89, 86, 64, 0.08);
  --shadow-md: 0 4px 16px rgba(89, 86, 64, 0.12);

  /* Animation easings */
  --ease-enter: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-exit: cubic-bezier(0.0, 0.0, 0.58, 1.0);

  /* Paper texture (applied to background surfaces) */
  --texture-grain-opacity: 0.03;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-action: #1F83BD;
    --color-neutral-text: #969EA3;
  }
}
```

### 1C — App Shell and Layout

Replace the default Next.js starter with the FreeTime shell.

**File: `src/app/layout.tsx`** — Updated root layout:

- Load Noto Sans from Google Fonts as the web fallback for Hiragino Sans
- Set `--font-sans` CSS variable
- Apply `bg-[var(--color-background)]` and paper texture overlay
- Metadata: title "FreeTime", description matching README

**File: `src/app/globals.css`** — Updated:

- Import `tokens.css`
- Import Tailwind
- Apply paper grain texture via a subtle noise SVG background on `body`
- Base body styles using Sage tokens
- `prefers-reduced-motion` media query to disable all transitions globally

**File: `src/app/page.tsx`** — Main app page (server component wrapper):

```
<main>
  <Header>
    <CitySearchBar />
    <SpaceCountBadge />
  </Header>
  <FilterBar />
  <SpaceListContainer />  ← client component boundary
</main>
```

### 1D — Shared TypeScript Types

**File: `src/lib/types/space.ts`**

```typescript
export type SpaceType = "cafe" | "coworking" | "library" | "park" | "plaza" | "transit" | "lobby" | "other";
export type Amenity = "wifi" | "outlets" | "seating" | "bathroom" | "storage" | "quiet" | "parking";
export type Tag = "free" | "paid" | "cafe" | "wifi" | "bathroom" | "storage" | "coworking" | "outdoor";
export type PriceType = "free" | "paid" | "purchase-required";
export type NoiseLevel = "quiet" | "moderate" | "loud";

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  lat: number;
  lng: number;
  address: string;
  city: string;
  amenities: Amenity[];
  tags: Tag[];
  priceType: PriceType;
  noiseLevel: NoiseLevel;
  hours: { open: string; close: string } | null;
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

// The shared contract for any space view (list, canvas, map)
export interface SpaceViewProps {
  spaces: Space[];
  userLocation: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}
```

---

## Phase 2: API Routes

**File: `src/app/api/spaces/route.ts`**

- Accepts query params: `city` (required), `lat`, `lng`, `filters`, `limit`, `offset`
- Calls `getSpacesByCity()` from `src/lib/db/queries.ts`
- If `lat`/`lng` provided, uses PostGIS `ST_Distance` for proximity sorting
- If `filters` provided, adds `WHERE amenities @> ARRAY[...]` clause
- Returns `{ total: number, spaces: Space[] }`

**File: `src/app/api/cities/route.ts`**

- Accepts query param: `q` (optional search string)
- Calls `getCities()` from `src/lib/db/queries.ts`
- Uses `ILIKE` for fuzzy city name matching
- Returns `{ cities: City[] }`

---

## Phase 3: Core Components (List View)

### Component Build Order

Build from the inside out — smallest primitives first, composed into larger views.

### 3A — Common Primitives (`src/components/common/`)

**`tag.tsx`** — Renders a space tag (free, paid, cafe, wifi, etc.)

- Maps each tag to its Sage color (see Tag System in design.md)
- Label 1 typography (12px, weight 300)
- 4px border radius, 4px/8px vertical/horizontal padding
- Entry animation: fade-in scale (200ms, `--ease-enter`)

**`button.tsx`** — Sage button variants: Primary, Secondary, Tertiary, Ghost

- Min touch target: 44x44px on mobile
- Hover transitions: background color crossfade, 200ms
- Active state: subtle scale (0.97) with 100ms transition
- Focus ring: 2px solid `--color-primary-action`

**`skeleton.tsx`** — Shimmer loading placeholder

- Animated gradient sweep using CSS `@keyframes`
- Uses `--color-disabled` on `--color-background`
- `prefers-reduced-motion`: static gray block, no animation

**`input.tsx`** — Sage text input

- Focus border transitions to `--color-primary-action` over 200ms
- Subtle inner shadow on `--color-foreground` background

### 3B — City Search (`src/components/search/`)

**`city-search-bar.tsx`** — Prominent search input with autocomplete

- Fetches from `/api/cities?q=` on input (debounced 300ms)
- Autocomplete dropdown: slides down with `--ease-enter`, 250ms
- Items highlight on hover/focus with `--color-active-state` at 10% opacity
- Selected city triggers space reload
- Keyboard navigable (arrow keys, Enter, Escape)
- `role="combobox"` with `aria-expanded`, `aria-activedescendant`

**`space-count-badge.tsx`** — Displays "142 spaces in Denver"

- Counter animates on value change: number ticks up/down using CSS `@keyframes` with `--ease-enter`
- Heading 1 typography (14px, semibold)

### 3C — Filters (`src/components/filters/`)

**`filter-bar.tsx`** — Horizontal scrolling row of filter chips

- Horizontal scroll on mobile with `-webkit-overflow-scrolling: touch`
- `role="group"` with `aria-label="Amenity filters"`

**`filter-chip.tsx`** — Individual toggle chip (wifi, outlets, seating, bathroom, storage)

- Default: `--color-foreground` background, `--color-text-secondary` text
- Active: `--color-primary-action` background, white text
- Background color crossfade on toggle: 200ms, `--ease-enter`
- Min width: 44px, min height: 44px (touch target compliance)
- Announces state to screen readers: "Wifi filter on" / "Wifi filter off"
- Icon + label layout. Icons at 16px, slightly rounded stroke style per design.md iconography

### 3D — List View (`src/components/list/`)

**`list-view.tsx`** — Receives `SpaceViewProps`, renders sorted list

- Implements `SpaceViewProps` interface (the shared view contract)
- Renders `SpaceListItem` for each space
- Staggered entry animation on load (see Motion section below)
- Empty state: illustrated message + "Clear filters" tertiary button
- Loading state: 3-5 `Skeleton` components

**`space-list-item.tsx`** — Compact row for one space

- Space name (Heading 2: 16px, semibold)
- Space type label (Label 1: 12px)
- Distance in km/mi (Body 1: 14px, `--color-text-secondary`)
- Top 3 amenity icons (16px, inline)
- Open/closed status indicator (dot: `--color-success` or `--color-error`)
- Card surface: `--color-foreground` background, `--shadow-sm`, 8px radius
- Hover: subtle background shift to `--color-active-state` at 10% opacity, 200ms
- Tap/click: triggers `onSelect(space.id)`
- `role="button"`, `tabindex="0"`, `aria-label` with space name and distance

### 3E — Space Detail (`src/components/space-card/`)

**`space-detail.tsx`** — Expanded detail view for a selected space

- Space name (Heading 4: 24px, semibold)
- Type and noise level
- Full amenity list as Tag components
- Tags row (free/paid, cafe, wifi, bathroom, etc.)
- Address with distance
- Hours with open/closed calculation
- Description (Body 2: 16px)
- Action buttons: "Get Directions" (Primary), "Visit Website" (Secondary)
- Mobile: slides up as a panel covering ~85% viewport, 350ms `--ease-enter`
- Desktop: appears as inline panel to the right of the list, 300ms slide-in
- Close button (Ghost button, top-right)
- `role="dialog"`, focus trap, Escape to close

### 3F — Geolocation (`src/lib/geo/`)

**`use-geolocation.ts`** — Custom hook for browser geolocation

- Requests permission on mount
- Returns `{ lat, lng, loading, error }`
- On success: reverse geocode to city via Nominatim (free, no token needed)
- On failure: sets error state, app falls back to manual city search

**`reverse-geocode.ts`** — Nominatim reverse geocoding utility

- `GET https://nominatim.openstreetmap.org/reverse?lat=...&lon=...&format=json`
- Extracts city name, matches to a city slug

---

## Phase 4: State Management

**File: `src/lib/store.ts`** — Zustand store

```typescript
interface AppState {
  // City
  activeCity: City | null;
  setActiveCity: (city: City) => void;

  // Filters
  activeFilters: Amenity[];
  toggleFilter: (filter: Amenity) => void;
  clearFilters: () => void;

  // Selection
  selectedSpaceId: string | null;
  selectSpace: (id: string | null) => void;

  // User location
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number }) => void;

  // View mode (prepared for Phase 6)
  viewMode: "list" | "canvas";
  setViewMode: (mode: "list" | "canvas") => void;
}
```

Note: `viewMode` is defined now but the toggle is hidden in the UI until Phase 6. This costs nothing and means the store doesn't need to change when the canvas arrives.

---

## Phase 5: Responsive Layouts

### Mobile (0 - 767px)

```
┌─────────────────────────┐
│  🔍 City Search Bar     │  ← sticky top
├─────────────────────────┤
│  [Wifi] [Outlets] [...] │  ← horizontal scroll filter chips
├─────────────────────────┤
│  "87 spaces in Denver"  │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │ Central Library    │  │  ← space list items
│  │ 📍 0.8km · 📶 🔌  │  │    staggered fade-in
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Blue Sparrow Cafe  │  │
│  │ 📍 1.2km · 📶 ☕  │  │
│  └───────────────────┘  │
│  ...                    │
└─────────────────────────┘

Detail: slides up as panel (85vh)
```

### Desktop (1024px+)

```
┌──────────────────────────────────────────────────────┐
│  🔍 City Search Bar                    "87 spaces"   │
├──────────────────────────────────────────────────────┤
│  [Wifi] [Outlets] [Seating] [Bathroom] [Storage]     │
├────────────────────────┬─────────────────────────────┤
│                        │                             │
│  Space List            │  Space Detail Panel         │
│  (scrollable)          │  (shows when space          │
│                        │   is selected)              │
│  ┌──────────────────┐  │                             │
│  │ Central Library   │  │  Central Library            │
│  │ 0.8km · 📶 🔌    │  │  Library · Quiet            │
│  └──────────────────┘  │  [free] [wifi] [bathroom]   │
│  ┌──────────────────┐  │  0.8km · 10 W 14th Ave      │
│  │ Blue Sparrow     │  │  Open until 8pm             │
│  │ 1.2km · 📶 ☕    │  │                             │
│  └──────────────────┘  │  [Get Directions] [Website] │
│  ...                   │                             │
│                        │                             │
└────────────────────────┴─────────────────────────────┘
```

On desktop, when no space is selected, the list takes full width. When a space is selected, the detail panel slides in from the right (300ms, `--ease-enter`) and the list narrows.

---

## Phase 6: Canvas View (Future)

When it's time to add the proximity canvas, here's what gets built:

**`src/components/canvas/proximity-canvas.tsx`**

- Implements `SpaceViewProps` (same interface as ListView)
- User dot at center
- Space dots plotted at relative positions using equirectangular projection
- Distance rings at 0.5km, 1km, 2km (SVG circles)
- Dots are DOM elements (real buttons, accessible, tappable at 44px)
- Dot colors mapped to space type
- Simple overlap detection to spread clustered dots
- Tap a dot → calls `onSelect(space.id)` → same SpaceDetail opens

**`src/components/canvas/distance-ring.tsx`** — SVG concentric circle with label

**`src/components/canvas/space-dot.tsx`** — Positioned dot/button for one space

**Integration**: Add `<CanvasView />` as a sibling to `<ListView />` in `page.tsx`, gated by `viewMode` from the store. Unhide the `ViewToggle` component. Done.

**No changes needed to**: API routes, database, Zustand store, filters, search, space detail, geolocation, or any of the common components.

---

## Motion & Animation Spec (CSS-Only)

All animations use CSS transitions and `@keyframes`. No JavaScript animation libraries.

### Global Easing Tokens

```css
--ease-enter: cubic-bezier(0.34, 1.56, 0.64, 1);  /* slight overshoot, like a leaf landing */
--ease-exit: ease-out;
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Animation Catalog

#### List Item Staggered Entry

When the space list loads or filter results change, items fade and slide in one by one.

```css
.space-list-item {
  opacity: 0;
  transform: translateY(12px);
  animation: list-item-enter 300ms var(--ease-enter) forwards;
}

/* Stagger via nth-child or inline style --delay */
.space-list-item:nth-child(1) { animation-delay: 0ms; }
.space-list-item:nth-child(2) { animation-delay: 40ms; }
.space-list-item:nth-child(3) { animation-delay: 80ms; }
/* ... up to ~10 items, rest appear instantly */

@keyframes list-item-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

The slight overshoot in `--ease-enter` gives each item a gentle "settling" feel — like paper cards being laid on a table one by one. This matches the Ghibli naturalistic motion principle.

#### Filter Chip Toggle

```css
.filter-chip {
  background-color: var(--color-foreground);
  color: var(--color-text-secondary);
  transition: background-color 200ms var(--ease-enter),
              color 200ms var(--ease-enter),
              box-shadow 200ms var(--ease-enter);
}

.filter-chip[aria-pressed="true"] {
  background-color: var(--color-primary-action);
  color: white;
  box-shadow: var(--shadow-sm);
}
```

No snap. Colors crossfade smoothly like watercolor bleeding from one hue to another.

#### Space Detail Panel (Mobile Slide-Up)

```css
.space-detail-panel {
  transform: translateY(100%);
  transition: transform 350ms var(--ease-enter);
}

.space-detail-panel[data-open="true"] {
  transform: translateY(0);
}
```

The overshoot easing makes the panel slide up slightly past its resting position and settle back — like pulling up a window shade (per design.md).

#### Space Detail Panel (Desktop Slide-In)

```css
.space-detail-desktop {
  transform: translateX(100%);
  opacity: 0;
  transition: transform 300ms var(--ease-enter),
              opacity 200ms ease-out;
}

.space-detail-desktop[data-open="true"] {
  transform: translateX(0);
  opacity: 1;
}
```

#### Skeleton Shimmer

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-disabled) 25%,
    var(--color-background) 50%,
    var(--color-disabled) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}
```

#### City Search Autocomplete Dropdown

```css
.autocomplete-dropdown {
  transform: translateY(-8px);
  opacity: 0;
  transition: transform 250ms var(--ease-enter),
              opacity 200ms ease-out;
}

.autocomplete-dropdown[data-visible="true"] {
  transform: translateY(0);
  opacity: 1;
}
```

#### Space Count Number Tick

```css
@keyframes count-tick {
  0% { transform: translateY(8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.space-count-value {
  display: inline-block;
  animation: count-tick 300ms var(--ease-enter);
}
```

#### Card Hover Warmth (Desktop)

```css
.space-list-item {
  transition: background-color 200ms ease-out,
              box-shadow 200ms ease-out;
}

.space-list-item:hover {
  background-color: color-mix(in srgb, var(--color-active-state) 10%, var(--color-foreground));
  box-shadow: var(--shadow-md);
}
```

A gentle warmth spreads across the card on hover — like sunlight shifting across a surface.

---

## Ghibli Aesthetic Integration Points

The Kiki's Delivery Service feel isn't achieved through a single "Ghibli component." It's an accumulation of small choices across the entire app. Here's where each piece lives:

### Paper Texture

Applied to the body background via a tiling SVG noise pattern at 3% opacity over `--color-background (#EDE6DE)`. This makes the app feel like it's printed on warm paper rather than rendered on a screen.

```css
body {
  background-color: var(--color-background);
  background-image: url("data:image/svg+xml,..."); /* inline SVG noise */
  background-repeat: repeat;
}
```

### Card Physicality

Cards use `--color-foreground` (#FFFDFB) — slightly warmer than white. A 1px inner shadow on the bottom-right edge suggests thick paper stock. The warm shadow (`--shadow-sm` using Text Secondary RGB values) avoids the clinical feel of pure-black shadows.

### Color Warmth

The entire Sage palette leans warm: parchment background, cream foreground, golden accent, olive-toned text. There are no cool grays anywhere. This creates the "late afternoon in a coastal town" mood described in design.md.

### Motion Character

The `--ease-enter` overshoot curve is the most Ghibli element in the codebase. Things don't snap into place — they arrive with momentum and settle, like a leaf landing or a door swinging shut. The 40ms stagger on list items creates a cascade that feels like wind riffling through pages.

### Soft Borders

Per design.md, borders use `--color-text-disabled` at 50% opacity. Where possible, they're omitted entirely in favor of spacing and background contrast. This keeps surfaces feeling open and breathable.

### Iconography

Amenity icons (wifi, outlet, seating, etc.) should use 2px rounded strokes — more woodcut than pixel-perfect. This is a subtle but important detail that prevents the UI from feeling like a standard Material/SF Symbols app.

---

## Build Order (Sequenced)

| Step | What | Files | Depends On |
|------|------|-------|------------|
| 1 | Tailwind tokens + globals.css + paper texture | `tokens.css`, `globals.css`, `tailwind.config.ts` | Nothing |
| 2 | Shared types | `src/lib/types/space.ts` | Nothing |
| 3 | Database + schema + migrations | `src/lib/db/*`, `drizzle/*` | Nothing |
| 4 | Seed data | `scripts/seed.ts` | Step 3 |
| 5 | API routes | `src/app/api/spaces/route.ts`, `src/app/api/cities/route.ts` | Steps 2, 3 |
| 6 | Zustand store | `src/lib/store.ts` | Step 2 |
| 7 | Common components (Tag, Button, Skeleton, Input) | `src/components/common/*` | Step 1 |
| 8 | Geolocation hook | `src/lib/geo/*` | Step 6 |
| 9 | City search bar + autocomplete | `src/components/search/*` | Steps 5, 6, 7 |
| 10 | Filter bar + chips | `src/components/filters/*` | Steps 6, 7 |
| 11 | Space list item | `src/components/list/space-list-item.tsx` | Step 7 |
| 12 | List view (full) | `src/components/list/list-view.tsx` | Steps 5, 6, 11 |
| 13 | Space detail panel | `src/components/space-card/space-detail.tsx` | Steps 6, 7 |
| 14 | App shell + page.tsx | `src/app/layout.tsx`, `src/app/page.tsx` | Steps 8-13 |
| 15 | Responsive polish + motion QA | All component files | Step 14 |
| 16 | Accessibility audit | All component files | Step 15 |
| — | **Phase 6 (future)**: Canvas view | `src/components/canvas/*`, view toggle | Steps 1-16 complete |

---

## Dependencies to Install

```bash
# Core (already installed)
# next, react, react-dom, tailwindcss, typescript

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# State
npm install zustand

# No animation library needed — CSS only
# No map library needed — list view only
```

Total new production dependencies: **3** (drizzle-orm, postgres, zustand). This keeps the bundle lean per CLAUDE.md.

---

## What Is NOT in This Plan

These are explicitly deferred and should not be built until the list view is complete and validated:

- Map view (Mapbox GL JS / Leaflet)
- Canvas proximity view (Phase 6, defined above)
- View toggle UI (hidden until canvas is ready)
- Service worker / offline support
- Image upload for spaces
- Calendar / availability features
- User accounts / authentication
