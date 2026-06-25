"use client";

import * as Popover from "@radix-ui/react-popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";

type Props = {
  allAuthors: string[];
  selectedAuthors: Set<string>;
  onToggle: (author: string) => void;
  onToggleAll: () => void;
};

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${checked ? "bg-add border-add" : "border-line"}`}
    >
      {checked && <FontAwesomeIcon icon={faCheck} className="w-2 h-2 text-bg" />}
    </span>
  );
}

export default function AuthorFilter({
  allAuthors,
  selectedAuthors,
  onToggle,
  onToggleAll,
}: Props) {
  const label =
    selectedAuthors.size === allAuthors.length
      ? "All authors"
      : selectedAuthors.size === 0
        ? "No authors"
        : `${selectedAuthors.size} of ${allAuthors.length} authors`;

  const allSelected = selectedAuthors.size === allAuthors.length;

  return (
    <Popover.Root>
      <Popover.Trigger className="flex items-center gap-2 px-3 py-[9px] rounded-lg bg-panel-2 border border-line text-[11px] font-mono text-text-dim hover:text-text hover:border-text-dim transition-colors cursor-pointer outline-none">
        {label}
        <FontAwesomeIcon
          icon={faChevronDown}
          className="w-2 h-2 transition-transform data-[state=open]:rotate-180"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className="z-50 w-64 bg-panel-2 border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden outline-none"
        >
          <div className="p-1.5 border-b border-line">
            <button
              onClick={onToggleAll}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-mono text-text-dim hover:text-text hover:bg-panel transition-colors cursor-pointer text-left"
            >
              <Checkbox checked={allSelected} />
              Select all
            </button>
          </div>
          <div className="p-1 max-h-60 overflow-y-auto">
            {allAuthors.map((author) => (
              <button
                key={author}
                onClick={() => onToggle(author)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-mono text-text-dim hover:text-text hover:bg-panel transition-colors cursor-pointer text-left"
              >
                <Checkbox checked={selectedAuthors.has(author)} />
                <span className="truncate">{author}</span>
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
