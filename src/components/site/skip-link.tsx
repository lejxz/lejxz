"use client";

import Link from "next/link";

export function SkipLink() {
  return (
    <Link
      href="/#top"
      className="sr-only z-[110] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-md focus:border focus:border-teal/50 focus:bg-background focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-teal"
    >
      Skip to content
    </Link>
  );
}
