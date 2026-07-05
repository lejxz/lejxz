"use client";

import { Github, Instagram, Linkedin, Mail, ArrowUpRight, Terminal, CheckCircle2, MapPin, Clock } from "lucide-react";
import { profile } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";

// Reverse-direction ticker phrases for the contact section (moves right-to-left,
// opposite to the skills ticker on home which moves right).
const TICKER_PHRASES = [
  "let's build something",
  "open to collaborations",
  "research · projects · ideas",
  "inbox always open",
  "say hello",
];

export function Contact() {
  const socials = [
    { icon: Github, href: profile.socials.github ?? "#", label: "GitHub" },
    { icon: Instagram, href: profile.socials.instagram ?? "#", label: "Instagram" },
    { icon: Linkedin, href: profile.socials.linkedin ?? "#", label: "LinkedIn" },
  ];

  const channels = [
    { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { icon: MapPin, label: "Location", value: profile.location },
    { icon: Clock, label: "Reply", value: "1–2 business days" },
  ];

  return (
    <section id="contact" className="relative scroll-mt-20 py-24 sm:py-32">
      {/* ===== Reverse ticker (right-to-left, opposite to home skills ticker) ===== */}
      <Reveal className="mb-16">
        <div className="group relative overflow-hidden border-y border-line bg-surface/30 py-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="flex w-max animate-marquee items-center gap-8 group-hover:[animation-play-state:paused]" style={{ ["--marquee-duration" as string]: "45s" }}>
            {[...TICKER_PHRASES, ...TICKER_PHRASES, ...TICKER_PHRASES].map((phrase, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className="font-mono text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
                  {phrase}
                </span>
                <span className="text-violet/60">/</span>
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="06" kicker="Contact" title="Let's build" />

        <Reveal delay={0.05} className="mt-12">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left: invitation + mailto CTA */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/40 p-8 transition-colors hover:border-teal/30 sm:p-12">
                <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-teal/10 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet/10 blur-[100px]" />
                <div className="relative">
                  <p className="font-mono text-sm text-teal">{"// let's talk"}</p>
                  <h3 className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Have a project
                    <br />
                    <span className="text-gradient-shimmer">in mind?</span>
                  </h3>
                  <p className="mt-4 max-w-md text-pretty text-dim">
                    {profile.availability}. Reach out — I read every message and
                    reply within 1–2 business days.
                  </p>

                  <div className="mt-8">
                    <Magnetic strength={0.25}>
                      <a
                        href={`mailto:${profile.email}`}
                        className="group inline-flex items-center gap-3 rounded-full bg-teal px-7 py-4 font-mono text-sm font-bold text-primary-foreground transition-all hover:glow-teal"
                      >
                        {profile.email}
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    </Magnetic>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.label}
                        className="flex h-11 items-center gap-2 rounded-full border border-line pl-3 pr-4 text-dim transition-colors hover:border-teal/50 hover:text-teal"
                      >
                        <s.icon className="h-4 w-4" />
                        <span className="font-mono text-xs uppercase tracking-wider">
                          {s.label}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: channels + terminal status */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-line bg-surface/40 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/15 ring-1 ring-teal/30">
                    <Terminal className="h-6 w-6 text-teal" />
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                      Channels
                    </h4>
                    <p className="font-mono text-xs text-dim">direct lines</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {channels.map((c) => (
                    <li key={c.label} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line text-teal">
                        <c.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-dim">
                          {c.label}
                        </div>
                        {c.href ? (
                          <a
                            href={c.href}
                            className="text-sm font-medium text-foreground transition-colors hover:text-teal"
                          >
                            {c.value}
                          </a>
                        ) : (
                          <div className="text-sm font-medium text-foreground">
                            {c.value}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-start gap-2.5 border-t border-line pt-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  <p className="text-xs text-dim">
                    Clicking the email button opens your default mail client with
                    a fresh compose — no forms, no friction.
                  </p>
                </div>
              </div>

              {/* Mini terminal */}
              <div className="mt-5 overflow-hidden rounded-xl border border-line bg-surface/40 p-4 font-mono text-xs leading-relaxed">
                <div className="mb-2 flex items-center gap-2 text-dim">
                  <Terminal className="h-3.5 w-3.5 text-teal" />
                  <span className="text-[10px] uppercase tracking-wider">
                    availability_check
                  </span>
                </div>
                <div className="text-foreground/85">
                  <span className="text-teal">$</span> curl {profile.penname}/status
                  <br />
                  <span className="text-violet">{"{"}</span> accepting:{" "}
                  <span className="text-teal">true</span>, status:{" "}
                  <span className="text-teal">"{profile.availability}"</span>{" "}
                  <span className="text-violet">{"}"}</span>
                  <br />
                  <span className="text-teal">$</span>{" "}
                  <span className="animate-blink">_</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
