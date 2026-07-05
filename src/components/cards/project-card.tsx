"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Link2, Check, Star } from "lucide-react";
import type { Project } from "@/lib/types";
import { useModals } from "@/lib/modals";
import { useCopy } from "@/hooks/use-copy";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  list,
  index = 0,
  variant = "default",
}: {
  project: Project;
  list?: Project[];
  index?: number;
  variant?: "default" | "compact";
}) {
  const { openProject } = useModals();
  const { copied, copy } = useCopy();

  const accentText = project.accent === "violet" ? "text-violet" : "text-teal";
  const accentBg =
    project.accent === "violet"
      ? "from-violet/15 to-transparent"
      : "from-teal/15 to-transparent";

  const open = () => openProject(project, list);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(`${window.location.origin}${window.location.pathname}#project=${project.id}`, "Project link copied");
  };

  if (variant === "compact") {
    return (
      <motion.button
        type="button"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
        className="card-hover-glow group flex w-full items-center gap-4 rounded-2xl border border-line bg-surface/50 p-3 text-left transition-colors hover:border-teal/30"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
          {project.cover || project.thumbnail ? (
            <img
              src={asset(project.cover ?? project.thumbnail!)}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br", accentBg)}>
              <span className={cn("font-mono text-lg font-bold", accentText)}>
                {project.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-mono text-sm font-bold text-foreground transition-colors group-hover:text-teal">
              {project.title}
            </h3>
            {project.featured && <Star className="h-3 w-3 shrink-0 fill-teal text-teal" />}
          </div>
          <p className="truncate text-xs text-dim">{project.subtitle ?? project.summary}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-dim">{project.year}</span>
            <span className="text-dim/50">·</span>
            <span className={cn("font-mono text-[10px]", accentText)}>{project.category}</span>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal" />
      </motion.button>
    );
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="card-hover-glow group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface/40 transition-colors hover:border-teal/30"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {project.cover || project.thumbnail ? (
          <img
            src={asset(project.cover ?? project.thumbnail!)}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br", accentBg)}>
            <span className={cn("font-mono text-4xl font-bold", accentText)}>
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
        {project.featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-2 py-1 font-mono text-[10px] text-teal backdrop-blur">
            <Star className="h-2.5 w-2.5 fill-teal" />
            Featured
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
