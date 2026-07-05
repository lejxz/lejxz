"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Sparkles, Github, Linkedin, Instagram, Mail } from "lucide-react";
import { profile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { HeroDiorama } from "@/components/sections/hero-diorama";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const yDiorama = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.75], [1, 0.96]);

  const socials = [
    { icon: Github, href: profile.socials.github ?? "#", label: "GitHub" },
    { icon: Linkedin, href: profile.socials.linkedin ?? "#", label: "LinkedIn" },
    { icon: Instagram, href: profile.socials.instagram ?? "#", label: "Instagram" },
    { icon: Mail, href: `mailto:${profile.email}`, label: "Email" },
  ];

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[26rem] w-[26rem] rounded-full bg-violet/10 blur-[130px]" />

      <motion.div
        style={{ y: yContent, opacity, scale }}
        className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-28 sm:px-8 lg:grid-cols-2 lg:gap-8"
      >
        {/* Left: text */}
        <div className="flex flex-col items-start gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-3.5 py-1.5 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
            </span>
            <span className="font-mono text-xs text-foreground/80">
              {profile.availability}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-mono text-sm text-teal"
          >
            <span className="text-dim">$</span> whoami
            <span className="ml-0.5 inline-block h-4 w-2 animate-blink bg-teal align-middle" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="font-mono text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="block text-foreground">{profile.name.split(" ")[0]}</span>
            <span className="block text-gradient-shimmer">
              {profile.name.split(" ").slice(1).join(" ")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="font-mono text-base text-foreground/90 sm:text-lg"
          >
            <span className="text-violet">{">"}</span>{" "}
            {profile.role} · <span className="text-teal">{profile.field}</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="max-w-xl text-pretty text-base leading-relaxed text-dim sm:text-lg"
          >
            {profile.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.44 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              className="gap-2 bg-teal text-primary-foreground hover:bg-teal/90"
              onClick={() =>
                document
                  .getElementById("work")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Sparkles className="h-4 w-4" />
              Explore My Work
            </Button>
            <Link href="/#contact">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-line bg-transparent font-mono hover:border-teal/50 hover:text-teal"
              >
                ./contact.sh
              </Button>
            </Link>
          </motion.div>

          {/* Socials */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
            className="flex items-center gap-3 pt-1"
          >
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-dim transition-all hover:border-teal/50 hover:text-teal"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </motion.div>

          {/* Quick profile stats — surfaces profile.stats data */}
          {profile.stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center gap-2 pt-3"
            >
              {profile.stats.map((stat, i) => (
                <span
                  key={stat.label}
                  className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/40 px-3 py-1.5 backdrop-blur-sm transition-colors hover:border-teal/40"
                >
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider text-dim"
                    style={{ color: i % 2 === 0 ? "var(--color-teal)" : "var(--color-violet)" }}
                  >
                    {stat.label}
                  </span>
                  <span className="h-3 w-px bg-line" />
                  <span className="font-mono text-xs font-medium text-foreground/90">
                    {stat.value}
                  </span>
                </span>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right: 3D diorama */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ y: yDiorama }}
          className="relative"
        >
          <HeroDiorama />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        style={{ opacity }}
        onClick={() =>
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-dim transition-colors hover:text-teal"
        aria-label="Scroll down"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest">scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.button>
    </section>
  );
}
