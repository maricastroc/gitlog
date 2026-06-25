"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export type Option = { value: string; label: string; group?: string };
type Props = { value: string; onValueChange: (v: string) => void; options: Option[]; placeholder?: string };

export default function TagSelect({ value, onValueChange, options, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  const ungrouped = filtered.filter((o) => !o.group);
  const groups = [...new Set(filtered.filter((o) => o.group).map((o) => o.group!))];

  function select(val: string) {
    onValueChange(val);
    setOpen(false);
    setSearch("");
  }

  function renderItem(opt: Option, wrap = false) {
    const active = opt.value === value;
    return (
      <button key={opt.value} onClick={() => select(opt.value)}
        className={`flex items-start gap-2 w-full px-3 py-1.5 rounded-md text-[12px] font-mono text-left cursor-pointer outline-none hover:bg-panel hover:text-text transition-colors ${
          active ? "text-add" : "text-text-dim"
        }`}>
        <span className="w-3 shrink-0 mt-px">
          {active && <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />}
        </span>
        <span className={wrap ? "break-all leading-snug" : "truncate"}>{opt.label}</span>
      </button>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(""); }}>
      <Popover.Trigger className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-panel-2 border border-line text-text font-mono text-[13px] cursor-pointer outline-none gap-2 hover:border-text-dim transition-colors">
        <span className="truncate">{selected ? selected.label : <span className="text-text-dim">{placeholder}</span>}</span>
        <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-text-dim shrink-0" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={4} className="z-50 w-[var(--radix-popover-trigger-width)] bg-panel-2 border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-1.5 border-b border-line">
            <div className="flex items-center gap-2 px-2">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-3 text-text-dim shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-[12px] font-mono text-text outline-none focus:outline-none focus-visible:outline-none w-full py-1.5 placeholder:text-text-dim/50"
              />
            </div>
          </div>
          <div className="p-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-line scrollbar-track-transparent">
            {ungrouped.map((o) => renderItem(o, false))}
            {groups.map((group, i) => (
              <div key={group}>
                {(ungrouped.length > 0 || i > 0) && <div className="my-1 h-px bg-line mx-1" />}
                <p className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-widest text-text-dim/50 select-none">{group}</p>
                {filtered.filter((o) => o.group === group).map((o) => renderItem(o, true))}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-[12px] font-mono text-text-dim/50 text-center">No results</p>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
