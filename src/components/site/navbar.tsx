"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, Terminal } from "lucide-react";
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
    stiffness: 120,
    damping: 30,
    mass: 0.3,
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
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "py-2" : "py-4"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-500",
              scrolled
                ? "rounded-2xl border border-line bg-background/70 px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-xl"
                : "rounded-none border border-transparent px-1 py-1"
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
                className={cn(
                  "relative rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
                  isActive
                    ? "text-teal"
                    : "text-dim hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-px h-px bg-teal"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
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

          <Link href="/#contact" className="hidden sm:block">
            <Button
              size="sm"
              className="gap-1.5 rounded-full bg-teal px-4 font-mono text-xs text-primary-foreground hover:bg-teal/90"
            >
              <Terminal className="h-3.5 w-3.5" />
              get_in_touch
            </Button>
          </Link>

          <ThemeToggle className="hidden sm:flex" />

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
                  {[...nav, { label: "All Projects", href: "/projects" }].map(
                    (item, i) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center justify-between border-b border-line py-4 font-mono text-2xl font-bold tracking-tight transition-colors hover:text-teal"
                        >
                          <span>{item.label}</span>
                          <span className="font-mono text-xs text-dim">
                            0{i + 1}
                          </span>
                        </Link>
                      </SheetClose>
                    )
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
