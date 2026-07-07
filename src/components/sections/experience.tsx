"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { experience } from "@/lib/data";
import type { ExperienceType } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { useModals } from "@/lib/modals";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 5;

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

export function Experience() {
  const { openExperience } = useModals();
  const items = experience.items.slice(0, PREVIEW_LIMIT);
  const hasMore = experience.items.length > PREVIEW_LIMIT;

  return (
    <section id="experience" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="02" kicker="Timeline" title={experience.heading ?? "Experience"} />

        {(experience.subtitle ?? "") && (
          <Reveal delay={0.06}>
            <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
              {experience.subtitle}
            </p>
          </Reveal>
        )}

        {/* Flow timeline — vertical stack of cards, each with its own
            left rail (node + connector). The connector line is scoped
            to each card's row, so it never overlaps the next card. */}
        <div className="mt-10 space-y-4">
          {items.map((item, i) => {
            const type = (item.type ?? "work") as ExperienceType;
            return (
              <Reveal key={item.id} delay={i * 0.08}>
                <FlowCard
                  item={item}
                  index={i}
                  isLast={i === items.length - 1}
                  type={type}
                  onOpen={() => openExperience(item)}
                />
              </Reveal>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-dim">
            No entries yet — check back soon.
          </div>
        )}

        {/* View all link */}
        {hasMore && (
          <Reveal delay={0.1}>
            <div className="mt-8 flex justify-center">
              <Link
                href="/experience/"
                className="group inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-5 py-2 font-mono text-xs text-teal transition-colors hover:bg-teal/20"
              >
                View all {experience.items.length} entries
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/**
 * FlowCard — a single timeline entry with a left rail.
 *
 * The rail has:
 *  - A node (colored dot) at the top, aligned with the card's first line
 *  - A connector line below the node that extends to the next card.
 *    The connector is clipped to THIS card's height (not absolute), so
 *    it never overlaps the next card awkwardly. The line fills via a
 *    scroll-triggered animation (whileInView), drawing downward.
 *
 * Layout: [rail (48px)] [card content (flex-1)]
 */
function FlowCard({
  item,
  index,
  isLast,
  type,
  onOpen,
}: {
  item: ExperienceItem;
  index: number;
  isLast: boolean;
  type: ExperienceType;
  onOpen: () => void;
}) {
  const org = item.org ?? item.organization ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex gap-3 sm:gap-4"
    >
      {/* Left rail — node + connector. Fixed width so all cards align. */}
      <div className="relative flex w-8 shrink-0 flex-col items-center sm:w-10">
        {/* Node — a colored dot with a ring, aligned to the card's title line */}
        <div className="relative flex h-10 items-center justify-center">
          <span
            className={cn(
              "flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-surface",
              TYPE_RING[type]
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOT[type])} />
          </span>
          {/* Pulse on current entries */}
          {item.current && (
            <motion.span
              className={cn("absolute h-3.5 w-3.5 rounded-full border-2", TYPE_RING[type])}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </div>
        {/* Connector — fills downward from the node. Scoped to this card,
            not overlapping the next. The line is a flex-1 column element
            that sits between the node and the card's bottom. We animate
            its scaleY via whileInView for a draw-on-scroll effect. */}
        {!isLast && (
          <div className="relative mt-1 w-px flex-1 bg-line">
            <motion.div
              className={cn(
                "absolute inset-0 origin-top",
                type === "award" || type === "education"
                  ? "bg-violet/40"
                  : "bg-teal/40"
              )}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        )}
      </div>

      {/* Card content */}
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
        {/* Header row: type + period + current badge */}
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

        {/* Achievement callouts — first 2 only */}
        {(item.achievements ?? []).length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(item.achievements ?? []).slice(0, 2).map((a, ci) => (
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

        {/* Tech tags — first 4 */}
        {(item.tech ?? []).length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(item.tech ?? []).slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-md border border-line bg-surface-2/60 px-2 py-0.5 font-mono text-[10px] text-foreground/60"
              >
                {t}
              </span>
            ))}
            {(item.tech ?? []).length > 4 && (
              <span className="font-mono text-[10px] text-dim">
                +{(item.tech ?? []).length - 4}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
