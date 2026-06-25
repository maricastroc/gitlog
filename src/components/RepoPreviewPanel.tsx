"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCodeFork, faLock, faCircleCheck, faCircle, faTag, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Spinner from "@/components/Spinner";
import type { Ref } from "@/types";

export type RepoPreview = {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
};

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

const FLOW_STEPS = [
  "Fetch branches & tags",
  "Select comparison range",
  "Categorize commits",
  "Generate changelog",
  "Export as .md, .txt or .json",
];

type Props = { preview: RepoPreview | null; loading: boolean; step?: number; refs?: Ref[]; from?: string; to?: string };

function NextSteps({ doneUntil }: { doneUntil: number }) {
  return (
    <div className="flex flex-col gap-1 mt-5">
      <p className="text-text-dim text-[10px] uppercase tracking-widest mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Next steps
      </p>
      {FLOW_STEPS.map((label, i) => {
        const done = i < doneUntil;
        return (
          <div key={label} className="flex items-center gap-2.5 py-1">
            <FontAwesomeIcon
              icon={done ? faCircleCheck : faCircle}
              className={`w-2.5 h-2.5 shrink-0 ${done ? "text-add" : "text-line"}`}
            />
            <span className={`text-[12px] font-mono ${done ? "text-text-dim line-through decoration-line" : "text-text-dim"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RepoCard({ preview, refs }: { preview: RepoPreview; refs: Ref[] }) {
  const tags = refs.filter((r) => r.type === "tag");
  const lastRelease = tags[0]?.name ?? null;

  return (
    <div className="rounded-xl border border-line bg-panel-2 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <a href={`https://github.com/${preview.full_name}`} target="_blank" rel="noopener noreferrer"
            className="text-text font-mono text-[15px] font-medium hover:underline underline-offset-2">
            {preview.name}
          </a>
          <p className="text-text-dim text-[12px] font-mono mt-0.5">{preview.full_name}</p>
        </div>
        {preview.private && (
          <span className="text-[11px] text-fix font-mono flex items-center gap-1.5 shrink-0 bg-fix-dim px-2 py-1 rounded-md">
            <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" /> private
          </span>
        )}
      </div>
      {preview.description && (
        <p className="text-text-dim text-[13px] leading-relaxed border-t border-line pt-3">{preview.description}</p>
      )}
      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
        <span className="text-[12px] text-text-dim font-mono flex items-center gap-1.5">
          <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-fix" />
          <span className="text-text">{formatCount(preview.stargazers_count)}</span> stars
        </span>
        <span className="text-[12px] text-text-dim font-mono flex items-center gap-1.5">
          <FontAwesomeIcon icon={faCodeFork} className="w-3 h-3 text-chore" />
          <span className="text-text">{formatCount(preview.forks_count)}</span> forks
        </span>
        {tags.length > 0 && (
          <span className="text-[12px] text-text-dim font-mono flex items-center gap-1.5">
            <FontAwesomeIcon icon={faTag} className="w-3 h-3 text-docs" />
            <span className="text-text">{tags.length}</span> tags
          </span>
        )}
      </div>
      {lastRelease && (
        <div className="border-t border-line pt-3 flex items-center gap-2">
          <span className="text-text-dim text-[11px] font-mono">last release</span>
          <span className="text-add text-[11px] font-mono bg-add-dim px-2 py-0.5 rounded">{lastRelease}</span>
        </div>
      )}
    </div>
  );
}

function RangeSummary({ preview, refs, from, to }: { preview: RepoPreview; refs: Ref[]; from: string; to: string }) {
  return (
    <div className="flex flex-col gap-3">
      <RepoCard preview={preview} refs={refs} />

      <div className="rounded-xl border border-line bg-panel-2 p-5 flex flex-col gap-3">
        <p className="text-text-dim text-[10px] uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Range
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="text-text font-mono text-[13px]">{from || "beginning of history"}</span>
          <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3 text-add ml-0.5" />
          <span className="text-text font-mono text-[13px]">{to || "HEAD"}</span>
        </div>
      </div>

      <NextSteps doneUntil={2} />
    </div>
  );
}

export default function RepoPreviewPanel({ preview, loading, step = 0, refs = [], from = "", to = "HEAD" }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-panel-2 p-5 flex items-center gap-3 text-text-dim text-sm font-mono">
        <Spinner size="w-4 h-4" />
        verifying repository...
      </div>
    );
  }

  if (preview && step === 1) {
    return <RangeSummary preview={preview} refs={refs} from={from} to={to} />;
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
      <p className="text-text-dim text-[10px] uppercase tracking-widest mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
