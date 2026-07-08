"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star, Link2, Check } from "lucide-react";
import { projects, featuredProjects } from "@/lib/data";
import type { Project } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { useModals } from "@/lib/modals";
import { useCopy } from "@/hooks/use-copy";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const GRID_LIMIT = 6;

export function Work() {
  const { openProject } = useModals();

  // The topmost featured project gets the big spotlight card.
  // ALL remaining projects (including other featured ones) go in the
  // 6-card grid below — no separate carousel.
  const spotlight = featuredProjects[0] ?? projects.projects[0];
  const rest = projects.projects
    .filter((p) => p.id !== spotlight?.id)
    .slice(0, GRID_LIMIT);

  return (
    <section id="work" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="03" kicker="Selected work" title={projects.heading ?? "Projects"} />

        {(projects.subtitle ?? "") && (
          <Reveal delay={0.06}>
            <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
              {projects.subtitle}
            </p>
          </Reveal>
        )}

        {/* Spotlight — the single topmost featured project */}
        {spotlight && (
          <Reveal delay={0.1}>
            <SpotlightCard
              project={spotlight}
              onOpen={() => openProject(spotlight, projects.projects)}
            />
          </Reveal>
        )}

        {/* Grid — up to 6 remaining projects (featured or not) */}
        {rest.length > 0 && (
          <div className="mt-8">
            <Reveal delay={0.05}>
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-dim/60">
                  More projects
                </span>
                <div className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10px] text-dim/50">
                  {rest.length} more
                </span>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <ProjectTile key={p.id} project={p} index={i} onOpen={() => openProject(p, projects.projects)} />
              ))}
            </div>
          </div>
        )}

        {/* View all link — always shown */}
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
      </div>
    </section>
  );
}

/**
 * SpotlightCard — the single large featured project showcase.
 * Split layout: cover image on the left, details on the right.
 */
function SpotlightCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const { copied, copy } = useCopy();
  const accentText = project.accent === "violet" ? "text-violet" : "text-teal";
  const accentBorder = project.accent === "violet" ? "border-violet/30" : "border-teal/30";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(
      `${window.location.origin}${window.location.pathname}#project=${project.id}`,
      "Project link copied"
    );
  };

  return (
    <div className="mt-10">
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
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="card-hover-glow group relative grid w-full cursor-pointer overflow-hidden rounded-3xl border border-line bg-surface/75 backdrop-blur-sm transition-colors hover:border-teal/30 lg:grid-cols-[1.1fr_1fr]"
      >
        {/* Image side */}
        <div className="relative min-h-[18rem] overflow-hidden bg-surface-2 lg:min-h-[24rem]">
          {project.cover || project.thumbnail ? (
            <img
              src={asset(project.cover ?? project.thumbnail!)}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal/15 to-violet/15">
              <span className="font-mono text-6xl font-bold text-teal">
                {project.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent lg:bg-gradient-to-r" />

          {/* Badges */}
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-2.5 py-1 font-mono text-[10px] text-teal backdrop-blur">
              <Star className="h-2.5 w-2.5 fill-teal" />
              Featured
            </span>
            <span className="rounded-full border border-line bg-surface/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur">
              {project.category}
            </span>
          </div>
        </div>

        {/* Content side */}
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
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/75">
            {project.summary}
          </p>

          {/* Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              {project.highlights.slice(0, 4).map((h) => (
                <div key={h.label} className="rounded-xl border border-line bg-surface/50 p-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-dim">{h.label}</p>
                  <p className={cn("mt-0.5 font-mono text-xs font-bold", accentText)}>{h.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tech tags */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {(project.tech ?? project.tags).slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-md border border-line bg-surface-2/60 px-2 py-0.5 font-mono text-[10px] text-foreground/60"
              >
                {t}
              </span>
            ))}
            {(project.tech ?? project.tags).length > 5 && (
              <span className="font-mono text-[10px] text-dim">
                +{(project.tech ?? project.tags).length - 5}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center gap-3">
            <span className="flex items-center gap-2 font-mono text-xs text-teal">
              View case study
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border", accentBorder, "transition-transform group-hover:-translate-y-0.5")}>
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy project link"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-dim transition-colors hover:text-teal"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Link2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * ProjectTile — a clean, compact card for the grid below the spotlight.
 * Image-forward with hover sheen + quick info.
 */
function ProjectTile({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const { copied, copy } = useCopy();
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(
      `${window.location.origin}${window.location.pathname}#project=${project.id}`,
      "Project link copied"
    );
  };

  return (
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      className="card-hover-glow group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface/75 backdrop-blur-sm transition-colors hover:border-teal/30"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {project.cover || project.thumbnail ? (
          <img
            src={asset(project.cover ?? project.thumbnail!)}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal/15 to-transparent">
            <span className="font-mono text-4xl font-bold text-teal">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        {/* sheen sweep on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        {/* category badge */}
        <span className="absolute left-3 top-3 rounded-full border border-line bg-surface/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur">
          {project.category}
        </span>
        {/* featured star if this is a featured project in the grid */}
        {project.featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-2 py-1 font-mono text-[10px] text-teal backdrop-blur">
            <Star className="h-2.5 w-2.5 fill-teal" />
          </span>
        )}
        {/* copy link */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy project link"
          className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/80 text-foreground/70 opacity-0 backdrop-blur transition-all hover:text-teal group-hover:opacity-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Link2 className="h-3.5 w-3.5" />}
        </button>
        {/* view details */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/70 opacity-0 transition-opacity group-hover:opacity-100">
            View details
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-primary-foreground opacity-0 transition-all group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-dim">
          <span>{project.year}</span>
          <span className="text-dim/50">·</span>
          <span>{project.tags[0]}</span>
        </div>
        <h3 className="font-mono text-base font-bold text-foreground transition-colors group-hover:text-teal">
          {project.title}
        </h3>
        {project.subtitle && (
          <p className="mt-1 line-clamp-2 text-sm text-dim">{project.subtitle}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(project.tech ?? project.tags).slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md border border-line bg-surface-2/60 px-2 py-0.5 font-mono text-[10px] text-foreground/70"
            >
              {t}
            </span>
          ))}
          {(project.tech ?? project.tags).length > 3 && (
            <span className="rounded-md px-2 py-0.5 font-mono text-[10px] text-dim">
              +{(project.tech ?? project.tags).length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
