"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Lock,
  Save,
  Unlock,
  CloudOff,
  Loader2,
  RefreshCw,
  PanelLeft,
  X,
  Check,
  CircleDot,
  Code2,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { asset } from "@/lib/asset";
import {
  ProfileEditor,
  MarqueeEditor,
  SkillsEditor,
  ExperienceEditor,
  ProjectsEditor,
  NowEditor,
  FooterEditor,
  SiteEditor,
  UsesEditor,
} from "@/components/dashboard/editors";

// Fallback data baked into the static bundle (read-only on GitHub Pages).
import profileFallback from "@/data/profile.json";
import marqueeFallback from "@/data/marquee.json";
import skillsFallback from "@/data/skills.json";
import experienceFallback from "@/data/experience.json";
import projectsFallback from "@/data/projects.json";
import nowFallback from "@/data/now.json";
import footerFallback from "@/data/footer.json";
import siteFallback from "@/data/site.json";
import usesFallback from "@/data/uses.json";

const PW_STORAGE_KEY = "lejxz_dashboard_pw";
const PORT = 3030;
const API_BASE = `/api/dashboard`;
const DEFAULT_PASSWORD = "lejxz-edit-2026";

// GitHub repo config for the GitHub Pages dashboard mode.
// When the dashboard is accessed on GitHub Pages (not localhost), it reads
// data from the raw GitHub URLs and writes via the GitHub Contents API.
const GH_OWNER = "lejxz";
const GH_REPO = "lejxz";
const GH_BRANCH = "main";
const GH_DATA_DIR = "src/data";
const RAW_BASE = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${GH_DATA_DIR}`;

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

const FILES: { name: FileName; label: string; desc: string }[] = [
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

/**
 * Detect the current environment.
 * - "dev": localhost (mini-service on port 3030)
 * - "gateway": sandbox preview (Caddy gateway with XTransformPort)
 * - "github": GitHub Pages (static, use GitHub API for read/write)
 */
function getEnv(): "dev" | "gateway" | "github" {
  if (typeof window === "undefined") return "dev";
  if (window.location.hostname === "localhost") return "dev";
  if (window.location.hostname.includes("space-z.ai") || window.location.hostname.includes("z.ai")) return "gateway";
  return "github";
}

/**
 * Build the API URL for the dashboard mini-service (dev + gateway modes).
 * In GitHub Pages mode, this isn't used — we use the GitHub API directly.
 */
function apiUrl(path: string): string {
  const env = getEnv();
  if (env === "dev") {
    return `http://localhost:${PORT}${API_BASE}${path}`;
  }
  return `${API_BASE}${path}?XTransformPort=${PORT}`;
}

/**
 * Fetch all data files. In dev/gateway mode, calls the mini-service.
 * In GitHub Pages mode, fetches each file from raw.githubusercontent.com.
 */
async function fetchAllData(password: string): Promise<{ files: Record<string, unknown>; backendUp: boolean }> {
  const env = getEnv();

  if (env === "github") {
    // GitHub Pages mode: fetch each file from raw GitHub URLs.
    const files: Record<string, unknown> = {};
    let allOk = true;
    for (const name of ALLOWED_FILES) {
      try {
        const res = await fetch(`${RAW_BASE}/${name}.json`, { cache: "no-store" });
        if (res.ok) {
          files[name] = await res.json();
        } else {
          files[name] = clone(FALLBACKS[name]);
          allOk = false;
        }
      } catch {
        files[name] = clone(FALLBACKS[name]);
        allOk = false;
      }
    }
    return { files, backendUp: allOk };
  }

  // Dev / gateway mode: call the mini-service.
  const res = await fetch(apiUrl("/data"), {
    headers: { "x-dashboard-password": password },
  });
  if (res.ok) {
    const json = await res.json();
    return { files: json.files, backendUp: true };
  }
  return { files: clone(FALLBACKS), backendUp: false };
}

