"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-gradient-to-r from-teal via-teal to-violet"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
