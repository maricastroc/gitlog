import type { NextApiRequest, NextApiResponse } from "next";
import { spawnSync } from "child_process";
import type { Ref } from "@/types";

const GITHUB_NAME_RE = /^[a-zA-Z0-9_.-]{1,100}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const type = req.query.type as string | undefined;
  const path = req.query.path as string | undefined;
  const owner = req.query.owner as string | undefined;
  const repo = req.query.repo as string | undefined;
  const token = req.query.token as string | undefined;

  if (type === "local") {
    if (!path) return res.status(400).json({ error: "path is required" });
    try {
      const tagResult = spawnSync("git", ["-C", path, "tag", "--sort=-creatordate"], {
        encoding: "utf8",
      });
      if (tagResult.error || tagResult.status !== 0)
        throw new Error(tagResult.stderr?.trim() || "git tag failed");
      const branchResult = spawnSync("git", ["-C", path, "branch", "--format=%(refname:short)"], {
        encoding: "utf8",
      });
      if (branchResult.error || branchResult.status !== 0)
        throw new Error(branchResult.stderr?.trim() || "git branch failed");
      const rawTags = tagResult.stdout;
      const rawBranches = branchResult.stdout;
      const tags: Ref[] = rawTags
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((n) => ({ name: n, type: "tag" }));
      const branches: Ref[] = rawBranches
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((n) => ({ name: n, type: "branch" }));
      return res.json({ data: [...branches, ...tags] });
    } catch {
      return res.status(500).json({ error: "Failed to read refs from local repository" });
    }
  }

  if (!owner || !repo) return res.status(400).json({ error: "owner and repo are required" });
  if (!GITHUB_NAME_RE.test(owner) || !GITHUB_NAME_RE.test(repo)) {
    return res.status(400).json({ error: "Invalid owner or repo name" });
  }

  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const [tagsRes, branchesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=50`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=50`, { headers }),
  ]);

  if (!tagsRes.ok) {
    const err = (await tagsRes.json()) as { message?: string };
    return res.status(tagsRes.status).json({ error: err.message ?? "GitHub API error" });
  }

  const tagsData = (await tagsRes.json()) as { name: string }[];
  const branchesData = branchesRes.ok ? ((await branchesRes.json()) as { name: string }[]) : [];

  const tags: Ref[] = tagsData.map((t) => ({ name: t.name, type: "tag" }));
  const branches: Ref[] = branchesData.map((b) => ({ name: b.name, type: "branch" }));

  return res.json({ data: [...branches, ...tags] });
}
