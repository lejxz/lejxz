"use client";

import Link from "next/link";
import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { experience } from "@/lib/data";
import type { ExperienceType, ExperienceItem } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ExperienceCard } from "@/components/cards/experience-card";
import { useModals } from "@/lib/modals";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 3;

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_MAP: Record<string, number> = Object.fromEntries(
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
    (m, i) => [m, i]
  )
);

const TYPE_COLOR: Record<ExperienceType, string> = {
  work: "var(--color-teal)",
  education: "var(--color-violet)",
  research: "var(--color-teal)",
  award: "var(--color-violet)",
};

const TYPE_LABEL: Record<ExperienceType, string> = {
  work: "Work",
  education: "Education",
  research: "Research",
  award: "Award",
};

/**
 * Parse a freeform period string into a {start, end} date range.
 * Handles: "2026", "Apr 2026 — Jun 2026", "2024 — 2028 (expected)"
 */
function parsePeriod(period: string): { start: Date; end: Date } | null {
  const clean = period.replace(/\(.*?\)/g, "").trim();

  // "Month Year — Month Year" (e.g., "Apr 2026 — Jun 2026")
  let m = clean.match(/(\w{3})\s+(\d{4})\s*[—–-]\s*(\w{3})\s+(\d{4})/);
  if (m) {
    const sm = MONTH_MAP[m[1]] ?? 0;
    const sy = parseInt(m[2]);
    const em = MONTH_MAP[m[3]] ?? 11;
    const ey = parseInt(m[4]);
    return { start: new Date(sy, sm, 1), end: new Date(ey, em, 1) };
  }

  // "Year — Year" (e.g., "2024 — 2028")
  m = clean.match(/(\d{4})\s*[—–-]\s*(\d{4})/);
  if (m) {
    return { start: new Date(parseInt(m[1]), 0, 1), end: new Date(parseInt(m[2]), 11, 1) };
  }

  // "Month Year" (e.g., "Apr 2026")
  m = clean.match(/(\w{3})\s+(\d{4})/);
  if (m) {
    const mo = MONTH_MAP[m[1]] ?? 0;
    const y = parseInt(m[2]);
    return { start: new Date(y, mo, 1), end: new Date(y, mo, 1) };
  }

  // "Year" (e.g., "2026")
  m = clean.match(/^(\d{4})$/);
  if (m) {
    const y = parseInt(m[1]);
    return { start: new Date(y, 0, 1), end: new Date(y, 11, 1) };
  }

  return null;
}

/** Check if a given year/month falls within an entry's date range. */
function inRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getFullYear() * 12 + date.getMonth();
  const s = start.getFullYear() * 12 + start.getMonth();
  const e = end.getFullYear() * 12 + end.getMonth();
  return d >= s && d <= e;
}

