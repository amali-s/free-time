/**
 * Chevron icon — directional arrow used for accordion toggle and navigation.
 * Matches Sage Component Kit chevron (node 250-343).
 *
 * States: "down" (default, collapsed) | "up" (expanded) | "right" | "left"
 */

interface ChevronProps {
  direction?: "down" | "up" | "right" | "left";
  className?: string;
  size?: number;
}

export function Chevron({ direction = "down", className, size = 12 }: ChevronProps) {
  const rotation: Record<string, string> = {
    down: "rotate(0)",
    up: "rotate(180deg)",
    right: "rotate(-90deg)",
    left: "rotate(90deg)",
  };

  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 12 6"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ transform: rotation[direction], transition: "transform 200ms var(--ease-exit)" }}
    >
      <path
        d="M1 1 L6 5 L11 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
