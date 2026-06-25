import type { Commit } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

export function groupBy(commits: Commit[], key: keyof Commit): Record<string, number> {
  return commits.reduce<Record<string, number>>((acc, c) => {
    const k = c[key] as string;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

export function lastCommitAgo(commits: Commit[], category: string): string | null {
  const filtered = commits.filter((c) => c.category === category);
  if (!filtered.length) return null;
  const latest = filtered.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
  return formatDistanceToNow(new Date(latest.date), { addSuffix: true, locale: enUS });
}

export function buildTimeline(commits: Commit[]): { label: string; count: number }[] {
  const buckets: Record<string, number> = {};
  commits.forEach((c) => {
    const key = format(new Date(c.date), "MMM d", { locale: enUS });
    buckets[key] = (buckets[key] ?? 0) + 1;
  });
  return Object.entries(buckets)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-20)
    .map(([label, count]) => ({ label, count }));
}
