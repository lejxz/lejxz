"use client";

/**
 * Hidden admin dashboard for the lejxz portfolio.
 *
 * - Password-gated (password stored in sessionStorage under `lejxz_dashboard_pw`).
 * - Talks to the dashboard mini-service on port 3030 via the sandbox Caddy
 *   gateway (`?XTransformPort=3030`).
 * - Gracefully degrades to read-only mode (with a banner) on GitHub Pages where
 *   the mini-service isn't running — in that case the baked-in JSON from
 *   `src/data/*.json` is shown in the textarea so the user can at least inspect.
 * - Sticky header + sticky footer, responsive (sidebar collapses on mobile).
 */

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Lock,
  RotateCcw,
  Save,
  Unlock,
  CloudOff,
  FileJson,
  Loader2,
  RefreshCw,
  PanelLeft,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { asset } from "@/lib/asset";

// Fallback data baked into the static bundle (used when the mini-service is
// unreachable — e.g. on the deployed GitHub Pages site).
import profileFallback from "@/data/profile.json";
import marqueeFallback from "@/data/marquee.json";
import skillsFallback from "@/data/skills.json";
import experienceFallback from "@/data/experience.json";
import projectsFallback from "@/data/projects.json";
import nowFallback from "@/data/now.json";
import footerFallback from "@/data/footer.json";
import siteFallback from "@/data/site.json";
import usesFallback from "@/data/uses.json";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PW_STORAGE_KEY = "lejxz_dashboard_pw";
const PORT = 3030;
const API_BASE = `/api/dashboard`;

type FileName =
  | "profile"
  | "marquee"
  | "skills"
  | "experience"
  | "projects"
  | "now"
  | "footer"
  | "site"
  | "uses";

interface FileMeta {
  name: FileName;
  label: string;
  desc: string;
}

const FILES: FileMeta[] = [
  { name: "profile", label: "Profile", desc: "Identity, bio, stats, socials" },
  { name: "marquee", label: "Marquee", desc: "Hero ticker words" },
  { name: "skills", label: "Skills", desc: "Groups, bars, gauge, tech marquee" },
  { name: "experience", label: "Experience", desc: "Timeline items" },
  { name: "projects", label: "Projects", desc: "Work grid entries" },
  { name: "now", label: "Now", desc: "Current focus cards" },
  { name: "footer", label: "Footer", desc: "Footer note + link columns" },
  { name: "site", label: "Site", desc: "Site-wide metadata" },
  { name: "uses", label: "Uses", desc: "Gear / uses page" },
];

const FALLBACKS: Record<FileName, unknown> = {
  profile: profileFallback,
  marquee: marqueeFallback,
  skills: skillsFallback,
  experience: experienceFallback,
  projects: projectsFallback,
  now: nowFallback,
  footer: footerFallback,
  site: siteFallback,
  uses: usesFallback,
};

function apiUrl(path: string): string {
  return `${API_BASE}${path}?XTransformPort=${PORT}`;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [pw, setPw] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  // Hydrate password from sessionStorage on mount.
  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PW_STORAGE_KEY);
      if (stored) setPw(stored);
    } catch {
      /* sessionStorage unavailable */
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="size-5 animate-spin text-teal" />
      </div>
    );
  }

  if (!pw) {
    return <PasswordGate onUnlock={setPw} />;
  }

  return <Dashboard password={pw} onLock={() => {
    try { sessionStorage.removeItem(PW_STORAGE_KEY); } catch {}
    setPw(null);
  }} />;
}

// ---------------------------------------------------------------------------
// Password gate
// ---------------------------------------------------------------------------

