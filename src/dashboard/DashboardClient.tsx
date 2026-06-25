"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

const ANIMATION_COMMITS = [
  { type: "feat",     msg: "add GitHub OAuth integration" },
  { type: "fix",      msg: "resolve memory leak in loader" },
  { type: "refactor", msg: "simplify repository parser" },
  { type: "feat",     msg: "implement tag comparison view" },
  { type: "fix",      msg: "correct pagination offset" },
  { type: "chore",    msg: "update dependencies" },
];

const TYPE_COLOR: Record<string, string> = {
  feat:     "text-add",
  fix:      "text-yellow-400",
  refactor: "text-blue-400",
  chore:    "text-text-dim",
};

const TYPE_LABEL: Record<string, string> = {
  feat: "Features", fix: "Fixes", refactor: "Refactor", chore: "Chore",
};

function WindowChrome({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-line bg-panel-2 shrink-0">
      <span className="w-2 h-2 rounded-full bg-[#ff5f57]/70" />
      <span className="w-2 h-2 rounded-full bg-[#febc2e]/70" />
      <span className="w-2 h-2 rounded-full bg-[#28c840]/70" />
      <span className="ml-2 text-text-dim/40 text-[10px] font-mono">{title}</span>
    </div>
  );
}

function CommitTransformAnimation() {
  const [phase, setPhase] = useState<"commits" | "grouping" | "result">("commits");
  const [visibleCommits, setVisibleCommits] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "commits") {
      setVisibleCommits(0);
      let i = 0;
      const tick = () => { i++; setVisibleCommits(i); if (i < ANIMATION_COMMITS.length) t = setTimeout(tick, 260); else t = setTimeout(() => setPhase("grouping"), 700); };
      t = setTimeout(tick, 300);
    } else if (phase === "grouping") {
      t = setTimeout(() => setPhase("result"), 800);
    } else {
      t = setTimeout(() => setPhase("commits"), 3800);
    }
    return () => clearTimeout(t);
  }, [phase]);

  const grouped = ANIMATION_COMMITS.reduce<Record<string, string[]>>((acc, c) => { (acc[c.type] ??= []).push(c.msg); return acc; }, {});

  return (
    <div className="w-full flex items-stretch gap-2 select-none">
      {/* Left: git log */}
      <div className={`flex-1 rounded-xl border border-line bg-panel font-mono text-[11px] overflow-hidden flex flex-col transition-opacity duration-500 ${phase === "result" ? "opacity-25" : "opacity-100"}`}>
        <WindowChrome title="git log" />
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          {ANIMATION_COMMITS.map((c, i) => (
            <div key={i} className={`flex items-baseline gap-1.5 transition-all duration-300 ${i < visibleCommits ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}`}>
              <span className={`shrink-0 ${TYPE_COLOR[c.type] ?? "text-text-dim"}`}>{c.type}:</span>
              <span className="text-text-dim/70 truncate">{c.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center justify-center gap-1 w-7 shrink-0">
        <div className={`flex flex-col items-center transition-all duration-400 ${phase === "grouping" ? "opacity-100 scale-110" : "opacity-20 scale-100"}`}>
          <div className="w-px h-5 bg-add/60" />
          <span className="text-add/80 text-[9px] leading-none">▼</span>
        </div>
      </div>

      {/* Right: CHANGELOG.md */}
      <div className={`flex-1 rounded-xl border font-mono text-[11px] overflow-hidden flex flex-col transition-all duration-500 ${phase === "result" ? "border-add/40 bg-panel opacity-100" : "border-line bg-panel opacity-35"}`}>
        <WindowChrome title="CHANGELOG.md" />
        <div className="p-3 flex flex-col gap-2 flex-1">
          {phase === "result"
            ? Object.entries(grouped).map(([type, msgs], gi) => (
                <div key={type} className="transition-all duration-300" style={{ transitionDelay: `${gi * 70}ms` }}>
                  <p className={`${TYPE_COLOR[type] ?? "text-text-dim"} mb-0.5`}>## {TYPE_LABEL[type] ?? type}</p>
                  {msgs.map((m, i) => <p key={i} className="text-text-dim/70 pl-1">+ {m}</p>)}
                </div>
              ))
            : <div className="flex-1 flex items-center justify-center">
                <span className={`text-[10px] ${phase === "grouping" ? "text-add/60 animate-pulse" : "text-text-dim/20"}`}>
                  {phase === "grouping" ? "categorizing…" : "awaiting commits"}
                </span>
              </div>
          }
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-7 text-center max-w-[520px] mx-auto"
      style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
    >
      <div className="flex flex-col gap-2.5">
        <p className="font-display text-[26px] font-bold text-text leading-tight">
          Generate clean, structured changelogs<br />from any Git repository.
        </p>
        <p className="text-text-dim text-[12px] font-mono leading-relaxed">
          Analyze commits, categorize changes automatically<br />and export professional release notes in seconds.
        </p>
      </div>

      <CommitTransformAnimation />

      <div className="flex flex-col items-center gap-2 w-full">
        <button onClick={onStart}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-[13px] font-mono bg-add-dim text-add border border-add hover:brightness-110 transition-all cursor-pointer">
          Get started →
        </button>
        <p className="text-text-dim/40 text-[10px] font-mono">No account required. Supports GitHub &amp; local repos.</p>
      </div>
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

function useSettings(): [Settings, (s: Settings) => void] {
  const [settings, setSettingsState] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem("gitlog:settings");
      if (!saved) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(saved) as Partial<Settings>;
      return {
        keywords: { ...DEFAULT_SETTINGS.keywords, ...(parsed.keywords ?? {}) },
        conventionalCommits: parsed.conventionalCommits ?? DEFAULT_SETTINGS.conventionalCommits,
        ignoreMerge:         parsed.ignoreMerge         ?? DEFAULT_SETTINGS.ignoreMerge,
        categorizeByFile:    parsed.categorizeByFile    ?? DEFAULT_SETTINGS.categorizeByFile,
        includeSquash:       parsed.includeSquash       ?? DEFAULT_SETTINGS.includeSquash,
      };
    } catch { return DEFAULT_SETTINGS; }
  });

  const setSettings = useCallback((s: Settings) => {
    setSettingsState(s);
    try { localStorage.setItem("gitlog:settings", JSON.stringify(s)); } catch {}
  }, []);

  return [settings, setSettings];
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

  useEffect(() => {
    if (autoLoaded.current || !router.isReady) return;
    const { repo, from, to, view: viewParam } = router.query as Record<string, string>;
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
