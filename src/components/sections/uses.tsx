"use client";

import { motion } from "framer-motion";
import { Cpu, Monitor, Keyboard, Wrench } from "lucide-react";
import { uses } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hardware: Monitor,
  editor: Keyboard,
  stack: Cpu,
  tooling: Wrench,
};

const CATEGORY_ACCENT: Record<string, string> = {
  hardware: "text-teal",
  editor: "text-violet",
  stack: "text-teal",
  tooling: "text-violet",
};

export function Uses() {
  return (
    <section id="uses" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[26rem] w-[26rem] rounded-full bg-violet/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="05" kicker="Setup" title="Uses" />
        <Reveal delay={0.06}>
          <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {uses.categories.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.key] ?? Cpu;
            const accent = CATEGORY_ACCENT[cat.key] ?? "text-teal";
            return (
              <Reveal key={cat.key} delay={i * 0.08}>
                <div className="card-hover-glow flex h-full flex-col rounded-2xl border border-line bg-surface/40 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-2/60", accent)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-foreground">
                        {cat.title}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
                        {cat.items.length} items
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {cat.items.map((item, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: i * 0.05 + j * 0.04 }}
                        className="group flex flex-col gap-0.5 rounded-lg border border-transparent px-2.5 py-1.5 transition-colors hover:border-line hover:bg-surface/50"
                      >
                        <span className="font-mono text-sm text-foreground/90 transition-colors group-hover:text-teal">
                          {item.name}
                        </span>
                        {item.detail && (
                          <span className="text-xs leading-relaxed text-dim">
                            {item.detail}
                          </span>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
