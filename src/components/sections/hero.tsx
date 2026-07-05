"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.96]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-[120px] animate-orb-1" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-violet/10 blur-[140px] animate-orb-2" />
      <motion.div
        style={{ y, opacity, scale }}
        className="relative mx-auto w-full max-w-7xl px-5 pt-24 sm:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
            {profile.availability}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-dim">
            <span className="text-teal">~</span>
            <span>cs.ai</span>
            <span className="text-dim/50">/</span>
            <span>student</span>
            <span className="text-dim/50">/</span>
            <span className="text-violet">{profile.location}</span>
            <span className="ml-1 inline-block h-3.5 w-2 animate-blink bg-teal align-middle" />
          </div>
          <p className="font-mono text-sm text-teal">{"// "}{profile.penname}</p>
          <h1 className="mt-2 font-mono text-[15vw] font-bold leading-[0.9] tracking-tighter sm:text-[12vw] md:text-[9rem] lg:text-[11rem]">
            <span className="text-gradient">Lejuene</span>
            <br />
            <span className="text-foreground">Delantar</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-xl">
            <p className="font-mono text-sm uppercase tracking-[0.15em] text-foreground">
              {profile.role}
              <span className="mx-2 text-dim">—</span>
              <span className="text-violet">{profile.field}</span>
            </p>
            <p className="mt-4 text-pretty text-base text-dim sm:text-lg">
              {profile.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Magnetic>
              <Link href="/#work">
                <Button className="gap-2 rounded-full bg-teal px-6 text-primary-foreground hover:bg-teal/90">
                  View Work
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/#contact">
                <Button
                  variant="outline"
                  className="rounded-full border-line px-6 font-mono text-sm hover:border-teal/50 hover:text-teal"
                >
                  Contact
                </Button>
              </Link>
            </Magnetic>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4"
        >
          {profile.stats.map((stat) => (
            <div key={stat.label} className="bg-background p-4 sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                {stat.label}
              </p>
              <p className="mt-1.5 font-mono text-lg font-bold text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
          Scroll
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce text-dim" />
      </motion.div>
    </section>
  );
}
