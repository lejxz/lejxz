import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { projects, getProject, getRelatedProjects, profile } from "@/lib/data";
import { asset } from "@/lib/asset";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { ReadingProgress } from "@/components/site/reading-progress";
import { CaseStudyToc } from "@/components/site/case-study-toc";
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
  const related = getRelatedProjects(id, 3);

  const wordCount = project.description.join(" ").split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const tocItems = [
    ...(project.highlights?.length ? [{ id: "highlights", label: "Highlights" }] : []),
    { id: "overview", label: "Overview" },
    { id: "stack", label: "Stack" },
    ...(project.gallery?.length ? [{ id: "gallery", label: "Gallery" }] : []),
    ...(related.length ? [{ id: "related", label: "Related" }] : []),
  ];

  return (
    <>
      <GrainOverlay />
      <ReadingProgress />
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-30" />

        <div className="mx-auto flex w-full max-w-6xl flex-1 gap-12 px-5 pt-28 sm:px-8 sm:pt-32">
          <CaseStudyToc items={tocItems} />
          <article className="min-w-0 flex-1">
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
              <span className="text-dim">·</span>
              <span className="text-dim">{readingTime} min read</span>
            </div>
            <h1 className="mt-4 font-mono text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-foreground/85">
              {project.summary}
            </p>
          </Reveal>

          {project.cover && (
            <Reveal delay={0.08} className="mt-8">
              <div className="group relative overflow-hidden rounded-xl border border-line">
                <div className={cn("absolute inset-x-0 top-0 h-px z-10", accentBar[project.accent])} />
                <img
                  src={asset(project.cover)}
                  alt={`${project.title} cover`}
                  className="aspect-[16/9] w-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.02]"
                  loading="eager"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
            </Reveal>
          )}

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
            <Reveal delay={0.12} className="mt-10 scroll-mt-24" id="highlights">
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

          <Reveal delay={0.14} className="mt-12 scroll-mt-24" id="overview">
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

          <Reveal delay={0.16} className="mt-10 scroll-mt-24" id="stack">
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

          {project.gallery && project.gallery.length > 0 && (
            <Reveal delay={0.18} className="mt-12 scroll-mt-24" id="gallery">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                Gallery
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.gallery.map((g, i) => (
                  <figure
                    key={`${g.caption}-${i}`}
                    className="group relative overflow-hidden rounded-lg border border-line bg-surface/40"
                  >
                    <img
                      src={asset(g.src)}
                      alt={g.caption}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/80">
                        {g.caption}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          )}

          {related.length > 0 && (
            <Reveal delay={0.2} className="mt-16 scroll-mt-24" id="related">
              <div className="border-t border-line pt-8">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                  Related
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/projects/${r.id}`}
                      className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface/40 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal/40"
                    >
                      <div>
                        <p
                          className={cn(
                            "font-mono text-[10px] uppercase tracking-wider",
                            accentText[r.accent]
                          )}
                        >
                          {r.category}
                        </p>
                        <h3 className="mt-1.5 font-mono text-base font-bold text-foreground transition-colors group-hover:text-teal">
                          {r.title}
                        </h3>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-dim">
                          {r.year}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-dim transition-all group-hover:translate-x-0.5 group-hover:text-teal" />
                      </div>
                    </Link>
                  ))}
                </div>
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
        </div>

        <Footer />
      </main>
    </>
  );
}
