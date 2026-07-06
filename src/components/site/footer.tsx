"use client";

import Link from "next/link";
import { ArrowUp, Printer } from "lucide-react";
import { profile, footerLinks, site, nav } from "@/lib/data";
import { Icon } from "@/components/icon";
import { asset } from "@/lib/asset";

export function Footer() {
  const year = new Date().getFullYear();
  const socials = profile.socialLinks ?? [
    { label: "GitHub", icon: "github", url: profile.socials.github ?? "#" },
    { label: "LinkedIn", icon: "linkedin", url: profile.socials.linkedin ?? "#" },
    { label: "Instagram", icon: "instagram", url: profile.socials.instagram ?? "#" },
    { label: "Email", icon: "mail", url: `mailto:${profile.email}` },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-background">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {/* keyboard hint */}
        <p className="mb-10 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-dim/60 md:block">
          <span className="text-teal/60">[tip]</span> press{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">⌘K</kbd>{" "}
          to search ·{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">?</kbd>{" "}
          for shortcuts ·{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-foreground/70">g</kbd>{" "}
          then a letter to jump
        </p>

        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* brand */}
          <div className="max-w-sm">
            <Link href="/#top" className="group flex items-center gap-2.5">
              <img
                src={asset("/assets/mark.svg")}
                alt="lejxz mark"
                className="h-9 w-9 transition-transform duration-500 group-hover:rotate-12"
              />
              <span className="font-mono text-sm font-bold tracking-tight">
                lejxz<span className="text-dim">.dev</span>
              </span>
            </Link>
            <p className="mt-3 text-pretty text-xs leading-relaxed text-dim">
              {footerLinks.note ?? profile.tagline}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-dim transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:text-teal"
                >
                  <Icon name={s.icon} className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim/70">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/60"
                  style={{ animationDuration: "2s" }}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
              all systems operational
            </p>
          </div>

          {/* navigate */}
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              Navigate
            </p>
            <ul className="space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex w-fit items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-teal"
                  >
                    <span className="h-px w-0 bg-teal transition-all duration-300 group-hover:w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* elsewhere */}
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              Elsewhere
            </p>
            <ul className="space-y-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex w-fit items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-teal"
                  >
                    <span className="h-px w-0 bg-teal transition-all duration-300 group-hover:w-4" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[11px] text-dim/70">{profile.email}</p>
            <p className="mt-0.5 font-mono text-[11px] text-dim/60">{profile.location}</p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-line pt-6 md:flex-row md:items-center">
          {/* The © year is a hidden hyperlink to the dashboard.
              Styled to look like plain text — no underline, no color change. */}
          <p className="font-mono text-xs text-dim">
            <Link
              href="/dashboard/"
              aria-label="Dashboard"
              className="text-dim transition-colors hover:text-dim"
              style={{ textDecoration: "none" }}
            >
              © {year}
            </Link>{" "}
            {footerLinks.copyright ?? site.footer.copyright ?? profile.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-dim">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
              {footerLinks.builtWith ?? site.footer.builtWith ?? "Built with Next.js"}
            </span>
            <span className="h-3 w-px bg-line" />
            <button
              type="button"
              onClick={() => window.print()}
              className="group flex items-center gap-1.5 font-mono text-[11px] text-dim transition-colors hover:text-teal"
              aria-label="Print or save as PDF"
              title="Print / Save as PDF"
            >
              <Printer className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span className="hidden sm:inline">print</span>
            </button>
            <span className="h-3 w-px bg-line" />
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }))
              }
              className="font-mono text-[11px] text-dim transition-colors hover:text-teal"
              aria-label="Show keyboard shortcuts"
            >
              shortcuts ?
            </button>
            <span className="h-3 w-px bg-line" />
            <Link
              href="/#top"
              className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-dim transition-colors hover:text-foreground"
            >
              Back to top
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line transition-colors group-hover:border-teal/50 group-hover:text-teal">
                <ArrowUp className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
