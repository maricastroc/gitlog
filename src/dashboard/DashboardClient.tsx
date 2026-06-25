"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useRecentRepos } from "@/hooks/useRecentRepos";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import SelectRepo from "@/components/SelectRepo";
import Overview from "@/components/Overview";
import CommitsView from "@/components/CommitsView";
import ChangelogView from "@/components/ChangelogView";
import SettingsView from "@/components/SettingsView";
import AuthorView from "@/components/AuthorView";
import type { Commit, RepoInfo, View, Settings, Ref } from "@/types";

const DEFAULT_SETTINGS: Settings = {
  keywords: {
    feat:     ["adds", "implements", "creates", "introduces"],
    fix:      ["fixes", "resolves", "patches", "corrects"],
    chore:    ["updates", "bumps", "removes", "cleans"],
    docs:     ["documents", "comments", "readme"],
    refactor: ["refactors", "reorganizes"],
    style:    ["styles", "layout", "css"],
    test:     ["tests", "specs", "coverage"],
  },
  conventionalCommits: true, ignoreMerge: true, categorizeByFile: true, includeSquash: false,
};

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center max-w-md mx-auto">
      <div>
        <p className="font-display text-[28px] font-bold text-text mb-2">
          Welcome to Gitlog
        </p>
        <p className="text-text-dim text-[13px] leading-relaxed">
          Generate professional changelogs from your Git repository commit history.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 w-full text-left">
        {[
          { icon: "✓", label: "Automatically generates changelogs from Git tags" },
          { icon: "✓", label: "Categorizes commits by type: feat, fix, chore, docs..." },
          { icon: "✓", label: "Supports remote GitHub and local repositories" },
          { icon: "✓", label: "Export to Markdown, ready to use" },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-panel border border-line">
            <span className="text-add text-sm">{icon}</span>
            <span className="text-text-dim text-[12px] font-mono">{label}</span>
          </div>
        ))}
      </div>

      <button onClick={onStart}
        className="flex items-center gap-2 px-6 py-3 rounded-lg text-[13px] font-mono bg-add-dim text-add border border-add hover:brightness-110 transition-all cursor-pointer">
        Select repository →
      </button>
    </div>
  );
}

function EmptyState({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
      <div className="w-14 h-14 rounded-xl bg-panel border border-line flex items-center justify-center text-2xl text-line">▣</div>
      <div className="flex flex-col gap-1.5">
        <p className="text-text text-[15px]">No repository selected</p>
        <p className="text-text-dim text-xs max-w-xs">Point to a GitHub or local repository to view the commit history.</p>
      </div>
      <button onClick={onSelect} className="btn text-[13px] px-5 py-2.5">→ Select repository</button>
    </div>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const autoLoaded = useRef(false);

  const [view, setView] = useState<View>("select");
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [refs, setRefs] = useState<Ref[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [welcomed, setWelcomed] = useState(false);
  const { recents, add: addRecent } = useRecentRepos();

  useEffect(() => {
    if (autoLoaded.current || !router.isReady) return;
    const { repo, from, to } = router.query as Record<string, string>;
    if (!repo) return;
    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) return;
    autoLoaded.current = true;

    const params: Record<string, string> = { type: "remote", owner, repo: repoName };
    if (from) params.since = from;

    api.get<{ data: Commit[] }>("/commits", { params }).then((res) => {
      const data = res.data.data ?? [];
      setWelcomed(true);
      handleRepoLoaded(
        { type: "remote", label: `${owner}/${repoName}`, owner, repo: repoName, from: from ?? "", to: to ?? "HEAD" },
        data,
        false,
      );
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  function handleRepoLoaded(info: RepoInfo, data: Commit[], refsOrUrl: Ref[] | boolean = true, updateUrl = true) {
    setRepoInfo(info);
    setCommits(data);
    if (Array.isArray(refsOrUrl)) setRefs(refsOrUrl);
    const shouldUpdateUrl = Array.isArray(refsOrUrl) ? updateUrl : refsOrUrl;
    setView("overview");
    addRecent({
      label: info.label,
      type: info.type,
      url:  info.type === "remote" ? `https://github.com/${info.owner}/${info.repo}` : undefined,
      path: info.path,
      from: info.from,
      to:   info.to,
    });
    if (shouldUpdateUrl && info.type === "remote") {
      router.replace(
        { query: { repo: `${info.owner}/${info.repo}`, from: info.from ?? "", to: info.to ?? "HEAD" } },
        undefined,
        { shallow: true },
      );
    }
  }

  function handleQuickLoad(recent: import("@/hooks/useRecentRepos").RecentRepo) {
    if (recent.type !== "remote" || !recent.url) return;
    const match = recent.url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;
    const [, owner, repo] = match;
    setWelcomed(true);
    const params: Record<string, string> = { type: "remote", owner, repo };
    if (recent.from) params.since = recent.from;
    api.get<{ data: Commit[] }>("/commits", { params }).then((res) => {
      handleRepoLoaded(
        { type: "remote", label: recent.label, owner, repo, from: recent.from ?? "", to: recent.to ?? "HEAD" },
        res.data.data ?? [],
      );
    }).catch(() => {});
  }

  function handleCategoryChange(sha: string, category: string) {
    setCommits((prev) => prev.map((c) => c.sha === sha ? { ...c, category } : c));
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
          <SelectRepo onLoaded={handleRepoLoaded} onQuickLoad={handleQuickLoad} recents={recents} keywords={settings.keywords} />
        </div>

        {view === "overview"  && repoInfo && <Overview commits={commits} repoInfo={repoInfo} refs={refs} onViewAllCommits={() => handleSetView("commits")} onViewChangelog={() => handleSetView("changelog")} />}
        {view === "commits"   && repoInfo && <CommitsView commits={commits} onCategoryChange={handleCategoryChange} />}
        {view === "changelog" && repoInfo && <ChangelogView commits={commits} repoInfo={repoInfo} />}
        {view === "authors"   && repoInfo && <AuthorView commits={commits} />}
        {view === "settings"  && <SettingsView settings={settings} setSettings={setSettings} />}
        {noRepo && <EmptyState onSelect={() => handleSetView("select")} />}
      </main>
    </div>
  );
}
