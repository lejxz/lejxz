"use client";

import { useRef, useState } from "react";
import { useAnimationFrame } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { marquee } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * HomeTicker — a full-width news-ticker that rolls endlessly and seamlessly.
 *
 * Uses the FIRST marquee row (tech stack names) with its `duration` and
 * `direction` from the JSON data. The second row is used in the Contact
 * section.
 *
 * Animation: uses framer-motion's `useAnimationFrame` to drive the translateX
 * via direct DOM manipulation. JS-driven, so it works reliably in static
 * export (GitHub Pages).
 *
 * NEW: pauses on hover (so users can read a tech name at rest) and shows a
 * directional chevron + "tech stack" label so the band reads as intentional
 * content rather than decoration.
 */
export function HomeTicker() {
  const row = marquee.rows[0];
  const stream = row?.items ?? ["code", "ml", "ship"];
  const duration = row?.duration ?? 15;
  const reverse = row?.direction === "right";
  const [paused, setPaused] = useState(false);

  return (
    <section
      aria-label="Technologies ticker"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group relative overflow-hidden border-y border-line bg-surface/50 py-4 backdrop-blur-sm"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      {/* Label badge — anchored left, sits above the marquee so the band has
          a clear identity ("tech stack"). Uses a solid background so it
          masks the marquee passing underneath it cleanly. */}
      <div className="pointer-events-none absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-2 rounded-full border border-teal/30 bg-background/90 px-3 py-1.5 backdrop-blur-md sm:flex">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
          tech stack
        </span>
        {/* Directional chevron — points in the direction the marquee scrolls.
            Flips when reverse=true. Gives a subtle "this is moving" cue. */}
        <ChevronRight
          className={cn(
            "h-3 w-3 text-teal/60 transition-transform",
            reverse && "rotate-180",
          )}
        />
      </div>

      {/* Paused indicator — appears on hover so the user knows the marquee
          is intentionally paused (not frozen/janky). Anchored right. */}
      <div
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-1.5 rounded-full border border-line bg-background/90 px-2.5 py-1 backdrop-blur-md transition-opacity duration-300 sm:flex",
          paused ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="flex gap-0.5">
          <span className="h-2 w-0.5 rounded-full bg-teal" />
          <span className="h-2 w-0.5 rounded-full bg-teal" />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-dim">
          paused
        </span>
      </div>

      <MarqueeTrack duration={duration} reverse={reverse} paused={paused}>
        <Track items={stream} />
        <Track items={stream} />
      </MarqueeTrack>
    </section>
  );
}

function Track({ items }: { items: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-6 pr-6" aria-hidden>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-6">
          <span className="font-mono text-base font-bold tracking-tight text-foreground/90 transition-colors hover:text-teal sm:text-lg">
            {item}
          </span>
          <span className="text-teal/60">/</span>
        </span>
      ))}
    </div>
  );
}

/**
 * ContactTicker — a marquee using the SECOND marquee row (specialization
 * areas). Placed above the contact card. Uses its own direction + duration
 * from the JSON data. Now also pauses on hover for consistency.
 */
export function ContactTicker() {
  const row = marquee.rows[1];
  const [paused, setPaused] = useState(false);
  if (!row) return null;
  const stream = row.items;
  const duration = row.duration ?? 15;
  const reverse = row.direction === "right";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group relative overflow-hidden border-y border-line bg-surface/40 py-3 backdrop-blur-sm"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      <MarqueeTrack duration={duration} reverse={reverse} paused={paused}>
        <ContactTrack items={stream} />
        <ContactTrack items={stream} />
      </MarqueeTrack>
    </div>
  );
}

function ContactTrack({ items }: { items: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-6 pr-6" aria-hidden>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-6">
          <span className="font-mono text-lg font-bold tracking-tight text-violet/80 transition-colors hover:text-violet sm:text-xl">
            {item}
          </span>
          <span className="text-teal/40">·</span>
        </span>
      ))}
    </div>
  );
}

/**
 * MarqueeTrack — the animated container. Uses framer-motion's
 * useAnimationFrame to drive the translateX. JS-driven, so it works in
 * static export without relying on CSS @keyframes.
 *
 * The container holds TWO identical children. We translate from 0 to -50%
 * (one child's width) over `duration` seconds, then snap back to 0.
 * The snap is invisible because the children are identical.
 *
 * `reverse` flips the direction (scrolls right instead of left).
 *
 * `paused` stops the animation (for hover-pause) without resetting position,
 * so resuming feels seamless.
 */
function MarqueeTrack({
  children,
  duration,
  reverse = false,
  paused = false,
}: {
  children: React.ReactNode;
  duration: number;
  reverse?: boolean;
  paused?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(0);

  useAnimationFrame((_, delta) => {
    const el = ref.current;
    if (!el) return;
    // When paused, skip the translate update but keep the current offset so
    // resuming is seamless (no jump back to 0).
    if (paused) return;

    // Pixels per millisecond. Total distance = half the container width
    // (one track copy). Duration is in seconds → milliseconds.
    const halfWidth = el.scrollWidth / 2;
    if (halfWidth <= 0) return;

    const pxPerMs = halfWidth / (duration * 1000);
    x.current += pxPerMs * delta;

    // Wrap: when we've translated past one track width, snap back.
    if (x.current >= halfWidth) x.current = 0;

    el.style.transform = `translate3d(${reverse ? x.current : -x.current}px, 0, 0)`;
  });

  return (
    <div ref={ref} className="flex w-max items-center will-change-transform">
      {children}
    </div>
  );
}
