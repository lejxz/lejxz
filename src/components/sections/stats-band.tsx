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

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="card-hover-glow group relative overflow-hidden rounded-xl border border-line bg-surface/40 p-3 text-center sm:p-4"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
                    accent.glow
                  )}
                />
                <div className="relative flex flex-col items-center">
                  <span className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-dim sm:text-[10px]">
                    {stat.label}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xl font-bold tracking-tight sm:text-2xl",
                      accent.text
                    )}
                    style={{ textShadow: "0 0 18px currentColor", filter: "brightness(1.1)" }}
                  >
                    {stat.prefix}
                    <CountUp to={stat.value} duration={1.8} suffix={stat.suffix ?? ""} />
                  </span>
                  <span className="mt-2 h-0.5 w-8 overflow-hidden rounded-full bg-line">
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