/**
 * Save a single data file. In dev/gateway mode, calls the mini-service.
 * In GitHub Pages mode, uses the GitHub Contents API to commit the change.
 *
 * For GitHub Pages mode, the password IS the GitHub token (PAT). The user
 * enters their GitHub PAT as the "password" — it's used to authenticate
 * the GitHub API write. This is safe because the token is only stored in
 * sessionStorage and sent directly to api.github.com.
 */
async function saveFile(
  name: string,
  data: unknown,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const env = getEnv();

  if (env === "github") {
    // GitHub Pages mode: use the GitHub Contents API.
    // The password is the GitHub PAT.
    const token = password;
    const path = `${GH_DATA_DIR}/${name}.json`;
    const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`;

    // 1. Get the current file's SHA (required for updates).
    let sha: string | undefined;
    try {
      const getRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });
      if (getRes.ok) {
        const getInfo = await getRes.json();
        sha = getInfo.sha;
      }
    } catch {
      // File may not exist yet — that's OK, we'll create it.
    }

    // 2. Update the file with the new content.
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2) + "\n")));
    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `dashboard: update ${name}.json`,
        content,
        sha,
        branch: GH_BRANCH,
      }),
    });

    if (putRes.ok) return { ok: true };
    const err = await putRes.json().catch(() => ({}));
    return { ok: false, error: err.message || `GitHub API error: ${putRes.status}` };
  }

  // Dev / gateway mode: call the mini-service.
  const res = await fetch(apiUrl(`/file/${name}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dashboard-password": password,
    },
    body: JSON.stringify(data),
  });
  if (res.ok) return { ok: true };
  const j = await res.json().catch(() => ({}));
  return { ok: false, error: j.error || "Save failed" };
}

const EDITORS: Record<FileName, React.ComponentType<{ data: any; onChange: (n: any) => void }>> = {
  profile: ProfileEditor,
  marquee: MarqueeEditor,
  skills: SkillsEditor,
  experience: ExperienceEditor,
  projects: ProjectsEditor,
  now: NowEditor,
  footer: FooterEditor,
  site: SiteEditor,
  uses: UsesEditor,
};

// ---------------------------------------------------------------------------
// Deep clone helper (so edits don't mutate the loaded reference)
// ---------------------------------------------------------------------------
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [pw, setPw] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  // hydrate password from sessionStorage on mount
  React.useEffect(() => {
    const saved = sessionStorage.getItem(PW_STORAGE_KEY);
    if (saved) setPw(saved);
    setReady(true);
  }, []);

  // lock: clear password
  const lock = () => {
    sessionStorage.removeItem(PW_STORAGE_KEY);
    setPw(null);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-teal" />
      </div>
    );
  }

  if (!pw) {
    return <PasswordGate onUnlock={(p) => { sessionStorage.setItem(PW_STORAGE_KEY, p); setPw(p); }} />;
  }

  return <Dashboard password={pw} onLock={lock} />;
}

// ---------------------------------------------------------------------------
// Password gate
// ---------------------------------------------------------------------------

