/** Shared utility functions. */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  return `${hr} hour${hr === 1 ? "" : "s"} ago`;
}

export function classifySignal(s: string): "critical" | "warning" | "healthy" {
  if (
    /archived|disabled|abandoned|No recent commits|No commit activity|explicitly marks this project as deprecated/i.test(s)
  ) {
    return "critical";
  }
  const longGap = s.match(/No commits in the last (\d+) months/);
  if (longGap && Number(longGap[1]) >= 12) return "critical";
  if (
    /velocity up|very responsive|active contributors|community platform|Financially supported|Discussions enabled|help wanted/i.test(s)
  ) {
    return "healthy";
  }
  return "warning";
}
