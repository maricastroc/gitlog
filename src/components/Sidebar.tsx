"use client";

import type { View, RepoInfo } from "@/dashboard/DashboardClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch, faChartPie, faListUl, faSlidersH } from "@fortawesome/free-solid-svg-icons";

type Props = { view: View; setView: (v: View) => void; repoInfo: RepoInfo | null };

const navItems: { id: View; label: string; icon: any; requiresRepo?: boolean }[] = [
  { id: "select",    label: "Selecionar repo", icon: faCodeBranch },
  { id: "overview",  label: "Visão geral",     icon: faChartPie,  requiresRepo: true },
  { id: "changelog", label: "Changelog",       icon: faListUl,    requiresRepo: true },
  { id: "settings",  label: "Configurações",   icon: faSlidersH   },
];

export default function Sidebar({ view, setView, repoInfo }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{ width: 220, minWidth: 220 }} className="hidden md:flex h-full bg-panel border-r border-line flex-col px-4 py-6 shrink-0 overflow-y-auto">
        <div className="mb-6">
          <img src="/logo.svg" alt="gitlog" style={{ width: 118, height: "auto" }} />
          {repoInfo && (
            <p className="text-text-dim text-[11px] mt-1.5 truncate">{repoInfo.label}</p>
          )}
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map((item) => {
            const locked = item.requiresRepo && !repoInfo;
            return (
              <button
                key={item.id}
                onClick={() => !locked && setView(item.id)}
                disabled={locked}
                title={locked ? "Carregue um repositório primeiro" : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-left w-full border-none font-mono transition-colors ${
                  locked
                    ? "text-line cursor-not-allowed opacity-50"
                    : view === item.id
                    ? "bg-panel-2 text-text cursor-pointer"
                    : "bg-transparent text-text-dim hover:text-text cursor-pointer"
                }`}
              >
                {view === item.id && !locked && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-add rounded-r-full" />
                )}
                <FontAwesomeIcon icon={item.icon} className="w-3 h-3 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {repoInfo?.from && (
          <div className="mt-auto pt-3 border-t border-line px-2">
            <p className="text-text-dim text-[9px] uppercase tracking-widest mb-1.5">Intervalo</p>
            <p className="text-add text-[11px] font-mono">{repoInfo.from}</p>
            <p className="text-text-dim text-[10px]">→</p>
            <p className="text-text text-[11px] font-mono">{repoInfo.to ?? "HEAD"}</p>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-panel border-t border-line flex justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const locked = item.requiresRepo && !repoInfo;
          return (
            <button
              key={item.id}
              onClick={() => !locked && setView(item.id)}
              disabled={locked}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                locked
                  ? "text-line opacity-40 cursor-not-allowed"
                  : view === item.id
                  ? "text-add"
                  : "text-text-dim"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
              <span className="text-[9px] font-mono">{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