export function Experience() {
  const { openExperience } = useModals();
  const [hoveredCell, setHoveredCell] = useState<{
    year: number;
    month: number;
    entries: ExperienceItem[];
  } | null>(null);

  const items = experience.items.slice(0, PREVIEW_LIMIT);
  const hasMore = experience.items.length > PREVIEW_LIMIT;

  // Parse all entries' date ranges and compute the year span in one pass.
  const { parsed, yearSpan } = useMemo(() => {
    const p = experience.items.map((e) => ({
      entry: e,
      range: parsePeriod(e.period ?? ""),
    }));
    const dates = p
      .map((x) => x.range)
      .filter((r): r is { start: Date; end: Date } => r !== null);
    const min =
      dates.length > 0 ? Math.min(...dates.map((d) => d.start.getFullYear())) : 2024;
    const max =
      dates.length > 0
        ? Math.max(...dates.map((d) => d.end.getFullYear()))
        : 2028;
    return { parsed: p, yearSpan: { min, max: Math.max(max, min + 1) } };
  }, []);

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = yearSpan.min; y <= yearSpan.max; y++) arr.push(y);
    return arr;
  }, [yearSpan]);

  // For each year/month cell, find which entries cover it.
  const getCellEntries = (year: number, month: number): ExperienceItem[] => {
    const date = new Date(year, month, 1);
    return parsed
      .filter((p) => p.range && inRange(date, p.range.start, p.range.end))
      .map((p) => p.entry);
  };

  // The dominant entry for a cell (for coloring + opacity).
  // Education entries are treated as "background" (low opacity) since they
  // span years. Other types (award, work, research) are "foreground".
  const cellStyle = (
    entries: ExperienceItem[]
  ): { type: ExperienceType; opacity: number; isCurrent: boolean } | null => {
    if (entries.length === 0) return null;
    // Find the "foreground" entries (non-education)
    const foreground = entries.filter((e) => (e.type ?? "work") !== "education");
    const pool = foreground.length > 0 ? foreground : entries;
    // Priority: award > current > first
    const award = pool.find((e) => (e.type ?? "work") === "award");
    const current = pool.find((e) => e.current);
    const chosen = award ?? current ?? pool[0];
    const type = (chosen.type ?? "work") as ExperienceType;
    const isCurrent = entries.some((e) => e.current);
    // Education = background (faint); everything else = foreground (vivid)
    const opacity = type === "education" ? 0.12 : isCurrent ? 0.9 : 0.55;
    return { type, opacity, isCurrent };
  };

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

        {/* Contribution graph */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-line bg-surface/50 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
            {/* Graph */}
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[480px]">
                {/* Month labels */}
                <div className="mb-1.5 grid grid-cols-[2.5rem_repeat(12,1fr)] gap-[3px]">
                  <span />
                  {MONTHS.map((m, i) => (
                    <span
                      key={i}
                      className="text-center font-mono text-[9px] text-dim/60"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                {/* Year rows */}
                <div className="space-y-[3px]">
                  {years.map((year) => (
                    <div
                      key={year}
                      className="grid grid-cols-[2.5rem_repeat(12,1fr)] items-center gap-[3px]"
                    >
                      <span className="font-mono text-[10px] text-dim/70">{year}</span>
                      {MONTHS.map((_, mi) => {
                        const cellEntries = getCellEntries(year, mi);
                        const has = cellEntries.length > 0;
                        const style = has ? cellStyle(cellEntries) : null;
                        return (
                          <div
                            key={mi}
                            onMouseEnter={() =>
                              has &&
                              setHoveredCell({ year, month: mi, entries: cellEntries })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() =>
                              has &&
                              cellEntries[0] &&
                              openExperience(cellEntries[0])
                            }
                            className={cn(
                              "relative aspect-square rounded-[3px] border transition-all",
                              has
                                ? "cursor-pointer border-transparent hover:scale-125 hover:z-10"
                                : "border-line/50 bg-transparent"
                            )}
                            style={
                              has && style
                                ? {
                                    backgroundColor: TYPE_COLOR[style.type],
                                    opacity: style.opacity,
                                    boxShadow: style.isCurrent
                                      ? `0 0 6px ${TYPE_COLOR[style.type]}`
                                      : "none",
                                  }
                                : undefined
                            }
                          >
                            {/* Pulse on current foreground entries */}
                            {has && style && style.isCurrent && style.opacity > 0.5 && (
                              <motion.span
                                className="absolute inset-0 rounded-[3px]"
                                style={{ backgroundColor: TYPE_COLOR[style.type] }}
                                initial={{ opacity: 0.4, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.6 }}
                                transition={{
                                  duration: 1.8,
                                  repeat: Infinity,
                                  ease: "easeOut",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex shrink-0 flex-row flex-wrap gap-3 sm:flex-col sm:gap-2">
              <span className="w-full font-mono text-[10px] uppercase tracking-wider text-dim/60">
                Legend
              </span>
              {(Object.keys(TYPE_LABEL) as ExperienceType[]).map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-[2px]"
                    style={{ backgroundColor: TYPE_COLOR[t] }}
                  />
                  <span className="font-mono text-[10px] text-foreground/70">
                    {TYPE_LABEL[t]}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <motion.span
                  className="h-2.5 w-2.5 rounded-[2px] bg-teal"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <span className="font-mono text-[10px] text-foreground/70">Current</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Hover tooltip for the contribution graph */}
        <AnimatePresence>
          {hoveredCell && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-line bg-surface/95 px-4 py-2.5 shadow-lg backdrop-blur-sm"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
                {MONTH_NAMES[hoveredCell.month]} {hoveredCell.year}
              </p>
              <div className="mt-1 space-y-0.5">
                {hoveredCell.entries.map((e) => (
                  <p key={e.id} className="text-xs text-foreground/90">
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-[2px] align-middle"
                      style={{ backgroundColor: TYPE_COLOR[(e.type ?? "work") as ExperienceType] }}
                    />
                    {e.role}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entry cards below the graph */}
        <div className="mt-8 space-y-3">
          {items.map((item, i) => (
            <ExperienceCard key={item.id} experience={item} index={i} variant="row" />
          ))}
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
