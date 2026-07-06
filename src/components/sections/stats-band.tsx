"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { profile } from "@/lib/data";
import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";

const ACCENTS = [
  { text: "text-teal", glow: "from-teal/20" },
  { text: "text-violet", glow: "from-violet/20" },
  { text: "text-teal", glow: "from-teal/20" },
  { text: "text-violet", glow: "from-violet/20" },
];

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const stats = profile.numericStats ?? [];

  if (stats.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-label="Quick stats"
      className="relative overflow-hidden border-y border-line bg-surface/20"
    >
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-40" />

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="card-hover-glow group relative overflow-hidden rounded-2xl border border-line bg-surface/40 p-5 text-center sm:p-6"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
                    accent.glow
                  )}
                />
                <div className="relative flex flex-col items-center">
                  <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                    {stat.label}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
                      accent.text
                    )}
                    style={{ textShadow: "0 0 24px currentColor", filter: "brightness(1.1)" }}
                  >
                    {stat.prefix}
                    <CountUp to={stat.value} duration={1.8} suffix={stat.suffix ?? ""} />
                  </span>
                  <span className="mt-3 h-0.5 w-10 overflow-hidden rounded-full bg-line">
                    <motion.span
                      className={cn("block h-full rounded-full", accent.text)}
                      style={{ backgroundColor: "currentColor" }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: "100%" } : { width: 0 }}
                      transition={{ duration: 1.2, delay: i * 0.1 + 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
