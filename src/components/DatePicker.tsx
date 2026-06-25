"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faXmark } from "@fortawesome/free-solid-svg-icons";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function DatePicker({ value, onChange, placeholder = "dd/mm/aaaa" }: Props) {
  const [open, setOpen] = useState(false);

  const selected = value ? new Date(value + "T12:00:00") : undefined;

  const label = selected ? format(selected, "d MMM yyyy", { locale: ptBR }) : null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center justify-between w-full px-3 py-2 bg-panel border border-line rounded-lg text-[12px] font-mono text-text hover:border-text-dim focus:outline-none focus:border-add transition-colors cursor-pointer">
          <span className={label ? "text-text" : "text-text-dim"}>{label ?? placeholder}</span>
          <div className="flex items-center gap-2">
            {value && (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="text-text-dim hover:text-text transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
              </span>
            )}
            <FontAwesomeIcon icon={faCalendar} className="w-3 h-3 text-text-dim" />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className="z-50 bg-panel border border-line rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-3 outline-none"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
            locale={ptBR}
            classNames={{
              root: "text-[12px] font-mono",
              month_grid: "w-full border-collapse",
              months: "relative",
              month: "gap-y-4",
              nav: "absolute inset-x-0 top-0 flex justify-between",
              button_previous: "p-1 text-text-dim hover:text-text transition-colors cursor-pointer",
              button_next: "p-1 text-text-dim hover:text-text transition-colors cursor-pointer",
              month_caption: "text-center text-text text-[13px] mb-3 font-mono",
              caption_label: "font-semibold",
              weekdays: "mb-1",
              weekday: "text-text-dim text-[10px] text-center w-8 pb-1",
              week: "",
              day: "text-center p-0",
              day_button:
                "w-8 h-8 rounded-md text-text-dim hover:bg-panel-2 hover:text-text transition-colors cursor-pointer",
              selected: "[&>button]:bg-add-dim [&>button]:text-add [&>button]:font-semibold",
              today: "[&>button]:border [&>button]:border-line",
              outside: "[&>button]:opacity-30",
              disabled: "[&>button]:opacity-20 [&>button]:cursor-not-allowed",
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
