"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "uses", label: "Uses" },
  { id: "work", label: "Work" },
  { id: "testimonials", label: "Voices" },
  { id: "changelog", label: "Versions" },
  { id: "contact", label: "Contact" },
];

export function SideRail() {
  const [active, setActive] = useState("top");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // only show after scrolling past the hero
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className={cn(
        "fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-500 lg:flex",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`/#${s.id}`}
            className="group flex items-center justify-end gap-2.5"
            aria-label={s.label}
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                isActive
                  ? "text-teal opacity-100"
                  : "text-dim opacity-0 group-hover:opacity-100"
              )}
            >
              {s.label}
            </span>
            <span
              className={cn(
                "relative flex h-2.5 w-2.5 items-center justify-center rounded-full border transition-all duration-300",
                isActive
                  ? "border-teal bg-teal"
                  : "border-line bg-transparent group-hover:border-dim"
              )}
            >
              {isActive && (
                <span className="absolute inset-0 animate-ping rounded-full bg-teal opacity-40" />
              )}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
