"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  label: string;
}

export function CaseStudyToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Contents"
      className="sticky top-28 hidden h-fit w-48 shrink-0 xl:block"
    >
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
        Contents
      </p>
      <ul className="space-y-1 border-l border-line">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "group relative -ml-px block border-l-2 py-1.5 pl-4 font-mono text-xs uppercase tracking-wider transition-colors",
                  isActive
                    ? "border-teal text-teal"
                    : "border-transparent text-dim hover:text-foreground"
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
