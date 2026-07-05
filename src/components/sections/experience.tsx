"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { experience } from "@/lib/data";
import type { ExperienceItem as ExperienceItemType } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

function ExperienceRow({ item, index }: { item: ExperienceItemType; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid gap-4 border-line py-7 md:grid-cols-[180px_1fr_auto] md:gap-8"
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-2 w-2 shrink-0 items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-teal" />
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-dim">
            {item.period}
          </span>
        </div>

        <div className="md:pl-0">
          <h3 className="font-mono text-lg font-bold text-foreground">
            {item.role}
            <span className="text-dim"> @ </span>
            <span className="text-teal">{item.org}</span>
          </h3>
          <p className="mt-1 font-mono text-xs text-dim">{item.location}</p>
          <p className="mt-3 max-w-2xl text-sm text-foreground/80">{item.summary}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-line px-2 py-0.5 font-mono text-[10px] text-dim"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-dim transition-colors hover:border-teal/50 hover:text-teal"
        >
          Details
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </motion.div>

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
            <p className="text-sm leading-relaxed text-foreground/90">{item.summary}</p>
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

        <div className="mt-12 divide-y divide-line border-t border-line">
          {experience.items.map((item, i) => (
            <ExperienceRow key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
