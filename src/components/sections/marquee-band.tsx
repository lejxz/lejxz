"use client";

import { Marquee } from "@/components/motion/marquee";

export function MarqueeBand() {
  return (
    <section className="relative border-y border-line bg-surface/40 py-2">
      <Marquee />
    </section>
  );
}
