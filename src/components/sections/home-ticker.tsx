"use client";

import { useRef } from "react";
import { useAnimationFrame } from "framer-motion";
import { marquee } from "@/lib/data";

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
 * Does NOT pause on hover — keeps scrolling continuously.
 */
export function HomeTicker() {
  const row = marquee.rows[0];
  const stream = row?.items ?? ["code", "ml", "ship"];
  const duration = row?.duration ?? 15;
  const reverse = row?.direction === "right";

  return (
    <section
      aria-label="Technologies ticker"
      className="relative overflow-hidden border-y border-line bg-surface/50 backdrop-blur-sm py-4"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <MarqueeTrack duration={duration} reverse={reverse}>
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
          <span className="font-mono text-base font-bold tracking-tight text-foreground/90 sm:text-lg">
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
 * from the JSON data.
 */
export function ContactTicker() {
  const row = marquee.rows[1];
  if (!row) return null;
  const stream = row.items;
  const duration = row.duration ?? 15;
  const reverse = row.direction === "right";

  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/40 backdrop-blur-sm py-3">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      <MarqueeTrack duration={duration} reverse={reverse}>
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
          <span className="font-mono text-lg font-bold tracking-tight text-violet/80 sm:text-xl">
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
 * Does NOT pause on hover — keeps scrolling continuously.
 */
function MarqueeTrack({
  children,
  duration,
  reverse = false,
}: {
  children: React.ReactNode;
  duration: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(0);

  useAnimationFrame((_, delta) => {
    const el = ref.current;
    if (!el) return;

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
