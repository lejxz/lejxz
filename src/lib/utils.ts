import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parse a stat string like "12+" into { num: 12, suffix: "+" }. */
export function parseStatValue(value: string): { num: number; suffix: string; prefix: string } {
  const match = value.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { num: 0, suffix: "", prefix: "" };
  return { prefix: match[1], num: parseFloat(match[2]), suffix: match[3] };
}
