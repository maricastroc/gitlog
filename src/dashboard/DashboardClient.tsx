"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useRecentRepos } from "@/hooks/useRecentRepos";
import { useSettings } from "@/hooks/useSettings";
import { fetchCommits } from "@/lib/fetchCommits";
import { categorize } from "@/lib/categorize";
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

  const [categoryOverrides, setCategoryOverrides] = useState<Map<string, string>>(new Map());

  const categorizedCommits = useMemo(
    () =>
      commits.map((c) => ({
        ...c,
        category:
          categoryOverrides.get(c.sha) ??
          categorize(c.message, settings.keywords, settings.conventionalCommits),
      })),
    [commits, categoryOverrides, settings.keywords, settings.conventionalCommits],
  );

  const filterInitialized = useRef(false);

  useEffect(() => {
    if (!filterInitialized.current) {
      filterInitialized.current = true;
      return;
    }
    if (!repoInfo) return;

    const source =
      repoInfo.type === "remote" && repoInfo.owner && repoInfo.repo
        ? {
            type: "remote" as const,
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            token: repoInfo.token,
          }
        : repoInfo.type === "local" && repoInfo.path
          ? { type: "local" as const, path: repoInfo.path }
          : null;

    if (source) {
      fetchCommits(source, {
        from: repoInfo.from,
        to: repoInfo.to,
        ignoreMerge: settings.ignoreMerge,
        conventionalCommits: settings.conventionalCommits,
        ignoreBots: settings.ignoreBots,
        keywords: settings.keywords,
      })
        .then(({ commits: data }) => {
          setCommits(data);
          setCategoryOverrides(new Map());
        })
        .catch((err) => {
          console.error("Failed to re-fetch commits:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ignoreMerge, settings.ignoreBots]);

  useEffect(() => {
    if (autoLoaded.current || !router.isReady) return;
    const { repo, from, to, view: viewParam } = router.query as Record<string, string>;
    if (!repo) return;
    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) return;
    autoLoaded.current = true;

    fetchCommits(
      { type: "remote", owner, repo: repoName },
      {
        from,
        ignoreMerge: settings.ignoreMerge,
        conventionalCommits: settings.conventionalCommits,
        ignoreBots: settings.ignoreBots,
        keywords: settings.keywords,
      },
    )
      .then(({ commits: data, truncated: t }) => {
        setWelcomed(true);
        handleRepoLoaded(
          {
            type: "remote",
            label: `${owner}/${repoName}`,
            owner,
            repo: repoName,
            from: from ?? "",
            to: to ?? "HEAD",
            truncated: t,
          },
          data,
          false,
          false,
        );
        const validViews: View[] = ["overview", "commits", "changelog", "authors"];
        if (viewParam && (validViews as string[]).includes(viewParam)) {
          setView(viewParam as View);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  function handleRepoLoaded(
    info: RepoInfo,
    data: Commit[],
    refsOrUrl: Ref[] | boolean = true,
    updateUrl = true,
  ) {
    setRepoInfo(info);

    setCommits(data);

    if (Array.isArray(refsOrUrl)) setRefs(refsOrUrl);

    const shouldUpdateUrl = Array.isArray(refsOrUrl) ? updateUrl : refsOrUrl;

    setView("overview");

    addRecent({
      label: info.label,
      type: info.type,
      url: info.type === "remote" ? `https://github.com/${info.owner}/${info.repo}` : undefined,
      path: info.path,
      from: info.from,
      to: info.to,
    });

    if (shouldUpdateUrl && info.type === "remote") {
      router.replace(
        {
          query: {
            repo: `${info.owner}/${info.repo}`,
            from: info.from ?? "",
            to: info.to ?? "HEAD",
            view: "overview",
          },
        },
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

    fetchCommits(
      { type: "remote", owner, repo },
      {
        from: recent.from,
        ignoreMerge: settings.ignoreMerge,
        conventionalCommits: settings.conventionalCommits,
        ignoreBots: settings.ignoreBots,
        keywords: settings.keywords,
      },
    )
      .then(({ commits: data, truncated: t }) => {
        handleRepoLoaded(
          {
            type: "remote",
            label: recent.label,
            owner,
            repo,
            from: recent.from ?? "",
            to: recent.to ?? "HEAD",
            truncated: t,
          },
          data,
        );
      })
      .catch(() => {});
  }

  const handleCategoryChange = useCallback((sha: string, category: string) => {
    setCategoryOverrides((prev) => new Map(prev).set(sha, category));
  }, []);

  function handleSetView(v: View) {
    if (v === "select") setWelcomed(true);
    setView(v);
    if (repoInfo?.type === "remote" && v !== "select") {
      router.replace({ query: { ...router.query, view: v } }, undefined, { shallow: true });
    }
  }

  const noRepo =
    (view === "overview" || view === "commits" || view === "changelog" || view === "authors") &&
    !repoInfo;
  const showWelcome = !welcomed && view === "select" && !repoInfo;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar view={view} setView={handleSetView} repoInfo={repoInfo} />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-10 overflow-y-auto pb-20 md:pb-10">
        {showWelcome && <WelcomeScreen onStart={() => setWelcomed(true)} />}

        <div className={showWelcome || view !== "select" ? "hidden" : ""}>
          <SelectRepo
            onLoaded={handleRepoLoaded}
            onQuickLoad={handleQuickLoad}
            recents={recents}
            keywords={settings.keywords}
            ignoreMerge={settings.ignoreMerge}
            conventionalCommits={settings.conventionalCommits}
            ignoreBots={settings.ignoreBots}
            hasExported={hasExported}
          />
        </div>

        {repoInfo?.truncated &&
          (view === "overview" ||
            view === "commits" ||
            view === "changelog" ||
            view === "authors") && (
            <div
              className="mb-4 px-3 py-2 rounded-lg bg-[var(--color-fix)]/10 text-[var(--color-fix)] text-xs font-mono"
              style={{ border: "1px solid rgba(255, 255, 255, 0.12)" }}
            >
              Showing the first 1,000 commits. Use a narrower range (e.g. between two tags) to see
              the full history.
            </div>
          )}

        {view === "overview" && repoInfo && (
          <Overview
            commits={categorizedCommits}
            repoInfo={repoInfo}
            refs={refs}
            onViewAllCommits={() => handleSetView("commits")}
            onViewChangelog={() => handleSetView("changelog")}
          />
        )}
        {view === "commits" && repoInfo && (
          <CommitsView commits={categorizedCommits} onCategoryChange={handleCategoryChange} />
        )}
        {view === "changelog" && repoInfo && (
          <ChangelogView
            commits={categorizedCommits}
            repoInfo={repoInfo}
            showAuthor={settings.showAuthor}
            onExport={() => setHasExported(true)}
          />
        )}
        {view === "authors" && repoInfo && <AuthorView commits={categorizedCommits} />}
        {view === "settings" && <SettingsView settings={settings} setSettings={setSettings} />}
        {noRepo && <EmptyState onSelect={() => handleSetView("select")} />}
      </main>
    </div>
  );
}
