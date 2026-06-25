"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCodeFork, faLock, faCircleCheck, faCircle, faTag, faArrowDown, faExclamationCircle, faEye, faCode, faClock, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import Spinner from "@/components/Spinner";
import type { Ref } from "@/types";

export type RepoPreview = {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
  language: string | null;
  pushed_at: string | null;
  private: boolean;
  _releases?: number;
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
      <p className="font-display text-text-dim text-[10px] uppercase tracking-widest mb-2">
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
  const pushedAgo = preview.pushed_at
    ? formatDistanceToNow(new Date(preview.pushed_at), { addSuffix: true, locale: enUS })
    : null;

  const stats = [
    { icon: faStar,              color: "text-fix",   value: formatCount(preview.stargazers_count), label: "stars" },
    { icon: faCodeFork,          color: "text-chore", value: formatCount(preview.forks_count),      label: "forks" },
    { icon: faEye,               color: "text-docs",  value: formatCount(preview.subscribers_count), label: "watchers" },
    { icon: faExclamationCircle, color: "text-style", value: formatCount(preview.open_issues_count), label: "issues" },
  ];

  const meta = [
    preview.language  && { icon: faCode,    label: preview.language },
    pushedAgo         && { icon: faClock,   label: `Last push ${pushedAgo}` },
    preview._releases && { icon: faBoxOpen, label: `${preview._releases} release${preview._releases !== 1 ? "s" : ""}` },
    lastRelease       && { icon: faTag,     label: `Latest: ${lastRelease}` },
  ].filter(Boolean) as { icon: typeof faCode; label: string }[];

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
        <p className="text-text-dim text-[12px] leading-relaxed">{preview.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-panel rounded-lg px-3 py-2">
            <FontAwesomeIcon icon={s.icon} className={`w-3 h-3 shrink-0 ${s.color}`} />
            <span className="text-text text-[12px] font-mono font-medium">{s.value}</span>
            <span className="text-text-dim text-[11px] font-mono">{s.label}</span>
          </div>
        ))}
      </div>

      {meta.length > 0 && (
        <div className="border-t border-line pt-3 flex flex-col gap-1.5">
          {meta.map((m) => (
            <div key={m.label} className="flex items-center gap-2 text-[11px] font-mono text-text-dim">
              <FontAwesomeIcon icon={m.icon} className="w-2.5 h-2.5 shrink-0 text-text-dim/40" />
              {m.label}
            </div>
          ))}
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
        <p className="font-display text-text-dim text-[10px] uppercase tracking-widest">
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
