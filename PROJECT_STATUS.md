# FreeTime — Project Status & Roadmap

**Last Updated:** May 10, 2026
**Current Phase:** Phase 4 (Polish & QA)
**Overall Completion:** ~75%

---

## What Shipped

### Phase 1: Foundation (Complete)

| Step | Task | Files |
|------|------|-------|
| 1 | Sage design tokens + global styles | `src/styles/tokens.css`, `src/app/globals.css` |
| 2 | Shared TypeScript types | `src/lib/types/space.ts` |
| 3 | Database schema + Drizzle setup | `src/lib/db/schema.ts`, `src/lib/db/client.ts` |
| 4 | Seed data scripts | `scripts/seed.ts` |
| 5 | App shell + layout | `src/app/layout.tsx` (viewport meta included), `src/app/globals.css` |
| 6 | Zustand store (with `persist` middleware for `savedSpaces`) | `src/lib/store.ts` |

### Phase 2: API Routes (Complete)

| Step | Task | Files |
|------|------|-------|
| 7 | `GET /api/spaces` — proximity sort + amenity filters | `src/app/api/spaces/route.ts` |
| 8 | `GET /api/cities` — fuzzy search | `src/app/api/cities/route.ts` |
| 9 | `GET /api/geocode` — reverse geocoding | `src/app/api/geocode/route.ts` |

### Phase 3: Core Components (Complete)

| Step | Task | Files |
|------|------|-------|
| 10 | Common primitives (AmenityTag, Chevron) | `src/components/common/` |
| 11 | Geolocation hook + reverse-geocode | `src/lib/geo/use-geolocation.ts`, `reverse-geocode.ts` |
| 12 | City search + autocomplete | `src/components/search/CitySearch.tsx` |
| 13 | Filter bar + chips | `src/components/filters/FilterBar.tsx` |
| 14 | Space card (accordion variant) | `src/components/space-card/SpaceCard.tsx` |
| 15 | Space list (alternate rendering) | `src/components/list/SpaceList.tsx` |
| 16 | App page + orchestration | `src/app/page.tsx` |

### Phase 4: Browse View — Swipe Deck (Complete)

The originally-planned Mapbox map view was deferred and replaced with a swipe deck as the primary browse interaction. This was the right call for a mobile-first utility — it gets the user to a single, decision-ready space faster than a map.

| Step | Task | Files |
|------|------|-------|
| 17 | Swipe deck pile + gesture engine (framer-motion) | `src/components/canvas/SwipeDeck.tsx` |
| 18 | Space profile card (full-bleed presentation card) | `src/components/canvas/SpaceProfileCard.tsx` |
| 19 | Save / pass / tap-to-maps interaction model | `SwipeDeck.tsx`, `useAppStore.saveSpace` |
| 20 | Reduced-motion support | `useReducedMotion()` in `SwipeDeck.tsx` |
| 21 | Persisted `savedSpaces` to localStorage | `src/lib/store.ts` (Zustand `persist` middleware) |

### Phase 5: Image Pipeline (Complete)

| Step | Task | Files |
|------|------|-------|
| 22 | `image_url` column + `imageEnrichedAt` watermark | `src/lib/db/schema.ts` |
| 23 | Google Places Photos lookup | `src/lib/geo/google-places.ts` |
| 24 | Supabase Storage upload helper | `src/lib/storage/upload-space-photo.ts` |
| 25 | Idempotent batch enrichment script | `scripts/enrich-images.ts` (`npm run db:enrich-images`) |
| 26 | Placeholder illustrations for un-enriched / no-match rows | `src/lib/placeholder-image.ts`, `public/illustrations/` |
| 27 | Remote image hosts allow-listed | `next.config.ts` (Google + Supabase) |

### Phase 6: Mobile Polish (Complete)

| Step | Task | Files |
|------|------|-------|
| 28 | Viewport meta — device-width, `viewportFit: cover` for notched iPhones | `src/app/layout.tsx` |
| 29 | Platform-aware maps deep link (`maps://` on iOS, `geo:` on Android, web fallback) | `src/lib/geo/maps-link.ts` |
| 30 | Wired into SwipeDeck tap and SpaceCard "Directions" button | `SwipeDeck.tsx`, `SpaceCard.tsx` |

---

## In Progress

**Polish & QA** — the remaining ~25% to MVP launch.

