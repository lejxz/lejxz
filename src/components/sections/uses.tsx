"use client";

import { motion } from "framer-motion";
import { Cpu, Monitor, Keyboard, Wrench } from "lucide-react";
import { uses } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hardware: Monitor,
  editor: Keyboard,
  stack: Cpu,
  tooling: Wrench,
};

const CATEGORY_ACCENT: Record<string, { text: string; ring: string; chip: string; glow: string }> = {
  hardware: {
    text: "text-teal",
    ring: "group-hover:border-teal/40",
    chip: "bg-teal/10 text-teal border-teal/20",
    glow: "from-teal/12",
  },
  editor: {
    text: "text-violet",
    ring: "group-hover:border-violet/40",
    chip: "bg-violet/10 text-violet border-violet/20",
    glow: "from-violet/12",
  },
  stack: {
    text: "text-teal",
    ring: "group-hover:border-teal/40",
    chip: "bg-teal/10 text-teal border-teal/20",
    glow: "from-teal/12",
  },
  tooling: {
    text: "text-violet",
    ring: "group-hover:border-violet/40",
    chip: "bg-violet/10 text-violet border-violet/20",
    glow: "from-violet/12",
  },
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
            const accent = CATEGORY_ACCENT[cat.key] ?? CATEGORY_ACCENT.stack;
            return (
              <Reveal key={cat.key} delay={i * 0.08}>
                <TiltCard
                  max={6}
                  className="group relative h-full rounded-2xl border border-line bg-surface/40 p-6 transition-colors [&:hover]:border-teal/30"
                >
                  {/* hover glow blob — sits behind content, fades in on hover */}
                  <div
                    className={cn(
                      "pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100",
                      accent.glow
                    )}
                  />
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-2/60 transition-transform duration-300 group-hover:scale-110",
                        accent.text
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-mono text-sm font-bold text-foreground">
                        {cat.title}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
                        {cat.items.length} items
                      </p>
                    </div>
                    {/* count badge */}
                    <span
                      className={cn(
                        "inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 font-mono text-[10px] font-bold tabular-nums",
                        accent.chip
                      )}
                    >
                      {cat.items.length}
                    </span>
                  </div>

                  <ul className="space-y-1">
                    {cat.items.map((item, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: i * 0.05 + j * 0.04 }}
                        className="group/item flex flex-col gap-0.5 rounded-lg border border-transparent px-2.5 py-1.5 transition-colors hover:border-line hover:bg-surface/60"
                      >
                        <div className="flex items-center gap-2">
                          {/* bullet that lights up on hover */}
                          <span
                            className={cn(
                              "h-1 w-1 shrink-0 rounded-full bg-dim/50 transition-all duration-300 group-hover/item:h-1.5 group-hover/item:w-1.5",
                              accent.text,
                              "group-hover/item:bg-current"
                            )}
                          />
                          <span className="font-mono text-sm text-foreground/90 transition-colors group-hover/item:text-teal">
                            {item.name}
                          </span>
                        </div>
                        {item.detail && (
                          <span className="pl-3 text-xs leading-relaxed text-dim">
                            {item.detail}
                          </span>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
