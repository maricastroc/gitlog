"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import * as Select from "@radix-ui/react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { Commit } from "@/types";
import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import DatePicker from "@/components/DatePicker";
import FilterSelect from "@/components/FilterSelect";
import { useCommitFilters, ALL } from "@/hooks/useCommitFilters";
import { catStyle } from "@/lib/categoryStyles";

const ALL_CATS = ["feat", "fix", "chore", "docs", "refactor", "style", "test", "other"];

type Props = { commits: Commit[]; onCategoryChange: (sha: string, category: string) => void };

export default function CommitsView({ commits, onCategoryChange }: Props) {
  const {
    search,
    catFilter,
    authorFilter,
    dateFrom,
    dateTo,
    authors,
    categories,
    filtered,
    pageCommits,
    currentPage,
    totalPages,
    hasFilters,
    setPage,
    syncUrl,
    resetFilters,
  } = useCommitFilters(commits);

  const catOptions = [
    { value: ALL, label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];
  const authorOptions = [
    { value: ALL, label: "All authors" },
    ...authors.map((a) => ({ value: a, label: a })),
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader
          title="Commits"
          description={`${filtered.length} of ${commits.length} commits`}
        />
        {hasFilters && (
          <Button variant="ghost" onClick={resetFilters} className="shrink-0 sm:mt-1">
            clear filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        <input
          type="text"
          placeholder="Search message, author, sha..."
          value={search}
          onChange={(e) => {
            setPage(1);
            syncUrl({ q: e.target.value });
          }}
          className="sm:col-span-2 bg-panel border border-line rounded-lg px-3 py-2 text-[12px] font-mono text-text placeholder:text-text-dim focus:outline-none focus:border-add transition-colors"
        />
        <FilterSelect
          value={catFilter}
          onValueChange={(v) => { setPage(1); syncUrl({ cat: v }); }}
          placeholder="All categories"
          options={catOptions}
        />
        <FilterSelect
          value={authorFilter}
          onValueChange={(v) => { setPage(1); syncUrl({ author: v }); }}
          placeholder="All authors"
          options={authorOptions}
        />
        <DatePicker
          value={dateFrom}
          onChange={(v) => { setPage(1); syncUrl({ dateFrom: v }); }}
          placeholder="From (date)"
        />
        <DatePicker
          value={dateTo}
          onChange={(v) => { setPage(1); syncUrl({ dateTo: v }); }}
          placeholder="To (date)"
        />
      </div>

      <p className="text-text-dim text-[11px] font-mono mb-3">
        tip: click a category badge to change it
      </p>

      <div className="panel p-0 overflow-hidden">
        {pageCommits.length === 0 ? (
          <p className="text-text-dim text-[13px] font-mono p-6">No commits found.</p>
        ) : (
          <div className="divide-y divide-line">
            {pageCommits.map((c) => (
              <div key={c.sha} className="flex items-center gap-3 px-4 py-3">
                <span className="text-text-dim text-[11px] font-mono w-14 shrink-0">
                  {format(new Date(c.date), "d MMM", { locale: enUS })}
                </span>
                <span className="text-text-dim font-mono text-[11px] w-14 shrink-0 hidden sm:block">
                  {c.sha}
                </span>
                <span className="text-text text-[13px] flex-1 truncate">{c.message}</span>
                <span className="text-text-dim text-[11px] font-mono truncate max-w-[120px] hidden md:block">
                  {c.author}
                </span>
                <Select.Root
                  value={c.category}
                  onValueChange={(val) => onCategoryChange(c.sha, val)}
                >
                  <Select.Trigger
                    className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold shrink-0 cursor-pointer outline-none hover:brightness-125 transition-all ${catStyle(c.category).text} ${catStyle(c.category).bg}`}
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={4}
                      className="z-50 bg-panel border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                      <Select.Viewport className="p-1 max-h-60 overflow-y-auto">
                        {ALL_CATS.map((cat) => (
                          <Select.Item
                            key={cat}
                            value={cat}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-mono cursor-pointer outline-none data-[highlighted]:bg-panel-2 data-[highlighted]:text-text data-[state=checked]:text-add"
                          >
                            <Select.ItemIndicator>
                              <FontAwesomeIcon icon={faCheck} className="w-2 h-2" />
                            </Select.ItemIndicator>
                            <Select.ItemText>
                              <span className={catStyle(cat).text}>{cat}</span>
                            </Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-text-dim text-[12px] font-mono">
            page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" /> previous
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm"
            >
              next <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
