export type Settings = {
  keywords: Record<string, string[]>;
  conventionalCommits: boolean;
  ignoreMerge: boolean;
  categorizeByFile: boolean;
  includeSquash: boolean;
};
