"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { skills } from "@/lib/data";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Skills() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const group = skills.groups[activeGroup];
  const selected = group?.items.find((s) => s.name === activeSkill) ?? null;

  return (
    <section id="skills" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-violet/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="02" kicker="Capabilities" title={skills.heading ?? "Skills"} />
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
            {/* group tabs */}
            <Reveal>
              <div className="flex flex-wrap gap-2">
                {skills.groups.map((g, i) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => {
                      setActiveGroup(i);
                      setActiveSkill(null);
                    }}
                    className={cn(
                      "relative flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors",
                      i === activeGroup
                        ? "border-teal/40 text-teal"
                        : "border-line text-dim hover:border-teal/30 hover:text-foreground"
                    )}
                  >
                    {i === activeGroup && (
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
              </div>
            </Reveal>

            {group?.blurb && (
              <Reveal delay={0.05}>
                <p className="mt-3 text-sm text-dim">{group.blurb}</p>
              </Reveal>
            )}

            {/* skill bars */}
            <div className="mt-6 space-y-2">
              {group?.items.map((skill, i) => (
                <SkillBar
                  key={skill.name}
                  skill={skill}
                  active={activeSkill === skill.name}
                  delay={i * 0.05}
                  onClick={() =>
                    setActiveSkill((cur) => (cur === skill.name ? null : skill.name))
                  }
                />
              ))}
            </div>
          </div>

          {/* Right: sticky detail panel with radial gauge */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Reveal delay={0.1}>
              <div className="card-hover-glow relative flex min-h-[20rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface/40 p-8">
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
                      <SkillGauge level={selected.level} />
                      <h3 className="mt-5 font-mono text-xl font-bold text-foreground">
                        {selected.name}
                      </h3>
                      <p className="mt-2 text-center text-sm leading-relaxed text-dim">
                        {selected.description ?? selected.note ?? "A core part of my toolkit."}
                      </p>
                      <div className="mt-4 flex items-center gap-2 rounded-full border border-teal/20 bg-teal/8 px-3 py-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-teal">
                          {group.title}
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

        {/* Tech marquee */}
        {skills.marquee && skills.marquee.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mask-fade-edges mt-14 overflow-hidden">
              <div className="group flex w-max animate-marquee items-center gap-3 hover:[animation-play-state:paused]">
                {[...skills.marquee, ...skills.marquee].map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-line bg-surface/40 px-4 py-1.5 font-mono text-xs text-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
}: {
  skill: { name: string; level: number; description?: string };
  active: boolean;
  delay: number;
  onClick: () => void;
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
          : "border-line bg-surface/30 hover:border-teal/25 hover:bg-surface/50"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-mono text-sm font-medium transition-colors",
            active ? "text-teal" : "text-foreground/90 group-hover:text-foreground"
          )}
        >
          {skill.name}
        </span>
        <span className="font-mono text-[11px] text-dim">{skill.level}%</span>
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

function SkillGauge({ level }: { level: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const r = 52;
  const circ = 2 * Math.PI * r;

  return (
    <svg ref={ref} viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
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
        animate={inView ? { strokeDashoffset: circ * (1 - level / 100) } : { strokeDashoffset: circ }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: "drop-shadow(0 0 6px rgba(94,234,212,0.45))" }}
      />
      <text
        x="64"
        y="64"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90"
        transform="rotate(90 64 64)"
        fill="var(--color-foreground)"
        fontFamily="var(--font-space-mono), monospace"
        fontSize="26"
        fontWeight="700"
      >
        {level}
      </text>
    </svg>
  );
}
