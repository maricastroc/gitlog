import { useState, useEffect, useRef } from "react";
import { githubApi } from "@/lib/axios";
import type { RepoPreview } from "@/components/RepoPreviewPanel";

export function useRepoPreview(owner: string | null, repo: string | null, token: string) {
  const [preview, setPreview] = useState<RepoPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!owner || !repo) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [repoRes, releasesRes] = await Promise.all([
          githubApi.get<RepoPreview>(`/repos/${owner}/${repo}`, { headers }),
          githubApi.get(`/repos/${owner}/${repo}/releases?per_page=1`, { headers }).catch(() => null),
        ]);

        let releases: number | undefined;
        if (releasesRes) {
          const link = releasesRes.headers?.link as string | undefined;
          if (link) {
            const match = link.match(/page=(\d+)>; rel="last"/);
            if (match) releases = parseInt(match[1], 10);
          } else if (Array.isArray(releasesRes.data)) {
            releases = releasesRes.data.length;
          }
        }

        setPreview({ ...repoRes.data, _releases: releases });
      } catch {
        setPreview(null);
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [owner, repo, token]);

  return { preview: owner && repo ? preview : null, loading };
}
