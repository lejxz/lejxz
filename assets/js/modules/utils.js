export function formatToken(value) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function uniqueTagCount(projects) {
  const tags = new Set();
  projects.forEach((project) => project.tags.forEach((tag) => tags.add(tag)));
  return tags.size;
}

export function fallbackImage(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) {
    return;
  }

  img.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80";
}
