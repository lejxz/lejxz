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
  email: string;
  socials: Socials;
  tagline: string;
  bio: string[];
  quote?: string;
  facts?: Fact[];
  codeBlock?: CodeBlock;
  stats: Stat[];
  numericStats?: NumericStat[];
}

export interface Fact {
  label: string;
  value: string;
}

export interface CodeBlockField {
  key: string;
  value: string;
}

export interface CodeBlock {
  variableName: string;
  fields: CodeBlockField[];
  interests: string[];
  closing: string;
}

export interface MarqueeData {
  rows: MarqueeRow[];
}

export interface MarqueeRow {
  direction: "left" | "right";
  duration: number;
  items: string[];
}

export interface SkillGroup {
  title: string;
  key: string;
  items: SkillItem[];
}

export interface SkillItem {
  name: string;
  level?: number;
  note?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  org: string;
  period: string;
  location: string;
  summary: string;
  bullets: string[];
  tags: string[];
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

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  status: "shipped" | "wip" | "archived";
  summary: string;
  description: string[];
  highlights?: ProjectHighlight[];
  role?: string;
  timeline?: string;
  tags: string[];
  links: ProjectLink[];
  featured: boolean;
  accent: "teal" | "violet";
  gallery?: ProjectGalleryItem[];
  cover?: string;
}

export interface SkillsData {
  groups: SkillGroup[];
}

export interface ExperienceData {
  items: ExperienceItem[];
}

export interface ProjectsData {
  projects: Project[];
}

export interface NowItem {
  label: string;
  value: string;
  detail?: string;
}

export interface NowData {
  updated: string;
  items: NowItem[];
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
  columns: FooterColumn[];
}

export interface UsesItem {
  name: string;
  detail?: string;
}

export interface UsesCategory {
  title: string;
  key: string;
  items: UsesItem[];
}

export interface UsesData {
  categories: UsesCategory[];
}
