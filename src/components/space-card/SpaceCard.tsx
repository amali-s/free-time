"use client";

/**
 * SpaceCard — expandable accordion tile for a single space.
 *
 * Updated layout (Figma node 49-2027):
 *   - Image slot sits at the very top, full-width with no horizontal padding
 *   - Meta row: "Type of space • Address" horizontally aligned, separated
 *     by a 4×4 px filled dot
 *   - Title uses the Sage "Heading 2" style (Hiragino Sans, 16px, W5)
 *   - Below: amenity tags, optional metadata (distance / hours), and an
 *     expandable description with action links
 *
 * The card is also the list item in list view — tapping expands in place.
 * On map view, the card appears as a bottom sheet / side panel.
 *
 * Figma reference: node 49-2027
 */

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import type { Space, SpaceType, Amenity } from "@/lib/types/space";
import { AmenityTag } from "@/components/common/AmenityTag";
import { Chevron } from "@/components/common/Chevron";
import { getSpaceImage } from "@/lib/placeholder-image";
import { getMapsHref } from "@/lib/geo/maps-link";

/**
 * `useSyncExternalStore` with a no-op subscribe is the React 19-blessed way
 * to render different content on the server vs the client without a
 * setState-in-effect warning. The server snapshot returns `false`; the
 * client snapshot returns `true` after hydration.
 */
const subscribeNoop = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

/* ---- Copy icon (inline — node 463-158) -------------------------------- */

function CopyIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      {/* Back page */}
      <rect
        x="3"
        y="0.5"
        width="6"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
      />
      {/* Front page */}
      <rect
        x="0.5"
        y="2.5"
        width="6"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="var(--color-foreground)"
      />
    </svg>
  );
}

/* ---- Helpers ---------------------------------------------------------- */

