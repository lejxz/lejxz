export function normalizeProfile(profile = {}) {
  return {
    name: profile.name || "Lejuene Delantar",
    headline: profile.headline || "AI | ML | AR/VR",
    shortBio: profile.shortBio || "AI and spatial computing researcher.",
    email: profile.email || "",
    github: profile.github || "#",
    linkedin: profile.linkedin || "#"
  };
}

export function normalizeFocusAreas(focusAreas) {
  if (!Array.isArray(focusAreas)) {
    return [];
  }

  return focusAreas.map((item) => ({
    title: item.title || "Focus",
    description: item.description || ""
  }));
}

export function normalizeProjects(projects) {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects.map((project) => ({
    title: project.title || "Project",
    description: project.description || project.plainSummary || "",
    thumbnail: project.thumbnail || "",
    tags: Array.isArray(project.tags) ? project.tags : [],
    category: Array.isArray(project.category) ? project.category : [],
    status: project.status || "in-progress",
    repo: project.repo || "#",
    demo: project.demo || project.repo || "#"
  }));
}

export function normalizePapers(papers) {
  if (!Array.isArray(papers)) {
    return [];
  }

  return papers.map((paper) => ({
    title: paper.title || "Research",
    description: paper.abstract || paper.description || paper.plainSummary || "",
    thumbnail: paper.thumbnail || "",
    tags: Array.isArray(paper.tags) ? paper.tags : [],
    status: paper.status || "in-progress",
    venue: paper.venue || "Research Venue",
    year: paper.year || "",
    paperUrl: paper.paperUrl || "#",
    demoUrl: paper.demoUrl || paper.paperUrl || "#"
  }));
}
