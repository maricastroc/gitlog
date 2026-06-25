import type { HTMLAttributes } from "react";

type Variant = "micro" | "label" | "caption" | "sm" | "base" | "md" | "heading" | "hero";

type As = "p" | "span" | "h1" | "h2" | "h3" | "h4";

type Props = HTMLAttributes<HTMLElement> & {
  variant?: Variant;
  as?: As;
  dim?: boolean;
};

const VARIANT_CLASS: Record<Variant, string> = {
  micro: "text-micro   font-mono text-text-dim",
  label: "text-label   font-mono text-text-dim uppercase tracking-widest",
  caption: "text-caption font-mono text-text-dim",
  sm: "text-sm      font-mono text-text-dim",
  base: "text-base    font-mono text-text",
  md: "text-md      font-mono text-text",
  heading: "text-lg      font-display font-bold text-text",
  hero: "text-xl      font-display font-bold text-text leading-tight",
};

export function Text({ variant = "base", as: Tag = "p", dim, className = "", ...props }: Props) {
  const base = VARIANT_CLASS[variant];
  const dimClass = dim ? "text-text-dim" : "";
  return <Tag className={`${base} ${dimClass} ${className}`.trim()} {...props} />;
}
