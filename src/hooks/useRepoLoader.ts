import { useState } from "react";
import { api } from "@/lib/axios";
import { fetchCommits } from "@/lib/fetchCommits";
import type { Commit, Ref, RepoInfo, Settings } from "@/types";
import type { AxiosError } from "axios";

type RemoteParams = { type: "remote"; owner: string; repo: string; token?: string };
type LocalParams = { type: "local"; path: string };
type RepoParams = RemoteParams | LocalParams;

type State = {
  step: 0 | 1;
  refs: Ref[];
  error: string;
  isLoading: boolean;
  from: string;
  to: string;
};

const INITIAL: State = { step: 0, refs: [], error: "", isLoading: false, from: "", to: "HEAD" };

function extractError(err: unknown): string {
  return (err as AxiosError<{ error: string }>)?.response?.data?.error ?? "Unexpected error";
}

export function useRepoLoader(
  onLoaded: (info: RepoInfo, commits: Commit[], refs: Ref[]) => void,
  keywords: Settings["keywords"] = {},
  ignoreMerge = true,
  conventionalCommits = true,
  ignoreBots = true,
) {
  const [state, setState] = useState<State>(INITIAL);

  function set(patch: Partial<State>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  async function fetchTags(params: RepoParams) {
    set({ isLoading: true, error: "" });
    try {
      const res = await api.get<{ data: Ref[] }>("/tags", { params });
      const refs = res.data.data ?? [];
      set({ step: 1, refs, from: refs[0]?.name ?? "", isLoading: false });
    } catch (err) {
      set({ error: extractError(err), isLoading: false });
    }
  }

  async function loadCommits(params: RepoParams) {
    set({ isLoading: true, error: "" });
    try {
      const source =
        params.type === "remote"
          ? { type: "remote" as const, owner: params.owner, repo: params.repo }
          : { type: "local" as const, path: params.path };

      const commits = await fetchCommits(source, {
        from: state.from,
        to: state.to,
        ignoreMerge,
        conventionalCommits,
        ignoreBots,
        keywords,
      });

      const info: RepoInfo =
        params.type === "local"
          ? {
              type: "local",
              label: params.path.split("/").filter(Boolean).pop() ?? params.path,
              path: params.path,
              from: state.from,
              to: state.to,
            }
          : {
              type: "remote",
              label: `${params.owner}/${params.repo}`,
              owner: params.owner,
              repo: params.repo,
              token: params.token,
              from: state.from,
              to: "HEAD",
            };

      onLoaded(info, commits, state.refs);
      set({ isLoading: false });
    } catch (err) {
      set({ error: extractError(err), isLoading: false });
    }
  }

  function reset() {
    setState(INITIAL);
  }

  return {
    ...state,
    fetchTags,
    fetchCommits: loadCommits,
    setFrom: (from: string) => set({ from }),
    setTo: (to: string) => set({ to }),
    reset,
  };
}
