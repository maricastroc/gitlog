# Gitlog

<img width="3204" height="1722" alt="preview" src="https://github.com/user-attachments/assets/4bbb2a23-76ee-4dea-b17a-b80ef06468b9" />


A full-stack changelog generator that turns Git commit history into structured, exportable changelogs — built with Next.js, TypeScript, and the GitHub API.

[Live demo →](https://gitlog.marianacastro.dev/)

---

## Highlights

**Commit categorization engine** — commits are classified into categories (feat, fix, chore, docs, refactor, style, test) through a two-pass system: first checking user-defined keyword rules, then falling back to conventional commit prefixes, and finally running a broad regex pass against common vocabulary. The entire logic lives in a single pure function (`api/commits/index.ts: categorize`) with no external dependencies.

**Debounced repository preview** — as you type a GitHub URL, a live preview card fetches the repo metadata (stars, forks, description) with a 600ms debounce, so the API is only hit once you pause typing (`useRepoPreview.ts`).

**Stateful multi-step flow** — the repository loading flow (URL → tags → commits) is managed by a custom hook (`useRepoLoader.ts`) that exposes a minimal patch-based state updater, keeping all async transitions in one place and making each step independently resettable.

**Recent repositories** — previously analyzed repos are persisted to `localStorage` and shown as one-click shortcuts, restoring both the tab (remote/local) and the URL or path.

**Branch & tag comparison** — the range selector lists both branches and tags in grouped dropdowns (with live search), so you can compare `main` vs `develop`, `v1.0` vs `v2.0`, or any combination. The API resolves each ref — trying `tags/` first, then `heads/` — so branch names and tag names are handled transparently.

**Interactive commit activity chart** — the overview displays a bar chart of commit frequency over time. Clicking a bar filters the "Recent activity" list to show only commits from that day, with a dismissible chip showing the active filter.

**Changelog time grouping** — the generated changelog can be grouped by month or week within each category, making long histories easier to read. The grouping is reflected in all export formats (`.md` gets `###` sub-headings, `.json` gets a `periods` array).

**Release diff** — the overview exposes a "Compare with another range" panel that fetches a second commit range and renders a side-by-side category breakdown: current count, delta (`+4`, `-2`), percentage share before and after, and a growth multiplier (`1.5× growth`). The available refs (branches and tags) are reused from the initial load, so no extra API call is needed when opening the panel (`ReleaseDiff.tsx`).

**Shareable permalink** — after loading a remote repository, the URL is updated with `?repo=owner/repo&from=ref&to=ref` query params. Opening that URL auto-fetches the same commits and lands directly on the overview, so analysis results can be shared with a single link. A "share" button in the overview header copies the current URL to the clipboard.

---

## Features

- **Commit overview** — total counts by category, activity timeline, distribution bars, and top contributors at a glance
- **Commits table** — full list with per-row category editor, date filter, and author filter
- **Changelog view** — commits grouped by category, with optional time sub-grouping (by month or week) and one-click copy or export as `.md`, `.txt`, or `.json`
- **Authors view** — per-contributor breakdown showing their commits, categories, and dates
- **Configurable settings** — toggle conventional commits detection, merge commit filtering, squash inclusion, and define keyword rules per category
- **Branch & tag comparison** — range selectors list branches and tags in grouped, searchable dropdowns — compare `main` vs `develop` or `v1.0` vs `v2.0` directly
- **Release diff** — compare two commit ranges side by side with per-category deltas, percentage shares, and growth multipliers
- **Shareable permalink** — URL encodes the repository and range so any analysis can be shared as a direct link; auto-loads on open
- **Remote & local repos** — GitHub repos via URL (with optional token for private repos or rate limit bypass); local repos by filesystem path when running locally
- **Multi-format export** — generated changelog can be exported as `.md` (ready to paste into `CHANGELOG.md`), `.txt` (plain text for terminals and legacy systems), or `.json` (structured with metadata for CI/CD pipelines)

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
