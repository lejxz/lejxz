import * as THREE from "three";
import { getPortfolioData } from "./data-loader.js";
import { buildSceneKit, updateSceneDynamics } from "./room.js";

let scene;
let camera;
let renderer;
let sceneKit;
let portfolio = {};

const progressState = {
  target: 0,
  current: 0,
  easedSection: 0,
};

const cameraState = {
  position: new THREE.Vector3(),
  lookAt: new THREE.Vector3(),
};

const mouse = { x: 0, y: 0 };
const clock = new THREE.Clock();

async function init() {
  const loaderFill = document.getElementById("loaderFill");
  setProgress(loaderFill, 15);

  portfolio = await getSafeData();
  setProgress(loaderFill, 35);

  const canvas = document.getElementById("roomCanvas");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090c11);
  scene.fog = new THREE.Fog(0x090c11, 5.2, 10.5);

  camera = new THREE.PerspectiveCamera(53, window.innerWidth / window.innerHeight, 0.1, 60);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.9));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  setProgress(loaderFill, 55);

  setupLights(scene);
  sceneKit = buildSceneKit(scene);
  setProgress(loaderFill, 72);

  bindUI(sceneKit.sections);
  hydrateCards(sceneKit.sections, portfolio);
  setProgress(loaderFill, 100);

  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("mousemove", onMouseMove, { passive: true });

  document.getElementById("btnEnter")?.addEventListener("click", () => {
    document.getElementById("entryGate")?.classList.add("hidden");
    document.getElementById("hud")?.classList.add("visible");
    document.body.classList.add("experience-started");
  });

  setTimeout(() => {
    document.getElementById("loadingScreen")?.classList.add("fade-out");
  }, 520);

  onScroll();
  animate();
}

async function getSafeData() {
  try {
    return await getPortfolioData();
  } catch {
    return {
      profile: {
        name: "Lejuene Delantar",
        shortBio: "AI, computer vision, and spatial computing builder.",
        email: "delantarlejuene@gmail.com",
        github: "https://github.com/lejxz",
        linkedin: "https://www.linkedin.com/in/lejuene-delantar-a6bb3738b/",
      },
      focusAreas: [],
      projects: [],
      researchPapers: [],
      skills: { languages: [], ai_ml: [], tools: [] },
    };
  }
}

