# lejxz.dev

Interactive portfolio for Lejuene Delantar (lejxz). Built with Next.js 16, Framer Motion, and Tailwind CSS 4. Static-exported and deployed to GitHub Pages.

## Stack

- Next.js 16 (App Router, static export)
- Framer Motion (parallax, reveals, modals, layout animations)
- Tailwind CSS 4 + shadcn/ui (New York)
- Space Mono / Inter
- Canvas 2D neural-network background

## Features

- Single-page portfolio with anchor navigation + sticky navbar
- Animated hero with a 4-layer parallax diorama
- Seamless left-to-right rolling tech ticker
- Skills section with interactive proficiency bars + radial gauge
- Experience timeline with filterable cards → detail modals
- Projects grid with spotlight, search, category filters → case-study modals (prev/next, gallery, deep-links)
- Command palette (⌘K / `/`) searching sections, projects, experience, and links
- Contact section with a no-backend mailto form
- Hidden admin dashboard to edit all content without touching code

## Edit content

All copy lives in `src/data/` as JSON. Two ways to edit:

### 1. Dashboard (recommended)

A built-in editor at `/dashboard/` (linked from the `©` year in the footer).

```bash
# terminal 1 — the portfolio
bun install
bun run dev

# terminal 2 — the dashboard backend (writes to src/data/*.json)
cd mini-services/dashboard-api
bun install
bun run dev          # http://localhost:3030
```

Then open `http://localhost:3000/dashboard/` and unlock with the password
(default `lejxz-edit-2026`, override with the `DASHBOARD_PASSWORD` env var).
Edit any file's JSON, hit **Save**, and the dev server hot-reloads the new
content. Commit and push to publish.

> The dashboard backend only runs locally. On the deployed GitHub Pages site
> the dashboard is read-only (the data is baked into the static export).

### 2. By hand

| File | Controls |
| --- | --- |
| `src/data/profile.json` | Name, role, bio, stats, socials, tagline |
| `src/data/marquee.json` | Endless scrolling tech-stack band |
| `src/data/skills.json` | Skill groups, levels, gauge, tech marquee |
| `src/data/experience.json` | Timeline entries (work / education / research / award) |
| `src/data/projects.json` | Projects (featured flag controls spotlight) |
| `src/data/now.json` | "Currently" cards |
| `src/data/footer.json` | Footer note + link columns |
| `src/data/site.json` | Site-wide nav + footer meta |

## Edit assets

Replace files in `public/assets/`:

- `mark.svg` — navbar / favicon mark
- `logo.svg` — full lockup
- `favicon.svg` — browser tab icon
- `og.svg` — social share image
- `avatar.svg` — about-section avatar
- `projects/*.png` — project cover images
- `experiences/*.svg` — experience logos

## Develop

```bash
bun install
bun run dev      # http://localhost:3000
bun run lint
```

## Deploy to GitHub Pages

The included workflow (`.github/workflows/deploy.yml`) builds with
`BASE_PATH=/lejxz` and publishes `out/` on every push to `main`.

One-time setup:

1. Push this repo to `github.com/lejxz/lejxz`.
2. Settings → Pages → Source: **GitHub Actions**.
3. Push to `main`. The site deploys to `https://lejxz.github.io/lejxz/`.

> `BASE_PATH` matches the repo name. For a `<user>.github.io` root deploy,
> remove the `BASE_PATH` env in the workflow.
