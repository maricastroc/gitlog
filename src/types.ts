export type Commit = { sha: string; message: string; author: string; date: string; category: string };
export type RepoInfo = { type: "local" | "remote"; label: string; path?: string; owner?: string; repo?: string; token?: string; from?: string; to?: string };
export type View = "select" | "overview" | "commits" | "changelog" | "authors" | "settings";
export type Settings = { keywords: Record<string, string[]>; conventionalCommits: boolean; ignoreMerge: boolean; categorizeByFile: boolean; includeSquash: boolean };
