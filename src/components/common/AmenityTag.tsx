/**
 * AmenityTag
 *
 * Compact pill badge showing a single amenity (wifi, outlets, seating, etc.).
 * Matches the Sage Component Kit tag spec: muted background, small icon, label.
 *
 * Figma reference:
 *   Wifi:     node 428-530
 *   Bathroom: node 428-550
 *   Seating:  node 428-586
 *   Outlet:   node 428-612
 */

import type { Amenity } from "@/lib/types/space";

/* ---- Icons ------------------------------------------------------------ */

function WifiIcon() {
  return (
    <svg
      width="8"
      height="7"
      viewBox="0 0 10 9"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 3.2C2.6 1.6 3.7 1 5 1s2.4.6 4 2.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M2.5 4.7C3.4 3.8 4.1 3.4 5 3.4s1.6.4 2.5 1.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M3.9 6.2C4.3 5.8 4.6 5.6 5 5.6s.7.2 1.1.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="5" cy="8" r="0.9" fill="currentColor" />
    </svg>
  );
}

function BathroomIcon() {
  return (
    <svg
      width="8"
      height="9"
      viewBox="0 0 8 9"
      fill="none"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="4" cy="1.2" r="1.1" fill="currentColor" />
      {/* Shoulders / horizontal bar */}
      <path
        d="M1.2 3.8h5.6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Left leg */}
      <path
        d="M2 3.8 L2 6.6 L1.2 9"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right leg */}
      <path
        d="M6 3.8 L6 6.6 L6.8 9"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Body center */}
      <path
        d="M4 3.8 L4 6.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SeatingIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 9 9"
      fill="none"
      aria-hidden="true"
    >
      {/* Chair back (vertical post) */}
      <path
        d="M2.5 1 L2.5 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Seat */}
      <path
        d="M2.5 5 L7 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Back rest top */}
      <path
        d="M2.5 1 L5.5 1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Front leg */}
      <path
        d="M7 5 L7 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Rear leg */}
      <path
        d="M2.5 5 L2 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OutletIcon() {
  return (
    <svg
      width="7"
      height="9"
      viewBox="0 0 8 10"
      fill="none"
      aria-hidden="true"
    >
      {/* Left prong */}
      <path
        d="M2.5 1 L2.5 3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Right prong */}
      <path
        d="M5.5 1 L5.5 3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Plug body */}
      <path
        d="M1 3.5 h6 v2.5 a3 3 0 0 1-6 0 V3.5 z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Cord */}
      <path
        d="M4 6 L4 9.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      {/* Suitcase body */}
      <rect
        x="1"
        y="3"
        width="8"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      {/* Handle */}
      <path
        d="M3.5 3 L3.5 2 a1.5 1.5 0 0 1 3 0 L6.5 3"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Middle bar */}
      <path
        d="M1 6 h8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QuietIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      {/* Speaker cone */}
      <path
        d="M2 3.5 H4 L7 1.5 V8.5 L4 6.5 H2 V3.5 z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Mute X */}
      <path
        d="M8 3.5 L9.5 5 M9.5 3.5 L8 5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M3.5 2.5 V7.5 M3.5 2.5 H6 a1.75 1.75 0 0 1 0 3.5 H3.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- Config map ------------------------------------------------------- */

const AMENITY_CONFIG: Record<
  Amenity,
  { label: string; Icon: () => React.JSX.Element }
> = {
  wifi:     { label: "Wifi",    Icon: WifiIcon },
  outlets:  { label: "Outlets", Icon: OutletIcon },
  seating:  { label: "Seating", Icon: SeatingIcon },
  bathroom: { label: "Bathroom",Icon: BathroomIcon },
  storage:  { label: "Storage", Icon: StorageIcon },
  quiet:    { label: "Quiet",   Icon: QuietIcon },
  parking:  { label: "Parking", Icon: ParkingIcon },
};

/* ---- Component -------------------------------------------------------- */

interface AmenityTagProps {
  amenity: Amenity;
  className?: string;
}

export function AmenityTag({ amenity, className }: AmenityTagProps) {
  const { label, Icon } = AMENITY_CONFIG[amenity];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        paddingInline: "var(--space-2)",
        paddingBlock: "var(--space-1)",
        backgroundColor: "var(--color-background)",
        borderRadius: "var(--radius-lg)",
        color: "var(--color-text-tertiary)",
        fontSize: "8px",
        lineHeight: 1.4,
        letterSpacing: "-0.32px",
        fontFamily: "var(--font-sans)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <Icon />
      {label}
    </span>
  );
}
