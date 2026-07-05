"use client";

import { marquee } from "@/lib/data";

/**
 * HomeTicker — a full-width news-ticker that rolls to the RIGHT
 * (boarding-station style). Uses doubled content for a seamless loop.
 */
export function HomeTicker() {
  // Flatten all marquee rows into one stream of items
  const items = marquee.rows.flatMap((r) => r.items);

  return (
    <section className="relative overflow-hidden border-y border-line bg-surface/30 py-4">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="group flex w-max animate-marquee-rev items-center gap-8 hover:[animation-play-state:paused]" style={{ ["--marquee-duration" as string]: "40s" }}>
        {/* Doubled content for seamless -50% loop */}
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
              {item}
            </span>
            <span className="text-teal/60">/</span>
          </span>
        ))}
      </div>
    </section>
  );
}
