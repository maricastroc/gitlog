"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useRecentRepos } from "@/hooks/useRecentRepos";
import { useSettings } from "@/hooks/useSettings";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import SelectRepo from "@/components/SelectRepo";
import Overview from "@/components/Overview";
import CommitsView from "@/components/CommitsView";
import ChangelogView from "@/components/ChangelogView";
import SettingsView from "@/components/SettingsView";
import AuthorView from "@/components/AuthorView";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { EmptyState } from "@/components/EmptyState";
import type { Commit, RepoInfo, View, Ref } from "@/types";

async function fetchRemoteCommits(owner: string, repo: string, from?: string): Promise<Commit[]> {
  const params: Record<string, string> = { type: "remote", owner, repo };

  if (from) params.since = from;

  const res = await api.get<{ data: Commit[] }>("/commits", { params });

  return res.data.data ?? [];
}

export default function DashboardClient() {
  const router = useRouter();

  const autoLoaded = useRef(false);

  const [view, setView] = useState<View>("select");

  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);

  const [commits, setCommits] = useState<Commit[]>([]);

  const [refs, setRefs] = useState<Ref[]>([]);

  const [settings, setSettings] = useSettings();

  const [welcomed, setWelcomed] = useState(false);
  
  const { recents, add: addRecent } = useRecentRepos();

  const [hasExported, setHasExported] = useState(false);

  useEffect(() => {
    if (autoLoaded.current || !router.isReady) return;
    const { repo, from, to, view: viewParam } = router.query as Record<string, string>;
    if (!repo) return;
    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) return;
    autoLoaded.current = true;

    fetchRemoteCommits(owner, repoName, from).then((data) => {
      setWelcomed(true);
      handleRepoLoaded(
        { type: "remote", label: `${owner}/${repoName}`, owner, repo: repoName, from: from ?? "", to: to ?? "HEAD" },
        data,
        false,
        false,
      );
      const validViews: View[] = ["overview", "commits", "changelog", "authors"];
      if (viewParam && (validViews as string[]).includes(viewParam)) {
        setView(viewParam as View);
      }
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
        { query: { repo: `${info.owner}/${info.repo}`, from: info.from ?? "", to: info.to ?? "HEAD", view: "overview" } },
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
    
    fetchRemoteCommits(owner, repo, recent.from).then((data) => {
      handleRepoLoaded(
        { type: "remote", label: recent.label, owner, repo, from: recent.from ?? "", to: recent.to ?? "HEAD" },
        data,
      );
    }).catch(() => {});
  }

  const handleCategoryChange = useCallback((sha: string, category: string) => {
    setCommits((prev) => prev.map((c) => c.sha === sha ? { ...c, category } : c));
  }, []);

  function handleSetView(v: View) {
    if (v === "select") setWelcomed(true);
    setView(v);
    if (repoInfo?.type === "remote" && v !== "select") {
      router.replace({ query: { ...router.query, view: v } }, undefined, { shallow: true });
    }
  }

  const noRepo = (view === "overview" || view === "commits" || view === "changelog" || view === "authors") && !repoInfo;
  const showWelcome = !welcomed && view === "select" && !repoInfo;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar view={view} setView={handleSetView} repoInfo={repoInfo} />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-10 overflow-y-auto pb-20 md:pb-10">
        {showWelcome && <WelcomeScreen onStart={() => setWelcomed(true)} />}

        <div className={showWelcome || view !== "select" ? "hidden" : ""}>
          <SelectRepo onLoaded={handleRepoLoaded} onQuickLoad={handleQuickLoad} recents={recents} keywords={settings.keywords} hasExported={hasExported} />
        </div>

        {view === "overview"  && repoInfo && <Overview commits={commits} repoInfo={repoInfo} refs={refs} onViewAllCommits={() => handleSetView("commits")} onViewChangelog={() => handleSetView("changelog")} />}
        {view === "commits"   && repoInfo && <CommitsView commits={commits} onCategoryChange={handleCategoryChange} />}
        {view === "changelog" && repoInfo && <ChangelogView commits={commits} repoInfo={repoInfo} onExport={() => setHasExported(true)} />}
        {view === "authors"   && repoInfo && <AuthorView commits={commits} />}
        {view === "settings"  && <SettingsView settings={settings} setSettings={setSettings} />}
        {noRepo && <EmptyState onSelect={() => handleSetView("select")} />}
      </main>
    </div>
  );
}
