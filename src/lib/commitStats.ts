import type { Commit } from "@/types";

export function groupBy(commits: Commit[], key: keyof Commit): Record<string, number> {
  return commits.reduce<Record<string, number>>((acc, c) => {
    const k = c[key] as string;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}
