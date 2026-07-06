"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * SkewDivider — a section divider that gets "cut" when the cursor passes
 * through it, like fruit ninja. The line splits at the exact point where
 * the cursor crosses, creating a gap. The two halves then slowly slide
 * back together and reconnect.
 *
 * Implementation:
 *  • The line is drawn on a <canvas> for precise pixel control.
 *  • We track the cursor's position relative to the divider.
 *  • When the cursor's Y crosses the divider's Y (within the canvas
 *    height), we create a "cut" at the cursor's X position.
 *  • The cut is a gap in the line that grows then shrinks back.
 *  • Multiple cuts can exist simultaneously (if the cursor crosses
 *    multiple times quickly).
 *  • Each cut heals over ~1.5 seconds.
 */

interface Cut {
  x: number; // normalized 0..1 position on the line
  gap: number; // current gap size in pixels
  maxGap: number; // peak gap size
  age: number; // seconds since creation
  healing: boolean;
}

export function SkewDivider({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cutsRef = useRef<Cut[]>([]);
  const rafRef = useRef<number>(0);
  const lastMouseY = useRef<number | null>(null);
  const mouseInside = useRef(false);

  // The divider draws a slightly skewed line on a canvas.
  // We use a taller canvas (40px) to detect mouse crossings above/below
  // the actual 1px line.
  const CANVAS_HEIGHT = 40;
  const LINE_Y = CANVAS_HEIGHT / 2;
  const SKEW_ANGLE = flip ? -1.2 : 1.2; // degrees

  const drawRef = useRef<() => void>(() => {});

  useEffect(() => {
    drawRef.current = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Convert skew angle to radians and calculate the Y offset at each X.
    const skewRad = (SKEW_ANGLE * Math.PI) / 180;
    const halfWidth = w / 2;

    // Draw the line, skipping gaps where cuts exist.
    // We draw it as a series of segments.
    const lineGradient = ctx.createLinearGradient(0, 0, w, 0);
    lineGradient.addColorStop(0, "rgba(94, 234, 212, 0)");
    lineGradient.addColorStop(0.5, "rgba(94, 234, 212, 0.4)");
    lineGradient.addColorStop(1, "rgba(94, 234, 212, 0)");

    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";

    // Sort cuts by X position.
    const cuts = cutsRef.current.slice().sort((a, b) => a.x - b.x);

    // Build segments: start from 0, skip gaps, continue.
    let segStart = 0; // normalized 0..1
    const drawSegment = (startNorm: number, endNorm: number) => {
      if (endNorm <= startNorm) return;
      const x1 = startNorm * w;
      const x2 = endNorm * w;
      // Y at each X point (skewed line).
      const y1 = LINE_Y + (x1 - halfWidth) * Math.tan(skewRad);
      const y2 = LINE_Y + (x2 - halfWidth) * Math.tan(skewRad);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Glow effect.
      ctx.shadowColor = "rgba(94, 234, 212, 0.3)";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    for (const cut of cuts) {
      const gapHalf = cut.gap / 2 / w; // normalized half-gap
      const cutLeft = Math.max(0, cut.x - gapHalf);
      const cutRight = Math.min(1, cut.x + gapHalf);
      drawSegment(segStart, cutLeft);
      segStart = cutRight;
    }
    drawSegment(segStart, 1);

    // Draw cut endpoints (small glowing dots at the cut edges).
    for (const cut of cuts) {
      if (cut.gap < 2) continue;
      const gapHalf = cut.gap / 2;
      const leftX = (cut.x * w) - gapHalf;
      const rightX = (cut.x * w) + gapHalf;
      const ly = LINE_Y + (leftX - halfWidth) * Math.tan(skewRad);
      const ry = LINE_Y + (rightX - halfWidth) * Math.tan(skewRad);

      ctx.fillStyle = "rgba(94, 234, 212, 0.6)";
      ctx.beginPath();
      ctx.arc(leftX, ly, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightX, ry, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw center glow dot when no cuts are active.
    if (cuts.length === 0) {
      const cx = halfWidth;
      const cy = LINE_Y;
      ctx.fillStyle = "rgba(94, 234, 212, 0.8)";
      ctx.shadowColor = "rgba(94, 234, 212, 0.5)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    rafRef.current = requestAnimationFrame(() => drawRef.current());
    };
  }, [SKEW_ANGLE]);

  // Resize canvas to match container width.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = CANVAS_HEIGHT * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Start draw loop.
    rafRef.current = requestAnimationFrame(() => drawRef.current());

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Track mouse movement to detect line crossings.
  const onMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = Math.max(0.05, Math.min(0.95, x / rect.width));

    // Check if the cursor crossed the line (Y went from one side to the other).
    if (lastMouseY.current !== null) {
      const prevY = lastMouseY.current;
      const lineYAtX = LINE_Y + (x - rect.width / 2) * Math.tan((SKEW_ANGLE * Math.PI) / 180);

      // Check if the cursor crossed the line between the previous and current Y.
      const crossedUp = prevY < lineYAtX && y >= lineYAtX;
      const crossedDown = prevY > lineYAtX && y <= lineYAtX;

      if ((crossedUp || crossedDown) && mouseInside.current) {
        // Create a new cut at this X position.
        // Don't create a cut if there's already one very close.
        const tooClose = cutsRef.current.some(
          (c) => Math.abs(c.x - normalizedX) < 0.1 && c.age < 0.3
        );
        if (!tooClose) {
          cutsRef.current.push({
            x: normalizedX,
            gap: 0,
            maxGap: 40 + Math.random() * 20,
            age: 0,
            healing: false,
          });
        }
      }
    }
    lastMouseY.current = y;
  };

  const onMouseEnter = () => {
    mouseInside.current = true;
    lastMouseY.current = null;
  };

  const onMouseLeave = () => {
    mouseInside.current = false;
    lastMouseY.current = null;
  };

  // Animate cuts (grow then heal) in the draw loop via a separate timer.
  useEffect(() => {
    let lastTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      for (const cut of cutsRef.current) {
        cut.age += dt;
        if (cut.age < 0.15) {
          // Growing phase (0-150ms): gap opens quickly.
          cut.gap = (cut.age / 0.15) * cut.maxGap;
        } else {
          // Healing phase: gap shrinks slowly over ~1.5s.
          const healProgress = (cut.age - 0.15) / 1.5;
          cut.gap = cut.maxGap * Math.max(0, 1 - healProgress);
        }
      }
      // Remove fully healed cuts.
      cutsRef.current = cutsRef.current.filter((c) => c.gap > 0.5 || c.age < 0.15);

      requestAnimationFrame(tick);
    };
    const tickId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(tickId);
  }, []);

  return (
    <div
      aria-hidden
      className={cn("relative w-full", className)}
      style={{ height: `${CANVAS_HEIGHT}px`, cursor: "crosshair" }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
