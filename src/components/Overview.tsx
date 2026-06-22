"use client";

import type { Commit } from "@/types";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";

const CAT: Record<string, { text: string; bg: string; dot: string; bar: string }> = {
  feat:     { text: "text-add",      bg: "bg-add-dim",   dot: "bg-add",      bar: "bg-add"      },
  fix:      { text: "text-fix",      bg: "bg-fix-dim",   dot: "bg-fix",      bar: "bg-fix"      },
  chore:    { text: "text-chore",    bg: "bg-chore-dim", dot: "bg-chore",    bar: "bg-chore"    },
  docs:     { text: "text-docs",     bg: "bg-docs-dim",  dot: "bg-docs",     bar: "bg-docs"     },
  refactor: { text: "text-chore",    bg: "bg-chore-dim",  dot: "bg-chore",    bar: "bg-chore"    },
  style:    { text: "text-style",    bg: "bg-style-dim",  dot: "bg-style",    bar: "bg-style"    },
  test:     { text: "text-test",     bg: "bg-test-dim",   dot: "bg-test",     bar: "bg-test"     },
  other:    { text: "text-text-dim", bg: "bg-panel-2", dot: "bg-text-dim", bar: "bg-text-dim" },
};

type Props = { commits: Commit[]; onViewAllCommits: () => void; onViewChangelog: () => void };

export default function Overview({ commits, onViewAllCommits, onViewChangelog }: Props) {
  const authors = [...new Set(commits.map((c) => c.author))];
  const dates = commits.map((c) => new Date(c.date)).sort((a, b) => a.getTime() - b.getTime());
  const since = dates[0] ? format(dates[0], "d MMM yyyy", { locale: enUS }) : "—";
  const until = dates.at(-1) ? format(dates.at(-1)!, "d MMM yyyy", { locale: enUS }) : "—";

  const byCat    = commits.reduce<Record<string, number>>((a, c) => { a[c.category] = (a[c.category] ?? 0) + 1; return a; }, {});
  const byAuthor = commits.reduce<Record<string, number>>((a, c) => { a[c.author]   = (a[c.author]   ?? 0) + 1; return a; }, {});
  const sortedCats    = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const sortedAuthors = Object.entries(byAuthor).sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCats[0]?.[1] ?? 1;
  const recent = [...commits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);

  const statCards = [
    { label: "FEATURES",      count: byCat["feat"]  ?? 0, color: "text-add"      },
    { label: "BUG FIXES",     count: byCat["fix"]   ?? 0, color: "text-fix"      },
    { label: "CHORES",        count: byCat["chore"] ?? 0, color: "text-chore"    },
    { label: "UNCATEGORIZED", count: byCat["other"] ?? 0, color: "text-text-dim" },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <PageHeader
          title="Period overview"
          description={`${commits.length} commits · ${authors.length} ${authors.length === 1 ? "author" : "authors"} · ${since} — ${until}`}
        />
        <button onClick={onViewChangelog} className="btn mt-1">◎ generate changelog</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {statCards.map((s) => (
          <div key={s.label} className="panel">
            <p className={`text-[28px] font-bold font-display ${s.color}`}>{s.count}</p>
            <p className="text-text-dim text-[10px] tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 panel">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-text-dim text-[10px] uppercase tracking-widest">Recent activity</p>
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
    </div>
  );
}
