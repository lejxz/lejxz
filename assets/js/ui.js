export function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("primaryNav");

  if (!menuToggle || !nav) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

export function setupSectionReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

export function setupActiveNavLink() {
  const links = Array.from(document.querySelectorAll('.site-nav a'));
  const sectionIds = links.map((link) => link.getAttribute('href')).filter((href) => href?.startsWith('#'));
  const sections = sectionIds
    .map((id) => document.querySelector(id))
    .filter((section) => section instanceof HTMLElement);

  if (!sections.length || !links.length) {
    return;
  }

  const setActive = (id) => {
    links.forEach((link) => {
      const isCurrent = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => observer.observe(section));
}

export function setupCardInteractivity() {
  const cards = Array.from(document.querySelectorAll('.project-card, .research-card, .focus-card'));
  if (!cards.length) {
    return;
  }

  cards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateX = ((y / rect.height) - 0.5) * -6;
      const rotateY = ((x / rect.width) - 0.5) * 6;

      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

export function setupContactForm() {
  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("formFeedback");

  if (!form || !feedback) {
    return;
  }

  form.addEventListener("submit", () => {
    feedback.textContent = "Sending message...";
  });
}

export function setupCounterAnimation() {
  const counters = Array.from(document.querySelectorAll(".counter"));
  const statsPanel = document.getElementById("statsPanel");

  if (!counters.length || !statsPanel) {
    return;
  }

  const animateCounter = (counter) => {
    const target = Math.max(0, Number(counter.dataset.target || 0));
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      counter.textContent = String(Math.round(target * progress));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = String(target);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counters.forEach(animateCounter);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.45 }
  );

  observer.observe(statsPanel);
}

export function updateYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}
