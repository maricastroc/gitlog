"use client";

import * as Select from "@radix-ui/react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";

type Option = { value: string; label: string };
type Props = { value: string; onValueChange: (v: string) => void; options: Option[]; placeholder?: string };

export default function TagSelect({ value, onValueChange, options, placeholder }: Props) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-panel-2 border border-line text-text font-mono text-[13px] cursor-pointer outline-none gap-2 hover:border-text-dim transition-colors">
        <Select.Value placeholder={placeholder} />
        <Select.Icon><FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-text-dim" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={4} className="z-50 w-[var(--radix-select-trigger-width)] bg-panel-2 border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item key={opt.value} value={opt.value}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-mono text-text-dim cursor-pointer outline-none data-[highlighted]:bg-panel data-[highlighted]:text-text data-[state=checked]:text-add">
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
