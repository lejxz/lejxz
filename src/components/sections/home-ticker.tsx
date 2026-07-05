"use client";

import { marquee } from "@/lib/data";

/**
 * HomeTicker — a full-width news-ticker that rolls to the RIGHT (left → right)
 * endlessly and seamlessly. Uses two identical track copies so the -50% → 0
 * translate loops without any visible jump. Hovering pauses the animation.
 */
export function HomeTicker() {
  // Flatten all marquee rows into one stream of items.
  const items = marquee.rows.flatMap((r) => r.items);
  const stream = items.length ? items : ["code", "ml", "ship"];

  return (
    <section
      aria-label="Technologies ticker"
      className="relative overflow-hidden border-y border-line bg-surface/30 py-4"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="group flex w-max animate-marquee-rev items-center will-change-transform hover:[animation-play-state:paused]">
        {/* Track copy A */}
        <Track items={stream} />
        {/* Track copy B (identical) — makes the -50% loop seamless */}
        <Track items={stream} />
      </div>
    </section>
  );
}

function Track({ items }: { items: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-8">
          <span className="font-mono text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
            {item}
          </span>
          <span className="text-teal/60">/</span>
        </span>
      ))}
    </div>
  );
}
