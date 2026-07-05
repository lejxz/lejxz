"use client";

import { cn } from "@/lib/utils";

export function SkewDivider({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative h-px w-full overflow-visible",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent",
          flip ? "rotate-[-1.2deg]" : "rotate-[1.2deg]"
        )}
      />
    </div>
  );
}
