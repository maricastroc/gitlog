import { describe, it, expect } from "vitest";
import { categorize } from "./categorize";

describe("conventional commits", () => {
  it("categorizes feat: prefix", () => expect(categorize("feat: add login")).toBe("feat"));
  it("categorizes fix: prefix", () => expect(categorize("fix: null pointer")).toBe("fix"));
  it("categorizes docs: prefix", () => expect(categorize("docs: update readme")).toBe("docs"));
  it("categorizes refactor: prefix", () => expect(categorize("refactor: extract helper")).toBe("refactor"));
  it("categorizes chore: prefix as refactor", () => expect(categorize("chore: bump deps")).toBe("refactor"));
  it("categorizes test: prefix", () => expect(categorize("test: add unit tests")).toBe("test"));
  it("categorizes style: prefix", () => expect(categorize("style: fix indentation")).toBe("style"));

  it("handles scope — feat(auth): message", () => expect(categorize("feat(auth): add OAuth")).toBe("feat"));
  it("handles scope — fix(api): message", () => expect(categorize("fix(api): timeout error")).toBe("fix"));
  it("handles breaking change — feat!: message", () => expect(categorize("feat!: drop Node 14")).toBe("feat"));
  it("handles breaking change with scope — fix(core)!: message", () => expect(categorize("fix(core)!: remove deprecated method")).toBe("fix"));
});

describe("keyword fallback", () => {
  it("detects 'bug' in message", () => expect(categorize("bug in auth flow")).toBe("fix"));
  it("detects 'hotfix'", () => expect(categorize("hotfix login crash")).toBe("fix"));
  it("detects 'fixed'", () => expect(categorize("fixed broken redirect")).toBe("fix"));
  it("detects 'resolves'", () => expect(categorize("resolves issue with header")).toBe("fix"));

  it("detects 'feature' in message", () => expect(categorize("feature: dark mode")).toBe("feat"));
  it("detects 'added'", () => expect(categorize("added user profile page")).toBe("feat"));
  it("detects 'implement'", () => expect(categorize("implement retry logic")).toBe("feat"));
  it("detects 'new'", () => expect(categorize("new onboarding flow")).toBe("feat"));

  it("detects 'readme'", () => expect(categorize("update readme")).toBe("docs"));
  it("detects 'changelog'", () => expect(categorize("update changelog")).toBe("docs"));
  it("detects 'comments'", () => expect(categorize("update comments in utils")).toBe("docs"));

  it("detects 'rename'", () => expect(categorize("rename helper to utils")).toBe("refactor"));
  it("detects 'rewrite'", () => expect(categorize("rewrite auth module")).toBe("refactor"));
  it("detects 'moving'", () => expect(categorize("moving components to shared")).toBe("refactor"));

  it("detects 'vitest'", () => expect(categorize("configure vitest setup")).toBe("test"));
  it("detects 'coverage'", () => expect(categorize("improve coverage for hooks")).toBe("test"));

  it("detects 'css'", () => expect(categorize("update css variables")).toBe("style"));
  it("detects 'prettier'", () => expect(categorize("run prettier on all files")).toBe("style"));
  it("detects 'icon'", () => expect(categorize("replace icon in header")).toBe("style"));

  it("detects 'upgrade'", () => expect(categorize("upgrade next to v14")).toBe("refactor"));
  it("detects 'ci'", () => expect(categorize("update ci pipeline")).toBe("refactor"));
  it("detects 'deploy'", () => expect(categorize("deploy script update")).toBe("refactor"));
});

describe("userKeywords override", () => {
  const keywords = { infra: ["terraform", "k8s"], security: ["cve", "audit"] };

  it("matches user keyword", () => expect(categorize("update terraform config", keywords)).toBe("infra"));
  it("matches user keyword case-insensitively", () => expect(categorize("K8S rollout fix", keywords)).toBe("infra"));
  it("user keyword takes precedence over conventional commits", () =>
    expect(categorize("feat: audit log", keywords)).toBe("security"));
  it("falls through to conventional when no keyword matches", () =>
    expect(categorize("feat: add search", keywords)).toBe("feat"));
});

describe("edge cases", () => {
  it("returns 'other' for unrecognized message", () => expect(categorize("wip")).toBe("other"));
  it("returns 'other' for empty string", () => expect(categorize("")).toBe("other"));
  it("is case-insensitive for conventional prefix", () => expect(categorize("FEAT: something")).toBe("feat"));
  it("does not match partial prefix — 'feature:' is not conventional", () =>
    expect(categorize("feature: dark mode")).toBe("feat")); // falls to keyword match
});