function PasswordGate({ onUnlock }: { onUnlock: (pw: string) => void }) {
  const [value, setValue] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setError("Enter a password.");
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/data"), {
        method: "GET",
        headers: { "x-dashboard-password": value },
      });
      if (res.status === 401) {
        setError("Wrong password.");
        toast.error("Wrong password.");
        setChecking(false);
        return;
      }
      if (!res.ok) {
        setError(`Server error (${res.status}).`);
        toast.error(`Server error (${res.status}).`);
        setChecking(false);
        return;
      }
      // Persist and unlock. Even though /data succeeded, the dashboard itself
      // will detect if the backend is reachable later (it might not be on the
      // deployed site). But for the gate, a 401 vs. network error matters:
      // a network error means "backend not reachable" — we still allow entry
      // in read-only mode (password still cached for retry).
      try {
        sessionStorage.setItem(PW_STORAGE_KEY, value);
      } catch {}
      toast.success("Unlocked.");
      onUnlock(value);
    } catch (err) {
      // Network error — backend isn't reachable. Still cache the password so
      // the user can use read-only mode + retry; show a soft warning.
      try {
        sessionStorage.setItem(PW_STORAGE_KEY, value);
      } catch {}
      toast.warning(
        "Backend unreachable. Entering read-only mode — start the mini-service to edit."
      );
      onUnlock(value);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-line bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2">
            <img
              src={asset("/assets/mark.svg")}
              alt="lejxz mark"
              className="size-6 transition-opacity group-hover:opacity-80"
            />
            <span className="font-mono text-sm tracking-tight text-foreground">
              lejxz
              <span className="text-dim"> / </span>
              <span className="text-teal">dashboard</span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="font-mono text-dim">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to site
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-line bg-surface text-teal">
              <Lock className="size-5" />
            </div>
            <h1 className="font-mono text-lg font-bold text-foreground">
              Dashboard access
            </h1>
            <p className="mt-1 font-mono text-xs text-dim">
              Enter the editor password to manage portfolio data.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="space-y-3 rounded-lg border border-line bg-surface p-5"
          >
            <label
              htmlFor="pw"
              className="font-mono text-[11px] uppercase tracking-wider text-dim"
            >
              Password
            </label>
            <Input
              id="pw"
              ref={inputRef}
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="••••••••••"
              className="font-mono"
            />
            {error && (
              <p className="font-mono text-xs text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              disabled={checking}
              className="w-full font-mono"
            >
              {checking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unlock className="size-4" />
              )}
              {checking ? "Checking…" : "Unlock"}
            </Button>
          </form>

          <p className="mt-4 text-center font-mono text-[11px] leading-relaxed text-dim">
            Default password is set in the mini-service env
            <br />
            (<code className="text-teal/80">DASHBOARD_PASSWORD</code>).
          </p>
        </div>
      </main>

      <footer className="mt-auto border-t border-line bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 font-mono text-[11px] text-dim">
          <span>lejxz · admin</span>
          <span>read-only on deploy · live-edit locally</span>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard (post-unlock)
// ---------------------------------------------------------------------------

interface DashboardProps {
  password: string;
  onLock: () => void;
}

function Dashboard({ password, onLock }: DashboardProps) {
  const [active, setActive] = React.useState<FileName>("profile");
  const [content, setContent] = React.useState<string>(""); // textarea text
  const [loaded, setLoaded] = React.useState<string>(""); // last loaded/saved text
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [backendReachable, setBackendReachable] = React.useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const dirty = content !== loaded;

  // ---- load all files (to check reachability) on mount ----
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/data"), {
          headers: { "x-dashboard-password": password },
        });
        if (!cancelled) {
          if (res.ok) setBackendReachable(true);
          else if (res.status === 401) {
            toast.error("Session expired — locking.");
            onLock();
          } else {
            setBackendReachable(false);
          }
        }
      } catch {
        if (!cancelled) setBackendReachable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [password, onLock]);

  // ---- load selected file whenever `active` changes ----
  const loadFile = React.useCallback(
    async (name: FileName) => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl(`/file/${name}`), {
          headers: { "x-dashboard-password": password },
        });
        if (res.status === 401) {
          toast.error("Session expired — locking.");
          onLock();
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const pretty = JSON.stringify(json.data, null, 2) + "\n";
        setContent(pretty);
        setLoaded(pretty);
      } catch (err) {
        // Fallback to baked-in data so the textarea still shows something.
        const fallback = FALLBACKS[name];
        const pretty = JSON.stringify(fallback, null, 2) + "\n";
        setContent(pretty);
        setLoaded(pretty);
        // Don't toast on every file switch if backend is already known down.
        if (backendReachable !== false) {
          toast.warning(
            `Backend unreachable — showing read-only snapshot of ${name}.json`
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [password, onLock, backendReachable]
  );

  React.useEffect(() => {
    void loadFile(active);
  }, [active, loadFile]);

  // ---- beforeunload warn when dirty ----
  React.useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ---- save ----
  async function save() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Invalid JSON: ${msg}`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/file/${active}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dashboard-password": password,
        },
        body: JSON.stringify(parsed),
      });
      if (res.status === 401) {
        toast.error("Session expired — locking.");
        onLock();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const pretty = JSON.stringify(parsed, null, 2) + "\n";
      setContent(pretty);
      setLoaded(pretty);
      toast.success(`${active}.json saved.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setContent(loaded);
    toast.info("Reverted to last loaded version.");
  }

  function formatJson() {
    try {
      const parsed = JSON.parse(content);
      const pretty = JSON.stringify(parsed, null, 2) + "\n";
      setContent(pretty);
      toast.success("Reformatted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Invalid JSON: ${msg}`);
    }
  }

  const activeMeta = FILES.find((f) => f.name === active)!;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-dim"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="size-4" /> : <PanelLeft className="size-4" />}
            </Button>
            <Link href="/" className="group flex items-center gap-2">
              <img
                src={asset("/assets/mark.svg")}
                alt="lejxz mark"
                className="size-5 transition-opacity group-hover:opacity-80"
              />
              <span className="font-mono text-sm tracking-tight">
                lejxz
                <span className="text-dim"> / </span>
                <span className="text-teal">dashboard</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="font-mono text-dim">
              <Link href="/">
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Back to site</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-dim"
              onClick={onLock}
            >
              <Lock className="size-4" />
              <span className="hidden sm:inline">Lock</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-64 shrink-0 border-b border-line md:border-b-0 md:border-r bg-surface/40`}
        >
          <div className="flex items-center justify-between px-4 py-3 md:hidden">
            <span className="font-mono text-[11px] uppercase tracking-wider text-dim">
              Files
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-dim"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <nav className="px-2 py-2 md:px-3 md:py-4">
            <p className="hidden px-2 pb-2 font-mono text-[11px] uppercase tracking-wider text-dim md:block">
              Data files
            </p>
            <ul className="space-y-0.5">
              {FILES.map((f) => {
                const isActive = f.name === active;
                return (
                  <li key={f.name}>
                    <button
                      onClick={() => {
                        setActive(f.name);
                        setSidebarOpen(false);
                      }}
                      className={`group flex w-full items-start gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? "border-line bg-surface text-foreground"
                          : "border-transparent text-dim hover:bg-surface/60 hover:text-foreground"
                      }`}
                    >
                      <FileJson
                        className={`mt-0.5 size-4 shrink-0 ${
                          isActive ? "text-teal" : "text-dim group-hover:text-foreground"
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block font-mono text-xs font-medium">
                          {f.label}
                          <span className="text-dim">.json</span>
                        </span>
                        <span className="block truncate font-mono text-[11px] text-dim">
                          {f.desc}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main editor */}
        <main className="flex min-w-0 flex-1 flex-col px-4 py-5 md:px-6 md:py-6">
          {/* Backend status banner */}
          {backendReachable === false && (
            <div className="mb-4 flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-amber-200/90">
              <CloudOff className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <div className="space-y-0.5">
                <p className="font-mono text-xs font-medium text-amber-200">
                  Editor backend isn&apos;t reachable.
                </p>
                <p className="font-mono text-[11px] leading-relaxed text-amber-200/70">
                  Run the dashboard mini-service locally (
                  <code className="text-amber-200/90">
                    cd mini-services/dashboard-api &amp;&amp; bun run dev
                  </code>
                  ) to edit. On the deployed site, data is read-only.
                </p>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="flex items-center gap-2 font-mono text-sm font-bold">
                <FileJson className="size-4 text-teal" />
                <span className="truncate text-foreground">
                  {activeMeta.label.toLowerCase()}
                  <span className="text-dim">.json</span>
                </span>
                {dirty && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-200">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    dirty
                  </span>
                )}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-dim"
                onClick={() => void loadFile(active)}
                disabled={loading || saving || backendReachable === false}
                title="Reload from disk"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Reload
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-dim"
                onClick={formatJson}
                disabled={loading || saving}
                title="Pretty-print the textarea JSON"
              >
                Format
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-mono"
                onClick={reset}
                disabled={!dirty || loading || saving}
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button
                size="sm"
                className="font-mono"
                onClick={save}
                disabled={!dirty || loading || saving || backendReachable === false}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save
              </Button>
            </div>
          </div>

          <p className="mb-3 font-mono text-[11px] text-dim">
            {activeMeta.desc}. Edit the JSON directly — Save validates &amp;
            writes to <code className="text-teal/80">src/data/{active}.json</code>.
          </p>

          {/* Editor */}
          <div className="relative flex min-h-[50vh] flex-1 flex-col overflow-hidden rounded-md border border-line bg-[#0a0c0f]">
            {/* gutter line numbers via CSS counter would be heavy; keep simple mono editor */}
            {loading && content === "" ? (
              <div className="flex flex-1 items-center justify-center text-dim">
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
                wrap="off"
                className="min-h-[50vh] flex-1 resize-none rounded-none border-0 bg-transparent font-mono text-xs leading-relaxed text-foreground shadow-none focus-visible:ring-0 dark:bg-transparent"
                style={{
                  tabSize: 2,
                  whiteSpace: "pre",
                  overflowWrap: "normal",
                }}
              />
            )}
            {/* status bar */}
            <div className="flex items-center justify-between border-t border-line bg-surface/60 px-3 py-1.5 font-mono text-[10px] text-dim">
              <span className="flex items-center gap-2">
                <span
                  className={`inline-flex size-1.5 rounded-full ${
                    backendReachable === false
                      ? "bg-amber-400"
                      : backendReachable === true
                      ? "bg-teal"
                      : "bg-dim"
                  }`}
                />
                {backendReachable === false
                  ? "offline · read-only"
                  : backendReachable === true
                  ? "connected · live"
                  : "connecting…"}
              </span>
              <span>
                {content.length.toLocaleString()} chars ·{" "}
                {content.split("\n").length} lines
                {dirty && " · unsaved"}
                {!dirty && loaded !== "" && (
                  <>
                    {" "}
                    · <span className="text-teal/80">saved</span>
                    <Check className="ml-1 inline size-3 text-teal/80" />
                  </>
                )}
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-line bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 font-mono text-[11px] text-dim">
          <span>lejxz · admin dashboard</span>
          <span className="flex items-center gap-3">
            <span>
              backend: <code className="text-teal/80">port {PORT}</code>
            </span>
            <span>read-only on deploy · live-edit locally</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
