"use client";

import { GitCommit } from "lucide-react";
import { changelog } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal, staggerContainer, staggerItem } from "@/components/motion/reveal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const accentText: Record<string, string> = {
  teal: "text-teal",
  violet: "text-violet",
};

const accentDot: Record<string, string> = {
  teal: "bg-teal",
  violet: "bg-violet",
};

export function Changelog() {
  return (
    <section id="changelog" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="09" kicker="Versions" title="Changelog" />

        <motion.ol
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 space-y-4"
        >
          {changelog.entries.map((entry, i) => (
            <motion.li
              key={entry.version}
              variants={staggerItem}
              className="group relative grid gap-4 rounded-xl border border-line bg-surface/40 p-5 transition-colors hover:border-teal/30 md:grid-cols-[140px_1fr] md:gap-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "relative flex h-3 w-3 shrink-0 items-center justify-center"
                  )}
                >
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-30",
                      accentDot[entry.accent]
                    )}
                    style={{ animationDuration: "2.5s" }}
                  />
                  <span
                    className={cn(
                      "relative h-2 w-2 rounded-full ring-4 ring-current/10",
                      accentDot[entry.accent]
                    )}
                  />
                </span>
                <div>
                  <p
                    className={cn(
                      "font-mono text-sm font-bold",
                      accentText[entry.accent]
                    )}
                  >
                    {entry.version}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
                    {entry.date}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <GitCommit className="h-3.5 w-3.5 text-dim" />
                  <h3 className="font-mono text-base font-bold text-foreground">
                    {entry.title}
                  </h3>
                  {i === 0 && (
                    <span className="rounded border border-teal/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-teal">
                      latest
                    </span>
                  )}
                </div>
                <ul className="mt-3 space-y-1.5">
                  {entry.changes.map((change, j) => (
                    <li
                      key={j}
                      className="flex gap-2.5 text-sm text-foreground/80"
                    >
                      <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", accentDot[entry.accent])} />
                      <span className="text-pretty">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
