/**
 * effects.js
 * Visual effects & micro-interactions:
 *   - Cursor trail (stardust particle canvas)
 *   - Scroll progress bar
 *   - Tilt effect on [data-tilt] elements
 *   - Glass-card glow tracking
 *   - Staggered scroll reveals for grid items
 */
(function () {
  'use strict';

  /* ---- Helpers ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =====================================================
     CURSOR TRAIL — stardust particle system
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

    const particles = [];
    const MAX_PARTICLES = 120;
    let mouseX = -200, mouseY = -200;
    let prevX  = -200, prevY  = -200;
    let active = false;
    let spawnAccum = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      active = true;
    }, { passive: true });

    document.addEventListener('mouseleave', () => { active = false; });

    function spawn(x, y) {
      const angle  = Math.random() * Math.PI * 2;
      const speed  = 0.3 + Math.random() * 0.8;
      const radius = 1.5 + Math.random() * 2.5;
      const life   = 40 + Math.random() * 35;

      /* Colour palette: purple → pink → lavender */
      const palette = [
        [182, 96, 235],
        [210, 120, 255],
        [235, 160, 255],
        [160, 100, 240],
        [200, 140, 255],
      ];
      const col = palette[Math.floor(Math.random() * palette.length)];

      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2,
        radius: radius,
        maxLife: life,
        age: 0,
        r: col[0], g: col[1], b: col[2],
        /* Slight twinkle phase offset */
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      /* Spawn particles along the mouse path for even distribution */
      if (active) {
        const dx = mouseX - prevX;
        const dy = mouseY - prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        /* Spawn rate scales with speed — faster movement = denser trail */
        spawnAccum += Math.min(dist * 0.4, 6);
        const count = Math.floor(spawnAccum);
        spawnAccum -= count;

        for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
          const t = count > 1 ? i / (count - 1) : 1;
          spawn(prevX + dx * t, prevY + dy * t);
        }
      }
      prevX = mouseX;
      prevY = mouseY;

      /* Update & draw particles */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age++;

        if (p.age >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        /* Physics: drift + slight gravity pull upward (floaty feel) */
        p.x  += p.vx;
        p.y  += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy -= 0.008;  /* gentle upward float */

        const progress = p.age / p.maxLife;          /* 0→1 */
        /* Smooth fade: quick appear, long dissolve */
        const fadeIn   = Math.min(p.age / 5, 1);
        const fadeOut  = 1 - progress * progress;
        const alpha    = fadeIn * fadeOut * 0.65;

        /* Shrink over lifetime */
        const r = p.radius * (1 - progress * 0.6);

        /* Subtle twinkle */
        const twinkle = 0.7 + 0.3 * Math.sin(p.age * 0.25 + p.twinkle);

        const finalAlpha = alpha * twinkle;

        /* Soft glow halo */
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grad.addColorStop(0, 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + (finalAlpha * 0.9) + ')');
        grad.addColorStop(0.4, 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + (finalAlpha * 0.3) + ')');
        grad.addColorStop(1, 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        /* Bright core */
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 240, 255, ' + (finalAlpha * 0.8) + ')';
        ctx.fill();
      }

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
      if (!items.length) return;

      items.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease ' + (i * 100) + 'ms, transform 0.5s ease ' + (i * 100) + 'ms';
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const children = $$(selector, entry.target);
            children.forEach((el) => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      /* Observe each unique parent so all groups reveal independently */
      const parents = new Set(items.map(el => el.parentElement));
      parents.forEach(p => { if (p) observer.observe(p); });
    }

    document.addEventListener('portfolio:rendered', () => {
      stagger('.focus-item');
      stagger('.skill-tags .skill-tag');
    }, { once: true });
  })();

})();
