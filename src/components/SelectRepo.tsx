"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faChevronRight, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import type { Commit, RepoInfo } from "@/dashboard/DashboardClient";
import type { RecentRepo } from "@/hooks/useRecentRepos";
import { useRepoPreview } from "@/hooks/useRepoPreview";
import { useRepoLoader } from "@/hooks/useRepoLoader";
import Button from "@/components/Button";
import FormField, { INPUT_CLS } from "@/components/FormField";
import Stepper from "@/components/Stepper";
import TagSelect from "@/components/TagSelect";
import RepoPreviewPanel from "@/components/RepoPreviewPanel";
import PageHeader from "@/components/PageHeader";

type Props = { onLoaded: (info: RepoInfo, commits: Commit[]) => void; recents?: RecentRepo[] };

function parseRemote(url: string) {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/\s.]+)/);
  if (match) return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  const parts = url.split("/").filter(Boolean);
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
  return null;
}

export default function SelectRepo({ onLoaded, recents = [] }: Props) {
  const [tab, setTab]             = useState<"remote" | "local">("remote");
  const [repoUrl, setRepoUrl]     = useState("");
  const [token, setToken]         = useState("");
  const [tokenOpen, setTokenOpen] = useState(false);
  const [localPath, setLocalPath] = useState("");

  const parsed = tab === "remote" ? parseRemote(repoUrl) : null;
  const { preview, loading: previewLoading } = useRepoPreview(parsed?.owner ?? null, parsed?.repo ?? null, token);

  const loader = useRepoLoader(onLoaded);

  const [validationError, setValidationError] = useState("");

  const fromOptions = [{ value: "", label: "início do histórico" }, ...loader.tags.map((t) => ({ value: t, label: t }))];
  const toOptions   = [{ value: "HEAD", label: "HEAD" },            ...loader.tags.map((t) => ({ value: t, label: t }))];

  function handleAnalyze() {
    setValidationError("");
    if (tab === "local") {
      if (!localPath) { setValidationError("Informe o caminho do repositório"); return; }
      loader.fetchTags({ type: "local", path: localPath });
    } else {
      if (!parsed) { setValidationError("URL inválida. Use https://github.com/owner/repo"); return; }
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
          title={loader.step === 0 ? "Selecionar repositório" : "Selecionar intervalo de tags"}
          description={loader.step === 0 ? "Importe um repositório Git para gerar changelogs." : "Escolha o intervalo de tags para filtrar os commits."}
        />

        {loader.step === 0 && (
          <>
            <div className="flex gap-1.5 mb-6 p-1 bg-panel-2 rounded-lg w-fit border border-line">
              {(["remote", "local"] as const).map((t) => (
                <button key={t} onClick={() => switchTab(t)}
                  className={`px-4 py-1.5 rounded-md text-[12px] font-mono cursor-pointer border transition-all ${
                    tab === t ? "bg-panel border-line text-text shadow-sm" : "bg-transparent border-transparent text-text-dim hover:text-text"
                  }`}>
                  {t === "remote" ? "URL remota" : "Repo local"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {tab === "remote" ? (
                <>
                  <FormField label="URL do repositório">
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
                      Repositório privado?
                      <span className="text-add underline underline-offset-2">Adicionar token</span>
                      <FontAwesomeIcon icon={faChevronRight} className={`w-2 h-2 transition-transform ${tokenOpen ? "rotate-90" : ""}`} />
                    </button>
                    {tokenOpen && (
                      <FormField label="" hint="Necessário para repositórios privados ou para evitar rate limit.">
                        <input className={INPUT_CLS} type="password" placeholder="ghp_..."
                          value={token} onChange={(e) => setToken(e.target.value)} />
                      </FormField>
                    )}
                  </div>
                </>
              ) : (
                <FormField label="Caminho do repositório">
                  <input className={INPUT_CLS} type="text" placeholder="/Users/você/dev/meu-projeto"
                    value={localPath} onChange={(e) => { setLocalPath(e.target.value); loader.reset(); }} />
                </FormField>
              )}

              <Button onClick={handleAnalyze} loading={loader.isLoading} className="w-full mt-2 py-3">
                Analisar repositório →
              </Button>
              {(validationError || loader.error) && (
                <p className="text-red-400 text-sm">{validationError || loader.error}</p>
              )}
            </div>

            {recents.length > 0 && (
              <div className="mt-4">
                <p className="text-text-dim text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="w-2.5 h-2.5" />
                  Recentes
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
              <FormField label="De">
                <TagSelect value={loader.from} onValueChange={loader.setFrom} options={fromOptions} placeholder="início do histórico" />
              </FormField>
              <FormField label="Até">
                <TagSelect value={loader.to} onValueChange={loader.setTo} options={toOptions} placeholder="HEAD" />
              </FormField>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={loader.reset} className="px-4 py-3">← voltar</Button>
              <Button onClick={handleProcess} loading={loader.isLoading} className="flex-1 py-3">Gerar changelog →</Button>
            </div>
            {loader.error && <p className="text-red-400 text-sm">{loader.error}</p>}
          </div>
        )}
      </div>

      <div className="flex-1 md:pt-16">
        <RepoPreviewPanel preview={tab === "remote" ? preview : null} loading={previewLoading} />
      </div>
    </div>
  );
}
