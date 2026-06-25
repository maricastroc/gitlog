"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { RecentRepo } from "@/hooks/useRecentRepos";

type Props = {
  recents: RecentRepo[];
  onQuickLoad?: (recent: RecentRepo) => void;
  onSelectRemote: (url: string) => void;
  onSelectLocal: (path: string) => void;
};

export function RecentReposList({ recents, onQuickLoad, onSelectRemote, onSelectLocal }: Props) {
  if (recents.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-text-dim text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <FontAwesomeIcon icon={faClockRotateLeft} className="w-2.5 h-2.5" />
        Recent
      </p>
      <div className="flex flex-col gap-1.5">
        {recents.map((r) => {
          const hasRange = r.type === "remote" && (r.from || r.to);
          return (
            <button
              key={(r.url ?? r.path) + (r.from ?? "")}
              onClick={() => {
                if (hasRange && onQuickLoad) {
                  onQuickLoad(r);
                } else if (r.type === "remote" && r.url) {
                  onSelectRemote(r.url);
                } else if (r.type === "local" && r.path) {
                  onSelectLocal(r.path);
                }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-panel-2 border border-line text-left hover:border-text-dim transition-colors cursor-pointer group"
            >
              <span className="text-add text-[10px] font-mono shrink-0">
                {r.type === "remote" ? "gh" : "local"}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-text text-[12px] font-mono truncate block">{r.label}</span>
                {hasRange && (
                  <span className="text-text-dim text-[10px] font-mono truncate block">
                    {r.from || "start"}{" "}
                    <FontAwesomeIcon icon={faArrowRight} className="w-2 h-2 inline" />{" "}
                    {r.to ?? "HEAD"}
                  </span>
                )}
              </div>
              {hasRange && (
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="w-2.5 h-2.5 text-add shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
