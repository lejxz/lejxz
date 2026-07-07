// Unified content types for the lejxz portfolio.
// These mirror the JSON files in src/data/ and are the single source of
// truth for the dashboard editor too.

export type IconName = string;

export interface Socials {
  github?: string;
  instagram?: string;
  linkedin?: string;
  email?: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface NumericStat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

export interface Profile {
  name: string;
  penname: string;
  role: string;
  field: string;
  location: string;
  availability: string;
  availabilityNote?: string;
  email: string;
  socials: Socials;
  tagline: string;
  stats: Stat[];
  numericStats?: NumericStat[];
  contactNote?: string;
}

export interface MarqueeData {
  rows: MarqueeRow[];
}

export interface MarqueeRow {
  direction: "left" | "right";
  duration: number;
  items: string[];
}

export interface SkillItem {
  name: string;
  level: number;
  description?: string;
  note?: string;
}

export interface SkillGroup {
  title: string;
  key: string;
  icon: IconName;
  blurb?: string;
  items: SkillItem[];
}

export interface SkillsData {
  heading?: string;
  subtitle?: string;
  groups: SkillGroup[];
  marquee?: string[];
}

export type ExperienceType = "work" | "education" | "research" | "award";

export interface ExperienceItem {
  id: string;
  type?: ExperienceType;
  role: string;
  org: string;
  organization?: string;
  orgUrl?: string;
  period: string;
  location: string;
  current?: boolean;
  summary: string;
  description?: string[];
  bullets: string[];
  achievements?: string[];
  tech: string[];
  tags: string[];
  logo?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectHighlight {
  label: string;
  value: string;
}

export interface ProjectGalleryItem {
  caption: string;
  src: string;
}

export type ProjectStatus = "shipped" | "wip" | "archived";

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  year: string;
  status: ProjectStatus;
  summary: string;
  description: string[];
  highlights: ProjectHighlight[];
  highlightList?: string[];
  role?: string;
  duration?: string;
  timeline?: string;
  tech?: string[];
  tags: string[];
  links: ProjectLink[];
  featured: boolean;
  accent: "teal" | "violet";
  cover?: string;
  thumbnail?: string;
  gallery?: ProjectGalleryItem[];
  galleryImages?: string[];
}

export interface ExperienceData {
  items: ExperienceItem[];
}

export interface ProjectsData {
  projects: Project[];
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterData {
  note?: string;
  builtWith?: string;
  copyright?: string;
  columns: FooterColumn[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteData {
  nav: NavItem[];
}
