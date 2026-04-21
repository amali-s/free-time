"use client";

/**
 * FilterBar — horizontal scrollable row of amenity filter chips.
 *
 * Each chip toggles an amenity filter in the Zustand store.
 * Active chips fill with Primary Action blue; inactive chips use Background.
 * Announces state changes to screen readers.
 *
 * Design reference: design.md §10 Tag System + §5 Filter Chip component.
 */

import { useAppStore } from "@/lib/store";
import type { Amenity } from "@/lib/types/space";

const FILTERS: { amenity: Amenity; label: string }[] = [
  { amenity: "wifi",     label: "Wifi" },
  { amenity: "outlets",  label: "Outlets" },
  { amenity: "seating",  label: "Seating" },
  { amenity: "bathroom", label: "Bathroom" },
  { amenity: "storage",  label: "Storage" },
  { amenity: "quiet",    label: "Quiet" },
];

interface FilterBarProps {
  /** Number of results after applying filters — shown as count badge */
  resultCount?: number;
}

function CloseIcon() {
  return (
    <svg width="7" height="8" viewBox="0 0 7 8" fill="none" aria-hidden="true">
      <path d="M1 1L6 7M6 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FilterBar({ resultCount }: FilterBarProps) {
  const activeFilters = useAppStore((s) => s.activeFilters);
  const toggleFilter = useAppStore((s) => s.toggleFilter);
  const clearFilters = useAppStore((s) => s.clearFilters);
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div
      role="group"
      aria-label="Filter by amenity"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        padding: "var(--space-2) var(--space-4)",
        /* Fade out on edges to hint scroll */
        WebkitMaskImage: "linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)",
        maskImage: "linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)",
      }}
    >
      {/* Filter chips */}
      {FILTERS.map(({ amenity, label }) => {
        const isActive = activeFilters.includes(amenity);
        return (
          <button
            key={amenity}
            type="button"
            role="checkbox"
            aria-checked={isActive}
            aria-label={`${label} filter ${isActive ? "on, press to remove" : "off, press to add"}`}
            onClick={() => toggleFilter(amenity)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              paddingInline: "8px",
              paddingBlock: "4px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: isActive ? "var(--color-accent)" : "var(--color-foreground)",
              color: "var(--color-text-tertiary)",
              fontSize: "8px",
              fontWeight: 400,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              flexShrink: 0,
              minHeight: 20,
              transition: "background-color 200ms var(--ease-enter), color 200ms var(--ease-enter)",
              whiteSpace: "nowrap",
              letterSpacing: "-0.32px",
            }}
          >
            {label}
            {isActive && <CloseIcon />}
          </button>
        );
      })}

      {/* Live region for screen reader announcements */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {resultCount !== undefined
          ? `${resultCount} space${resultCount !== 1 ? "s" : ""} found`
          : ""}
      </span>
    </div>
  );
}
