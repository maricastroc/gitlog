import { useState } from "react";

type TimelineEntry = { label: string; count: number };

type Props = {
  timeline: TimelineEntry[];
  selectedDay: string | null;
  onSelectDay: (day: string | null) => void;
};

export default function CommitActivityChart({ timeline, selectedDay, onSelectDay }: Props) {
  const [hoveredBar, setHoveredBar] = useState<{
    label: string;
    count: number;
    index: number;
  } | null>(null);
  const maxBar = Math.max(...timeline.map((t) => t.count), 1);

  return (
    <div className="panel">
      <p className="text-text-dim text-[10px] uppercase tracking-widest mb-4">Commit activity</p>
      <div className="relative flex items-end gap-0.5" style={{ height: 96 }}>
        {hoveredBar && (
          <div
            className="absolute bottom-full mb-2 px-2 py-1 bg-panel-2 border border-line rounded text-[11px] font-mono text-text whitespace-nowrap pointer-events-none z-10"
            style={{
              left: `${(hoveredBar.index / timeline.length) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {hoveredBar.label} · {hoveredBar.count} commit{hoveredBar.count !== 1 ? "s" : ""}
          </div>
        )}
        {timeline.map((t, i) => {
          const isSelected = selectedDay === t.label;
          return (
            <div
              key={t.label}
              className="flex-1 h-full flex flex-col justify-end cursor-pointer"
              onMouseEnter={() => setHoveredBar({ ...t, index: i })}
              onMouseLeave={() => setHoveredBar(null)}
              onClick={() => onSelectDay(isSelected ? null : t.label)}
            >
              <div
                className={`w-full rounded-sm transition-all ${
                  isSelected
                    ? "bg-add opacity-100 ring-1 ring-add"
                    : hoveredBar?.label === t.label
                      ? "bg-add opacity-100"
                      : "bg-add opacity-50"
                }`}
                style={{ height: `${Math.max((t.count / maxBar) * 100, 8)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-text-dim text-[10px] font-mono">{timeline[0]?.label}</span>
        <span className="text-text-dim text-[10px] font-mono">{timeline.at(-1)?.label}</span>
      </div>
    </div>
  );
}
