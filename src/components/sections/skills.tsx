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

  // When searching, filter skills across ALL groups (not just the active one).
  // This gives a global search experience — the user can find any skill
  // without remembering which group it's in.
  const searchResults = useMemo(() => {
    if (!q) return null;
    const results: { groupName: string; skill: { name: string; level: number; description?: string } }[] = [];
    for (const g of skills.groups) {
      for (const item of g.items) {
        if (
          item.name.toLowerCase().includes(q) ||
          (item.description ?? "").toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q)
        ) {
          results.push({ groupName: g.title, skill: item });
        }
      }
    }
    // Sort by level (descending or ascending based on toggle)
    results.sort((a, b) =>
      sortDesc ? b.skill.level - a.skill.level : a.skill.level - b.skill.level
    );
    return results;
  }, [q, sortDesc]);

  // The list to render: search results when searching, otherwise the active group's items.
  const isSearching = searchResults !== null;
  const displayItems = useMemo(() => {
    const items = isSearching ? searchResults! : (group?.items ?? []);
    if (isSearching) return items; // already sorted above
    // Sort the group items by level
    return [...items].sort((a, b) =>
      sortDesc ? b.level - a.level : a.level - b.level
    );
  }, [isSearching, searchResults, group, sortDesc]);

  // When searching, the selected skill might be from a different group.
  const selected = isSearching
    ? searchResults!.find((r) => r.skill.name === activeSkill)?.skill ?? null
    : group?.items.find((s) => s.name === activeSkill) ?? null;

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

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: group tabs + skill bars */}
          <div>
            {/* group tabs + search */}
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
                {/* Search input — filters skills across ALL groups */}
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

            {/* Blurb (hidden when searching) + search result count */}
            {isSearching ? (
              <p className="mt-3 font-mono text-[11px] text-dim">
                {searchResults!.length} match{searchResults!.length === 1 ? "" : "es"} for &ldquo;{query}&rdquo;
              </p>
            ) : (
              group?.blurb && (
                <p className="mt-3 text-sm text-dim">{group.blurb}</p>
              )
            )}

            {/* skill bars — shows search results when searching, otherwise the active group's items */}
            <div className="mt-6 space-y-2">
              {displayItems.length > 0 ? (
                displayItems.map((item, i) => {
                  const skill = isSearching ? item.skill : item;
                  const groupName = isSearching ? (item as { groupName: string }).groupName : group?.title;
                  return (
                    <SkillBar
                      key={skill.name}
                      skill={skill}
                      groupName={isSearching ? groupName : undefined}
                      active={activeSkill === skill.name}
                      delay={i * 0.05}
                      onClick={() =>
                        setActiveSkill((cur) => (cur === skill.name ? null : skill.name))
                      }
                    />
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-line p-6 text-center font-mono text-xs text-dim">
                  No skills match &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>
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
                          {isSearching
                            ? searchResults!.find((r) => r.skill.name === selected.name)?.groupName ?? group.title
                            : group.title}
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
                        Tap any skill on the left to see a proficiency breakdown.
                      </p>
                    </>
                  )}
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Tech marquee — uses framer-motion for JS-driven animation */}
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

function SkillBar({
  skill,
  active,
  delay,
  onClick,
  groupName,
}: {
  skill: { name: string; level: number; description?: string };
  active: boolean;
  delay: number;
  onClick: () => void;
  groupName?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "group w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors",
        active
          ? "border-teal/40 bg-teal/8"
          : "border-line bg-surface/60 hover:border-teal/25 hover:bg-surface/80"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "font-mono text-sm font-medium transition-colors truncate",
              active ? "text-teal" : "text-foreground/90 group-hover:text-foreground"
            )}
          >
            {skill.name}
          </span>
          {groupName && (
            <span className="shrink-0 rounded border border-line bg-surface/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-dim">
              {groupName}
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] text-dim shrink-0">{skill.level}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className={cn(
            "h-full rounded-full",
            active ? "bg-gradient-to-r from-teal to-violet" : "bg-gradient-to-r from-violet/70 to-teal/70"
          )}
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{ duration: 0.9, delay: delay + 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.button>
  );
}

/**
 * useCountUp — animates a number from 0 to `target` over `duration` ms.
 * Starts when `active` becomes true. Returns the current displayed value.
 * Uses requestAnimationFrame with an ease-out curve for a satisfying fill.
 */
function useCountUp(target: number, active: boolean, duration = 1100) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastActiveRef = useRef(false);
  const lastTargetRef = useRef(target);

  useEffect(() => {
    // Reset the animation start when the target changes or activation flips on.
    const targetChanged = lastTargetRef.current !== target;
    const justActivated = active && !lastActiveRef.current;
    lastActiveRef.current = active;
    lastTargetRef.current = target;

    if (!active) {
      startRef.current = null;
      return;
    }

    // On a fresh activation or target change, restart from 0.
    if (justActivated || targetChanged) {
      startRef.current = null;
    }

    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
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
 * SkillGauge — the radial proficiency gauge. The percentage is displayed
 * prominently in the center (e.g. "90%") with a count-up animation that
 * syncs with the arc fill. A hover tooltip shows the qualitative tier
 * (Beginner / Intermediate / Advanced / Expert).
 *
 * The gauge only renders when a skill is selected (it lives in a sticky
 * panel that's always in the viewport), so the animation starts on mount
 * rather than waiting for an IntersectionObserver.
 */
function SkillGauge({ level, name }: { level: number; name?: string }) {
  const [hovered, setHovered] = useState(false);
  // Start the animation on mount — the gauge is always visible when rendered.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    // Defer one frame so the initial state (0% fill) paints first,
    // then the animation triggers for a satisfying fill effect.
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const r = 52;
  const circ = 2 * Math.PI * r;

  // Count up the displayed percentage in sync with the arc fill.
  const displayLevel = useCountUp(level, animate, 1100);

  // Map the numeric level to a qualitative label + color.
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
        {/* track */}
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        {/* progress arc */}
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

      {/* Center percentage overlay — HTML for crisp, controllable typography.
          The SVG is rotated -90°, so we overlay a absolutely-positioned div
          on top (not inside the SVG) to avoid rotation counter-transforms. */}
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

      {/* Hover tooltip — qualitative tier label */}
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
            {/* arrow */}
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
 * SkillsMarquee — a JS-driven (framer-motion) marquee for the tech tags.
 * Uses useAnimationFrame to translate the container. Two copies of the
 * items ensure a seamless loop.
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
