# INSTALL.md — lejxz Portfolio

A static portfolio website built with vanilla HTML5, CSS3, and JavaScript.  
No build step is required — open `index.html` directly or serve it with any static file server.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Modern browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| (Optional) Static server | Any — see options below |

No Node.js, bundlers, or package managers are required.  
All third-party libraries load from CDN at runtime:

- **Three.js r134** — 3D particle background
- **Font Awesome 6** — icons
- **Google Fonts** — JetBrains Mono + Inter

---

## Quick Start (no server needed)

```bash
# 1. Clone the repository
git clone https://github.com/lejxz/lejxz.git
cd lejxz

# 2. Open directly in your browser
open index.html       # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

> **Note:** Some browsers block `fetch()` requests to local files (`file://` protocol).  
> If the project cards or skills fail to load, use a local server instead (see below).

---

## Local Development Server

### Option A — Python (built-in, recommended)

```bash
# Python 3
python3 -m http.server 8080
# Visit http://localhost:8080
```

### Option B — Node.js `serve`

```bash
npx serve .
# Prints the local URL (usually http://localhost:3000)
```

### Option C — VS Code Live Server Extension

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension,  
right-click `index.html` → **Open with Live Server**.

---

## Project Structure

```
lejxz/
├── index.html                 # Single-page application entry point
├── INSTALL.md                 # This file
├── README.md                  # Project README (do not modify)
│
└── assets/
    ├── css/
    │   └── main.css           # Design tokens, layout, components, animations
    │
    ├── js/
    │   ├── three-bg.js        # Three.js particle-field hero background
    │   ├── projects.js        # Data-driven rendering from portfolio.json
    │   └── main.js            # Nav, typewriter, scroll-reveal, contact form
    │
    └── data/
        └── portfolio.json     # Mock data (do not modify)
```

---

## Customisation

### Adding or editing content

All dynamic content (projects, research papers, skills, focus areas) is driven by  
**`assets/data/portfolio.json`** — edit that file to update what appears on the site.

### Colours

Design tokens are defined as CSS custom properties at the top of `assets/css/main.css`:

```css
:root {
  --clr-purple-bright: #B660EB;
  --clr-purple-deep:   #7800BF;
  /* … */
}
```

Changing these two variables will propagate the new palette across the entire site.

### Adding sections

1. Add a new `<section id="…">` block in `index.html`.
2. Add a corresponding nav link in the `<nav>` element.
3. Style in `assets/css/main.css` following the existing pattern.
4. Wire up any data fetching in `assets/js/projects.js`.

---

## Deployment

This is a fully static site — no backend required.

### GitHub Pages (recommended for this repo)

The repository already includes a GitHub Actions workflow (`.github/workflows/jekyll-gh-pages.yml`).  
Push to the default branch and GitHub Pages will publish the site automatically.

### Manual static hosting

Upload all files to any static host:

- [Netlify](https://netlify.com) — drag & drop the folder
- [Vercel](https://vercel.com) — `vercel --prod`
- [Cloudflare Pages](https://pages.cloudflare.com)
- Any web server serving static files (nginx, Apache, Caddy, etc.)

---

## Performance Notes

- Assets are loaded lazily (`loading="lazy"` on images).
- Three.js animation pauses automatically when the browser tab is hidden.
- CSS `prefers-reduced-motion` disables all transitions/animations for users who prefer it.
- The particle count is capped at 700 — reduce `PARTICLE_COUNT` in `three-bg.js` for lower-end devices.

---

## Browser Compatibility

| Feature | Requirement |
|---|---|
| CSS Custom Properties | All modern browsers |
| `IntersectionObserver` | Chrome 51+, Firefox 55+, Safari 12.1+ |
| `fetch()` | All modern browsers |
| `requestAnimationFrame` | All modern browsers |
| Three.js WebGL | Any browser with WebGL 1.0 support |

---

*See [README.md](README.md) for project overview and connect links.*