function setupLights(sceneRef) {
  const ambient = new THREE.AmbientLight(0xc8ced8, 0.6);
  sceneRef.add(ambient);

  const key = new THREE.DirectionalLight(0xfff4e8, 1.05);
  key.position.set(2.5, 3.8, 1.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  sceneRef.add(key);

  const fill = new THREE.PointLight(0x7ea4c8, 0.65, 8, 2);
  fill.position.set(-2.6, 2.4, 1.6);
  sceneRef.add(fill);

  const back = new THREE.PointLight(0xf0bd8d, 0.55, 8, 2);
  back.position.set(2.4, 2, -2.5);
  sceneRef.add(back);
}

function bindUI(sections) {
  const markers = document.querySelectorAll(".progress-dot");
  markers.forEach((marker, index) => {
    marker.addEventListener("click", () => {
      const denominator = sections.length - 1;
      const progress = denominator > 0 ? index / denominator : 0;
      const targetY = progress * getScrollRange();
      window.scrollTo({ top: targetY, behavior: "smooth" });
    });
  });

  const closeReference = document.getElementById("closeReference");
  closeReference?.addEventListener("click", () => {
    document.getElementById("referencePanel")?.classList.add("hidden");
  });

  const openReference = document.getElementById("openReference");
  openReference?.addEventListener("click", () => {
    document.getElementById("referencePanel")?.classList.remove("hidden");
  });
}

function hydrateCards(sections, data) {
  const cardMap = {
    intro: renderIntro(data),
    about: renderAbout(data),
    projects: renderProjects(data.projects || []),
    research: renderResearch(data.researchPapers || []),
    skills: renderSkills(data.skills || {}),
    contact: renderContact(data.profile || {}),
  };

  sections.forEach((section) => {
    const panel = document.querySelector(`[data-section-card="${section.id}"]`);
    if (panel) panel.innerHTML = cardMap[section.id] || "";
  });

  document.getElementById("storyTrack")?.style.setProperty("--story-steps", String(sections.length));
  setActiveSection(sections[0]);
}

function renderIntro(data) {
  const p = data.profile || {};
  return `
    <p class="label">Scene Setup</p>
    <h2>${escapeHtml(p.name || "Lejuene Delantar")}</h2>
    <p>${escapeHtml(p.shortBio || "Building practical AI and immersive web experiences.")}</p>
  `;
}

function renderAbout(data) {
  const p = data.profile || {};
  const links = [
    p.github ? `<a href="${safeUrl(p.github)}" target="_blank" rel="noreferrer">GitHub</a>` : "",
    p.linkedin ? `<a href="${safeUrl(p.linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>` : "",
  ].join("");

  return `
    <p class="label">About</p>
    <h2>Builder Profile</h2>
    <p>Computer science student focused on AI, computer vision, and AR/VR systems. I build interactive products that connect camera intelligence with spatial UX.</p>
    <div class="inline-links">${links}</div>
  `;
}

function renderProjects(projects) {
  const cards = projects.slice(0, 3).map((project) => `
    <article class="mini-card">
      <img src="${safeUrl(project.thumbnail)}" alt="${escapeHtml(project.title || "Project preview")}" loading="lazy" />
      <h3>${escapeHtml(project.title || "Project")}</h3>
      <p>${escapeHtml(project.description || "In-progress experiment.")}</p>
    </article>
  `).join("");

  return `
    <p class="label">Projects</p>
    <h2>Featured Work</h2>
    <div class="mini-grid">${cards || "<p>No projects listed yet.</p>"}</div>
  `;
}

function renderResearch(papers) {
  const rows = papers.slice(0, 3).map((paper) => `
    <article class="line-item">
      <strong>${escapeHtml(paper.title || "Paper")}</strong>
      <span>${escapeHtml(String(paper.year || "ongoing"))}${paper.venue ? ` - ${escapeHtml(paper.venue)}` : ""}</span>
    </article>
  `).join("");

  return `
    <p class="label">Research</p>
    <h2>Current Investigations</h2>
    <div class="line-stack">${rows || "<p>No research entries yet.</p>"}</div>
  `;
}

function renderSkills(skills) {
  const values = [...(skills.languages || []), ...(skills.ai_ml || []), ...(skills.tools || [])].slice(0, 12);
  const tags = values.map((value) => `<span>${escapeHtml(value)}</span>`).join("");

  return `
    <p class="label">Skills</p>
    <h2>Tech Stack</h2>
    <div class="pill-list">${tags || "<span>Adding soon</span>"}</div>
  `;
}

function renderContact(profile) {
  const email = profile.email || "delantarlejuene@gmail.com";
  return `
    <p class="label">Contact</p>
    <h2>Let's Build Together</h2>
    <p>Open to AI, AR/VR, and computer vision collaborations. Send a message and let's discuss the build.</p>
    <div class="inline-links">
      <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
    </div>
  `;
}

function onScroll() {
  const range = getScrollRange();
  const y = Math.max(0, Math.min(range, window.scrollY));
  progressState.target = range > 0 ? y / range : 0;
}

function onMouseMove(event) {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  mouse.x = (event.clientX / width) * 2 - 1;
  mouse.y = (event.clientY / height) * 2 - 1;
}

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.elapsedTime;

  progressState.current = THREE.MathUtils.lerp(progressState.current, progressState.target, 1 - Math.pow(0.0001, dt));

  const sections = sceneKit.sections;
  const scaled = progressState.current * (sections.length - 1);
  const index = Math.floor(scaled);
  const nextIndex = Math.min(sections.length - 1, index + 1);
  const t = scaled - index;

  const current = sections[index];
  const next = sections[nextIndex];

  cameraState.position.lerpVectors(current.position, next.position, easeInOut(t));
  cameraState.lookAt.lerpVectors(current.target, next.target, easeInOut(t));

  const parallax = 0.08;
  camera.position.set(
    cameraState.position.x + mouse.x * parallax,
    cameraState.position.y + mouse.y * 0.04,
    cameraState.position.z
  );
  camera.lookAt(cameraState.lookAt);

  progressState.easedSection = THREE.MathUtils.lerp(progressState.easedSection, scaled, 0.1);
  const activeIndex = Math.round(progressState.easedSection);
  setActiveSection(sections[activeIndex]);

  updateSceneDynamics(sceneKit.dynamic, elapsed);
  renderer.render(scene, camera);
}

function setActiveSection(section) {
  if (!section) return;

  document.querySelectorAll(".story-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.sectionCard === section.id);
  });

  document.querySelectorAll(".progress-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === section.index);
  });

  const title = document.getElementById("sectionTitle");
  const subtitle = document.getElementById("sectionSubtitle");
  const count = document.getElementById("sectionCount");

  if (title) title.textContent = section.id.toUpperCase();
  if (subtitle) subtitle.textContent = section.subtitle;
  if (count) count.textContent = `${String(section.index + 1).padStart(2, "0")}/${String(sceneKit.sections.length).padStart(2, "0")}`;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setProgress(loaderFill, value) {
  if (loaderFill) loaderFill.style.width = `${value}%`;
}

function getScrollRange() {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

function safeUrl(url) {
  if (!url) return "#";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:" || parsed.protocol === "mailto:") {
      return parsed.href;
    }
  } catch {
    return "#";
  }
  return "#";
}

function escapeHtml(value) {
  const el = document.createElement("span");
  el.textContent = value || "";
  return el.innerHTML;
}

function easeInOut(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

init();
