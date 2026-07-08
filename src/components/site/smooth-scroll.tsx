"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll — wraps the app with a Lenis smooth-scroll provider.
 *
 * This intercepts native wheel/touch scroll events and animates the scroll
 * position smoothly, eliminating the jerky stepped motion that mouse wheel
 * events cause on scroll-linked animations (parallax, opacity fades, etc.).
 *
 * Respects prefers-reduced-motion (disables smoothing).
 * Only active on devices with a fine pointer (desktops with mice/trackpads).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Skip on touch devices — native momentum scrolling is already smooth.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    // Skip if the user prefers reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
