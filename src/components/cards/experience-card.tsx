"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Link2, Check } from "lucide-react";
import type { ExperienceItem, ExperienceType } from "@/lib/types";
import { useModals } from "@/lib/modals";
import { useCopy } from "@/hooks/use-copy";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<ExperienceType, string> = {
  work: "Work",
  education: "Education",
  research: "Research",
  award: "Award",
};

const TYPE_COLOR: Record<ExperienceType, string> = {
  work: "from-teal to-violet",
  education: "from-violet to-teal",
  research: "from-teal to-violet",
  award: "from-violet to-teal",
};

const TYPE_TEXT: Record<ExperienceType, string> = {
  work: "text-teal",
  education: "text-violet",
  research: "text-teal",
  award: "text-violet",
};

export function ExperienceCard({
  experience,
  index = 0,
  variant = "row",
}: {
  experience: ExperienceItem;
  index?: number;
  variant?: "row" | "tile";
}) {
  const { openExperience } = useModals();
  const { copied, copy } = useCopy();

  const type = (experience.type ?? "work") as ExperienceType;
  const org = experience.org ?? experience.organization ?? "";

  const open = () => openExperience(experience);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(`${window.location.origin}${window.location.pathname}#experience=${experience.id}`, "Experience link copied");
  };

  if (variant === "tile") {
    return (
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay: (index % 4) * 0.07 }}
        className="card-hover-glow group flex h-full flex-col rounded-2xl border border-line bg-surface/40 p-5 text-left transition-colors hover:border-teal/30"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className={cn("font-mono text-[10px] uppercase tracking-wider", TYPE_TEXT[type])}>
            {TYPE_LABEL[type]}
          </span>
          <span className="font-mono text-[10px] text-dim">{experience.period}</span>
        </div>
        {experience.logo && (
          <img src={asset(experience.logo)} alt="" className="mb-3 h-10 w-10 rounded-lg border border-line bg-surface-2 object-contain p-1.5" />
        )}
        <h3 className="font-mono text-base font-bold text-foreground transition-colors group-hover:text-teal">
          {experience.role}
        </h3>
        <p className="text-sm text-dim">{org}</p>
        <p className="mt-2 line-clamp-2 flex-1 text-xs text-dim/80">{experience.summary}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[10px] text-dim">{experience.location}</span>
          <ArrowUpRight className="h-4 w-4 text-dim transition-all group-hover:-translate-y-0.5 group-hover:text-teal" />
        </div>
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
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.08 }}
      className="card-hover-glow group relative grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-line bg-surface/40 p-4 transition-colors hover:border-teal/30 sm:gap-5 sm:p-5"
    >
      {/* timeline node */}
      <div className="relative flex items-center justify-center">
        <span className={cn("h-3.5 w-3.5 rounded-full bg-gradient-to-br", TYPE_COLOR[type])} style={{ boxShadow: "0 0 12px rgba(94,234,212,0.5)" }} />
        {experience.current && (
          <motion.span
            className={cn("absolute h-3.5 w-3.5 rounded-full bg-gradient-to-br", TYPE_COLOR[type])}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </div>

      {/* content */}
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-wider">
          <span className={TYPE_TEXT[type]}>{TYPE_LABEL[type]}</span>
          <span className="text-dim/50">·</span>
          <span className="text-dim">{experience.period}</span>
          {experience.current && (
            <span className="flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-1.5 py-0.5 text-[9px] text-teal">
              <span className="h-1 w-1 animate-pulse rounded-full bg-teal" />
              Now
            </span>
          )}
        </div>
        <h3 className="font-mono text-base font-bold text-foreground transition-colors group-hover:text-teal sm:text-lg">
          {experience.role}
        </h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-dim">
          {experience.orgUrl ? (
            <a
              href={experience.orgUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 transition-colors hover:text-teal"
            >
              {org}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          ) : (
            <span>{org}</span>
          )}
          <span className="text-dim/50">·</span>
          <span>{experience.location}</span>
        </div>
        <p className="mt-1.5 line-clamp-1 text-xs text-dim/80 sm:text-sm">{experience.summary}</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy experience link"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-dim opacity-0 transition-all hover:text-teal group-hover:opacity-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Link2 className="h-3.5 w-3.5" />}
        </button>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-dim transition-all group-hover:-translate-y-0.5 group-hover:border-teal/40 group-hover:text-teal">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </motion.div>
  );
}
