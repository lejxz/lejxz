"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { projects } from "@/lib/data";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { ProjectCard } from "@/components/project/project-card";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const [category, setCategory] = useState<string>("All");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set(projects.projects.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.projects.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.projects.filter((p) => {
      const catOk = category === "All" || p.category === category;
      const tagOk =
        activeTags.length === 0 ||
        activeTags.every((t) => p.tags.includes(t));
      const qOk =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return catOk && tagOk && qOk;
    });
  }, [category, activeTags, query]);

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setCategory("All");
    setActiveTags([]);
    setQuery("");
  }

  // Scroll to a project anchor when arriving via hash (e.g. from the command palette).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      );
    }
  }, [category, activeTags]);

  const hasFilters = category !== "All" || activeTags.length > 0 || query.trim() !== "";

  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-40" />

        <section className="mx-auto w-full max-w-7xl flex-1 px-5 pt-28 sm:px-8 sm:pt-32">
          <Reveal>
            <Link
              href="/#top"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-teal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>

            <div className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-dim">
              <span className="text-teal">/</span>
              <span>Archive</span>
            </div>
            <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              All Projects
            </h1>
            <p className="mt-4 max-w-xl text-dim">
              <span className="font-mono text-foreground">
                {filtered.length}
              </span>{" "}
              of {projects.projects.length} entries ·{" "}
              {categories.length - 1} categories · {allTags.length} tags
            </p>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-1.5 w-40 overflow-hidden rounded-full bg-line">
                {(["shipped", "wip", "archived"] as const).map((s) => {
                  const count = projects.projects.filter(
                    (p) => p.status === s
                  ).length;
                  const pct = (count / projects.projects.length) * 100;
                  const color =
                    s === "shipped"
                      ? "bg-teal"
                      : s === "wip"
                        ? "bg-violet"
                        : "bg-dim/50";
                  return pct > 0 ? (
                    <div
                      key={s}
                      className={color}
                      style={{ width: `${pct}%` }}
                      title={`${s}: ${count}`}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-dim">
                {(["shipped", "wip", "archived"] as const).map((s) => {
                  const count = projects.projects.filter(
                    (p) => p.status === s
                  ).length;
                  const dot =
                    s === "shipped"
                      ? "bg-teal"
                      : s === "wip"
                        ? "bg-violet"
                        : "bg-dim/50";
                  return (
                    <span key={s} className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                      {s} {count}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 space-y-5 border-b border-line pb-6">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, tags, categories…"
                aria-label="Search projects"
                className="w-full rounded-lg border border-line bg-surface/40 py-2.5 pl-10 pr-9 font-mono text-sm text-foreground placeholder:text-dim/70 focus:border-teal/50 focus:outline-none focus:ring-1 focus:ring-teal/30"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim transition-colors hover:text-teal"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                Category
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
                    category === cat
                      ? "border-teal/60 bg-teal/10 text-teal"
                      : "border-line text-dim hover:border-teal/40 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                Tags
              </span>
              {allTags.map((tag) => {
                const active = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[11px] tracking-wider transition-colors",
                      active
                        ? "border-violet/60 bg-violet/10 text-violet"
                        : "border-line text-dim hover:border-violet/40 hover:text-foreground"
                    )}
                  >
                    {active && <X className="h-3 w-3" />}
                    {tag}
                  </button>
                );
              })}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-dim transition-colors hover:text-teal"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </Reveal>

          {filtered.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, i) => (
                <Reveal key={project.id} delay={i * 0.04}>
                  <ProjectCard project={project} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line py-20 text-center">
              <p className="font-mono text-sm text-dim">
                No projects match these filters.
              </p>
              <button
                onClick={clearFilters}
                className="font-mono text-xs uppercase tracking-wider text-teal transition-colors hover:text-violet"
              >
                Reset
              </button>
            </div>
          )}
        </section>

        <Footer />
      </main>
    </>
  );
}
