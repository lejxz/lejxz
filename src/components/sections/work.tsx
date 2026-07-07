"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/data";
import type { Project } from "@/lib/types";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { useModals } from "@/lib/modals";
import { cn } from "@/lib/utils";

const VIEW_W = 900;
const VIEW_H = 420;

/**
 * Compute a deterministic 2D position for each project based on its category
 * and index. Categories cluster horizontally; projects within a category
 * spread vertically. A small deterministic jitter (from the project ID hash)
 * prevents perfect alignment so it feels organic like a real constellation.
 */
function computePositions(projectList: Project[]) {
  // Assign each unique category an X center.
  const cats = Array.from(new Set(projectList.map((p) => p.category)));
  const catX: Record<string, number> = {};
  cats.forEach((c, i) => {
    catX[c] = cats.length === 1
      ? VIEW_W / 2
      : 150 + ((VIEW_W - 300) * i) / (cats.length - 1);
  });

  // Within each category, spread projects vertically.
  const catCounts: Record<string, number> = {};
  const catIndices: Record<string, number> = {};
  projectList.forEach((p) => {
    catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;
  });

  return projectList.map((p) => {
    const ci = catIndices[p.category] ?? 0;
    catIndices[p.category] = ci + 1;
    const count = catCounts[p.category];
    const baseY = 80 + ((ci + 0.5) / count) * (VIEW_H - 160);
    // Deterministic jitter from project ID
    const hash = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const jitterX = ((hash % 7) - 3) * 8;
    const jitterY = ((hash % 5) - 2) * 6;
    return {
      ...p,
      x: catX[p.category] + jitterX,
      y: baseY + jitterY,
    };
  });
}

/** Find edges between projects that share at least 1 tech tag. */
function computeEdges(projectList: Project[]) {
  const edges: { from: string; to: string; shared: string[] }[] = [];
  for (let i = 0; i < projectList.length; i++) {
    for (let j = i + 1; j < projectList.length; j++) {
      const t1 = new Set(projectList[i].tech ?? projectList[i].tags);
      const t2 = new Set(projectList[j].tech ?? projectList[j].tags);
      const shared = [...t1].filter((t) => t2.has(t));
      if (shared.length > 0) {
        edges.push({ from: projectList[i].id, to: projectList[j].id, shared });
      }
    }
  }
  return edges;
}

