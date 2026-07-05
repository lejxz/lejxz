"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { nav, profile, projects } from "@/lib/data";

type Action = {
  id: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  group: string;
  keywords?: string;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    // allow hash + route navigation after the dialog closes
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
      run: () => go(`/projects/#${p.id}`),
      group: "Projects",
      keywords: `${p.category} ${p.tags.join(" ")}`,
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
  ];

  const grouped = actions.reduce<Record<string, Action[]>>((acc, a) => {
    (acc[a.group] ||= []).push(a);
    return acc;
  }, {});

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="max-w-xl border-line bg-popover/95 backdrop-blur-xl"
    >
      <CommandInput placeholder="Search sections, projects, links…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(grouped).map(([group, items], i) => (
          <div key={group}>
            {i > 0 && <CommandSeparator />}
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
    </CommandDialog>
  );
}
