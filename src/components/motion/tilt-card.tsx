"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

export function TiltCard({
  children,
  className,
  max = 8,
  id,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const hover = useMotionValue(0);

  const srx = useSpring(rx, { stiffness: 200, damping: 18, mass: 0.4 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18, mass: 0.4 });
  const sgx = useSpring(gx, { stiffness: 150, damping: 20 });
  const sgy = useSpring(gy, { stiffness: 150, damping: 20 });
  const shop = useSpring(hover, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(srx, (v) => `${v}deg`);
  const rotateY = useTransform(sry, (v) => `${v}deg`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${sgx}% ${sgy}%, rgba(94,234,212,0.45), transparent 55%)`;
  const glareOpacity = useTransform(shop, [0, 1], [0, 0.6]);

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  }

  function enter() {
    hover.set(1);
  }

  function reset() {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
    hover.set(0);
  }

  return (
    <motion.div
      ref={ref}
      id={id}
      onMouseMove={handleMove}
      onMouseEnter={enter}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
        style={{ background: glareBg, opacity: glareOpacity }}
      />
    </motion.div>
  );
}
