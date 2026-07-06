/**
 * dashboard-api — lejxz portfolio hidden dashboard backend.
 *
 * A standalone Bun mini-service that reads & writes the portfolio JSON data
 * files in `/home/z/my-project/src/data/`. It is intentionally dependency-free
 * (uses only `Bun.serve` + the Node `path` + `fs` built-ins).
 *
 * Routes:
 *   GET    /api/dashboard/health         — open, for connection checks
 *   GET    /api/dashboard/data           — auth, returns all files
 *   GET    /api/dashboard/file/:name     — auth, returns one file's raw JSON
 *   POST   /api/dashboard/file/:name     — auth, writes one file (validates JSON)
 *   OPTIONS *                            — preflight, 204
 *
 * Auth: every protected route requires the `x-dashboard-password` header to
 * match the `DASHBOARD_PASSWORD` env var (default: `lejxz-edit-2026`). Compared
 * with a constant-time check.
 *
 * The sandbox gateway forwards `?XTransformPort=3030` requests to this service.
 */

import { resolve, join } from "node:path";
import { existsSync, statSync } from "node:fs";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = 3030;
const DEFAULT_PASSWORD = "lejxz-edit-2026";
const PASSWORD = process.env.DASHBOARD_PASSWORD || DEFAULT_PASSWORD;

/** Allowlist of editable data files (matches the files in `src/data/`). */
const ALLOWED_FILES = [
  "profile",
  "marquee",
  "skills",
  "experience",
  "projects",
  "now",
  "footer",
  "site",
  "uses",
] as const;
type FileName = (typeof ALLOWED_FILES)[number];

/** Resolve the data directory robustly. */
const DATA_DIR = resolve(import.meta.dir, "../../src/data");

if (!existsSync(DATA_DIR) || !statSync(DATA_DIR).isDirectory()) {
  console.error(
    `[dashboard-api] FATAL: data directory not found at ${DATA_DIR}. ` +
      `CWD=${process.cwd()}`
  );
  process.exit(1);
}
console.log(`[dashboard-api] data dir → ${DATA_DIR}`);
console.log(`[dashboard-api] password loaded (len=${PASSWORD.length})`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Constant-time string comparison to mitigate timing attacks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function isAllowed(name: string): name is FileName {
  return (ALLOWED_FILES as readonly string[]).includes(name);
}

function filePath(name: FileName): string {
  return join(DATA_DIR, `${name}.json`);
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-dashboard-password",
    "Access-Control-Max-Age": "86400",
  };
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...extraHeaders,
    },
  });
}

function unauthorized() {
  return json({ error: "Unauthorized" }, 401);
}

function badRequest(message: string) {
  return json({ error: message }, 400);
}

function checkAuth(req: Request): boolean {
  const provided = req.headers.get("x-dashboard-password") || "";
  if (!provided) return false;
  return safeEqual(provided, PASSWORD);
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleGetData(req: Request): Promise<Response> {
  if (!checkAuth(req)) return unauthorized();
  const files: Record<string, unknown> = {};
  for (const name of ALLOWED_FILES) {
    const fp = filePath(name);
    try {
      const raw = await Bun.file(fp).text();
      files[name] = JSON.parse(raw);
    } catch (err) {
      console.error(`[dashboard-api] failed to read ${name}:`, err);
      files[name] = null;
    }
  }
  return json({ files });
}

async function handleGetFile(req: Request, name: string): Promise<Response> {
  if (!checkAuth(req)) return unauthorized();
  if (!isAllowed(name)) return badRequest(`Unknown file: ${name}`);
  const fp = filePath(name);
  const f = Bun.file(fp);
  if (!(await f.exists())) return json({ error: "File not found" }, 404);
  try {
    const raw = await f.text();
    const data = JSON.parse(raw);
    return json({ name, data });
  } catch (err) {
    console.error(`[dashboard-api] parse error in ${name}:`, err);
    return json({ error: "File is not valid JSON" }, 500);
  }
}

async function handlePostFile(req: Request, name: string): Promise<Response> {
  if (!checkAuth(req)) return unauthorized();
  if (!isAllowed(name)) return badRequest(`Unknown file: ${name}`);

  const text = await req.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(`Invalid JSON: ${msg}`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return badRequest("Top-level JSON must be an object");
  }

  const fp = filePath(name);
  try {
    const out = JSON.stringify(parsed, null, 2) + "\n";
    await Bun.write(fp, out);
    console.log(`[dashboard-api] wrote ${fp} (${out.length} bytes)`);
    return json({ ok: true, name, bytes: out.length });
  } catch (err) {
    console.error(`[dashboard-api] write error for ${name}:`, err);
    return json({ error: "Failed to write file" }, 500);
  }
}

function handleHealth(): Response {
  return json({ ok: true, ts: Date.now() });
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    // Normalize trailing slash. Next.js with `trailingSlash: true` 308-redirects
    // `/api/dashboard/data` to `/api/dashboard/data/`, but the redirect is
    // issued by the Next dev server BEFORE the request reaches Caddy's
    // XTransformPort proxy rule, so the browser ends up hitting the mini-
    // service with a trailing slash that the route matchers below didn't
    // expect. Strip the trailing slash here so both forms resolve.
    let { pathname } = url;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    const method = req.method.toUpperCase();

    // Preflight — open, CORS-only
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Health — open
    if (method === "GET" && pathname === "/api/dashboard/health") {
      return handleHealth();
    }

    // All other routes under /api/dashboard require auth
    if (pathname === "/api/dashboard/data" && method === "GET") {
      return handleGetData(req);
    }

    const fileMatch = pathname.match(/^\/api\/dashboard\/file\/([^/]+)$/);
    if (fileMatch) {
      const name = decodeURIComponent(fileMatch[1]);
      if (method === "GET") return handleGetFile(req, name);
      if (method === "POST") return handlePostFile(req, name);
      return json({ error: "Method not allowed" }, 405);
    }

    // Unknown route
    return json({ error: "Not found", path: pathname }, 404);
  },
  error(err: Error): Response {
    console.error("[dashboard-api] unhandled error:", err);
    return json({ error: "Internal server error" }, 500);
  },
});

console.log(
  `[dashboard-api] listening on http://localhost:${server.port} ` +
    `(CORS: *, routes under /api/dashboard/*)`
);
console.log(
  `[dashboard-api] protected endpoints require header ` +
    `"x-dashboard-password" (default password active: ${
      PASSWORD === DEFAULT_PASSWORD ? "yes" : "no (env override)"
    })`
);
