import profileData from "@/data/profile.json";
import marqueeData from "@/data/marquee.json";
import skillsData from "@/data/skills.json";
import experienceData from "@/data/experience.json";
import projectsData from "@/data/projects.json";
import type {
  Profile,
  MarqueeData,
  SkillsData,
  ExperienceData,
  ProjectsData,
} from "@/lib/types";

export const profile = profileData as Profile;
export const marquee = marqueeData as MarqueeData;
export const skills = skillsData as SkillsData;
export const experience = experienceData as ExperienceData;
export const projects = projectsData as ProjectsData;

export const featuredProjects = projects.projects.filter((p) => p.featured);

export const nav = [
  { label: "Home", href: "/#top" },
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#experience" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
];
