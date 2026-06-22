import type { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";

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
      const raw = execSync(`git -C "${path}" tag --sort=-creatordate`, { encoding: "utf8" });
      const tags = raw.trim().split("\n").filter(Boolean);
      return res.json({ data: tags });
    } catch {
      return res.status(500).json({ error: "Falha ao ler tags do repositório local" });
    }
  }

  if (!owner || !repo) return res.status(400).json({ error: "owner e repo são obrigatórios" });
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=50`, { headers });
  if (!ghRes.ok) {
    const err = await ghRes.json();
    return res.status(ghRes.status).json({ error: err.message });
  }
  const data = await ghRes.json();
  return res.json({ data: data.map((t: any) => t.name) });
}
