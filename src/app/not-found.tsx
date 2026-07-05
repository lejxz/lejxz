"use client";

import Link from "next/link";
import { Terminal, ArrowLeft, Home } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-24">
        {/* ambient glows */}
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-[130px]" />
        <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[26rem] w-[26rem] rounded-full bg-violet/10 blur-[130px]" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

        <div className="relative flex flex-col items-center text-center">
          {/* terminal-style header */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
            <span className="font-mono text-xs text-foreground/80">
              error · signal lost
            </span>
          </div>

          {/* glitch 404 */}
          <h1
            data-text="404"
            className="glitch select-none font-mono text-[8rem] font-bold leading-none tracking-tighter text-gradient-shimmer sm:text-[12rem]"
          >
            404
          </h1>

          <h2 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            This page could not be found.
          </h2>

          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-dim sm:text-base">
            <span className="font-mono text-violet">&gt;</span>{" "}
            <span className="font-mono text-teal">cd</span> the route you requested
            doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          {/* terminal fake error block */}
          <pre className="mt-6 max-w-md overflow-x-auto rounded-xl border border-line bg-surface/60 p-4 text-left font-mono text-[11px] leading-relaxed text-dim shadow-2xl shadow-black/40">
            <code>
              <span className="text-destructive">traceback</span> (most recent call last):
              {"\n"}
              <span className="text-dim/70">  File</span>{" "}
              <span className="text-teal/80">&quot;router.tsx&quot;</span>, line{" "}
              <span className="text-violet/90">42</span>
              {"\n"}
              <span className="text-dim/70">    route =</span>{" "}
              <span className="text-violet/90">resolve(request.path)</span>
              {"\n"}
              <span className="text-destructive">RouteNotFoundError</span>: no match for{" "}
              <span className="text-teal/80">&quot;{typeof window !== "undefined" ? window.location.pathname : "/…"}</span>&quot;
            </code>
          </pre>

          {/* actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/">
              <Button
                size="lg"
                className="gap-2 bg-teal text-primary-foreground hover:bg-teal/90"
              >
                <Home className="h-4 w-4" />
                Back to home
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-line bg-transparent font-mono hover:border-teal/50 hover:text-teal"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              ./go-back.sh
            </Button>
          </div>

          {/* quick links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-xs text-dim">
            <Link href="/#about" className="transition-colors hover:text-teal">
              ~/about
            </Link>
            <span className="text-dim/40">·</span>
            <Link href="/#skills" className="transition-colors hover:text-teal">
              ~/skills
            </Link>
            <span className="text-dim/40">·</span>
            <Link href="/#work" className="transition-colors hover:text-teal">
              ~/work
            </Link>
            <span className="text-dim/40">·</span>
            <Link href="/#contact" className="transition-colors hover:text-teal">
              ~/contact
            </Link>
            <span className="text-dim/40">·</span>
            <Link
              href="/#top"
              className="inline-flex items-center gap-1 transition-colors hover:text-teal"
            >
              <Terminal className="h-3 w-3" />
              ⌘K to search
            </Link>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
