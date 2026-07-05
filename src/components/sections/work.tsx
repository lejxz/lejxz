"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featuredProjects } from "@/lib/data";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/project/project-card";

export function Work() {
  return (
    <section id="work" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading index="05" kicker="Selected Work" title="Projects" />
          <Reveal delay={0.1}>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:border-teal/50 hover:text-teal"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.06}>
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
