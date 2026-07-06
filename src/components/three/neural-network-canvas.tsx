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
 * NeuralNetworkCanvas — lightweight Canvas 2D particle network (mobile +
 * reduced-motion fallback for the 3D version).
 *
 * Theme-aware: reads `--nn-node`, `--nn-node-alt`, `--nn-line` from the
 * document root and re-reads when the theme class changes, so the network
 * matches the active dark/light palette.
 *
 * Interaction: nodes within `POINTER_RADIUS` of the cursor are attracted
 * toward it and brighten; nearby node pairs form temporary highlighted
 * edges. This mirrors the 3D version's mouse activation in 2D.
 */
export function NeuralNetworkCanvas({
  className,
}: {
  className?: string;
  density?: number;
  linkDistance?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -9999, y: -9999, active: false });
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

    // Theme colors — read from CSS variables, re-read on theme change.
    let teal = { r: 94, g: 234, b: 212 };
    let violet = { r: 167, g: 139, b: 250 };
    let lineAlpha = 0.5;

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const parse = (v: string) => {
        const c = v.trim();
        if (!c) return null;
        // accept #rrggbb or rgb(...)
        const m =
          /^#([0-9a-f]{6})$/i.exec(c) ||
          /^#([0-9a-f]{3})$/i.exec(c);
        if (m) {
          let hex = m[1];
          if (hex.length === 3)
            hex = hex
              .split("")
              .map((ch) => ch + ch)
              .join("");
          return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
          };
        }
        const rgb = /rgba?\(([^)]+)\)/.exec(c);
        if (rgb) {
          const parts = rgb[1].split(",").map((s) => parseFloat(s.trim()));
          return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0 };
        }
        return null;
      };
      const t = parse(cs.getPropertyValue("--nn-node") || "");
      const v = parse(cs.getPropertyValue("--nn-node-alt") || "");
      if (t) teal = t;
      if (v) violet = v;
      const lineVar = cs.getPropertyValue("--nn-line").trim();
      const lm = /rgba?\(([^)]+)\)/.exec(lineVar);
      if (lm) {
        const parts = lm[1].split(",").map((s) => parseFloat(s.trim()));
        lineAlpha = parts.length >= 4 ? parts[3] : parts[3] || 0.5;
      }
    };
    readColors();
    const obs = new MutationObserver(readColors);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

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
    const POINTER_RADIUS = 160;

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      // pointer proximity boost per node (for brightening)
      const proximity = (x: number, y: number) => {
        if (!pointer.current.active) return 0;
        const dx = pointer.current.x - x;
        const dy = pointer.current.y - y;
        const d = Math.hypot(dx, dy);
        if (d > POINTER_RADIUS) return 0;
        return 1 - d / POINTER_RADIUS;
      };

      // Update + draw links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        a.pulse += 0.02;

        // pointer attraction (desktop only — mobile has no pointer)
        if (!isMobile && pointer.current.active) {
          const dxp = pointer.current.x - a.x;
          const dyp = pointer.current.y - a.y;
          const dp = Math.hypot(dxp, dyp);
          if (dp < POINTER_RADIUS && dp > 0) {
            a.vx += (dxp / dp) * 0.014;
            a.vy += (dyp / dp) * 0.014;
          }
        }
        a.vx *= 0.99;
        a.vy *= 0.99;

        if (a.x < -20) a.x = width + 20;
        if (a.x > width + 20) a.x = -20;
        if (a.y < -20) a.y = height + 20;
        if (a.y > height + 20) a.y = -20;

        const aProx = proximity(a.x, a.y);

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDistance) {
            const bProx = proximity(b.x, b.y);
            const boost = Math.max(aProx, bProx);
            const alpha =
              (1 - dist / linkDistance) *
              (isMobile ? 0.35 : lineAlpha) *
              (1 + boost * 1.5);
            const isSignal =
              Math.sin(t * 1.3 + i * 0.7 + j * 0.3) > 0.93 || boost > 0.3;
            const c = isSignal ? violet : teal;
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.min(
              alpha,
              1
            )})`;
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
        const prox = proximity(n.x, n.y);
        const r = n.r + glow * 0.8 + prox * 2.2;
        ctx.fillStyle = `rgba(${teal.r}, ${teal.g}, ${teal.b}, ${
          0.4 + glow * 0.6 + prox * 0.4
        })`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${teal.r}, ${teal.g}, ${teal.b}, ${
          glow * 0.08 + prox * 0.12
        })`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft pointer halo
      if (!isMobile && pointer.current.active) {
        const grad = ctx.createRadialGradient(
          pointer.current.x,
          pointer.current.y,
          0,
          pointer.current.x,
          pointer.current.y,
          POINTER_RADIUS
        );
        grad.addColorStop(0, `rgba(${violet.r}, ${violet.g}, ${violet.b}, 0.06)`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(
          pointer.current.x,
          pointer.current.y,
          POINTER_RADIUS,
          0,
          Math.PI * 2
        );
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
      pointer.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => {
      pointer.current.active = false;
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
      obs.disconnect();
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
