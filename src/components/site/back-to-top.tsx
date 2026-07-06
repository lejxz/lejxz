"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * BackToTop — floating button that appears after scrolling past one viewport.
 *
 * Features:
 * - Shows the scroll percentage (0–100) as a radial progress ring around the
 *   arrow, so the user knows how far down the page they are.
 * - Clicking smooth-scrolls back to the top.
 * - The percentage text is hidden until scrolled, then fades in.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const [pct, setPct] = useState(0);
  // Use a motion value for the ring progress so it animates smoothly.
  const ringProgress = useMotionValue(0);
  const ringSpring = useSpring(ringProgress, {
    stiffness: 120,
    damping: 20,
    mass: 0.3,
  });
  // SVG circle circumference for r=18 → 2π·18 ≈ 113.1
  const CIRC = 2 * Math.PI * 18;
  const dashOffset = useTransform(ringSpring, [0, 1], [CIRC, 0]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
      setPct(Math.round(p * 100));
      setShow(scrollTop > window.innerHeight * 0.8);
      ringProgress.set(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ringProgress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={`Back to top (${pct}% scrolled)`}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="group fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-background/80 text-dim backdrop-blur-md transition-colors hover:border-teal/60 hover:text-teal md:bottom-8 md:right-8"
        >
          {/* Radial progress ring */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="var(--color-line)"
              strokeWidth="1.5"
              fill="none"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              stroke="var(--color-teal)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          {/* Percentage label — appears on hover */}
          <span className="pointer-events-none absolute -bottom-5 font-mono text-[9px] tabular-nums text-dim opacity-0 transition-opacity group-hover:opacity-100">
            {pct}%
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
