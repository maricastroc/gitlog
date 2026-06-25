"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import Spinner from "@/components/Spinner";
import { RepoCard } from "@/components/RepoCard";
import { NextSteps, FLOW_STEPS } from "@/components/NextSteps";
import { RangeSummary } from "@/components/RangeSummary";
import type { RepoPreview, Ref } from "@/types";

export type { RepoPreview };

type Props = {
  preview: RepoPreview | null;
  loading: boolean;
  processing?: boolean;
  exported?: boolean;
  step?: number;
  refs?: Ref[];
  from?: string;
  to?: string;
};

export default function RepoPreviewPanel({
  preview,
  loading,
  processing = false,
  exported = false,
  step = 0,
  refs = [],
  from = "",
  to = "HEAD",
}: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-panel-2 p-5 flex items-center gap-3 text-text-dim text-sm font-mono">
        <Spinner size="w-4 h-4" />
        verifying repository...
      </div>
    );
  }

  if (preview && step === 1) {
    return (
      <RangeSummary
        preview={preview}
        refs={refs}
        from={from}
        to={to}
        processing={processing}
        exported={exported}
      />
    );
  }

  if (preview) {
    return (
      <div className="flex flex-col">
        <RepoCard preview={preview} refs={refs} />
        <NextSteps doneUntil={step} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="font-display text-text-dim text-[10px] uppercase tracking-widest mb-2">
        What happens next?
      </p>
      {FLOW_STEPS.map((label) => (
        <div key={label} className="flex items-center gap-2.5 py-1">
          <FontAwesomeIcon icon={faCircle} className="w-2.5 h-2.5 shrink-0 text-line" />
          <span className="text-[12px] font-mono text-text-dim">{label}</span>
        </div>
      ))}
    </div>
  );
}
