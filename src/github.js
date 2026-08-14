const BASE_URL = 'https://api.github.com/search/repositories';
const UA = 'GithubRepoDiscoveryTracker/0.1 (+contact: github-repo-discovery-admin@example.com)';

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

    const res = await fetch(url, {
        headers: {
            'User-Agent': UA,
            Accept: 'application/vnd.github+json',
            Connection: 'close',
        },
    });
    if (!res.ok) {
        throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
    }
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
