"use client";

import { useState } from "react";
import type { Commit, Ref, RepoInfo } from "@/types";
import { api } from "@/lib/axios";
import { buildRefOptions } from "@/lib/refOptions";
import TagSelect from "@/components/TagSelect";
import DiffResult from "@/components/DiffResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

type CompareState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; commits: Commit[]; from: string; to: string; truncated: boolean }
  | { status: "error"; message: string };

type Props = { commits: Commit[]; repoInfo: RepoInfo; refs: Ref[] };

export default function ReleaseDiff({ commits, repoInfo, refs: initialRefs }: Props) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("HEAD");
  const [compareState, setCompareState] = useState<CompareState>({ status: "idle" });
  const [extraRefs, setExtraRefs] = useState<Ref[]>([]);
  const [refsLoading, setRefsLoading] = useState(false);

  const refs = initialRefs.length > 0 ? initialRefs : extraRefs;
  const { fromOptions, toOptions } = buildRefOptions(refs);

  async function handleOpen() {
    setOpen(true);
    if (refs.length > 0 || repoInfo.type !== "remote") return;
    setRefsLoading(true);
    try {
      const params: Record<string, string> = {
        type: "remote",
        owner: repoInfo.owner!,
        repo: repoInfo.repo!,
      };
      if (repoInfo.token) params.token = repoInfo.token;
      const res = await api.get<{ data: Ref[] }>("/tags", { params });
      const fetched = res.data.data ?? [];
      setExtraRefs(fetched);
      if (!from && fetched[0]) setFrom(fetched[0].name);
    } catch (e) {
      console.error("Failed to fetch refs for compare:", e);
    }
    setRefsLoading(false);
  }

  async function handleCompare() {
    if (repoInfo.type !== "remote") return;
    setCompareState({ status: "loading" });
    try {
      const params: Record<string, string> = {
        type: "remote",
        owner: repoInfo.owner!,
        repo: repoInfo.repo!,
        ...(from && { since: from }),
        ...(to && to !== "HEAD" && { until: to }),
      };
      if (repoInfo.token) params.token = repoInfo.token;
      const res = await api.get<{ data: Commit[]; truncated?: boolean }>("/commits", { params });
      setCompareState({
        status: "done",
        commits: res.data.data ?? [],
        from,
        to,
        truncated: res.data.truncated ?? false,
      });
    } catch {
      setCompareState({ status: "error", message: "Failed to fetch comparison range." });
    }
  }

  function handleClose() {
    setOpen(false);
    setCompareState({ status: "idle" });
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="text-[11px] font-mono text-text-dim hover:text-text border border-line hover:border-text-dim px-3 py-1.5 rounded transition-colors cursor-pointer"
      >
        ↔ Compare with another range...
      </button>
    );
  }

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-4">
        <p className="text-text-dim text-[10px] uppercase tracking-widest">Release diff</p>
        <button
          onClick={handleClose}
          className="text-text-dim text-base hover:text-text cursor-pointer px-1"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex flex-col gap-1 flex-1 min-w-40">
          <label className="text-text-dim text-[10px] uppercase tracking-widest">
            From (baseline)
          </label>
          {refsLoading ? (
            <div className="w-full h-[46px] bg-panel-2 border border-line rounded animate-pulse" />
          ) : (
            <TagSelect
              value={from}
              onValueChange={setFrom}
              options={fromOptions}
              placeholder="beginning of history"
            />
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-36">
          <label className="text-text-dim text-[10px] uppercase tracking-widest">To</label>
          {refsLoading ? (
            <div className="w-full h-[46px] bg-panel-2 border border-line rounded animate-pulse" />
          ) : (
            <TagSelect value={to} onValueChange={setTo} options={toOptions} placeholder="HEAD" />
          )}
        </div>
        <button
          onClick={handleCompare}
          disabled={compareState.status === "loading" || refsLoading}
          className="px-4 py-3 rounded-lg bg-add-dim border border-add text-add text-[13px] font-mono hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
        >
          {compareState.status === "loading" ? (
            "loading..."
          ) : (
            <>
              Compare <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {compareState.status === "error" && (
        <p className="text-red-400 text-[12px] font-mono">{compareState.message}</p>
      )}

      {compareState.status === "done" && compareState.truncated && (
        <p
          className="text-[11px] font-mono text-[var(--color-fix)] mb-3"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            padding: "6px 10px",
          }}
        >
          Showing the first 1,000 commits. Use a narrower range to see the full history.
        </p>
      )}

      {compareState.status === "done" && (
        <DiffResult
          commits={commits}
          baseline={compareState.commits}
          repoInfo={repoInfo}
          baseFrom={compareState.from}
          baseTo={compareState.to}
        />
      )}
    </div>
  );
}
