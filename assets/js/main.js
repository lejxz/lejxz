import { getPortfolioData } from "./data-loader.js";
import {
  setupMobileMenu,
  setupSectionReveal,
  setupCounterAnimation,
  setupContactForm,
  updateYear
} from "./ui.js";

function renderProjects(projects) {
  const grid = document.getElementById("projectGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = projects
    .map(
      (project) => `
        <article class="project-card" data-categories="${project.category.join(" ")}">
          <h3>${project.title}</h3>
          <p class="section-copy">${project.description}</p>
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

function renderSkills(skills) {
  const list = document.getElementById("skillList");
  if (!list) {
    return;
  }

  list.innerHTML = skills.map((skill) => `<span class="skill-pill">${skill}</span>`).join("");
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
  setupCounterAnimation();
  setupContactForm();
  updateYear();

  try {
    const data = await getPortfolioData();
    renderProjects(data.projects || []);
    renderSkills(data.skills || []);
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
