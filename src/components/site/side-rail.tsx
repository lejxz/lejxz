"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

export function SideRail() {
  const [active, setActive] = useState("top");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // only show after scrolling past the hero
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Global scroll progress — drives the connector segments + the hover label
  // so the rail reads as a "you are here" progress indicator, not just dots.
  const { scrollYProgress } = useScroll();

  return (
    <nav
      aria-label="Section navigation"
      className={cn(
        "group fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-500 lg:flex",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Hover progress label — a tiny "X%" readout at the top of the rail.
          Only visible when the user hovers the rail (group-hover) so it
          doesn't clutter the default view. */}
      <ProgressLabel progress={scrollYProgress} />

      {SECTIONS.map((s, i) => {
        const isActive = active === s.id;
        return (
          <RailItem
            key={s.id}
            id={s.id}
            label={s.label}
            index={i}
            total={SECTIONS.length}
            isActive={isActive}
            progress={scrollYProgress}
          />
        );
      })}
    </nav>
  );
}

/**
 * RailItem — a single dot + label, with a vertical connector segment to the
 * next dot. The connector is a faint track with a teal fill whose height is
 * driven by the global scroll progress mapped to this segment's range, so the
 * rail reads as a scroll-progress indicator.
 *
 * Extracted into its own component so the per-segment useTransform calls
 * respect the Rules of Hooks (no hooks in loops).
 */
function RailItem({
  label,
  index,
  total,
  isActive,
  progress,
}: {
  id: string;
  label: string;
  index: number;
  total: number;
  isActive: boolean;
  progress: MotionValue<number>;
}) {
  // This segment fills when scroll progress crosses from section `index` to
  // `index+1`. Map the global progress to a 0-100% fill for this segment.
  const segmentFill = useTransform(
    progress,
    [index / total, (index + 1) / total],
    ["0%", "100%"],
  );

  return (
    <a
      href={`/#${label.toLowerCase() === "home" ? "top" : label.toLowerCase()}`}
      className="group/item relative flex items-center justify-end gap-2.5"
      aria-label={label}
      aria-current={isActive ? "true" : undefined}
    >
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
          isActive
            ? "text-teal opacity-100"
            : "text-dim opacity-0 group-hover/item:opacity-100",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "relative flex h-2.5 w-2.5 items-center justify-center rounded-full border transition-all duration-300",
          isActive
            ? "border-teal bg-teal"
            : "border-line bg-transparent group-hover/item:border-dim",
        )}
      >
        {isActive && (
          <span className="absolute inset-0 animate-ping rounded-full bg-teal opacity-40" />
        )}
      </span>
      {/* Vertical connector to the next dot — faint track + teal scroll-
          progress fill. Only rendered between dots (not after the last). */}
      {index < total - 1 && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-[5px] top-[calc(100%+4px)] w-px overflow-hidden bg-line"
          style={{ height: "calc(100% + 8px)" }}
        >
          <motion.span className="block w-full bg-teal/60" style={{ height: segmentFill }} />
        </span>
      )}
    </a>
  );
}

/**
 * ProgressLabel — a tiny "X%" readout anchored at the top of the rail. Only
 * visible on hover of the rail (group-hover) so it doesn't clutter the
 * default view. Rounded mono badge with tabular-nums.
 */
function ProgressLabel({ progress }: { progress: MotionValue<number> }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    return progress.on("change", (v) => setPct(Math.round(v * 100)));
  }, [progress]);
  return (
    <span className="pointer-events-none absolute -top-7 right-0 rounded-md border border-line bg-surface/80 px-1.5 py-0.5 font-mono text-[9px] tabular-nums text-dim opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
      {pct}%
    </span>
  );
}
