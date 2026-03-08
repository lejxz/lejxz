export function setupReveal() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((section) => section.classList.add("visible"));
    return;
  }

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

export function setupNavigation(elements) {
  elements.navToggle.addEventListener("click", () => {
    const isOpen = elements.nav.classList.toggle("open");
    elements.navToggle.setAttribute("aria-expanded", String(isOpen));
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
      elements.nav.classList.remove("open");
      elements.navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

export function setupProjectInteractions({
  elements,
  getFilteredProject,
  openProject
}) {
  elements.projectFilters.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const category = target.dataset.category || "all";
    openProject({ type: "filter", category });
  });

  const tryOpen = (target) => {
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("a")) {
      return;
    }

    const card = target.closest(".project-card");
    if (!card) {
      return;
    }

    const index = Number(card.getAttribute("data-project-index"));
    const project = getFilteredProject(index);
    if (project) {
      openProject({ type: "modal", project });
    }
  };

  elements.projectsGrid.addEventListener("click", (event) => {
    tryOpen(event.target);
  });

  elements.projectsGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    tryOpen(event.target);
  });
}

export function setupModal(elements) {
  let lastFocus = null;

  elements.modalClose.addEventListener("click", () => {
    elements.projectModal.close();
  });

  elements.projectModal.addEventListener("click", (event) => {
    if (event.target === elements.projectModal) {
      elements.projectModal.close();
    }
  });

  elements.projectModal.addEventListener("close", () => {
    if (lastFocus instanceof HTMLElement) {
      lastFocus.focus();
    }
  });

  return {
    open() {
      lastFocus = document.activeElement;
      elements.projectModal.showModal();
      elements.modalClose.focus();
    }
  };
}
