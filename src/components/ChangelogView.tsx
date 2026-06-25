"use client";

import type { Commit, RepoInfo } from "@/types";
import { useState } from "react";
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

type Props = { commits: Commit[]; repoInfo: RepoInfo };

export default function ChangelogView({ commits, repoInfo }: Props) {
  const [copied, setCopied] = useState(false);

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
      groups[cat].forEach((c) => lines.push(`- ${c.message} (\`${c.sha}\`)`));
      lines.push("");
    });
    return lines.join("\n");
  }

  function generatePlainText() {
    const lines = ["CHANGELOG", "=========", ""];
    sorted.forEach((cat) => {
      lines.push(`${CAT_LABEL[cat] ?? cat}`);
      lines.push("-".repeat((CAT_LABEL[cat] ?? cat).length));
      groups[cat].forEach((c) => lines.push(`  * ${c.message} (${c.sha})`));
      lines.push("");
    });
    return lines.join("\n");
  }

  function generateJSON() {
    const data = {
      generatedAt: new Date().toISOString(),
      range: repoInfo.from ? { from: repoInfo.from, to: repoInfo.to ?? "HEAD" } : { from: "HEAD" },
      categories: Object.fromEntries(
        sorted.map((cat) => [
          cat,
          {
            label: CAT_LABEL[cat] ?? cat,
            commits: groups[cat].map((c) => ({ sha: c.sha, message: c.message, author: c.author, date: c.date })),
          },
        ])
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

  function handleExport(format: "md" | "txt" | "json") {
    if (format === "md")   return download(generateMarkdown(),  "CHANGELOG.md",  "text/markdown");
    if (format === "txt")  return download(generatePlainText(), "CHANGELOG.txt", "text/plain");
    if (format === "json") return download(generateJSON(),      "changelog.json","application/json");
  }

  const intervalLabel = repoInfo.from ? `${repoInfo.from} → ${repoInfo.to ?? "HEAD"}` : "HEAD";

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <PageHeader title="Generated changelog" description={intervalLabel} />
        <div className="flex gap-2 sm:mt-1 shrink-0">
          <button onClick={handleCopy} className="btn ghost">{copied ? "✓ copied!" : "copy markdown"}</button>
          <button onClick={() => handleExport("md")}   className="btn ghost">export .md</button>
          <button onClick={() => handleExport("txt")}  className="btn ghost">export .txt</button>
          <button onClick={() => handleExport("json")} className="btn">export .json</button>
        </div>
      </div>

      <div className="panel">
        <div className="flex flex-col gap-6">
          {sorted.map((cat) => (
            <div key={cat}>
              <p className="text-text-dim text-[10px] uppercase tracking-widest mb-2.5">{CAT_LABEL[cat] ?? cat}</p>
              <div className="flex flex-col gap-1.5">
                {groups[cat].map((c) => (
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
    </div>
  );
}
