"use client";

import type { Settings } from "@/types";
import { useState } from "react";
import { Tooltip } from "react-tooltip";
import * as Select from "@radix-ui/react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { catStyle } from "@/lib/categoryStyles";
import { DEFAULT_SETTINGS } from "@/hooks/useSettings";

type Props = { settings: Settings; setSettings: (s: Settings) => void };

export default function SettingsView({ settings, setSettings }: Props) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCat, setSelectedCat] = useState("feat");
  const [saved, setSaved] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);

  function addKeyword() {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw) return;
    const current = draft.keywords[selectedCat] ?? [];
    if (current.includes(kw)) return;
    setDraft({ ...draft, keywords: { ...draft.keywords, [selectedCat]: [...current, kw] } });
    setNewKeyword("");
  }

  function removeKeyword(cat: string, kw: string) {
    setDraft({
      ...draft,
      keywords: { ...draft.keywords, [cat]: draft.keywords[cat].filter((k) => k !== kw) },
    });
  }

  function toggle(key: keyof Omit<Settings, "keywords">) {
    setDraft({ ...draft, [key]: !draft[key] });
  }

  function handleSave() {
    setSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const toggles: { key: keyof Omit<Settings, "keywords">; label: string; desc: string }[] = [
    {
      key: "conventionalCommits",
      label: "Conventional Commits",
      desc: "use feat:/fix: prefix to categorize instead of semantic analysis",
    },
    {
      key: "ignoreMerge",
      label: "Ignore merge commits",
      desc: "removes merge commits from the changelog",
    },
    {
      key: "ignoreBots",
      label: "Ignore bot commits",
      desc: "filters out commits from automated bots (dependabot, renovate, etc.)",
    },
    {
      key: "showAuthor",
      label: "Show author in changelog",
      desc: "includes the commit author name in exported changelog",
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="Categorization settings"
        description="Adjust the heuristic used to classify commits."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="panel">
          <div className="flex items-center justify-between mb-4">
            <p className="text-text-dim text-[10px] uppercase tracking-widest">
              Keywords by category
            </p>
            <Button variant="ghost" onClick={() => setDraft({ ...draft, keywords: DEFAULT_SETTINGS.keywords })} className="text-[9.5px] px-2 py-1">
              reset to defaults
            </Button>
          </div>

          <div className="flex flex-col divide-y divide-line mb-4">
            {Object.entries(draft.keywords).map(([cat, kws]) => (
              <div key={cat} className="flex flex-wrap items-center gap-1.5 py-3">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] uppercase tracking-wider border border-line shrink-0 ${catStyle(cat).text} ${catStyle(cat).bg}`}
                >
                  {cat}
                </span>
                {kws.map((kw) => (
                  <span
                    key={kw}
                    className="flex items-center gap-1 bg-panel-2 text-text-dim text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)]"
                  >
                    {kw}
                    <button
                      onClick={() => removeKeyword(cat, kw)}
                      className="text-text-dim hover:text-text bg-transparent border-none cursor-pointer text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Select.Root value={selectedCat} onValueChange={setSelectedCat}>
              <Select.Trigger className="flex items-center gap-2 bg-panel-2 border border-line rounded-[var(--radius-sm)] px-2.5 py-2 text-xs text-text font-mono cursor-pointer outline-none hover:border-text-dim transition-colors shrink-0">
                <Select.Value />
                <Select.Icon>
                  <FontAwesomeIcon icon={faChevronDown} className="w-2 h-2 text-text-dim" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  position="popper"
                  sideOffset={4}
                  className="z-50 bg-panel-2 border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <Select.Viewport className="p-1">
                    {Object.keys(draft.keywords).map((c) => (
                      <Select.Item
                        key={c}
                        value={c}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-mono cursor-pointer outline-none data-[highlighted]:bg-panel data-[highlighted]:text-text data-[state=checked]:text-add"
                      >
                        <Select.ItemIndicator>
                          <FontAwesomeIcon icon={faCheck} className="w-2 h-2" />
                        </Select.ItemIndicator>
                        <Select.ItemText>
                          <span className={catStyle(c).text}>{c}</span>
                        </Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            <input
              type="text"
              placeholder="new keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              className="flex-1 min-w-0 bg-panel-2 border border-line rounded-[var(--radius-sm)] px-2.5 py-2 text-xs text-text font-mono outline-none focus:border-text-dim placeholder:text-text-dim"
            />
            <Button variant="ghost" onClick={addKeyword} className="px-3 py-2 text-sm shrink-0 whitespace-nowrap">
              + add
            </Button>
          </div>
        </div>

        <div className="panel">
          <p className="text-text-dim text-[10px] uppercase tracking-widest mb-4">
            Parser behavior
          </p>

          <div className="flex flex-col gap-4">
            {toggles.map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-text text-[13px] font-mono">{label}</p>
                  <p className="text-text-dim text-[11px] mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`relative w-10 h-5 rounded-full shrink-0 mt-0.5 overflow-hidden border transition-colors cursor-pointer ${draft[key] ? "bg-add border-add" : "bg-panel border-text-dim"}`}
                >
                  <span
                    className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${draft[key] ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <span
        data-tooltip-id="save-settings"
        data-tooltip-content="Change a setting before saving"
        className="mt-5 block"
        style={{ display: !isDirty && !saved ? "block" : "contents" }}
      >
        <Button onClick={handleSave} disabled={!isDirty && !saved} className="w-full py-2.5">
          {saved ? <><FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" /> settings saved</> : isDirty ? "save settings" : "no changes"}
        </Button>
      </span>
      {!isDirty && !saved && (
        <Tooltip
          id="save-settings"
          place="top"
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono, monospace)",
            padding: "5px 10px",
            backgroundColor: "#2e3338",
            color: "#d0d5db",
            border: "1px solid #3d4349",
            borderRadius: 6,
          }}
        />
      )}
    </div>
  );
}
