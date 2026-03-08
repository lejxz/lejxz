import { STATUS_TEXT } from "./config.js";
import { escapeAttribute, escapeHtml } from "./utils.js";

export function renderProfile(profile, el) {
  el.heroName.textContent = profile.name;
  el.heroHeadline.textContent = profile.headline;
  el.heroBio.textContent = profile.shortBio;
  el.githubLink.href = profile.github;
  el.linkedinLink.href = profile.linkedin;
  el.emailLink.href = profile.email ? `mailto:${profile.email}` : "#";
}

export function renderFocusAreas(focusAreas, focusGrid) {
  focusGrid.innerHTML = focusAreas
    .map(
      (item) => `
      <article class="panel-card">
        <h3>${escapeHtml(item.title || "Focus")}</h3>
        <p>${escapeHtml(item.description || "")}</p>
      </article>
    `
    )
    .join("");
}

export function renderResearch(researchPapers, researchGrid) {
  researchGrid.innerHTML = researchPapers
    .map((paper) => renderContentCard(paper, "paper"))
    .join("");
}

export function renderProjectFilters(projects, state, projectFilters, onFilterChange) {
  if (!projectFilters) {
    return;
  }

  const categories = new Set(["all"]);
  projects.forEach((project) => {
    project.category.forEach((category) => categories.add(category));
  });

  projectFilters.innerHTML = Array.from(categories)
    .map((category) => {
      const label = category === "all" ? "All" : category.toUpperCase();
      const isActive = category === state.selectedCategory;
      return `<button type="button" class="filter-btn${isActive ? " active" : ""}" data-filter="${escapeAttribute(category)}" aria-pressed="${isActive}">${escapeHtml(label)}</button>`;
    })
    .join("");

  projectFilters.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      onFilterChange(button.dataset.filter || "all");
    });
  });
}

export function renderProjectGrid(projects, selectedCategory, projectGrid) {
  const filtered = selectedCategory === "all"
    ? projects
    : projects.filter((project) => project.category.includes(selectedCategory));

  if (!filtered.length) {
    projectGrid.innerHTML = '<article class="panel-card"><h3>No projects in this category yet</h3><p>Try another filter or add more project entries in portfolio data.</p></article>';
    return;
  }

  projectGrid.innerHTML = filtered
    .map((project) => renderContentCard(project, "project"))
    .join("");
}

function renderContentCard(item, type) {
  const title = escapeHtml(item.title || (type === "paper" ? "Research" : "Project"));
  const description = escapeHtml(item.description || item.abstract || item.plainSummary || "");
  const thumbnail = item.thumbnail || "";
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const normalizedStatus = item.status || "in-progress";
  const status = escapeHtml(STATUS_TEXT[normalizedStatus] || normalizedStatus);
  const venue = type === "paper" ? escapeHtml(item.venue || "Research Venue") : "";
  const year = type === "paper" && item.year ? ` (${item.year})` : "";
  const repo = item.repo || item.paperUrl || "#";
  const demo = item.demo || item.demoUrl || repo;

  const tagMarkup = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

  return `
    <article class="panel-card">
      ${thumbnail ? `<img class="thumb" src="${escapeAttribute(thumbnail)}" alt="${title}" loading="lazy" />` : ""}
      <h3>${title}</h3>
      <p>${description}</p>
      <div class="tag-list">${tagMarkup}</div>
      <p class="meta">${status}${venue ? ` | ${venue}${year}` : ""}</p>
      <div class="links">
        <a href="${escapeAttribute(repo)}" target="_blank" rel="noreferrer">Source</a>
        <a href="${escapeAttribute(demo)}" target="_blank" rel="noreferrer">Demo</a>
      </div>
    </article>
  `;
}
