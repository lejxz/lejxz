"use client";

import { Code2, BrainCircuit, Layout, Wrench, Cpu, SquareTerminal, Layers } from "lucide-react";
import { skills, uses } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal, staggerContainer, staggerItem } from "@/components/motion/reveal";
import { motion } from "framer-motion";

const groupIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  languages: Code2,
  ai: BrainCircuit,
  frontend: Layout,
  tooling: Wrench,
};

const usesIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  editor: Code2,
  terminal: SquareTerminal,
  compute: Cpu,
  stack: Layers,
};

export function Skills() {
  return (
    <section id="skills" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="02" kicker="Capabilities" title="Skills" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {skills.groups.map((group) => (
            <motion.div
              key={group.key}
              variants={staggerItem}
              className="flex flex-col rounded-xl border border-line bg-surface/50 p-5 transition-colors hover:border-teal/30"
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                  {(() => {
                    const Icon = groupIcon[group.key];
                    return Icon ? (
                      <Icon className="h-4 w-4 text-teal" />
                    ) : null;
                  })()}
                  {group.title}
                </h3>
                <span className="font-mono text-[10px] text-dim">
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {group.items.map((item) => {
                  const tier =
                    typeof item.level === "number"
                      ? item.level >= 85
                        ? "expert"
                        : item.level >= 70
                          ? "proficient"
                          : "familiar"
                      : null;
                  return (
                  <li
                    key={item.name}
                    className="group/skill rounded-md p-1.5 -m-1.5 transition-colors hover:bg-background/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-foreground/90">
                        {item.name}
                        {tier && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-dim opacity-0 transition-opacity group-hover/skill:opacity-100">
                            {tier}
                          </span>
                        )}
                      </span>
                      {typeof item.level === "number" && (
                        <span className="font-mono text-[10px] text-dim">
                          {item.level}
                        </span>
                      )}
                    </div>
                    {typeof item.level === "number" && (
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-teal to-violet"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    )}
                  </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Uses — merged into skills section */}
        <Reveal delay={0.1} className="mt-12">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-dim">
            <span className="text-teal">/</span>
            <span>Setup · Uses</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {uses.categories.map((cat) => {
            const Icon = usesIcon[cat.key];
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
