"use client";

import { useState } from "react";
import type { Commit, RepoInfo, Settings } from "@/types";
import type { RecentRepo } from "@/hooks/useRecentRepos";
import { useRepoPreview } from "@/hooks/useRepoPreview";
import { useRepoLoader } from "@/hooks/useRepoLoader";
import Stepper from "@/components/Stepper";
import PageHeader from "@/components/PageHeader";
import RepoPreviewPanel from "@/components/RepoPreviewPanel";
import { RepoInputForm } from "@/components/RepoInputForm";
import { RecentReposList } from "@/components/RecentReposList";
import { RangeSelector } from "@/components/RangeSelector";

type Props = {
  onLoaded: (info: RepoInfo, commits: Commit[]) => void;
  onQuickLoad?: (recent: RecentRepo) => void;
  recents?: RecentRepo[];
  keywords?: Settings["keywords"];
  ignoreMerge?: boolean;
  conventionalCommits?: boolean;
  ignoreBots?: boolean;
  hasExported?: boolean;
};

function parseRemote(url: string) {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/\s.]+)/);
  if (match) return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  const parts = url.split("/").filter(Boolean);
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
  return null;
}

export default function SelectRepo({
  onLoaded,
  onQuickLoad,
  recents = [],
  keywords = {},
  ignoreMerge = true,
  conventionalCommits = true,
  ignoreBots = true,
  hasExported = false,
}: Props) {
  const [tab, setTab] = useState<"remote" | "local">("remote");
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");
  const [tokenOpen, setTokenOpen] = useState(false);
  const [localPath, setLocalPath] = useState("");
  const [validationError, setValidationError] = useState("");
  const [hasProcessed, setHasProcessed] = useState(false);

  const parsed = tab === "remote" ? parseRemote(repoUrl) : null;
  const { preview, loading: previewLoading } = useRepoPreview(
    parsed?.owner ?? null,
    parsed?.repo ?? null,
    token,
  );
  const loader = useRepoLoader(onLoaded, keywords, ignoreMerge, conventionalCommits, ignoreBots);

  function switchTab(t: "remote" | "local") {
    setTab(t);
    setValidationError("");
    loader.reset();
  }

  function handleRepoUrlChange(url: string) {
    setRepoUrl(url);
    loader.reset();
  }

  function handleLocalPathChange(path: string) {
    setLocalPath(path);
    loader.reset();
  }

  function handleAnalyze() {
    setValidationError("");
    if (tab === "local") {
      if (!localPath) {
        setValidationError("Please enter the repository path");
        return;
      }
      loader.fetchTags({ type: "local", path: localPath });
    } else {
      if (!parsed) {
        setValidationError("Invalid URL. Use https://github.com/owner/repo");
        return;
      }
      loader.fetchTags({ type: "remote", owner: parsed.owner, repo: parsed.repo, ...(token && { token }) });
    }
  }

  function handleGenerate() {
    setHasProcessed(true);
    if (tab === "local") {
      loader.fetchCommits({ type: "local", path: localPath });
    } else {
      loader.fetchCommits({ type: "remote", owner: parsed!.owner, repo: parsed!.repo, ...(token && { token }) });
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 h-full">
      <div className="w-full md:w-[520px] md:shrink-0">
        <Stepper step={hasProcessed ? 2 : loader.step} />
        <PageHeader
          title={loader.step === 0 ? "Select repository" : "Select range"}
          description={
            loader.step === 0
              ? "Import a Git repository to generate changelogs."
              : "Choose two branches or tags to compare."
          }
        />

        {loader.step === 0 && (
          <>
            <div className="flex gap-1.5 mb-6 p-1 bg-panel-2 rounded-lg w-fit border border-line">
              <button
                onClick={() => switchTab("remote")}
                className={`px-4 py-1.5 rounded-md text-[12px] font-mono cursor-pointer border transition-all ${
                  tab === "remote"
                    ? "bg-panel border-line text-text shadow-sm"
                    : "bg-transparent border-transparent text-text-dim hover:text-text"
                }`}
              >
                Remote URL
              </button>
              {process.env.NODE_ENV === "development" ? (
                <button
                  onClick={() => switchTab("local")}
                  className={`px-4 py-1.5 rounded-md text-[12px] font-mono cursor-pointer border transition-all ${
                    tab === "local"
                      ? "bg-panel border-line text-text shadow-sm"
                      : "bg-transparent border-transparent text-text-dim hover:text-text"
                  }`}
                >
                  Local repo
                </button>
              ) : (
                <span
                  title="Only available when running locally"
                  className="px-4 py-1.5 rounded-md text-[12px] font-mono border border-transparent text-text-dim/40 cursor-not-allowed select-none"
                >
                  Local repo
                </span>
              )}
            </div>

            {process.env.NODE_ENV !== "development" && tab === "local" && (
              <p className="text-text-dim text-[12px] font-mono -mt-4 mb-2">
                Local repositories are only supported when running the app locally.
              </p>
            )}

            <RepoInputForm
              tab={tab}
              repoUrl={repoUrl}
              token={token}
              tokenOpen={tokenOpen}
              localPath={localPath}
              isLoading={loader.isLoading}
              validationError={validationError}
              apiError={loader.error}
              onRepoUrlChange={handleRepoUrlChange}
              onTokenChange={setToken}
              onTokenOpenToggle={() => setTokenOpen((v) => !v)}
              onLocalPathChange={handleLocalPathChange}
              onAnalyze={handleAnalyze}
            />

            <RecentReposList
              recents={recents}
              onQuickLoad={onQuickLoad}
              onSelectRemote={(url) => { switchTab("remote"); setRepoUrl(url); }}
              onSelectLocal={(path) => { switchTab("local"); setLocalPath(path); }}
            />
          </>
        )}

        {loader.step === 1 && (
          <RangeSelector
            refs={loader.refs}
            from={loader.from}
            to={loader.to}
            isLoading={loader.isLoading}
            error={loader.error}
            onFromChange={loader.setFrom}
            onToChange={loader.setTo}
            onBack={loader.reset}
            onGenerate={handleGenerate}
          />
        )}
      </div>

      <div className="flex-1 md:pt-16">
        <RepoPreviewPanel
          preview={tab === "remote" ? preview : null}
          loading={previewLoading}
          processing={loader.isLoading || hasProcessed}
          exported={hasExported}
          step={loader.step}
          refs={loader.refs}
          from={loader.from}
          to={loader.to}
        />
      </div>
    </div>
  );
}
