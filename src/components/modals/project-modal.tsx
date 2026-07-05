"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Calendar,
  User,
  Activity,
  ExternalLink,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import type { Project } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gallery } from "@/components/site/gallery";
import { useCopy } from "@/hooks/use-copy";
import { useModals } from "@/lib/modals";
import { getRelatedProjects } from "@/lib/data";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  shipped: "Shipped",
  wip: "Work in progress",
  archived: "Archived",
};

export function ProjectModal({
  project,
  open,
  onClose,
  onNext,
  onPrev,
  hasMultiple,
}: {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasMultiple?: boolean;
}) {
  const { copy } = useCopy();

  // keyboard arrow navigation
  useEffect(() => {
    if (!open || !hasMultiple) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hasMultiple, onNext, onPrev]);

  const galleryImages =
    project?.gallery && project.gallery.length > 0
      ? project.gallery.map((g) => ({ src: g.src, caption: g.caption }))
      : project?.galleryImages && project.galleryImages.length > 0
        ? project.galleryImages.map((src) => ({ src }))
        : project?.cover || project?.thumbnail
          ? [{ src: project.cover ?? project.thumbnail!, caption: "Cover" }]
          : [];

  const accentText = project?.accent === "violet" ? "text-violet" : "text-teal";

  const handleShare = () => {
    if (!project) return;
    copy(
      `${window.location.origin}${window.location.pathname}#project=${project.id}`,
      "Project link copied"
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogTitle className="sr-only">
          {project?.title ?? "Project details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Detailed view of {project?.title}.
        </DialogDescription>
        <DialogContent className="max-h-[92svh] max-w-3xl gap-0 overflow-hidden border-line bg-popover/95 p-0 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {project && (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex max-h-[92svh] flex-col"
              >
                {/* Gallery header */}
                <div className="relative">
                  <Gallery images={galleryImages} height="h-44 sm:h-56" />
                  <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-line bg-surface/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className={cn("rounded-full border border-teal/30 bg-teal/10 px-2 py-1 font-mono text-[10px] backdrop-blur", accentText)}>
                        ★ Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label="Copy project link"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/80 text-foreground/70 backdrop-blur transition-colors hover:text-teal"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex h-8 items-center rounded-full border border-line bg-surface/80 px-2.5 font-mono text-[10px] text-foreground/80 backdrop-blur">
                      {project.year}
                    </span>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="max-h-[calc(92svh-12rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                  >
                    <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {project.title}
                    </h2>
                    {project.subtitle && (
                      <p className="mt-1 text-sm text-dim sm:text-base">{project.subtitle}</p>
                    )}

                    {/* meta row */}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px] text-dim">
                      {project.role && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" /> {project.role}
                        </span>
                      )}
                      {(project.duration ?? project.timeline) && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {project.duration ?? project.timeline}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Activity className="h-3 w-3" /> {STATUS_LABEL[project.status] ?? project.status}
                      </span>
                    </div>

                    {/* summary box */}
                    <div className="mt-4 rounded-xl border border-line bg-surface/50 p-3.5">
                      <p className="text-sm leading-relaxed text-foreground/90">{project.summary}</p>
                    </div>

                    {/* description */}
                    {project.description.length > 0 && (
                      <div className="mt-5">
                        <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-dim">
                          Overview
                        </h3>
                        <div className="space-y-2.5">
                          {project.description.map((p, i) => (
                            <p key={i} className="text-sm leading-relaxed text-foreground/80">
                              {p}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* highlights */}
                    {project.highlights && project.highlights.length > 0 && (
                      <div className="mt-5">
                        <h3 className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-dim">
                          Highlights
                        </h3>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {project.highlights.map((h) => (
                            <div
                              key={h.label}
                              className="rounded-xl border border-line bg-surface/40 p-3"
                            >
                              <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
                                {h.label}
                              </p>
                              <p className={cn("mt-0.5 font-mono text-sm font-bold", accentText)}>
                                {h.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* highlight list (bullet style) */}
                    {project.highlightList && project.highlightList.length > 0 && (
                      <div className="mt-5">
                        <h3 className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-dim">
                          Key outcomes
                        </h3>
                        <ul className="space-y-1.5">
                          {project.highlightList.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                              <CheckCircle2 className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", accentText)} />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* tech stack */}
                    {((project.tech?.length ?? 0) > 0 || project.tags.length > 0) && (
                      <div className="mt-5">
                        <h3 className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-dim">
                          Tech stack
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(project.tech ?? project.tags).map((t) => (
                            <span
                              key={t}
                              className="rounded-md border border-line bg-surface-2/60 px-2.5 py-1 font-mono text-[11px] text-foreground/80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* links */}
                    {project.links.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        {project.links.map((l) => (
                          <a
                            key={l.label}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-4 py-2 font-mono text-xs text-teal transition-colors hover:bg-teal/20"
                          >
                            {l.label}
                            <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* related projects */}
                    <RelatedProjects project={project} />

                    {/* keyboard hint footer */}
                    {hasMultiple && (
                      <div className="mt-6 flex items-center justify-center gap-3 border-t border-line pt-4 font-mono text-[10px] text-dim">
                        <span className="inline-flex items-center gap-1.5">
                          <kbd className="rounded border border-line bg-surface-2/60 px-1.5 py-0.5 text-foreground/70">
                            <ChevronLeft className="inline h-3 w-3" />
                          </kbd>
                          prev
                        </span>
                        <span className="text-dim/40">·</span>
                        <span className="inline-flex items-center gap-1.5">
                          next
                          <kbd className="rounded border border-line bg-surface-2/60 px-1.5 py-0.5 text-foreground/70">
                            <ChevronRight className="inline h-3 w-3" />
                          </kbd>
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* floating prev/next (desktop) */}
      {hasMultiple && open && (
        <>
          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous project"
              className="fixed left-3 top-1/2 z-[60] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/80 text-foreground backdrop-blur transition-all hover:ring-glow lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label="Next project"
              className="fixed right-3 top-1/2 z-[60] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/80 text-foreground backdrop-blur transition-all hover:ring-glow lg:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </>
      )}
    </>
  );
}

function RelatedProjects({ project }: { project: Project }) {
  const { openProject, projectList } = useModals();
  const related = getRelatedProjects(project.id, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-dim">
        <span className="h-px w-6 bg-line" />
        Related projects
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {related.map((p) => {
          const accentText = p.accent === "violet" ? "text-violet" : "text-teal";
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => openProject(p, projectList.length ? projectList : undefined)}
              className="card-hover-glow group flex flex-col gap-1.5 rounded-xl border border-line bg-surface/40 p-3 text-left transition-colors hover:border-teal/30"
            >
              <div className="flex items-center justify-between">
                <span className="truncate font-mono text-xs font-bold text-foreground transition-colors group-hover:text-teal">
                  {p.title}
                </span>
                <ArrowUpRight className="h-3 w-3 shrink-0 text-dim transition-all group-hover:-translate-y-0.5 group-hover:text-teal" />
              </div>
              <span className="line-clamp-1 text-[11px] text-dim">{p.subtitle ?? p.summary}</span>
              <span className={cn("font-mono text-[10px] uppercase tracking-wider", accentText)}>
                {p.category} · {p.year}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
