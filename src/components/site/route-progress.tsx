"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RouteProgress — a thin top-of-page progress bar that animates when the
 * Next.js route changes. Inspired by nprogress but built with framer-motion
 * and no external deps.
 *
 * How it works:
 * - Listens to Next.js's App Router navigation via `usePathname()` changes.
 * - When the pathname changes, the bar appears at ~80% instantly, then
 *   eases to 100% over ~400ms, then fades out.
 * - Uses a ref-guard so the very first mount (initial page load) doesn't
 *   trigger a fake "navigation" animation.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const firstMount = useRef(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip the very first pathname (initial page load) — we don't want a
    // progress bar flash on mount.
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    // A new route has been entered. Show the bar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setLoading(false), 500);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[100] h-0.5 origin-left"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            scaleX: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.3, delay: 0.2 },
          }}
          style={{
            background:
              "linear-gradient(90deg, var(--color-teal), var(--color-violet))",
            boxShadow:
              "0 0 8px color-mix(in oklab, var(--color-teal) 60%, transparent)",
          }}
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}
