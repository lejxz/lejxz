"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { experience } from "@/lib/data";
import type { ExperienceType, ExperienceItem } from "@/lib/types";
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

// The filter chip order (All first, then a stable, sensible type order).
const FILTER_ORDER: ("All" | ExperienceType)[] = [
  "All",
  "work",
  "education",
  "research",
  "award",
];

export function Experience() {
  const { openExperience } = useModals();
  const [active, setActive] = useState<"All" | ExperienceType>("All");

  // Derive the set of types actually present in the data so the filter only
  // shows chips for types that exist (hides empty categories). "All" is
  // always present.
  const presentTypes = useMemo(() => {
    const seen = new Set<ExperienceType>();
    for (const item of experience.items) {
      const t = (item.type ?? "work") as ExperienceType;
      seen.add(t);
    }
    return seen;
  }, []);

  const categories = useMemo(
    () => FILTER_ORDER.filter((c) => c === "All" || presentTypes.has(c as ExperienceType)),
    [presentTypes],
  );

  // Count per type for the filter chips (live counts).
  const countFor = (cat: "All" | ExperienceType) =>
    cat === "All"
      ? experience.items.length
      : experience.items.filter((it) => ((it.type ?? "work") as ExperienceType) === cat).length;

  // Filtered items, capped at PREVIEW_LIMIT for the home preview.
  const items = useMemo(() => {
    const filtered =
      active === "All"
        ? experience.items
        : experience.items.filter((it) => ((it.type ?? "work") as ExperienceType) === active);
    return filtered.slice(0, PREVIEW_LIMIT);
  }, [active]);

  // Total matches (before the preview cap) — for the divider count.
  const totalMatches = useMemo(
    () =>
      active === "All"
        ? experience.items.length
        : experience.items.filter((it) => ((it.type ?? "work") as ExperienceType) === active).length,
    [active],
  );

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

        {/* Type filter bar — animated chips with live counts. Matches the
            Work section's filter pattern for visual consistency. */}
        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-dim/60">
              <SlidersHorizontal className="h-3 w-3" />
              Filter
            </span>
            {categories.map((cat) => {
              const isActive = cat === active;
              const count = countFor(cat);
              const type = cat === "All" ? null : (cat as ExperienceType);
              // Use the type's accent for the active chip border/text so each
              // category has its own color identity.
              const accentClass =
                type === null
                  ? "border-teal/40 bg-teal/15 text-teal"
                  : TYPE_ACCENT[type] === "text-violet"
                    ? "border-violet/40 bg-violet/15 text-violet"
                    : "border-teal/40 bg-teal/15 text-teal";
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  aria-pressed={isActive}
                  aria-label={`Filter experience by ${cat === "All" ? "all types" : TYPE_LABEL[type!]}`}
                  className={cn(
                    "group relative inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-2 font-mono text-[11px] transition-all sm:min-h-0 sm:px-3 sm:py-1",
                    isActive
                      ? accentClass
                      : "border-line bg-surface/50 text-dim hover:border-teal/30 hover:text-foreground/80",
                  )}
                >
                  {/* Color dot matching the timeline node color, so the chip
                      visually maps to the timeline dots. */}
                  {type && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        TYPE_DOT[type],
                        isActive ? "opacity-100" : "opacity-50",
                      )}
                    />
                  )}
                  {cat === "All" ? "All" : TYPE_LABEL[type!]}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-px text-[9px] tabular-nums transition-colors",
                      isActive
                        ? type === null
                          ? "bg-teal/20 text-teal"
                          : TYPE_ACCENT[type] === "text-violet"
                            ? "bg-violet/20 text-violet"
                            : "bg-teal/20 text-teal"
                        : "bg-line/60 text-dim/70",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Flow timeline — a continuous vertical line on the left with
            nodes at each entry. The line is a single absolute element
            behind the cards, so it never overlaps or animates per-card.
            Cards sit to the right of the rail with consistent spacing. */}
        <div className="relative mt-8">
          {/* Continuous vertical line — sits behind the nodes, spans the
              full timeline height. No per-card connectors, no overlap.
              Hidden when there are no items (empty filter) so we don't
              render a dangling line. */}
          {items.length > 0 && (
            <div className="absolute left-[15px] top-5 bottom-5 w-px bg-line sm:left-[19px]" />
          )}

          <AnimatePresence mode="popLayout">
            {items.length > 0 ? (
              <motion.div layout className="space-y-4">
                {items.map((item, i) => {
                  const type = (item.type ?? "work") as ExperienceType;
                  return (
                    <FlowCard
                      key={item.id}
                      item={item}
                      index={i}
                      type={type}
                      onOpen={() => openExperience(item, experience.items)}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface/30 py-16 text-center"
              >
                <span className="font-mono text-sm text-dim">
                  No {active === "All" ? "" : TYPE_LABEL[active].toLowerCase() + " "}entries yet.
                </span>
                <button
                  type="button"
                  onClick={() => setActive("All")}
                  className="mt-1 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 font-mono text-[11px] text-teal transition-colors hover:bg-teal/20"
                >
                  Show all entries
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live count divider — shows how many entries match the active filter. */}
        <Reveal delay={0.05}>
          <div className="mt-6 flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-dim/60">
              {active === "All" ? "Showing" : TYPE_LABEL[active]}
            </span>
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] text-dim/50">
              {totalMatches} of {experience.items.length} {totalMatches === 1 ? "entry" : "entries"}
            </span>
          </div>
        </Reveal>

        {/* View all link — always shown */}
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
      </div>
    </section>
  );
}

/**
 * FlowCard — a single timeline entry.
 *
 * Layout: [node (32px)] [card content (flex-1)]
 * The node is a colored dot aligned with the card's title. The vertical
 * connector line is a single absolute element in the parent (not per-card),
 * so there's no overlap or animation jank.
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
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group flex gap-3 sm:gap-4"
    >
      {/* Node — a colored dot sitting on the continuous line.
          No per-card connector — the parent's absolute line handles it. */}
      <div className="relative flex w-8 shrink-0 justify-center pt-4 sm:w-10">
        <span
          className={cn(
            "relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-surface transition-transform group-hover:scale-110",
            TYPE_RING[type],
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOT[type])} />
        </span>
        {/* Pulse on current entries — made more prominent with a second
            ring + brighter fade so "Now" reads clearly. */}
        {item.current && (
          <>
            <motion.span
              className={cn(
                "absolute top-4 z-10 h-3.5 w-3.5 rounded-full border-2",
                TYPE_RING[type],
              )}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className={cn("absolute top-4 z-10 h-3.5 w-3.5 rounded-full", TYPE_DOT[type])}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            />
          </>
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
        className="card-hover-glow group/card relative mb-1 flex-1 cursor-pointer rounded-2xl border border-line bg-surface/75 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-lg hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-5"
      >
        {/* Header row: type + period + current badge */}
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-wider">
          <span className={TYPE_ACCENT[type]}>{TYPE_LABEL[type]}</span>
          <span className="text-dim/50">·</span>
          <span className="text-dim">{item.period}</span>
          {item.current && (
            <span className="flex items-center gap-1 rounded-full border border-teal/40 bg-teal/15 px-2 py-0.5 text-[9px] font-bold text-teal">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
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
                    : "border-teal/25 bg-teal/8 text-teal",
                )}
              >
                <span
                  className={cn(
                    "h-1 w-1 shrink-0 rounded-full",
                    type === "award" ? "bg-violet" : "bg-teal",
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
