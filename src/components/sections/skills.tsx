"use client";

import { skills } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal, staggerContainer, staggerItem } from "@/components/motion/reveal";
import { motion } from "framer-motion";

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
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                  {group.title}
                </h3>
                <span className="font-mono text-[10px] text-dim">
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/90">{item.name}</span>
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
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
