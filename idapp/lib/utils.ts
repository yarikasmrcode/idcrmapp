import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes while removing conflicts.
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
