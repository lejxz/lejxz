"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUp, Printer } from "lucide-react";
import { profile, footerLinks, nav } from "@/lib/data";
import { Icon } from "@/components/icon";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();
  // Surface a "last served" timestamp in the status line so the "all systems
  // operational" indicator feels like real telemetry, not decoration. Computed
  // once via a lazy useState initializer (no effect, no re-render) — shows the
  // page-load time as a proxy for "last served". Empty on the server render
  // (SSR), populated on the client to avoid hydration mismatch.
  const [buildTime] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  });

  const socials = [
    { label: "GitHub", icon: "github", url: profile.socials.github ?? "#" },
    { label: "LinkedIn", icon: "linkedin", url: profile.socials.linkedin ?? "#" },
    { label: "Instagram", icon: "instagram", url: profile.socials.instagram ?? "#" },
    { label: "Email", icon: "mail", url: profile.socials.email ?? `mailto:${profile.email}` },
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
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-dim transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Icon name={s.icon} className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
            {/* Status line — refined: now shows a "last served" time alongside
                the operational dot so it reads as live telemetry. */}
            <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim/70">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/60"
                  style={{ animationDuration: "2s" }}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
              all systems operational
              {buildTime && (
                <span className="ml-1 normal-case tracking-normal text-dim/50">
                  · served {buildTime}
                </span>
              )}
            </p>
          </div>

          {/* navigate */}
          <FooterColumn heading="Navigate">
            {nav.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* elsewhere */}
          <FooterColumn heading="Elsewhere">
            {socials.map((s) => (
              <FooterLink key={s.label} href={s.url} external>
                {s.label}
              </FooterLink>
            ))}
            <p className="mt-3 font-mono text-[11px] text-dim/70">{profile.email}</p>
            <p className="mt-0.5 font-mono text-[11px] text-dim/60">{profile.location}</p>
          </FooterColumn>
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
            {footerLinks.copyright ?? profile.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-dim">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
              {footerLinks.builtWith ?? "Built with Next.js"}
            </span>
            <span className="h-3 w-px bg-line" />
            <button
              type="button"
              onClick={() => window.print()}
              className="group flex items-center gap-1.5 font-mono text-[11px] text-dim transition-colors hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
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
              className="font-mono text-[11px] text-dim transition-colors hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              aria-label="Show keyboard shortcuts"
            >
              shortcuts ?
            </button>
            <span className="h-3 w-px bg-line" />
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * FooterColumn — a labeled link column with a hover lift on the whole column.
 * The heading gets a subtle accent on hover of any child link so the column
 * feels responsive as a group.
 */
function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group/col">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors group-hover/col:text-teal/70">
        {heading}
      </p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

/**
 * FooterLink — a single footer link with an animated leading dash that grows
 * on hover. Now a proper focus-visible ring for keyboard a11y.
 */
function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <li>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="group flex w-fit items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          <span className="h-px w-0 bg-teal transition-all duration-300 group-hover:w-4" />
          {children}
        </a>
      ) : (
        <Link
          href={href}
          className="group flex w-fit items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          <span className="h-px w-0 bg-teal transition-all duration-300 group-hover:w-4" />
          {children}
        </Link>
      )}
    </li>
  );
}

/**
 * BackToTop — the "Back to top" button with a circular scroll-progress ring.
 *
 * The ring fills as the user scrolls down the page, reaching 100% at the
 * bottom — so the button doubles as a scroll-position indicator. Clicking it
 * smoothly scrolls back to the top.
 *
 * The ring is driven by the global scroll progress (useScroll with no target
 * = viewport scroll), spring-smoothed for a fluid feel.
 */
function BackToTop() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  // The ring's pathLength is driven by scroll progress — 0 at top, 1 at
  // bottom. strokeDashoffset is the inverse (circ - progress*circ).
  const pathLength = useTransform(progress, [0, 1], [0, 1]);

  const onClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back to top"
      className="group relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-dim transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
    >
      <span className="hidden sm:inline">Back to top</span>
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-line transition-colors group-hover:border-teal/50 group-hover:text-teal">
        {/* Scroll-progress ring — an SVG circle whose pathLength tracks scroll.
            Sits behind the arrow icon. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden
        >
          <motion.circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="var(--color-teal)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ pathLength }}
            className="opacity-70"
          />
        </svg>
        <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
      </span>
    </button>
  );
}
