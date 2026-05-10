"use client";

/**
 * FreeTime — main page.
 *
 * Layout (mobile-first):
 *   ┌─────────────────────────────┐
 *   │ Header: logo + space count  │
 *   │ CitySearch                  │
 *   │ FilterBar (horizontal scroll│
 *   ├─────────────────────────────┤
 *   │ SpaceList (scrollable)      │
 *   └─────────────────────────────┘
 *
 * On load:
 *   1. Request geolocation
 *   2. Reverse-geocode → city slug
 *   3. Fetch /api/spaces?city=<slug>&lat=&lng=&filters=
 *   4. Render list — re-fetches when city or filters change
 */

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { useGeolocation } from "@/lib/geo/use-geolocation";
import type { Space } from "@/lib/types/space";
import { SwipeDeck } from "@/components/canvas/SwipeDeck";
import { FilterBar } from "@/components/filters/FilterBar";
import { CitySearch } from "@/components/search/CitySearch";

/* ---- Space count badge ------------------------------------------------ */

function SpaceCountBadge({ count, loading }: { count: number | null; loading: boolean }) {
  if (loading) {
    return (
      <span
        aria-label="Loading space count"
        style={{
          display: "inline-block",
          width: 80,
          height: 16,
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--color-background)",
          background: "linear-gradient(90deg, var(--color-background) 25%, var(--color-accent) 50%, var(--color-background) 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite linear",
        }}
      />
    );
  }
  if (count === null) return null;
  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      style={{
        fontSize: 12,
        fontWeight: 300,
        color: "var(--color-text-tertiary)",
        fontFamily: "var(--font-sans)",
        animation: "count-tick 200ms var(--ease-enter) both",
      }}
    >
      {count} {count === 1 ? "space" : "spaces"}
    </span>
  );
}

/* ---- Location prompt banner ------------------------------------------ */

function LocationBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      style={{
        padding: "var(--space-3) var(--space-4)",
        backgroundColor: "var(--color-accent)",
        fontSize: 13,
        fontWeight: 300,
        fontFamily: "var(--font-sans)",
        color: "var(--color-text-secondary)",
        textAlign: "center",
        animation: "fade-in 300ms var(--ease-enter) both",
      }}
    >
      {message}
    </div>
  );
}

/* ---- Main page -------------------------------------------------------- */

export default function Home() {
  const { city: geoCity, loading: geoLoading, error: geoError, lat, lng } = useGeolocation();

  const activeCity = useAppStore((s) => s.activeCity);
  const setActiveCity = useAppStore((s) => s.setActiveCity);
  const activeFilters = useAppStore((s) => s.activeFilters);
  const setUserLocation = useAppStore((s) => s.setUserLocation);

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  /* Set city from geolocation once resolved */
  useEffect(() => {
    if (geoCity && !activeCity) {
      setActiveCity(geoCity);
    }
  }, [geoCity, activeCity, setActiveCity]);

  /* Store user coordinates */
  useEffect(() => {
    if (lat !== null && lng !== null) {
      setUserLocation({ lat, lng });
    }
  }, [lat, lng, setUserLocation]);

  /* Fetch spaces when city or filters change */
  const fetchSpaces = useCallback(async (signal: AbortSignal) => {
    if (!activeCity) return;

    const params = new URLSearchParams({ city: activeCity.slug });
    if (lat !== null) params.set("lat", String(lat));
    if (lng !== null) params.set("lng", String(lng));
    if (activeFilters.length > 0) params.set("filters", activeFilters.join(","));

    setSpacesLoading(true);
    setSpacesError(null);

    try {
      const res = await fetch(`/api/spaces?${params}`, { signal });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setSpaces(data.spaces ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return; // unmounted — skip state update
      console.error("fetchSpaces failed:", err);
      setSpaces([]);
      setTotal(0);
      setSpacesError("Failed to load spaces. Try again.");
    } finally {
      setSpacesLoading(false);
    }
  }, [activeCity, activeFilters, lat, lng]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSpaces(controller.signal);
    return () => controller.abort(); // cancel in-flight request on re-run or unmount
  }, [fetchSpaces]);

  // Show skeletons while geo is resolving (but cap at 8s in case geo never fires)
  // or while the first spaces fetch is in flight.
  const isLoading = (geoLoading && !geoError) || (spacesLoading && spaces.length === 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        backgroundColor: "var(--color-canvas-bg)",
        position: "relative",
      }}
    >
      {/* ── Leaf texture layer (behind everything) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: "url('/leaf-texture.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
          filter: "blur(2.5px)",
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />

      {/* ── Content sits above the texture ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >

      {/* ---- Header ---- */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "var(--color-canvas-bg)",
          borderBottom: "0.4px solid color-mix(in srgb, var(--color-text-disabled) 60%, transparent)",
          boxShadow: "0 2px 12px rgba(89, 86, 64, 0.08)",
        }}
      >
        {/* Wordmark row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-3) var(--space-4) var(--space-2)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-rasa), Georgia, serif",
              fontWeight: 300,
              fontSize: 22,
              lineHeight: 1,
              color: "var(--color-text-primary)",
              margin: 0,
              letterSpacing: "-0.44px",
            }}
          >
            FreeTime
          </h1>
          {activeCity && (
            <SpaceCountBadge count={total} loading={spacesLoading} />
          )}
        </div>

        {/* City search */}
        <div style={{ padding: "0 var(--space-4) var(--space-3)" }}>
          <CitySearch />
        </div>

        {/* Filter chips */}
        <FilterBar resultCount={total ?? undefined} />
      </header>

      {/* ---- Location permission banner ---- */}
      {!geoLoading && geoError && !activeCity && (
        <LocationBanner message={geoError} />
      )}

      {/* ---- No city selected prompt ---- */}
      {!geoLoading && !activeCity && (
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-8) var(--space-4)",
            gap: "var(--space-4)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 16,
              fontWeight: 300,
              lineHeight: 1.5,
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
              margin: 0,
              maxWidth: 280,
            }}
          >
            Search for a city above to find nearby spaces.
          </p>
        </main>
      )}

      {/* ---- Main content: swipe deck ---- */}
      {(activeCity || geoLoading) && (
        <main
          style={{
            flex: 1,
            padding: "var(--space-4) var(--space-4) var(--space-8)",
            maxWidth: 600,
            width: "100%",
            marginInline: "auto",
            boxSizing: "border-box",
          }}
        >
          {/* City / count heading — matches Figma "12 spaces found in Austin, TX" */}
          {activeCity && total !== null && (
            <p
              aria-live="polite"
              style={{
                fontSize: 20,
                fontWeight: 300,
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-rasa), Georgia, serif",
                letterSpacing: "-0.4px",
                marginTop: 0,
                marginBottom: "var(--space-6)",
              }}
            >
              {total} {total === 1 ? "space" : "spaces"} found in{" "}
              <strong
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              >
                {activeCity.name}
                {activeCity.region ? `, ${activeCity.region}` : ""}
              </strong>
            </p>
          )}

          {spacesError && !spacesLoading && (
            <p
              role="alert"
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)",
                textAlign: "center",
                padding: "var(--space-4)",
                margin: 0,
              }}
            >
              {spacesError}
            </p>
          )}

          <SwipeDeck spaces={spaces} loading={isLoading} />
        </main>
      )}
      </div>
    </div>
  );
}
