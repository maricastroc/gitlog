"use client";

import type { Commit, RepoInfo, Ref } from "@/types";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";
import ReleaseDiff from "@/components/ReleaseDiff";
import CategoryBadge from "@/components/CategoryBadge";
import CommitActivityChart from "@/components/CommitActivityChart";
import { catStyle } from "@/lib/categoryStyles";
import { groupBy, lastCommitAgo, buildTimeline } from "@/lib/commitStats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faCheck, faScroll, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import RangeLabel from "@/components/RangeLabel";

type Props = {
  commits: Commit[];
  repoInfo: RepoInfo;
  refs?: Ref[];
  onViewAllCommits: () => void;
  onViewChangelog: () => void;
};

function StatCard({
  label,
  cat,
  count,
  commits,
}: {
  label: string;
  cat: string;
  count: number;
  commits: Commit[];
}) {
  const ago = lastCommitAgo(commits, cat);
  const pct = commits.length ? Math.round((count / commits.length) * 100) : 0;
  const style = catStyle(cat);
  return (
    <div className={`panel border-l-2 ${style.accent}`}>
      <p className={`text-[40px] leading-none font-bold font-display ${style.text}`}>{count}</p>
      <p className="text-text-dim text-[10px] tracking-widest mt-1 uppercase">{label}</p>
      <div className="mt-3 h-1 bg-panel-2 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
      </div>
      {ago && <p className="text-text-dim text-[10px] font-mono mt-2 truncate">last: {ago}</p>}
    </div>
  );
}

export default function Overview({
  commits,
  repoInfo,
  refs = [],
  onViewAllCommits,
  onViewChangelog,
}: Props) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const authors = useMemo(() => [...new Set(commits.map((c) => c.author))], [commits]);
  const dates = commits.map((c) => new Date(c.date)).sort((a, b) => a.getTime() - b.getTime());
  const since = dates[0] ? format(dates[0], "d MMM yyyy", { locale: enUS }) : "—";
  const until = dates.at(-1) ? format(dates.at(-1)!, "d MMM yyyy", { locale: enUS }) : "—";

  const byCat = groupBy(commits, "category");
  const byAuthor = groupBy(commits, "author");
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const sortedAuthors = Object.entries(byAuthor).sort((a, b) => b[1] - a[1]);
  const timeline = buildTimeline(commits);

  const allRecent = [...commits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const recent = selectedDay
    ? allRecent.filter((c) => format(new Date(c.date), "MMM d", { locale: enUS }) === selectedDay)
    : allRecent.slice(0, 7);

  const statCards = [
    { label: "Features", cat: "feat", count: byCat["feat"] ?? 0 },
    { label: "Bug Fixes", cat: "fix", count: byCat["fix"] ?? 0 },
    { label: "Refactors", cat: "refactor", count: byCat["refactor"] ?? 0 },
    { label: "Uncategorized", cat: "other", count: byCat["other"] ?? 0 },
  ];

  const rangeLabel = <RangeLabel from={repoInfo.from} to={repoInfo.to ?? undefined} />;

  function handleShare() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(false);
      });
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <PageHeader title="Period overview" description={`${since} — ${until}`} />
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
            <span className="text-[13px] font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faScroll} className="w-3 h-3" /> view changelog
            </span>
            <span className="text-[10px] opacity-70">
              {commits.length} commits · {authors.length} authors
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} commits={commits} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="panel flex-1">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <p className="text-text-dim text-[10px] uppercase tracking-widest">
                  Recent activity
                </p>
                {selectedDay && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-[10px] font-mono text-add border border-add px-1.5 py-0.5 rounded hover:bg-add-dim transition-colors cursor-pointer"
                  >
                    {selectedDay} ×
                  </button>
                )}
              </div>
              <button
                onClick={onViewAllCommits}
                className="text-[11px] text-add font-mono hover:underline underline-offset-2 cursor-pointer"
              >
                view all <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {recent.map((c) => (
                <div key={c.sha} className="flex items-center gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${catStyle(c.category).dot}`}
                  />
                  <span className="text-text-dim text-[11px] w-13 shrink-0">
                    {format(new Date(c.date), "d MMM", { locale: enUS })}
                  </span>
                  <span className="text-text text-xs flex-1 truncate">{c.message}</span>
                  <CategoryBadge category={c.category} />
                </div>
              ))}
            </div>
          </div>

          {timeline.length > 1 && (
            <CommitActivityChart
              timeline={timeline}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3 lg:h-full">
          <div className="panel">
            <p className="text-text-dim text-[10px] uppercase tracking-widest mb-3.5">
              Distribution by category
            </p>
            <div className="flex flex-col gap-2.5">
              {sortedCats.map(([cat, count]) => {
                const pct = Math.round((count / commits.length) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-text-dim">{cat}</span>
                      <span className="text-text-dim">{pct}%</span>
                    </div>
                    <div className="h-1 bg-panel-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${catStyle(cat).bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel flex-1">
            <p className="text-text-dim text-[10px] uppercase tracking-widest mb-3.5">
              Top authors
            </p>
            <div className="flex flex-col gap-2.5">
              {sortedAuthors.slice(0, 5).map(([author, count]) => (
                <div key={author} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-panel-2 text-text-dim text-[11px] flex items-center justify-center font-semibold shrink-0">
                    {author.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-text text-xs flex-1 truncate">{author}</span>
                  <span className="text-text-dim text-[11px] shrink-0">
                    {count} commit{count !== 1 ? "s" : ""}
                  </span>
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
