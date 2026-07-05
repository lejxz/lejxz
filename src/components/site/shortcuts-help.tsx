"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string;
  label: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: "⌘ K", label: "Open command palette" },
  { keys: "G H", label: "Go home" },
  { keys: "G P", label: "Jump to projects (work)" },
  { keys: "G A", label: "Jump to about" },
  { keys: "G S", label: "Jump to skills" },
  { keys: "G E", label: "Jump to experience" },
  { keys: "G W", label: "Jump to work" },
  { keys: "G U", label: "Jump to uses" },
  { keys: "G C", label: "Jump to contact" },
  { keys: "?", label: "Show this help" },
  { keys: "Esc", label: "Close dialogs" },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (typing) return;
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // g-prefix navigation (g then h/p/a/s/e/w/c)
  useEffect(() => {
    let pending = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (typing) return;
      if (document.querySelector("[role=dialog]")) return;

      if (e.key === "g" && !pending) {
        pending = true;
        timer = setTimeout(() => {
          pending = false;
        }, 700);
        return;
      }
      if (pending) {
        const map: Record<string, string> = {
          h: "/#top",
          p: "/#work",
          a: "/#about",
          s: "/#skills",
          e: "/#experience",
          w: "/#work",
          u: "/#uses",
          c: "/#contact",
        };
        const href = map[e.key.toLowerCase()];
        if (href) {
          e.preventDefault();
          window.location.href = href;
        }
        pending = false;
        if (timer) clearTimeout(timer);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show keyboard shortcuts"
        className="fixed bottom-6 left-6 z-40 hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-background/80 text-dim backdrop-blur-md transition-colors hover:border-teal/50 hover:text-teal md:flex lg:bottom-8 lg:left-8"
      >
        <Keyboard className="h-4 w-4" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-line bg-background p-0 sm:max-w-md">
          <DialogHeader className="space-y-0 border-b border-line p-6">
            <DialogTitle className="font-mono text-lg font-bold tracking-tight">
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-dim">
              Press <kbd className="rounded bg-surface px-1.5 py-0.5 text-foreground">?</kbd> anytime to toggle this.
            </DialogDescription>
          </DialogHeader>
          <ul className="divide-y divide-line">
            {SHORTCUTS.map((s) => (
              <li
                key={s.label}
                className="flex items-center justify-between px-6 py-3"
              >
                <span className="text-sm text-foreground/90">{s.label}</span>
                <kbd className="rounded border border-line bg-surface px-2 py-1 font-mono text-xs text-dim">
                  {s.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