/** Format "09:00" → "9am", "20:00" → "8pm" */
function formatHour(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

/** Returns true if the space is currently open given its hours and current time. */
function isOpenNow(hours: { open: string; close: string }): boolean {
  const now = new Date();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  return nowMins >= openMins && nowMins < closeMins;
}

/** Format distance to a readable string. */
function formatDistance(km: number | undefined): string | null {
  if (km === undefined) return null;
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/** Top amenities to show as compact tags on the tile (max 4). */
const PRIORITY_AMENITIES: Amenity[] = ["wifi", "outlets", "seating", "bathroom", "storage"];

function getTopAmenities(amenities: Amenity[]): Amenity[] {
  const prioritised = PRIORITY_AMENITIES.filter((a) => amenities.includes(a));
  return prioritised.slice(0, 4);
}

/** Human-readable label for a space type, e.g. "coworking" → "Coworking". */
const TYPE_LABELS: Record<SpaceType, string> = {
  cafe: "Cafe",
  coworking: "Coworking",
  library: "Library",
  park: "Park",
  plaza: "Plaza",
  transit: "Transit",
  lobby: "Lobby",
  other: "Other",
};

/* ---- SpaceCard -------------------------------------------------------- */

interface SpaceCardProps {
  space: Space;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  /** Allow controlling expanded state from parent (e.g. map pin tap) */
  forceExpanded?: boolean;
}

export function SpaceCard({ space, isSelected = false, onSelect, forceExpanded }: SpaceCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = forceExpanded ?? localExpanded;

  const imageSrc = getSpaceImage(space.type, space.imageUrl);
  const topAmenities = getTopAmenities(space.amenities);
  const distance = formatDistance(space.distanceKm);

  // SSR can't read navigator, so render the web URL on the server, then swap
  // to the platform-specific deep link after hydration. This keeps the link
  // valid on first paint and routes iOS/Android users to their native map app.
  const isClient = useIsClient();
  const mapsHref = isClient
    ? getMapsHref(`${space.name}, ${space.address}`)
    : `https://maps.google.com/?q=${encodeURIComponent(space.address)}`;

  function handleToggle() {
    setLocalExpanded((v) => !v);
    onSelect?.(space.id);
  }

  function handleCopyAddress() {
    navigator.clipboard?.writeText(space.address).catch(() => {
      /* silently ignore — copy is a convenience, not critical */
    });
  }

  return (
    <article
      aria-expanded={isExpanded}
      style={{
        backgroundColor: "var(--color-layer-1)",
        border: "0.4px solid var(--color-text-disabled)",
        borderRadius: "var(--radius-lg)",
        // No top/horizontal padding — the image slot sits flush to the top
        // edges. We apply horizontal + bottom padding only to the content
        // section below.
        padding: 0,
        overflow: "hidden",
        boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)",
        outline: isSelected ? `2px solid var(--color-primary-action)` : "none",
        outlineOffset: "1px",
        transition: "box-shadow 200ms var(--ease-exit)",
        width: "100%",
      }}
    >
      {/* ---- Image slot — full-width, flush to the top edges ---- */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 125,
          backgroundColor: "var(--color-accent)",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: "cover" }}
          unoptimized={imageSrc.startsWith("/illustrations/")}
        />
      </div>

      {/* ---- Content column ---- */}
      <div
        style={{
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        {/* Title block: meta row + name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {/* Meta row: Type of space · Address (with 4×4px dot separator) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 300,
                lineHeight: 1.4,
                letterSpacing: "-0.72px",
                color: "var(--color-neutral-text)",
                fontFamily: "var(--font-sans)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {TYPE_LABELS[space.type]}
            </span>

            {/* 4×4 px filled dot separator */}
            <span
              aria-hidden="true"
              style={{
                width: 4,
                height: 4,
                flexShrink: 0,
                borderRadius: "50%",
                backgroundColor: "var(--color-neutral-text)",
              }}
            />

            <span
              style={{
                fontSize: 12,
                fontWeight: 300,
                lineHeight: 1.4,
                letterSpacing: "-0.72px",
                color: "var(--color-neutral-text)",
                fontFamily: "var(--font-sans)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                minWidth: 0,
              }}
            >
              {space.address}
            </span>

            <button
              type="button"
              onClick={handleCopyAddress}
              aria-label={`Copy address: ${space.address}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: 6,
                color: "var(--color-text-tertiary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                minWidth: 44,
                minHeight: 44,
                borderRadius: "var(--radius-sm)",
              }}
            >
              <CopyIcon />
            </button>
          </div>

          {/* Space name — Heading 2 (Hiragino Sans, 16px, W5/500, ~1 line-height) */}
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: 1,
              letterSpacing: 0,
              color: "var(--color-text-primary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {space.name}
          </h2>
        </div>

        {/* Metadata row: distance · open/closed · hours */}
        {(distance || space.hours) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: 11,
              color: "var(--color-text-tertiary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {distance && <span>{distance} away</span>}
            {space.hours && (
              <>
                {distance && <span aria-hidden="true">·</span>}
                <span
                  style={{
                    color: isOpenNow(space.hours)
                      ? "var(--color-success)"
                      : "var(--color-error)",
                  }}
                >
                  {isOpenNow(space.hours) ? "Open" : "Closed"}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {formatHour(space.hours.open)}–{formatHour(space.hours.close)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Amenity tags row */}
        {topAmenities.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
            {topAmenities.map((amenity) => (
              <AmenityTag key={amenity} amenity={amenity} />
            ))}
          </div>
        )}

        {/* ---- Expanded: description ---- */}
        {isExpanded && space.description && (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 300,
              lineHeight: 1.5,
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {space.description}
          </p>
        )}

        {/* ---- Expanded: action links ---- */}
        {isExpanded && (
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {space.websiteUrl && (
              <a
                href={space.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px var(--space-3)",
                  backgroundColor: "var(--color-primary-action)",
                  color: "var(--color-foreground)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 13,
                  fontWeight: 400,
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                  minHeight: 44,
                  minWidth: 44,
                }}
              >
                Website ↗
              </a>
            )}
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px var(--space-3)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-text-secondary)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: 400,
                fontFamily: "var(--font-sans)",
                textDecoration: "none",
                minHeight: 44,
                minWidth: 44,
                border: "0.4px solid var(--color-text-disabled)",
              }}
            >
              Directions
            </a>
          </div>
        )}

        {/* ---- Chevron toggle ---- */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isExpanded ? `Collapse ${space.name}` : `Expand ${space.name}`}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: "var(--space-1) 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-tertiary)",
            minHeight: 44,
          }}
        >
          <Chevron direction={isExpanded ? "up" : "down"} />
        </button>
      </div>
    </article>
  );
}
