"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import {
  FolderGit2,
  Clock,
  BrainCircuit,
  Cake,
  type LucideIcon,
} from "lucide-react";
import { profile } from "@/lib/data";
import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";

const ACCENTS = [
  { text: "text-teal", glow: "from-teal/20", ring: "group-hover:border-teal/40", dot: "bg-teal", grad: "from-teal to-violet" },
  { text: "text-violet", glow: "from-violet/20", ring: "group-hover:border-violet/40", dot: "bg-violet", grad: "from-violet to-teal" },
  { text: "text-teal", glow: "from-teal/20", ring: "group-hover:border-teal/40", dot: "bg-teal", grad: "from-teal to-violet" },
  { text: "text-violet", glow: "from-violet/20", ring: "group-hover:border-violet/40", dot: "bg-violet", grad: "from-violet to-teal" },
];

/**
 * pickIcon — maps a stat label to a relevant Lucide icon by keyword.
 * Falls back to a generic star/sparkle so every stat has a visual anchor.
 * Kept here (not in data) so the data JSON stays presentation-agnostic.
 */
function pickIcon(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.includes("project")) return FolderGit2;
  if (l.includes("year") || l.includes("coding") || l.includes("exp")) return Clock;
  if (l.includes("model") || l.includes("train") || l.includes("ai") || l.includes("ml")) return BrainCircuit;
  if (l.includes("age")) return Cake;
  return FolderGit2;
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const stats = profile.numericStats ?? [];

  if (stats.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-label="Quick stats"
      className="relative overflow-hidden border-y border-line bg-surface/40"
    >
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-40" />

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
        {/* Tiny "live" header — a subtle band label with a pulsing dot so the
            strip reads as a live telemetry band, not just decoration. This is
            a visual element inside the existing StatsBand section, not a new
            section. */}
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-dim/70">
            <span className="relative flex h-1 w-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-1 w-1 rounded-full bg-teal" />
            </span>
            live stats
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim/50">
            {stats.length} metrics
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const Icon = pickIcon(stat.label);
            return (
              <RevealStat
                key={stat.label}
                stat={stat}
                accent={accent}
                inView={inView}
                index={i}
                Icon={Icon}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * RevealStat — a single stat card with:
 *  - count-up animation when scrolled into view
 *  - a per-stat icon (mapped from the label) for a visual anchor
 *  - a radial spotlight that follows the pointer on hover
 *  - a gradient progress bar with a soft glow
 *  - a hover lift (-translate-y-0.5) for a tactile, premium feel
 *  - a pulsing accent dot
 */
function RevealStat({
  stat,
  accent,
  inView,
  index,
  Icon,
}: {
  stat: { label: string; value: number; prefix?: string; suffix?: string };
  accent: { text: string; glow: string; ring: string; dot: string; grad: string };
  inView: boolean;
  index: number;
  Icon: LucideIcon;
}) {
  // Pointer-following spotlight (normalized -0.5..0.5 from card center).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 150, damping: 20 });
  const smy = useSpring(my, { stiffness: 150, damping: 20 });
  // Translate to a background-position percentage (40%..60%).
  const bgX = useTransform(smx, [-0.5, 0.5], ["35%", "65%"]);
  const bgY = useTransform(smy, [-0.5, 0.5], ["35%", "65%"]);
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        mx.set(0);
        my.set(0);
      }}
      className={cn(
        "card-hover-glow group relative overflow-hidden rounded-xl border border-line bg-surface/70 p-3 text-center backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 sm:p-4",
        accent.ring,
      )}
    >
      {/* pointer-following spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [bgX, bgY],
            ([x, y]) =>
              `radial-gradient(circle at ${x} ${y}, color-mix(in oklab, var(--color-teal) 14%, transparent), transparent 60%)`,
          ),
        }}
      />
      {/* existing top glow */}
      <div
        className={cn(
          "pointer-events-none absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
          accent.glow,
        )}
      />
      <div className="relative flex flex-col items-center">
        {/* Per-stat icon — sits above the value, gives each metric a visual
            identity. Scales + brightens on hover for a tactile response. */}
        <span className="mb-1.5 flex h-7 w-7 items-center justify-center">
          <Icon
            className={cn(
              "h-4 w-4 transition-all duration-300",
              accent.text,
              hovered ? "scale-110 opacity-100" : "opacity-50",
            )}
            style={hovered ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
            aria-hidden
          />
        </span>
        {/* pulsing accent dot (kept from before, now below the icon row) */}
        <span className="mb-1 flex h-1.5 w-1.5 items-center justify-center">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-opacity",
              accent.dot,
              hovered ? "opacity-100" : "opacity-50",
            )}
          />
          {hovered && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              className={cn("absolute h-1.5 w-1.5 rounded-full", accent.dot)}
            />
          )}
        </span>
        <span className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-dim sm:text-[10px]">
          {stat.label}
        </span>
        <span
          className={cn(
            "font-mono text-xl font-bold tracking-tight transition-filter sm:text-2xl",
            accent.text,
          )}
          style={{
            textShadow: hovered
              ? "0 0 24px currentColor"
              : "0 0 14px currentColor",
            filter: hovered ? "brightness(1.25)" : "brightness(1.1)",
          }}
        >
          {stat.prefix}
          <CountUp to={stat.value} duration={1.8} suffix={stat.suffix ?? ""} />
        </span>
        {/* Gradient progress bar with a soft glow — replaces the flat bar.
            The gradient uses the accent's two colors for depth; the glow
            intensifies on hover. */}
        <span className="mt-2 h-1 w-10 overflow-hidden rounded-full bg-line">
          <motion.span
            className={cn(
              "block h-full rounded-full bg-gradient-to-r",
              accent.grad,
            )}
            initial={{ width: 0 }}
            animate={inView ? { width: "100%" } : { width: 0 }}
            transition={{
              duration: 1.2,
              delay: index * 0.1 + 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              boxShadow: hovered
                ? "0 0 8px currentColor"
                : "0 0 4px currentColor",
            }}
          />
        </span>
      </div>
    </motion.div>
  );
}
