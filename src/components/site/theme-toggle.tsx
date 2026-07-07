"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Accent = "teal" | "violet" | "emerald" | "amber" | "rose" | "cyan";

const STORAGE_KEY = "lejxz-accent";

const ACCENTS: { key: Accent; label: string; color: string }[] = [
  { key: "teal", label: "Teal", color: "#5eead4" },
  { key: "violet", label: "Violet", color: "#a78bfa" },
  { key: "emerald", label: "Emerald", color: "#34d399" },
  { key: "amber", label: "Amber", color: "#fbbf24" },
  { key: "rose", label: "Rose", color: "#fb7185" },
  { key: "cyan", label: "Cyan", color: "#22d3ee" },
];

const ALL_CLASSES = ACCENTS.map((a) => `accent-${a.key}`);

/**
 * applyAccent — set the accent color by toggling the accent-* class on <html>.
 */
function applyAccent(accent: Accent) {
  const root = document.documentElement;
  ALL_CLASSES.forEach((cls) => root.classList.remove(cls));
  if (accent !== "teal") root.classList.add(`accent-${accent}`);
}

/**
 * ThemeToggle — an accent color picker. The site is always dark; instead of
 * switching between light/dark, the user picks an accent color (teal, violet,
 * emerald, amber, rose, cyan). The accent changes the primary color, neural
 * network colors, selection color, ring color, etc.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [accent, setAccent] = useState<Accent>("teal");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Read the current accent from the DOM.
    const root = document.documentElement;
    for (const a of ACCENTS) {
      if (root.classList.contains(`accent-${a.key}`)) {
        setAccent(a.key);
        return;
      }
    }
    setAccent("teal");
  }, []);

  const selectAccent = useCallback((next: Accent) => {
    setAccent(next);
    applyAccent(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  if (!mounted) {
    return <span className={cn("h-9 w-9", className)} aria-hidden />;
  }

  const current = ACCENTS.find((a) => a.key === accent) ?? ACCENTS[0];

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Accent color: ${current.label}. Click to change.`}
        title={`Accent: ${current.label}`}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-dim transition-colors hover:border-teal/50 hover:text-teal"
      >
        <span
          className="h-4 w-4 rounded-full transition-colors"
          style={{
            backgroundColor: current.color,
            boxShadow: `0 0 8px ${current.color}80`,
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop to close on outside click */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-50 flex flex-col gap-1 rounded-xl border border-dim/40 bg-surface/95 p-2 backdrop-blur-xl shadow-2xl"
            >
              <p className="mb-1 px-2 font-mono text-[9px] uppercase tracking-wider text-dim">
                Accent color
              </p>
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => {
                    selectAccent(a.key);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-mono text-xs transition-colors",
                    accent === a.key
                      ? "bg-surface/60 text-foreground"
                      : "text-dim hover:bg-surface/40 hover:text-foreground"
                  )}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor: a.color,
                      boxShadow: a.key === accent ? `0 0 8px ${a.color}80` : "none",
                    }}
                  />
                  {a.label}
                  {accent === a.key && (
                    <span className="ml-auto text-[9px] text-teal">●</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
