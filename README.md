# Gitlog

![gitlog_preview](./preview.png)

A full-stack changelog generator that turns Git commit history into structured, exportable changelogs — built with Next.js, TypeScript, and the GitHub API.

[Live demo →](https://maricastroc-gitlog.vercel.app/)

---

## Highlights

**Commit categorization engine** — commits are classified into categories (feat, fix, chore, docs, refactor, style, test) through a two-pass system: first checking user-defined keyword rules, then falling back to conventional commit prefixes, and finally running a broad regex pass against common vocabulary. The entire logic lives in a single pure function (`api/commits/index.ts: categorize`) with no external dependencies.

**Debounced repository preview** — as you type a GitHub URL, a live preview card fetches the repo metadata (stars, forks, description) with a 600ms debounce, so the API is only hit once you pause typing (`useRepoPreview.ts`).

**Stateful multi-step flow** — the repository loading flow (URL → tags → commits) is managed by a custom hook (`useRepoLoader.ts`) that exposes a minimal patch-based state updater, keeping all async transitions in one place and making each step independently resettable.

**Recent repositories** — previously analyzed repos are persisted to `localStorage` and shown as one-click shortcuts, restoring both the tab (remote/local) and the URL or path.

**Tag-range filtering** — instead of loading all commits, you pick a `from` and `to` tag, and the API resolves each tag ref to its SHA before querying the GitHub commits endpoint — so the range is always precise.

**Interactive commit activity chart** — the overview displays a bar chart of commit frequency over time. Clicking a bar filters the "Recent activity" list to show only commits from that day, with a dismissible chip showing the active filter.

---

## Features

- **Commit overview** — total counts by category, activity timeline, distribution bars, and top contributors at a glance
- **Commits table** — full list with per-row category editor, date filter, and author filter
- **Changelog view** — commits grouped and sorted by category, with one-click copy to clipboard or export as `.md`
- **Authors view** — per-contributor breakdown showing their commits, categories, and dates
- **Configurable settings** — toggle conventional commits detection, merge commit filtering, squash inclusion, and define keyword rules per category
- **Remote & local repos** — GitHub repos via URL (with optional token for private repos or rate limit bypass); local repos by filesystem path when running locally
- **Exportable markdown** — generated changelog is ready to paste into a `CHANGELOG.md`

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| HTTP client | Axios + SWR |
| UI primitives | Radix UI (Select, Popover) |
| Icons | Font Awesome |
| Date handling | date-fns |
| Deploy | Vercel |

---

## Project Structure

```
src/
├── components/         # UI components (SelectRepo, Overview, CommitsView, ChangelogView...)
├── dashboard/          # DashboardClient — top-level state and view routing
├── hooks/
│   ├── useRepoLoader.ts    # Multi-step async flow: tags → commits
│   ├── useRepoPreview.ts   # Debounced GitHub metadata fetch
│   ├── useRecentRepos.ts   # localStorage-backed recent repos
│   └── useRequest.ts       # Generic SWR wrapper
├── lib/                # Axios instances (api, githubApi)
├── pages/api/
│   ├── commits/        # Commit fetch + categorization (remote & local)
│   └── tags/           # Tag list (remote & local)
├── styles/             # Global CSS and Tailwind theme
└── types.ts            # Shared TypeScript types (Commit, RepoInfo, View, Settings)
```

---

## Running Locally

Prerequisites: Node.js 18+, Git

```bash
git clone https://github.com/maricastroc/gitlog.git
cd gitlog
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** the "Local repo" tab (analyzing repos by filesystem path) is only available when running locally. On the deployed version, only remote GitHub repositories are supported.
