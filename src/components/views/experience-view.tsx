"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { experience } from "@/lib/data";
import type { ExperienceType } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ExperienceCard } from "@/components/cards/experience-card";
import { cn } from "@/lib/utils";

const FILTERS: { key: ExperienceType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "work", label: "Work" },
  { key: "education", label: "Education" },
  { key: "research", label: "Research" },
  { key: "award", label: "Awards" },
];

export function ExperienceFull() {
  const [filter, setFilter] = useState<ExperienceType | "all">("all");
  const timelineRef = useRef<HTMLDivElement>(null);

  // Scroll-linked progress for the vertical timeline line. The line fills
  // from the top as the user scrolls through the timeline section.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 80%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const headTop = useTransform(lineScale, [0, 1], ["0%", "100%"]);

  const items = experience.items.filter(
    (e) => filter === "all" || (e.type ?? "work") === filter
  );

  return (
    <section className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/8 blur-[150px]" />

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Breadcrumb — back to home + section quick-links */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-dim">
            <Link
              href="/#experience"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-teal"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to home
            </Link>
            <span className="text-dim/30">·</span>
            <span className="text-dim/60">jump to:</span>
            {[
              { label: "experience", href: "/#experience" },
              { label: "skills", href: "/#skills" },
              { label: "contact", href: "/#contact" },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-full border border-line px-2 py-0.5 text-[10px] transition-colors hover:border-teal/40 hover:text-teal"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </Reveal>

        <div className="mt-6">
          <SectionHeading index="03" kicker="Full timeline" title="All Experience" />
        </div>

        <Reveal delay={0.06}>
          <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "relative rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors",
                  filter === f.key
                    ? "border-teal/40 text-teal"
                    : "border-line text-dim hover:border-teal/30 hover:text-foreground"
                )}
              >
                {filter === f.key && (
                  <motion.span
                    layoutId="exp-full-filter-active"
                    className="absolute inset-0 -z-10 rounded-full bg-teal/10"
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  />
                )}
                {f.label}
                <span className="ml-1.5 text-dim/60">
                  {f.key === "all"
                    ? experience.items.length
                    : experience.items.filter((e) => (e.type ?? "work") === f.key).length}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Timeline — the vertical line fills as the user scrolls through it */}
        <div ref={timelineRef} className="mt-10 relative">
          {/* Track (full-height faint line) */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line sm:left-[9px]" />
          {/* Progress fill (teal→violet gradient, scaled by scroll) */}
          <motion.div
            style={{ scaleY: lineScale, transformOrigin: "top" }}
            className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-teal via-teal/80 to-violet sm:left-[9px]"
          />
          {/* Glowing head node — sits at the current fill position */}
          <motion.div
            style={{ top: headTop }}
            className="absolute left-[7px] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal shadow-[0_0_10px_var(--color-teal)] sm:left-[9px]"
          />
          <motion.div layout className="relative space-y-3">
            {items.map((item, i) => (
              <div key={item.id} className="relative">
                <ExperienceCard experience={item} index={i} variant="row" />
              </div>
            ))}
          </motion.div>
        </div>

        {items.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-dim">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </div>
        )}
      </div>
    </section>
  );
}
