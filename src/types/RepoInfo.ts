export type RepoInfo = {
  type: "local" | "remote";
  label: string;
  path?: string;
  owner?: string;
  repo?: string;
  token?: string;
  from?: string;
  to?: string;
};
