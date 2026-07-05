"use client";

import { Code2, SquareTerminal, Cpu, Layers } from "lucide-react";
import { uses } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal, staggerContainer, staggerItem } from "@/components/motion/reveal";
import { motion } from "framer-motion";

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  editor: Code2,
  terminal: SquareTerminal,
  compute: Cpu,
  stack: Layers,
};

export function Uses() {
  return (
    <section id="uses" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="04" kicker="Setup" title="Uses" />

        <Reveal delay={0.05} className="mt-6">
          <p className="max-w-2xl text-pretty text-dim">
            The tools, hardware, and stack powering daily work — research,
            builds, and everything between.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {uses.categories.map((cat) => {
            const Icon = categoryIcon[cat.key];
            return (
              <motion.div
                key={cat.key}
                variants={staggerItem}
                className="flex flex-col rounded-xl border border-line bg-surface/50 p-5 transition-colors hover:border-violet/30"
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                    {Icon && <Icon className="h-4 w-4 text-violet" />}
                    {cat.title}
                  </h3>
                  <span className="font-mono text-[10px] text-dim">
                    {String(cat.items.length).padStart(2, "0")}
                  </span>
                </div>
                <ul className="mt-4 space-y-3">
                  {cat.items.map((item) => (
                    <li key={item.name}>
                      <p className="text-sm font-medium text-foreground/90">
                        {item.name}
                      </p>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-dim">{item.detail}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
