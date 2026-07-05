"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, MapPin } from "lucide-react";
import { experience } from "@/lib/data";
import type { ExperienceItem as ExperienceItemType } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function ExperienceEntry({
  item,
  index,
}: {
  item: ExperienceItemType;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const isLeft = index % 2 === 0;

  return (
    <>
      <Reveal delay={0.03 * index}>
        <div className="relative grid md:grid-cols-2 md:gap-12">
          {/* Center dot (on the line) */}
          <div className="absolute left-3 top-3 z-10 -translate-x-1/2 md:left-1/2">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/30"
                style={{ animationDuration: "2.5s" }}
              />
              <span className="relative h-2.5 w-2.5 rounded-full bg-teal ring-4 ring-background" />
            </span>
          </div>

          {/* Card — left on even, right on odd (mobile: always full width, left-aligned) */}
          <div
            className={cn(
              "pl-10 md:pl-0",
              isLeft ? "md:col-start-1 md:pr-12 md:text-right" : "md:col-start-2 md:pl-12"
            )}
          >
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="rounded-xl border border-line bg-surface/50 p-5 transition-colors hover:border-teal/30"
            >
              <div
                className={cn(
                  "mb-2 flex flex-wrap items-center gap-2",
                  isLeft && "md:justify-end"
                )}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-teal">
                  {item.period}
                </span>
              </div>
              <h3 className="font-mono text-lg font-bold text-foreground">
                {item.role}
              </h3>
              <div
                className={cn(
                  "mb-3 flex items-center gap-2 text-sm",
                  isLeft && "md:justify-end"
                )}
              >
                <span className="font-medium text-teal">{item.org}</span>
                <span className="text-dim">·</span>
                <span className="flex items-center gap-1 text-dim">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">
                {item.summary}
              </p>
              <div
                className={cn(
                  "mt-3 flex flex-wrap gap-1.5",
                  isLeft && "md:justify-end"
                )}
              >
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-line px-2 py-0.5 font-mono text-[10px] text-dim"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                className={cn(
                  "mt-4",
                  isLeft && "md:flex md:justify-end"
                )}
              >
                <button
                  onClick={() => setOpen(true)}
                  className="group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-dim transition-colors hover:border-teal/50 hover:text-teal"
                >
                  Details
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </Reveal>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-line bg-background p-0 sm:max-w-xl">
          <div className="h-1 w-full bg-teal" />
          <DialogHeader className="space-y-0 border-b border-line p-6">
            <DialogTitle className="font-mono text-xl font-bold tracking-tight">
              {item.role}
              <span className="text-dim"> @ </span>
              <span className="text-teal">{item.org}</span>
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
              <span>{item.period}</span>
              <span className="text-dim">·</span>
              <span>{item.location}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 p-6">
            <p className="text-sm leading-relaxed text-foreground/90">
              {item.summary}
            </p>
            <ul className="space-y-2.5">
              {item.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/85">
                  <span className="mt-1 text-teal">▹</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-1.5 border-t border-line pt-4">
              {item.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded border-line font-mono text-xs text-dim"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Experience() {
  return (
    <section id="experience" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="03" kicker="Timeline" title="Experience" />

        <div className="mt-12">
          <div className="mb-3 flex items-center justify-between font-mono text-xs text-dim">
            <span>{experience.items.length} entries · scroll to see all</span>
            <ChevronDown className="h-3.5 w-3.5 animate-bounce text-teal/60" />
          </div>

          <div className="relative">
            {/* Center vertical line (desktop) / left line (mobile) */}
            <div className="absolute left-3 top-0 h-full w-px bg-line md:left-1/2 md:-translate-x-1/2" />

            {/* Scrollable container for long lists */}
            <div className="max-h-[640px] overflow-y-auto pr-2 pl-1 [scrollbar-width:thin]">
              <div className="space-y-8 py-2">
                {experience.items.map((item, i) => (
                  <ExperienceEntry key={item.id} item={item} index={i} />
                ))}
              </div>
            </div>

            {/* Bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
