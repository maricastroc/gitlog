export type CatStyle = {
  text:   string;
  bg:     string;
  dot:    string;
  bar:    string;
  accent: string;
  prefix: string;
  label:  string; 
};

export const CAT_STYLES: Record<string, CatStyle> = {
  feat:     { text: "text-add",      bg: "bg-add-dim",   dot: "bg-add",      bar: "bg-add",      accent: "border-add",   prefix: "+", label: "Features"  },
  fix:      { text: "text-fix",      bg: "bg-fix-dim",   dot: "bg-fix",      bar: "bg-fix",      accent: "border-fix",   prefix: "~", label: "Bug Fixes" },
  chore:    { text: "text-chore",    bg: "bg-chore-dim", dot: "bg-chore",    bar: "bg-chore",    accent: "border-chore", prefix: "·", label: "Refactors" },
  docs:     { text: "text-docs",     bg: "bg-docs-dim",  dot: "bg-docs",     bar: "bg-docs",     accent: "border-docs",  prefix: "·", label: "Docs"      },
  refactor: { text: "text-chore",    bg: "bg-chore-dim", dot: "bg-chore",    bar: "bg-chore",    accent: "border-chore", prefix: "~", label: "Refactors" },
  style:    { text: "text-style",    bg: "bg-style-dim", dot: "bg-style",    bar: "bg-style",    accent: "border-style", prefix: "·", label: "Style"     },
  test:     { text: "text-test",     bg: "bg-test-dim",  dot: "bg-test",     bar: "bg-test",     accent: "border-test",  prefix: "·", label: "Tests"     },
  other:    { text: "text-text-dim", bg: "bg-panel-2",   dot: "bg-text-dim", bar: "bg-text-dim", accent: "border-line",  prefix: "·", label: "Other"     },
};

export const CAT_ORDER = ["feat", "fix", "refactor", "docs", "test", "style", "other"] as const;

const FALLBACK: CatStyle = CAT_STYLES.other;

export function catStyle(category: string): CatStyle {
  return CAT_STYLES[category] ?? FALLBACK;
}
