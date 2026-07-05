"use client";

import { now } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal, staggerContainer, staggerItem } from "@/components/motion/reveal";
import { motion } from "framer-motion";

export function NowSection() {
  return (
    <section id="now" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="06" kicker="Currently" title="Now" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-4 sm:grid-cols-2"
        >
          {now.items.map((item) => (
            <motion.div
              key={item.label}
              variants={staggerItem}
              className="group relative overflow-hidden rounded-xl border border-line bg-surface/50 p-6 transition-colors hover:border-teal/30"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal/5 blur-2xl transition-opacity duration-500 group-hover:bg-teal/10" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
                    {item.label}
                  </p>
                  <h3 className="mt-2 font-mono text-lg font-bold tracking-tight text-foreground">
                    {item.value}
                  </h3>
                  {item.detail && (
                    <p className="mt-2 text-sm text-dim">{item.detail}</p>
                  )}
                </div>
                <span className="mt-1 flex h-2 w-2 shrink-0 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-violet/70" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <Reveal delay={0.1} className="mt-6">
          <p className="font-mono text-xs text-dim">
            <span className="text-teal">{"// "}</span>last updated {now.updated}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
