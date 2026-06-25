type Props = { className?: string };

export default function TruncatedBanner({ className = "" }: Props) {
  return (
    <div
      className={`px-3 py-2 rounded-lg bg-[var(--color-fix)]/10 text-[var(--color-fix)] text-xs font-mono ${className}`}
      style={{ border: "1px solid rgba(255, 255, 255, 0.12)" }}
    >
      Showing the first 1,000 commits. Use a narrower range to see the full history.
    </div>
  );
}
