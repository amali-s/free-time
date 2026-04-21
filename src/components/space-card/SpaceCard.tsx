"use client";

/**
 * SpaceCard — expandable accordion tile for a single space.
 *
 * Matches the Sage Component Kit space tile design (node 463-186):
 *   - Collapsed: thumbnail + address + title + amenity tags + chevron
 *   - Expanded:  adds description paragraph above chevron
 *
 * The card is also the list item in list view — tapping expands in place.
 * On map view, the card appears as a bottom sheet / side panel.
 *
 * Figma reference: node 463-186
 */

import { useState } from "react";
import Image from "next/image";
import type { Space, Amenity } from "@/lib/types/space";
import { AmenityTag } from "@/components/common/AmenityTag";
import { Chevron } from "@/components/common/Chevron";
import { getSpaceImage } from "@/lib/placeholder-image";

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
        backgroundColor: "var(--color-foreground)",
        border: "0.4px solid var(--color-text-disabled)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-3)",
        overflow: "hidden",
        boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)",
        outline: isSelected ? `2px solid var(--color-primary-action)` : "none",
        outlineOffset: "1px",
        transition: "box-shadow 200ms var(--ease-exit)",
        width: "100%",
      }}
    >
      {/* ---- Top row: thumbnail + content ---- */}
      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>

        {/* Thumbnail — 55×78px slot as per Figma */}
        <div
          style={{
            position: "relative",
            width: 55,
            height: 78,
            flexShrink: 0,
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            backgroundColor: "var(--color-accent)",
          }}
          aria-hidden="true"
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="55px"
            style={{ objectFit: "cover" }}
            unoptimized={imageSrc.startsWith("/illustrations/")}
          />
        </div>

        {/* Content column */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>

          {/* Address row */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 300,
                lineHeight: 1.4,
                letterSpacing: "-0.72px",
                color: "var(--color-text-tertiary)",
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
                padding: 2,
                color: "var(--color-text-tertiary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                minWidth: 20,
                minHeight: 20,
                borderRadius: "var(--radius-sm)",
              }}
            >
              <CopyIcon />
            </button>
          </div>

          {/* Space name */}
          <h2
            style={{
              fontFamily: "var(--font-rasa), Georgia, serif",
              fontWeight: 300,
              fontSize: 24,
              lineHeight: 1,
              letterSpacing: "-0.48px",
              color: "var(--color-text-primary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {space.name}
          </h2>

          {/* Metadata row: distance · hours · noise */}
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
        </div>
      </div>

      {/* ---- Expanded: description ---- */}
      {isExpanded && space.description && (
        <p
          style={{
            marginTop: "var(--space-4)",
            marginBottom: 0,
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
        <div
          style={{
            marginTop: "var(--space-4)",
            display: "flex",
            gap: "var(--space-2)",
          }}
        >
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
            href={`https://maps.google.com/?q=${encodeURIComponent(space.address)}`}
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
          marginTop: "var(--space-3)",
          padding: "var(--space-1) 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-tertiary)",
          minHeight: 28,
        }}
      >
        <Chevron direction={isExpanded ? "up" : "down"} />
      </button>
    </article>
  );
}
