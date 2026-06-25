export type RepoPreview = {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
  language: string | null;
  pushed_at: string | null;
  private: boolean;
  _releases?: number;
};
