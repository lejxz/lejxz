"use client";

import { useState, type SyntheticEvent } from "react";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

/**
 * ProjectImage — a resilient cover image for project cards/tiles/modals.
 *
 * Why this exists: the project data JSON points at `/assets/projects/<id>.png`
 * for each project. If a cover file is ever missing or fails to load (404,
 * network blip, corrupted file), a plain <img> renders the browser's broken-
 * image icon — which looks broken and unprofessional.
 *
 * This component swaps to a polished gradient monogram fallback the moment the
 * <img> fires `onError` (or when `src` is empty). The fallback uses the
 * project's accent color (teal/violet) and the project's first letter, so it
 * always feels intentional and on-brand.
 *
 * Used by: ProjectTile, SpotlightCard (work.tsx), ProjectCard (project-card.tsx),
 * and the Gallery (gallery.tsx).
 */
export function ProjectImage({
  src,
  alt,
  title,
  accent = "teal",
  className,
  imgClassName,
  size = "md",
}: {
  src?: string | null;
  alt: string;
  /** Project title — used for the monogram initial in the fallback. */
  title: string;
  /** Accent channel: "teal" (default) or "violet". */
  accent?: "teal" | "violet";
  /** Wrapper className (controls sizing/positioning). */
  className?: string;
  /** <img> className (controls object-fit etc). */
  imgClassName?: string;
  /** Monogram size: "sm" (grid compact), "md" (grid tile), "lg" (spotlight). */
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  // No src or already-failed → show the gradient monogram fallback immediately.
  if (!src || failed) {
    const monoSize =
      size === "lg" ? "text-6xl" : size === "sm" ? "text-lg" : "text-4xl";
    const accentText = accent === "violet" ? "text-violet" : "text-teal";
    const accentBg =
      accent === "violet"
        ? "from-violet/15 to-transparent"
        : "from-teal/15 to-transparent";

    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br",
          accentBg,
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <div className="flex flex-col items-center gap-2">
          <span className={cn("font-mono font-bold", monoSize, accentText)}>
            {title.charAt(0).toUpperCase()}
          </span>
          {/* subtle accent dot row — gives the fallback a "designed" feel */}
          <span className="flex gap-1">
            <span className={cn("h-1 w-1 rounded-full", accentText, "opacity-40")} />
            <span className={cn("h-1 w-1 rounded-full", accentText, "opacity-70")} />
            <span className={cn("h-1 w-1 rounded-full", accentText, "opacity-40")} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={asset(src)}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={(e: SyntheticEvent<HTMLImageElement>) => {
        // Guard against infinite loops: once failed, the fallback renders
        // (no <img>), so onError can't re-fire.
        setFailed(true);
        // Reset the src to prevent the browser keeping a broken-image state.
        e.currentTarget.removeAttribute("src");
      }}
      className={cn("h-full w-full object-cover", imgClassName, className)}
    />
  );
}
