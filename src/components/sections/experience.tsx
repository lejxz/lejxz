"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { experience } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ExperienceCard } from "@/components/cards/experience-card";

const PREVIEW_LIMIT = 3;

export function Experience() {
  // Show the 3 most recent items — no filters on the home preview.
  // Filtering lives on the /experience/ full page.
  const items = experience.items.slice(0, PREVIEW_LIMIT);
  const hasMore = experience.items.length > PREVIEW_LIMIT;

  return (
    <section id="experience" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="03" kicker="Timeline" title="Experience" />

        <Reveal delay={0.06}>
          <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </Reveal>

        {/* Timeline — 3 most recent items */}
        <div className="mt-10 relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-teal/50 via-line to-transparent sm:left-[9px]" />
          <motion.div layout className="relative space-y-3">
            {items.map((item, i) => (
              <div key={item.id} className="relative sm:pl-0">
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

        {/* View all link */}
        {hasMore && (
          <Reveal delay={0.1}>
            <div className="mt-8 flex justify-center">
              <Link
                href="/experience/"
                className="group inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-5 py-2 font-mono text-xs text-teal transition-colors hover:bg-teal/20"
              >
                View all {experience.items.length} entries
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
