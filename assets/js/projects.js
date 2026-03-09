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
      <article class="research-card" role="listitem">
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
      { label: 'Languages',  items: skills.languages || [] },
      { label: 'AI / ML',    items: skills.ai_ml     || [] },
      { label: 'Tools',      items: skills.tools      || [] },
    ];

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
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        /* Update active state */
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        /* Show / hide cards */
        cards.forEach(card => {
          const cats = (card.dataset.categories || '').split(' ');
          const show = filter === 'all' || cats.includes(filter);
          card.style.display = show ? '' : 'none';
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

    /* About section */
    if (data.focusAreas) renderFocusAreas(data.focusAreas);
    if (data.skills)     renderSkills(data.skills);
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
