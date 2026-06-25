import type { Commit } from "@/types";
import { format, formatDistanceToNow, differenceInDays, startOfWeek, startOfMonth } from "date-fns";
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
  const latest = filtered.reduce((a, b) => (new Date(a.date) > new Date(b.date) ? a : b));
  return formatDistanceToNow(new Date(latest.date), { addSuffix: true, locale: enUS });
}

export function buildTimeline(commits: Commit[]): { label: string; count: number }[] {
  if (!commits.length) return [];

  const dates = commits.map((c) => new Date(c.date));
  const oldest = new Date(Math.min(...dates.map((d) => d.getTime())));
  const newest = new Date(Math.max(...dates.map((d) => d.getTime())));
  const spanDays = differenceInDays(newest, oldest);

  const buckets: Record<string, { key: string; label: string; count: number }> = {};

  commits.forEach((c) => {
    const d = new Date(c.date);
    let sortKey: string;
    let label: string;

    if (spanDays <= 60) {
      sortKey = format(d, "yyyy-MM-dd");
      label = format(d, "MMM d", { locale: enUS });
    } else if (spanDays <= 365) {
      const w = startOfWeek(d, { weekStartsOn: 1 });
      sortKey = format(w, "yyyy-MM-dd");
      label = format(w, "MMM d", { locale: enUS });
    } else {
      const m = startOfMonth(d);
      sortKey = format(m, "yyyy-MM");
      label = format(m, "MMM yyyy", { locale: enUS });
    }

    if (!buckets[sortKey]) buckets[sortKey] = { key: sortKey, label, count: 0 };
    buckets[sortKey].count++;
  });

  return Object.values(buckets)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-20)
    .map(({ label, count }) => ({ label, count }));
}
