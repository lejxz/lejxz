import { DATA_URL } from "./modules/config.js";
import {
  normalizeFocusAreas,
  normalizePapers,
  normalizeProfile,
  normalizeProjects
} from "./modules/data.js";
import {
  renderFocusAreas,
  renderProfile,
  renderProjectFilters,
  renderProjectGrid,
  renderResearch
} from "./modules/render.js";
import { setupCardTilt, setupScrollReveal, setupThreeScene } from "./modules/scene.js";

const el = {
  heroName: document.getElementById("heroName"),
  heroHeadline: document.getElementById("heroHeadline"),
  heroBio: document.getElementById("heroBio"),
  githubLink: document.getElementById("githubLink"),
  linkedinLink: document.getElementById("linkedinLink"),
  emailLink: document.getElementById("emailLink"),
  focusGrid: document.getElementById("focusGrid"),
  projectGrid: document.getElementById("projectGrid"),
  projectFilters: document.getElementById("projectFilters"),
  researchGrid: document.getElementById("researchGrid"),
  canvas: document.getElementById("scene3d")
};

const state = {
  projects: [],
  selectedCategory: "all"
};

async function init() {
  setupScrollReveal();
  setupThreeScene(el.canvas);

  try {
    const response = await fetch(DATA_URL);
    const data = await response.json();
    renderFromData(data);
  } catch (error) {
    console.error("Failed to load portfolio data", error);
    el.heroBio.textContent = "Portfolio data is currently unavailable.";
  }
}

function renderFromData(data) {
  if (!data || !data.profile) {
    return;
  }

  const profile = normalizeProfile(data.profile);
  const focusAreas = normalizeFocusAreas(data.focusAreas);
  const projects = normalizeProjects(data.projects);
  const researchPapers = normalizePapers(data.researchPapers);
  state.projects = projects;

  renderProfile(profile, el);
  renderFocusAreas(focusAreas, el.focusGrid);
  renderResearch(researchPapers, el.researchGrid);

  renderProjectFilters(projects, state, el.projectFilters, (next) => {
    state.selectedCategory = next;
    renderProjectFilters(state.projects, state, el.projectFilters, onFilterChange);
    onFilterChange();
  });

  onFilterChange();
}

function onFilterChange() {
  renderProjectGrid(state.projects, state.selectedCategory, el.projectGrid);
  setupCardTilt();
}

init();
