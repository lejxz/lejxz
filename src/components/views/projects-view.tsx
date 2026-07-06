"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { projects } from "@/lib/data";
import type { ProjectStatus } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/cards/project-card";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", ...Array.from(new Set(projects.projects.map((p) => p.category)))];

const STATUSES: { key: "all" | ProjectStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "shipped", label: "Shipped" },
  { key: "wip", label: "In progress" },
  { key: "archived", label: "Archived" },
];

const STATUS_DOT: Record<string, string> = {
  shipped: "bg-teal",
  wip: "bg-violet",
  archived: "bg-dim",
};

export function ProjectsFull() {
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Keyboard navigation: j/k moves focus between project cards. We track the
  // focused index and scroll the card into view. Enter opens it.
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Build the list of all tech tags across projects, sorted by frequency.
  const ALL_TAGS = useState(() => {
    const counts = new Map<string, number>();
    for (const p of projects.projects) {
      for (const t of p.tech ?? p.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
  })[0];

  const q = query.trim().toLowerCase();
  const filtered = projects.projects.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchStatus = status === "all" || p.status === status;
    const matchTag = !activeTag || (p.tech ?? p.tags).includes(activeTag);
    const matchQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.subtitle ?? "").toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      (p.tech ?? []).some((t) => t.toLowerCase().includes(q));
    return matchCat && matchStatus && matchTag && matchQuery;
  });

  const resetAll = () => {
    setCategory("All");
    setStatus("all");
    setQuery("");
    setActiveTag(null);
  };

  // Clamp focusedIdx when the filtered list changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusedIdx((cur) => {
      if (cur === null) return null;
      if (filtered.length === 0) return null;
      return Math.min(cur, filtered.length - 1);
    });
  }, [filtered.length]);

  const focusCard = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, filtered.length - 1));
      setFocusedIdx(clamped);
      const el = cardRefs.current[clamped];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [filtered.length]
  );

  // j/k keyboard navigation (only when not typing in an input and no dialog open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (document.querySelector("[role=dialog]")) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        focusCard(focusedIdx === null ? 0 : focusedIdx + 1);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        focusCard(focusedIdx === null ? filtered.length - 1 : focusedIdx - 1);
      } else if (e.key === "Escape") {
        setFocusedIdx(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedIdx, focusCard, filtered.length]);

  return (
    <section className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <Link
            href="/#work"
            className="group inline-flex items-center gap-1.5 font-mono text-xs text-dim transition-colors hover:text-teal"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </Reveal>

        <div className="mt-6">
          <SectionHeading index="04" kicker="All work" title="All Projects" />
        </div>

        <Reveal delay={0.06}>
          <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </Reveal>

        {/* Search + filters */}
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "relative rounded-full border px-3 py-1 font-mono text-[11px] transition-colors",
                    category === c
                      ? "border-teal/40 text-teal"
                      : "border-line text-dim hover:border-teal/30 hover:text-foreground"
                  )}
                >
                  {category === c && (
                    <motion.span
                      layoutId="proj-full-cat-active"
                      className="absolute inset-0 -z-10 rounded-full bg-teal/10"
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    />
                  )}
                  {c}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                className="w-full rounded-full border border-line bg-surface/40 py-1.5 pl-9 pr-3 font-mono text-xs text-foreground placeholder:text-dim focus:border-teal/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-dim/70">status:</span>
              {STATUSES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] transition-colors",
                    status === s.key
                      ? "border-violet/40 bg-violet/10 text-violet"
                      : "border-line text-dim hover:border-violet/30 hover:text-foreground"
                  )}
                >
                  {s.key !== "all" && <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[s.key])} />}
                  {s.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[10px] text-dim">
              {filtered.length} / {projects.projects.length} shown
            </span>
          </div>

          {/* Tech-tag cloud — click a tag to filter */}
          {ALL_TAGS.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-dim/70">tech:</span>
              {ALL_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTag((cur) => (cur === t ? null : t))}
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors",
                    activeTag === t
                      ? "border-teal/50 bg-teal/15 text-teal"
                      : "border-line text-dim hover:border-teal/30 hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
              {activeTag && (
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className="ml-1 rounded-full px-2 py-0.5 font-mono text-[10px] text-violet hover:underline"
                >
                  clear tag
                </button>
              )}
            </div>
          )}
        </Reveal>

        {/* Keyboard nav hint */}
        {filtered.length > 0 && (
          <p className="mt-4 hidden font-mono text-[10px] text-dim/60 md:block">
            <span className="text-teal/60">[tip]</span> press{" "}
            <kbd className="rounded border border-line px-1 py-0.5 text-foreground/70">j</kbd>
            /<kbd className="rounded border border-line px-1 py-0.5 text-foreground/70">k</kbd>{" "}
            to navigate cards ·{" "}
            <kbd className="rounded border border-line px-1 py-0.5 text-foreground/70">↵</kbd>{" "}
            to open
          </p>
        )}

        {/* Grid — all filtered projects */}
        <div className="mt-6">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p, i) => (
                  <div
                    key={p.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    onMouseEnter={() => setFocusedIdx(i)}
                    className={cn(
                      "relative rounded-2xl transition-all duration-200",
                      focusedIdx === i
                        ? "ring-2 ring-teal/50 ring-offset-2 ring-offset-background scale-[1.02]"
                        : "ring-0 ring-transparent"
                    )}
                  >
                    <ProjectCard project={p} list={filtered} index={i} />
                    {/* index badge shown when keyboard-focused */}
                    {focusedIdx === i && (
                      <span className="absolute -left-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-teal font-mono text-[10px] font-bold text-primary-foreground shadow-lg shadow-teal/30">
                        {i + 1}
                      </span>
                    )}
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-line p-12 text-center"
              >
                <p className="text-sm text-dim">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <button
                  type="button"
                  onClick={resetAll}
                  className="mt-3 rounded-full border border-teal/40 bg-teal/10 px-4 py-1.5 font-mono text-xs text-teal transition-colors hover:bg-teal/20"
                >
                  Reset filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
