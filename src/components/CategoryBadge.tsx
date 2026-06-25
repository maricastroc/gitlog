import { catStyle } from "@/lib/categoryStyles";

type Props = { category: string; className?: string };

export default function CategoryBadge({ category, className = "" }: Props) {
  const s = catStyle(category);
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-[var(--radius-pill)] uppercase tracking-wider font-semibold shrink-0 ${s.text} ${s.bg} ${className}`}>
      {category}
    </span>
  );
}
