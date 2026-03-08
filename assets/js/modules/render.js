import { fallbackImage, formatToken, uniqueTagCount } from "./utils.js";

export function renderHero(els, profile, projects, papers) {
  els.heroName.textContent = profile.name;
  els.heroHeadline.textContent = profile.headline;
  els.heroBio.textContent = profile.shortBio;

  const links = [
    { href: profile.github, label: "GitHub", className: "btn primary" },
    { href: profile.linkedin, label: "LinkedIn", className: "btn" },
    { href: `mailto:${profile.email}`, label: "Email", className: "btn" }
  ];

  els.heroActions.innerHTML = links
    .map(
      (link) =>
        `<a class="${link.className}" href="${link.href}" target="_blank" rel="noreferrer">${link.label}</a>`
    )
    .join("");

  const highlights = [
    "Building at the intersection of AI and real-time vision.",
    "Exploring secure and scalable machine learning systems.",
    "Focused on hireable impact: practical, deployable prototypes."
  ];

  els.heroHighlights.innerHTML = highlights.map((item) => `<li>${item}</li>`).join("");

  const impact = [
    { value: `${projects.length}+`, label: "Projects" },
    { value: `${papers.length}+`, label: "Research tracks" },
    { value: `${uniqueTagCount(projects)}+`, label: "Technical keywords" }
  ];

  els.impactStrip.innerHTML = impact
    .map((item) => `<div class="impact-item"><strong>${item.value}</strong><span>${item.label}</span></div>`)
    .join("");
}

export function renderFocus(els, items) {
  els.focusGrid.innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </article>
    `
    )
    .join("");
}

export function renderProjectFilters(els, projects, activeCategory) {
  const categories = new Set(["all"]);
  projects.forEach((project) => project.category.forEach((category) => categories.add(category)));

  els.projectFilters.innerHTML = [...categories]
    .map((category) => {
      const isActive = category === activeCategory;
      return `<button class="chip ${isActive ? "active" : ""}" data-category="${category}" role="tab" aria-selected="${String(isActive)}">${formatToken(category)}</button>`;
    })
    .join("");
}

export function renderProjects(els, projects, activeCategory, onOpenDetails) {
  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category.includes(activeCategory));

  if (filteredProjects.length === 0) {
    els.projectsGrid.innerHTML = '<p class="empty-state">No projects match this category yet.</p>';
    els.projectResultsMeta.textContent = "0 projects shown";
    return;
  }

  els.projectResultsMeta.textContent = `${filteredProjects.length} project${filteredProjects.length > 1 ? "s" : ""} shown`;

  els.projectsGrid.innerHTML = filteredProjects
    .map(
      (project, index) => `
      <article class="card project-card">
        <img src="${project.thumbnail}" alt="${project.title} preview" loading="lazy" decoding="async" />
        <div class="project-content">
          <div class="meta-row">
            <h3>${project.title}</h3>
            <span class="status-pill">${formatToken(project.status)}</span>
          </div>
          <p>${project.plainSummary}</p>
          <div class="tags">${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
          <div class="hero-actions">
            <a class="btn" href="${project.repo}" target="_blank" rel="noreferrer">Repository</a>
            <a class="btn" href="${project.demo}" target="_blank" rel="noreferrer">Demo</a>
            <button class="btn" type="button" data-open-index="${index}">View details</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  els.projectsGrid.querySelectorAll("img").forEach((img) => img.addEventListener("error", fallbackImage));
  els.projectsGrid.querySelectorAll("button[data-open-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.openIndex);
      onOpenDetails(filteredProjects[index]);
    });
  });
}

export function renderResearch(els, papers) {
  els.researchList.innerHTML = papers
    .map(
      (paper) => `
      <details class="research-item">
        <summary>${paper.title} <span class="tag">${paper.venue} ${paper.year}</span></summary>
        <p>${paper.abstract}</p>
        <div class="tags">${paper.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        <div class="hero-actions">
          <a class="btn" href="${paper.paperUrl}" target="_blank" rel="noreferrer">Paper</a>
          <a class="btn" href="${paper.demoUrl}" target="_blank" rel="noreferrer">Demo</a>
        </div>
      </details>
    `
    )
    .join("");
}

export function renderSkills(els, skills) {
  const groups = [
    { title: "Languages", list: skills.languages },
    { title: "AI / ML", list: skills.ai_ml },
    { title: "Tools", list: skills.tools }
  ];

  els.skillsGrid.innerHTML = groups
    .map(
      (group) => `
      <article class="card skill-block">
        <h3>${group.title}</h3>
        <div class="skill-list">
          ${group.list.map((item) => `<span class="chip">${item}</span>`).join("")}
        </div>
      </article>
    `
    )
    .join("");
}

export function renderContact(els, profile) {
  const actions = [
    { href: `mailto:${profile.email}`, label: "Email" },
    { href: profile.linkedin, label: "LinkedIn" },
    { href: profile.github, label: "GitHub" }
  ];

  els.contactActions.innerHTML = actions
    .map(
      (item, index) =>
        `<a class="btn ${index === 0 ? "primary" : ""}" href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a>`
    )
    .join("");
}

export function renderProjectModal(els, project) {
  els.modalContent.innerHTML = `
    <div class="modal-content-grid">
      <img src="${project.thumbnail}" alt="${project.title} image" loading="lazy" decoding="async" />
      <div>
        <h3>${project.title}</h3>
        <p><strong>Problem:</strong> ${project.problem}</p>
        <p><strong>Solution:</strong> ${project.solution}</p>
        <p>${project.description}</p>
        <div class="tags">${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
    </div>
  `;

  const modalImage = els.modalContent.querySelector("img");
  if (modalImage) {
    modalImage.addEventListener("error", fallbackImage);
  }
}
