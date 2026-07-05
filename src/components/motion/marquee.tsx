"use client";

import { marquee } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Marquee() {
  return (
    <div className="flex flex-col gap-2 py-3 select-none">
      {marquee.rows.map((row, i) => (
        <div
          key={i}
          className="group flex overflow-hidden mask-fade-x"
          aria-hidden
        >
          <div
            className={cn(
              "flex shrink-0 items-center gap-6 pr-6 will-change-transform",
              row.direction === "left" ? "animate-marquee" : "animate-marquee-rev",
              "group-hover:[animation-play-state:paused]"
            )}
            style={{ ["--marquee-duration" as string]: `${row.duration}s` }}
          >
            {[...row.items, ...row.items].map((item, j) => (
              <span key={j} className="flex items-center gap-6">
                <span className="font-mono text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl md:text-4xl">
                  {item}
                </span>
                <span className="text-teal/70">/</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
