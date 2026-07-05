# lejxz.dev

Interactive portfolio for Lejuene Delantar (lejxz). Built with Next.js 16, React Three Fiber, and Tailwind CSS 4. Static-exported and deployed to GitHub Pages.

## Stack

- Next.js 16 (App Router, static export)
- React Three Fiber + Three.js (3D background)
- Framer Motion (parallax, reveals, magnetic interactions)
- Tailwind CSS 4 + shadcn/ui (New York)
- Space Mono / Inter

## Edit content

All copy lives in `src/data/` as JSON. No need to touch components.

| File | Controls |
| --- | --- |
| `src/data/profile.json` | Name, role, bio, stats, socials, tagline |
| `src/data/marquee.json` | Endless scrolling tech-stack band (rows, direction, speed, items) |
| `src/data/skills.json` | Skill groups + proficiency levels |
| `src/data/experience.json` | Timeline entries |
| `src/data/projects.json` | Projects (featured flag controls home grid) |

## Edit assets

Replace files in `public/assets/`:

- `mark.svg` — navbar / favicon mark
- `logo.svg` — full lockup
- `favicon.svg` — browser tab icon
- `og.svg` — social share image

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
