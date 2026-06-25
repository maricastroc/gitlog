"use client";

import type { Commit, RepoInfo } from "@/types";
import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronDown, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import AuthorFilter from "@/components/AuthorFilter";
import { catStyle, CAT_ORDER } from "@/lib/categoryStyles";
import {
  groupByPeriod,
  generateMarkdown,
  generatePlainText,
  generateJSON,
  downloadFile,
} from "@/lib/changelogExport";

type Grouping = "none" | "month" | "week";

type Props = { commits: Commit[]; repoInfo: RepoInfo; showAuthor?: boolean; onExport?: () => void };

const GROUPING_OPTIONS: { value: Grouping; label: string }[] = [
  { value: "none", label: "No grouping" },
  { value: "month", label: "By month" },
  { value: "week", label: "By week" },
];

export default function ChangelogView({ commits, repoInfo, showAuthor = false, onExport }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const rawGrouping = router.query.grouping as string | undefined;
  const grouping: Grouping =
    rawGrouping === "month" || rawGrouping === "week" ? rawGrouping : "none";

  function handleGrouping(g: Grouping) {
    router.replace({ query: { ...router.query, grouping: g } }, undefined, { shallow: true });
  }

  const allAuthors = useMemo(() => [...new Set(commits.map((c) => c.author))].sort(), [commits]);
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(() => new Set(allAuthors));

  function toggleAuthor(author: string) {
    setSelectedAuthors((prev) => {
      const next = new Set(prev);
      if (next.has(author)) next.delete(author);
      else next.add(author);
      return next;
    });
  }

  function toggleAll() {
    setSelectedAuthors(
      selectedAuthors.size === allAuthors.length ? new Set() : new Set(allAuthors),
    );
  }

  const filtered = commits.filter((c) => selectedAuthors.has(c.author));
  const groups = filtered.reduce<Record<string, Commit[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});
  const sorted = CAT_ORDER.filter((k) => groups[k]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleCollapse(cat: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const exportInput = { groups, sorted, grouping, range: { from: repoInfo.from, to: repoInfo.to }, showAuthor };

  function handleCopy() {
    navigator.clipboard.writeText(generateMarkdown(exportInput));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport(fmt: "md" | "txt" | "json") {
    onExport?.();
    if (fmt === "md")
      return downloadFile(generateMarkdown(exportInput), "CHANGELOG.md", "text/markdown");
    if (fmt === "txt")
      return downloadFile(generatePlainText(exportInput), "CHANGELOG.txt", "text/plain");
    if (fmt === "json")
      return downloadFile(generateJSON(exportInput), "changelog.json", "application/json");
  }

  const intervalLabel = repoInfo.from ? (
    <>
      {repoInfo.from} <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5 inline" />{" "}
      {repoInfo.to ?? "HEAD"}
    </>
  ) : (
    <>HEAD</>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <PageHeader title="Generated changelog" description={intervalLabel} />
        <div className="flex flex-wrap gap-2 sm:mt-1 shrink-0">
          <Button variant="ghost" onClick={handleCopy}>
            {copied ? <><FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" /> copied!</> : "copy markdown"}
          </Button>
          <Button variant="ghost" onClick={() => handleExport("md")}>
            export .md
          </Button>
          <Button variant="ghost" onClick={() => handleExport("txt")}>
            export .txt
          </Button>
          <Button onClick={() => handleExport("json")}>export .json</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-panel-2 border border-line rounded-lg w-fit">
          {GROUPING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleGrouping(opt.value)}
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

        <AuthorFilter
          allAuthors={allAuthors}
          selectedAuthors={selectedAuthors}
          onToggle={toggleAuthor}
          onToggleAll={toggleAll}
        />
      </div>

      <div className="panel">
        <div className="flex flex-col gap-6">
          {sorted.map((cat) => {
            const isCollapsed = collapsed.has(cat);
            const count = groups[cat].length;
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCollapse(cat)}
                  className="flex items-center gap-2 w-full text-left mb-2.5 group"
                >
                  <FontAwesomeIcon
                    icon={isCollapsed ? faChevronRight : faChevronDown}
                    className="w-2 h-2 text-text-dim group-hover:text-text transition-colors shrink-0"
                  />
                  <p className="text-text-dim text-[10px] uppercase tracking-widest group-hover:text-text transition-colors">
                    {catStyle(cat).label}
                  </p>
                  <span className="text-text-dim text-[10px] font-mono">({count})</span>
                </button>
                {!isCollapsed && (
                  <div className="flex flex-col gap-4">
                    {groupByPeriod(groups[cat], grouping).map(({ period, commits: cs }) => (
                      <div key={period || "all"}>
                        {period && (
                          <p className="text-text-dim text-[10px] font-mono mb-2 pl-3.5 border-l border-line">
                            {period}
                          </p>
                        )}
                        <div className="flex flex-col gap-1.5">
                          {cs.map((c) => (
                            <div
                              key={c.sha}
                              className={`flex items-baseline gap-2.5 font-mono text-[13px] ${catStyle(cat).text}`}
                            >
                              <span className="shrink-0 w-2.5">{catStyle(cat).prefix}</span>
                              <span className="flex-1">{c.message}</span>
                              {showAuthor && (
                                <span className="text-text-dim text-[11px] shrink-0 hidden sm:block">
                                  {c.author}
                                </span>
                              )}
                              <span className="text-text-dim text-[11px] shrink-0">{c.sha}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
