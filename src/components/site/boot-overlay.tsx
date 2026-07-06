"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const LINES = [
  "$ boot lejxz.dev --mode=interactive",
  "> loading 3d renderer.............ok",
  "> mounting particle field.........ok",
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
        setTimeout(() => setShow(false), 420);
      }
    }, 190);
    return () => clearInterval(iv);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
          <div className="relative w-full max-w-md font-mono text-xs sm:text-sm">
            {LINES.slice(0, line).map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
