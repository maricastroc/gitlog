"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as Select from "@radix-ui/react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import type { Commit } from "@/dashboard/DashboardClient";
import PageHeader from "@/components/PageHeader";
import DatePicker from "@/components/DatePicker";

const CAT_TEXT: Record<string, string> = {
  feat: "text-add", fix: "text-fix", chore: "text-chore", docs: "text-docs",
  refactor: "text-chore", style: "text-style", test: "text-test", other: "text-text-dim",
};
const CAT_BG: Record<string, string> = {
  feat: "bg-add-dim", fix: "bg-fix-dim", chore: "bg-chore-dim", docs: "bg-docs-dim",
  refactor: "bg-chore-dim", style: "bg-style-dim", test: "bg-test-dim", other: "bg-panel-2",
};

const PAGE_SIZE = 25;
const ALL = "__all__";

function FilterSelect({ value, onValueChange, placeholder, options }: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 bg-panel border border-line rounded-lg text-[12px] font-mono text-text cursor-pointer outline-none hover:border-text-dim focus:border-add transition-colors gap-2">
        <Select.Value placeholder={placeholder} />
        <Select.Icon><FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-text-dim shrink-0" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={4} className="z-50 w-[var(--radix-select-trigger-width)] bg-panel border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item key={opt.value} value={opt.value}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-mono text-text-dim cursor-pointer outline-none data-[highlighted]:bg-panel-2 data-[highlighted]:text-text data-[state=checked]:text-add">
                <Select.ItemIndicator><FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" /></Select.ItemIndicator>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

type Props = { commits: Commit[] };

export default function CommitsView({ commits }: Props) {
  const [search, setSearch]       = useState("");
  const [catFilter, setCat]       = useState(ALL);
  const [authorFilter, setAuthor] = useState(ALL);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [page, setPage]           = useState(1);

  const authors    = useMemo(() => [...new Set(commits.map((c) => c.author))].sort(), [commits]);
  const categories = useMemo(() => [...new Set(commits.map((c) => c.category))].sort(), [commits]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return commits.filter((c) => {
      if (catFilter    !== ALL && c.category !== catFilter) return false;
      if (authorFilter !== ALL && c.author   !== authorFilter) return false;
      if (q && !c.message.toLowerCase().includes(q) && !c.author.toLowerCase().includes(q) && !c.sha.includes(q)) return false;
      if (dateFrom && new Date(c.date) < new Date(dateFrom)) return false;
      if (dateTo   && new Date(c.date) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [commits, search, catFilter, authorFilter, dateFrom, dateTo]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageCommits = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasFilters = search || catFilter !== ALL || authorFilter !== ALL || dateFrom || dateTo;

  function resetFilters() {
    setSearch(""); setCat(ALL); setAuthor(ALL); setDateFrom(""); setDateTo(""); setPage(1);
  }

  const catOptions    = [{ value: ALL, label: "Todas as categorias" }, ...categories.map((c) => ({ value: c, label: c }))];
  const authorOptions = [{ value: ALL, label: "Todos os autores"    }, ...authors.map((a)    => ({ value: a, label: a }))];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <PageHeader title="Commits" description={`${filtered.length} de ${commits.length} commits`} />
        {hasFilters && (
          <button onClick={resetFilters} className="btn ghost shrink-0 sm:mt-1">limpar filtros</button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        <input
          type="text"
          placeholder="Buscar mensagem, autor, sha..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:col-span-2 bg-panel border border-line rounded-lg px-3 py-2 text-[12px] font-mono text-text placeholder:text-text-dim focus:outline-none focus:border-add transition-colors"
        />
        <FilterSelect value={catFilter}    onValueChange={(v) => { setCat(v);    setPage(1); }} placeholder="Todas as categorias" options={catOptions} />
        <FilterSelect value={authorFilter} onValueChange={(v) => { setAuthor(v); setPage(1); }} placeholder="Todos os autores"    options={authorOptions} />
        <DatePicker value={dateFrom} onChange={(v) => { setDateFrom(v); setPage(1); }} placeholder="De (data)" />
        <DatePicker value={dateTo}   onChange={(v) => { setDateTo(v);   setPage(1); }} placeholder="Até (data)" />
      </div>

      <div className="panel p-0 overflow-hidden">
        {pageCommits.length === 0 ? (
          <p className="text-text-dim text-[13px] font-mono p-6">Nenhum commit encontrado.</p>
        ) : (
          <div className="divide-y divide-line">
            {pageCommits.map((c) => (
              <div key={c.sha} className="flex items-center gap-3 px-4 py-3">
                <span className="text-text-dim text-[11px] font-mono w-14 shrink-0">
                  {format(new Date(c.date), "d MMM", { locale: ptBR })}
                </span>
                <span className="text-text-dim font-mono text-[11px] w-14 shrink-0 hidden sm:block">{c.sha}</span>
                <span className="text-text text-[13px] flex-1 truncate">{c.message}</span>
                <span className="text-text-dim text-[11px] font-mono truncate max-w-[120px] hidden md:block">{c.author}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold shrink-0 ${CAT_TEXT[c.category] ?? "text-text-dim"} ${CAT_BG[c.category] ?? "bg-panel-2"}`}>
                  {c.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-text-dim text-[12px] font-mono">página {currentPage} de {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="btn ghost px-3 py-1.5 text-[12px] disabled:opacity-40 disabled:cursor-not-allowed">← anterior</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="btn ghost px-3 py-1.5 text-[12px] disabled:opacity-40 disabled:cursor-not-allowed">próxima →</button>
          </div>
        </div>
      )}
    </div>
  );
}
