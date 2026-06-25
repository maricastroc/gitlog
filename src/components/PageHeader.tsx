import type { ReactNode } from "react";
type Props = { title: string; description?: ReactNode };

export default function PageHeader({ title, description }: Props) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-[22px] font-bold text-text mb-2">
        {title}
      </h2>
      <div className="h-px bg-line w-12 mb-3" />
      {description && <p className="text-text-dim text-sm">{description}</p>}
    </div>
  );
}
