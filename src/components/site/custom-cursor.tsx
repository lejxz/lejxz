"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 });

  useEffect(() => {
    const fine =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // Enlarge over anything interactive OR any text-like element (so the
      // cursor grows when hovering headings, paragraphs, labels, etc.).
      const interactive = !!t.closest(
        'a, button, [role="button"], input, textarea, select, [cmdk-input], [data-cursor="hover"]'
      );
      const textish = !!t.closest(
        'h1, h2, h3, h4, h5, h6, p, span, label, li, td, th, blockquote, code, pre, [data-cursor="text"]'
      );
      // Don't enlarge over the cursor's own layer or empty body.
      const ownLayer = !!t.closest("[data-cursor-layer]");
      setHovering(!ownLayer && (interactive || textish));
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      data-cursor-layer
      className="pointer-events-none fixed inset-0 z-[90] hidden md:block"
    >
      {/* Enlarging ring — grows over interactive + text elements */}
      <motion.div
        className="absolute rounded-full border border-teal/60"
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovering ? 36 : 16,
          height: hovering ? 36 : 16,
          opacity: down ? 0.5 : 1,
          backgroundColor: hovering ? "rgba(94,234,212,0.08)" : "rgba(94,234,212,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
      {/* Center dot — always visible, precise pointer */}
      <motion.div
        className="absolute rounded-full bg-teal"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 4 : 6,
          height: hovering ? 4 : 6,
          opacity: down ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </div>
  );
}
