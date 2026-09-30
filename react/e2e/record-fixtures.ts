import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://node-hnapi.herokuapp.com';
const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'];
const outDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

interface FeedEntry {
    id: number;
    user: string | null;
    comments_count: number;
}

const responses: Record<string, unknown> = {};

async function record<T>(path: string): Promise<T> {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    const body = (await res.json()) as T;
    responses[path] = body;
    return body;
}

const feeds: Record<string, FeedEntry[]> = {};
for (const feed of FEEDS) {
    feeds[feed] = await record<FeedEntry[]>(`/${feed}?page=1`);
}
await record(`/news?page=2`);

const item = feeds.news.find((s) => s.comments_count >= 10 && s.comments_count <= 60) ?? feeds.news[0];
const askItem =
    [...feeds.ask].filter((s) => s.comments_count > 0).sort((a, b) => a.comments_count - b.comments_count)[0] ??
    feeds.ask[0];
await record(`/item/${item.id}`);
await record(`/item/${askItem.id}`);
const userId = item.user ?? 'pg';
let userSource = 'node-hnapi';
try {
    await record(`/user/${userId}`);
} catch {
    // node-hnapi's /user endpoint is offline upstream; synthesize its response shape from the official HN API.
    userSource = 'hacker-news.firebaseio.com (mapped to node-hnapi shape)';
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/user/${userId}.json`);
    const hn = (await res.json()) as { id: string; created: number; karma: number; about?: string };
    const years = Math.floor((Date.now() / 1000 - hn.created) / (365.25 * 24 * 3600));
    responses[`/user/${userId}`] = {
        id: hn.id,
        created_time: hn.created,
        created: years > 1 ? `${years} years ago` : 'a year ago',
        karma: hn.karma,
        avg: null,
        about: hn.about ?? '',
    };
}

const meta = { recordedAt: new Date().toISOString(), itemId: item.id, askItemId: askItem.id, userId, userSource };
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'api.json'), JSON.stringify(responses));
writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
console.log(`Recorded ${Object.keys(responses).length} responses`, meta);
