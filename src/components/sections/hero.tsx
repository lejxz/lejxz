"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import {
  ArrowDown,
  Sparkles,
  Github,
  Linkedin,
  Instagram,
  Mail,
} from "lucide-react";
import { profile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { HeroDiorama } from "@/components/sections/hero-diorama";
import { Magnetic } from "@/components/motion/magnetic";
import { ScrambleText } from "@/components/motion/scramble-text";

/**
 * Hero — a scroll-driven, 4-act "cinematic departure" intro.
 *
 * DESIGN RATIONALE (why this replaces the old fade):
 * The old hero mapped a single opacity curve to scroll progress and hit 0 at
 * 75% scroll. That left a ~25vh "ghost phase" where the hero was transparent
 * but still on screen, double-exposing the arriving ticker section behind it.
 *
 * The new hero keeps the section at one viewport tall (min-h-screen) but
 * choreographs the exit of every layer independently:
 *  - Background orbs clear the stage first (they drift away by ~55%).
 *  - The 3D diorama scales down, blurs, and exits up-right.
 *  - Supporting text (badge, role, CTAs, stats) departs in a staggered cascade
 *    — each element "flies up" at its own moment, never all fading at once.
 *  - A centered manifesto line ("Always Learning…") rises as a climax beat
 *    in the middle of the scroll, then departs.
 *  - The headline is the anchor — it stays legible the longest and only fades
 *    in the final 12%, exiting exactly as the ticker arrives.
 *
 * Crucially, opacity for each layer stays high (≥ 0.6) until its OWN exit
 * moment, then drops fast. There is never a long slow uniform fade, so there
 * is no ghost phase. The departure reads as a deliberate 4-act sequence:
 *   Act I  (0.00–0.28)  IDENTITY   — everything present, orbs begin to drift
 *   Act II (0.28–0.55)  PRACTICE   — supporting text cascades away, diorama shifts
 *   Act III(0.55–0.82)  MANIFESTO  — centered manifesto peaks, diorama recedes
 *   Act IV (0.82–1.00)  DEPART     — headline finally exits, ticker arrives
 *
 * A chapter indicator (01–04) in the corner makes the story structure legible
 * without adding any new section — it is a visual element inside the hero.
 */

const CHAPTERS = [
  { id: "01", label: "IDENTITY", at: 0.0 },
  { id: "02", label: "PRACTICE", at: 0.28 },
  { id: "03", label: "MANIFESTO", at: 0.55 },
  { id: "04", label: "DEPART", at: 0.82 },
] as const;

/**
 * TypingPrompt — types out a command character-by-character, then shows a
 * blinking caret. Gives the hero a "live terminal" feel without being noisy.
 */
function TypingPrompt({ text, delay = 0.8 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const start = setTimeout(function tick() {
      if (i <= text.length) {
        setShown(text.slice(0, i));
        i++;
        timer = setTimeout(tick, 65 + Math.random() * 50);
      } else {
        setDone(true);
      }
    }, delay * 1000);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [text, delay]);

  return (
    <span className="font-mono text-sm text-teal">
      <span className="text-dim">$</span> {shown}
      <span
        className={`ml-0.5 inline-block h-4 w-2 bg-teal align-middle ${
          done ? "animate-blink" : ""
        }`}
        style={{ opacity: done ? undefined : 1 }}
      />
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  // One viewport of scroll drives the whole 4-act sequence. offset "end start"
  // means progress hits 1 exactly when the hero has scrolled fully past the
  // viewport top — so the ticker arrives precisely as Act IV completes.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // --- Act choreography -------------------------------------------------
  // Each layer owns an independent transform curve. Opacity for any layer only
  // drops near ITS exit moment, so the hero never reads as a uniform fade.

  // Background orbs — leave the stage first (clear the atmosphere).
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.45, 0.6], [1, 0.4, 0]);

  // Diorama — scales down, drifts up-right, blurs, departs during Act III.
  const dioramaScale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [1, 1.04, 0.86, 0.7],
  );
  const dioramaX = useTransform(scrollYProgress, [0, 0.6, 1], [0, 24, 64]);
  const dioramaY = useTransform(scrollYProgress, [0, 0.6, 1], [0, -24, -90]);
  const dioramaRotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  const dioramaOpacity = useTransform(
    scrollYProgress,
    [0, 0.55, 0.8, 1],
    [1, 1, 0.35, 0],
  );
  const dioramaBlur = useTransform(scrollYProgress, [0.45, 0.9], [0, 7]);
  const dioramaFilter = useTransform(
    dioramaBlur,
    (b) => `blur(${b.toFixed(2)}px)`,
  );

  // Intro chip (availability badge + whoami prompt) — first to depart (Act II).
  const introY = useTransform(scrollYProgress, [0, 0.4], [0, -36]);
  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.28, 0.42],
    [1, 1, 0],
  );

  // Headline — the anchor. Stays full until Act IV, then lifts & fades fast.
  const headlineY = useTransform(scrollYProgress, [0, 0.7, 1], [0, -16, -70]);
  const headlineScale = useTransform(
    scrollYProgress,
    [0, 0.7, 1],
    [1, 0.98, 0.92],
  );
  const headlineOpacity = useTransform(
    scrollYProgress,
    [0, 0.82, 0.95, 1],
    [1, 1, 0.55, 0],
  );
  const headlineLetterSpacing = useTransform(
    scrollYProgress,
    [0, 1],
    ["-0.02em", "0.01em"],
  );

  // Role + field line — departs mid Act II.
  const roleY = useTransform(scrollYProgress, [0, 0.5], [0, -28]);
  const roleOpacity = useTransform(scrollYProgress, [0, 0.32, 0.5], [1, 1, 0]);

  // Tagline paragraph — departs slightly after role.
  const taglineY = useTransform(scrollYProgress, [0, 0.55], [0, -30]);
  const taglineOpacity = useTransform(
    scrollYProgress,
    [0, 0.36, 0.55],
    [1, 1, 0],
  );

  // CTAs — depart late Act II.
  const ctaY = useTransform(scrollYProgress, [0, 0.6], [0, -34]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 1, 0]);

  // Socials — depart at the Act II/III boundary.
  const socialsY = useTransform(scrollYProgress, [0, 0.62], [0, -32]);
  const socialsOpacity = useTransform(
    scrollYProgress,
    [0, 0.45, 0.62],
    [1, 1, 0],
  );

  // Stats chips — last of the supporting text, depart early Act III.
  const statsY = useTransform(scrollYProgress, [0, 0.66], [0, -30]);
  const statsOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.66],
    [1, 1, 0],
  );

  // Manifesto — the climax title card. Rises in Act III, peaks ~0.68, gone by 0.8.
  const manifestoOpacity = useTransform(
    scrollYProgress,
    [0.5, 0.62, 0.74, 0.82],
    [0, 1, 1, 0],
  );
  const manifestoScale = useTransform(
    scrollYProgress,
    [0.5, 0.66, 0.82],
    [0.92, 1, 1.04],
  );
  const manifestoY = useTransform(scrollYProgress, [0.5, 0.66, 0.82], [48, 0, -24]);

  // Chapter indicator + scroll hint.
  const hintOpacity = useTransform(scrollYProgress, [0, 0.16, 0.28], [1, 1, 0]);
  const chapterDim = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  const [chapter, setChapter] = useState<(typeof CHAPTERS)[number]>(CHAPTERS[0]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let current = CHAPTERS[0];
    for (const c of CHAPTERS) {
      if (v >= c.at) current = c;
    }
    setChapter((prev) => (prev.id === current.id ? prev : current));
  });

  const socials = [
    { icon: Github, href: profile.socials.github ?? "#", label: "GitHub" },
    {
      icon: Linkedin,
      href: profile.socials.linkedin ?? "#",
      label: "LinkedIn",
    },
    {
      icon: Instagram,
      href: profile.socials.instagram ?? "#",
      label: "Instagram",
    },
    { icon: Mail, href: `mailto:${profile.email}`, label: "Email" },
  ];

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Atmospheric orbs — drift away to clear the stage. */}
      <motion.div
        style={{ y: orb1Y, opacity: orbOpacity }}
        className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-[130px]"
      />
      <motion.div
        style={{ y: orb2Y, opacity: orbOpacity }}
        className="pointer-events-none absolute -right-40 bottom-1/4 h-[26rem] w-[26rem] rounded-full bg-violet/10 blur-[130px]"
      />

      {/* Chapter indicator — top-right, makes the 4-act structure legible.
          This is a visual element inside the hero, NOT a new section. */}
      <motion.div
        style={{ opacity: chapterDim }}
        className="pointer-events-none absolute right-5 top-24 z-[45] hidden flex-col items-end gap-1 sm:flex sm:right-8"
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
          chapter
        </span>
        <div className="flex items-baseline gap-2">
          <motion.span
            key={chapter.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-2xl font-bold text-teal text-glow-soft"
          >
            {chapter.id}
          </motion.span>
          <span className="font-mono text-xs text-dim">/ 04</span>
        </div>
        <motion.span
          key={chapter.label}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/70"
        >
          {chapter.label}
        </motion.span>
        {/* Progress rail — 4 segments, one per act. */}
        <div className="mt-2 flex gap-1">
          {CHAPTERS.map((c) => {
            const active = chapter.id === c.id;
            const passed = Number(chapter.id) > Number(c.id);
            return (
              <span
                key={c.id}
                className={`h-0.5 w-6 rounded-full transition-colors duration-500 ${
                  active
                    ? "bg-teal"
                    : passed
                      ? "bg-teal/40"
                      : "bg-line"
                }`}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Main grid — left text column + right diorama. Each layer is wrapped
          in its own motion.div driven by an independent scroll curve so the
          departure is staggered, never a uniform fade. */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-28 sm:px-8 lg:grid-cols-2 lg:gap-8">
        {/* Left: text column. Each row departs on its own schedule. */}
        <div className="flex flex-col items-start gap-5">
          {/* Intro chip (availability + whoami) — first to leave. */}
          <motion.div style={{ y: introY, opacity: introOpacity }} className="flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-3.5 py-1.5 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
              </span>
              <span className="font-mono text-xs text-foreground/80">
                {profile.availability}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
            >
              <TypingPrompt text="whoami" delay={0.7} />
            </motion.div>
          </motion.div>

          {/* Headline — the anchor. Stays legible the longest. */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            style={{
              y: headlineY,
              scale: headlineScale,
              opacity: headlineOpacity,
              letterSpacing: headlineLetterSpacing,
            }}
            className="font-mono text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <ScrambleText
              text={profile.heroLine1 ?? profile.penname ?? "lejxz"}
              duration={500}
            />
            <span className="text-gradient-shimmer text-glow-soft">
              <ScrambleText
                text={profile.heroLine2 ?? ".dev"}
                duration={700}
              />
            </span>
          </motion.h1>

          {/* Role + field line. */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            style={{ y: roleY, opacity: roleOpacity }}
            className="font-mono text-base text-foreground/90 sm:text-lg"
          >
            <span className="text-violet">{">"}</span>{" "}
            {profile.role} · <span className="text-teal">{profile.field}</span>
          </motion.p>

          {/* Tagline paragraph. */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            style={{ y: taglineY, opacity: taglineOpacity }}
            className="max-w-xl text-pretty text-base leading-relaxed text-dim sm:text-lg"
          >
            {profile.tagline}
          </motion.p>

          {/* CTAs. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.44 }}
            style={{ y: ctaY, opacity: ctaOpacity }}
            className="flex flex-wrap items-center gap-3"
          >
            <Magnetic strength={0.4} className="inline-block">
              <Button
                size="lg"
                className="gap-2 bg-teal text-primary-foreground shadow-lg shadow-teal/20 hover:bg-teal/90 hover:shadow-teal/30"
                onClick={() =>
                  document
                    .getElementById("work")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Sparkles className="h-4 w-4" />
                Explore My Work
              </Button>
            </Magnetic>
            <Link href="/#contact">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-line bg-transparent font-mono hover:border-teal/50 hover:text-teal"
              >
                ./contact.sh
              </Button>
            </Link>
          </motion.div>

          {/* Socials. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
            style={{ y: socialsY, opacity: socialsOpacity }}
            className="flex items-center gap-3 pt-1"
          >
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-dim transition-all hover:-translate-y-0.5 hover:border-teal/50 hover:text-teal"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </motion.div>

          {/* Quick profile stats. */}
          {profile.stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{ y: statsY, opacity: statsOpacity }}
              className="flex flex-wrap items-center gap-2 pt-3"
            >
              {profile.stats.map((stat, i) => (
                <span
                  key={stat.label}
                  className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/40 px-3 py-1.5 backdrop-blur-sm transition-colors hover:border-teal/40"
                >
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider text-dim"
                    style={{
                      color:
                        i % 2 === 0
                          ? "var(--color-teal)"
                          : "var(--color-violet)",
                    }}
                  >
                    {stat.label}
                  </span>
                  <span className="h-3 w-px bg-line" />
                  <span className="font-mono text-xs font-medium text-foreground/90">
                    {stat.value}
                  </span>
                </span>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right: 3D diorama — recedes during Act III. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{
            x: dioramaX,
            y: dioramaY,
            scale: dioramaScale,
            rotate: dioramaRotate,
            opacity: dioramaOpacity,
            filter: dioramaFilter,
          }}
          className="relative"
        >
          <HeroDiorama />
        </motion.div>
      </div>

      {/* Manifesto — the climax title card. Uses `position: fixed` so it stays
          centered in the VIEWPORT during Act III (the hero has scrolled up by
          then, so an absolute-in-hero overlay would be above the viewport).
          Opacity is driven by scrollYProgress, so it only shows during the
          Act III window and is invisible once the hero is scrolled past.
          z-40 keeps it below the navbar (z-50) but above hero content.
          Reuses profile.tagline — no new content added. */}
      <motion.div
        style={{ opacity: manifestoOpacity, scale: manifestoScale, y: manifestoY }}
        className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-6"
        aria-hidden
      >
        <div className="relative max-w-3xl text-center">
          {/* Soft backdrop veil so the manifesto reads over the receding hero. */}
          <div className="absolute inset-0 -z-10 bg-background/40 blur-2xl" />
          <span className="mb-3 inline-block font-mono text-[10px] uppercase tracking-[0.4em] text-teal">
            {"// manifesto"}
          </span>
          <p className="font-mono text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            <span className="text-gradient">Always Learning.</span>
            <br />
            <span className="text-foreground/80">
              Stay Hungry, Stay Foolish.
            </span>
          </p>
          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-teal to-transparent" />
        </div>
      </motion.div>

      {/* Scroll-to-explore hint — fades out after the first gesture. */}
      <ScrollHint opacity={hintOpacity} />
    </section>
  );
}

/**
 * ScrollHint — the bottom-center "scroll to explore" indicator. Visibility is
 * driven purely by the hero's scroll progress (the `opacity` motion value): it
 * is fully visible at the top and fades out during Act I as the user engages.
 * Scrolling back to the top brings it back — consistent and robust to browser
 * scroll-restoration (which previously caused a permanent-dismiss bug).
 */
function ScrollHint({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.button
      style={{ opacity }}
      onClick={() =>
        document
          .getElementById("skills")
          ?.scrollIntoView({ behavior: "smooth" })
      }
      className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-dim transition-colors hover:text-teal"
      aria-label="Scroll down to explore"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim/80">
        scroll to explore
      </span>
      {/* animated mouse-wheel illustration */}
      <span className="relative flex h-7 w-4 items-start justify-center rounded-full border border-dim/50 p-1">
        <motion.span
          animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="h-1.5 w-1 rounded-full bg-teal"
        />
      </span>
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="flex items-center gap-1"
      >
        <ArrowDown className="h-3 w-3" />
      </motion.div>
    </motion.button>
  );
}
