"use client";

import { useState } from "react";
import type { Commit, Ref, RepoInfo } from "@/types";
import { api } from "@/lib/axios";
import { buildRefOptions } from "@/lib/refOptions";
import { groupBy } from "@/lib/commitStats";
import TagSelect from "@/components/TagSelect";

import { catStyle } from "@/lib/categoryStyles";

type CompareState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; commits: Commit[]; from: string; to: string }
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
      const params: Record<string, string> = { type: "remote", owner: repoInfo.owner!, repo: repoInfo.repo! };
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
        type: "remote", owner: repoInfo.owner!, repo: repoInfo.repo!,
        ...(from && { since: from }),
        ...(to && to !== "HEAD" && { until: to }),
      };
      if (repoInfo.token) params.token = repoInfo.token;
      const res = await api.get<{ data: Commit[] }>("/commits", { params });
      setCompareState({ status: "done", commits: res.data.data ?? [], from, to });
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
        <button onClick={handleClose} className="text-text-dim text-[11px] hover:text-text cursor-pointer">✕</button>
      </div>

      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex flex-col gap-1 w-56">
          <label className="text-text-dim text-[10px] uppercase tracking-widest">From (baseline)</label>
          {refsLoading ? (
            <div className="w-full h-[46px] bg-panel-2 border border-line rounded animate-pulse" />
          ) : (
            <TagSelect value={from} onValueChange={setFrom} options={fromOptions} placeholder="beginning of history" />
          )}
        </div>
        <div className="flex flex-col gap-1 w-48">
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
          {compareState.status === "loading" ? "loading..." : "Compare →"}
        </button>
      </div>

      {compareState.status === "error" && (
        <p className="text-red-400 text-[12px] font-mono">{compareState.message}</p>
      )}

      {compareState.status === "done" && (
        <DiffResult commits={commits} baseline={compareState.commits} repoInfo={repoInfo} baseFrom={compareState.from} baseTo={compareState.to} />
      )}
    </div>
  );
}

function DiffResult({ commits, baseline, repoInfo, baseFrom, baseTo }: {
  commits: Commit[]; baseline: Commit[]; repoInfo: RepoInfo; baseFrom: string; baseTo: string;
}) {
  const currTotal = commits.length || 1;
  const baseTotal = baseline.length || 1;
  const currByCat = groupBy(commits,  "category");
  const baseByCat = groupBy(baseline, "category");
  const allCats = [...new Set([...Object.keys(currByCat), ...Object.keys(baseByCat)])].sort();

  const currLabel = repoInfo.from ? `${repoInfo.from} → ${repoInfo.to ?? "HEAD"}` : "current";
  const baseLabel = baseFrom ? `${baseFrom} → ${baseTo}` : "baseline";

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-[10px] font-mono uppercase tracking-widest">
        <span className="text-add">▪ {currLabel} ({commits.length} commits)</span>
        <span className="text-text-dim">▪ {baseLabel} ({baseline.length} commits)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {allCats.map((cat) => {
          const curr = currByCat[cat] ?? 0;
          const prev = baseByCat[cat] ?? 0;
          const delta = curr - prev;
          const pctCurr = Math.round((curr / currTotal) * 100);
          const pctPrev = Math.round((prev / baseTotal) * 100);
          const style = catStyle(cat);
          const deltaLabel = delta === 0 ? "=" : delta > 0 ? `+${delta}` : `${delta}`;
          const deltaColor = delta > 0 ? "text-add" : delta < 0 ? "text-fix" : "text-text-dim";
          const multiplier = prev > 0 ? (curr / prev).toFixed(1) : null;

          return (
            <div key={cat} className={`rounded-lg border border-line bg-panel p-3 border-l-2 ${style.accent}`}>
              <p className={`text-[10px] uppercase tracking-widest mb-2 ${style.text}`}>{cat}</p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-[28px] leading-none font-bold font-display ${style.text}`}>{curr}</span>
                <span className={`text-[12px] font-mono font-semibold ${deltaColor}`}>{deltaLabel}</span>
              </div>
              <div className="text-text-dim text-[10px] font-mono mt-1">{pctCurr}% vs {pctPrev}% before</div>
              {multiplier && prev > 0 && delta !== 0 && (
                <div className={`text-[10px] font-mono mt-1.5 ${delta > 0 ? "text-add" : "text-fix"}`}>
                  {delta > 0 ? `${multiplier}× growth` : `${multiplier}× of before`}
                </div>
              )}
              <div className="mt-2 flex gap-0.5 h-1">
                <div className={`rounded-full ${style.bar} opacity-40`} style={{ width: `${pctPrev}%` }} />
                <div className={`rounded-full ${style.bar}`} style={{ width: `${Math.abs(pctCurr - pctPrev)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
