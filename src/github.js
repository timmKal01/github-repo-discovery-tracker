const BASE_URL = 'https://api.github.com/search/repositories';
const UA = 'GithubRepoDiscoveryTracker/0.1 (+contact: github-repo-discovery-admin@example.com)';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 15_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { ...options, signal: controller.signal });
        } catch (err) {
            lastError = err.name === 'AbortError' ? new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`) : err;
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * 2 ** (attempt - 1));
                continue;
            }
            throw lastError;
        } finally {
            clearTimeout(timeoutId);
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

function toDateOnly(date) {
    return date.toISOString().slice(0, 10);
}

function buildQuery({ keyword, language, topic, minStars, startDate, endDate }) {
    const parts = [];
    if (keyword) parts.push(keyword);
    if (language) parts.push(`language:${language}`);
    if (topic) parts.push(`topic:${topic}`);
    if (minStars > 0) parts.push(`stars:>=${minStars}`);
    parts.push(`created:${toDateOnly(startDate)}..${toDateOnly(endDate)}`);
    return parts.join(' ');
}

export async function fetchRepos({ keyword, language, topic, minStars, startDate, endDate, maxResults }) {
    const url = new URL(BASE_URL);
    url.searchParams.set('q', buildQuery({ keyword, language, topic, minStars, startDate, endDate }));
    url.searchParams.set('sort', 'stars');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('per_page', String(maxResults));

    const res = await fetchWithRetry(url, {
        headers: {
            'User-Agent': UA,
            Accept: 'application/vnd.github+json',
            Connection: 'close',
        },
    });
    const body = await res.json();
    const items = body.items ?? [];

    return items.map((r) => ({
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        owner: r.owner?.login ?? null,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        openIssues: r.open_issues_count,
        topics: r.topics ?? [],
        license: r.license?.spdx_id ?? null,
        createdAt: r.created_at,
        pushedAt: r.pushed_at,
    }));
}
