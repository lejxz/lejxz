"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CursorTrail — a subtle particle trail that follows the cursor on desktop.
 *
 * Emits small fading dots behind the cursor as it moves. The dots use the
 * site's accent colors (teal/violet) and fade out over ~800ms. Disabled on
 * touch devices and when prefers-reduced-motion is set.
 *
 * The trail is purely decorative (aria-hidden) and uses pointer-events-none
 * so it never interferes with clicks.
 */
interface TrailDot {
  id: number;
  x: number;
  y: number;
  color: string;
}

const COLORS = ["#5eead4", "#a78bfa"];
const MAX_DOTS = 12;
const DOT_LIFETIME = 800; // ms

export function CursorTrail() {
  const [dots, setDots] = useState<TrailDot[]>([]);
  const idRef = useRef(0);
  const lastEmit = useRef(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on fine-pointer (desktop) devices without reduced motion.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      // Throttle: emit a dot every ~40ms to avoid flooding.
      if (now - lastEmit.current < 40) return;
      lastEmit.current = now;

      const id = idRef.current++;
      const color = COLORS[id % COLORS.length];
      const newDot: TrailDot = { id, x: e.clientX, y: e.clientY, color };

      setDots((cur) => [...cur.slice(-(MAX_DOTS - 1)), newDot]);

      // Remove this dot after its lifetime.
      setTimeout(() => {
        setDots((cur) => cur.filter((d) => d.id !== id));
      }, DOT_LIFETIME);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[95] hidden md:block"
      aria-hidden
    >
      <AnimatePresence>
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DOT_LIFETIME / 1000, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: dot.x - 4,
              top: dot.y - 4,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: dot.color,
              boxShadow: `0 0 6px ${dot.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
