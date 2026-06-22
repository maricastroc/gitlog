"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SelectRepo from "@/components/SelectRepo";
import Overview from "@/components/Overview";
import CommitsView from "@/components/CommitsView";
import ChangelogView from "@/components/ChangelogView";
import SettingsView from "@/components/SettingsView";
import AuthorView from "@/components/AuthorView";

export type Commit = { sha: string; message: string; author: string; date: string; category: string };
export type RepoInfo = { type: "local" | "remote"; label: string; path?: string; owner?: string; repo?: string; token?: string; from?: string; to?: string };
export type View = "select" | "overview" | "commits" | "changelog" | "authors" | "settings";
export type Settings = { keywords: Record<string, string[]>; conventionalCommits: boolean; ignoreMerge: boolean; categorizeByFile: boolean; includeSquash: boolean };

const DEFAULT_SETTINGS: Settings = {
  keywords: {
    feat:  ["adiciona", "implementa", "cria", "nova"],
    fix:   ["corrige", "conserta", "resolve", "trata"],
    chore: ["atualiza", "ajusta", "remove", "limpa"],
    docs:  ["documenta", "comenta", "readme"],
  },
  conventionalCommits: true, ignoreMerge: true, categorizeByFile: true, includeSquash: false,
};

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center max-w-md mx-auto">
      <div>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700 }} className="text-text mb-2">
          Bem-vindo ao Gitlog
        </p>
        <p className="text-text-dim text-[13px] leading-relaxed">
          Gere changelogs profissionais a partir do histórico de commits do seu repositório Git.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 w-full text-left">
        {[
          { icon: "✓", label: "Gera changelogs automaticamente a partir de tags Git" },
          { icon: "✓", label: "Categoriza commits por tipo: feat, fix, chore, docs..." },
          { icon: "✓", label: "Suporta repositórios GitHub remotos e locais" },
          { icon: "✓", label: "Exportação em Markdown pronta para usar" },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-panel border border-line">
            <span className="text-add text-sm">{icon}</span>
            <span className="text-text-dim text-[12px] font-mono">{label}</span>
          </div>
        ))}
      </div>

      <button onClick={onStart}
        className="flex items-center gap-2 px-6 py-3 rounded-lg text-[13px] font-mono bg-add-dim text-add border border-add hover:brightness-110 transition-all cursor-pointer">
        Selecionar repositório →
      </button>
    </div>
  );
}

function EmptyState({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
      <div className="w-14 h-14 rounded-xl bg-panel border border-line flex items-center justify-center text-2xl text-line">▣</div>
      <div className="flex flex-col gap-1.5">
        <p className="text-text text-[15px]">Nenhum repositório selecionado</p>
        <p className="text-text-dim text-xs max-w-xs">Aponte um repositório GitHub ou local para visualizar o histórico de commits.</p>
      </div>
      <button onClick={onSelect} className="btn text-[13px] px-5 py-2.5">→ Selecionar repositório</button>
    </div>
  );
}

export default function DashboardClient() {
  const [view, setView] = useState<View>("select");
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [welcomed, setWelcomed] = useState(false);

  function handleRepoLoaded(info: RepoInfo, data: Commit[]) {
    setRepoInfo(info); setCommits(data); setView("overview");
  }

  function handleSetView(v: View) {
    if (v === "select") setWelcomed(true);
    setView(v);
  }

  const noRepo = (view === "overview" || view === "commits" || view === "changelog" || view === "authors") && !repoInfo;
  const showWelcome = !welcomed && view === "select" && !repoInfo;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar view={view} setView={handleSetView} repoInfo={repoInfo} />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-10 overflow-y-auto pb-20 md:pb-10">
        {showWelcome && <WelcomeScreen onStart={() => setWelcomed(true)} />}

        {/* SelectRepo sempre montado para preservar estado dos inputs */}
        <div className={showWelcome || view !== "select" ? "hidden" : ""}>
          <SelectRepo onLoaded={handleRepoLoaded} />
        </div>

        {view === "overview"  && repoInfo && <Overview commits={commits} onViewAllCommits={() => handleSetView("commits")} />}
        {view === "commits"   && repoInfo && <CommitsView commits={commits} />}
        {view === "changelog" && repoInfo && <ChangelogView commits={commits} repoInfo={repoInfo} />}
        {view === "authors"   && repoInfo && <AuthorView commits={commits} />}
        {view === "settings"  && <SettingsView settings={settings} setSettings={setSettings} />}
        {noRepo && <EmptyState onSelect={() => handleSetView("select")} />}
      </main>
    </div>
  );
}
