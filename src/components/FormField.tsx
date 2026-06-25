import type { ReactNode } from "react";

type Props = { label: string; children: ReactNode; hint?: string };

const INPUT_CLS =
  "w-full px-4 py-3 rounded-lg bg-panel-2 border border-line text-text font-mono text-[13px] outline-none focus:border-text-dim transition-colors placeholder:text-text-dim";

export { INPUT_CLS };

export default function FormField({ label, children, hint }: Props) {
  return (
    <div>
      <label className="block text-[10px] text-text-dim uppercase tracking-widest mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-text-dim mt-1.5 font-mono">{hint}</p>}
    </div>
  );
}
