"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * SkewDivider — a section divider line that splits in half when the cursor
 * passes through it, then slowly reconnects.
 *
 * The line tracks the cursor's X position relative to the divider. When the
 * cursor is within a threshold distance, the line "breaks" at that point —
 * the left half slides left and the right half slides right, creating a gap.
 * As the cursor moves away, the two halves ease back together.
 *
 * Uses direct DOM manipulation (no framer-motion) for smooth 60fps animation
 * without re-renders.
 */
export function SkewDivider({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  // Target gap (0 = connected, positive = split).
  const targetGap = useRef(0);
  // Current gap (animated toward target).
  const currentGap = useRef(0);
  // Where the split happens (0..1, normalized X position).
  const splitPoint = useRef(0.5);

  // Animation loop — eases currentGap toward targetGap.
  const animate = () => {
    currentGap.current += (targetGap.current - currentGap.current) * 0.08;
    const gap = currentGap.current;
    const split = splitPoint.current;

    if (leftRef.current && rightRef.current) {
      // Left half: shift left by gap pixels, fade out the right edge.
      const leftShift = gap * (1 - split) * 2;
      leftRef.current.style.transform = `translateX(${-leftShift}px)`;
      leftRef.current.style.clipPath = `inset(0 ${gap * 0.5}px 0 0)`;

      // Right half: shift right by gap pixels, fade out the left edge.
      const rightShift = gap * split * 2;
      rightRef.current.style.transform = `translateX(${rightShift}px)`;
      rightRef.current.style.clipPath = `inset(0 0 0 ${gap * 0.5}px)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  };

  const onMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const normalized = Math.max(0, Math.min(1, x / rect.width));

    // Distance from the line (in pixels) — the line is 1px tall, so we
    // use a vertical threshold of ~40px.
    const y = e.clientY - rect.top;
    const dist = Math.abs(y);

    if (dist < 60) {
      splitPoint.current = normalized;
      // Gap is larger when cursor is closer to the line.
      targetGap.current = (1 - dist / 60) * 60;
    } else {
      targetGap.current = 0;
    }
  };

  const onLeave = () => {
    targetGap.current = 0;
  };

  // Start the animation loop on mount.
  const refCallback = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (el && !rafRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  return (
    <div
      ref={refCallback}
      aria-hidden
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "relative h-px w-full overflow-visible",
        className
      )}
      style={{ cursor: "crosshair" }}
    >
      {/* Left half of the line */}
      <div
        ref={leftRef}
        className={cn(
          "absolute left-0 top-0 h-px bg-gradient-to-r from-transparent to-teal/40",
          flip ? "rotate-[-1.2deg] origin-left" : "rotate-[1.2deg] origin-left"
        )}
        style={{ width: "50%", willChange: "transform, clip-path" }}
      />
      {/* Right half of the line */}
      <div
        ref={rightRef}
        className={cn(
          "absolute right-0 top-0 h-px bg-gradient-to-l from-transparent to-teal/40",
          flip ? "rotate-[-1.2deg] origin-right" : "rotate-[1.2deg] origin-right"
        )}
        style={{ width: "50%", willChange: "transform, clip-path" }}
      />
      {/* Center glow dot (visible when connected) */}
      <div
        className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal"
        style={{
          boxShadow: "0 0 8px var(--color-teal)",
          opacity: 1,
          transition: "opacity 0.3s",
        }}
        ref={(el) => {
          // Fade the dot out when the line is split.
          if (el) {
            const checkGap = () => {
              el.style.opacity = currentGap.current > 5 ? "0" : "1";
              requestAnimationFrame(checkGap);
            };
            checkGap();
          }
        }}
      />
    </div>
  );
}
