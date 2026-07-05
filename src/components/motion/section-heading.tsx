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
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 select-none font-mono text-[8rem] font-bold leading-none text-foreground/[0.03] sm:text-[10rem]"
        >
          {index}
        </span>
        <div className="relative flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-dim">
          <span className="text-teal">{index}</span>
          <span className="h-px w-10 bg-line" />
          <span>{kicker}</span>
        </div>
        <h2 className="relative mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </div>
    </Reveal>
  );
}
