import { useSyncExternalStore, useCallback } from "react";

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

const EMPTY: RecentRepo[] = [];

// Cached snapshot so getSnapshot returns a stable reference between reads
// (useSyncExternalStore compares with Object.is and would loop otherwise).
let cache: RecentRepo[] = EMPTY;
let cacheRaw: string | null = null;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  // Cross-tab updates; same-tab updates are pushed via emit() in add().
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): RecentRepo[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cache = raw ? JSON.parse(raw) : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function getServerSnapshot(): RecentRepo[] {
  return EMPTY;
}

export function useRecentRepos() {
  const recents = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((repo: RecentRepo) => {
    const deduped = getSnapshot().filter(
      (r) => !(r.type === repo.type && (r.url ?? r.path) === (repo.url ?? repo.path)),
    );
    const next = [repo, ...deduped].slice(0, MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    cacheRaw = null; // force re-read/parse on next getSnapshot
    emit();
  }, []);

  return { recents, add };
}
