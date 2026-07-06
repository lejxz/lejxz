"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Activity,
  Coffee,
  Quote,
  Code2,
  Cpu,
  BookOpen,
  Copy,
  Check,
  Music2,
} from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { profile, now } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";

const FACT_ICONS = [MapPin, GraduationCap, Activity, Coffee];
const NOW_ICONS = [Cpu, BookOpen, Coffee];

export function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yOrb = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const yCode = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const facts = (profile.facts ?? []).map((f, i) => ({
    ...f,
    icon: FACT_ICONS[i % FACT_ICONS.length],
  }));

  return (
    <section id="about" ref={ref} className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <motion.div
        style={{ y: yOrb }}
        className="pointer-events-none absolute -right-40 top-0 h-[460px] w-[460px] rounded-full bg-teal/8 blur-[150px]"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="01" kicker="Profile" title="About" />

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: narrative + terminal code block */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-lg leading-relaxed text-foreground/85">
                {profile.bio[0]}
              </p>
            </Reveal>
            {profile.bio[1] && (
              <Reveal delay={0.08}>
                <p className="mt-5 text-lg leading-relaxed text-foreground/85">
                  {profile.bio[1]}
                </p>
              </Reveal>
            )}

            {/* Terminal-style code block */}
            {profile.codeBlock && (
              <motion.div style={{ y: yCode }} className="mt-8">
                <Reveal>
                  <CodeBlock codeBlock={profile.codeBlock} penname={profile.penname} />
                </Reveal>
              </motion.div>
            )}

            {profile.quote && (
              <Reveal delay={0.12}>
                <figure className="mt-8 flex gap-4 rounded-xl border border-line bg-surface/40 p-5">
                  <Quote className="h-7 w-7 shrink-0 text-violet/70" />
                  <blockquote className="text-base italic leading-relaxed text-foreground/80">
                    &ldquo;{profile.quote}&rdquo;
                  </blockquote>
                </figure>
              </Reveal>
            )}
          </div>

          {/* Right: profile card + now widget */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-2xl border border-line bg-surface/60 p-6 shadow-2xl shadow-black/40">
                <div className="mb-5 flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-teal/40 to-violet/30 ring-2 ring-teal/30">
                    <div className="flex h-full w-full items-center justify-center font-mono text-3xl font-bold text-primary-foreground">
                      {profile.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="absolute inset-0 bg-grid opacity-30" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-teal">@{profile.penname}</div>
                    <div className="font-mono text-lg font-semibold text-foreground">
                      {profile.name}
                    </div>
                    <div className="font-mono text-xs text-dim">
                      {profile.role}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {facts.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-line bg-surface/50 px-3 py-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal/15 text-teal">
                        <f.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-dim">
                          {f.label}
                        </div>
                        <div className="truncate text-sm font-medium text-foreground">
                          {f.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border border-teal/20 bg-teal/8 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-3.5 w-3.5 text-teal" />
                    <span className="font-mono text-xs text-dim">
                      now_building
                    </span>
                  </div>
                  <span className="font-mono text-xs font-medium text-teal">
                    {now.items[0]?.value ?? "—"}
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Now widget */}
            <Reveal delay={0.14}>
              <div className="mt-5 rounded-2xl border border-line bg-surface/40 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-violet" />
                    </span>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-violet">
                      now
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-dim">live</span>
                </div>
                <ul className="space-y-2.5">
                  {now.items.map((item, i) => {
                    const Icon = NOW_ICONS[i % NOW_ICONS.length];
                    return (
                      <li key={i} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal/12 text-teal">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-dim">
                            {item.label}
                          </div>
                          <div className="truncate text-sm text-foreground/90">
                            {item.value}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>

            {/* Now playing widget — a mock "currently listening" card with an
                animated equalizer. Adds personality without needing a real
                music API. The track cycles through a small playlist every 8s. */}
            <Reveal delay={0.18}>
              <NowPlaying />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * CodeBlock — the terminal-style profile code block with a copy-to-clipboard
 * button in the header. Builds a plain-text version of the code for copying
 * (the rendered version uses colored <span>s which can't be selected cleanly).
 */
function CodeBlock({
  codeBlock,
  penname,
}: {
  codeBlock: NonNullable<typeof profile.codeBlock>;
  penname: string;
}) {
  const [copied, setCopied] = useState(false);

  // Build the plain-text version once.
  const plainText = (() => {
    const lines: string[] = [];
    lines.push(`const ${codeBlock.variableName} = {`);
    for (const f of codeBlock.fields) {
      lines.push(`  ${f.key}: '${f.value}',`);
    }
    lines.push("  interests: {");
    for (const intr of codeBlock.interests) {
      lines.push(`    ${intr}: true,`);
    }
    lines.push("  },");
    lines.push(`  status: '${codeBlock.closing}',`);
    lines.push("}");
    return lines.join("\n");
  })();

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API may be unavailable (e.g. non-secure context) — fail silently
    }
  }, [plainText]);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface/60 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-line bg-surface-3/60 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-dim">
          {penname}@lab: ~/profile
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-line bg-surface/60 px-2 py-1 font-mono text-[10px] text-dim transition-colors hover:border-teal/40 hover:text-teal"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-teal" />
              <span className="text-teal">copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-sm">
        <code>
          <span className="text-violet">const</span>{" "}
          <span className="text-teal">{codeBlock.variableName}</span>{" "}
          <span className="text-dim">=</span> {"{"}
          {"\n"}
          {codeBlock.fields.map((f, i) => (
            <span key={i}>
              {"  "}
              <span className="text-teal/80">{f.key}</span>
              <span className="text-dim">:</span>{" "}
              <span className="text-violet/90">&apos;{f.value}&apos;</span>
              <span className="text-dim">,</span>
              {"\n"}
            </span>
          ))}
          {"  "}
          <span className="text-teal/80">interests</span>
          <span className="text-dim">:</span> {"{"}
          {"\n"}
          {codeBlock.interests.map((intr, i) => (
            <span key={i}>
              {"    "}
              <span className="text-teal/80">{intr}</span>
              <span className="text-dim">:</span>{" "}
              <span className="text-teal">true</span>,
              {"\n"}
            </span>
          ))}
          {"  "}
          {"}"},{"\n"}
          {"  "}
          <span className="text-teal/80">status</span>
          <span className="text-dim">:</span>{" "}
          <span className="text-teal">&apos;{codeBlock.closing}&apos;</span>,
          {"\n"}
          {"}"}
        </code>
      </pre>
    </div>
  );
}

/**
 * NowPlaying — a mock "currently listening" widget with an animated
 * equalizer and a cycling playlist. Adds personality to the About section
 * without requiring a real music API. The track advances every 8 seconds.
 *
 * The playlist is intentionally placeholder (lorem-ipsum style) to match
 * the rest of the site's placeholder copy.
 */
const PLAYLIST = [
  { title: "Lorem Ipsum", artist: "Consectetur Adipiscing", duration: "3:42" },
  { title: "Sed Do Eiusmod", artist: "Tempor Incididunt", duration: "4:18" },
  { title: "Ut Labore", artist: "Magna Aliqua", duration: "2:55" },
];

function NowPlaying() {
  const [idx, setIdx] = useState(0);
  const [bars] = useState(() =>
    // 5 bars with deterministic base heights so they don't reshuffle on rerender.
    Array.from({ length: 5 }, (_, i) => 40 + ((i * 37) % 60))
  );

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PLAYLIST.length), 8000);
    return () => clearInterval(t);
  }, []);

  const track = PLAYLIST[idx];

  return (
    <div className="mt-5 rounded-2xl border border-line bg-surface/40 p-4">
      <div className="flex items-center gap-3">
        {/* album art placeholder with rotating gradient */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-teal/40 to-violet/40">
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(from 0deg, var(--color-teal), var(--color-violet), var(--color-teal))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-1 flex items-center justify-center rounded-md bg-surface/80 backdrop-blur-sm">
            <Music2 className="h-4 w-4 text-teal" />
          </div>
        </div>

        {/* track info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-teal">
              now playing
            </span>
          </div>
          <div className="mt-0.5 truncate font-mono text-sm font-medium text-foreground">
            {track.title}
          </div>
          <div className="truncate text-xs text-dim">{track.artist}</div>
        </div>

        {/* animated equalizer */}
        <div className="flex h-8 items-end gap-0.5" aria-hidden>
          {bars.map((base, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-teal/40 to-teal"
              animate={{
                height: [`${base * 0.3}%`, `${base}%`, `${base * 0.5}%`, `${base * 0.8}%`, `${base * 0.3}%`],
              }}
              transition={{
                duration: 0.9 + (i % 3) * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.12,
              }}
              style={{ height: `${base * 0.5}%` }}
            />
          ))}
        </div>
      </div>

      {/* progress bar (mock — just animates on a loop) */}
      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-[9px] tabular-nums text-dim">1:24</span>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-line">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal to-violet"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <span className="font-mono text-[9px] tabular-nums text-dim">{track.duration}</span>
      </div>
    </div>
  );
}
