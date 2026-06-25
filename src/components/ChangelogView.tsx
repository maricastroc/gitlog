"use client";

import type { Commit, RepoInfo } from "@/types";
import { useState } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";

const CAT_TEXT: Record<string, string> = {
  feat: "text-add", fix: "text-fix", chore: "text-chore", docs: "text-docs",
  refactor: "text-chore", style: "text-style", test: "text-test", other: "text-text-dim",
};
const CAT_PREFIX: Record<string, string> = {
  feat: "+", fix: "~", refactor: "~", chore: "·", docs: "·", test: "·", other: "·",
};
const CAT_LABEL: Record<string, string> = {
  feat: "Features", fix: "Bug Fixes", refactor: "Refactors",
  chore: "Chores", docs: "Docs", test: "Tests", style: "Style", other: "Other",
};
const ORDER = ["feat", "fix", "refactor", "chore", "docs", "test", "style", "other"];

type Grouping = "none" | "month" | "week";

type Props = { commits: Commit[]; repoInfo: RepoInfo };

function periodKey(date: string, grouping: Grouping): string {
  const d = new Date(date);
  if (grouping === "month") return format(d, "MMMM yyyy", { locale: enUS });
  if (grouping === "week")  return `Week of ${format(d, "MMM d, yyyy", { locale: enUS })}`;
  return "";
}

function groupByPeriod(commits: Commit[], grouping: Grouping): { period: string; commits: Commit[] }[] {
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

export default function ChangelogView({ commits, repoInfo }: Props) {
  const [copied, setCopied] = useState(false);
  const [grouping, setGrouping] = useState<Grouping>("none");

  const groups = commits.reduce<Record<string, Commit[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});
  const sorted = ORDER.filter((k) => groups[k]);

  function generateMarkdown() {
    const lines = ["# Changelog\n"];
    sorted.forEach((cat) => {
      lines.push(`## ${CAT_LABEL[cat] ?? cat}\n`);
      const periods = groupByPeriod(groups[cat], grouping);
      periods.forEach(({ period, commits: cs }) => {
        if (period) lines.push(`### ${period}\n`);
        cs.forEach((c) => lines.push(`- ${c.message} (\`${c.sha}\`)`));
        lines.push("");
      });
    });
    return lines.join("\n");
  }

  function generatePlainText() {
    const lines = ["CHANGELOG", "=========", ""];
    sorted.forEach((cat) => {
      lines.push(`${CAT_LABEL[cat] ?? cat}`);
      lines.push("-".repeat((CAT_LABEL[cat] ?? cat).length));
      const periods = groupByPeriod(groups[cat], grouping);
      periods.forEach(({ period, commits: cs }) => {
        if (period) { lines.push(""); lines.push(`  [${period}]`); }
        cs.forEach((c) => lines.push(`  * ${c.message} (${c.sha})`));
      });
      lines.push("");
    });
    return lines.join("\n");
  }

  function generateJSON() {
    const data = {
      generatedAt: new Date().toISOString(),
      grouping,
      range: repoInfo.from ? { from: repoInfo.from, to: repoInfo.to ?? "HEAD" } : { from: "HEAD" },
      categories: Object.fromEntries(
        sorted.map((cat) => {
          const periods = groupByPeriod(groups[cat], grouping);
          return [cat, {
            label: CAT_LABEL[cat] ?? cat,
            periods: periods.map(({ period, commits: cs }) => ({
              ...(period && { period }),
              commits: cs.map((c) => ({ sha: c.sha, message: c.message, author: c.author, date: c.date })),
            })),
          }];
        })
      ),
    };
    return JSON.stringify(data, null, 2);
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  function download(content: string, filename: string, mime: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    a.click();
  }

  function handleExport(fmt: "md" | "txt" | "json") {
    if (fmt === "md")   return download(generateMarkdown(),  "CHANGELOG.md",   "text/markdown");
    if (fmt === "txt")  return download(generatePlainText(), "CHANGELOG.txt",  "text/plain");
    if (fmt === "json") return download(generateJSON(),      "changelog.json", "application/json");
  }

  const intervalLabel = repoInfo.from ? `${repoInfo.from} → ${repoInfo.to ?? "HEAD"}` : "HEAD";

  const GROUPING_OPTIONS: { value: Grouping; label: string }[] = [
    { value: "none",  label: "No grouping" },
    { value: "month", label: "By month" },
    { value: "week",  label: "By week" },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <PageHeader title="Generated changelog" description={intervalLabel} />
        <div className="flex flex-wrap gap-2 sm:mt-1 shrink-0">
          <button onClick={handleCopy} className="btn ghost">{copied ? "✓ copied!" : "copy markdown"}</button>
          <button onClick={() => handleExport("md")}   className="btn ghost">export .md</button>
          <button onClick={() => handleExport("txt")}  className="btn ghost">export .txt</button>
          <button onClick={() => handleExport("json")} className="btn">export .json</button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 bg-panel-2 border border-line rounded-lg w-fit">
        {GROUPING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setGrouping(opt.value)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-mono cursor-pointer transition-all ${
              grouping === opt.value
                ? "bg-panel border border-line text-text shadow-sm"
                : "text-text-dim hover:text-text border border-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="flex flex-col gap-6">
          {sorted.map((cat) => {
            const periods = groupByPeriod(groups[cat], grouping);
            return (
              <div key={cat}>
                <p className="text-text-dim text-[10px] uppercase tracking-widest mb-2.5">{CAT_LABEL[cat] ?? cat}</p>
                <div className="flex flex-col gap-4">
                  {periods.map(({ period, commits: cs }) => (
                    <div key={period || "all"}>
                      {period && (
                        <p className="text-text-dim text-[10px] font-mono mb-2 pl-3.5 border-l border-line">{period}</p>
                      )}
                      <div className="flex flex-col gap-1.5">
                        {cs.map((c) => (
                          <div key={c.sha} className={`flex items-baseline gap-2.5 font-mono text-[13px] ${CAT_TEXT[cat] ?? "text-text-dim"}`}>
                            <span className="shrink-0 w-2.5">{CAT_PREFIX[cat] ?? "·"}</span>
                            <span className="flex-1">{c.message}</span>
                            <span className="text-text-dim text-[11px] shrink-0">{c.sha}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
