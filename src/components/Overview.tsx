"use client";

import type { Commit, RepoInfo, Ref } from "@/types";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";
import ReleaseDiff from "@/components/ReleaseDiff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faCheck } from "@fortawesome/free-solid-svg-icons";

const CAT: Record<string, { text: string; bg: string; dot: string; bar: string; accent: string }> = {
  feat:     { text: "text-add",      bg: "bg-add-dim",   dot: "bg-add",      bar: "bg-add",      accent: "border-add"      },
  fix:      { text: "text-fix",      bg: "bg-fix-dim",   dot: "bg-fix",      bar: "bg-fix",      accent: "border-fix"      },
  chore:    { text: "text-chore",    bg: "bg-chore-dim", dot: "bg-chore",    bar: "bg-chore",    accent: "border-chore"    },
  docs:     { text: "text-docs",     bg: "bg-docs-dim",  dot: "bg-docs",     bar: "bg-docs",     accent: "border-docs"     },
  refactor: { text: "text-chore",    bg: "bg-chore-dim", dot: "bg-chore",    bar: "bg-chore",    accent: "border-chore"    },
  style:    { text: "text-style",    bg: "bg-style-dim", dot: "bg-style",    bar: "bg-style",    accent: "border-style"    },
  test:     { text: "text-test",     bg: "bg-test-dim",  dot: "bg-test",     bar: "bg-test",     accent: "border-test"     },
  other:    { text: "text-text-dim", bg: "bg-panel-2",   dot: "bg-text-dim", bar: "bg-text-dim", accent: "border-line"     },
};

type Props = { commits: Commit[]; repoInfo: RepoInfo; refs?: Ref[]; onViewAllCommits: () => void; onViewChangelog: () => void };

function lastCommitAgo(commits: Commit[], category: string): string | null {
  const filtered = commits.filter((c) => c.category === category);
  if (!filtered.length) return null;
  const latest = filtered.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
  return formatDistanceToNow(new Date(latest.date), { addSuffix: true, locale: enUS });
}

function buildTimeline(commits: Commit[]): { label: string; count: number }[] {
  const buckets: Record<string, number> = {};
  commits.forEach((c) => {
    const key = format(new Date(c.date), "MMM d", { locale: enUS });
    buckets[key] = (buckets[key] ?? 0) + 1;
  });
  const sorted = Object.entries(buckets).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );
  // keep last 20 buckets max
  return sorted.slice(-20).map(([label, count]) => ({ label, count }));
}

