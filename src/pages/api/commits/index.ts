import type { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const type = req.query.type as string | undefined;
  const repoPath = req.query.path as string | undefined;
  const owner = req.query.owner as string | undefined;
  const repo = req.query.repo as string | undefined;
  const token = req.query.token as string | undefined;
  const since = req.query.since as string | undefined;
  const until = req.query.until as string | undefined;
  const keywordsRaw = req.query.keywords as string | undefined;
  const userKeywords: Record<string, string[]> = keywordsRaw ? JSON.parse(keywordsRaw) : {};

  if (type === "local") {
    if (!repoPath) return res.status(400).json({ error: "path is required" });
    try {
      const range = since && until ? `${since}..${until}` : since ? `${since}..HEAD` : "";
      const cmd = `git -C "${repoPath}" log ${range} --format="%H|%s|%aN|%aI" --no-merges`;
      const raw = execSync(cmd, { encoding: "utf8" });
      const commits = raw.trim().split("\n").filter(Boolean).map((line) => {
        const [sha, message, author, date] = line.split("|");
        return { sha: sha.slice(0, 7), message, author, date, category: categorize(message, userKeywords) };
      });
      return res.json({ data: commits });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : "Failed to read local repository" });
    }
  }

  if (!owner || !repo) return res.status(400).json({ error: "owner and repo are required" });

  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  async function resolveSha(ref: string) {
    if (!ref || ref === "HEAD") return null;
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/tags/${ref}`, { headers });
    if (!r.ok) return null;
    const d = await r.json() as { object?: { sha?: string } };
    return d.object?.sha ?? null;
  }

  const params = new URLSearchParams({ per_page: "100" });
  if (since && since !== "HEAD") {
    const sha = await resolveSha(since);
    if (sha) params.set("sha", sha);
  }

  const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?${params}`, { headers });
  if (!ghRes.ok) {
    const err = await ghRes.json() as { message?: string };
    return res.status(ghRes.status).json({ error: err.message });
  }

  type GhCommit = {
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
  };

  const data: GhCommit[] = await ghRes.json();
  const commits = data.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split("\n")[0],
    author: c.commit.author.name,
    date: c.commit.author.date,
    category: categorize(c.commit.message.split("\n")[0], userKeywords),
  }));

  return res.json({ data: commits });
}

function categorize(message: string, userKeywords: Record<string, string[]> = {}): string {
  const m = message.toLowerCase();

  for (const [cat, words] of Object.entries(userKeywords)) {
    if (words.some((w) => m.includes(w.toLowerCase()))) return cat;
  }
  if (/^feat(\(.+\))?[!:]/.test(m)) return "feat";
  if (/^fix(\(.+\))?[!:]/.test(m)) return "fix";
  if (/^chore(\(.+\))?[!:]/.test(m)) return "chore";
  if (/^docs(\(.+\))?[!:]/.test(m)) return "docs";
  if (/^refactor(\(.+\))?[!:]/.test(m)) return "refactor";
  if (/^test(\(.+\))?[!:]/.test(m)) return "test";
  if (/^style(\(.+\))?[!:]/.test(m)) return "style";
  if (/\b(fix(e[sd]|ing)?|bug|hotfix|patch|resolve[sd]?|resolving)\b/.test(m)) return "fix";
  if (/\b(feat(ure)?|add(s|ed|ing)?|implement(s|ed|ing)?|creat(e[sd]?|ing)|introduc(e[sd]?|ing)|new)\b/.test(m)) return "feat";
  if (/\b(doc(s|ument(s|ed|ing)?)?|readme|changelog|comment(s|ed|ing)?)\b/.test(m)) return "docs";
  if (/\b(refactor(s|ed|ing)?|renam(e[sd]?|ing)|rewrite|rewrit|restructur|reorganiz|mov(e[sd]?|ing))\b/.test(m)) return "refactor";
  if (/\b(test(s|ed|ing)?|spec|coverage|assert|jest|vitest|cypress)\b/.test(m)) return "test";
  if (/\b(style[sd]?|styling|format(s|ted|ting)?|lint(s|ed|ing)?|prettier|css|design|layout|ui|ux|spacing|padding|margin|color|font|icon)\b/.test(m)) return "style";
  if (/\b(chore|updat(e[sd]?|ing)|upgrad(e[sd]?|ing)|bump(s|ed|ing)?|remov(e[sd]?|ing)|delet(e[sd]?|ing)|clean(s|ed|ing|up)?|adjust(s|ed|ing)?|config|setup|build|ci|cd|deploy|script|depend|migrat)\b/.test(m)) return "chore";
  return "other";
}
