import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * This utility helps combine Tailwind CSS classes efficiently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
