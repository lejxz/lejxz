"use client";

import { skills } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function Skills() {
  // Flatten all skills across all groups into one ticker stream.
  const allSkills = skills.groups.flatMap((g) =>
    g.items.map((item) => ({ ...item, group: g.title }))
  );

  return (
    <section id="skills" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="02" kicker="Capabilities" title="Skills" />

        <Reveal delay={0.05} className="mt-6">
          <p className="max-w-2xl text-pretty text-dim">
            A running stream of the stack I reach for — languages, frameworks,
            tools, and the ML ecosystem I build in daily.
          </p>
        </Reveal>
      </div>

      {/* Full-width ticker — boarding-station / news-ticker style, moving right */}
      <Reveal delay={0.1} className="mt-10">
        <div className="group relative overflow-hidden border-y border-line bg-surface/30 py-5">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max animate-marquee-rev items-center gap-8 group-hover:[animation-play-state:paused]" style={{ ["--marquee-duration" as string]: "50s" }}>
            {[...allSkills, ...allSkills, ...allSkills].map((item, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {item.name}
                  </span>
                  {typeof item.level === "number" && (
                    <span className="font-mono text-xs text-dim">
                      {item.level}
                    </span>
                  )}
                </span>
                <span className="text-teal/60">/</span>
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Group legend below */}
      <Reveal delay={0.15} className="mx-auto mt-6 max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          {skills.groups.map((g) => (
            <span key={g.key} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-teal" />
              {g.title}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
