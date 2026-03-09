/**
 * main.js
 * Core UI behaviours:
 *   - Typewriter hero effect
 *   - Navigation (scroll spy, mobile menu, sticky header style)
 *   - Scroll-reveal via IntersectionObserver
 *   - Contact form client-side validation
 *   - Footer year
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

  /* =====================================================
     CURSOR TRAIL — smooth canvas-based ribbon
     ===================================================== */
  (function cursorTrail() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Trail stored as smoothed points */
    const MAX_POINTS = 80;
    const points = [];
    let mouseX = -200, mouseY = -200;
    let smoothX = -200, smoothY = -200;
    let active = false;
    let idleFrames = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      active  = true;
      idleFrames = 0;
    }, { passive: true });

    document.addEventListener('mouseleave', () => { active = false; });

    function animate() {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      /* Smooth interpolation toward mouse */
      smoothX += (mouseX - smoothX) * 0.35;
      smoothY += (mouseY - smoothY) * 0.35;

      if (active) {
        /* Only add point if moved enough (avoids clustering) */
        const last = points[points.length - 1];
        const dx = last ? smoothX - last.x : 999;
        const dy = last ? smoothY - last.y : 999;
        if (dx * dx + dy * dy > 4) {
          points.push({ x: smoothX, y: smoothY });
        }
      } else {
        idleFrames++;
      }

      /* Trim oldest points */
      while (points.length > MAX_POINTS) points.shift();

      /* Fade out by removing points when idle */
      if (!active && points.length > 0 && idleFrames > 4) {
        const removeCount = Math.min(3, points.length);
        points.splice(0, removeCount);
      }

      if (points.length < 3) { requestAnimationFrame(animate); return; }

      /* ---- Draw smooth quadratic B-spline ribbon ---- */
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';

      const len = points.length;
      for (let i = 1; i < len; i++) {
        const t = i / len;                             /* 0→1 tail→head */

        /* Eased opacity: cubic ease-in for a silky fade */
        const alpha = t * t * t * 0.5;
        /* Tapered width */
        const width = 1 + t * t * 5;

        /* Purple-to-lavender colour shift along the ribbon */
        const r = Math.round(160 + t * 60);           /* 160→220 */
        const g = Math.round(80  + t * 80);           /*  80→160 */
        const b = Math.round(220 + t * 35);           /* 220→255 */

        ctx.beginPath();

        if (i === 1) {
          ctx.moveTo(points[0].x, points[0].y);
          ctx.lineTo(points[1].x, points[1].y);
        } else {
          /* Smooth midpoint curve */
          const prev = points[i - 1];
          const curr = points[i];
          const mx   = (prev.x + curr.x) * 0.5;
          const my   = (prev.y + curr.y) * 0.5;
          ctx.moveTo((points[i - 2].x + prev.x) * 0.5,
                     (points[i - 2].y + prev.y) * 0.5);
          ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
        }

        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        ctx.lineWidth   = width;
        ctx.stroke();
      }

      /* Soft glowing head dot */
      const head = points[len - 1];
      const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 8);
      grad.addColorStop(0, 'rgba(220, 170, 255, 0.7)');
      grad.addColorStop(0.5, 'rgba(182, 96, 235, 0.25)');
      grad.addColorStop(1, 'rgba(182, 96, 235, 0)');
      ctx.beginPath();
      ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      requestAnimationFrame(animate);
    }
    animate();
  })();

  /* =====================================================
     SCROLL PROGRESS BAR
     ===================================================== */
  (function scrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = 'scaleX(' + pct + ')';
    }, { passive: true });
  })();

  /* =====================================================
     TILT EFFECT — 3D perspective tilt on hover
     ===================================================== */
  (function tiltEffect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function initTilt(card) {
      if (card._tiltInit) return;
      card._tiltInit = true;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rX = ((y - cy) / cy) * -4;
        const rY = ((x - cx) / cx) * 4;
        card.style.transform = 'perspective(800px) rotateX(' + rX + 'deg) rotateY(' + rY + 'deg) scale3d(1.015,1.015,1.015)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    }

    /* Init on existing elements */
    $$('[data-tilt]').forEach(initTilt);

    /* Re-init after dynamic content loads */
    document.addEventListener('portfolio:rendered', () => {
      $$('[data-tilt]').forEach(initTilt);
    }, { once: true });
  })();

  /* =====================================================
     GLASS-CARD GLOW TRACKING
     ===================================================== */
  (function cardGlow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function initGlow(card) {
      if (card._glowInit) return;
      card._glowInit = true;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px');
      });
    }

    $$('.glass-card').forEach(initGlow);

    document.addEventListener('portfolio:rendered', () => {
      $$('.glass-card').forEach(initGlow);
    }, { once: true });
  })();

  /* =====================================================
     STAGGERED SCROLL REVEALS for grid items
     ===================================================== */
  (function staggeredReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function stagger(selector) {
      const items = $$(selector);
      items.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease ' + (i * 100) + 'ms, transform 0.5s ease ' + (i * 100) + 'ms';
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const children = $$(selector, entry.target.parentElement);
            children.forEach((el) => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      if (items.length > 0 && items[0].parentElement) {
        observer.observe(items[0].parentElement);
      }
    }

    document.addEventListener('portfolio:rendered', () => {
      stagger('.focus-item');
      stagger('.skill-tags .skill-tag');
    }, { once: true });
  })();

})();
