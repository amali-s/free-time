"use client";

/**
 * SpaceList — scrollable, proximity-sorted list of SpaceCard tiles.
 *
 * Handles three states:
 *   - loading: shows skeleton shimmer cards
 *   - empty:   shows an inline empty state message
 *   - data:    renders SpaceCard for each space, staggered entrance animation
 *
 * Receives SpaceViewProps so it can be swapped for a map view in the future
 * without changing the parent.
 */

import { useAppStore } from "@/lib/store";
import type { SpaceViewProps } from "@/lib/types/space";
import { SpaceCard } from "@/components/space-card/SpaceCard";

/* ---- Skeleton card ---------------------------------------------------- */

function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: "var(--color-foreground)",
        border: "0.4px solid var(--color-text-disabled)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-3)",
        display: "flex",
        gap: "var(--space-4)",
        overflow: "hidden",
      }}
    >
      {/* Thumbnail shimmer */}
      <div
        style={{
          width: 55,
          height: 78,
          borderRadius: "var(--radius-md)",
          flexShrink: 0,
          background: `linear-gradient(90deg,
            var(--color-background) 25%,
            var(--color-accent) 50%,
            var(--color-background) 75%
          )`,
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite linear",
        }}
      />
      {/* Text shimmer lines */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingTop: 4 }}>
        <div style={{ height: 10, width: "60%", borderRadius: "var(--radius-sm)", background: "var(--color-background)", animation: "shimmer 1.5s infinite linear", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, var(--color-background) 25%, var(--color-accent) 50%, var(--color-background) 75%)" }} />
        <div style={{ height: 22, width: "80%", borderRadius: "var(--radius-sm)", background: "var(--color-background)", animation: "shimmer 1.5s 0.1s infinite linear", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, var(--color-background) 25%, var(--color-accent) 50%, var(--color-background) 75%)" }} />
        <div style={{ height: 10, width: "45%", borderRadius: "var(--radius-sm)", background: "var(--color-background)", animation: "shimmer 1.5s 0.2s infinite linear", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, var(--color-background) 25%, var(--color-accent) 50%, var(--color-background) 75%)" }} />
        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
          {[48, 56, 52].map((w, i) => (
            <div key={i} style={{ height: 18, width: w, borderRadius: "var(--radius-lg)", background: "var(--color-background)", animation: `shimmer 1.5s ${0.1 * i}s infinite linear`, backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, var(--color-background) 25%, var(--color-accent) 50%, var(--color-background) 75%)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Empty state ------------------------------------------------------ */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const clearFilters = useAppStore((s) => s.clearFilters);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        padding: "var(--space-16) var(--space-4)",
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
        {hasFilters
          ? "No spaces match your filters. Try removing a filter."
          : "No spaces found here yet. Try a nearby city."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          style={{
            padding: "8px var(--space-4)",
            border: "0.4px solid var(--color-text-secondary)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "transparent",
            color: "var(--color-text-secondary)",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

/* ---- SpaceList -------------------------------------------------------- */

interface SpaceListProps extends SpaceViewProps {
  loading?: boolean;
  total?: number;
}

export function SpaceList({
  spaces,
  userLocation,
  selectedId,
  onSelect,
  loading = false,
  total,
}: SpaceListProps) {
  const activeFilters = useAppStore((s) => s.activeFilters);
  void userLocation; // available for future proximity sort indicator

  if (loading) {
    return (
      <ul
        aria-label="Loading spaces"
        aria-busy="true"
        style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}><SkeletonCard /></li>
        ))}
      </ul>
    );
  }

  if (spaces.length === 0) {
    return <EmptyState hasFilters={activeFilters.length > 0} />;
  }

  return (
    <section aria-label={`Spaces list${total !== undefined ? ` — ${total} total` : ""}`}>
      <ul
        style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
      >
        {spaces.map((space, i) => (
          <li
            key={space.id}
            style={{
              animation: `list-item-enter 300ms ${i * 40}ms both var(--ease-enter)`,
            }}
          >
            <SpaceCard
              space={space}
              isSelected={selectedId === space.id}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
