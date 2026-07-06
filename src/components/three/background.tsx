"use client";

import { useEffect, useRef, useState } from "react";
import { NeuralNetwork3D } from "@/components/three/neural-network-3d";
import { NeuralNetworkCanvas } from "@/components/three/neural-network-canvas";

/**
 * Background — fixed full-viewport 3D neural network behind all content.
 *
 * Uses the three.js/r3f NeuralNetwork3D on desktop (with Bloom post-processing)
 * and falls back to the lightweight Canvas 2D version on mobile. Pauses
 * rendering when the tab is hidden.
 */
export default function Background() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 bg-background" />
      {/* 3D neural network on desktop, 2D canvas on mobile */}
      {isMobile ? (
        <NeuralNetworkCanvas className="absolute inset-0 h-full w-full opacity-50" />
      ) : (
        <NeuralNetwork3D className="absolute inset-0 h-full w-full opacity-80" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
