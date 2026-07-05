"use client";

import { profile } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function About() {
  const specs: { label: string; value: string }[] = [
    { label: "name", value: profile.name },
    { label: "alias", value: profile.penname },
    { label: "role", value: profile.role },
    { label: "field", value: profile.field },
    { label: "location", value: profile.location },
    { label: "status", value: profile.availability },
  ];

  return (
    <section id="about" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="01" kicker="About" title="Profile" />

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7" delay={0.05}>
            <div className="space-y-5">
              {profile.bio.map((para, i) => (
                <p
                  key={i}
                  className="text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg"
                >
                  {para}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={0.12}>
            <div className="overflow-hidden rounded-xl border border-line bg-surface/50">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
                <span className="ml-3 font-mono text-[11px] text-dim">
                  ~/lejxz/profile
                </span>
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-dim/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                  connected
                </span>
              </div>
              <div className="p-5 font-mono text-sm">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-4 border-b border-line/60 py-2.5 last:border-0"
                  >
                    <span className="text-dim">{spec.label}</span>
                    <span className="text-right text-foreground">{spec.value}</span>
                  </div>
                ))}
                <div className="mt-4 flex items-center gap-2 text-teal">
                  <span className="animate-blink">▋</span>
                  <span className="text-dim">$</span>
                  <span className="text-foreground">whoami</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
