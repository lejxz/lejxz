"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { projects, featuredProjects } from "@/lib/data";
import type { Project } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { ProjectCard } from "@/components/cards/project-card";
import { useModals } from "@/lib/modals";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 3;

export function Work() {
  const { openProject } = useModals();
  const spotlight = featuredProjects[0] ?? projects.projects[0];
  // Show 3 most recent projects — no filters on the home preview.
  // Filtering lives on the /projects/ full page.
  const items = projects.projects.slice(0, PREVIEW_LIMIT);
  const hasMore = projects.projects.length > PREVIEW_LIMIT;

  return (
    <section id="work" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="04" kicker="Selected work" title="Projects" />

        <Reveal delay={0.06}>
          <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
            A selection of projects spanning computer vision, HCI, and personal tooling.
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

        {/* Grid — 3 most recent projects */}
        <div className="mt-6">
          <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <ProjectCard key={p.id} project={p} list={projects.projects} index={i} />
            ))}
          </motion.div>
        </div>

        {/* View all link */}
        {hasMore && (
          <Reveal delay={0.1}>
            <div className="mt-8 flex justify-center">
              <Link
                href="/projects/"
                className="group inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-5 py-2 font-mono text-xs text-teal transition-colors hover:bg-teal/20"
              >
                View all {projects.projects.length} projects
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function SpotlightCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const accentText = project.accent === "violet" ? "text-violet" : "text-teal";
  const accentBorder = project.accent === "violet" ? "border-violet/30" : "border-teal/30";
  const accentGlow = project.accent === "violet" ? "bg-violet/15" : "bg-teal/15";

  return (
    <TiltCard max={4} className="mt-10 rounded-3xl">
      <motion.button
        type="button"
        onClick={onOpen}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className={cn(
          "card-hover-glow group relative grid w-full overflow-hidden rounded-3xl border border-line bg-surface/75 backdrop-blur-sm text-left transition-colors hover:border-teal/30 lg:grid-cols-2"
        )}
      >
        {/* image */}
        <div className="relative min-h-[16rem] overflow-hidden bg-surface-2 lg:min-h-[20rem]">
          {project.cover || project.thumbnail ? (
            <img
              src={asset(project.cover ?? project.thumbnail!)}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover"
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
    </TiltCard>
  );
}
