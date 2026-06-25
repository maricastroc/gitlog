"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const ANIMATION_COMMITS = [
  { type: "feat", msg: "add GitHub OAuth integration" },
  { type: "fix", msg: "resolve memory leak in loader" },
  { type: "refactor", msg: "simplify repository parser" },
  { type: "feat", msg: "implement tag comparison view" },
  { type: "fix", msg: "correct pagination offset" },
  { type: "chore", msg: "update dependencies" },
];

const TYPE_COLOR: Record<string, string> = {
  feat: "text-add",
  fix: "text-yellow-400",
  refactor: "text-blue-400",
  chore: "text-text-dim",
};

const TYPE_LABEL: Record<string, string> = {
  feat: "Features",
  fix: "Fixes",
  refactor: "Refactor",
  chore: "Chore",
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
      let i = 0;
      const tick = () => {
        i++;
        setVisibleCommits(i);
        if (i < ANIMATION_COMMITS.length) t = setTimeout(tick, 260);
        else t = setTimeout(() => setPhase("grouping"), 700);
      };
      t = setTimeout(() => {
        setVisibleCommits(0);
        t = setTimeout(tick, 260);
      }, 300);
    } else if (phase === "grouping") {
      t = setTimeout(() => setPhase("result"), 800);
    } else {
      t = setTimeout(() => setPhase("commits"), 3800);
    }
    return () => clearTimeout(t);
  }, [phase]);

  const grouped = ANIMATION_COMMITS.reduce<Record<string, string[]>>((acc, c) => {
    (acc[c.type] ??= []).push(c.msg);
    return acc;
  }, {});

  return (
    <div className="w-full flex items-stretch gap-2 select-none" style={{ height: 220 }}>
      <div
        className={`flex-1 rounded-xl border border-line bg-panel font-mono text-[11px] overflow-hidden flex flex-col transition-opacity duration-500 ${phase === "result" ? "opacity-25" : "opacity-100"}`}
      >
        <WindowChrome title="git log" />
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          {ANIMATION_COMMITS.map((c, i) => (
            <div
              key={i}
              className={`flex items-baseline gap-1.5 transition-all duration-300 ${i < visibleCommits ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}`}
            >
              <span className={`shrink-0 ${TYPE_COLOR[c.type] ?? "text-text-dim"}`}>{c.type}:</span>
              <span className="text-text-dim/70 truncate">{c.msg}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 w-7 shrink-0">
        <div
          className={`flex flex-col items-center transition-all duration-400 ${phase === "grouping" ? "opacity-100 scale-110" : "opacity-20 scale-100"}`}
        >
          <div className="w-px h-5 bg-add/60" />
          <span className="text-add/80 text-[9px] leading-none">▼</span>
        </div>
      </div>

      <div
        className={`flex-1 rounded-xl border font-mono text-[11px] overflow-hidden flex flex-col transition-all duration-500 ${phase === "result" ? "border-add/40 bg-panel opacity-100" : "border-line bg-panel opacity-35"}`}
      >
        <WindowChrome title="CHANGELOG.md" />
        <div className="p-3 flex flex-col gap-2 flex-1">
          {phase === "result" ? (
            Object.entries(grouped).map(([type, msgs], gi) => (
              <div
                key={type}
                className="transition-all duration-300"
                style={{ transitionDelay: `${gi * 70}ms` }}
              >
                <p className={`${TYPE_COLOR[type] ?? "text-text-dim"} mb-0.5`}>
                  ## {TYPE_LABEL[type] ?? type}
                </p>
                {msgs.map((m, i) => (
                  <p key={i} className="text-text-dim/70 pl-1">
                    + {m}
                  </p>
                ))}
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span
                className={`text-[10px] ${phase === "grouping" ? "text-add/60 animate-pulse" : "text-text-dim/20"}`}
              >
                {phase === "grouping" ? "categorizing…" : "awaiting commits"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-7 text-center max-w-[520px] mx-auto"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="flex flex-col gap-2.5">
        <p className="font-display text-[26px] font-bold text-text leading-tight">
          Generate clean, structured changelogs
          <br />
          from any Git repository.
        </p>
        <p className="text-text-dim text-[12px] font-mono leading-relaxed">
          Analyze commits, categorize changes automatically
          <br />
          and export professional release notes in seconds.
        </p>
      </div>

      <CommitTransformAnimation />

      <div className="flex flex-col items-center gap-2 w-full">
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-[13px] font-mono bg-add-dim text-add border border-add hover:brightness-110 transition-all cursor-pointer"
        >
          Get started <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </button>
        <p className="text-text-dim/40 text-[10px] font-mono">
          No account required. Supports GitHub &amp; local repos.
        </p>
      </div>
    </div>
  );
}
