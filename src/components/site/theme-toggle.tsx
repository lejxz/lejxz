"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "deep" | "soft";

const apply = (t: Theme) => {
  const root = document.documentElement;
  if (t === "soft") {
    root.setAttribute("data-theme", "soft");
  } else {
    root.removeAttribute("data-theme");
  }
};

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("deep");
  const [mounted, setMounted] = useState(false);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "deep" ? "soft" : "deep";
      apply(next);
      localStorage.setItem("lejxz-theme", next);
      return next;
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem("lejxz-theme") as Theme | null;
    if (saved === "soft" || saved === "deep") {
      setTheme(saved);
      apply(saved);
    }
  }, []);

  if (!mounted) {
    return <span className={cn("h-9 w-9", className)} aria-hidden />;
  }

  const isSoft = theme === "soft";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isSoft ? "deep" : "soft"} contrast`}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md border border-line text-dim transition-colors hover:border-teal/50 hover:text-teal",
        className
      )}
    >
      {isSoft ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
