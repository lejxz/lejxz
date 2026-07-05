import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Terminal } from "lucide-react";
import { GrainOverlay } from "@/components/site/grain-overlay";
import { Reveal } from "@/components/motion/reveal";
import { profile } from "@/lib/data";

export default function NotFound() {
  return (
    <>
      <GrainOverlay />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-20">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-violet/10 blur-[120px]" />

        <Reveal className="w-full max-w-lg text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
            <Terminal className="h-3 w-3 text-violet" />
            <span>exit code 404</span>
          </div>

          <h1 className="font-mono text-7xl font-bold tracking-tighter text-gradient sm:text-9xl">
            404
          </h1>

          <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface/50">
            <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
              <span className="ml-2 font-mono text-[10px] text-dim">~/lejxz/shell</span>
            </div>
            <div className="p-4 text-left font-mono text-xs">
              <p className="text-dim">
                <span className="text-teal">$</span> cd /{`{requested_path}`}
              </p>
              <p className="mt-1 text-violet">path does not exist</p>
              <p className="mt-2 flex items-center text-dim">
                <span className="text-teal">$</span>
                <span className="ml-2">suggest --recover</span>
                <span className="ml-1 inline-block h-3.5 w-2 animate-blink bg-teal align-middle" />
              </p>
            </div>
          </div>

          <p className="mt-6 text-pretty text-dim">
            The page you&apos;re looking for has moved, been archived, or never existed.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#top"
              className="group inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-primary-foreground transition-all hover:glow-teal"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back home
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-teal/50 hover:text-teal"
            >
              Browse projects
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-dim/60">
            or reach out —{" "}
            <a
              href={`mailto:${profile.email}`}
              className="text-teal transition-colors hover:text-violet"
            >
              {profile.email}
            </a>
          </p>
        </Reveal>
      </main>
    </>
  );
}
