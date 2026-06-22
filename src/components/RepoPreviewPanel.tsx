"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCodeFork, faLock } from "@fortawesome/free-solid-svg-icons";
import Spinner from "@/components/Spinner";

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
  { n: "01", title: "Buscamos as tags",        desc: "Listamos todas as tags Git para definir o intervalo do changelog." },
  { n: "02", title: "Identificamos os commits", desc: "Filtramos e categorizamos cada commit: feat, fix, chore, docs..." },
  { n: "03", title: "Geramos o changelog",      desc: "Changelog legível, pronto para copiar ou exportar em Markdown." },
];

type Props = { preview: RepoPreview | null; loading: boolean };

export default function RepoPreviewPanel({ preview, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-panel-2 p-5 flex items-center gap-3 text-text-dim text-sm font-mono">
        <Spinner size="w-4 h-4" />
        verificando repositório...
      </div>
    );
  }

  if (preview) {
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
              <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" /> privado
            </span>
          )}
        </div>
        {preview.description && (
          <p className="text-text-dim text-[13px] leading-relaxed border-t border-line pt-3">{preview.description}</p>
        )}
        <div className="flex gap-5 pt-1">
          <span className="text-[12px] text-text-dim font-mono flex items-center gap-1.5">
            <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-fix" />
            <span className="text-text">{formatCount(preview.stargazers_count)}</span> stars
          </span>
          <span className="text-[12px] text-text-dim font-mono flex items-center gap-1.5">
            <FontAwesomeIcon icon={faCodeFork} className="w-3 h-3 text-chore" />
            <span className="text-text">{formatCount(preview.forks_count)}</span> forks
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-text-dim text-[12px] uppercase tracking-widest">
        O que acontece depois?
      </p>
      <div className="flex flex-col gap-3">
        {FLOW_STEPS.map(({ n, title, desc }) => (
          <div key={n} className="flex gap-3 p-4 rounded-xl border border-line bg-panel-2">
            <span className="text-[11px] font-mono text-add shrink-0 mt-0.5">{n}</span>
            <div>
              <p className="text-text text-[13px] font-mono mb-1">{title}</p>
              <p className="text-text-dim text-[12px] leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
