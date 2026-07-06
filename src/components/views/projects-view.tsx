"use client";

import { useState } from "react";
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

  const q = query.trim().toLowerCase();
  const filtered = projects.projects.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchStatus = status === "all" || p.status === status;
    const matchQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.subtitle ?? "").toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      (p.tech ?? []).some((t) => t.toLowerCase().includes(q));
    return matchCat && matchStatus && matchQuery;
  });

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
        </Reveal>

        {/* Grid — all filtered projects */}
        <div className="mt-6">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p, i) => (
                  <ProjectCard key={p.id} project={p} list={filtered} index={i} />
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
                  onClick={() => { setCategory("All"); setStatus("all"); setQuery(""); }}
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
