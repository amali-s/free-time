"use client";

/**
 * SpaceProfileCard — full-bleed profile card for the pile / swipe view.
 *
 * Matches Figma frame 36-534, node 49:1735 "profile":
 *   ┌─────────────────────────────────────┐
 *   │ Type of space              ♡ / ♥   │
 *   │ ─────────────────────────────────── │
 *   │          image / illustration       │
 *   │ ─────────────────────────────────── │
 *   │ 123 address st.  [copy]             │
 *   │ Name of Space                       │
 *   │ [Wifi] [Bathroom] [Seating]         │
 *   │ Description of the space…           │
 *   └─────────────────────────────────────┘
 *
 * The card is purely presentational — swipe/drag logic lives in SwipeDeck.
 */

import Image from "next/image";
import type { Space, Amenity } from "@/lib/types/space";
import { AmenityTag } from "@/components/common/AmenityTag";
import { getSpaceImage } from "@/lib/placeholder-image";

/* ---- Copy icon --------------------------------------------------------- */

function CopyIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <rect x="3" y="0.5" width="6" height="7" rx="1"
            stroke="currentColor" strokeWidth="0.8" fill="none" />
      <rect x="0.5" y="2.5" width="6" height="7" rx="1"
            stroke="currentColor" strokeWidth="0.8" fill="var(--color-layer-1)" />
    </svg>
  );
}

/* ---- Heart icon -------------------------------------------------------- */

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ transition: "fill 200ms ease, stroke 200ms ease" }}
    >
      <path
        d="M8 13.5 C8 13.5 2 9.5 2 5.5 C2 3.5 3.5 2 5.5 2 C6.7 2 7.7 2.6 8 3.4 C8.3 2.6 9.3 2 10.5 2 C12.5 2 14 3.5 14 5.5 C14 9.5 8 13.5 8 13.5 Z"
        stroke={filled ? "var(--color-error)" : "var(--color-text-tertiary)"}
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill={filled ? "var(--color-error)" : "none"}
      />
    </svg>
  );
}

/* ---- Helpers ----------------------------------------------------------- */

const SPACE_TYPE_LABELS: Record<Space["type"], string> = {
  cafe: "Café",
  coworking: "Coworking",
  library: "Library",
  park: "Park",
  plaza: "Plaza",
  transit: "Transit hub",
  lobby: "Lobby",
  other: "Space",
};

const PRIORITY_AMENITIES: Amenity[] = ["wifi", "outlets", "seating", "bathroom", "storage"];

function getTopAmenities(amenities: Amenity[], max = 4): Amenity[] {
  return PRIORITY_AMENITIES.filter((a) => amenities.includes(a)).slice(0, max);
}

/* ---- Props ------------------------------------------------------------- */

interface SpaceProfileCardProps {
  space: Space;
  isSaved: boolean;
  /** Called when the copy-address button is pressed */
  onCopyAddress?: () => void;
}

/* ---- Component --------------------------------------------------------- */

export function SpaceProfileCard({ space, isSaved, onCopyAddress }: SpaceProfileCardProps) {
  const imageSrc = getSpaceImage(space.type, space.imageUrl);
  const topAmenities = getTopAmenities(space.amenities);
  const typeLabel = SPACE_TYPE_LABELS[space.type] ?? "Space";

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation(); // don't trigger card tap
    navigator.clipboard?.writeText(space.address).catch(() => {});
    onCopyAddress?.();
  }

  return (
    <article
      aria-label={`${space.name}, ${typeLabel}`}
      style={{
        backgroundColor: "var(--color-layer-1)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "0px 4px 12px rgba(108, 114, 117, 0.22), 0px 1px 3px rgba(108, 114, 117, 0.12)",
        width: "100%",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* ── Header row: type label + heart ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "var(--space-4) var(--space-4) 0",
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
          }}
        >
          {typeLabel}
        </span>
        <HeartIcon filled={isSaved} />
      </div>

      {/* ── Image / illustration slot ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 130,
          marginTop: "var(--space-3)",
          backgroundColor: "var(--color-accent)",
          overflow: "hidden",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 600px) 100vw, 560px"
          style={{ objectFit: "cover" }}
          unoptimized={imageSrc.startsWith("/illustrations/")}
          draggable={false}
        />
      </div>

      {/* ── Content body ── */}
      <div
        style={{
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {/* Address + copy */}
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
            onClick={handleCopy}
            aria-label={`Copy address: ${space.address}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 3,
              color: "var(--color-text-tertiary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              minWidth: 22,
              minHeight: 22,
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
            fontSize: 22,
            lineHeight: 1,
            letterSpacing: "-0.44px",
            color: "var(--color-text-primary)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {space.name}
        </h2>

        {/* Amenity tags — pale mustard background per Figma */}
        {topAmenities.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
            {topAmenities.map((amenity) => (
              <AmenityTag
                key={amenity}
                amenity={amenity}
                style={{
                  backgroundColor: "var(--color-pale-mustard)",
                  color: "var(--color-text-secondary)",
                }}
              />
            ))}
          </div>
        )}

        {/* Description */}
        {space.description ? (
          <p
            style={{
              fontSize: 14,
              fontWeight: 300,
              lineHeight: 1.5,
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {space.description}
          </p>
        ) : (
          <p
            style={{
              fontSize: 14,
              fontWeight: 300,
              lineHeight: 1.5,
              color: "var(--color-text-disabled)",
              fontFamily: "var(--font-sans)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            No description available.
          </p>
        )}
      </div>
    </article>
  );
}
