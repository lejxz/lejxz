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
 * Implementation: we intentionally avoid framer-motion's `useScroll` here
 * (its `target` option throws a "ref not hydrated" warning when the target
 * isn't present during SSR). A manual scroll listener with rAF throttling
 * is simpler and avoids the issue entirely. The component renders nothing
 * until mounted + a section is observed, so there's no hydration mismatch.
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
  const compute = useCallback(() => {
    if (!activeId) return;
    const el = document.getElementById(activeId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const sectionHeight = rect.height;
    const scrolled = -rect.top + vh / 2;
    const p = scrolled / Math.max(sectionHeight, 1);
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
