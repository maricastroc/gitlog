import { useState } from "react";

export type RecentRepo = {
  label: string;
  type: "remote" | "local";
  url?: string;
  path?: string;
  from?: string;
  to?: string;
};

const KEY = "gitlog:recent-repos";
const MAX = 6;

function loadRecents(): RecentRepo[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useRecentRepos() {
  const [recents, setRecents] = useState<RecentRepo[]>(loadRecents);

  function add(repo: RecentRepo) {
    setRecents((prev) => {
      const deduped = prev.filter((r) => !(r.type === repo.type && (r.url ?? r.path) === (repo.url ?? repo.path)));
      const next = [repo, ...deduped].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return { recents, add };
}
