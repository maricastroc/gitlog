"use client";

import type { ButtonHTMLAttributes } from "react";
import Spinner from "@/components/Spinner";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  loading?: boolean;
};

const VARIANTS = {
  primary: "bg-add-dim text-add border border-add hover:brightness-110",
  ghost: "bg-transparent text-text-dim border border-line hover:text-text",
  outline: "bg-transparent text-text-dim border border-line hover:text-text hover:border-text-dim",
};

export default function Button({
  variant = "primary",
  loading,
  children,
  disabled,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-mono text-[13px] cursor-pointer transition-all disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    >
      {loading && <Spinner color={variant === "primary" ? "border-add" : "border-text-dim"} />}
      {children}
    </button>
  );
}