| Item | Notes |
|------|-------|
| Comprehensive accessibility audit | Keyboard nav, screen reader announcements, focus visible outlines, contrast (WCAG AA). The audit guide lives in `ACCESSIBILITY_AUDIT_GUIDE.md`; results in `ACCESSIBILITY_AUDIT_RESULTS.md`. |
| Lighthouse / Core Web Vitals baseline | Target: Performance ≥75, FCP <2.5s, LCP <4s, CLS <0.1 on 3G. |
| Common-primitive extraction | Inline button/input styles in `page.tsx` and `SpaceCard.tsx` should move into reusable `Button` / `Input` / `Skeleton` components. Low priority — current code works. |
| Cross-browser QA | iOS Safari, Android Chrome, desktop Chrome/Safari/Firefox on real devices. |
| Pre-existing lint warnings | `topIdxRef.current` accessed during render in `SwipeDeck.tsx`; `aria-expanded` on `<article>` in `SpaceCard.tsx`. Neither is a runtime bug; both should be cleaned up before launch. |

---

## Not Yet Started

### Future Features (Explicitly Deferred)

These were described in earlier planning docs but are out of scope for the MVP:

- **Map view** — A second, alongside-the-deck view backed by Mapbox or Leaflet. Originally Phase 6 in the v1 plan; superseded by the swipe deck. Could return as an alternate view if user research shows demand.
- **Service worker / offline support** — Cache the last city's spaces for offline browsing.
- **User accounts / authentication** — `savedSpaces` is currently device-local via localStorage. Cross-device sync needs auth.
- **User-submitted spaces** — Letting users add or correct spaces, with a moderation queue.
- **Calendar / availability** — Hours are in the data model; recurring closures and event-based hours are not.
- **Reviews / vibe tags beyond the controlled amenity list** — User-generated noise/vibe data.

---

## What's Working End-to-End

**Core flow:**
1. App opens → requests geolocation permission.
2. User location → `/api/geocode` → city slug.
3. City detected → `/api/spaces?city=…&lat=…&lng=…` → up to 50 spaces sorted by proximity.
4. Spaces render in the SwipeDeck.
5. Amenity filter chips trigger refetches.
6. City search swaps the active city.
7. Right swipe saves; left swipe dismisses; tap deep-links to the user's default map app.
8. Saved spaces persist across reloads via localStorage.

**Database:**
- Supabase Postgres + PostGIS, schema managed by Drizzle.
- Proximity sorting via `ST_Distance(geography, geography)`.
- Amenity filtering via array `@>` operator.

**Images:**
- Real photos for enriched rows (Google Places → Supabase Storage), placeholder illustrations for un-enriched rows.
- `npm run db:enrich-images` is idempotent — keyed on `imageEnrichedAt IS NULL`.

**Design system:**
- Sage tokens in CSS custom properties (`tokens.css`).
- Tailwind v4 + design tokens.
- Paper / leaf texture background.
- Motion easings defined; `prefers-reduced-motion` honored.

---

## Recommended Next Steps (Priority Order)

1. **Run `npm run db:enrich-images` against the production DB** so live cards show real photos. (`npm install server-only` is already done; the script is configured with `--conditions=react-server`.)
2. **Accessibility audit pass.** Use the checklist in `ACCESSIBILITY_AUDIT_GUIDE.md`. Highest-leverage gap is keyboard navigation for the swipe deck (currently mouse/touch only).
3. **Lighthouse baseline + image LCP optimization.** First-paint impact of the deck's hero image is the likely largest LCP contributor.
4. **Cross-browser smoke test on real devices.** Specifically iOS Safari (viewport meta is now wired up but real-device confirmation is worth it) and Android Chrome (verify the `geo:` URL chooser works).
5. **Clean up the two pre-existing lint warnings** in `SwipeDeck.tsx` and `SpaceCard.tsx`.
6. **Extract reusable Button / Input / Skeleton primitives** if a second view (e.g. the deferred map view, or a saved-spaces list) is on the near roadmap.

---

## Build Order Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Foundation | Complete | Database, types, design system done |
| Phase 2 — API Routes | Complete | All endpoints working |
| Phase 3 — Core Components | Complete | Filters, city search, list, accordion card |
| Phase 4 — Swipe Deck | Complete | Replaces planned Mapbox view as the primary browse interaction |
| Phase 5 — Image Pipeline | Complete | Enrichment script + placeholders + Supabase Storage |
| Phase 6 — Mobile Polish | Complete | Viewport meta, native map deep-linking, persisted saves, reduced-motion |
| Phase 7 — Polish & QA | In progress | Accessibility audit, Lighthouse baseline, cross-browser QA |
| Phase 8 — Launch | Not started | After QA sign-off |

---

## Notes

- **Bundle stays lean.** Production deps: Next, React, Drizzle, Postgres, Zustand, framer-motion, Supabase SSR, server-only.
- **Architecture is stable.** The swipe deck and image enrichment pipeline are the two largest pieces; both have shipped and the rest is polish.
- **Database is production-ready.** Self-hosted Postgres or Supabase both supported.
- **A future map view is a clean addition, not a rewrite.** The view contract is `Space[]` from `/api/spaces`; any new view (map, saved-list, etc.) plugs in alongside SwipeDeck without touching the data layer.
