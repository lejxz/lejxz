"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ConfettiBurst — a lightweight canvas-free confetti animation triggered by
 * a `trigger` counter. Each time `trigger` increments, a burst of colored
 * particles emanates from the optional origin coordinates (or the center of
 * the trigger ref element).
 *
 * Uses framer-motion for the particle physics (no canvas, no deps). Each
 * particle is a small rotated square with a random trajectory, rotation,
 * and fade. After ~1.2s all particles are removed.
 *
 * Usage: pass a `trigger` number that you increment on success. Place the
 * component absolutely positioned over the area you want the burst to
 * originate from.
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
}

const COLORS = ["#5eead4", "#a78bfa", "#f0abfc", "#67e8f9", "#ddd6fe"];

export function ConfettiBurst({
  trigger,
  originX,
  originY,
}: {
  trigger: number;
  originX?: number;
  originY?: number;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (trigger === 0) return;
    // Spawn 28 particles in a radial burst.
    const count = 28;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const velocity = 60 + Math.random() * 80;
      return {
        id: idRef.current++,
        x: originX ?? 0,
        y: originY ?? 0,
        angle,
        velocity,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 720,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
      };
    });
    setParticles(newParticles);

    // Clear particles after the animation completes.
    const t = setTimeout(() => setParticles([]), 1400);
    return () => clearTimeout(t);
  }, [trigger, originX, originY]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 overflow-visible"
      aria-hidden
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              opacity: 1,
              scale: 1,
              rotate: p.rotation,
            }}
            animate={{
              x: p.x + Math.cos(p.angle) * p.velocity,
              y: p.y + Math.sin(p.angle) * p.velocity + 40, // +40 for gravity drift
              opacity: 0,
              scale: 0.4,
              rotate: p.rotation + p.rotationSpeed,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: 2,
              boxShadow: `0 0 6px ${p.color}80`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
