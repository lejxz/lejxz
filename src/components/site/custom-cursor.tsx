"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * CustomCursor — a white dot with mixBlendMode: difference that inverts the
 * colors underneath (see-through contrast effect). Enlarges when hovering
 * interactive elements (buttons, links) and text elements.
 *
 * Three hover states:
 * - default (10px): over empty/structural areas
 * - text (20px): over headings, paragraphs, labels, spans, list items
 * - interactive (44px): over buttons, links, inputs — the original big enlarge
 *
 * The default OS cursor is hidden globally via CSS (cursor: none on body).
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  // "idle" | "text" | "interactive"
  const [mode, setMode] = useState<"idle" | "text" | "interactive">("idle");
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
      // Don't react to the cursor's own layer.
      if (t.closest("[data-cursor-layer]")) {
        setMode("idle");
        return;
      }
      const interactive = !!t.closest(
        'a, button, [role="button"], input, textarea, select, [cmdk-input], [data-cursor="hover"]'
      );
      const textish = !!t.closest(
        'h1, h2, h3, h4, h5, h6, p, span, label, li, td, th, blockquote, code, pre, [data-cursor="text"]'
      );
      setMode(interactive ? "interactive" : textish ? "text" : "idle");
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

  // sizes: idle 10, text 20, interactive 44
  const size = mode === "interactive" ? 44 : mode === "text" ? 20 : 10;

  return (
    <div
      aria-hidden
      data-cursor-layer
      className="pointer-events-none fixed inset-0 z-[90] hidden md:block"
      style={{ mixBlendMode: "difference" }}
    >
      {/* Enlarging white circle — the signature see-through contrast dot */}
      <motion.div
        className="absolute rounded-full bg-white"
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: size,
          height: size,
          opacity: down ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    </div>
  );
}
