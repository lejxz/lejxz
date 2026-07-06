"use client";

import { useEffect, useRef, useState } from "react";
import { NeuralNetworkCanvas } from "@/components/three/neural-network-canvas";

/**
 * Background — fixed full-viewport Canvas 2D neural network behind all
 * content.
 *
 * Uses the lightweight Canvas 2D particle network (no three.js/WebGL).
 * This is the original version from the early commits — simple, clean,
 * performant, and works everywhere (no WebGL dependency).
 *
 * Includes a radial darkening overlay to improve card readability.
 */
export default function Background() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 bg-background" />
      <NeuralNetworkCanvas className="absolute inset-0 h-full w-full opacity-70" />
      {/* Subtle radial darkening behind the content area to improve card
          readability without killing the neural network visual. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, color-mix(in oklab, var(--background) 55%, transparent), transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
