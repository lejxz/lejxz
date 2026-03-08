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
