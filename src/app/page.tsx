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
      {/* ── Cirrus cloud layer (fixed, behind everything) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Cloud 1 — upper left */}
        <div style={{
          position: "absolute",
          top: "8%",
          left: "-5%",
          animation: "cloud-drift-1 28s ease-in-out infinite, cloud-pulse 10s ease-in-out infinite",
        }}>
          <div style={{ position: "relative", width: 520, height: 96 }}>
            <div style={{ position: "absolute", width: 520, height: 96, background: "linear-gradient(to right, transparent 0%, #FFFFFF 30%, #E8CEEE 65%, transparent 100%)", borderRadius: 9999, filter: "blur(28px)", opacity: 0.65 }} />
            <div style={{ position: "absolute", top: -28, left: 80, width: 360, height: 72, background: "linear-gradient(to right, transparent 0%, #FBF3FF 35%, #E3C7EB 60%, transparent 100%)", borderRadius: 9999, filter: "blur(18px)", opacity: 0.5, transform: "rotate(5deg)" }} />
            <div style={{ position: "absolute", top: 20, left: 160, width: 260, height: 52, background: "linear-gradient(to right, transparent 0%, #F8F0FF 40%, #D3BEE4 55%, transparent 100%)", borderRadius: 9999, filter: "blur(10px)", opacity: 0.5, transform: "rotate(-10deg)" }} />
          </div>
        </div>

        {/* Cloud 2 — upper right */}
        <div style={{
          position: "absolute",
          top: "18%",
          right: "-8%",
          animation: "cloud-drift-2 34s ease-in-out infinite, cloud-pulse 13s ease-in-out infinite 2s",
        }}>
          <div style={{ position: "relative", width: 480, height: 88 }}>
            <div style={{ position: "absolute", width: 480, height: 88, background: "linear-gradient(to right, transparent 0%, #FFFFFF 25%, #E8CEEE 70%, transparent 100%)", borderRadius: 9999, filter: "blur(28px)", opacity: 0.65 }} />
            <div style={{ position: "absolute", top: -24, left: 60, width: 320, height: 64, background: "linear-gradient(to right, transparent 0%, #FBF3FF 30%, #E3C7EB 65%, transparent 100%)", borderRadius: 9999, filter: "blur(18px)", opacity: 0.5, transform: "rotate(-6deg)" }} />
            <div style={{ position: "absolute", top: 18, left: 140, width: 240, height: 48, background: "linear-gradient(to right, transparent 0%, #F8F0FF 38%, #D3BEE4 58%, transparent 100%)", borderRadius: 9999, filter: "blur(10px)", opacity: 0.5, transform: "rotate(8deg)" }} />
          </div>
        </div>

        {/* Cloud 3 — mid left */}
        <div style={{
          position: "absolute",
          top: "44%",
          left: "-10%",
          animation: "cloud-drift-3 40s ease-in-out infinite, cloud-pulse 16s ease-in-out infinite 5s",
        }}>
          <div style={{ position: "relative", width: 560, height: 100 }}>
            <div style={{ position: "absolute", width: 560, height: 100, background: "linear-gradient(to right, transparent 0%, #FFFFFF 28%, #E8CEEE 68%, transparent 100%)", borderRadius: 9999, filter: "blur(28px)", opacity: 0.65 }} />
            <div style={{ position: "absolute", top: -30, left: 100, width: 380, height: 70, background: "linear-gradient(to right, transparent 0%, #FBF3FF 32%, #E3C7EB 62%, transparent 100%)", borderRadius: 9999, filter: "blur(18px)", opacity: 0.5, transform: "rotate(4deg)" }} />
            <div style={{ position: "absolute", top: 22, left: 200, width: 280, height: 56, background: "linear-gradient(to right, transparent 0%, #F8F0FF 36%, #D3BEE4 56%, transparent 100%)", borderRadius: 9999, filter: "blur(10px)", opacity: 0.5, transform: "rotate(-14deg)" }} />
          </div>
        </div>

        {/* Cloud 4 — lower right */}
        <div style={{
          position: "absolute",
          top: "68%",
          right: "-6%",
          animation: "cloud-drift-4 36s ease-in-out infinite, cloud-pulse 12s ease-in-out infinite 7s",
        }}>
          <div style={{ position: "relative", width: 500, height: 92 }}>
            <div style={{ position: "absolute", width: 500, height: 92, background: "linear-gradient(to right, transparent 0%, #FFFFFF 30%, #E8CEEE 65%, transparent 100%)", borderRadius: 9999, filter: "blur(28px)", opacity: 0.65 }} />
            <div style={{ position: "absolute", top: -26, left: 70, width: 340, height: 66, background: "linear-gradient(to right, transparent 0%, #FBF3FF 33%, #E3C7EB 63%, transparent 100%)", borderRadius: 9999, filter: "blur(18px)", opacity: 0.5, transform: "rotate(-5deg)" }} />
            <div style={{ position: "absolute", top: 20, left: 170, width: 260, height: 50, background: "linear-gradient(to right, transparent 0%, #F8F0FF 40%, #D3BEE4 55%, transparent 100%)", borderRadius: 9999, filter: "blur(10px)", opacity: 0.5, transform: "rotate(11deg)" }} />
          </div>
        </div>
      </div>

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
          backgroundColor: "rgba(197, 163, 214, 0.45)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
          borderBottom: "0.4px solid rgba(197, 163, 214, 0.4)",
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
