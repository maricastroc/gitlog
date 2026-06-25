import { useState, useCallback } from "react";
import type { Settings } from "@/types";

const DEFAULT_SETTINGS: Settings = {
  keywords: {
    feat:     ["adds", "implements", "creates", "introduces"],
    fix:      ["fixes", "resolves", "patches", "corrects"],
    chore:    ["updates", "bumps", "removes", "cleans"],
    docs:     ["documents", "comments", "readme"],
    refactor: ["refactors", "reorganizes"],
    style:    ["styles", "layout", "css"],
    test:     ["tests", "specs", "coverage"],
  },
  conventionalCommits: true,
  ignoreMerge: true,
  categorizeByFile: true,
  includeSquash: false,
};

export { DEFAULT_SETTINGS };

export function useSettings(): [Settings, (s: Settings) => void] {
  const [settings, setSettingsState] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem("gitlog:settings");
      if (!saved) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(saved) as Partial<Settings>;
      return {
        keywords: { ...DEFAULT_SETTINGS.keywords, ...(parsed.keywords ?? {}) },
        conventionalCommits: parsed.conventionalCommits ?? DEFAULT_SETTINGS.conventionalCommits,
        ignoreMerge:         parsed.ignoreMerge         ?? DEFAULT_SETTINGS.ignoreMerge,
        categorizeByFile:    parsed.categorizeByFile    ?? DEFAULT_SETTINGS.categorizeByFile,
        includeSquash:       parsed.includeSquash       ?? DEFAULT_SETTINGS.includeSquash,
      };
    } catch { return DEFAULT_SETTINGS; }
  });

  const setSettings = useCallback((s: Settings) => {
    setSettingsState(s);
    try { localStorage.setItem("gitlog:settings", JSON.stringify(s)); } catch {}
  }, []);

  return [settings, setSettings];
}
