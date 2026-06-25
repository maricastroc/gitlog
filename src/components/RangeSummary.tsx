"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import type { RepoPreview, Ref } from "@/types";
import { RepoCard } from "@/components/RepoCard";
import { NextSteps } from "@/components/NextSteps";

type Props = {
  preview: RepoPreview;
  refs: Ref[];
  from: string;
  to: string;
  processing?: boolean;
  exported?: boolean;
};

export function RangeSummary({ preview, refs, from, to, processing, exported }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <RepoCard preview={preview} refs={refs} />

      <div className="rounded-xl border border-line bg-panel-2 p-5 flex flex-col gap-3">
        <p className="font-display text-text-dim text-[10px] uppercase tracking-widest">Range</p>
        <div className="flex flex-col gap-1.5">
          <span className="text-text font-mono text-[13px]">{from || "beginning of history"}</span>
          <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3 text-add ml-0.5" />
          <span className="text-text font-mono text-[13px]">{to || "HEAD"}</span>
        </div>
      </div>

      <NextSteps doneUntil={exported ? 5 : processing ? 4 : 2} />
    </div>
  );
}
