"use client";

import Link from "next/link";
import { Github, Instagram, Linkedin, Mail, ArrowUp, ArrowUpRight } from "lucide-react";
import { profile, footerLinks } from "@/lib/data";

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
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <p className="mb-10 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-dim/60 md:block">
          <span className="text-teal/60">[tip]</span> press{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">⌘K</kbd>{" "}
          to search ·{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">?</kbd>{" "}
          for shortcuts ·{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">g</kbd>{" "}
          then a letter to jump
        </p>

        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <p className="font-mono text-sm font-bold tracking-tight">
              lejxz<span className="text-dim">.dev</span>
            </p>
            <p className="mt-2 max-w-xs text-pretty text-xs text-dim">
              {profile.tagline}
            </p>
            <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim/70">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/60" style={{ animationDuration: "2s" }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
              all systems operational
            </p>
          </div>

          {footerLinks.columns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors hover:text-teal"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-teal"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-line pt-6 md:flex-row md:items-center">
          <p className="font-mono text-xs text-dim">
            © {year} {profile.name}. All rights reserved.
          </p>

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
