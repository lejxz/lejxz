/**
 * main.js
 * Core UI behaviours:
 *   - Initial loader
 *   - Typewriter hero effect
 *   - Navigation (scroll spy, mobile menu, sticky header style)
 *   - Scroll-reveal via IntersectionObserver
 *   - Contact form client-side validation
 *   - Footer year
 *
 * Visual effects live in effects.js
 */
(function () {
  'use strict';

  /* ---- Helpers ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =====================================================
     INITIAL LOADER — tracks real asset loading progress
     ===================================================== */
  (function initialLoader() {
    const loader = $('#site-loader');
    if (!loader) return;

    const progressFill = $('.loader-progress-fill');
    const loaderPercent = $('.loader-percent');
    const loaderSubtitle = $('.loader-subtitle');
    let dismissed = false;
    const tasks = { dom: false, fonts: false, content: false, window: false };

    const steps = [
      'Preparing layout…',
      'Loading fonts…',
      'Fetching projects & research…',
      'Rendering visuals…',
    ];

    function updateProgress() {
      const done = Object.values(tasks).filter(Boolean).length;
      const total = Object.keys(tasks).length;
      const pct = Math.round((done / total) * 100);

      if (progressFill) {
        progressFill.style.width = pct + '%';
      }
      if (loaderPercent) {
        loaderPercent.textContent = pct + '%';
      }
      if (loaderSubtitle && done < total) {
        loaderSubtitle.textContent = steps[done] || steps[steps.length - 1];
      }
      if (done === total) dismiss();
    }

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;

      if (progressFill) progressFill.style.width = '100%';
      if (loaderPercent) loaderPercent.textContent = '100%';
      if (loaderSubtitle) loaderSubtitle.textContent = 'Ready.';

      setTimeout(() => {
        document.body.classList.add('ready');
        document.body.classList.remove('is-loading');
        setTimeout(() => loader.remove(), 700);
      }, 350);
    };

    /* Track DOM ready */
    if (document.readyState !== 'loading') {
      tasks.dom = true;
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        tasks.dom = true;
        updateProgress();
      }, { once: true });
    }

    /* Track fonts */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        tasks.fonts = true;
        updateProgress();
      });
    } else {
      tasks.fonts = true;
    }

    /* Track portfolio data render */
    document.addEventListener('portfolio:rendered', () => {
      tasks.content = true;
      updateProgress();
    }, { once: true });

    /* Track window load (images, scripts, etc.) */
    window.addEventListener('load', () => {
      tasks.window = true;
      updateProgress();
    }, { once: true });

    /* Initial check for tasks already completed */
    updateProgress();

    /* Fallback so loader never blocks UX if something fails */
    setTimeout(dismiss, 4500);
  })();

  /* =====================================================
     TYPEWRITER
     ===================================================== */
  (function typewriter() {
    const el = $('#typewriter');
    if (!el) return;

    const fallbackPhrases = [
      'Building Real-Time AR Systems',
      'Exploring Computer Vision',
      'ML & Adversarial AI Research',
      'Spatial Computing Enthusiast',
      'Always Learning.',
    ];

    function start(phrases) {
      let phraseIdx  = 0;
      let charIdx    = 0;
      let deleting   = false;
      let pauseTimer = null;

      function tick() {
        const phrase = phrases[phraseIdx];

        if (deleting) {
          charIdx--;
          el.textContent = phrase.slice(0, charIdx);
          if (charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            pauseTimer = setTimeout(tick, 400);
            return;
          }
        } else {
          charIdx++;
          el.textContent = phrase.slice(0, charIdx);
          if (charIdx === phrase.length) {
            deleting = true;
            pauseTimer = setTimeout(tick, 2200);
            return;
          }
        }

        const speed = deleting ? 45 : 80;
        pauseTimer = setTimeout(tick, speed);
      }

      pauseTimer = setTimeout(tick, 900);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        clearTimeout(pauseTimer);
        el.textContent = phrases[0];
      }
    }

    /* Wait briefly for portfolio.json phrases, then fall back */
    let started = false;
    document.addEventListener('portfolio:rendered', () => {
      if (started) return;
      started = true;
      start(window.__typewriterPhrases || fallbackPhrases);
    });
    /* Fallback if portfolio:rendered never fires */
    setTimeout(() => {
      if (started) return;
      started = true;
      start(window.__typewriterPhrases || fallbackPhrases);
    }, 3000);
  })();

  /* =====================================================
     NAVIGATION
     ===================================================== */

  /* --- Sticky header style on scroll --- */
  const header = $('header.nav-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* --- Mobile menu toggle --- */
  const navToggle = $('#navToggle');
  const navMenu   = $('#navMenu');
  if (navToggle && navMenu) {
    const lockBodyScroll = (locked) => {
      document.body.classList.toggle('nav-open', locked);
      document.body.style.overflow = locked ? 'hidden' : '';
    };

    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navMenu.classList.toggle('open', !open);
      lockBodyScroll(!open);
    });

    /* Close menu on link click */
    $$('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        lockBodyScroll(false);
      });
    });

    /* Close menu on Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        lockBodyScroll(false);
        navToggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 640 && navMenu.classList.contains('open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        lockBodyScroll(false);
      }
    }, { passive: true });
  }

  /* --- Scroll spy — highlight active nav link --- */
  (function scrollSpy() {
    const sections = $$('section[id]');
    const links    = $$('.nav-link');
    if (!sections.length || !links.length) return;

    const navHRaw = getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '64px';
    const navH = parseFloat(navHRaw) || 64;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(l => l.classList.toggle('active', l.dataset.section === id));
          }
        });
      },
      { rootMargin: `-${navH}px 0px -50% 0px`, threshold: 0 }
    );

    sections.forEach(s => observer.observe(s));
  })();

  /* =====================================================
     SCROLL REVEAL
     ===================================================== */
  (function scrollReveal() {
    const items = $$('[data-animate]');
    if (!items.length) return;

    /* Skip animations if user prefers reduced motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach(el => observer.observe(el));
  })();

  /* =====================================================
     CONTACT FORM — Client-side validation
     Sends a mailto link as a fallback (no server required).
     Real deployment should use a form service (Formspree, etc.)
     ===================================================== */
  (function contactForm() {
    const form       = $('#contact-form');
    const submitBtn  = $('#form-submit');
    const statusEl   = $('#form-status');
    if (!form) return;

    function showError(inputId, errorId, msg) {
      const input = $(`#${inputId}`);
      const err   = $(`#${errorId}`);
      if (input) input.classList.add('error');
      if (err)   err.textContent = msg;
    }
    function clearErrors() {
      $$('.form-input.error').forEach(el => el.classList.remove('error'));
      $$('.form-error').forEach(el => { el.textContent = ''; });
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form-status'; }
    }

    function validateEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name    = $('#contact-name')?.value.trim()    || '';
      const email   = $('#contact-email')?.value.trim()   || '';
      const message = $('#contact-message')?.value.trim() || '';
      const subject = $('#contact-subject')?.value.trim() || 'Portfolio Contact';

      let valid = true;

      if (!name) {
        showError('contact-name', 'name-error', 'Name is required.');
        valid = false;
      }
      if (!email) {
        showError('contact-email', 'email-error', 'Email is required.');
        valid = false;
      } else if (!validateEmail(email)) {
        showError('contact-email', 'email-error', 'Please enter a valid email address.');
        valid = false;
      }
      if (!message) {
        showError('contact-message', 'message-error', 'Message is required.');
        valid = false;
      }

      if (!valid) return;

      /* Compose mailto link — works without a backend */
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      );
      const mailtoUrl =
        `mailto:delantarlejuene@gmail.com` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${body}`;

      /* Simulate brief loading state */
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending…';

      setTimeout(() => {
        window.location.href = mailtoUrl;

        if (statusEl) {
          statusEl.textContent = '✓ Opening your email client…';
          statusEl.classList.add('success');
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Send Message';
        form.reset();
      }, 600);
    });
  })();

  /* =====================================================
     FOOTER YEAR
     ===================================================== */
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
