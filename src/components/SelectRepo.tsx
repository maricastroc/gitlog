"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faChevronRight, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import type { Commit, RepoInfo, Settings } from "@/types";
import type { RecentRepo } from "@/hooks/useRecentRepos";
import { useRepoPreview } from "@/hooks/useRepoPreview";
import { useRepoLoader } from "@/hooks/useRepoLoader";
import Button from "@/components/Button";
import FormField, { INPUT_CLS } from "@/components/FormField";
import Stepper from "@/components/Stepper";
import TagSelect from "@/components/TagSelect";
import RepoPreviewPanel from "@/components/RepoPreviewPanel";
import PageHeader from "@/components/PageHeader";

type Props = { onLoaded: (info: RepoInfo, commits: Commit[]) => void; recents?: RecentRepo[]; keywords?: Settings["keywords"] };

function parseRemote(url: string) {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/\s.]+)/);
  if (match) return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  const parts = url.split("/").filter(Boolean);
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
  return null;
}

export default function SelectRepo({ onLoaded, recents = [], keywords = {} }: Props) {
  const [tab, setTab]             = useState<"remote" | "local">("remote");
  const [repoUrl, setRepoUrl]     = useState("");
  const [token, setToken]         = useState("");
  const [tokenOpen, setTokenOpen] = useState(false);
  const [localPath, setLocalPath] = useState("");

  const parsed = tab === "remote" ? parseRemote(repoUrl) : null;
  const { preview, loading: previewLoading } = useRepoPreview(parsed?.owner ?? null, parsed?.repo ?? null, token);

  const loader = useRepoLoader(onLoaded, keywords);

  const [validationError, setValidationError] = useState("");

  const fromOptions = [
    { value: "", label: "beginning of history" },
    ...loader.refs.filter((r) => r.type === "branch").map((r) => ({ value: r.name, label: r.name, group: "Branches" })),
    ...loader.refs.filter((r) => r.type === "tag").map((r) => ({ value: r.name, label: r.name, group: "Tags" })),
  ];
  const toOptions = [
    { value: "HEAD", label: "HEAD" },
    ...loader.refs.filter((r) => r.type === "branch").map((r) => ({ value: r.name, label: r.name, group: "Branches" })),
    ...loader.refs.filter((r) => r.type === "tag").map((r) => ({ value: r.name, label: r.name, group: "Tags" })),
  ];

  function handleAnalyze() {
    setValidationError("");
    if (tab === "local") {
      if (!localPath) { setValidationError("Please enter the repository path"); return; }
      loader.fetchTags({ type: "local", path: localPath });
    } else {
      if (!parsed) { setValidationError("Invalid URL. Use https://github.com/owner/repo"); return; }
      loader.fetchTags({ type: "remote", owner: parsed.owner, repo: parsed.repo, ...(token && { token }) });
    }
  }

  function handleProcess() {
    if (tab === "local") {
      loader.fetchCommits({ type: "local", path: localPath });
    } else {
      loader.fetchCommits({ type: "remote", owner: parsed!.owner, repo: parsed!.repo, ...(token && { token }) });
    }
  }

  function switchTab(t: "remote" | "local") {
    setTab(t);
    setValidationError("");
    loader.reset();
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 h-full">
      <div className="w-full md:w-[420px] md:shrink-0">
        <Stepper step={loader.step} />
        <PageHeader
          title={loader.step === 0 ? "Select repository" : "Select range"}
          description={loader.step === 0 ? "Import a Git repository to generate changelogs." : "Choose two branches or tags to compare."}
        />

        {loader.step === 0 && (
          <>
            <div className="flex gap-1.5 mb-6 p-1 bg-panel-2 rounded-lg w-fit border border-line">
              <button onClick={() => switchTab("remote")}
                className={`px-4 py-1.5 rounded-md text-[12px] font-mono cursor-pointer border transition-all ${
                  tab === "remote" ? "bg-panel border-line text-text shadow-sm" : "bg-transparent border-transparent text-text-dim hover:text-text"
                }`}>
                Remote URL
              </button>
              {process.env.NODE_ENV === "development" ? (
                <button onClick={() => switchTab("local")}
                  className={`px-4 py-1.5 rounded-md text-[12px] font-mono cursor-pointer border transition-all ${
                    tab === "local" ? "bg-panel border-line text-text shadow-sm" : "bg-transparent border-transparent text-text-dim hover:text-text"
                  }`}>
                  Local repo
                </button>
              ) : (
                <span title="Only available when running locally"
                  className="px-4 py-1.5 rounded-md text-[12px] font-mono border border-transparent text-text-dim/40 cursor-not-allowed select-none">
                  Local repo
                </span>
              )}
            </div>
            {process.env.NODE_ENV !== "development" && tab === "local" && (
              <p className="text-text-dim text-[12px] font-mono -mt-4 mb-2">
                Local repositories are only supported when running the app locally.
              </p>
            )}

            <div className="flex flex-col gap-4">
              {tab === "remote" ? (
                <>
                  <FormField label="Repository URL">
                    <input className={INPUT_CLS} type="text" placeholder="https://github.com/owner/repository"
                      value={repoUrl} onChange={(e) => { setRepoUrl(e.target.value); loader.reset(); }} />
                    <div className="flex gap-3 mt-2">
                      {["vercel/next.js", "facebook/react", "microsoft/vscode"].map((ex) => (
                        <button key={ex} onClick={() => setRepoUrl(`https://github.com/${ex}`)}
                          className="text-sm text-text-dim hover:text-text font-mono transition-colors cursor-pointer">
                          {ex}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <div>
                    <button onClick={() => setTokenOpen((v) => !v)}
                      className="flex items-center gap-2 text-sm text-text-dim font-mono hover:text-text transition-colors cursor-pointer">
                      <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" />
                      Private repository?
                      <span className="text-add underline underline-offset-2">Add token</span>
                      <FontAwesomeIcon icon={faChevronRight} className={`w-2 h-2 transition-transform ${tokenOpen ? "rotate-90" : ""}`} />
                    </button>
                    {tokenOpen && (
                      <FormField label="" hint="Required for private repositories or to avoid rate limiting.">
                        <input className={INPUT_CLS} type="password" placeholder="ghp_..."
                          value={token} onChange={(e) => setToken(e.target.value)} />
                      </FormField>
                    )}
                  </div>
                </>
              ) : (
                <FormField label="Repository path">
                  <input className={INPUT_CLS} type="text" placeholder="/Users/you/dev/my-project"
                    value={localPath} onChange={(e) => { setLocalPath(e.target.value); loader.reset(); }} />
                </FormField>
              )}

              <Button onClick={handleAnalyze} loading={loader.isLoading} className="w-full mt-2 py-3">
                Analyze repository →
              </Button>
              {(validationError || loader.error) && (
                <p className="text-red-400 text-sm">{validationError || loader.error}</p>
              )}
            </div>

            {recents.length > 0 && (
              <div className="mt-4">
                <p className="text-text-dim text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="w-2.5 h-2.5" />
                  Recent
                </p>
                <div className="flex flex-col gap-1.5">
                  {recents.map((r) => (
                    <button key={r.url ?? r.path} onClick={() => {
                      if (r.type === "remote" && r.url)  { switchTab("remote"); setRepoUrl(r.url); }
                      if (r.type === "local"  && r.path) { switchTab("local");  setLocalPath(r.path); }
                    }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-panel-2 border border-line text-left hover:border-text-dim transition-colors cursor-pointer">
                      <span className="text-add text-[10px] font-mono shrink-0">{r.type === "remote" ? "gh" : "local"}</span>
                      <span className="text-text text-[12px] font-mono truncate">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {loader.step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="From">
                <TagSelect value={loader.from} onValueChange={loader.setFrom} options={fromOptions} placeholder="beginning of history" />
              </FormField>
              <FormField label="To">
                <TagSelect value={loader.to} onValueChange={loader.setTo} options={toOptions} placeholder="HEAD" />
              </FormField>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={loader.reset} className="px-4 py-3">← back</Button>
              <Button onClick={handleProcess} loading={loader.isLoading} className="flex-1 py-3">Generate changelog →</Button>
            </div>
            {loader.error && <p className="text-red-400 text-sm">{loader.error}</p>}
          </div>
        )}
      </div>

      <div className="flex-1 md:pt-16">
        <RepoPreviewPanel
          preview={tab === "remote" ? preview : null}
          loading={previewLoading}
          step={loader.step}
          refs={loader.refs}
          from={loader.from}
          to={loader.to}
        />
      </div>
    </div>
  );
}
