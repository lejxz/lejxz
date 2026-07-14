"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu } from "lucide-react";
import { nav, profile } from "@/lib/data";
import { asset } from "@/lib/asset";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    mass: 0.2,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = nav.map((n) => n.href.replace("/#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Scroll progress bar — decoupled from navbar container, full-width, above navbar */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-gradient-to-r from-teal via-teal to-violet"
        style={{ scaleX: progress }}
      />
      <header className="fixed inset-x-0 top-0 z-50 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-2.5 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
              scrolled
                ? "border-line bg-background/70 shadow-lg shadow-black/20 backdrop-blur-xl"
                : "border-transparent bg-transparent shadow-none backdrop-blur-none"
            )}
          >
        <div className="flex items-center gap-2.5">
          <Link href="/#top" className="group flex items-center gap-2.5">
            <img
              src={asset("/assets/mark.svg")}
              alt="lejxz mark"
              className="h-7 w-7 transition-transform duration-300 group-hover:rotate-6"
            />
            <span className="hidden font-mono text-sm font-bold tracking-tight text-foreground sm:inline">
              lejxz<span className="text-dim">.dev</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const sectionId = item.href.replace("/#", "");
            const isActive = activeSection === sectionId;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group relative rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "text-teal"
                    : "text-dim hover:text-foreground"
                )}
              >
                {/* Active background tint — a subtle pill behind the active
                    link so it reads as a "you are here" marker, not just a
                    color swap. */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-md bg-teal/10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {item.label}
                {/* Active underline — the existing h-px line, now sits above
                    the tint pill. */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-px h-px bg-teal"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {/* Hover underline — a non-active link shows an animated
                    underline that scales in from the center on hover. */}
                {!isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-px origin-center scale-x-0 bg-dim/50 transition-transform duration-200 group-hover:scale-x-100" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              );
            }}
            className="hidden items-center gap-2 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-dim transition-colors hover:border-teal/50 hover:text-teal md:flex"
            aria-label="Open command palette"
          >
            <span>Search</span>
            <kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px] tracking-wider">
              ⌘K
            </kbd>
          </button>

          <ThemeToggle className="flex" />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[78vw] border-line bg-background/95 p-0"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation menu
              </SheetDescription>
              <div className="flex h-full flex-col p-6">
                <Link
                  href="/#top"
                  onClick={() => setOpen(false)}
                  className="mb-8 flex items-center gap-2.5"
                >
                  <img src={asset("/assets/mark.svg")} alt="lejxz mark" className="h-7 w-7" />
                  <span className="font-mono text-sm font-bold">
                    lejxz<span className="text-dim">.dev</span>
                  </span>
                </Link>
                <nav className="flex flex-col gap-1">
                  {[...nav, { label: "All Projects", href: "/#work" }].map(
                    (item, i) => {
                      const sectionId = item.href.replace("/#", "");
                      const isActive = activeSection === sectionId;
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={isActive ? "true" : undefined}
                            className={cn(
                              "flex items-center justify-between border-b border-line py-4 font-mono text-2xl font-bold tracking-tight transition-colors hover:text-teal",
                              isActive ? "text-teal" : ""
                            )}
                          >
                            <span className="flex items-center gap-3">
                              {/* Active marker dot on the mobile menu so the
                                  user sees which section they're on even in the
                                  sheet. */}
                              {isActive && (
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                                </span>
                              )}
                              <span>{item.label}</span>
                            </span>
                            <span className="font-mono text-xs text-dim">
                              0{i + 1}
                            </span>
                          </Link>
                        </SheetClose>
                      );
                    }
                  )}
                </nav>
                <div className="mt-auto space-y-3 pt-8">
                  <p className="font-mono text-xs uppercase tracking-wider text-dim">
                    {profile.availability}
                  </p>
                  <a
                    href={`mailto:${profile.email}`}
                    className="block font-mono text-sm text-teal"
                  >
                    {profile.email}
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </div>
    </header>
    </>
  );
}
