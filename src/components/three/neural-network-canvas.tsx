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
 * NeuralNetworkCanvas — an animated particle-network visualization that
 * resembles a neural network. Nodes drift, connect to nearby nodes, and
 * occasionally "fire" signal pulses along edges. Pointer-reactive.
 *
 * This is the original Canvas 2D version from the early commits — simple,
 * clean, performant, and works everywhere (no WebGL/three.js dependency).
 *
 * Theme-aware: reads --nn-node and --nn-node-alt CSS variables and
 * re-reads when the theme class on <html> changes.
 */
export function NeuralNetworkCanvas({
  className,
  density = 0.9,
  linkDistance = 150,
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Read theme colors from CSS variables (re-read on theme change).
    const getColor = (hex: string) => {
      const h = hex.trim().replace("#", "");
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return { r, g, b };
    };

    let teal = getColor("#5eead4");
    let violet = getColor("#a78bfa");

    const readColors = () => {
      try {
        const cs = getComputedStyle(document.documentElement);
        const nodeVar = cs.getPropertyValue("--nn-node").trim();
        const altVar = cs.getPropertyValue("--nn-node-alt").trim();
        if (nodeVar) teal = getColor(nodeVar);
        if (altVar) violet = getColor(altVar);
      } catch {
        // keep defaults
      }
    };
    readColors();

    const colorObserver = new MutationObserver(readColors);
    colorObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.max(
        20,
        Math.floor((width * height) / 100000) * density * 10
      );
      const count = Math.min(target, 90);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 1.2,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      pointer.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    // Pause when tab hidden (saves battery).
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Update + draw links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        a.pulse += 0.02;

        // pointer attraction (subtle)
        const dxp = pointer.current.x - a.x;
        const dyp = pointer.current.y - a.y;
        const dp = Math.hypot(dxp, dyp);
        if (dp < 160 && dp > 0) {
          a.vx += (dxp / dp) * 0.012;
          a.vy += (dyp / dp) * 0.012;
        }
        // friction
        a.vx *= 0.99;
        a.vy *= 0.99;

        // wrap
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
            const alpha = (1 - dist / linkDistance) * 0.5;
            const isSignal = Math.sin(t * 1.3 + i * 0.7 + j * 0.3) > 0.93;
            const c = isSignal ? violet : teal;
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
            ctx.lineWidth = isSignal ? 1.1 : 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // signal pulse traveling along edge
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
        // halo
        ctx.fillStyle = `rgba(${teal.r}, ${teal.g}, ${teal.b}, ${glow * 0.08})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      colorObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, linkDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
