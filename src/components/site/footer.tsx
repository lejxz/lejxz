"use client";

import Link from "next/link";
import { Github, Instagram, Linkedin, Mail, ArrowUp } from "lucide-react";
import { profile } from "@/lib/data";

export function Footer() {
  const year = new Date().getFullYear();
  const socials = [
    { icon: Github, href: profile.socials.github, label: "GitHub" },
    { icon: Instagram, href: profile.socials.instagram, label: "Instagram" },
    { icon: Linkedin, href: profile.socials.linkedin, label: "LinkedIn" },
    {
      icon: Mail,
      href: profile.socials.email ?? `mailto:${profile.email}`,
      label: "Email",
    },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-background">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="mb-8 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-dim/60 md:block">
          <span className="text-teal/60">[tip]</span> press{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">⌘K</kbd>{" "}
          to search ·{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">?</kbd>{" "}
          for shortcuts ·{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">g</kbd>{" "}
          then a letter to jump
        </p>
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-sm font-bold tracking-tight">
              lejxz<span className="text-dim">.dev</span>
            </p>
            <p className="mt-1 font-mono text-xs text-dim">
              © {year} {profile.name}. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-dim transition-colors hover:border-teal/50 hover:text-teal"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <Link
            href="/#top"
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-foreground"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line transition-colors group-hover:border-teal/50 group-hover:text-teal">
              <ArrowUp className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
