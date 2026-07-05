import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { projects, getProject, profile } from "@/lib/data";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.projects.map((p) => ({ id: p.id }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return params.then(({ id }) => {
    const project = getProject(id);
    if (!project) return { title: "Not found — lejxz" };
    return {
      title: `${project.title} — lejxz`,
      description: project.summary,
    };
  });
}

const statusLabel: Record<string, string> = {
  shipped: "Shipped",
  wip: "In Progress",
  archived: "Archived",
};

const accentText: Record<string, string> = {
  teal: "text-teal",
  violet: "text-violet",
};

const accentBar: Record<string, string> = {
  teal: "bg-teal",
  violet: "bg-violet",
};

export default async function ProjectCaseStudy({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const idx = projects.projects.findIndex((p) => p.id === id);
  const next = projects.projects[(idx + 1) % projects.projects.length];

  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-30" />

        <article className="mx-auto w-full max-w-4xl flex-1 px-5 pt-28 sm:px-8 sm:pt-32">
          <Reveal>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-teal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Projects
            </Link>
          </Reveal>

          <Reveal delay={0.05} className="mt-10">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider">
              <span className={cn(accentText[project.accent])}>
                {project.category}
              </span>
              <span className="text-dim">·</span>
              <span className="text-dim">{project.year}</span>
              <span className="text-dim">·</span>
              <span className="flex items-center gap-1.5 text-dim">
                <span className={cn("h-1.5 w-1.5 rounded-full", accentBar[project.accent])} />
                {statusLabel[project.status]}
              </span>
            </div>
            <h1 className="mt-4 font-mono text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-foreground/85">
              {project.summary}
            </p>
          </Reveal>

          {(project.role || project.timeline) && (
            <Reveal delay={0.1} className="mt-8">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                {project.role && (
                  <div className="bg-background p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                      Role
                    </p>
                    <p className="mt-1.5 font-mono text-sm font-bold text-foreground">
                      {project.role}
                    </p>
                  </div>
                )}
                {project.timeline && (
                  <div className="bg-background p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                      Timeline
                    </p>
                    <p className="mt-1.5 font-mono text-sm font-bold text-foreground">
                      {project.timeline}
                    </p>
                  </div>
                )}
                <div className="bg-background p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                    Status
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-bold text-foreground">
                    {statusLabel[project.status]}
                  </p>
                </div>
                <div className="bg-background p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                    Year
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-bold text-foreground">
                    {project.year}
                  </p>
                </div>
              </div>
            </Reveal>
          )}

          {project.highlights && project.highlights.length > 0 && (
            <Reveal delay={0.12} className="mt-10">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                Highlights
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {project.highlights.map((h) => (
                  <div
                    key={h.label}
                    className="rounded-xl border border-line bg-surface/50 p-4"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                      {h.label}
                    </p>
                    <p
                      className={cn(
                        "mt-2 font-mono text-xl font-bold",
                        accentText[project.accent]
                      )}
                    >
                      {h.value}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.14} className="mt-12">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              Overview
            </p>
            <div className="space-y-4">
              {project.description.map((para, i) => (
                <p
                  key={i}
                  className="text-pretty text-base leading-relaxed text-foreground/90"
                >
                  {para}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.16} className="mt-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded border-line font-mono text-xs text-dim"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Reveal>

          {project.links.length > 0 && (
            <Reveal delay={0.18} className="mt-10">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                Links
              </p>
              <div className="flex flex-wrap gap-3">
                {project.links.map((link, i) => (
                  <a
                    key={`${link.label}-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-teal/50 hover:text-teal"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {link.label}
                  </a>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.2} className="mt-16">
            <div className="flex items-center justify-between border-t border-line pt-8">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-teal"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                All Projects
              </Link>
              <Link
                href={`/projects/${next.id}`}
                className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-teal"
              >
                Next: {next.title}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.22} className="mt-16">
            <Link
              href={`mailto:${profile.email}`}
              className="block rounded-xl border border-line bg-surface/40 p-6 text-center transition-colors hover:border-teal/40"
            >
              <p className="font-mono text-xs text-teal">{"// want to collaborate?"}</p>
              <p className="mt-2 font-mono text-lg font-bold text-foreground">
                {profile.email}
              </p>
            </Link>
          </Reveal>
        </article>

        <Footer />
      </main>
    </>
  );
}
