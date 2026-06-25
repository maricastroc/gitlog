export function EmptyState({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
      <div className="w-14 h-14 rounded-xl bg-panel border border-line flex items-center justify-center text-2xl text-line">▣</div>
      <div className="flex flex-col gap-1.5">
        <p className="text-text text-[15px]">No repository selected</p>
        <p className="text-text-dim text-xs max-w-xs">Point to a GitHub or local repository to view the commit history.</p>
      </div>
      <button onClick={onSelect} className="btn text-[13px] px-5 py-2.5">→ Select repository</button>
    </div>
  );
}
