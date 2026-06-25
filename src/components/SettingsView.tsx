"use client";

import type { Settings } from "@/types";
import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { catStyle } from "@/lib/categoryStyles";

type Props = { settings: Settings; setSettings: (s: Settings) => void };

export default function SettingsView({ settings, setSettings }: Props) {
  const [newKeyword, setNewKeyword] = useState("");

  const [selectedCat, setSelectedCat] = useState("feat");

  const [saved, setSaved] = useState(false);

  function addKeyword() {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw) return;
    const current = settings.keywords[selectedCat] ?? [];
    if (current.includes(kw)) return;
    setSettings({
      ...settings,
      keywords: { ...settings.keywords, [selectedCat]: [...current, kw] },
    });
    setNewKeyword("");
  }

  function removeKeyword(cat: string, kw: string) {
    setSettings({
      ...settings,
      keywords: { ...settings.keywords, [cat]: settings.keywords[cat].filter((k) => k !== kw) },
    });
  }

  function toggle(key: keyof Omit<Settings, "keywords">) {
    setSettings({ ...settings, [key]: !settings[key] });
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const toggles: { key: keyof Omit<Settings, "keywords">; label: string; desc: string }[] = [
    {
      key: "conventionalCommits",
      label: "Conventional Commits",
      desc: "prioritizes feat:/fix: prefix when present",
    },
    {
      key: "ignoreMerge",
      label: "Ignore empty merge commits",
      desc: "removes merge commits with no content changes",
    },
    {
      key: "categorizeByFile",
      label: "Categorize by changed file",
      desc: "uses diff path as fallback if the message is ambiguous",
    },
    {
      key: "includeSquash",
      label: "Include squash commits",
      desc: "attempts to split squash commits into multiple entries",
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="Categorization settings"
        description="Adjust the heuristic used to classify commits."
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="panel">
          <p className="text-text-dim text-[10px] uppercase tracking-widest mb-4">
            Keywords by category
          </p>

          <div className="flex flex-col divide-y divide-line mb-4">
            {Object.entries(settings.keywords).map(([cat, kws]) => (
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
              <Select.Trigger className="flex items-center gap-2 bg-panel-2 border border-line rounded-[var(--radius-sm)] px-2.5 py-2 text-xs text-text font-mono cursor-pointer outline-none hover:border-text-dim transition-colors">
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
                    {Object.keys(settings.keywords).map((c) => (
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
              className="flex-1 bg-panel-2 border border-line rounded-[var(--radius-sm)] px-2.5 py-2 text-xs text-text font-mono outline-none focus:border-text-dim placeholder:text-text-dim"
            />
            <Button variant="ghost" onClick={addKeyword} className="px-3 py-2 text-sm">
              + add
            </Button>
          </div>
        </div>

        <div className="panel flex flex-col">
          <p className="text-text-dim text-[10px] uppercase tracking-widest mb-4">
            Parser behavior
          </p>

          <div className="flex flex-col gap-4 flex-1">
            {toggles.map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-text text-[13px] font-mono">{label}</p>
                  <p className="text-text-dim text-[11px] mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`relative w-10 h-5 rounded-full shrink-0 mt-0.5 overflow-hidden border transition-colors cursor-pointer ${settings[key] ? "bg-add border-add" : "bg-panel border-text-dim"}`}
                >
                  <span
                    className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${settings[key] ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>

          <Button onClick={handleSave} className="mt-6 w-full py-2.5">
            {saved ? "✓ settings saved" : "save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
