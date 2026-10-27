import { Actor, log } from 'apify';
import { fetchRepos } from './github.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { keyword, language, topic, minStars = 0, daysBack = 30, maxResults = 25 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const REPO_SEARCH_EVENT = 'repo-search';

const endDate = new Date();
const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

const repos = await fetchRepos({
    keyword,
    language,
    topic,
    minStars,
    startDate,
    endDate,
    maxResults: Math.min(maxResults, 100),
});

for (const repo of repos) {
    await Actor.pushData({ rowType: 'repo', ...repo });
}

await Actor.charge({ eventName: REPO_SEARCH_EVENT });

log.info(`Pushed ${repos.length} repo(s)`);

await Actor.exit();
