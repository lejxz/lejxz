"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Brain, Cpu, Boxes, Sparkles, Binary, Network } from "lucide-react";

const ORBIT_CHIPS = ["PyTorch", "R3F", "TypeScript", "CUDA", "Next.js"];
const DIORAMA_CARDS = [
  { label: "models", value: "18+" },
  { label: "gpu hrs", value: "2.4k" },
  { label: "accuracy", value: "94%" },
];
const CODE_TOKENS = ["</>", "λ", "∇", "{ }", "0x1F", "ai"];

export function HeroDiorama() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, restDelta: 0.001 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, restDelta: 0.001 });

  const rotY = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const rotX = useTransform(sy, [-0.5, 0.5], [-14, 14]);

  const layer1X = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const layer1Y = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const layer2X = useTransform(sx, [-0.5, 0.5], [20, -20]);
  const layer2Y = useTransform(sy, [-0.5, 0.5], [16, -16]);
  const layer3X = useTransform(sx, [-0.5, 0.5], [32, -32]);
  const layer3Y = useTransform(sy, [-0.5, 0.5], [26, -26]);
  const layer4X = useTransform(sx, [-0.5, 0.5], [44, -44]);
  const layer4Y = useTransform(sy, [-0.5, 0.5], [36, -36]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative h-[440px] w-full select-none sm:h-[520px] lg:h-[580px]"
      style={{ perspective: "1200px" }}
    >
      {/* Ambient floor glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto h-40 max-w-md rounded-[100%] bg-teal/15 blur-[80px]" />

      {/* The 3D stage */}
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* Layer 1 (back): rotating neural core */}
        <motion.div
          style={{ x: layer1X, y: layer1Y, transform: "translateZ(-160px)" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative h-64 w-64 sm:h-72 sm:w-72">
            <div className="absolute inset-0 animate-spin-slow rounded-full border border-teal/25" />
            <div className="absolute inset-4 rounded-full border border-dashed border-violet/30" style={{ animation: "spin-slow 24s linear infinite reverse" }} />
            <div className="absolute inset-10 rounded-full bg-teal/5 ring-1 ring-teal/20 bg-grid" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-teal/30 bg-surface/80 backdrop-blur-md">
                <Brain className="h-9 w-9 text-teal" />
              </div>
            </div>
            {[0, 90, 180, 270].map((deg) => (
              <div
                key={deg}
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet"
                style={{
                  transform: `rotate(${deg}deg) translateY(-128px)`,
                  boxShadow: "0 0 12px rgba(167, 139, 250, 0.6)",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Layer 2: orbiting tech chips */}
        <motion.div
          style={{ x: layer2X, y: layer2Y, transform: "translateZ(-90px)" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative h-80 w-80">
            {ORBIT_CHIPS.map((label, i) => {
              const icons = [Cpu, Boxes, Network, Binary, Sparkles];
              const Icon = icons[i % icons.length];
              const deg = (360 / ORBIT_CHIPS.length) * i;
              const color = i % 2 === 0 ? "text-teal" : "text-violet";
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `rotate(${deg}deg) translateX(130px) rotate(-${deg}deg)`,
                  }}
                >
                  <div className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-line bg-surface/80 px-2.5 py-1 font-mono text-[10px] text-foreground/80 backdrop-blur-md">
                    <Icon className={`h-3 w-3 ${color}`} />
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Layer 3: glass data cards */}
        <motion.div
          style={{ x: layer3X, y: layer3Y, transform: "translateZ(-30px)" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative h-72 w-72">
            {DIORAMA_CARDS.map((card, i) => {
              const positions = [
                "absolute -left-10 -top-6 w-40",
                "absolute -right-8 bottom-2 w-44",
                "absolute left-1/2 top-1/2 w-32 -translate-x-1/2 -translate-y-1/2 text-center ring-1 ring-teal/25",
              ];
              const anims = [
                { y: [0, -8, 0], dur: 6, delay: 0 },
                { y: [0, 8, 0], dur: 7, delay: 0.5 },
                { y: [0, -6, 0], dur: 5.5, delay: 1 },
              ];
              const a = anims[i % 3];
              return (
                <motion.div
                  key={i}
                  animate={a}
                  transition={{ duration: a.dur, repeat: Infinity, ease: "easeInOut", delay: a.delay }}
                  className={`${positions[i % 3]} rounded-xl border border-line bg-surface/80 p-3 backdrop-blur-md`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-teal">
                      {card.label}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                  </div>
                  <div className="font-mono text-lg font-bold text-foreground">
                    {card.value}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-violet to-teal" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Layer 4 (front): floating code tokens */}
        <motion.div
          style={{ x: layer4X, y: layer4Y, transform: "translateZ(60px)" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative h-80 w-80">
            {CODE_TOKENS.map((tok, i) => {
              const positions = [
                { x: -120, y: -90 }, { x: 90, y: -110 }, { x: -140, y: 80 },
                { x: 110, y: 95 }, { x: -20, y: -130 }, { x: 30, y: 130 },
              ];
              const p = positions[i % positions.length];
              const c = i % 2 === 0 ? "text-teal" : "text-violet";
              return (
                <motion.span
                  key={i}
                  animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                  className={`absolute font-mono text-[11px] ${c} rounded-md border border-line bg-surface/80 px-2 py-1 backdrop-blur-md`}
                  style={{ left: `${p.x + 140}px`, top: `${p.y + 140}px` }}
                >
                  {tok}
                </motion.span>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Depth axis hint */}
      <div className="pointer-events-none absolute bottom-2 right-2 font-mono text-[9px] uppercase tracking-widest text-dim/60">
        z-axis · 4 layers
      </div>
    </div>
  );
}
