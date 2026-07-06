"use client";

import { marquee } from "@/lib/data";

/**
 * HomeTicker — a full-width news-ticker that rolls endlessly and seamlessly.
 *
 * The animation uses TWO identical track copies side by side inside a flex
 * container. The container translates from 0 → -50% (one track width) over
 * the duration, then snaps back to 0 — because the two tracks are identical,
 * the snap is invisible, creating a seamless infinite loop.
 *
 * Hovering pauses the animation.
 *
 * NOTE: We use the `animate-marquee` class from globals.css (which defines
 * the `marquee-x` keyframe: 0 → -50% translate). styled-jsx `<style jsx>`
 * doesn't work reliably in Next.js 16 Turbopack dev mode, so we rely on the
 * global CSS class + a CSS variable for the duration.
 */
export function HomeTicker() {
  // Flatten all marquee rows into one stream of items.
  const items = marquee.rows.flatMap((r) => r.items);
  const stream = items.length ? items : ["code", "ml", "ship"];

  // Use a shorter duration based on item count so the movement is visible.
  const duration = Math.max(20, Math.min(40, stream.length * 2.5));

  return (
    <section
      aria-label="Technologies ticker"
      className="relative overflow-hidden border-y border-line bg-surface/50 backdrop-blur-sm py-4"
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      {/* The flex container holds two identical tracks. We animate the
          CONTAINER from 0 → -50% using the global `animate-marquee` class.
          The `--marquee-duration` CSS var controls the speed. */}
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
