"use client";

import { useEffect, useRef, useState } from "react";
import { NeuralNetwork3D } from "@/components/three/neural-network-3d";
import { NeuralNetworkCanvas } from "@/components/three/neural-network-canvas";

/**
 * Background — fixed full-viewport 3D neural network behind all content.
 *
 * Uses the three.js/r3f NeuralNetwork3D on desktop (with Bloom post-processing)
 * and falls back to the lightweight Canvas 2D version on mobile OR when WebGL
 * is unavailable (headless browsers, locked-down environments, older GPUs).
 *
 * Pauses rendering when the tab is hidden.
 */

/**
 * Detect whether the current browser can create a WebGL context. We test
 * both "webgl2" and "webgl" (legacy). Returning a temporary context and
 * explicitly losing it avoids leaking GPU resources just for the probe.
 */
function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const ctx =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!ctx) return false;
    // If we got a context, explicitly lose it so we don't hold GPU resources.
    const loseExt = (ctx as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    loseExt?.loseContext?.();
    return true;
  } catch {
    return false;
  }
}

export default function Background() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    // Probe WebGL once on mount. If it fails we fall back to the 2D canvas
    // so the page never shows a broken/empty background and the console
    // isn't flooded with WebGL creation errors.
    setWebglOk(hasWebGL());
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!mounted) return null;

  // Use the 2D canvas on mobile OR when WebGL isn't available.
  const use2D = isMobile || !webglOk;

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 bg-background" />
      {use2D ? (
        <NeuralNetworkCanvas className="absolute inset-0 h-full w-full opacity-40" />
      ) : (
        <NeuralNetwork3D className="absolute inset-0 h-full w-full opacity-60" />
      )}
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
