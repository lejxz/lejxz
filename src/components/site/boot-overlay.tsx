"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const LINES = [
  "$ boot lejxz.dev --mode=interactive",
  "> loading 3d renderer.............ok",
  "> mounting neural network.........ok",
  "> warming framer-motion...........ok",
  "> decrypting profile.json.........ok",
  "> link: ready.",
];

export function BootOverlay() {
  const [show, setShow] = useState(false);
  const [line, setLine] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (sessionStorage.getItem("lejxz-booted") === "1") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
    sessionStorage.setItem("lejxz-booted", "1");

    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setLine(i);
      if (i >= LINES.length) {
        clearInterval(iv);
        setTimeout(() => setShow(false), 500);
      }
    }, 200);
    return () => clearInterval(iv);
  }, []);

  const progress = Math.round((line / LINES.length) * 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          {/* grid background */}
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
          {/* ambient glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/10 blur-[100px]" />

          <div className="relative w-full max-w-md">
            {/* Logo mark */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex items-center justify-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal/30 bg-teal/10">
                <span className="font-mono text-sm font-bold text-teal">L</span>
              </span>
              <span className="font-mono text-sm font-bold">
                lejxz<span className="text-dim">.dev</span>
              </span>
            </motion.div>

            {/* Terminal lines */}
            <div className="mb-4 font-mono text-xs sm:text-sm">
              {LINES.slice(0, line).map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={
                    i === LINES.length - 1 ? "text-teal" : "text-dim"
                  }
                >
                  {l}
                </motion.div>
              ))}
              {line < LINES.length && (
                <span className="inline-block h-3.5 w-2 animate-blink bg-teal align-middle" />
              )}
            </div>

            {/* Progress bar */}
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-line">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal to-violet"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ boxShadow: "0 0 8px var(--color-teal)" }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-dim">
              <span>initializing</span>
              <span className="tabular-nums text-teal">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
