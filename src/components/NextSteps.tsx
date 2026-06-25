"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircle } from "@fortawesome/free-solid-svg-icons";

export const FLOW_STEPS = [
  "Fetch branches & tags",
  "Select comparison range",
  "Categorize commits",
  "Generate changelog",
  "Export as .md, .txt or .json",
];

export function NextSteps({ doneUntil }: { doneUntil: number }) {
  return (
    <div className="flex flex-col gap-1 mt-5">
      <p className="font-display text-text-dim text-[10px] uppercase tracking-widest mb-2">
        Next steps
      </p>
      {FLOW_STEPS.map((label, i) => {
        const done = i < doneUntil;
        return (
          <div key={label} className="flex items-center gap-2.5 py-1">
            <FontAwesomeIcon
              icon={done ? faCircleCheck : faCircle}
              className={`w-2.5 h-2.5 shrink-0 ${done ? "text-add" : "text-line"}`}
            />
            <span
              className={`text-[12px] font-mono ${done ? "text-text-dim line-through decoration-line" : "text-text-dim"}`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
