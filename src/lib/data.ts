import profileData from "@/data/profile.json";
import marqueeData from "@/data/marquee.json";
import skillsData from "@/data/skills.json";
import experienceData from "@/data/experience.json";
import projectsData from "@/data/projects.json";
import footerData from "@/data/footer.json";
import siteData from "@/data/site.json";
import type {
  Profile,
  MarqueeData,
  SkillsData,
  ExperienceData,
  ProjectsData,
  FooterData,
  SiteData,
} from "@/lib/types";

export const profile = profileData as Profile;
export const marquee = marqueeData as MarqueeData;
export const skills = skillsData as SkillsData;
export const experience = experienceData as ExperienceData;
export const projects = projectsData as ProjectsData;
export const footerLinks = footerData as FooterData;
export const site = siteData as SiteData;

export const featuredProjects = projects.projects.filter((p) => p.featured);

export function getProject(id: string) {
  return projects.projects.find((p) => p.id === id);
}

export function getExperience(id: string) {
  return experience.items.find((e) => e.id === id);
}

export function getRelatedProjects(id: string, limit = 3) {
  const current = getProject(id);
  if (!current) return [];
  const others = projects.projects.filter((p) => p.id !== id);
  const sameCategory = others.filter((p) => p.category === current.category);
  const sameTag = others.filter(
    (p) =>
      p.category !== current.category &&
      p.tags.some((t) => current.tags.includes(t))
  );
  const rest = others.filter(
    (p) => p.category !== current.category && !sameTag.includes(p)
  );
  return [...sameCategory, ...sameTag, ...rest].slice(0, limit);
}

export const nav = [
  { label: "Home", href: "/#top" },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#experience" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
];

export const recentExperience = experience.items.slice(0, 5);

/** Categories derived from projects (for the command palette / filters). */
export const projectCategories = Array.from(
  new Set(projects.projects.map((p) => p.category))
);

/** Experience types present in the data. */
export const experienceTypes = Array.from(
  new Set(experience.items.map((e) => e.type ?? "work"))
);
