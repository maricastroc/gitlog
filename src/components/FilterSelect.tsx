import * as Select from "@radix-ui/react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: Option[];
};

export default function FilterSelect({ value, onValueChange, placeholder, options }: Props) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 bg-panel border border-line rounded-lg text-[12px] font-mono text-text cursor-pointer outline-none hover:border-text-dim focus:border-add transition-colors gap-2">
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-text-dim shrink-0" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-50 w-[var(--radix-select-trigger-width)] bg-panel border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <Select.Viewport className="p-1 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-mono text-text-dim cursor-pointer outline-none data-[highlighted]:bg-panel-2 data-[highlighted]:text-text data-[state=checked]:text-add"
              >
                <Select.ItemIndicator>
                  <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />
                </Select.ItemIndicator>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
