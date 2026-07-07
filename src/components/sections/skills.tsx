"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence, useAnimationFrame } from "framer-motion";
import { Search, X, ArrowUpDown } from "lucide-react";
import { skills } from "@/lib/data";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Skills() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true); // true = highest first

  const group = skills.groups[activeGroup];
  const q = query.trim().toLowerCase();

  // Flatten all skills with their group index for the hex grid.
  const allSkills = useMemo(
    () =>
      skills.groups.flatMap((g, gi) =>
        g.items.map((item) => ({
          ...item,
          groupIdx: gi,
          groupKey: g.key,
          groupTitle: g.title,
          groupIcon: g.icon,
        }))
      ),
    []
  );

  // When searching, filter skills across ALL groups.
  const searchResults = useMemo(() => {
    if (!q) return null;
    const results = allSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q) ||
        s.groupTitle.toLowerCase().includes(q)
    );
    results.sort((a, b) =>
      sortDesc ? b.level - a.level : a.level - b.level
    );
    return results;
  }, [q, sortDesc, allSkills]);

  const isSearching = searchResults !== null;

  // The hexes to render: search results when searching, otherwise ALL skills
  // (with non-active-group hexes dimmed instead of hidden).
  const hexItems = isSearching ? searchResults! : allSkills;

  // The selected skill object (from search or the active group).
  const selected = isSearching
    ? searchResults!.find((s) => s.name === activeSkill) ?? null
    : allSkills.find((s) => s.name === activeSkill && s.groupIdx === activeGroup) ?? null;

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

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
          {/* Left: group tabs + hex grid */}
          <div>
            {/* group tabs + search + sort */}
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                {skills.groups.map((g, i) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => {
                      setActiveGroup(i);
                      setActiveSkill(null);
                      setQuery("");
                    }}
                    className={cn(
                      "relative flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors",
                      i === activeGroup && !isSearching
                        ? "border-teal/40 text-teal"
                        : "border-line text-dim hover:border-teal/30 hover:text-foreground"
                    )}
                  >
                    {i === activeGroup && !isSearching && (
                      <motion.span
                        layoutId="skill-group-active"
                        className="absolute inset-0 -z-10 rounded-full bg-teal/10"
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      />
                    )}
                    <Icon name={g.icon} className="h-3.5 w-3.5" />
                    {g.title}
                  </button>
                ))}
                {/* Search input */}
                <div className="relative ml-auto w-full sm:w-44">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-dim" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="search skills…"
                    className="w-full rounded-full border border-line bg-surface/40 py-1.5 pl-8 pr-7 font-mono text-xs text-foreground placeholder:text-dim focus:border-teal/40 focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded text-dim hover:text-teal"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {/* Sort-by-level toggle */}
                <button
                  type="button"
                  onClick={() => setSortDesc((s) => !s)}
                  aria-label={sortDesc ? "Sort ascending (lowest first)" : "Sort descending (highest first)"}
                  title={sortDesc ? "Highest first" : "Lowest first"}
                  className="flex h-8 items-center gap-1 rounded-full border border-line bg-surface/40 px-2.5 font-mono text-[10px] text-dim transition-colors hover:border-teal/40 hover:text-teal"
                >
                  <ArrowUpDown className={cn("h-3 w-3 transition-transform", !sortDesc && "rotate-180")} />
                  <span className="hidden sm:inline">{sortDesc ? "high→low" : "low→high"}</span>
                </button>
              </div>
            </Reveal>

            {/* Blurb / search result count */}
            {isSearching ? (
              <p className="mt-3 font-mono text-[11px] text-dim">
                {searchResults!.length} match{searchResults!.length === 1 ? "" : "es"} for &ldquo;{query}&rdquo;
              </p>
            ) : (
              group?.blurb && (
                <p className="mt-3 text-sm text-dim">{group.blurb}</p>
              )
            )}

            {/* Hex grid — honeycomb of skill chips.
                Each hex shows a mini radial gauge + skill name.
                Non-active-group hexes dim to 20% (instead of disappearing). */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-0">
              {hexItems.length > 0 ? (
                hexItems.map((skill, i) => {
                  const inActiveGroup = isSearching || skill.groupIdx === activeGroup;
                  const isActive = activeSkill === skill.name && inActiveGroup;
                  return (
                    <HexChip
                      key={skill.groupKey + "-" + skill.name}
                      skill={skill}
                      active={isActive}
                      dimmed={!inActiveGroup}
                      groupName={isSearching ? skill.groupTitle : undefined}
                      delay={(i % 8) * 0.05}
                      onClick={() =>
                        setActiveSkill((cur) =>
                          cur === skill.name && inActiveGroup ? null : skill.name
                        )
                      }
                    />
                  );
                })
              ) : (
                <div className="w-full rounded-xl border border-dashed border-line p-6 text-center font-mono text-xs text-dim">
                  No skills match &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>

            {/* Legend for the dimmed hexes */}
            {!isSearching && (
              <p className="mt-4 text-center font-mono text-[10px] text-dim/60">
                Other groups are dimmed — click a hex to focus it, or switch tabs above.
              </p>
            )}
          </div>

          {/* Right: sticky detail panel with radial gauge */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Reveal delay={0.1}>
              <div className="card-hover-glow relative flex min-h-[20rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface/75 backdrop-blur-sm p-8">
                <div className="pointer-events-none absolute inset-0 bg-radial-fade opacity-60" />
                <motion.div
                  key={selected?.name ?? "empty"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex w-full flex-col items-center"
                >
                  {selected ? (
                    <>
                      <SkillGauge level={selected.level} name={selected.name} />
                      <h3 className="mt-5 font-mono text-xl font-bold text-foreground">
                        {selected.name}
                      </h3>
                      <p className="mt-2 text-center text-sm leading-relaxed text-dim">
                        {selected.description ?? selected.note ?? "A core part of my toolkit."}
                      </p>
                      <div className="mt-4 flex items-center gap-2 rounded-full border border-teal/20 bg-teal/8 px-3 py-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-teal">
                          {selected.groupTitle}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-line">
                        <Icon name={group?.icon ?? "sparkles"} className="h-10 w-10 text-dim/60" />
                      </div>
                      <h3 className="mt-5 font-mono text-lg font-bold text-foreground/80">
                        Select a skill
                      </h3>
                      <p className="mt-2 text-center text-sm text-dim">
                        Tap any hex to see a proficiency breakdown.
                      </p>
                    </>
                  )}
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>

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

/**
 * HexChip — a hexagonal skill chip with a mini radial gauge.
 * The hex shape is created via CSS clip-path. Each chip shows the skill
 * name at the bottom and a tiny circular progress gauge (with the level
 * number) at the top. Hovering reveals a description tooltip.
 *
 * Layout: hexes stagger in a flex-wrap — odd-indexed chips are offset
 * down by ~30px to create a honeycomb-like interlocking pattern.
 */
function HexChip({
  skill,
  active,
  dimmed,
  delay,
  onClick,
  groupName,
}: {
  skill: { name: string; level: number; description?: string };
  active: boolean;
  dimmed: boolean;
  delay: number;
  onClick: () => void;
  groupName?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (inView) {
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [inView]);

  // Tier color for the mini-gauge arc.
  const tierColor =
    skill.level >= 70 ? "var(--color-teal)" : "var(--color-violet)";

  return (
    <div
      className="relative"
      style={{ marginTop: "0" }}
      // Stagger odd chips down for the honeycomb effect.
    >
      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.35, delay, type: "spring", stiffness: 200, damping: 18 }}
        whileHover={{ scale: 1.08, zIndex: 10 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex flex-col items-center justify-center transition-colors duration-300",
          dimmed && "opacity-20 hover:opacity-60"
        )}
        style={{
          width: "104px",
          height: "120px",
          clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          background: active
            ? "color-mix(in oklab, var(--color-teal) 18%, var(--color-surface))"
            : "var(--color-surface)",
        }}
        aria-label={`${skill.name}: ${skill.level}%`}
      >
        {/* Glow ring on active/hover — drawn as a pseudo hex behind via box-shadow */}
        {(active || hovered) && !dimmed && (
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              clipPath: "inherit",
              background: active
                ? "color-mix(in oklab, var(--color-teal) 12%, transparent)"
                : "transparent",
            }}
          />
        )}

        {/* Mini radial gauge — top half of the hex */}
        <div className="relative mb-1 flex h-9 w-9 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
            {/* track */}
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-line)" strokeWidth="3" />
            {/* progress arc */}
            <motion.circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke={active ? "var(--color-teal)" : tierColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 14}
              initial={{ strokeDashoffset: 2 * Math.PI * 14 }}
              animate={
                animate
                  ? { strokeDashoffset: 2 * Math.PI * 14 * (1 - skill.level / 100) }
                  : { strokeDashoffset: 2 * Math.PI * 14 }
              }
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{
                filter: active
                  ? "drop-shadow(0 0 4px color-mix(in oklab, var(--color-teal) 60%, transparent))"
                  : "none",
              }}
            />
          </svg>
          {/* Level number in the center of the mini-gauge */}
          <span
            className={cn(
              "absolute font-mono text-[11px] font-bold tabular-nums",
              active ? "text-teal" : "text-foreground/80"
            )}
          >
            {skill.level}
          </span>
        </div>

        {/* Skill name — bottom half of the hex */}
        <span
          className={cn(
            "px-3 text-center font-mono text-[10px] font-medium leading-tight transition-colors",
            active ? "text-teal" : "text-foreground/85"
          )}
        >
          {skill.name}
        </span>

        {/* Group badge (search mode) */}
        {groupName && (
          <span className="mt-0.5 font-mono text-[7px] uppercase tracking-wider text-dim">
            {groupName}
          </span>
        )}
      </motion.button>

      {/* Hover tooltip — description */}
      <AnimatePresence>
        {hovered && skill.description && !dimmed && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-48 -translate-x-1/2 rounded-lg border border-line bg-surface/95 p-2.5 text-center font-mono text-[10px] leading-relaxed text-foreground/80 shadow-lg backdrop-blur-sm"
          >
            {skill.description}
            <span
              className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t"
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

/**
 * useCountUp — animates a number from 0 to `target` over `duration` ms.
 */
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

/**
 * SkillGauge — the large radial proficiency gauge in the sticky detail panel.
 */
function SkillGauge({ level, name }: { level: number; name?: string }) {
  const [hovered, setHovered] = useState(false);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
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
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.svg
        viewBox="0 0 128 128"
        className="h-32 w-32 -rotate-90"
        animate={hovered ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <defs>
          <linearGradient id="skill-gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#a78bfa" />
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
              ? "drop-shadow(0 0 12px rgba(94,234,212,0.7))"
              : "drop-shadow(0 0 6px rgba(94,234,212,0.45))",
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

/**
 * SkillsMarquee — a JS-driven marquee for the tech tags.
 */
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
