import { escapeHTML, formatToken } from "./utils.js";

export function renderHero(profile, elements) {
  elements.heroName.textContent = profile.name;
  elements.heroHeadline.textContent = profile.headline;
  elements.heroBio.textContent = profile.shortBio;

  const links = [
    { href: profile.github, label: "GitHub", className: "btn primary" },
    { href: profile.linkedin, label: "LinkedIn", className: "btn" },
    { href: `mailto:${profile.email}`, label: "Email", className: "btn" }
  ];

  elements.heroActions.innerHTML = links
    .map(
      (link) =>
        `<a class="${link.className}" href="${escapeHTML(link.href)}" target="_blank" rel="noreferrer">${link.label}</a>`
    )
    .join("");

  const highlights = [
    "Building at the intersection of AI and real-time vision.",
    "Exploring secure and scalable machine learning systems.",
    "Focused on hireable impact: practical, deployable prototypes."
  ];

  elements.heroHighlights.innerHTML = highlights
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("");
}

export function renderImpact(data, elements) {
  elements.projectCount.textContent = String(data.projects.length);
  elements.researchCount.textContent = String(data.researchPapers.length);
  elements.focusCount.textContent = String(data.focusAreas.length);

  const metricItems = [
    "Research-first approach with practical deployment goals",
    "Computer vision and AR/VR specialization",
    "Strong foundation in secure AI and systems thinking"
  ];

  elements.heroMetrics.innerHTML = metricItems
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("");
}

export function renderFocus(items, elements) {
  elements.focusGrid.innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
      </article>
    `
    )
    .join("");
}

export function getProjectCategories(projects) {
  const categories = new Set(["all"]);
  projects.forEach((project) => {
    project.category.forEach((category) => categories.add(category));
  });
  return [...categories];
}

export function renderProjectFilters(categories, activeCategory, elements) {
  elements.projectFilters.innerHTML = categories
    .map(
      (category) =>
        `<button type="button" class="chip ${category === activeCategory ? "active" : ""}" data-category="${escapeHTML(category)}">${escapeHTML(formatToken(category))}</button>`
    )
    .join("");
}

export function renderProjects(projects, activeCategory, elements) {
  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category.includes(activeCategory));

  elements.projectsGrid.innerHTML = filteredProjects
    .map(
      (project, index) => `
      <article class="card project-card" data-project-index="${index}" role="button" tabindex="0" aria-label="Open details for ${escapeHTML(project.title)}">
        <img src="${escapeHTML(project.thumbnail)}" alt="${escapeHTML(project.title)} preview" loading="lazy" decoding="async" />
        <div class="project-content">
          <div class="meta-row">
            <h3>${escapeHTML(project.title)}</h3>
            <span class="status-pill">${escapeHTML(formatToken(project.status))}</span>
          </div>
          <p>${escapeHTML(project.plainSummary)}</p>
          <div class="tags">${project.tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
          <div class="hero-actions">
            <a class="btn" href="${escapeHTML(project.repo)}" target="_blank" rel="noreferrer">Repository</a>
            <a class="btn" href="${escapeHTML(project.demo)}" target="_blank" rel="noreferrer">Demo</a>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  return filteredProjects;
}

export function renderResearch(papers, elements) {
  elements.researchList.innerHTML = papers
    .map(
      (paper) => `
      <details class="research-item">
        <summary>${escapeHTML(paper.title)} <span class="tag">${escapeHTML(paper.venue)} ${escapeHTML(paper.year)}</span></summary>
        <p>${escapeHTML(paper.abstract)}</p>
        <div class="tags">${paper.tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
        <div class="hero-actions">
          <a class="btn" href="${escapeHTML(paper.paperUrl)}" target="_blank" rel="noreferrer">Paper</a>
          <a class="btn" href="${escapeHTML(paper.demoUrl)}" target="_blank" rel="noreferrer">Demo</a>
        </div>
      </details>
    `
    )
    .join("");
}

export function renderSkills(skills, elements) {
  const groups = [
    { title: "Languages", list: skills.languages },
    { title: "AI / ML", list: skills.ai_ml },
    { title: "Tools", list: skills.tools }
  ];

  elements.skillsGrid.innerHTML = groups
    .map(
      (group) => `
      <article class="card skill-block">
        <h3>${escapeHTML(group.title)}</h3>
        <div class="skill-list">
          ${group.list.map((item) => `<span class="chip">${escapeHTML(item)}</span>`).join("")}
        </div>
      </article>
    `
    )
    .join("");
}

export function renderContact(profile, elements) {
  const actions = [
    { href: `mailto:${profile.email}`, label: "Email" },
    { href: profile.linkedin, label: "LinkedIn" },
    { href: profile.github, label: "GitHub" }
  ];

  elements.contactActions.innerHTML = actions
    .map(
      (item, index) =>
        `<a class="btn ${index === 0 ? "primary" : ""}" href="${escapeHTML(item.href)}" target="_blank" rel="noreferrer">${item.label}</a>`
    )
    .join("");
}

export function renderModal(project, elements) {
  elements.modalContent.innerHTML = `
    <div class="modal-content-grid">
      <img src="${escapeHTML(project.thumbnail)}" alt="${escapeHTML(project.title)} image" loading="lazy" decoding="async" />
      <div>
        <h3>${escapeHTML(project.title)}</h3>
        <p><strong>Problem:</strong> ${escapeHTML(project.problem)}</p>
        <p><strong>Solution:</strong> ${escapeHTML(project.solution)}</p>
        <p>${escapeHTML(project.description)}</p>
        <div class="tags">${project.tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
      </div>
    </div>
  `;
}
