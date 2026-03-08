import { getPortfolioData } from "./data-loader.js";
import {
  setupMobileMenu,
  setupSectionReveal,
  setupCounterAnimation,
  setupContactForm,
  updateYear
} from "./ui.js";

function renderFocusAreas(focusAreas) {
  const grid = document.getElementById("focusGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = (focusAreas || [])
    .map(
      (item) => `
        <article class="focus-card">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
}

function renderProjects(projects) {
  const grid = document.getElementById("projectGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = (projects || [])
    .map(
      (project) => `
        <article class="project-card" data-categories="${project.category.join(" ")}">
          <div class="project-thumb" aria-hidden="true"></div>
          <h3>${project.title}</h3>
          <p class="section-copy">${project.description}</p>
          <div class="summary-grid">
            <div class="summary-row">
              <h4>Problem</h4>
              <p>${project.problem || "Problem statement coming soon."}</p>
            </div>
            <div class="summary-row">
              <h4>Solution</h4>
              <p>${project.solution || "Solution summary coming soon."}</p>
            </div>
            <div class="summary-row">
              <h4>Impact</h4>
              <p>${project.impact || "Impact summary coming soon."}</p>
            </div>
          </div>
          ${renderMetrics(project.metrics || [])}
          <p class="plain-note">${project.plainSummary || "Plain-language summary will be added."}</p>
          <div class="tags">
            ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <div class="links">
            <a href="${project.repo}" target="_blank" rel="noreferrer">Repository</a>
            <a href="${project.demo}" target="_blank" rel="noreferrer">Demo</a>
          </div>
        </article>
      `
    )
    .join("");
}

function renderResearchPapers(papers) {
  const grid = document.getElementById("researchGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = (papers || [])
    .map(
      (paper) => `
        <article class="research-card">
          <div class="research-thumb" aria-hidden="true"></div>
          <h3>${paper.title}</h3>
          <p class="research-meta">${paper.venue} • ${paper.year}</p>
          <p class="section-copy">${paper.abstract}</p>
          <div class="summary-grid">
            <div class="summary-row">
              <h4>Problem</h4>
              <p>${paper.problem || "Problem statement coming soon."}</p>
            </div>
            <div class="summary-row">
              <h4>Solution</h4>
              <p>${paper.solution || "Solution summary coming soon."}</p>
            </div>
            <div class="summary-row">
              <h4>Impact</h4>
              <p>${paper.impact || "Impact summary coming soon."}</p>
            </div>
          </div>
          ${renderMetrics(paper.metrics || [])}
          <p class="plain-note">${paper.plainSummary || "Plain-language summary will be added."}</p>
          <div class="tags">
            ${(paper.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <div class="links">
            <a href="${paper.paperUrl}" target="_blank" rel="noreferrer">Paper</a>
            <a href="${paper.codeUrl}" target="_blank" rel="noreferrer">Code</a>
          </div>
        </article>
      `
    )
    .join("");
}

function renderSkills(skills) {
  const groups = document.getElementById("skillGroups");
  if (!groups) {
    return;
  }

  const sections = [
    { title: "Languages", items: skills.languages || [] },
    { title: "AI / ML", items: skills.ai_ml || [] },
    { title: "Tools", items: skills.tools || [] }
  ];

  groups.innerHTML = sections
    .map(
      (section) => `
        <article class="skill-group">
          <h3>${section.title}</h3>
          <div class="skill-list">
            ${section.items.map((skill) => `<span class="skill-pill">${skill}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderMetrics(metrics) {
  if (!metrics.length) {
    return "";
  }

  return `
    <div class="metrics" aria-label="Outcome metrics">
      ${metrics
        .map((metric) => {
          const boundedProgress = Math.min(100, Math.max(0, Number(metric.progress || 0)));
          return `
            <div class="metric-item">
              <div class="metric-label">
                <span>${metric.label}</span>
                <strong>${metric.value}</strong>
              </div>
              <div class="metric-track" role="presentation">
                <div class="metric-fill" style="width: ${boundedProgress}%;"></div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function updateStats(data) {
  const projectCount = (data.projects || []).length;
  const paperCount = (data.researchPapers || []).length;
  const activeProjectTracks = (data.projects || []).filter(
    (project) => project.status === "active-research"
  ).length;
  const activePaperTracks = (data.researchPapers || []).filter(
    (paper) => paper.status === "active-research"
  ).length;

  const stats = {
    statProjects: projectCount,
    statPapers: paperCount,
    statResearchTracks: activeProjectTracks + activePaperTracks
  };

  Object.entries(stats).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.dataset.target = String(value);
      element.textContent = "0";
    }
  });
}

function setupProjectFilters() {
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".project-card"));

  if (!chips.length || !cards.length) {
    return;
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");

      const filter = chip.dataset.filter;
      cards.forEach((card) => {
        const categories = card.dataset.categories || "";
        const show = filter === "all" || categories.includes(filter);
        card.style.display = show ? "grid" : "none";
      });
    });
  });
}

async function init() {
  setupMobileMenu();
  setupSectionReveal();
  setupContactForm();
  updateYear();

  try {
    const data = await getPortfolioData();
    renderFocusAreas(data.focusAreas || []);
    renderProjects(data.projects || []);
    renderResearchPapers(data.researchPapers || []);
    renderSkills(data.skills || {});
    updateStats(data);
    setupCounterAnimation();
    setupProjectFilters();
  } catch (error) {
    const grid = document.getElementById("projectGrid");
    if (grid) {
      grid.innerHTML = "<p>Could not load projects. Please refresh the page.</p>";
    }
    console.error(error);
  }
}

init();