export default function Overview({ commits, repoInfo, refs = [], onViewAllCommits, onViewChangelog }: Props) {
  const authors = [...new Set(commits.map((c) => c.author))];
  const dates = commits.map((c) => new Date(c.date)).sort((a, b) => a.getTime() - b.getTime());
  const since = dates[0] ? format(dates[0], "d MMM yyyy", { locale: enUS }) : "—";
  const until = dates.at(-1) ? format(dates.at(-1)!, "d MMM yyyy", { locale: enUS }) : "—";

  const [hoveredBar, setHoveredBar] = useState<{ label: string; count: number; index: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const byCat    = commits.reduce<Record<string, number>>((a, c) => { a[c.category] = (a[c.category] ?? 0) + 1; return a; }, {});
  const byAuthor = commits.reduce<Record<string, number>>((a, c) => { a[c.author]   = (a[c.author]   ?? 0) + 1; return a; }, {});
  const sortedCats    = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const sortedAuthors = Object.entries(byAuthor).sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCats[0]?.[1] ?? 1;
  const allRecent = [...commits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recent = selectedDay
    ? allRecent.filter((c) => format(new Date(c.date), "MMM d", { locale: enUS }) === selectedDay)
    : allRecent.slice(0, 7);

  const timeline = buildTimeline(commits);
  const maxBar = Math.max(...timeline.map((t) => t.count), 1);

  const statCards = [
    { label: "Features",      cat: "feat",  count: byCat["feat"]  ?? 0 },
    { label: "Bug Fixes",     cat: "fix",   count: byCat["fix"]   ?? 0 },
    { label: "Chores",        cat: "chore", count: byCat["chore"] ?? 0 },
    { label: "Uncategorized", cat: "other", count: byCat["other"] ?? 0 },
  ];

  const rangeLabel = repoInfo.from
    ? `${repoInfo.from} → ${repoInfo.to ?? "HEAD"}`
    : `HEAD`;

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <PageHeader
          title="Period overview"
          description={`${since} — ${until}`}
        />
        <div className="flex flex-col items-end gap-2 sm:mt-1 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-text-dim text-[11px] font-mono">{rangeLabel}</span>
            {repoInfo.type === "remote" && (
              <button
                onClick={handleShare}
                title="Copy shareable link"
                className="text-[11px] font-mono text-text-dim border border-line px-2 py-0.5 rounded hover:text-text hover:border-text-dim transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={copied ? faCheck : faLink} className="w-2.5 h-2.5 mr-1" />
                {copied ? "copied" : "share"}
              </button>
            )}
          </div>
          <button
            onClick={onViewChangelog}
            className="flex flex-col items-center px-5 py-2.5 rounded-lg bg-add-dim border border-add text-add font-mono hover:brightness-110 transition-all cursor-pointer"
          >
            <span className="text-[13px] font-semibold">◎ generate changelog</span>
            <span className="text-[10px] opacity-70">{commits.length} commits · {authors.length} authors</span>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {statCards.map((s) => {
          const ago = lastCommitAgo(commits, s.cat);
          const pct = commits.length ? Math.round((s.count / commits.length) * 100) : 0;
          const style = CAT[s.cat];
          return (
            <div key={s.label} className={`panel border-l-2 ${style?.accent ?? "border-line"}`}>
              <p className={`text-[40px] leading-none font-bold font-display ${style?.text ?? "text-text-dim"}`}>{s.count}</p>
              <p className="text-text-dim text-[10px] tracking-widest mt-1 uppercase">{s.label}</p>
              <div className="mt-3 h-1 bg-panel-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${style?.bar ?? "bg-text-dim"}`} style={{ width: `${pct}%` }} />
              </div>
              {ago && (
                <p className="text-text-dim text-[10px] font-mono mt-2 truncate">last: {ago}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="panel flex-1">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <p className="text-text-dim text-[10px] uppercase tracking-widest">Recent activity</p>
                {selectedDay && (
                  <button onClick={() => setSelectedDay(null)} className="text-[10px] font-mono text-add border border-add px-1.5 py-0.5 rounded hover:bg-add-dim transition-colors cursor-pointer">
                    {selectedDay} ×
                  </button>
                )}
              </div>
              <button onClick={onViewAllCommits} className="text-[11px] text-add font-mono hover:underline underline-offset-2 cursor-pointer">
                view all →
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {recent.map((c) => (
                <div key={c.sha} className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CAT[c.category]?.dot ?? "bg-text-dim"}`} />
                  <span className="text-text-dim text-[11px] w-13 shrink-0">{format(new Date(c.date), "d MMM", { locale: enUS })}</span>
                  <span className="text-text text-xs flex-1 truncate">{c.message}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-[var(--radius-pill)] uppercase tracking-wider font-semibold shrink-0 ${CAT[c.category]?.text ?? "text-text-dim"} ${CAT[c.category]?.bg ?? ""}`}>
                    {c.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {timeline.length > 1 && (
            <div className="panel">
              <p className="text-text-dim text-[10px] uppercase tracking-widest mb-4">Commit activity</p>
              <div className="relative flex items-end gap-0.5" style={{ height: 96 }}>
                {hoveredBar && (
                  <div
                    className="absolute bottom-full mb-2 px-2 py-1 bg-panel-2 border border-line rounded text-[11px] font-mono text-text whitespace-nowrap pointer-events-none z-10"
                    style={{ left: `${(hoveredBar.index / timeline.length) * 100}%`, transform: "translateX(-50%)" }}
                  >
                    {hoveredBar.label} · {hoveredBar.count} commit{hoveredBar.count !== 1 ? "s" : ""}
                  </div>
                )}
                {timeline.map((t, i) => {
                  const isSelected = selectedDay === t.label;
                  return (
                    <div
                      key={t.label}
                      className="flex-1 h-full flex flex-col justify-end cursor-pointer"
                      onMouseEnter={() => setHoveredBar({ ...t, index: i })}
                      onMouseLeave={() => setHoveredBar(null)}
                      onClick={() => setSelectedDay(isSelected ? null : t.label)}
                    >
                      <div
                        className={`w-full rounded-sm transition-all ${
                          isSelected ? "bg-add opacity-100 ring-1 ring-add" :
                          hoveredBar?.label === t.label ? "bg-add opacity-100" :
                          "bg-add opacity-50"
                        }`}
                        style={{ height: `${Math.max((t.count / maxBar) * 100, 8)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-text-dim text-[10px] font-mono">{timeline[0]?.label}</span>
                <span className="text-text-dim text-[10px] font-mono">{timeline.at(-1)?.label}</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="panel">
            <p className="text-text-dim text-[10px] uppercase tracking-widest mb-3.5">Distribution by category</p>
            <div className="flex flex-col gap-2.5">
              {sortedCats.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-dim">{cat}</span>
                    <span className="text-text-dim">{Math.round((count / commits.length) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-panel-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${CAT[cat]?.bar ?? "bg-text-dim"}`} style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="text-text-dim text-[10px] uppercase tracking-widest mb-3.5">Top authors</p>
            <div className="flex flex-col gap-2.5">
              {sortedAuthors.slice(0, 5).map(([author, count]) => (
                <div key={author} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-panel-2 text-text-dim text-[11px] flex items-center justify-center font-semibold shrink-0">
                    {author.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-text text-xs flex-1 truncate">{author}</span>
                  <span className="text-text-dim text-[11px] shrink-0">{count} commit{count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {repoInfo.type === "remote" && (
        <div className="mt-4">
          <ReleaseDiff commits={commits} repoInfo={repoInfo} refs={refs} />
        </div>
      )}
    </div>
  );
}
