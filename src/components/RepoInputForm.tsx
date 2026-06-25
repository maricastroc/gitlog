"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faChevronRight, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/Button";
import FormField, { INPUT_CLS } from "@/components/FormField";

type Tab = "remote" | "local";

type Props = {
  tab: Tab;
  repoUrl: string;
  token: string;
  tokenOpen: boolean;
  localPath: string;
  isLoading: boolean;
  validationError: string;
  apiError: string;
  onRepoUrlChange: (v: string) => void;
  onTokenChange: (v: string) => void;
  onTokenOpenToggle: () => void;
  onLocalPathChange: (v: string) => void;
  onAnalyze: () => void;
};

export function RepoInputForm({
  tab,
  repoUrl,
  token,
  tokenOpen,
  localPath,
  isLoading,
  validationError,
  apiError,
  onRepoUrlChange,
  onTokenChange,
  onTokenOpenToggle,
  onLocalPathChange,
  onAnalyze,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {tab === "remote" ? (
        <>
          <FormField label="Repository URL">
            <input
              className={INPUT_CLS}
              type="text"
              placeholder="https://github.com/owner/repository"
              value={repoUrl}
              onChange={(e) => onRepoUrlChange(e.target.value)}
            />
            <div className="flex gap-3 mt-2">
              {["vercel/next.js", "facebook/react", "microsoft/vscode"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => onRepoUrlChange(`https://github.com/${ex}`)}
                  className="text-sm text-text-dim hover:text-text font-mono transition-colors cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </FormField>

          <div>
            <button
              onClick={onTokenOpenToggle}
              className="flex items-center gap-2 text-sm text-text-dim font-mono hover:text-text transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" />
              Private repository?
              <span className="text-add underline underline-offset-2">Add token</span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className={`w-2 h-2 transition-transform ${tokenOpen ? "rotate-90" : ""}`}
              />
            </button>
            {tokenOpen && (
              <FormField label="" hint="Required for private repositories or to avoid rate limiting.">
                <input
                  className={INPUT_CLS}
                  type="password"
                  placeholder="ghp_..."
                  value={token}
                  onChange={(e) => onTokenChange(e.target.value)}
                />
              </FormField>
            )}
          </div>
        </>
      ) : (
        <FormField label="Repository path">
          <input
            className={INPUT_CLS}
            type="text"
            placeholder="/Users/you/dev/my-project"
            value={localPath}
            onChange={(e) => onLocalPathChange(e.target.value)}
          />
        </FormField>
      )}

      <Button onClick={onAnalyze} loading={isLoading} className="w-full mt-2 py-3">
        Analyze repository <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
      </Button>

      {(validationError || apiError) && (
        <p className="text-red-400 text-sm">{validationError || apiError}</p>
      )}
    </div>
  );
}
