import { DATA_PATH, SELECTORS } from "./modules/config.js";
import { loadPortfolioData } from "./modules/data.js";
import {
  getProjectCategories,
  renderContact,
  renderFocus,
  renderHero,
  renderImpact,
  renderModal,
  renderProjectFilters,
  renderProjects,
  renderResearch,
  renderSkills
} from "./modules/render.js";
import {
  setupModal,
  setupNavigation,
  setupProjectInteractions,
  setupReveal
} from "./modules/interactions.js";
import { getByIdMap } from "./modules/utils.js";

const state = {
  data: null,
  activeCategory: "all",
  filteredProjects: []
};

const elements = getByIdMap(SELECTORS);

init().catch(() => {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<p class="load-error">Unable to load portfolio content.</p>'
  );
});

async function init() {
  state.data = await loadPortfolioData(DATA_PATH);

  renderHero(state.data.profile, elements);
  renderImpact(state.data, elements);
  renderFocus(state.data.focusAreas, elements);
  renderResearch(state.data.researchPapers, elements);
  renderSkills(state.data.skills, elements);
  renderContact(state.data.profile, elements);

  const categories = getProjectCategories(state.data.projects);
  renderProjectFilters(categories, state.activeCategory, elements);
  state.filteredProjects = renderProjects(
    state.data.projects,
    state.activeCategory,
    elements
  );

  elements.footerName.textContent = state.data.profile.name;
  elements.footerYear.textContent = ` | ${new Date().getFullYear()}`;

  const modalController = setupModal(elements);

  setupProjectInteractions({
    elements,
    getFilteredProject(index) {
      return state.filteredProjects[index];
    },
    openProject(action) {
      if (action.type === "filter") {
        state.activeCategory = action.category;
        renderProjectFilters(categories, state.activeCategory, elements);
        state.filteredProjects = renderProjects(
          state.data.projects,
          state.activeCategory,
          elements
        );
      }

      if (action.type === "modal") {
        renderModal(action.project, elements);
        modalController.open();
      }
    }
  });

  setupReveal();
  setupNavigation(elements);
}
