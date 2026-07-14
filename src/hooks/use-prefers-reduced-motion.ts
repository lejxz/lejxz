"use client";

import { useEffect, useState } from "react";

/**
 * usePrefersReducedMotion — returns true if the user has requested reduced
 * motion via OS / browser settings.
 *
 * The global CSS `@media (prefers-reduced-motion: reduce)` block kills CSS
 * animations and transitions, but it does NOT stop JS-driven motion
 * (framer-motion `animate()` with `repeat: Infinity`, `useAnimationFrame`
 * loops, spring-driven transforms). Components that drive motion from JS
 * must check this hook and skip / freeze the motion when it returns true.
 *
 * Reacts to changes (e.g. the user toggles the setting while the page is
 * open) via the matchMedia change listener.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
