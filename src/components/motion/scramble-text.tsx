"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?/\\<>{}[]";

/**
 * useTextScramble — returns the current displayed text for a scramble
 * animation. When `trigger` increments (or the target text changes), the
 * text scrambles through random characters then resolves to the target.
 *
 * Usage: call with a target text, and increment `trigger` to replay.
 */
export function useTextScramble(target: string, trigger: number = 0, duration = 600) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    // On first mount, just show the target without scrambling.
    if (startRef.current === 0 && trigger === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(target);
      return;
    }

    const targetChars = target.split("");
    const startTime = performance.now();
    startRef.current = startTime;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Number of characters that have "resolved" to their final value.
      const resolvedCount = Math.floor(progress * targetChars.length);
      // Scramble intensity fades out as progress → 1.
      const scrambleIntensity = 1 - progress;

      const next = targetChars
        .map((ch, i) => {
          // Non-alphanumeric characters (spaces, punctuation) stay fixed.
          if (!/[a-zA-Z0-9]/.test(ch)) return ch;
          if (i < resolvedCount) return ch;
          // Randomly scramble, but only with `scrambleIntensity` probability
          // so the text becomes more readable as it resolves.
          if (Math.random() > scrambleIntensity) return ch;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");

      setDisplay(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, trigger, duration]);

  return display;
}

/**
 * ScrambleText — a span that scrambles its text on hover (or when `trigger`
 * changes). Useful for headings, names, and labels that want a "hacker"
 * decode effect on interaction.
 */
export function ScrambleText({
  text,
  className,
  onHover = true,
  duration = 500,
}: {
  text: string;
  className?: string;
  onHover?: boolean;
  duration?: number;
}) {
  const [trigger, setTrigger] = useState(0);
  const display = useTextScramble(text, trigger, duration);

  const replay = useCallback(() => setTrigger((t) => t + 1), []);

  return (
    <span
      className={className}
      onMouseEnter={onHover ? replay : undefined}
      aria-label={text}
    >
      {display}
    </span>
  );
}
