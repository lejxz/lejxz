"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  src: string;
  caption?: string;
}

export function Gallery({
  images,
  className,
  height = "h-48 sm:h-60",
}: {
  images: GalleryImage[];
  className?: string;
  height?: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Reset to first image when the image set changes (e.g. project switch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(0);
  }, [images]);

  const n = images.length;
  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, n]);

  if (n === 0) return null;

  return (
    <>
      <div className={cn("relative overflow-hidden bg-surface-2", height, className)}>
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={asset(images[index].src)}
            alt={images[index].caption ?? `Image ${index + 1}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/70 text-foreground/80 backdrop-blur transition-colors hover:border-teal/50 hover:text-teal"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/70 text-foreground/80 backdrop-blur transition-colors hover:border-teal/50 hover:text-teal"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <span className="absolute right-2 top-2 rounded-md border border-line bg-surface/70 px-2 py-0.5 font-mono text-[10px] text-foreground/80 backdrop-blur">
              {index + 1}/{n}
            </span>
          </>
        )}

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Expand image"
          className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/70 text-foreground/80 backdrop-blur transition-colors hover:border-teal/50 hover:text-teal"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnails strip — shows below the main image when there are
          multiple images. The active thumbnail gets a teal ring + slight
          scale-up. Clicking a thumbnail jumps to that image. */}
      {n > 1 && (
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1}: ${img.caption ?? ""}`}
              className={cn(
                "relative h-10 w-16 shrink-0 overflow-hidden rounded-md border transition-all",
                i === index
                  ? "border-teal/60 ring-1 ring-teal/40 scale-105"
                  : "border-line opacity-50 hover:opacity-90 hover:border-dim"
              )}
            >
              <img
                src={asset(img.src)}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 p-4 backdrop-blur-md"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close lightbox"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/70 text-foreground transition-colors hover:text-teal"
            >
              <X className="h-5 w-5" />
            </button>
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={asset(images[index].src)}
                alt={images[index].caption ?? `Image ${index + 1}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/70 text-foreground transition-colors hover:text-teal"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/70 text-foreground transition-colors hover:text-teal"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
