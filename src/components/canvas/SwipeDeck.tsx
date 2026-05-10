"use client";

/**
 * SwipeDeck — swipeable card pile for the FreeTime pile view.
 *
 * Interaction model:
 *   Swipe LEFT  → dismiss card, moves to back of the pile
 *   Swipe RIGHT → save space (Zustand savedSpaces), moves to back of pile
 *   Tap         → open space address in Google Maps
 *
 * Pile visual:
 *   - Top card: 0° rotation, full scale, draggable
 *   - Middle card: seeded rotation ±5°, 97.5% scale — springs forward when top is swiped
 *   - Back card: seeded rotation ±5° (opposite direction), 95% scale
 *
 * Gesture engine: framer-motion (drag="x", useMotionValue, useTransform, animate)
 *
 * Rotation on "step-forward" animation:
 *   The new top card receives its previous middle-slot rotation as initialRotation.
 *   A useMotionValue(initialRotation) springs to 0 on mount, combined with the
 *   live drag-tilt via a composite useTransform.
 */

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  animate,
  type PanInfo,
} from "framer-motion";
import { useAppStore } from "@/lib/store";
import type { Space } from "@/lib/types/space";
import { getMapsHref } from "@/lib/geo/maps-link";
import { SpaceProfileCard } from "./SpaceProfileCard";

/* ── Constants ──────────────────────────────────────────────────────────── */

const SWIPE_X_THRESHOLD = 80;         // px offset to trigger a swipe
const SWIPE_V_THRESHOLD = 450;        // px/s velocity to trigger a swipe
const FLY_DISTANCE = 680;             // px off-screen when card exits

/* ── Pile rotation seed ─────────────────────────────────────────────────── */

/**
 * Returns a deterministic rotation in [-5, 5] degrees for a card in the pile.
 * Two different seeds (0, 1) give different values so middle and back never clash.
 */
function pileRotationDeg(spaceId: string, seed: 0 | 1): number {
  let h = seed * 2654435761;
  for (let i = 0; i < spaceId.length; i++) {
    h = Math.imul(h ^ spaceId.charCodeAt(i), 2654435761);
    h ^= h >>> 16;
  }
  const raw = ((h >>> 0) % 1000) / 1000; // 0–1
  return (raw - 0.5) * 10; // -5 to +5
}

/* ── TopCard ────────────────────────────────────────────────────────────── */

/**
 * The active top card. Mounts fresh on each cycle (key={topIdx}) so the
 * spring-to-straight animation replays for every new top card.
 *
 * Rotation is the sum of:
 *   baseRot  — springs from initialRotation → 0 on mount
 *   dragRot  — live tilt proportional to horizontal drag offset
 */
