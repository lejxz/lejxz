/**
 * projects.js
 * Fetches portfolio data from the JSON mock file and renders:
 *   - Project cards (filtered by category)
 *   - Research paper cards
 *   - About section: focus areas + skills
 *
 * Design decision: data-driven approach — all content comes from
 * assets/data/portfolio.json so adding new projects requires only
 * editing the JSON file, not HTML.
 */
(function () {
  'use strict';

  /* ---- Helpers ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Status label mapping */
  const STATUS_LABELS = {
    'active-research': 'Active Research',
    'prototype':       'Prototype',
    'in-progress':     'In Progress',
    'complete':        'Complete',
  };

  /* Sanitise user-supplied strings before inserting as text */
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ---- Build project card HTML ---- */
  function buildProjectCard(project, index) {
    const status      = project.status || 'in-progress';
    const statusLabel = STATUS_LABELS[status] || status;
    const tags        = Array.isArray(project.tags) ? project.tags : [];
    const categories  = Array.isArray(project.category) ? project.category.join(' ') : '';
    const delay       = index * 80;

    const tagsHtml = tags
      .map(t => `<span class="project-tag">${esc(t)}</span>`)
      .join('');

    return `
      <article class="project-card"
               role="listitem"
               data-categories="${esc(categories)}"
               data-tilt
               style="animation-delay:${delay}ms">

        <div class="project-thumbnail">
          <img src="${esc(project.thumbnail || '')}"
               alt="${esc(project.title)} project thumbnail"
               loading="lazy" />
          <span class="project-status-badge status-${esc(status)}">${esc(statusLabel)}</span>
        </div>

        <div class="project-body">
          <h3 class="project-title">${esc(project.title)}</h3>
          <p class="project-desc">${esc(project.description)}</p>
          <div class="project-tags" aria-label="Technologies used">${tagsHtml}</div>
          <div class="project-actions">
            ${project.repo ? `<a href="${esc(project.repo)}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="View ${esc(project.title)} source code on GitHub">
              <i class="fab fa-github" aria-hidden="true"></i> Code
            </a>` : ''}
            ${project.demo ? `<a href="${esc(project.demo)}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="View ${esc(project.title)} live demo">
              <i class="fas fa-external-link-alt" aria-hidden="true"></i> Demo
            </a>` : ''}
          </div>
        </div>
      </article>`;
  }

  /* ---- Build research card HTML ---- */
  function buildResearchCard(paper) {
    const status      = paper.status || 'in-progress';
    const statusLabel = STATUS_LABELS[status] || status;
    const tags        = Array.isArray(paper.tags) ? paper.tags : [];

    const tagsHtml = tags
      .map(t => `<span class="project-tag">${esc(t)}</span>`)
      .join('');

    return `
      <article class="research-card" role="listitem" data-tilt>
        <div class="research-thumbnail">
          <img src="${esc(paper.thumbnail || '')}"
               alt="${esc(paper.title)} research thumbnail"
               loading="lazy" />
        </div>
        <div class="research-body">
          <div class="research-meta">
            <span class="research-year">${esc(String(paper.year || ''))}</span>
            <span class="research-venue">${esc(paper.venue || '')}</span>
            <span class="project-status-badge status-${esc(status)}">${esc(statusLabel)}</span>
          </div>
          <h3 class="research-title">${esc(paper.title)}</h3>
          <p class="research-abstract">${esc(paper.abstract || paper.description || '')}</p>
          <div class="research-tags" aria-label="Research topics">${tagsHtml}</div>
          <div class="research-actions">
            ${paper.paperUrl ? `<a href="${esc(paper.paperUrl)}" target="_blank" rel="noopener noreferrer" class="research-link">
              <i class="fas fa-file-alt" aria-hidden="true"></i> Paper
            </a>` : ''}
            ${paper.demoUrl ? `<a href="${esc(paper.demoUrl)}" target="_blank" rel="noopener noreferrer" class="research-link">
              <i class="fas fa-external-link-alt" aria-hidden="true"></i> Demo
            </a>` : ''}
          </div>
        </div>
      </article>`;
  }

  /* ---- Render hero section from JSON ---- */
  function renderHero(hero) {
    if (!hero) return;

    const badge       = $('#hero-badge');
    const greeting    = $('#hero-greeting');
    const name        = $('#hero-name');
    const desc        = $('#hero-description');
    const cta         = $('#hero-cta');
    const chips       = $('#hero-chips');

    if (badge && hero.badge) {
      badge.innerHTML = '<span class="badge-dot" aria-hidden="true"></span>' + esc(hero.badge);
    }
    if (greeting && hero.greeting) greeting.textContent = hero.greeting;
    if (name && hero.name)         name.textContent     = hero.name;
    if (desc && hero.description)  desc.innerHTML       = hero.description;

    if (cta && Array.isArray(hero.ctaButtons)) {
      cta.innerHTML = hero.ctaButtons.map(btn => {
        const cls = btn.style === 'primary' ? 'btn btn-primary' : 'btn btn-outline';
        return `<a href="${esc(btn.href)}" class="${cls}">
          <i class="${esc(btn.icon)}" aria-hidden="true"></i>
          ${esc(btn.label)}
        </a>`;
      }).join('');
    }

    if (chips && Array.isArray(hero.chips)) {
      chips.innerHTML = hero.chips.map(c =>
        `<span class="chip"><i class="${esc(c.icon)}" aria-hidden="true"></i> ${esc(c.label)}</span>`
      ).join('');
    }

    /* Expose typewriter phrases for main.js */
    if (Array.isArray(hero.typewriterPhrases)) {
      window.__typewriterPhrases = hero.typewriterPhrases;
    }
  }

  /* ---- Render about bio card from JSON ---- */
  function renderAbout(profile) {
    if (!profile) return;

    const nameEl     = $('#about-name');
    const headline   = $('#about-headline');
    const bioContent = $('#about-bio-content');
    const social     = $('#about-social');
    const avatarIcon = $('#about-avatar-icon');

    if (nameEl && profile.name)       nameEl.textContent    = profile.name;
    if (headline && profile.headline) headline.textContent   = profile.headline;
    if (avatarIcon && profile.avatarIcon) avatarIcon.className = profile.avatarIcon;

    if (bioContent && Array.isArray(profile.bio)) {
      bioContent.innerHTML = profile.bio
        .map(p => `<p class="about-bio-text">${p}</p>`)
        .join('');
    }

    if (social) {
      const links = [];
      if (profile.github)   links.push({ href: profile.github,                  icon: 'fab fa-github',   label: 'GitHub profile',  external: true });
      if (profile.linkedin) links.push({ href: profile.linkedin,                 icon: 'fab fa-linkedin', label: 'LinkedIn profile', external: true });
      if (profile.email)    links.push({ href: 'mailto:' + profile.email,        icon: 'fas fa-envelope', label: 'Send email',       external: false });

      social.innerHTML = links.map(l => {
        const extAttrs = l.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${esc(l.href)}"${extAttrs} class="social-link" aria-label="${esc(l.label)}">
          <i class="${esc(l.icon)}" aria-hidden="true"></i>
        </a>`;
      }).join('');
    }
  }

  /* ---- Render focus areas ---- */
  function renderFocusAreas(areas) {
    const container = $('#focus-areas-list');
    if (!container) return;

    container.innerHTML = areas.map(area => `
      <div class="focus-item">
        <p class="focus-item-title">${esc(area.title)}</p>
        <p class="focus-item-desc">${esc(area.description)}</p>
      </div>`).join('');
  }

  /* ---- Render skills ---- */
  function renderSkills(skills) {
    const container = $('#skills-container');
    if (!container) return;

    const groups = [
      { label: 'Languages',    items: skills.languages || [] },
      { label: 'AI / ML',      items: skills.ai_ml     || [] },
      { label: 'Tools',        items: skills.tools      || [] },
      { label: 'Security',     items: skills.security   || [] },
    ].filter(g => g.items.length > 0);

    container.innerHTML = groups.map(g => `
      <div>
        <p class="skill-group-label">${esc(g.label)}</p>
        <div class="skill-tags">
          ${g.items.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}
        </div>
      </div>`).join('');
  }

  /* ---- Filter logic ---- */
  function setupFilters(cards) {
    const buttons = $$('.filter-btn');

    buttons.forEach((btn, idx) => {
      btn.setAttribute('aria-pressed', String(idx === 0));
    });

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        /* Update active state */
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));

        /* Show / hide cards */
        cards.forEach(card => {
          const cats = (card.dataset.categories || '').split(' ');
          const show = filter === 'all' || cats.includes(filter);
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ---- Main fetch & render ---- */
  async function init() {
    let data;
    try {
      const res = await fetch('assets/data/portfolio.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (err) {
      console.error('[projects.js] Failed to load portfolio data:', err);
      return;
    }

    /* Projects */
    const projectsGrid = $('#projects-grid');
    if (projectsGrid && Array.isArray(data.projects)) {
      projectsGrid.innerHTML = data.projects
        .map((p, i) => buildProjectCard(p, i))
        .join('');
      const cards = $$('.project-card', projectsGrid);
      setupFilters(cards);
    }

    /* Research */
    const researchList = $('#research-list');
    if (researchList && Array.isArray(data.researchPapers)) {
      researchList.innerHTML = data.researchPapers
        .map(p => buildResearchCard(p))
        .join('');
    }

    /* Hero section */
    if (data.hero) renderHero(data.hero);

    /* About bio card */
    if (data.profile) renderAbout(data.profile);

    /* About section */
    if (data.focusAreas) renderFocusAreas(data.focusAreas);
    if (data.skills)     renderSkills(data.skills);

    /* Notify other modules that dynamic cards are present in the DOM. */
    document.dispatchEvent(new CustomEvent('portfolio:rendered'));
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
