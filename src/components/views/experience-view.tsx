"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { experience } from "@/lib/data";
import type { ExperienceType, ExperienceItem } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { useModals } from "@/lib/modals";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const FILTERS: { key: ExperienceType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "work", label: "Work" },
  { key: "education", label: "Education" },
  { key: "research", label: "Research" },
  { key: "award", label: "Awards" },
];

const TYPE_LABEL: Record<ExperienceType, string> = {
  work: "Work",
  education: "Education",
  research: "Research",
  award: "Award",
};

const TYPE_ACCENT: Record<ExperienceType, string> = {
  work: "text-teal",
  education: "text-violet",
  research: "text-teal",
  award: "text-violet",
};

const TYPE_DOT: Record<ExperienceType, string> = {
  work: "bg-teal",
  education: "bg-violet",
  research: "bg-teal",
  award: "bg-violet",
};

const TYPE_RING: Record<ExperienceType, string> = {
  work: "border-teal/30",
  education: "border-violet/30",
  research: "border-teal/30",
  award: "border-violet/30",
};

export function ExperienceFull() {
  const { openExperience } = useModals();
  const [filter, setFilter] = useState<ExperienceType | "all">("all");

  const items = experience.items.filter(
    (e) => filter === "all" || (e.type ?? "work") === filter
  );

  return (
    <section className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/8 blur-[150px]" />

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Breadcrumb */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-dim">
            <Link
              href="/#experience"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-teal"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to home
            </Link>
            <span className="text-dim/30">·</span>
            <span className="text-dim/60">jump to:</span>
            {[
              { label: "experience", href: "/#experience" },
              { label: "skills", href: "/#skills" },
              { label: "contact", href: "/#contact" },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-full border border-line px-2 py-0.5 text-[10px] transition-colors hover:border-teal/40 hover:text-teal"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </Reveal>

        <div className="mt-6">
          <SectionHeading index="02" kicker="Full timeline" title="All Experience" />
        </div>

        <Reveal delay={0.06}>
          <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
            The complete timeline — filter by work, education, research, or awards.
          </p>
        </Reveal>

        {/* Filters */}
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "relative rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors",
                  filter === f.key
                    ? "border-teal/40 text-teal"
                    : "border-line text-dim hover:border-teal/30 hover:text-foreground"
                )}
              >
                {filter === f.key && (
                  <motion.span
                    layoutId="exp-full-filter-active"
                    className="absolute inset-0 -z-10 rounded-full bg-teal/10"
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  />
                )}
                {f.label}
                <span className="ml-1.5 text-dim/60">
                  {f.key === "all"
                    ? experience.items.length
                    : experience.items.filter((e) => (e.type ?? "work") === f.key).length}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Flow timeline — matches the home page styling.
            Continuous vertical line, nodes on the line, cards to the right. */}
        <div className="relative mt-10">
          <div className="absolute left-[15px] top-5 bottom-5 w-px bg-line sm:left-[19px]" />

          <div className="space-y-4">
            {items.map((item, i) => {
              const type = (item.type ?? "work") as ExperienceType;
              return (
                <Reveal key={item.id} delay={i * 0.06}>
                  <FlowCard
                    item={item}
                    index={i}
                    type={type}
                    onOpen={() => openExperience(item, experience.items)}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>

        {items.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-dim">
            No entries match this filter.
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * FlowCard — matches the home page's experience card design.
 * Node on the left line, card content to the right.
 */
function FlowCard({
  item,
  index,
  type,
  onOpen,
}: {
  item: ExperienceItem;
  index: number;
  type: ExperienceType;
  onOpen: () => void;
}) {
  const org = item.org ?? item.organization ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group flex gap-3 sm:gap-4"
    >
      {/* Node */}
      <div className="relative flex w-8 shrink-0 justify-center pt-4 sm:w-10">
        <span
          className={cn(
            "relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-surface",
            TYPE_RING[type]
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOT[type])} />
        </span>
        {item.current && (
          <motion.span
            className={cn(
              "absolute top-4 z-10 h-3.5 w-3.5 rounded-full border-2",
              TYPE_RING[type]
            )}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </div>

      {/* Card */}
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="card-hover-glow group/card relative mb-1 flex-1 cursor-pointer rounded-2xl border border-line bg-surface/75 p-4 backdrop-blur-sm transition-colors hover:border-teal/30 sm:p-5"
      >
        {/* Header */}
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-wider">
          <span className={TYPE_ACCENT[type]}>{TYPE_LABEL[type]}</span>
          <span className="text-dim/50">·</span>
          <span className="text-dim">{item.period}</span>
          {item.current && (
            <span className="flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-1.5 py-0.5 text-[9px] text-teal">
              <span className="h-1 w-1 animate-pulse rounded-full bg-teal" />
              Now
            </span>
          )}
        </div>

        {/* Title + org */}
        <div className="flex items-start gap-3">
          {item.logo && (
            <img
              src={asset(item.logo)}
              alt=""
              className="mt-0.5 h-10 w-10 shrink-0 rounded-lg border border-line bg-surface-2 object-contain p-1.5"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-mono text-base font-bold text-foreground transition-colors group-hover/card:text-teal sm:text-lg">
              {item.role}
            </h3>
            <p className="mt-0.5 text-sm text-dim">
              {org}
              {item.location && (
                <>
                  <span className="text-dim/50"> · </span>
                  {item.location}
                </>
              )}
            </p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-dim transition-all group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-teal" />
        </div>

        {/* Summary */}
        <p className="mt-2 line-clamp-2 text-xs text-dim/80 sm:text-sm">
          {item.summary}
        </p>

        {/* Achievement callouts */}
        {(item.achievements ?? []).length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(item.achievements ?? []).slice(0, 3).map((a, ci) => (
              <span
                key={ci}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] leading-tight",
                  type === "award"
                    ? "border-violet/30 bg-violet/8 text-violet"
                    : "border-teal/25 bg-teal/8 text-teal"
                )}
              >
                <span
                  className={cn(
                    "h-1 w-1 shrink-0 rounded-full",
                    type === "award" ? "bg-violet" : "bg-teal"
                  )}
                />
                <span className="line-clamp-1">{a}</span>
              </span>
            ))}
          </div>
        )}

        {/* Tech tags */}
        {(item.tech ?? []).length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(item.tech ?? []).slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-md border border-line bg-surface-2/60 px-2 py-0.5 font-mono text-[10px] text-foreground/60"
              >
                {t}
              </span>
            ))}
            {(item.tech ?? []).length > 5 && (
              <span className="font-mono text-[10px] text-dim">
                +{(item.tech ?? []).length - 5}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
