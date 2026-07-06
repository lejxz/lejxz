"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "lejxz-theme";

/**
 * Apply a theme to the document root by toggling the `light` class.
 * Dark is the default (`:root` palette); `light` overrides via `.light`.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
}

/**
 * ThemeToggle — a real dark/light switch.
 *
 * Previously this only toggled a `data-theme="soft"` attribute which lifted a
 * handful of CSS variables — effectively a subtle contrast overlay, not a
 * theme change. It now toggles the `light` class on `<html>`, which swaps the
 * entire palette (background, surfaces, text, borders, accents, grid, neural
 * network colors) via the `:root.light` block in globals.css.
 *
 * The initial theme is applied by a blocking inline script in layout.tsx to
 * prevent a flash of the wrong theme. This component reads the *current* DOM
 * state on mount (rather than its own state) so it stays in sync with whatever
 * the script applied.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Read the actual applied theme from the DOM — the layout's blocking
    // script has already set it before React hydrates.
    const current: Theme = document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
    setTheme(current);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore (private mode / quota)
      }
      return next;
    });
  }, []);

  if (!mounted) {
    return <span className={cn("h-9 w-9", className)} aria-hidden />;
  }

  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      title={`Switch to ${isLight ? "dark" : "light"} theme`}
      className={cn(
        "group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-line text-dim transition-colors hover:border-teal/50 hover:text-teal",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLight ? (
          <motion.span
            key="moon"
            initial={{ y: 12, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -12, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ y: 12, opacity: 0, rotate: 30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -12, opacity: 0, rotate: -30 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
