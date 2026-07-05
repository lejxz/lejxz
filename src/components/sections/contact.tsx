"use client";

import { Github, Instagram, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";

export function Contact() {
  const socials = [
    { icon: Github, href: profile.socials.github ?? "#", label: "GitHub" },
    {
      icon: Instagram,
      href: profile.socials.instagram ?? "#",
      label: "Instagram",
    },
    {
      icon: Linkedin,
      href: profile.socials.linkedin ?? "#",
      label: "LinkedIn",
    },
  ];

  return (
    <section id="contact" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="05" kicker="Contact" title="Get in touch" />

        <Reveal delay={0.05} className="mt-12">
          <div className="group relative overflow-hidden rounded-2xl border border-line bg-surface/40 p-8 transition-colors hover:border-teal/30 sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-teal/10 blur-[100px] transition-opacity duration-500 group-hover:opacity-70" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet/10 blur-[100px] transition-opacity duration-500 group-hover:opacity-70" />
            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="font-mono text-sm text-teal">{"// let's talk"}</p>
                <h3 className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Have a project
                  <br />
                  <span className="text-gradient">in mind?</span>
                </h3>
                <p className="mt-4 text-pretty text-dim">
                  {profile.availability}. Reach out — I read every message.
                </p>
              </div>

              <div className="flex flex-col items-start gap-5">
                <Magnetic strength={0.25}>
                  <a
                    href={`mailto:${profile.email}`}
                    className="group/btn inline-flex items-center gap-3 rounded-full bg-teal px-7 py-4 font-mono text-sm font-bold text-primary-foreground transition-all hover:glow-teal"
                  >
                    {profile.email}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </a>
                </Magnetic>

                <div className="flex flex-wrap items-center gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="group/soc flex h-11 items-center gap-2 rounded-full border border-line pl-3 pr-4 text-dim transition-colors hover:border-teal/50 hover:text-teal"
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
        </Reveal>
      </div>
    </section>
  );
}
