"use client";

import { Reveal } from "./reveal";

export function SectionHeading({
  index,
  kicker,
  title,
  className,
}: {
  index: string;
  kicker: string;
  title: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-dim">
        <span className="text-teal">{index}</span>
        <span className="h-px w-10 bg-line" />
        <span>{kicker}</span>
      </div>
      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
