export function categorize(
  message: string,
  userKeywords: Record<string, string[]> = {},
  conventionalCommits = true,
): string {
  const m = message.toLowerCase();

  for (const [cat, words] of Object.entries(userKeywords)) {
    if (words.some((w) => m.includes(w.toLowerCase()))) return cat;
  }
  if (conventionalCommits) {
    if (/^feat(\(.+\))?[!:]/.test(m)) return "feat";
    if (/^fix(\(.+\))?[!:]/.test(m)) return "fix";
    if (/^chore(\(.+\))?[!:]/.test(m)) return "refactor";
    if (/^docs(\(.+\))?[!:]/.test(m)) return "docs";
    if (/^refactor(\(.+\))?[!:]/.test(m)) return "refactor";
    if (/^test(\(.+\))?[!:]/.test(m)) return "test";
    if (/^style(\(.+\))?[!:]/.test(m)) return "style";
  }
  if (/\b(fix(e[sd]|ing)?|bug|hotfix|patch|resolve[sd]?|resolving)\b/.test(m)) return "fix";
  if (
    /\b(feat(ure)?|add(s|ed|ing)?|implement(s|ed|ing)?|creat(e[sd]?|ing)|introduc(e[sd]?|ing)|new)\b/.test(
      m,
    )
  )
    return "feat";
  if (/\b(doc(s|ument(s|ed|ing)?)?|readme|changelog|comment(s|ed|ing)?)\b/.test(m)) return "docs";
  if (
    /\b(refactor(s|ed|ing)?|renam(e[sd]?|ing)|rewrite|rewrit|restructur|reorganiz|mov(e[sd]?|ing))\b/.test(
      m,
    )
  )
    return "refactor";
  if (/\b(test(s|ed|ing)?|spec|coverage|assert|jest|vitest|cypress)\b/.test(m)) return "test";
  if (
    /\b(style[sd]?|styling|format(s|ted|ting)?|lint(s|ed|ing)?|prettier|css|design|layout|ui|ux|spacing|padding|margin|color|font|icon)\b/.test(
      m,
    )
  )
    return "style";
  if (
    /\b(chore|updat(e[sd]?|ing)|upgrad(e[sd]?|ing)|bump(s|ed|ing)?|remov(e[sd]?|ing)|delet(e[sd]?|ing)|clean(s|ed|ing|up)?|adjust(s|ed|ing)?|config|setup|build|ci|cd|deploy|script|depend|migrat)\b/.test(
      m,
    )
  )
    return "refactor";
  return "other";
}
