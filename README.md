# GitHub Repo Discovery Tracker — New Repos by Topic/Language

Find new GitHub repositories matching a keyword, language, or topic,
created within a chosen time window and sorted by stars.

Built for tech scouting, VC deal sourcing, and developer relations teams
tracking what's emerging in an OSS ecosystem — this is a discovery tool
for repos you don't know about yet, not a watcher for repos you already
depend on (see [GitHub Release Tracker](https://apify.com/m_ctim/github-release-tracker)
for that).

## Input

```json
{
  "keyword": "llm agent",
  "language": "Python",
  "topic": "",
  "minStars": 50,
  "daysBack": 30,
  "maxResults": 25
}
```

| Field | Type | Description |
|---|---|---|
| `keyword` | string (optional) | Free-text search across repo name and description. |
| `language` | string (optional) | Programming language to filter by, e.g. `"Python"`, `"TypeScript"`, `"Rust"`. |
| `topic` | string (optional) | GitHub topic tag to filter by, e.g. `"web-scraping"`, `"llm-agent"`. |
| `minStars` | number | Only return repos with at least this many stars. Default `0`. |
| `daysBack` | number | How many days back from today to search, by repo creation date. Default `30`, max `180`. |
| `maxResults` | number | Max repos to return, most starred first. Default `25`, max `100`. |

## Output

One record per repo:

```json
{
  "fullName": "D4Vinci/Scrapling",
  "description": "An adaptive Web Scraping framework that handles everything from a single request to a full-scale crawl!",
  "url": "https://github.com/D4Vinci/Scrapling",
  "owner": "D4Vinci",
  "language": "Python",
  "stars": 73954,
  "forks": 7397,
  "openIssues": 3,
  "topics": ["ai", "automation", "crawler", "python", "scraping", "web-scraping"],
  "license": "BSD-3-Clause",
  "createdAt": "2024-10-13T20:29:53Z",
  "pushedAt": "2026-08-11T18:45:32Z"
}
```

A search with no matching repos returns no items but is still billed
once for the search.

## How it works

Direct calls to the official [GitHub REST Search
API](https://docs.github.com/en/rest/search) (`api.github.com`) — no
proxy, no key, no scraping.

## Pricing note

Billed per **search**, not per repo returned — one charge whether the
search returns 0 repos or 100.

## Related products

- [GitHub Release Tracker](https://apify.com/m_ctim/github-release-tracker): watches specific repos you already know for new releases, rather than discovering new ones
