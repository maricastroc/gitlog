"use client";

import type { Settings } from "@/dashboard/DashboardClient";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const CAT_STYLE: Record<string, string> = {
  feat:  "text-add bg-add-dim border-add",
  fix:   "text-fix bg-fix-dim border-fix",
  chore: "text-chore bg-chore-dim border-chore",
  docs:  "text-docs bg-docs-dim border-docs",
};

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
    setSettings({ ...settings, keywords: { ...settings.keywords, [selectedCat]: [...current, kw] } });
    setNewKeyword("");
  }

  function removeKeyword(cat: string, kw: string) {
    setSettings({ ...settings, keywords: { ...settings.keywords, [cat]: settings.keywords[cat].filter((k) => k !== kw) } });
  }

  function toggle(key: keyof Omit<Settings, "keywords">) {
    setSettings({ ...settings, [key]: !settings[key] });
  }

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  const toggles: { key: keyof Omit<Settings, "keywords">; label: string; desc: string }[] = [
    { key: "conventionalCommits", label: "Conventional Commits",         desc: "prioriza prefixo feat:/fix: quando presente"             },
    { key: "ignoreMerge",         label: "Ignorar merge commits vazios",  desc: "remove commits de merge sem alteração de conteúdo"      },
    { key: "categorizeByFile",    label: "Categorizar por arquivo alterado", desc: "usa caminho do diff como fallback se a mensagem for ambígua" },
    { key: "includeSquash",       label: "Incluir squash commits",        desc: "tenta separar squash em múltiplas entradas"             },
  ];

  return (
    <div className="w-full">
      <PageHeader title="Configurações de categorização" description="Ajuste a heurística usada pra classificar commits." />

      <div className="grid grid-cols-2 gap-3">
        {/* keywords */}
        <div className="panel">
          <p className="text-text-dim text-[10px] uppercase tracking-widest mb-4">Palavras-chave por categoria</p>

          <div className="flex flex-col gap-3 mb-4">
            {Object.entries(settings.keywords).map(([cat, kws]) => (
              <div key={cat} className="flex items-start gap-2.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] uppercase tracking-wider border shrink-0 mt-0.5 ${CAT_STYLE[cat] ?? "text-text-dim bg-panel-2 border-line"}`}>
                  {cat}
                </span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {kws.map((kw) => (
                    <span key={kw} className="flex items-center gap-1 bg-panel-2 border border-line text-text-dim text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)]">
                      {kw}
                      <button onClick={() => removeKeyword(cat, kw)} className="text-text-dim hover:text-text bg-transparent border-none cursor-pointer text-sm leading-none">×</button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-panel-2 border border-line rounded-[var(--radius-sm)] px-2.5 py-2 text-xs text-text font-mono cursor-pointer outline-none">
              {Object.keys(settings.keywords).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="nova palavra-chave..." value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              className="flex-1 bg-panel-2 border border-line rounded-[var(--radius-sm)] px-2.5 py-2 text-xs text-text font-mono outline-none focus:border-text-dim placeholder:text-text-dim" />
            <button onClick={addKeyword} className="btn ghost px-3 py-2 text-xs">+ adicionar</button>
          </div>
        </div>

        {/* toggles */}
        <div className="panel flex flex-col">
          <p className="text-text-dim text-[10px] uppercase tracking-widest mb-4">Comportamento do parser</p>

          <div className="flex flex-col gap-4 flex-1">
            {toggles.map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-text text-[13px] font-mono">{label}</p>
                  <p className="text-text-dim text-[11px] mt-0.5">{desc}</p>
                </div>
                <button onClick={() => toggle(key)}
                  className={`relative w-10 h-5 rounded-full shrink-0 mt-0.5 overflow-hidden border transition-colors cursor-pointer ${settings[key] ? "bg-add border-add" : "bg-panel-2 border-line"}`}>
                  <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${settings[key] ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleSave} className="btn mt-6 w-full py-2.5 text-[13px]">
            {saved ? "✓ configurações salvas" : "salvar configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}
