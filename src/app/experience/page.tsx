"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { experience } from "@/lib/data";
import type { ExperienceItem as ExperienceItemType } from "@/lib/types";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { GrainOverlay } from "@/components/site/grain-overlay";
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
      <Reveal delay={0.04 * index}>
        <div className="relative grid md:grid-cols-2">
          {/* Dot — sits exactly on the center line */}
          <div className="absolute left-3 top-6 z-10 -translate-x-1/2 md:left-1/2 md:top-6">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/30"
                style={{ animationDuration: "2.5s" }}
              />
              <span className="relative h-2.5 w-2.5 rounded-full bg-teal ring-4 ring-background" />
            </span>
          </div>

          <div
            className={cn(
              "relative pl-10 md:pl-0",
              isLeft
                ? "md:col-start-1 md:-mr-[20%] md:pr-8"
                : "md:col-start-2 md:-ml-[20%] md:pl-8"
            )}
          >
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="rounded-xl border border-line bg-surface/50 p-5 transition-colors hover:border-teal/30"
            >
              <div className="mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-teal">
                  {item.period}
                </span>
              </div>
              <h3 className="font-mono text-lg font-bold text-foreground">
                {item.role}
              </h3>
              <div className="mb-3 flex items-center gap-2 text-sm">
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
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-line px-2 py-0.5 font-mono text-[10px] text-dim"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4">
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

export default function ExperiencePage() {
  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-30" />

        <section className="mx-auto w-full max-w-7xl flex-1 px-5 pt-28 sm:px-8 sm:pt-32">
          <Reveal>
            <Link
              href="/#experience"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-teal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>

            <div className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-dim">
              <span className="text-teal">/</span>
              <span>Archive</span>
            </div>
            <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              All Experience
            </h1>
            <p className="mt-4 max-w-xl text-dim">
              {experience.items.length} entries — full timeline.
            </p>
          </Reveal>

          <div className="mt-12">
            <div className="relative">
              <div className="absolute left-3 top-0 h-full w-px bg-line md:left-1/2 md:-translate-x-1/2" />
              <div className="space-y-8 py-2">
                {experience.items.map((item, i) => (
                  <ExperienceEntry key={item.id} item={item} index={i} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
