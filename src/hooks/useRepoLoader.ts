import { useState } from "react";
import { api } from "@/lib/axios";
import type { Commit, RepoInfo } from "@/dashboard/DashboardClient";
import type { AxiosError } from "axios";

type RemoteParams = { type: "remote"; owner: string; repo: string; token?: string };
type LocalParams  = { type: "local";  path: string };
type RepoParams   = RemoteParams | LocalParams;

type State = {
  step: 0 | 1;
  tags: string[];
  error: string;
  isLoading: boolean;
  from: string;
  to: string;
};

const INITIAL: State = { step: 0, tags: [], error: "", isLoading: false, from: "", to: "HEAD" };

function extractError(err: unknown): string {
  return (err as AxiosError<{ error: string }>)?.response?.data?.error ?? "Erro inesperado";
}

export function useRepoLoader(onLoaded: (info: RepoInfo, commits: Commit[]) => void) {
  const [state, setState] = useState<State>(INITIAL);

  function set(patch: Partial<State>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  async function fetchTags(params: RepoParams) {
    set({ isLoading: true, error: "" });
    try {
      const res = await api.get<{ data: string[] }>("/tags", { params });
      const tags = res.data.data ?? [];
      set({ step: 1, tags, from: tags[0] ?? "", isLoading: false });
    } catch (err) {
      set({ error: extractError(err), isLoading: false });
    }
  }

  async function fetchCommits(params: RepoParams) {
    set({ isLoading: true, error: "" });
    try {
      const commitParams = {
        ...params,
        ...(state.from && { since: state.from }),
        ...(params.type === "local" && state.to !== "HEAD" && { until: state.to }),
      };
      const res = await api.get<{ data: Commit[] }>("/commits", { params: commitParams });
      const commits = res.data.data ?? [];

      const info: RepoInfo =
        params.type === "local"
          ? { type: "local", label: params.path.split("/").filter(Boolean).pop() ?? params.path, path: params.path, from: state.from, to: state.to }
          : { type: "remote", label: `${params.owner}/${params.repo}`, owner: params.owner, repo: params.repo, token: params.token, from: state.from, to: "HEAD" };

      onLoaded(info, commits);
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
    fetchCommits,
    setFrom: (from: string) => set({ from }),
    setTo:   (to: string)   => set({ to }),
    reset,
  };
}