export function Work() {
  const { openProject } = useModals();
  const [hovered, setHovered] = useState<string | null>(null);
  const hasMore = projects.projects.length > 4;

  const nodes = useMemo(() => computePositions(projects.projects), []);
  const edges = useMemo(() => computeEdges(projects.projects), []);

  const hoveredNode = hovered ? nodes.find((n) => n.id === hovered) : null;
  // Edges connected to the hovered node are highlighted
  const isEdgeHighlighted = (e: { from: string; to: string }) =>
    hovered !== null && (e.from === hovered || e.to === hovered);

  return (
    <section id="work" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="03" kicker="Selected work" title={projects.heading ?? "Projects"} />

        {(projects.subtitle ?? "") && (
          <Reveal delay={0.06}>
            <p className="mt-3 max-w-2xl text-pretty text-base text-dim sm:text-lg">
              {projects.subtitle}
            </p>
          </Reveal>
        )}

        {/* Constellation map */}
        <Reveal delay={0.1}>
          <div className="mt-8 overflow-x-auto">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="w-full min-w-[640px]"
              style={{ height: "auto" }}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Project constellation map — stars connected by shared technologies"
            >
              {/* Background star field — decorative faint dots */}
              {Array.from({ length: 40 }).map((_, i) => {
                const x = (i * 137.5) % VIEW_W;
                const y = (i * 89.3) % VIEW_H;
                return (
                  <circle
                    key={`bg-star-${i}`}
                    cx={x}
                    cy={y}
                    r={i % 3 === 0 ? 1 : 0.5}
                    fill="var(--color-foreground)"
                    opacity={0.06 + (i % 4) * 0.02}
                  />
                );
              })}

              {/* Connection lines (constellation edges) */}
              {edges.map((e, i) => {
                const from = nodes.find((n) => n.id === e.from);
                const to = nodes.find((n) => n.id === e.to);
                if (!from || !to) return null;
                const highlighted = isEdgeHighlighted(e);
                return (
                  <g key={`edge-${i}`}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="var(--color-teal)"
                      strokeWidth={highlighted ? 1.5 : 0.8}
                      strokeDasharray={highlighted ? "0" : "3 5"}
                      opacity={highlighted ? 0.4 : 0.12}
                      style={{ transition: "opacity 0.3s, stroke-width 0.3s" }}
                    />
                    {/* Shared tech label on highlighted edges */}
                    {highlighted && (
                      <text
                        x={(from.x + to.x) / 2}
                        y={(from.y + to.y) / 2 - 4}
                        textAnchor="middle"
                        fill="var(--color-teal)"
                        fontSize={9}
                        fontFamily="var(--font-space-mono), monospace"
                        opacity={0.7}
                      >
                        {e.shared.join(", ")}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Project stars (nodes) */}
              {nodes.map((node, i) => {
                const techCount = (node.tech ?? node.tags).length;
                const r = node.featured ? 16 : 11 + Math.min(techCount, 6);
                const isHovered = hovered === node.id;
                const isDimmed = hovered !== null && !isHovered && !edges.some(
                  (e) => (e.from === hovered && e.to === node.id) || (e.to === hovered && e.from === node.id)
                );
                return (
                  <motion.g
                    key={node.id}
                    onClick={() => openProject(node, projects.projects)}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 16,
                    }}
                    style={{ cursor: "pointer", transition: "opacity 0.3s", opacity: isDimmed ? 0.3 : 1 }}
                  >
                    {/* Glow halo */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + (isHovered ? 12 : 6)}
                      fill="var(--color-teal)"
                      opacity={isHovered ? 0.15 : node.featured ? 0.08 : 0.04}
                      style={{ transition: "opacity 0.3s, r 0.3s" }}
                    />
                    {/* Star core — filled circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={node.featured ? "var(--color-teal)" : "var(--color-surface)"}
                      stroke="var(--color-teal)"
                      strokeWidth={node.featured ? 0 : 1.5}
                      opacity={isDimmed ? 0.4 : 1}
                      style={{ transition: "opacity 0.3s" }}
                    />
                    {/* Inner brightness — scales with tech count */}
                    {!node.featured && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r - 4}
                        fill="var(--color-teal)"
                        opacity={(0.1 + Math.min(techCount, 8) * 0.03) * (isDimmed ? 0.3 : 1)}
                        style={{ transition: "opacity 0.3s" }}
                      />
                    )}
                    {/* Featured star marker — a small ★ above the node */}
                    {node.featured && (
                      <text
                        x={node.x}
                        y={node.y - r - 8}
                        textAnchor="middle"
                        fill="var(--color-teal)"
                        fontSize={10}
                        opacity={0.7}
                      >
                        ★
                      </text>
                    )}
                    {/* Project title below the star */}
                    <text
                      x={node.x}
                      y={node.y + r + 16}
                      textAnchor="middle"
                      fill={isHovered ? "var(--color-teal)" : "var(--color-foreground)"}
                      fontSize={12}
                      fontFamily="var(--font-space-mono), monospace"
                      fontWeight={node.featured ? 700 : 500}
                      opacity={isDimmed ? 0.3 : 0.85}
                      style={{ transition: "opacity 0.3s, fill 0.2s", pointerEvents: "none" }}
                    >
                      {node.title}
                    </text>
                    {/* Category label below title */}
                    <text
                      x={node.x}
                      y={node.y + r + 30}
                      textAnchor="middle"
                      fill="var(--color-dim)"
                      fontSize={9}
                      fontFamily="var(--font-space-mono), monospace"
                      opacity={isDimmed ? 0.2 : 0.5}
                      style={{ transition: "opacity 0.3s", pointerEvents: "none" }}
                    >
                      {node.category}
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </div>
        </Reveal>

        {/* Hover preview card — slides in below the constellation */}
        <AnimatePresence mode="wait">
          {hoveredNode ? (
            <motion.div
              key={hoveredNode.id}
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="card-hover-glow mt-2 flex flex-col gap-4 rounded-2xl border border-line bg-surface/75 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                {/* Left: star icon + category */}
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
                  <span className="font-mono text-3xl text-teal">★</span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
                      {hoveredNode.category}
                    </p>
                    <p className="font-mono text-[10px] text-dim/60">
                      {hoveredNode.year} · {(hoveredNode.tech ?? hoveredNode.tags).length} tech
                    </p>
                  </div>
                </div>
                {/* Middle: title + summary */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-mono text-lg font-bold text-foreground sm:text-xl">
                    {hoveredNode.title}
                  </h3>
                  {hoveredNode.subtitle && (
                    <p className="text-sm text-dim">{hoveredNode.subtitle}</p>
                  )}
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/70 sm:text-sm">
                    {hoveredNode.summary}
                  </p>
                  {/* Tech tags */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(hoveredNode.tech ?? hoveredNode.tags).slice(0, 6).map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-line bg-surface-2/60 px-2 py-0.5 font-mono text-[10px] text-foreground/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Right: open button */}
                <div className="flex shrink-0 items-center gap-2 self-end font-mono text-xs text-teal sm:self-center">
                  <span>View case study</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-teal/30 transition-transform group-hover:-translate-y-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center justify-center gap-3 rounded-2xl border border-dashed border-line p-4 text-center"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
                ✦
              </span>
              <p className="font-mono text-xs text-dim">
                Hover a star to preview · click to open the case study · lines = shared tech
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View all link */}
        {hasMore && (
          <Reveal delay={0.1}>
            <div className="mt-8 flex justify-center">
              <Link
                href="/projects/"
                className="group inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-5 py-2 font-mono text-xs text-teal transition-colors hover:bg-teal/20"
              >
                View all {projects.projects.length} projects
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
