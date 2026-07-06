"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ExternalLink, MapPin, Calendar, Briefcase, Share2, ArrowUp } from "lucide-react";
import type { ExperienceItem, ExperienceType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCopy } from "@/hooks/use-copy";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<ExperienceType, string> = {
  work: "Work",
  education: "Education",
  research: "Research",
  award: "Award",
};

const TYPE_TEXT: Record<ExperienceType, string> = {
  work: "text-teal",
  education: "text-violet",
  research: "text-teal",
  award: "text-violet",
};

const TYPE_BORDER: Record<ExperienceType, string> = {
  work: "border-teal/30 bg-teal/10 text-teal",
  education: "border-violet/30 bg-violet/10 text-violet",
  research: "border-teal/30 bg-teal/10 text-teal",
  award: "border-violet/30 bg-violet/10 text-violet",
};

export function ExperienceModal({
  experience,
  open,
  onClose,
}: {
  experience: ExperienceItem | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!experience) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="border-line bg-popover/95" />
      </Dialog>
    );
  }

  const type = (experience.type ?? "work") as ExperienceType;
  const org = experience.org ?? experience.organization ?? "";
  const achievements = experience.achievements ?? experience.bullets;
  const tech = experience.tech ?? experience.tags;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogTitle className="sr-only">
        {experience.role} at {org}
      </DialogTitle>
      <DialogDescription className="sr-only">
        Detailed view of {experience.role} experience.
      </DialogDescription>
      <DialogContent className="max-h-[92svh] max-w-2xl gap-0 overflow-hidden border-line bg-popover/95 p-0 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={experience.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex max-h-[92svh] flex-col"
          >
            {/* Gradient header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal/10 via-transparent to-violet/10 p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal/10 blur-3xl" />
              <ShareButton experienceId={experience.id} />
              <div className="relative flex items-start gap-4">
                {experience.logo && (
                  <img
                    src={asset(experience.logo)}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-2xl border border-line bg-surface-2 object-contain p-2"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", TYPE_BORDER[type])}>
                      {TYPE_LABEL[type]}
                    </span>
                    {experience.current && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 font-mono text-[10px] text-teal">
                        <span className="h-1 w-1 animate-pulse rounded-full bg-teal" />
                        Current
                      </span>
                    )}
                  </div>
                  <h2 className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {experience.role}
                  </h2>
                  {experience.orgUrl ? (
                    <a
                      href={experience.orgUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-sm text-teal transition-opacity hover:opacity-80"
                    >
                      {org}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-dim">{org}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-dim">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {experience.period}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {experience.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div
              className="max-h-[calc(92svh-12rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6"
              id="experience-modal-scroll"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
              >
                {/* summary box */}
                <div className="rounded-xl border border-line bg-surface/50 p-3.5">
                  <p className="text-sm leading-relaxed text-foreground/90">{experience.summary}</p>
                </div>

                {/* description */}
                {experience.description && experience.description.length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-dim">
                      Overview
                    </h3>
                    <div className="space-y-2.5">
                      {experience.description.map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-foreground/80">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* achievements */}
                {achievements.length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-2.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-dim">
                      <Briefcase className="h-3 w-3" /> Key achievements
                    </h3>
                    <ul className="space-y-2">
                      {achievements.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", TYPE_TEXT[type])} />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* tech */}
                {tech.length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-dim">
                      Stack &amp; focus
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {tech.map((t) => (
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

                {/* Back-to-top button */}
                <div className="mt-6 flex justify-center border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("experience-modal-scroll");
                      if (el) el.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-dim transition-colors hover:border-teal/40 hover:text-teal"
                    aria-label="Scroll to top of experience details"
                  >
                    <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
                    back to top
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function ShareButton({ experienceId }: { experienceId: string }) {
  const { copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() =>
        copy(
          `${window.location.origin}${window.location.pathname}#experience=${experienceId}`,
          "Experience link copied"
        )
      }
      aria-label="Copy experience link"
      className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/70 text-foreground/70 backdrop-blur transition-colors hover:border-teal/40 hover:text-teal"
    >
      <Share2 className="h-3.5 w-3.5" />
    </button>
  );
}
