"use client";

import type { Commit } from "@/types";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";
import CategoryBadge from "@/components/CategoryBadge";

type Props = { commits: Commit[] };

export default function AuthorView({ commits }: Props) {
  const authorMap = commits.reduce<Record<string, Commit[]>>((acc, c) => {
    if (!acc[c.author]) acc[c.author] = [];
    acc[c.author].push(c);
    return acc;
  }, {});
  const sorted = Object.entries(authorMap).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="w-full">
      <PageHeader title="By author" description={`${sorted.length} ${sorted.length === 1 ? "contributor" : "contributors"}`} />

      <div className="flex flex-col gap-3">
        {sorted.map(([author, cs]) => (
          <div key={author} className="panel">
            <div className="flex items-center gap-3 mb-3.5">
              <span className="w-8 h-8 rounded-full bg-panel-2 text-text-dim text-[11px] flex items-center justify-center font-semibold shrink-0">
                {author.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="text-text text-sm font-medium">{author}</p>
                <p className="text-text-dim text-[11px]">{cs.length} commits</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {cs.slice(0, 5).map((c) => (
                <div key={c.sha} className="flex items-center gap-2.5 text-xs">
                  <span className="text-text-dim w-12 shrink-0 text-[11px]">{format(new Date(c.date), "d MMM", { locale: enUS })}</span>
                  <span className="text-text flex-1 truncate">{c.message}</span>
                  <CategoryBadge category={c.category} />
                </div>
              ))}
              {cs.length > 5 && <p className="text-text-dim text-[11px] mt-1">+ {cs.length - 5} commits</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
