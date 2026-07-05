"use client";

import { now } from "@/lib/data";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { asset } from "@/lib/asset";

export function NowSection() {
  return (
    <section id="now" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[24rem] w-[24rem] rounded-full bg-teal/8 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading index="05" kicker="Currently" title="Now" />
          <Reveal delay={0.08}>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-dim">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
              Updated {now.updated}
            </span>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {now.items.map((item, i) => {
            const inner = (
              <>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-teal/20 bg-teal/8 text-teal">
                  <Icon name={item.icon ?? "sparkles"} className="h-4 w-4" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
                  {item.label}
                </p>
                <p className="mt-1 font-mono text-base font-bold text-foreground">
                  {item.value}
                </p>
                {item.detail && (
                  <p className="mt-1.5 text-xs leading-relaxed text-dim">{item.detail}</p>
                )}
              </>
            );

            return (
              <Reveal key={i} delay={i * 0.07}>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="card-hover-glow group flex h-full flex-col rounded-2xl border border-line bg-surface/40 p-5 transition-colors hover:border-teal/30"
                  >
                    {inner}
                    <span className="mt-3 font-mono text-[10px] text-teal opacity-0 transition-opacity group-hover:opacity-100">
                      Open →
                    </span>
                  </a>
                ) : (
                  <div className="card-hover-glow flex h-full flex-col rounded-2xl border border-line bg-surface/40 p-5">
                    {inner}
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
