"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { asset } from "@/lib/asset";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/motion/tilt-card";
import { cn } from "@/lib/utils";

const statusLabel: Record<Project["status"], string> = {
  shipped: "Shipped",
  wip: "In Progress",
  archived: "Archived",
};

const accentRing: Record<Project["accent"], string> = {
  teal: "hover:border-teal/60 hover:glow-teal",
  violet: "hover:border-violet/60 hover:glow-violet",
};

const accentText: Record<Project["accent"], string> = {
  teal: "text-teal",
  violet: "text-violet",
};

const accentBar: Record<Project["accent"], string> = {
  teal: "bg-teal",
  violet: "bg-violet",
};

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TiltCard
        id={project.id}
        className="group relative h-full w-full [transform-style:preserve-3d]"
      >
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-surface/50 p-6 text-left transition-[border,transform] duration-300 hover:-translate-y-1",
            accentRing[project.accent]
          )}
        >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
            accentBar[project.accent]
          )}
        />
        {project.cover && (
          <div className="relative -mx-6 -mt-6 mb-5 h-32 overflow-hidden border-b border-line">
            <img
              src={asset(project.cover)}
              alt=""
              aria-hidden
              loading="lazy"
              className="h-full w-full object-cover opacity-50 transition-all duration-500 group-hover:opacity-70 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="inline-flex h-6 items-center rounded-md border border-line px-1.5 font-mono text-[10px] font-bold text-dim transition-colors group-hover:border-teal/40 group-hover:text-teal">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-dim">{project.year}</span>
            <span
              className={cn(
                "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider",
                accentText[project.accent]
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", accentBar[project.accent])} />
              {statusLabel[project.status]}
            </span>
          </div>
        </div>

        <div className="mt-8 flex-1">
          <p className={cn("font-mono text-xs uppercase tracking-wider", accentText[project.accent])}>
            {project.category}
          </p>
          <h3 className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-teal">
            {project.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm text-dim">{project.summary}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded border border-line px-2 py-0.5 font-mono text-[10px] text-dim"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-dim transition-colors group-hover:border-teal/50 group-hover:text-teal">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </button>
      </TiltCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-line bg-background p-0 sm:max-w-2xl">
          <div className={cn("h-1 w-full", accentBar[project.accent])} />
          <DialogHeader className="space-y-0 border-b border-line p-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-mono text-2xl font-bold tracking-tight">
                {project.title}
              </DialogTitle>
              <span className="font-mono text-xs text-dim">{project.year}</span>
            </div>
            <DialogDescription className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
              <span className={accentText[project.accent]}>{project.category}</span>
              <span className="text-dim">·</span>
              <span className="text-dim">{statusLabel[project.status]}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-6">
            <div className="space-y-3">
              {project.description.map((para, i) => (
                <p key={i} className="text-pretty text-sm leading-relaxed text-foreground/90">
                  {para}
                </p>
              ))}
            </div>

            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded border-line font-mono text-xs text-dim"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {project.links.length > 0 && (
              <div className="flex flex-wrap gap-3 border-t border-line pt-5">
                {project.links.map((link, i) => (
                  <a
                    key={`${link.label}-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-teal/50 hover:text-teal"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {link.label}
                  </a>
                ))}
                <Link
                  href={`/projects/${project.id}`}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground transition-colors hover:bg-teal/90"
                >
                  Case Study
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
