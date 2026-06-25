import { describe, it, expect } from "vitest";
import { groupBy, lastCommitAgo, buildTimeline } from "./commitStats";
import type { Commit } from "@/types";

function makeCommit(overrides: Partial<Commit> = {}): Commit {
  return {
    sha: "abc123",
    message: "feat: something",
    author: "alice",
    date: "2024-06-01T10:00:00Z",
    category: "feat",
    ...overrides,
  };
}

describe("groupBy", () => {
  it("counts commits by category", () => {
    const commits = [
      makeCommit({ category: "feat" }),
      makeCommit({ category: "fix" }),
      makeCommit({ category: "feat" }),
    ];
    expect(groupBy(commits, "category")).toEqual({ feat: 2, fix: 1 });
  });

  it("counts commits by author", () => {
    const commits = [
      makeCommit({ author: "alice" }),
      makeCommit({ author: "bob" }),
      makeCommit({ author: "alice" }),
    ];
    expect(groupBy(commits, "author")).toEqual({ alice: 2, bob: 1 });
  });

  it("returns empty object for empty input", () => {
    expect(groupBy([], "category")).toEqual({});
  });
});

describe("lastCommitAgo", () => {
  it("returns null when no commits match the category", () => {
    const commits = [makeCommit({ category: "feat" })];
    expect(lastCommitAgo(commits, "fix")).toBeNull();
  });

  it("returns null for empty commits", () => {
    expect(lastCommitAgo([], "feat")).toBeNull();
  });

  it("returns a string for matching commits", () => {
    const commits = [makeCommit({ category: "feat", date: new Date().toISOString() })];
    expect(lastCommitAgo(commits, "feat")).toBeTypeOf("string");
  });

  it("picks the most recent commit among multiple", () => {
    const older = makeCommit({ category: "feat", date: "2024-01-01T00:00:00Z" });
    const newer = makeCommit({ category: "feat", date: "2024-06-01T00:00:00Z" });
    const result = lastCommitAgo([older, newer], "feat");
    const resultReversed = lastCommitAgo([newer, older], "feat");
    expect(result).toBe(resultReversed);
  });
});

describe("buildTimeline", () => {
  it("returns empty array for no commits", () => {
    expect(buildTimeline([])).toEqual([]);
  });

  it("groups commits by day", () => {
    const commits = [
      makeCommit({ date: "2024-06-01T08:00:00Z" }),
      makeCommit({ date: "2024-06-01T18:00:00Z" }),
      makeCommit({ date: "2024-06-02T10:00:00Z" }),
    ];
    const result = buildTimeline(commits);
    expect(result).toHaveLength(2);
    expect(result[0].count).toBe(2);
    expect(result[1].count).toBe(1);
  });

  it("returns at most 20 entries", () => {
    const commits = Array.from({ length: 25 }, (_, i) =>
      makeCommit({ date: new Date(2024, 0, i + 1).toISOString() })
    );
    expect(buildTimeline(commits).length).toBeLessThanOrEqual(20);
  });

  it("returns entries sorted chronologically", () => {
    const commits = [
      makeCommit({ date: "2024-06-03T12:00:00Z" }),
      makeCommit({ date: "2024-06-01T12:00:00Z" }),
      makeCommit({ date: "2024-06-02T12:00:00Z" }),
    ];
    const result = buildTimeline(commits);
    expect(result[0].label).toBe("Jun 1");
    expect(result[1].label).toBe("Jun 2");
    expect(result[2].label).toBe("Jun 3");
  });
});
