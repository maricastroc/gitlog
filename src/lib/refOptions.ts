import type { Ref } from "@/types";

type Option = { value: string; label: string; group?: string };

export function buildRefOptions(refs: Ref[]): { fromOptions: Option[]; toOptions: Option[] } {
  const branches = refs.filter((r) => r.type === "branch").map((r) => ({ value: r.name, label: r.name, group: "Branches" }));
  const tags     = refs.filter((r) => r.type === "tag"   ).map((r) => ({ value: r.name, label: r.name, group: "Tags"     }));

  return {
    fromOptions: [{ value: "", label: "beginning of history" }, ...branches, ...tags],
    toOptions:   [{ value: "HEAD", label: "HEAD" },             ...branches, ...tags],
  };
}
