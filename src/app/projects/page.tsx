"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { projects } from "@/lib/data";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ProjectCard } from "@/components/project/project-card";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const [filter, setFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set(projects.projects.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return projects.projects;
    return projects.projects.filter((p) => p.category === filter);
  }, [filter]);

  return (
    <>
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
              {projects.projects.length} entries across {categories.length - 1}{" "}
              categories.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <div className="flex flex-wrap gap-2 border-b border-line pb-5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
                    filter === cat
                      ? "border-teal/60 bg-teal/10 text-teal"
                      : "border-line text-dim hover:border-teal/40 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.04}>
                <ProjectCard project={project} index={i} />
              </Reveal>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
