"use client";

import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal, staggerContainer, staggerItem } from "@/components/motion/reveal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Testimonials() {
  return (
    <section id="testimonials" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="07" kicker="Voices" title="Testimonials" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {testimonials.items.map((t, i) => (
            <motion.figure
              key={`${t.author}-${i}`}
              variants={staggerItem}
              className="group relative flex flex-col rounded-xl border border-line bg-surface/50 p-6 transition-colors hover:border-teal/30"
            >
              <Quote
                className={cn(
                  "h-7 w-7 shrink-0 transition-colors",
                  t.accent === "teal" ? "text-teal/40" : "text-violet/40"
                )}
              />
              <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                <p className="font-mono text-sm font-bold text-foreground">
                  {t.author}
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-mono text-xs",
                    t.accent === "teal" ? "text-teal" : "text-violet"
                  )}
                >
                  {t.role}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
