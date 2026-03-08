import { loadPortfolioData } from "./modules/data.js";
import { getElements } from "./modules/dom.js";
import {
  renderContact,
  renderFocus,
  renderHero,
  renderProjectFilters,
  renderProjectModal,
  renderProjects,
  renderResearch,
  renderSkills
} from "./modules/render.js";

const DATA_PATH = "assets/data/portfolio.json";

const state = {
  activeCategory: "all",
  data: null
};

const els = getElements();

init().catch(() => {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<p style="padding:1rem;color:#ff9f9f">Unable to load portfolio content.</p>'
  );
});

async function init() {
  state.data = await loadPortfolioData(DATA_PATH);

  renderAll();
  setupProjectFilterEvents();
  setupNavigation();
  setupReveal();
  setupModal();

  els.footerName.textContent = state.data.profile.name;
  els.footerYear.textContent = `- ${new Date().getFullYear()}`;
}

function renderAll() {
  renderHero(els, state.data.profile, state.data.projects, state.data.researchPapers);
  renderFocus(els, state.data.focusAreas);
  renderProjectFilters(els, state.data.projects, state.activeCategory);
  renderProjects(els, state.data.projects, state.activeCategory, openProjectModal);
  renderResearch(els, state.data.researchPapers);
  renderSkills(els, state.data.skills);
  renderContact(els, state.data.profile);
}

function setupProjectFilterEvents() {
  els.projectFilters.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    state.activeCategory = target.dataset.category || "all";
    renderProjectFilters(els, state.data.projects, state.activeCategory);
    renderProjects(els, state.data.projects, state.activeCategory, openProjectModal);
  });
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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.projectModal.open) {
      els.projectModal.close();
    }
  });
}

function openProjectModal(project) {
  renderProjectModal(els, project);
  els.projectModal.showModal();
}
