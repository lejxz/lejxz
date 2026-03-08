/*  ui.js — Overlay panel system for 3D portfolio  */

let currentPanel = null;
let carouselIndex = 0;

/* ── Sanitize text for safe innerHTML insertion ────────── */
function esc(str) {
  const el = document.createElement("span");
  el.textContent = str || "";
  return el.innerHTML;
}

function safeUrl(url) {
  if (!url) return "#";
  try {
    const u = new URL(url);
    if (u.protocol === "https:" || u.protocol === "http:") return u.href;
  } catch { /* ignore */ }
  return "#";
}

/* ── Show Detail Panel ────────────────────────────────── */
export function showPanel(type, data) {
  const panel = document.getElementById("detailPanel");
  const content = document.getElementById("panelContent");
  if (!panel || !content) return;

  let html = "";
  carouselIndex = 0;

  switch (type) {
    case "about":
      html = renderAbout(data);
      break;
    case "projects":
      html = renderCarousel("Featured Projects", "projects", data.projects || []);
      break;
    case "research":
      html = renderCarousel("Research Papers", "research", data.researchPapers || []);
      break;
    case "skills":
      html = renderSkills(data.skills || {});
      break;
    case "contact":
      html = renderContact(data.profile || {});
      break;
    case "focus":
      html = renderFocus(data.focusAreas || []);
      break;
    default:
      return;
  }

  content.innerHTML = html;
  panel.classList.remove("hidden");
  currentPanel = type;

  // wire carousel buttons
  wireCarousel(content);

  document.exitPointerLock?.();
}

export function hidePanel() {
  const panel = document.getElementById("detailPanel");
  if (panel) panel.classList.add("hidden");
  currentPanel = null;
}

export function isPanelOpen() {
  return currentPanel !== null;
}

export function setupPanelListeners() {
  document.getElementById("closeDetail")?.addEventListener("click", hidePanel);
  document.getElementById("closeHelp")?.addEventListener("click", () => {
    document.getElementById("helpPanel")?.classList.add("hidden");
  });
  document.getElementById("btnHelp")?.addEventListener("click", () => {
    document.getElementById("helpPanel")?.classList.toggle("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hidePanel();
      document.getElementById("helpPanel")?.classList.add("hidden");
    }
  });
}

/* ── Renderers ───────────────────────────────────────── */
function renderAbout(data) {
  const p = data.profile || {};
  return `
    <p class="detail-eyebrow">PROFILE</p>
    <h2 class="detail-title">${esc(p.name)}</h2>
    <div class="detail-body">
      <p>${esc(p.shortBio)}</p>
      <p style="margin-top:12px">I am double-majoring in Artificial Intelligence and Cybersecurity. My work explores real-time object detection, AR overlays, and practical machine learning systems that bridge digital and physical spaces.</p>
      <div class="contact-info" style="margin-top:20px">
        <a href="${safeUrl(p.github)}" target="_blank" rel="noreferrer">GitHub</a>
        <a href="${safeUrl(p.linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </div>
  `;
}

function renderCarousel(title, type, items) {
  const eyebrow = type === "projects" ? "FEATURED WORK" : "RESEARCH";
  const cards = items.map((item, i) => {
    const thumb = safeUrl(item.thumbnail);
    const tags = (item.tags || []).map(t => `<span class="carousel-tag">${esc(t)}</span>`).join("");
    const link1 = type === "projects"
      ? `<a class="carousel-link" href="${safeUrl(item.repo)}" target="_blank" rel="noreferrer">Repository</a>`
      : `<a class="carousel-link" href="${safeUrl(item.paperUrl)}" target="_blank" rel="noreferrer">Paper</a>`;
    const link2Url = type === "projects" ? item.demo : (item.demoUrl || item.paperUrl);
    const link2 = `<a class="carousel-link" href="${safeUrl(link2Url)}" target="_blank" rel="noreferrer">Demo</a>`;

    const meta = type === "research" && item.venue
      ? `<p style="font-size:0.75rem;color:var(--accent);margin-bottom:6px">${esc(item.venue)} &bull; ${esc(String(item.year))}</p>` : "";

    return `
      <div class="carousel-card">
        <img src="${thumb}" alt="${esc(item.title)} preview" loading="lazy" />
        <h3>${esc(item.title)}</h3>
        ${meta}
        <p>${esc(item.description || item.abstract)}</p>
        <div class="carousel-tags">${tags}</div>
        <div class="carousel-links">${link1}${link2}</div>
      </div>
    `;
  }).join("");

  return `
    <p class="detail-eyebrow">${eyebrow}</p>
    <h2 class="detail-title">${esc(title)}</h2>
    <div class="carousel-wrapper">
      <div class="carousel-track" id="carouselTrack">${cards}</div>
    </div>
    <div class="carousel-nav">
      <button class="carousel-btn" id="carouselPrev">&larr;</button>
      <button class="carousel-btn" id="carouselNext">&rarr;</button>
    </div>
  `;
}

