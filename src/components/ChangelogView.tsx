"use client";

import type { Commit, RepoInfo } from "@/dashboard/DashboardClient";
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
  feat: "Features", fix: "Correções", refactor: "Refatorações",
  chore: "Outros", docs: "Docs", test: "Testes", style: "Estilo", other: "Outros",
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

  function handleCopy() {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([generateMarkdown()], { type: "text/markdown" }));
    a.download = "CHANGELOG.md"; a.click();
  }

  const intervalLabel = repoInfo.from ? `${repoInfo.from} → ${repoInfo.to ?? "HEAD"}` : "HEAD";

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <PageHeader title="Changelog gerado" description={intervalLabel} />
        <div className="flex gap-2 sm:mt-1 shrink-0">
          <button onClick={handleCopy} className="btn ghost">{copied ? "✓ copiado!" : "copiar markdown"}</button>
          <button onClick={handleExport} className="btn">exportar .md</button>
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
