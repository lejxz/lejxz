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
} from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { profile, now } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

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

  // Auto-derive facts from top-level profile fields (no duplicate editing).
  // The order is controlled by profile.factOrder (editable in the dashboard).
  // If factOrder is not set, uses the default order below.
  const allFacts: Record<string, () => { label: string; value: string }> = {
    location: () => ({ label: "Location", value: profile.location ?? "" }),
    field: () => ({ label: "Field", value: profile.field ?? "" }),
    status: () => ({ label: "Status", value: profile.availability ?? "" }),
    role: () => ({ label: "Role", value: profile.role ?? "" }),
  };

  const defaultOrder = ["location", "field", "status", "role"];
  const order = (profile as any).factOrder ?? defaultOrder;

  const derivedFacts = order
    .map((key: string) => allFacts[key]?.())
    .filter((f: { label: string; value: string } | undefined) => f && f.value);

  const facts = derivedFacts.map((f: { label: string; value: string }, i: number) => ({
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
                  <TiltCard max={3} className="rounded-xl">
                    <CodeBlock
                      codeBlock={profile.codeBlock}
                      penname={profile.penname}
                      name={profile.name}
                      role={profile.role}
                      location={profile.location}
                    />
                  </TiltCard>
                </Reveal>
              </motion.div>
            )}

            {profile.quote && (
              <Reveal delay={0.12}>
                <figure className="mt-8 flex gap-4 rounded-xl border border-line bg-surface/70 backdrop-blur-sm p-5">
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
              <TiltCard max={4} className="rounded-2xl">
                <div className="overflow-hidden rounded-2xl border border-line bg-surface/80 backdrop-blur-sm p-6 shadow-2xl shadow-black/40">
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
              </TiltCard>
            </Reveal>

            {/* Now widget */}
            <Reveal delay={0.14}>
              <TiltCard max={3} className="mt-5 rounded-2xl">
                <div className="rounded-2xl border border-line bg-surface/70 backdrop-blur-sm p-5">
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
              </TiltCard>
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
  name,
  role,
  location,
}: {
  codeBlock: NonNullable<typeof profile.codeBlock>;
  penname: string;
  name: string;
  role: string;
  location: string;
}) {
  const [copied, setCopied] = useState(false);

  // Auto-derive fields from top-level profile data (no duplicate editing).
  // Only fall back to codeBlock.fields if the top-level fields are empty.
  const derivedFields = [
    { key: "name", value: name },
    { key: "handle", value: penname },
    { key: "role", value: role },
    { key: "location", value: location },
  ].filter((f) => f.value);
  const fields = derivedFields.length > 0 ? derivedFields : codeBlock.fields;

  // Build the plain-text version once.
  const plainText = (() => {
    const lines: string[] = [];
    lines.push(`const ${codeBlock.variableName} = {`);
    for (const f of fields) {
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
    <div className="overflow-hidden rounded-xl border border-line bg-surface/80 backdrop-blur-sm shadow-2xl shadow-black/40">
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
          {fields.map((f, i) => (
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
