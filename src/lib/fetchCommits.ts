import { api } from "@/lib/axios";
import type { Commit, Settings } from "@/types";

type RemoteSource = { type: "remote"; owner: string; repo: string };
type LocalSource = { type: "local"; path: string };

type FetchCommitsOptions = {
  from?: string;
  to?: string;
  ignoreMerge?: boolean;
  conventionalCommits?: boolean;
  ignoreBots?: boolean;
  keywords?: Settings["keywords"];
};

export async function fetchCommits(
  source: RemoteSource | LocalSource,
  options: FetchCommitsOptions = {},
): Promise<Commit[]> {
  const {
    from,
    to,
    ignoreMerge = true,
    conventionalCommits = true,
    ignoreBots = true,
    keywords = {},
  } = options;

  const params: Record<string, string> = {
    type: source.type,
    ignoreMerge: String(ignoreMerge),
    conventionalCommits: String(conventionalCommits),
    ignoreBots: String(ignoreBots),
    keywords: JSON.stringify(keywords),
  };

  if (source.type === "remote") {
    params.owner = source.owner;
    params.repo = source.repo;
  } else {
    params.path = source.path;
  }

  if (from) params.since = from;
  if (to && to !== "HEAD") params.until = to;

  const res = await api.get<{ data: Commit[] }>("/commits", { params });
  return res.data.data ?? [];
}
