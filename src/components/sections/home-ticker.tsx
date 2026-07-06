"use client";

import { marquee } from "@/lib/data";

/**
 * HomeTicker — a full-width news-ticker that rolls endlessly and seamlessly.
 *
 * Uses the FIRST marquee row only (tech stack names). The second row
 * (specialization areas) is used in the Contact section as a separate
 * ticker above the contact card.
 *
 * The animation uses the global `animate-marquee` CSS class from
 * globals.css with a `--marquee-duration` CSS variable for the speed.
 */
export function HomeTicker() {
  // Use only the first row for the home ticker.
  const row = marquee.rows[0];
  const stream = row?.items ?? ["code", "ml", "ship"];

  // Fast duration so movement is clearly visible.
  const duration = Math.max(10, Math.min(18, stream.length * 0.8));

  return (
    <section
      aria-label="Technologies ticker"
      className="relative overflow-hidden border-y border-line bg-surface/50 backdrop-blur-sm py-4"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div
        className="group flex w-max animate-marquee items-center will-change-transform hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <Track items={stream} />
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

/**
 * ContactTicker — a marquee using the SECOND marquee row (specialization
 * areas like "Computer Vision", "NLP", etc.). Placed above the contact
 * card to add visual interest and reinforce the AI/ML focus.
 *
 * Uses `animate-marquee-rev` (right → left reverse = left → right movement)
 * to contrast with the home ticker's direction.
 */
export function ContactTicker() {
  const row = marquee.rows[1];
  if (!row) return null;
  const stream = row.items;

  const duration = Math.max(10, Math.min(18, stream.length * 0.8));
  // Use the reverse animation class (moves right → left = opposite direction
  // from the home ticker for visual variety).
  const animClass = row.direction === "right" ? "animate-marquee-rev" : "animate-marquee";

  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/40 backdrop-blur-sm py-3">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      <div
        className={`group flex w-max ${animClass} items-center will-change-transform hover:[animation-play-state:paused]`}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center gap-6 pr-6" aria-hidden>
          {stream.map((item, i) => (
            <span key={i} className="flex items-center gap-6">
              <span className="font-mono text-lg font-bold tracking-tight text-violet/80 sm:text-xl">
                {item}
              </span>
              <span className="text-teal/40">·</span>
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-6 pr-6" aria-hidden>
          {stream.map((item, i) => (
            <span key={i} className="flex items-center gap-6">
              <span className="font-mono text-lg font-bold tracking-tight text-violet/80 sm:text-xl">
                {item}
              </span>
              <span className="text-teal/40">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
