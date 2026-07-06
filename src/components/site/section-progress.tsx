"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/**
 * SectionProgress — a thin reading-progress bar fixed to the top of the
 * viewport. It fills as the user reads through the *current* section
 * (resets at each section boundary), giving a sense of how much of the
 * current section remains.
 *
 * Visually subtle: 2px tall, accent gradient, fades in only when scrolling.
 *
 * Bug fix: the old implementation used `-rect.top + vh/2` which caused the
 * bar to jump to 100% when a new section became active (because the section
 * was already past the viewport center). The new implementation computes
 * progress as: how far the section's top has moved from the viewport top
 * edge, relative to the total scrollable distance of that section. This
 * gives a smooth 0→1 fill that never jumps.
 */
export function SectionProgress() {
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  // Mount gate — ensures we never render anything during SSR.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Track which section is currently in view.
  useEffect(() => {
    if (!mounted) return;
    const SECTION_IDS = [
      "top",
      "about",
      "skills",
      "experience",
      "work",
      "uses",
      "contact",
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: string; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id: entry.target.id, ratio: entry.intersectionRatio };
          }
        }
        if (best) setActiveId(best.id);
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: [0, 0.1, 0.5, 1] }
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [mounted]);

  // Compute the reading progress through the active section.
  //
  // Progress = 0 when the section's top is at the top of the viewport.
  // Progress = 1 when the section's bottom is at the bottom of the viewport.
  // The scrollable distance = sectionHeight - viewportHeight.
  // scrolled = how far the section top has moved up from the viewport top.
  const compute = useCallback(() => {
    if (!activeId) return;
    const el = document.getElementById(activeId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const sectionHeight = rect.height;

    // How far the section's top edge has scrolled above the viewport top.
    // When rect.top is 0 (section top at viewport top), scrolled = 0.
    // When rect.top is negative (section scrolled past), scrolled > 0.
    const scrolled = Math.max(0, -rect.top);

    // Total scrollable distance for this section.
    const scrollable = Math.max(sectionHeight - vh, 1);

    const p = scrolled / scrollable;
    setProgress(Math.max(0, Math.min(1, p)));
    setVisible(window.scrollY > window.innerHeight * 0.6);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [compute, activeId]);

  if (!mounted || !activeId) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[54] h-[2px] origin-left transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden
    >
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: `${progress * 100}%`,
          background:
            "linear-gradient(90deg, var(--color-teal), var(--color-violet))",
          boxShadow:
            "0 0 8px color-mix(in oklab, var(--color-teal) 50%, transparent)",
        }}
      />
    </div>
  );
}
