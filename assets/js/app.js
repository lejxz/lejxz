const dataPath = "assets/data/portfolio.json";

const state = {
  category: "all",
  data: null
};

const els = {
  heroName: document.getElementById("hero-name"),
  heroHeadline: document.getElementById("hero-headline"),
  heroBio: document.getElementById("hero-bio"),
  heroActions: document.getElementById("hero-actions"),
  heroHighlights: document.getElementById("hero-highlights"),
  focusGrid: document.getElementById("focus-grid"),
  projectFilters: document.getElementById("project-filters"),
  projectsGrid: document.getElementById("projects-grid"),
  researchList: document.getElementById("research-list"),
  skillsGrid: document.getElementById("skills-grid"),
  contactActions: document.getElementById("contact-actions"),
  footerName: document.getElementById("footer-name"),
  footerYear: document.getElementById("footer-year"),
  projectModal: document.getElementById("project-modal"),
  modalContent: document.getElementById("modal-content"),
  modalClose: document.getElementById("modal-close"),
  navToggle: document.getElementById("nav-toggle"),
  nav: document.getElementById("main-nav")
};

init().catch(() => {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<p style="padding:1rem;color:#ff9f9f">Unable to load portfolio content.</p>'
  );
});

async function init() {
  const response = await fetch(dataPath);
  state.data = await response.json();

  renderHero(state.data.profile);
  renderFocus(state.data.focusAreas);
  renderProjectFilters(state.data.projects);
  renderProjects(state.data.projects);
  renderResearch(state.data.researchPapers);
  renderSkills(state.data.skills);
  renderContact(state.data.profile);

  els.footerName.textContent = state.data.profile.name;
  els.footerYear.textContent = `\u00b7 ${new Date().getFullYear()}`;

  setupReveal();
  setupNavigation();
  setupModal();
}

function renderHero(profile) {
  els.heroName.textContent = profile.name;
  els.heroHeadline.textContent = profile.headline;
  els.heroBio.textContent = profile.shortBio;

  const links = [
    { href: profile.github, label: "GitHub", className: "btn primary" },
    { href: profile.linkedin, label: "LinkedIn", className: "btn" },
    { href: `mailto:${profile.email}`, label: "Email", className: "btn" }
  ];

  els.heroActions.innerHTML = links
    .map((link) => `<a class="${link.className}" href="${link.href}" target="_blank" rel="noreferrer">${link.label}</a>`)
    .join("");

  const highlights = [
    "Building at the intersection of AI and real-time vision.",
    "Exploring secure and scalable machine learning systems.",
    "Focused on hireable impact: practical, deployable prototypes."
  ];

  els.heroHighlights.innerHTML = highlights.map((item) => `<li>${item}</li>`).join("");
}

function renderFocus(items) {
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

function renderProjectFilters(projects) {
  const categories = new Set(["all"]);
  projects.forEach((project) => project.category.forEach((category) => categories.add(category)));

  els.projectFilters.innerHTML = [...categories]
    .map(
      (category) =>
        `<button class="chip ${category === "all" ? "active" : ""}" data-category="${category}">${formatToken(category)}</button>`
    )
    .join("");

  els.projectFilters.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const category = target.dataset.category || "all";
    state.category = category;
    [...els.projectFilters.children].forEach((chip) => chip.classList.remove("active"));
    target.classList.add("active");
    renderProjects(state.data.projects);
  });
}

function renderProjects(projects) {
  const filteredProjects =
    state.category === "all"
      ? projects
      : projects.filter((project) => project.category.includes(state.category));

  els.projectsGrid.innerHTML = filteredProjects
    .map(
      (project, index) => `
      <article class="card project-card" data-project-index="${index}">
        <img src="${project.thumbnail}" alt="${project.title} preview" loading="lazy" />
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
          </div>
        </div>
      </article>
    `
    )
    .join("");

  els.projectsGrid.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        return;
      }

      const index = Number(card.dataset.projectIndex);
      const project = filteredProjects[index];
      openProjectModal(project);
    });
  });
}

function renderResearch(papers) {
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

function renderSkills(skills) {
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

function renderContact(profile) {
  const actions = [
    { href: `mailto:${profile.email}`, label: "Email" },
    { href: profile.linkedin, label: "LinkedIn" },
    { href: profile.github, label: "GitHub" }
  ];

  els.contactActions.innerHTML = actions
    .map((item, index) => `<a class="btn ${index === 0 ? "primary" : ""}" href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a>`)
    .join("");
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
}

function setupNavigation() {
  els.navToggle.addEventListener("click", () => {
    const isOpen = els.nav.classList.toggle("open");
    els.navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".main-nav a")];

  const onScroll = () => {
    const offset = window.scrollY + 180;
    let current = null;
    sections.forEach((section) => {
      if (section.offsetTop <= offset) {
        current = section;
      }
    });
    if (!current) {
      return;
    }

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
    });
  };

  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      els.nav.classList.remove("open");
      els.navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupModal() {
  els.modalClose.addEventListener("click", () => els.projectModal.close());
  els.projectModal.addEventListener("click", (event) => {
    if (event.target === els.projectModal) {
      els.projectModal.close();
    }
  });
}

function openProjectModal(project) {
  els.modalContent.innerHTML = `
    <div class="modal-content-grid">
      <img src="${project.thumbnail}" alt="${project.title} image" />
      <div>
        <h3>${project.title}</h3>
        <p><strong>Problem:</strong> ${project.problem}</p>
        <p><strong>Solution:</strong> ${project.solution}</p>
        <p>${project.description}</p>
        <div class="tags">${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
    </div>
  `;
  els.projectModal.showModal();
}

function formatToken(value) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
