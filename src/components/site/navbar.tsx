"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, ArrowUpRight } from "lucide-react";
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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-px origin-left bg-teal"
        style={{ scaleX: progress }}
      />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/#top" className="group flex items-center gap-2.5">
          <img
            src={asset("/assets/mark.svg")}
            alt="lejxz mark"
            className="h-7 w-7 transition-transform duration-300 group-hover:rotate-6"
          />
          <span className="font-mono text-sm font-bold tracking-tight text-foreground">
            lejxz<span className="text-dim">.dev</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
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

          <Link href="/projects" className="hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border-line font-mono text-xs uppercase tracking-wider hover:border-teal/50 hover:text-teal"
            >
              All Projects
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

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
    </header>
  );
}
