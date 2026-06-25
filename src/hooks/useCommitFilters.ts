import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import type { Commit } from "@/types";

const ALL = "__all__";
const PAGE_SIZE = 25;

export { ALL, PAGE_SIZE };

export function useCommitFilters(commits: Commit[]) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const q = router.query;
  const search = (q.q as string) ?? "";
  const catFilter = (q.cat as string) ?? ALL;
  const authorFilter = (q.author as string) ?? ALL;
  const dateFrom = (q.dateFrom as string) ?? "";
  const dateTo = (q.dateTo as string) ?? "";

  function syncUrl(updates: Record<string, string>) {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries({ ...router.query, ...updates })) {
      if (typeof v === "string" && v !== "") next[k] = v;
    }
    router.replace({ query: next }, undefined, { shallow: true });
  }

  const authors = useMemo(() => [...new Set(commits.map((c) => c.author))].sort(), [commits]);
  const categories = useMemo(() => [...new Set(commits.map((c) => c.category))].sort(), [commits]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return commits.filter((c) => {
      if (catFilter !== ALL && c.category !== catFilter) return false;
      if (authorFilter !== ALL && c.author !== authorFilter) return false;
      if (
        term &&
        !c.message.toLowerCase().includes(term) &&
        !c.author.toLowerCase().includes(term) &&
        !c.sha.includes(term)
      )
        return false;
      const commitDate = new Date(c.date);
      if (dateFrom && commitDate < new Date(dateFrom + "T00:00:00")) return false;
      if (dateTo && commitDate > new Date(dateTo + "T23:59:59.999")) return false;
      return true;
    });
  }, [commits, search, catFilter, authorFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageCommits = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasFilters = search || catFilter !== ALL || authorFilter !== ALL || dateFrom || dateTo;

  function resetFilters() {
    setPage(1);
    syncUrl({ q: "", cat: "", author: "", dateFrom: "", dateTo: "" });
  }

  return {
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
  };
}
