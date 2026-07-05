"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Star, Search } from "lucide-react";
import { projects, featuredProjects } from "@/lib/data";
import type { Project } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/cards/project-card";
import { useModals } from "@/lib/modals";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", ...Array.from(new Set(projects.projects.map((p) => p.category)))];

export function Work() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const { openProject } = useModals();

  const q = query.trim().toLowerCase();
  const filtered = projects.projects.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.subtitle ?? "").toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      (p.tech ?? []).some((t) => t.toLowerCase().includes(q));
    return matchCat && matchQuery;
  });

  const spotlight = featuredProjects[0] ?? projects.projects[0];

  return (
    <section id="work" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="04" kicker="Selected work" title="Projects" />

        <Reveal delay={0.06}>
          <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
            A selection of things I&apos;ve designed, trained, and shipped. Open any card for the
            full case study — architecture, metrics, and outcomes.
          </p>
        </Reveal>

        {/* Spotlight */}
        {spotlight && (
          <Reveal delay={0.1}>
            <SpotlightCard
              project={spotlight}
              onOpen={() => openProject(spotlight, projects.projects)}
            />
          </Reveal>
        )}

        {/* Search + filters */}
        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
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
                      layoutId="work-cat-active"
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
        </Reveal>

        {/* Grid */}
        <div className="mt-6">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p, i) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    list={filtered}
                    index={i}
                  />
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
                <p className="text-sm text-dim">No projects match your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("All");
                    setQuery("");
                  }}
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

function SpotlightCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const accentText = project.accent === "violet" ? "text-violet" : "text-teal";
  const accentBorder = project.accent === "violet" ? "border-violet/30" : "border-teal/30";
  const accentGlow = project.accent === "violet" ? "bg-violet/15" : "bg-teal/15";

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "card-hover-glow group relative mt-10 grid w-full overflow-hidden rounded-3xl border border-line bg-surface/40 text-left transition-colors hover:border-teal/30 lg:grid-cols-2"
      )}
    >
      {/* image */}
      <div className="relative min-h-[16rem] overflow-hidden bg-surface-2 lg:min-h-[20rem]">
        {project.cover || project.thumbnail ? (
          <img
            src={asset(project.cover ?? project.thumbnail!)}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br", accentGlow)}>
            <span className={cn("font-mono text-6xl font-bold", accentText)}>{project.title.charAt(0)}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent lg:bg-gradient-to-r" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full border border-teal/30 bg-teal/10 px-2.5 py-1 font-mono text-[10px] text-teal backdrop-blur">
            ★ Spotlight
          </span>
          <span className="rounded-full border border-line bg-surface/80 px-2.5 py-1 font-mono text-[10px] text-foreground/80 backdrop-blur">
            {project.category}
          </span>
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-dim">
          <span>{project.year}</span>
          <span className="text-dim/50">·</span>
          <span className={accentText}>{project.status}</span>
        </div>
        <h3 className="font-mono text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-teal sm:text-3xl">
          {project.title}
        </h3>
        {project.subtitle && (
          <p className="mt-1 text-sm text-dim sm:text-base">{project.subtitle}</p>
        )}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/75">
          {project.summary}
        </p>

        {project.highlights && project.highlights.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {project.highlights.map((h) => (
              <div key={h.label} className="rounded-xl border border-line bg-surface/50 p-2.5">
                <p className="font-mono text-[9px] uppercase tracking-wider text-dim">{h.label}</p>
                <p className={cn("mt-0.5 font-mono text-xs font-bold", accentText)}>{h.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 font-mono text-xs text-teal">
          <span>View case study</span>
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border", accentBorder, "transition-transform group-hover:-translate-y-0.5")}>
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