function PasswordGate({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [value, setValue] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setChecking(true);
    const env = getEnv();

    if (env === "github") {
      // GitHub Pages mode: the password is a GitHub PAT.
      // Validate it by trying to read a file via the GitHub API.
      try {
        const testRes = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_DATA_DIR}/profile.json`, {
          headers: {
            Authorization: `Bearer ${value}`,
            Accept: "application/vnd.github+json",
          },
        });
        if (testRes.ok) {
          onUnlock(value);
          toast.success("Dashboard unlocked — GitHub mode (read/write)");
        } else if (testRes.status === 401 || testRes.status === 403) {
          toast.error("Invalid GitHub token");
        } else {
          // Token might be valid but repo access differs — try anyway.
          onUnlock(value);
          toast("GitHub mode — enter your GitHub PAT to edit", { icon: "🔑" });
        }
      } catch {
        toast.error("Network error — check your connection");
      }
      setChecking(false);
      return;
    }

    // Dev / gateway mode: validate against the mini-service.
    try {
      const res = await fetch(apiUrl("/data"), {
        headers: { "x-dashboard-password": value },
      });
      if (res.ok) {
        onUnlock(value);
        toast.success("Dashboard unlocked");
      } else if (res.status === 401) {
        toast.error("Wrong password");
      } else {
        if (value === DEFAULT_PASSWORD) {
          onUnlock(value);
          toast("Backend offline — read-only mode", { icon: "⚠️" });
        } else {
          toast.error("Wrong password");
        }
      }
    } catch {
      if (value === DEFAULT_PASSWORD) {
        onUnlock(value);
        toast("Backend unreachable — read-only mode", { icon: "⚠️" });
      } else {
        toast.error("Wrong password");
      }
    }
    setChecking(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[26rem] w-[26rem] rounded-full bg-violet/10 blur-[130px]" />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
          <img src={asset("/assets/mark.svg")} alt="" className="h-9 w-9" />
          <span className="font-mono text-sm font-bold">
            lejxz<span className="text-dim">.dev</span> / dashboard
          </span>
        </Link>
        <form onSubmit={submit} className="rounded-2xl border border-line bg-surface/40 p-6 backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal" />
            <h1 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Dashboard access
            </h1>
          </div>
          <Input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={getEnv() === "github" ? "GitHub PAT (github_pat_...)" : "Password"}
            autoFocus
            className="border-line bg-surface/50 font-mono text-sm focus:border-teal/40"
          />
          <Button
            type="submit"
            disabled={checking || !value.trim()}
            className="mt-3 w-full gap-2 bg-teal text-primary-foreground hover:bg-teal/90"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
            Unlock
          </Button>
          <p className="mt-3 text-center font-mono text-[10px] text-dim">
            {getEnv() === "github"
              ? <>Enter your <code className="text-teal">GitHub PAT</code> to read & write <code className="text-teal">src/data/</code> via the GitHub API.</>
              : <>Edits write to <code className="text-teal">src/data/</code> via the local mini-service.</>
            }
          </p>
        </form>
        <div className="mt-4 text-center">
          <Link href="/" className="font-mono text-xs text-dim transition-colors hover:text-teal">
            ← back to site
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard shell — sidebar + editor + save bar
// ---------------------------------------------------------------------------

function Dashboard({ password, onLock }: { password: string; onLock: () => void }) {
  const [active, setActive] = React.useState<FileName>("profile");
  const [allData, setAllData] = React.useState<Record<FileName, any> | null>(null);
  const [original, setOriginal] = React.useState<Record<FileName, any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [backendUp, setBackendUp] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  // Auto-save state: "idle" | "saving" | "saved"
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  // Track which files are dirty (for per-file auto-save)
  const [viewRaw, setViewRaw] = React.useState(false);

  // load all data on mount
  const loadAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const { files, backendUp: up } = await fetchAllData(password);
      setAllData(files as Record<FileName, any>);
      setOriginal(clone(files));
      setBackendUp(up);
    } catch {
      setAllData(clone(FALLBACKS));
      setOriginal(clone(FALLBACKS));
      setBackendUp(false);
    }
    setLoading(false);
  }, [password]);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  // edit handler for the active file
  const edit = (next: any) => {
    setAllData((cur) => (cur ? { ...cur, [active]: next } : cur));
    setAutoSaveStatus("idle");
  };

  // Auto-save: debounce 60s (1 minute) after the last edit to the active file.
  // Only triggers if the backend is up and the active file is dirty.
  // In GitHub Pages mode, auto-save is disabled (would spam the GitHub API).
  React.useEffect(() => {
    if (!allData || !original || !backendUp) return;
    if (getEnv() === "github") return;
    const isDirtyNow =
      JSON.stringify(allData[active]) !== JSON.stringify(original[active]);
    if (!isDirtyNow) return;

    setAutoSaveStatus("idle");
    const timer = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        const result = await saveFile(active, allData[active], password);
        if (result.ok) {
          setOriginal((cur) =>
            cur ? { ...cur, [active]: clone(allData[active]) } : cur
          );
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        }
      } catch {
        setAutoSaveStatus("idle");
      }
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, [allData, original, active, backendUp, password]);

  // dirty check: compare active file to its original
  const isDirty = React.useMemo(() => {
    if (!allData || !original) return false;
    return JSON.stringify(allData[active]) !== JSON.stringify(original[active]);
  }, [allData, original, active]);

  const anyDirty = React.useMemo(() => {
    if (!allData || !original) return false;
    return FILES.some((f) => JSON.stringify(allData[f.name]) !== JSON.stringify(original[f.name]));
  }, [allData, original]);

  // save the active file
  const save = async () => {
    if (!allData || !backendUp) return;
    setSaving(true);
    try {
      const result = await saveFile(active, allData[active], password);
      if (result.ok) {
        setOriginal((cur) => (cur ? { ...cur, [active]: clone(allData[active]) } : cur));
        toast.success(getEnv() === "github" ? `${active}.json committed to GitHub` : `${active}.json saved`);
      } else {
        toast.error(result.error || "Save failed");
      }
    } catch {
      toast.error("Save failed — check your connection/token");
    }
    setSaving(false);
  };

  // reload from disk (discard)
  const reload = async () => {
    if (isDirty && !confirm("Discard unsaved changes to this file?")) return;
    await loadAll();
    toast("Reloaded from disk");
  };

  const Editor = EDITORS[active];
  const activeMeta = FILES.find((f) => f.name === active)!;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-dim hover:text-teal lg:hidden"
              aria-label="Open sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <img src={asset("/assets/mark.svg")} alt="" className="h-7 w-7" />
              <span className="font-mono text-sm font-bold">
                lejxz<span className="text-dim">.dev</span>
                <span className="text-dim"> / dashboard</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] sm:flex ${backendUp ? "border-teal/30 bg-teal/10 text-teal" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
              <CircleDot className="h-2.5 w-2.5" />
              {backendUp ? "connected · live" : "offline · read-only"}
            </span>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 font-mono text-xs text-dim hover:text-teal">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back to site</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onLock} className="gap-1.5 font-mono text-xs text-dim hover:text-teal">
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Backend-down banner */}
      {!backendUp && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center">
          <p className="flex items-center justify-center gap-2 font-mono text-xs text-destructive">
            <CloudOff className="h-3.5 w-3.5" />
            The editor backend isn&apos;t reachable. Run <code className="rounded bg-surface px-1.5 py-0.5">bash mini-services/dashboard-api/start.sh</code> locally to edit. On the deployed site, data is read-only.
          </p>
        </div>
      )}

      {/* Body: sidebar + editor */}
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto border-r border-line bg-surface/20 lg:block">
          <Sidebar
            active={active}
            onSelect={setActive}
            dirtyMap={FILES.reduce((acc, f) => {
              acc[f.name] = allData && original
                ? JSON.stringify(allData[f.name]) !== JSON.stringify(original[f.name])
                : false;
              return acc;
            }, {} as Record<FileName, boolean>)}
          />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 border-r border-line bg-background p-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-line text-dim"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
              <Sidebar
                active={active}
                onSelect={(f) => { setActive(f); setSidebarOpen(false); }}
                dirtyMap={FILES.reduce((acc, f) => {
                  acc[f.name] = allData && original
                    ? JSON.stringify(allData[f.name]) !== JSON.stringify(original[f.name])
                    : false;
                  return acc;
                }, {} as Record<FileName, boolean>)}
              />
            </div>
          </div>
        )}

        {/* Editor */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {/* Editor header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-mono text-lg font-bold text-foreground">
                  {activeMeta.label}
                  <span className="text-dim">.json</span>
                </h1>
                <p className="font-mono text-[11px] text-dim">{activeMeta.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Auto-save indicator: shows "saving…" or "saved" */}
                {autoSaveStatus === "saving" && (
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-violet">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    saving…
                  </span>
                )}
                {autoSaveStatus === "saved" && (
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-teal">
                    <Check className="h-3 w-3" />
                    saved
                  </span>
                )}
                {isDirty && autoSaveStatus === "idle" && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-violet">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet" />
                    unsaved
                  </span>
                )}
                {/* View raw JSON toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewRaw((v) => !v)}
                  className="gap-1.5 font-mono text-xs text-dim hover:text-teal"
                  aria-pressed={viewRaw}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{viewRaw ? "Editor" : "Raw JSON"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reload}
                  disabled={loading}
                  className="gap-1.5 font-mono text-xs text-dim hover:text-teal"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reload</span>
                </Button>
                <Button
                  size="sm"
                  onClick={save}
                  disabled={!isDirty || saving || !backendUp}
                  className="gap-1.5 bg-teal font-mono text-xs text-primary-foreground hover:bg-teal/90 disabled:opacity-40"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isDirty ? <Save className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  Save
                </Button>
              </div>
            </div>

            {/* Editor body — shows raw JSON viewer when toggled */}
            {loading || !allData ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-teal" />
              </div>
            ) : viewRaw ? (
              <RawJsonView data={allData[active]} fileName={active} />
            ) : (
              <Editor data={allData[active]} onChange={edit} />
            )}
          </div>
        </main>
      </div>

      {/* Sticky footer */}
      <footer className="sticky bottom-0 border-t border-line bg-background/90 px-4 py-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <p className="font-mono text-[10px] text-dim">
            {anyDirty ? "Unsaved changes in one or more files" : "All changes saved"}
          </p>
          <p className="font-mono text-[10px] text-dim/60">
            © {new Date().getFullYear()} lejxz · dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({
  active,
  onSelect,
  dirtyMap,
}: {
  active: FileName;
  onSelect: (f: FileName) => void;
  dirtyMap: Record<FileName, boolean>;
}) {
  return (
    <nav className="space-y-1 p-2">
      <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-wider text-dim/60">
        Data files
      </p>
      {FILES.map((f) => (
        <button
          key={f.name}
          type="button"
          onClick={() => onSelect(f.name)}
          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
            active === f.name
              ? "border border-teal/30 bg-teal/10 text-teal"
              : "border border-transparent text-foreground/80 hover:bg-surface/50"
          }`}
        >
          <span className="flex-1 truncate font-mono text-xs font-medium">{f.label}</span>
          {dirtyMap[f.name] && (
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-violet" />
          )}
        </button>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// RawJsonView — read-only syntax-highlighted JSON viewer with copy button
// ---------------------------------------------------------------------------

function RawJsonView({ data, fileName }: { data: any; fileName: string }) {
  const [copied, setCopied] = React.useState(false);
  const jsonStr = React.useMemo(
    () => JSON.stringify(data, null, 2),
    [data]
  );

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const onDownload = () => {
    const blob = new Blob([jsonStr + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}.json`);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface/40">
      <div className="flex items-center justify-between border-b border-line bg-surface-3/60 px-4 py-2.5">
        <span className="font-mono text-xs text-dim">raw JSON · read-only</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 rounded-md border border-line bg-surface/60 px-2 py-1 font-mono text-[10px] text-dim transition-colors hover:border-teal/40 hover:text-teal"
          >
            <Download className="h-3 w-3" />
            <span>download</span>
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1.5 rounded-md border border-line bg-surface/60 px-2 py-1 font-mono text-[10px] text-dim transition-colors hover:border-teal/40 hover:text-teal"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-teal" />
                <span className="text-teal">copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="max-h-[60vh] overflow-auto p-4 font-mono text-xs leading-relaxed">
        <code>{jsonStr}</code>
      </pre>
    </div>
  );
}
