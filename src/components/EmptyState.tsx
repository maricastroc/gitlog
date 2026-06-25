import Button from "@/components/Button";
import { Text } from "@/components/Text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export function EmptyState({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
      <div className="w-14 h-14 rounded-xl bg-panel border border-line flex items-center justify-center text-2xl text-line">▣</div>
      <div className="flex flex-col gap-1.5">
        <Text variant="md">No repository selected</Text>
        <Text variant="sm" className="max-w-xs">Point to a GitHub or local repository to view the commit history.</Text>
      </div>
      <Button onClick={onSelect} className="px-5 py-2.5"><FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Select repository</Button>
    </div>
  );
}
