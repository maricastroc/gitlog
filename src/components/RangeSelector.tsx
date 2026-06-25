"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faScroll } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import TagSelect from "@/components/TagSelect";
import type { Ref } from "@/types";
import { buildRefOptions } from "@/lib/refOptions";

type Props = {
  refs: Ref[];
  from: string;
  to: string;
  isLoading: boolean;
  error: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onBack: () => void;
  onGenerate: () => void;
};

export function RangeSelector({
  refs,
  from,
  to,
  isLoading,
  error,
  onFromChange,
  onToChange,
  onBack,
  onGenerate,
}: Props) {
  const { fromOptions, toOptions } = buildRefOptions(refs);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="From">
          <TagSelect
            value={from}
            onValueChange={onFromChange}
            options={fromOptions}
            placeholder="beginning of history"
          />
        </FormField>
        <FormField label="To">
          <TagSelect value={to} onValueChange={onToChange} options={toOptions} placeholder="HEAD" />
        </FormField>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="px-4 py-3">
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" /> back
        </Button>
        <Button onClick={onGenerate} loading={isLoading} className="flex-1 py-3">
          <FontAwesomeIcon icon={faScroll} className="w-3 h-3" /> Generate changelog{" "}
          <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </Button>
      </div>
      {from && to && from === to && (
        <p className="text-yellow-400 text-[12px] font-mono">
          From and To are the same ref — the result will be empty.
        </p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