interface TopCardProps {
  space: Space;
  isSaved: boolean;
  initialRotation: number;
  reducedMotion: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

function TopCard({
  space,
  isSaved,
  initialRotation,
  reducedMotion,
  onSwipeLeft,
  onSwipeRight,
}: TopCardProps) {
  const x = useMotionValue(0);

  // Springs from initialRotation to 0 when the card becomes top.
  // With reduced motion, snap straight to 0 with no spring.
  const baseRot = useMotionValue(reducedMotion ? 0 : initialRotation);
  useEffect(() => {
    if (reducedMotion) {
      baseRot.set(0);
      return;
    }
    const controls = animate(baseRot, 0, {
      type: "spring",
      stiffness: 260,
      damping: 26,
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Live tilt proportional to horizontal drag (capped at ±15°).
  // With reduced motion, no tilt — keep the card flat while dragging.
  const dragEffect = useTransform(
    x,
    [-280, 0, 280],
    reducedMotion ? [0, 0, 0] : [-15, 0, 15]
  );

  // Composite rotation = spring-to-straight + drag tilt
  const rotation = useTransform(
    [baseRot, dragEffect] as const,
    ([base, drag]: number[]) => base + drag
  );

  // Swipe hint badge opacities
  const saveOpacity = useTransform(x, [20, SWIPE_X_THRESHOLD + 20], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_X_THRESHOLD - 20, -20], [1, 0]);

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const { offset, velocity } = info;
    const isRight = offset.x > SWIPE_X_THRESHOLD || velocity.x > SWIPE_V_THRESHOLD;
    const isLeft  = offset.x < -SWIPE_X_THRESHOLD || velocity.x < -SWIPE_V_THRESHOLD;

    // With reduced motion, fire the swipe callbacks immediately and skip the
    // fly-out / snap-back animations. The user still gets the gesture; we
    // just don't animate the consequence.
    if (isRight) {
      if (reducedMotion) {
        onSwipeRight();
        x.set(0);
      } else {
        animate(x, FLY_DISTANCE, {
          type: "spring",
          stiffness: 180,
          damping: 20,
          velocity: velocity.x,
          onComplete: () => {
            onSwipeRight();
            x.set(0);
          },
        });
      }
    } else if (isLeft) {
      if (reducedMotion) {
        onSwipeLeft();
        x.set(0);
      } else {
        animate(x, -FLY_DISTANCE, {
          type: "spring",
          stiffness: 180,
          damping: 20,
          velocity: velocity.x,
          onComplete: () => {
            onSwipeLeft();
            x.set(0);
          },
        });
      }
    } else {
      // Snap back
      if (reducedMotion) {
        x.set(0);
      } else {
        animate(x, 0, { type: "spring", stiffness: 450, damping: 30 });
      }
    }
  }

  function handleTap() {
    // Route through getMapsHref so iOS taps land in Apple Maps and Android
    // taps trigger the system map chooser. Desktop and unknown UAs get the
    // Google Maps web fallback.
    const mapsUrl = getMapsHref(`${space.name}, ${space.address}`);
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        x,
        rotate: rotation,
        cursor: "grab",
        touchAction: "none",
      }}
      drag="x"
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileDrag={{ cursor: "grabbing" }}
    >
      <SpaceProfileCard space={space} isSaved={isSaved} />

      {/* ── SAVE hint (right swipe) ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "var(--space-4)",
          right: "var(--space-4)",
          opacity: saveOpacity,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 5,
          backgroundColor: "var(--color-success)",
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          borderRadius: "var(--radius-md)",
          padding: "4px 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        ♥ Save
      </motion.div>

      {/* ── PASS hint (left swipe) ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "var(--space-4)",
          left: "var(--space-4)",
          opacity: passOpacity,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 5,
          backgroundColor: "var(--color-error)",
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          borderRadius: "var(--radius-md)",
          padding: "4px 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        ✕ Pass
      </motion.div>
    </motion.div>
  );
}

/* ── SwipeDeck ──────────────────────────────────────────────────────────── */

interface SwipeDeckProps {
  spaces: Space[];
  loading?: boolean;
}

export function SwipeDeck({ spaces, loading = false }: SwipeDeckProps) {
  const saveSpace   = useAppStore((s) => s.saveSpace);
  const savedSpaces = useAppStore((s) => s.savedSpaces);

  // Honors the OS-level "reduce motion" setting. When true:
  //   - mid/back pile cards render flat (no rotation, no scale offset)
  //   - the top card skips its spring-to-straight on mount
  //   - swipe / snap-back animations resolve instantly
  // The drag gesture itself still works; only decorative motion is disabled.
  const reducedMotion = useReducedMotion() ?? false;

  /**
   * topIdx cycles through 0…n-1 indefinitely (mod n).
   * Stored as state so React 19's strict ref-during-render rule isn't tripped.
   * The value can grow unbounded — wrap with % n on access.
   */
  const [topIdx, setTopIdx] = useState(0);

  /**
   * Rotation the NEW top card should spring FROM (was the middle card's rotation).
   * State, not ref, because it's read during render (passed to TopCard).
   */
  const [initialRotation, setInitialRotation] = useState(0);

  const n = spaces.length;

  if (loading) {
    return <SwipeDeckSkeleton />;
  }

  if (n === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 420,
          color: "var(--color-text-tertiary)",
          fontSize: 14,
          fontFamily: "var(--font-sans)",
          fontWeight: 300,
        }}
      >
        No spaces found. Try adjusting your filters.
      </div>
    );
  }

  const topPos  = topIdx % n;
  const midPos  = (topIdx + 1) % n;
  const backPos = (topIdx + 2) % n;

  const topSpace  = spaces[topPos];
  const midSpace  = spaces[midPos];
  const backSpace = spaces[backPos];

  const midRot  = reducedMotion ? 0 : pileRotationDeg(midSpace.id, 0);
  const backRot = reducedMotion ? 0 : pileRotationDeg(backSpace.id, 1);

  function advanceDeck(saved: boolean) {
    if (saved) saveSpace(topSpace.id);
    setInitialRotation(midRot);
    setTopIdx((i) => i + 1);
  }

  return (
    <div
      role="region"
      aria-label="Space pile — swipe left to pass, right to save, tap to open in Maps"
      style={{ position: "relative", height: 490 }}
    >
      {/* ── Back card (z:1) — lowest in pile ── */}
      <motion.div
        key="back-slot"
        style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
        animate={
          reducedMotion
            ? { rotate: 0, scale: 1, y: 0 }
            : { rotate: backRot, scale: 0.95, y: 6 }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 220, damping: 28 }
        }
      >
        <SpaceProfileCard space={backSpace} isSaved={savedSpaces.includes(backSpace.id)} />
      </motion.div>

      {/* ── Middle card (z:2) — steps forward when top is swiped ── */}
      <motion.div
        key="mid-slot"
        style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}
        animate={
          reducedMotion
            ? { rotate: 0, scale: 1, y: 0 }
            : { rotate: midRot, scale: 0.975, y: 3 }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 220, damping: 28 }
        }
      >
        <SpaceProfileCard space={midSpace} isSaved={savedSpaces.includes(midSpace.id)} />
      </motion.div>

      {/* ── Top card (z:10) — draggable, remounts on each cycle ── */}
      <TopCard
        key={topIdx}
        space={topSpace}
        isSaved={savedSpaces.includes(topSpace.id)}
        initialRotation={initialRotation}
        reducedMotion={reducedMotion}
        onSwipeLeft={() => advanceDeck(false)}
        onSwipeRight={() => advanceDeck(true)}
      />

      {/* ── Swipe hint dots ── */}
      {n > 1 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -28,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {Array.from({ length: Math.min(n, 5) }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === 0 ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === 0
                    ? "var(--color-text-secondary)"
                    : "var(--color-text-disabled)",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */

function SwipeDeckSkeleton() {
  return (
    <div style={{ position: "relative", height: 490 }}>
      {[2, 1, 0].map((depth) => (
        <div
          key={depth}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: depth,
            transform: `rotate(${depth === 0 ? 0 : depth === 1 ? 3 : -4}deg) scale(${1 - depth * 0.025})`,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            backgroundColor: "var(--color-layer-1)",
            boxShadow: "0px 4px 12px rgba(108, 114, 117, 0.22)",
          }}
        >
          {/* Image placeholder */}
          <div
            style={{
              height: 130,
              background: `linear-gradient(90deg, var(--color-accent) 25%, color-mix(in srgb, var(--color-accent) 60%, white) 50%, var(--color-accent) 75%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite linear",
              marginTop: 46,
            }}
          />
          {/* Text lines */}
          <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[140, 200, 120].map((w, i) => (
              <div
                key={i}
                style={{
                  height: i === 1 ? 22 : 14,
                  width: w,
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-background)",
                  background: `linear-gradient(90deg, var(--color-background) 25%, var(--color-accent) 50%, var(--color-background) 75%)`,
                  backgroundSize: "200% 100%",
                  animation: `shimmer 1.5s ${i * 0.15}s infinite linear`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

