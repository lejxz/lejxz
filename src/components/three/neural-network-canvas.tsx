"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
}

/**
 * NeuralNetworkCanvas — lightweight Canvas 2D particle network.
 *
 * Works everywhere (desktop, mobile, static export). No WebGL/three.js deps.
 * - Mobile: fewer nodes, lower opacity, coarser links
 * - Reduced-motion: renders a single static frame (no RAF loop)
 * - Resilient: handles 0×0 canvas, resize, and visibility without crashing
 */
export function NeuralNetworkCanvas({
  className,
}: {
  className?: string;
  density?: number;
  linkDistance?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let dpr = 1;

    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const teal = { r: 94, g: 234, b: 212 };
    const violet = { r: 167, g: 139, b: 250 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // density: fewer nodes on mobile, capped for perf
      const base = isMobile ? 26000 : 16000;
      const target = Math.min(
        isMobile ? 40 : 80,
        Math.max(15, Math.floor((width * height) / base))
      );
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.25),
        vy: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.25),
        r: Math.random() * 1.5 + 1,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const linkDistance = isMobile ? 110 : 150;

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      // Update + draw links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        a.pulse += 0.02;

        // pointer attraction (subtle, desktop only — mobile has no pointer)
        if (!isMobile) {
          const dxp = pointer.current.x - a.x;
          const dyp = pointer.current.y - a.y;
          const dp = Math.hypot(dxp, dyp);
          if (dp < 160 && dp > 0) {
            a.vx += (dxp / dp) * 0.012;
            a.vy += (dyp / dp) * 0.012;
          }
        }
        a.vx *= 0.99;
        a.vy *= 0.99;

        if (a.x < -20) a.x = width + 20;
        if (a.x > width + 20) a.x = -20;
        if (a.y < -20) a.y = height + 20;
        if (a.y > height + 20) a.y = -20;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * (isMobile ? 0.35 : 0.5);
            const isSignal = Math.sin(t * 1.3 + i * 0.7 + j * 0.3) > 0.93;
            const c = isSignal ? violet : teal;
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
            ctx.lineWidth = isSignal ? 1.1 : 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            if (isSignal) {
              const pp = (t * 0.5) % 1;
              const px = a.x + (b.x - a.x) * pp;
              const py = a.y + (b.y - a.y) * pp;
              ctx.fillStyle = `rgba(${violet.r}, ${violet.g}, ${violet.b}, 0.9)`;
              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const glow = 0.5 + Math.sin(n.pulse) * 0.5;
        ctx.fillStyle = `rgba(${teal.r}, ${teal.g}, ${teal.b}, ${0.4 + glow * 0.6})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${teal.r}, ${teal.g}, ${teal.b}, ${glow * 0.08})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      drawFrame(performance.now() / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };

    // Initial setup
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      pointer.current = { x: -9999, y: -9999 };
    };
    if (!isMobile) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }

    // Pause when tab hidden (saves battery + avoids backlog)
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else if (!reducedMotion) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reducedMotion) {
      // Single static frame for reduced-motion users
      drawFrame(0);
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
