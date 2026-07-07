"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence, useAnimationFrame } from "framer-motion";
import { skills } from "@/lib/data";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Neural network diagram layout (SVG viewBox units).
// Each skill group becomes a "layer" (column). Nodes within a layer are
// stacked vertically. Every node in layer N connects to every node in
// layer N+1 — a fully-connected feedforward network.
// ---------------------------------------------------------------------------
const VIEW_W = 900;
const VIEW_H = 380;
const NODE_TOP = 72;
const NODE_BOTTOM = 348;
const numLayers = skills.groups.length;
const LAYER_X = skills.groups.map((_, i) =>
  numLayers === 1
    ? VIEW_W / 2
    : 130 + ((VIEW_W - 260) * i) / (numLayers - 1)
);

export function Skills() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Build the flattened node list with computed SVG positions.
  const nodes = useMemo(
    () =>
      skills.groups.flatMap((g, gi) =>
        g.items.map((item, ii) => {
          const count = g.items.length;
          const y =
            NODE_TOP + ((ii + 0.5) / count) * (NODE_BOTTOM - NODE_TOP);
          return {
            ...item,
            groupIdx: gi,
            groupKey: g.key,
            groupTitle: g.title,
            groupIcon: g.icon,
            x: LAYER_X[gi],
            y,
            nodeIndex: ii,
          };
        })
      ),
    []
  );

  // Build connections: every node in layer N → every node in layer N+1.
  const connections = useMemo(() => {
    const conns: {
      from: (typeof nodes)[0];
      to: (typeof nodes)[0];
      key: string;
    }[] = [];
    for (let gi = 0; gi < numLayers - 1; gi++) {
      const layerA = nodes.filter((n) => n.groupIdx === gi);
      const layerB = nodes.filter((n) => n.groupIdx === gi + 1);
      for (const a of layerA) {
        for (const b of layerB) {
          conns.push({ from: a, to: b, key: `${a.name}→${b.name}` });
        }
      }
    }
    return conns;
  }, [nodes]);

  // All nodes are always lit — no filtering. The network shows the
  // complete skill graph at all times.
  const isNodeLit = (_n: (typeof nodes)[0]) => true;

  const selected = nodes.find((n) => n.name === activeSkill) ?? null;
  const focused = hoveredSkill ?? activeSkill;

  // A connection is "active" (pulsing) if either a node is focused and
  // is one of the endpoints, or no node is focused (ambient pulse).
  const isConnFocused = (c: (typeof connections)[0]) =>
    focused !== null &&
    (c.from.name === focused || c.to.name === focused);

  return (
    <section id="skills" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-violet/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="01" kicker="Capabilities" title={skills.heading ?? "Skills"} />
        {skills.subtitle && (
          <Reveal delay={0.06}>
            <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
              {skills.subtitle}
            </p>
          </Reveal>
        )}

        {/* Layer legend — static labels showing the 3 groups as network layers */}
        <Reveal>
          <div className="mt-10 flex flex-wrap items-center gap-4 font-mono text-xs text-dim">
            {skills.groups.map((g, i) => (
              <span key={g.key} className="flex items-center gap-1.5">
                <Icon name={g.icon} className="h-3.5 w-3.5 text-teal/60" />
                <span className="text-foreground/70">{g.title}</span>
                {i < skills.groups.length - 1 && (
                  <span className="ml-2 text-dim/40">→</span>
                )}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Neural network diagram */}
        <Reveal delay={0.1}>
          <div className="mt-6 overflow-x-auto">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="w-full min-w-[640px]"
              style={{ height: "auto" }}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Skill proficiency neural network diagram"
            >
              {/* Layer labels */}
              {skills.groups.map((g, gi) => (
                <g key={`label-${g.key}`}>
                  <text
                    x={LAYER_X[gi]}
                    y={26}
                    textAnchor="middle"
                    fill="var(--color-dim)"
                    fontSize={13}
                    fontFamily="var(--font-space-mono), monospace"
                    fontWeight={700}
                    opacity={
                      activeGroup === null || activeGroup === gi || isSearching
                        ? 0.8
                        : 0.3
                    }
                    style={{ transition: "opacity 0.3s" }}
                  >
                    {g.title.toUpperCase()}
                  </text>
                  <text
                    x={LAYER_X[gi]}
                    y={44}
                    textAnchor="middle"
                    fill="var(--color-dim)"
                    fontSize={9}
                    fontFamily="var(--font-space-mono), monospace"
                    opacity={
                      activeGroup === null || activeGroup === gi || isSearching
                        ? 0.5
                        : 0.2
                    }
                    style={{ transition: "opacity 0.3s" }}
                  >
                    layer {gi + 1}
                  </text>
                </g>
              ))}

              {/* Connection lines (synapses) */}
              {connections.map((c) => {
                const focusedConn = isConnFocused(c);
                return (
                  <line
                    key={c.key}
                    x1={c.from.x}
                    y1={c.from.y}
                    x2={c.to.x}
                    y2={c.to.y}
                    stroke="var(--color-teal)"
                    strokeWidth={focusedConn ? 1.5 : 1}
                    strokeDasharray="4 6"
                    opacity={focusedConn ? 0.5 : 0.1}
                    className={
                      focusedConn
                        ? "synapse-flow"
                        : !focused
                        ? "synapse-flow-slow"
                        : undefined
                    }
                    style={{ transition: "opacity 0.3s, stroke-width 0.3s" }}
                  />
                );
              })}

              {/* Nodes (neurons) */}
              {nodes.map((node, i) => {
                const r = 18 + (node.level / 100) * 8;
                const isSelected = activeSkill === node.name;
                const isHovered = hoveredSkill === node.name;
                const isFocused = isSelected || isHovered;
                return (
                  <motion.g
                    key={node.groupKey + "-" + node.name}
                    onClick={() =>
                      setActiveSkill((cur) =>
                        cur === node.name ? null : node.name
                      )
                    }
                    onMouseEnter={() => setHoveredSkill(node.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{
                      duration: 0.4,
                      delay: node.groupIdx * 0.15 + node.nodeIndex * 0.06,
                      type: "spring",
                      stiffness: 200,
                      damping: 16,
                    }}
                    style={{ cursor: "pointer", transition: "opacity 0.3s" }}
                  >
                    {/* Glow halo on focused nodes */}
                    {isFocused && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r + 10}
                        fill="var(--color-teal)"
                        opacity={0.12}
                      />
                    )}
                    {/* Outer ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={
                        isSelected
                          ? "var(--color-teal)"
                          : "var(--color-surface)"
                      }
                      stroke="var(--color-teal)"
                      strokeWidth={isSelected ? 0 : 1.5}
                      opacity={1}
                      style={{ transition: "fill 0.2s" }}
                    />
                    {/* Inner fill — subtle fill that scales with proficiency.
                        Kept low-opacity so the network doesn't look cluttered. */}
                    {!isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r - 5}
                        fill="var(--color-teal)"
                        opacity={0.06 + (node.level / 100) * 0.1}
                        style={{ transition: "opacity 0.3s" }}
                      />
                    )}
                    {/* Level number */}
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={
                        isSelected
                          ? "var(--color-background)"
                          : "var(--color-foreground)"
                      }
                      fontSize={11}
                      fontFamily="var(--font-space-mono), monospace"
                      fontWeight={700}
                      opacity={0.9}
                      style={{
                        transition: "fill 0.2s",
                        pointerEvents: "none",
                      }}
                    >
                      {node.level}
                    </text>
                    {/* Skill name below the node */}
                    <text
                      x={node.x}
                      y={node.y + r + 15}
                      textAnchor="middle"
                      fill={
                        isSelected
                          ? "var(--color-teal)"
                          : "var(--color-foreground)"
                      }
                      fontSize={11}
                      fontFamily="var(--font-space-mono), monospace"
                      fontWeight={500}
                      opacity={0.8}
                      style={{
                        transition: "fill 0.2s",
                        pointerEvents: "none",
                      }}
                    >
                      {node.name}
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </div>
        </Reveal>

        {/* Detail panel — slides in below the network when a node is selected */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.name}
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -16, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="card-hover-glow mt-2 flex flex-col items-center gap-6 rounded-2xl border border-line bg-surface/75 p-6 backdrop-blur-sm sm:flex-row sm:items-center">
                <SkillGauge level={selected.level} name={selected.name} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                    <h3 className="font-mono text-xl font-bold text-foreground">
                      {selected.name}
                    </h3>
                    <span className="rounded-full border border-teal/20 bg-teal/8 px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-teal">
                      {selected.groupTitle} · layer {selected.groupIdx + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-dim">
                    {selected.description ??
                      selected.note ??
                      "A core part of my toolkit."}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center justify-center gap-3 rounded-2xl border border-dashed border-line p-5 text-center"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
                ◇
              </span>
              <p className="font-mono text-xs text-dim">
                Click any neuron to inspect proficiency · hover to trace connections
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tech marquee */}
        {skills.marquee && skills.marquee.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mask-fade-edges mt-14 overflow-hidden">
              <SkillsMarquee items={skills.marquee} />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// useCountUp — animates a number from 0 → target over `duration` ms.
// ---------------------------------------------------------------------------
function useCountUp(target: number, active: boolean, duration = 1100) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastActiveRef = useRef(false);
  const lastTargetRef = useRef(target);

  useEffect(() => {
    const targetChanged = lastTargetRef.current !== target;
    const justActivated = active && !lastActiveRef.current;
    lastActiveRef.current = active;
    lastTargetRef.current = target;

    if (!active) {
      startRef.current = null;
      return;
    }

    if (justActivated || targetChanged) {
      startRef.current = null;
    }

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      setValue(Math.round(ease(t) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, active, duration]);

  return value;
}

// ---------------------------------------------------------------------------
// SkillGauge — the large radial gauge used in the detail panel.
// ---------------------------------------------------------------------------
function SkillGauge({ level, name }: { level: number; name?: string }) {
  const [hovered, setHovered] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [accentColor, setAccentColor] = useState<string>("#fbbf24");
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Read the current accent color from --color-teal (the primary accent
  // channel) and observe <html> class changes so the gauge recolors when
  // the user switches accents. Falls back to amber (#fbbf24).
  useEffect(() => {
    const read = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-teal")
        .trim() || "#fbbf24";
    setAccentColor(read());
    const observer = new MutationObserver(() => setAccentColor(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const r = 52;
  const circ = 2 * Math.PI * r;

  const displayLevel = useCountUp(level, animate, 1100);

  const tier =
    level >= 85
      ? { label: "Expert", color: "var(--color-teal)" }
      : level >= 70
      ? { label: "Advanced", color: "var(--color-teal)" }
      : level >= 50
      ? { label: "Intermediate", color: "var(--color-violet)" }
      : { label: "Beginner", color: "var(--color-violet)" };

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.svg
        viewBox="0 0 128 128"
        className="h-28 w-28 -rotate-90 sm:h-32 sm:w-32"
        animate={hovered ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <defs>
          <linearGradient id="skill-gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-teal)" />
            <stop offset="100%" stopColor="var(--color-violet)" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <motion.circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="url(#skill-gauge-grad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={
            animate
              ? { strokeDashoffset: circ * (1 - level / 100) }
              : { strokeDashoffset: circ }
          }
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            filter: hovered
              ? `drop-shadow(0 0 12px ${accentColor}b3)`
              : `drop-shadow(0 0 6px ${accentColor}73)`,
          }}
        />
      </motion.svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-0.5">
          <motion.span
            key={level}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-3xl font-bold leading-none text-foreground tabular-nums"
          >
            {displayLevel}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="font-mono text-sm font-bold text-teal"
          >
            %
          </motion.span>
        </div>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-dim">
          {tier.label}
        </span>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface/95 px-2.5 py-1 font-mono text-[10px] font-bold shadow-lg backdrop-blur-sm"
            style={{ color: tier.color }}
          >
            {tier.label}
            <span
              className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r"
              style={{
                borderColor: "var(--color-line)",
                background: "var(--color-surface)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkillsMarquee — JS-driven scrolling tech tags.
// ---------------------------------------------------------------------------
function SkillsMarquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const duration = Math.max(8, items.length * 0.7);

  useAnimationFrame((_, delta) => {
    const el = ref.current;
    if (!el) return;

    const halfWidth = el.scrollWidth / 2;
    if (halfWidth <= 0) return;

    const pxPerMs = halfWidth / (duration * 1000);
    x.current += pxPerMs * delta;

    if (x.current >= halfWidth) x.current = 0;
    el.style.transform = `translate3d(${-x.current}px, 0, 0)`;
  });

  return (
    <div ref={ref} className="flex w-max items-center gap-3 will-change-transform">
      {[...items, ...items].map((tag, i) => (
        <span
          key={i}
          className="shrink-0 rounded-full border border-line bg-surface/60 px-4 py-1.5 font-mono text-xs text-foreground/70"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
