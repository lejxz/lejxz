"use client";

import { marquee } from "@/lib/data";

/**
 * HomeTicker — a full-width news-ticker that rolls endlessly and seamlessly.
 *
 * Uses the FIRST marquee row only (tech stack names). The second row
 * (specialization areas) is used in the Contact section as a separate
 * ticker above the contact card.
 *
 * NOTE: We use an INLINE animation style rather than the `animate-marquee`
 * CSS class + `--marquee-duration` variable. The CSS `var()` inside an
 * `animation` shorthand doesn't work reliably across all browsers/build
 * pipelines (especially Next.js static export). Inline style is the most
 * robust approach.
 */
export function HomeTicker() {
  const row = marquee.rows[0];
  const stream = row?.items ?? ["code", "ml", "ship"];
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
        className="group flex w-max items-center will-change-transform hover:[animation-play-state:paused]"
        style={{
          animation: `marquee-x ${duration}s linear infinite`,
        }}
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
 * Uses the reverse direction (left → right) to contrast with the home
 * ticker.
 */
export function ContactTicker() {
  const row = marquee.rows[1];
  if (!row) return null;
  const stream = row.items;
  const duration = Math.max(10, Math.min(18, stream.length * 0.8));

  // Determine direction: "right" in the data means the track should move
  // right-to-left visually, which is the `marquee-x-rev` keyframe.
  const keyframe = row.direction === "right" ? "marquee-x-rev" : "marquee-x";

  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/40 backdrop-blur-sm py-3">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      <div
        className="group flex w-max items-center will-change-transform hover:[animation-play-state:paused]"
        style={{
          animation: `${keyframe} ${duration}s linear infinite`,
        }}
      >
        <ContactTrack items={stream} />
        <ContactTrack items={stream} />
      </div>
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
