"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Folder,
  Hash,
  Briefcase,
  SunMoon,
  Clock,
} from "lucide-react";
import { nav, profile, projects, experience } from "@/lib/data";
import { useModals } from "@/lib/modals";

type Action = {
  id: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  group: string;
  keywords?: string;
};

const RECENT_KEY = "lejxz-cmd-recent";
const RECENT_MAX = 4;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const router = useRouter();
  const { openProject, openExperience } = useModals();

  // Load recently-visited action IDs from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecentIds(parsed.slice(0, RECENT_MAX));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K toggles
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      // `/` opens (when not typing in an input)
      if (e.key === "/" && !isTyping(e)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setTimeout(() => {
      if (href.startsWith("/#")) {
        const id = href.slice(2);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      router.push(href);
    }, 10);
  };

  const openProj = (id: string) => {
    const p = projects.projects.find((x) => x.id === id);
    if (!p) return;
    setOpen(false);
    setTimeout(() => openProject(p, projects.projects), 120);
  };

  const openExp = (id: string) => {
    const e = experience.items.find((x) => x.id === id);
    if (!e) return;
    setOpen(false);
    setTimeout(() => openExperience(e), 120);
  };

  const actions: Action[] = [
    ...nav.map((n) => ({
      id: `nav-${n.href}`,
      label: n.label,
      hint: "Section",
      icon: Hash,
      run: () => go(n.href),
      group: "Navigate",
    })),
    ...projects.projects.map((p) => ({
      id: `proj-${p.id}`,
      label: p.title,
      hint: `${p.category} · ${p.year}`,
      icon: Folder,
      run: () => openProj(p.id),
      group: "Projects",
      keywords: `${p.category} ${p.tags.join(" ")} ${p.tech?.join(" ") ?? ""}`,
    })),
    ...experience.items.map((e) => ({
      id: `exp-${e.id}`,
      label: `${e.role} — ${e.org ?? e.organization}`,
      hint: e.period,
      icon: Briefcase,
      run: () => openExp(e.id),
      group: "Experience",
      keywords: `${e.type ?? "work"} ${e.tech.join(" ")} ${e.tags.join(" ")}`,
    })),
    {
      id: "social-github",
      label: "GitHub",
      hint: "External",
      icon: Github,
      run: () => window.open(profile.socials.github, "_blank"),
      group: "Links",
    },
    {
      id: "social-linkedin",
      label: "LinkedIn",
      hint: "External",
      icon: Linkedin,
      run: () => window.open(profile.socials.linkedin, "_blank"),
      group: "Links",
    },
    {
      id: "social-instagram",
      label: "Instagram",
      hint: "External",
      icon: Instagram,
      run: () => window.open(profile.socials.instagram, "_blank"),
      group: "Links",
    },
    {
      id: "social-email",
      label: "Email",
      hint: profile.email,
      icon: Mail,
      run: () => (window.location.href = `mailto:${profile.email}`),
      group: "Links",
    },
    {
      id: "cycle-accent",
      label: "Cycle accent color",
      hint: "Teal → Violet → Emerald → Amber → Rose → Cyan",
      icon: SunMoon,
      run: () => {
        const accents = ["teal", "violet", "emerald", "amber", "rose", "cyan"];
        const root = document.documentElement;
        let currentIdx = 0;
        accents.forEach((a, i) => {
          if (a !== "teal" && root.classList.contains("accent-" + a)) currentIdx = i;
        });
        const next = accents[(currentIdx + 1) % accents.length];
        accents.forEach((a) => root.classList.remove("accent-" + a));
        if (next !== "teal") root.classList.add("accent-" + next);
        try {
          localStorage.setItem("lejxz-accent", next);
        } catch {
          /* ignore */
        }
      },
      group: "Settings",
    },
  ];

  const grouped = actions.reduce<Record<string, Action[]>>((acc, a) => {
    (acc[a.group] ||= []).push(a);
    return acc;
  }, {});

  // Build the "recently visited" list from recentIds + the actions map.
  const recentActions: Action[] = recentIds
    .map((id) => actions.find((a) => a.id === id))
    .filter((a): a is Action => a !== undefined);

  // Record a visited action ID at the front of the list (deduped, capped).
  const recordRecent = useCallback((id: string) => {
    setRecentIds((cur) => {
      const next = [id, ...cur.filter((x) => x !== id)].slice(0, RECENT_MAX);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="max-w-xl border-line bg-popover/95 backdrop-blur-xl"
    >
      <CommandInput placeholder="Search sections, projects, experience, links…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {/* Recently visited — only shows when there's history AND no search
            query (cmdk filters by the input value, so this naturally hides
            when searching because the items won't match arbitrary queries). */}
        {recentActions.length > 0 && (
          <CommandGroup
            heading="Recently visited"
            className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-violet"
          >
            {recentActions.map((a) => (
              <CommandItem
                key={`recent-${a.id}`}
                value={`${a.label} ${a.hint} ${a.keywords ?? ""}`}
                onSelect={() => {
                  setOpen(false);
                  recordRecent(a.id);
                  a.run();
                }}
                className="group cursor-pointer rounded-md font-mono text-sm data-[selected=true]:bg-surface data-[selected=true]:text-teal"
              >
                <Clock className="h-4 w-4 text-violet/70 group-data-[selected=true]:text-teal" />
                <span className="text-foreground group-data-[selected=true]:text-teal">
                  {a.label}
                </span>
                <span className="ml-2 truncate text-xs text-dim">{a.hint}</span>
                <CommandShortcut className="font-mono text-[10px]">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {Object.entries(grouped).map(([group, items], i) => (
          <div key={group}>
            {(i > 0 || recentActions.length > 0) && <CommandSeparator />}
            <CommandGroup
              heading={group}
              className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-dim"
            >
              {items.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`${a.label} ${a.hint} ${a.keywords ?? ""}`}
                  onSelect={() => {
                    setOpen(false);
                    recordRecent(a.id);
                    a.run();
                  }}
                  className="group cursor-pointer rounded-md font-mono text-sm data-[selected=true]:bg-surface data-[selected=true]:text-teal"
                >
                  <a.icon className="h-4 w-4 text-dim group-data-[selected=true]:text-teal" />
                  <span className="text-foreground group-data-[selected=true]:text-teal">
                    {a.label}
                  </span>
                  <span className="ml-2 truncate text-xs text-dim">{a.hint}</span>
                  <CommandShortcut className="font-mono text-[10px]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
      {/* Footer — keyboard shortcut hints so the palette feels like a
          proper app launcher (not a mystery box). Sticky at the bottom,
          outside the scrollable CommandList. */}
      <div className="flex items-center justify-between gap-3 border-t border-line bg-surface/60 px-3 py-2 font-mono text-[10px] text-dim backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-foreground/70">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-foreground/70">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-foreground/70">Esc</kbd>
            close
          </span>
        </div>
        <span className="text-dim/60">
          <span className="text-teal/70">⌘K</span> to toggle
        </span>
      </div>
    </CommandDialog>
  );
}

function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    t.isContentEditable
  );
}
