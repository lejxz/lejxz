import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  Twitter,
  Brain,
  Cpu,
  Code,
  Code2,
  Layout,
  Wrench,
  Sparkles,
  Network,
  Boxes,
  Binary,
  GraduationCap,
  Award,
  Microscope,
  Book,
  Briefcase,
  Terminal,
  Layers,
  Database,
  Cloud,
  GitBranch,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REGISTRY: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
  twitter: Twitter,
  brain: Brain,
  cpu: Cpu,
  code: Code,
  code2: Code2,
  layout: Layout,
  wrench: Wrench,
  sparkles: Sparkles,
  network: Network,
  boxes: Boxes,
  binary: Binary,
  "graduation-cap": GraduationCap,
  graduation: GraduationCap,
  award: Award,
  microscope: Microscope,
  book: Book,
  briefcase: Briefcase,
  terminal: Terminal,
  layers: Layers,
  database: Database,
  cloud: Cloud,
  git: GitBranch,
  "git-branch": GitBranch,
  globe: Globe,
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export function Icon({ name, className, ...rest }: IconProps) {
  const Cmp = REGISTRY[name] ?? Sparkles;
  return (
    <Cmp
      className={cn("h-5 w-5", className)}
      aria-hidden
      {...rest}
    />
  );
}