function renderSkills(skills) {
  const sections = [
    { title: "Languages", items: skills.languages || [] },
    { title: "AI / ML", items: skills.ai_ml || [] },
    { title: "Tools", items: skills.tools || [] },
  ];

  const html = sections.map(s => `
    <div class="skills-section">
      <h3>${esc(s.title)}</h3>
      <div class="skills-pills">
        ${s.items.map(sk => `<span class="skill-pill">${esc(sk)}</span>`).join("")}
      </div>
    </div>
  `).join("");

  return `
    <p class="detail-eyebrow">TOOLKIT</p>
    <h2 class="detail-title">Languages &amp; Technologies</h2>
    ${html}
  `;
}

function renderContact(profile) {
  return `
    <p class="detail-eyebrow">CONTACT</p>
    <h2 class="detail-title">Let's Build Something</h2>
    <div class="detail-body">
      <p>Interested in AI, computer vision, or AR/VR collaboration? Reach out and I'll reply as soon as I can.</p>
      <div class="contact-info">
        <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
        <a href="${safeUrl(profile.github)}" target="_blank" rel="noreferrer">GitHub</a>
        <a href="${safeUrl(profile.linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </div>
  `;
}

function renderFocus(areas) {
  const cards = areas.map(a => `
    <div class="focus-card-panel">
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.description)}</p>
    </div>
  `).join("");

  return `
    <p class="detail-eyebrow">CURRENT FOCUS</p>
    <h2 class="detail-title">What I'm Building &amp; Studying</h2>
    <div class="focus-grid-panel">${cards}</div>
  `;
}

/* ── Carousel wiring ─────────────────────────────────── */
function wireCarousel(container) {
  const track = container.querySelector("#carouselTrack");
  const prev = container.querySelector("#carouselPrev");
  const next = container.querySelector("#carouselNext");
  if (!track || !prev || !next) return;

  const cards = track.querySelectorAll(".carousel-card");
  if (!cards.length) return;

  const updatePos = () => {
    const cardW = cards[0].offsetWidth + 20; // gap
    track.style.transform = `translateX(-${carouselIndex * cardW}px)`;
  };

  prev.addEventListener("click", () => {
    carouselIndex = Math.max(0, carouselIndex - 1);
    updatePos();
  });
  next.addEventListener("click", () => {
    carouselIndex = Math.min(cards.length - 1, carouselIndex + 1);
    updatePos();
  });

  updatePos();
}

/* ── HUD functions ───────────────────────────────────── */
export function showPrompt(text) {
  const el = document.getElementById("interactPrompt");
  if (!el) return;
  el.textContent = text;
  el.classList.add("show");
}

export function hidePrompt() {
  const el = document.getElementById("interactPrompt");
  if (el) el.classList.remove("show");
}

export function updateMinimap(px, pz, roomW, roomD) {
  const player = document.getElementById("minimapPlayer");
  if (!player) return;
  const x = ((px + roomW / 2) / roomW) * 100;
  const y = ((pz + roomD / 2) / roomD) * 100;
  player.style.left = `${Math.max(5, Math.min(95, x))}%`;
  player.style.top = `${Math.max(5, Math.min(95, y))}%`;
}
