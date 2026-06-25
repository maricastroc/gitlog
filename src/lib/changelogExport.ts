import type { Commit } from "@/types";
import { catStyle } from "@/lib/categoryStyles";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

type Grouping = "none" | "month" | "week";

function periodKey(date: string, grouping: Grouping): string {
  const d = new Date(date);
  if (grouping === "month") return format(d, "MMMM yyyy", { locale: enUS });
  if (grouping === "week")  return `Week of ${format(d, "MMM d, yyyy", { locale: enUS })}`;
  return "";
}

export function groupByPeriod(commits: Commit[], grouping: Grouping): { period: string; commits: Commit[] }[] {
  if (grouping === "none") return [{ period: "", commits }];
  const map = new Map<string, Commit[]>();
  for (const c of commits) {
    const key = periodKey(c.date, grouping);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return [...map.entries()]
    .sort((a, b) => new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime())
    .map(([period, commits]) => ({ period, commits }));
}

type ExportInput = {
  groups: Record<string, Commit[]>;
  sorted: string[];
  grouping: Grouping;
  range: { from?: string; to?: string };
};

export function generateMarkdown({ groups, sorted, grouping }: ExportInput): string {
  const lines = ["# Changelog\n"];
  sorted.forEach((cat) => {
    lines.push(`## ${catStyle(cat).label}\n`);
    groupByPeriod(groups[cat], grouping).forEach(({ period, commits }) => {
      if (period) lines.push(`### ${period}\n`);
      commits.forEach((c) => lines.push(`- ${c.message} (\`${c.sha}\`)`));
      lines.push("");
    });
  });
  return lines.join("\n");
}

export function generatePlainText({ groups, sorted, grouping }: ExportInput): string {
  const lines = ["CHANGELOG", "=========", ""];
  sorted.forEach((cat) => {
    const label = catStyle(cat).label;
    lines.push(label, "-".repeat(label.length));
    groupByPeriod(groups[cat], grouping).forEach(({ period, commits }) => {
      if (period) { lines.push(""); lines.push(`  [${period}]`); }
      commits.forEach((c) => lines.push(`  * ${c.message} (${c.sha})`));
    });
    lines.push("");
  });
  return lines.join("\n");
}

export function generateJSON({ groups, sorted, grouping, range }: ExportInput): string {
  const data = {
    generatedAt: new Date().toISOString(),
    grouping,
    range: range.from ? { from: range.from, to: range.to ?? "HEAD" } : { from: "HEAD" },
    categories: Object.fromEntries(
      sorted.map((cat) => [cat, {
        label: catStyle(cat).label,
        periods: groupByPeriod(groups[cat], grouping).map(({ period, commits }) => ({
          ...(period && { period }),
          commits: commits.map(({ sha, message, author, date }) => ({ sha, message, author, date })),
        })),
      }])
    ),
  };
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mime: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  a.click();
}
