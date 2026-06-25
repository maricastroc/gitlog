import type { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";
import { categorize } from "@/lib/categorize";

const GITHUB_NAME_RE = /^[a-zA-Z0-9_.-]{1,100}$/;
const SAFE_REF_RE = /^[a-zA-Z0-9_./@-]{1,200}$/;

function parseKeywords(raw: string | undefined): Record<string, string[]> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) return {};
    return parsed as Record<string, string[]>;
  } catch {
    return {};
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const type = req.query.type as string | undefined;
  const repoPath = req.query.path as string | undefined;
  const owner = req.query.owner as string | undefined;
  const repo = req.query.repo as string | undefined;
  const token = req.query.token as string | undefined;
  const since = req.query.since as string | undefined;
  const until = req.query.until as string | undefined;
  const userKeywords = parseKeywords(req.query.keywords as string | undefined);
  const ignoreMerge = req.query.ignoreMerge === "true";
  const conventionalCommits = req.query.conventionalCommits !== "false";
  const ignoreBots = req.query.ignoreBots === "true";

  const BOT_RE = /\[bot\]|dependabot|renovate|github-actions|snyk|codecov|semantic-release/i;

  if (type === "local") {
    if (!repoPath) return res.status(400).json({ error: "path is required" });
    if (repoPath.includes('"') || repoPath.includes("\0")) {
      return res.status(400).json({ error: "Invalid path" });
    }
    if (since && !SAFE_REF_RE.test(since))
      return res.status(400).json({ error: "Invalid since ref" });
    if (until && !SAFE_REF_RE.test(until))
      return res.status(400).json({ error: "Invalid until ref" });
    try {
      const range = since && until ? `${since}..${until}` : since ? `${since}..HEAD` : "";
      const cmd = `git -C "${repoPath}" log ${range} --format="%H|%s|%aN|%aI"${ignoreMerge ? " --no-merges" : ""}`;
      const raw = execSync(cmd, { encoding: "utf8" });
      const commits = raw
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [sha, message, author, date] = line.split("|");
          return {
            sha: sha.slice(0, 7),
            message,
            author,
            date,
            category: categorize(message, userKeywords, conventionalCommits),
          };
        })
        .filter((c) => !ignoreBots || !BOT_RE.test(c.author));
      return res.json({ data: commits });
    } catch (e) {
      return res
        .status(500)
        .json({ error: e instanceof Error ? e.message : "Failed to read local repository" });
    }
  }

  if (!owner || !repo) return res.status(400).json({ error: "owner and repo are required" });
  if (!GITHUB_NAME_RE.test(owner) || !GITHUB_NAME_RE.test(repo)) {
    return res.status(400).json({ error: "Invalid owner or repo name" });
  }
  if (since && !SAFE_REF_RE.test(since))
    return res.status(400).json({ error: "Invalid since ref" });
  if (until && !SAFE_REF_RE.test(until))
    return res.status(400).json({ error: "Invalid until ref" });

  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  async function resolveSha(ref: string): Promise<string | null> {
    if (!ref || ref === "HEAD") return null;
    for (const prefix of ["tags", "heads"]) {
      const r = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/${prefix}/${ref}`,
        { headers },
      );
      if (r.ok) {
        const d = (await r.json()) as { object?: { sha?: string; type?: string } };
        let sha = d.object?.sha;
        if (sha && d.object?.type === "tag") {
          const tagRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/tags/${sha}`,
            { headers },
          );
          if (tagRes.ok) {
            const tag = (await tagRes.json()) as { object?: { sha?: string } };
            sha = tag.object?.sha ?? sha;
          }
        }
        if (sha) return sha;
      }
    }
    return null;
  }

  async function resolveDate(ref: string): Promise<string | null> {
    const sha = await resolveSha(ref);
    if (!sha) return null;
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
      headers,
    });
    if (!r.ok) return null;
    const d = (await r.json()) as { commit?: { author?: { date?: string } } };
    return d.commit?.author?.date ?? null;
  }

  const params = new URLSearchParams({ per_page: "100" });
  if (since && since !== "HEAD") {
    const sha = await resolveSha(since);
    if (sha) params.set("sha", sha);
  }
  if (until && until !== "HEAD") {
    const date = await resolveDate(until);
    if (date) params.set("until", date);
  }

  type GhCommit = {
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
  };

  const MAX_PAGES = 10;

  async function fetchAllPages(
    url: string,
  ): Promise<{ data: GhCommit[]; status: number; error?: string; truncated?: boolean }> {
    const all: GhCommit[] = [];
    let next: string | null = url;
    let pages = 0;
    while (next) {
      const r = await fetch(next, { headers });
      if (!r.ok) {
        const err = (await r.json()) as { message?: string };
        return { data: [], status: r.status, error: err.message ?? "GitHub API error" };
      }
      const page: GhCommit[] = await r.json();
      all.push(...page);
      pages++;
      const link: string = r.headers.get("link") ?? "";
      const match: RegExpMatchArray | null = link.match(/<([^>]+)>;\s*rel="next"/);
      next = match ? match[1] : null;
      if (pages >= MAX_PAGES) return { data: all, status: 200, truncated: !!next };
    }
    return { data: all, status: 200 };
  }

  const { data, status, error, truncated } = await fetchAllPages(
    `https://api.github.com/repos/${owner}/${repo}/commits?${params}`,
  );
  if (error) return res.status(status).json({ error });

  const MERGE_RE = /^Merge (pull request|branch)\b/i;

  const commits = data
    .filter((c) => !ignoreMerge || !MERGE_RE.test(c.commit.message))
    .filter((c) => !ignoreBots || !BOT_RE.test(c.commit.author.name))
    .map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0],
      author: c.commit.author.name,
      date: c.commit.author.date,
      category: categorize(c.commit.message.split("\n")[0], userKeywords, conventionalCommits),
    }));

  return res.json({ data: commits, truncated: truncated ?? false });
}
