import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = 'https://node-hnapi.herokuapp.com';
const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

const endpoints = [
    'news?page=1',
    'news?page=2',
    'newest?page=1',
    'show?page=1',
    'ask?page=1',
    'jobs?page=1',
];

async function download(endpoint) {
    const response = await fetch(`${baseUrl}/${endpoint}`);
    if (!response.ok) {
        throw new Error(`Failed to download ${endpoint}: ${response.status}`);
    }
    return response.json();
}

function fileName(endpoint) {
    return `${endpoint.replace(/[/?=&]/g, '_')}.json`;
}

async function save(endpoint, payload) {
    await writeFile(join(fixturesDir, fileName(endpoint)), JSON.stringify(payload, null, 2));
}

await mkdir(fixturesDir, { recursive: true });

const feeds = {};
for (const endpoint of endpoints) {
    const payload = await download(endpoint);
    feeds[endpoint] = payload;
    await save(endpoint, payload);
}

const news = feeds['news?page=1'];
const story = news.find(item => item.comments_count > 5 && item.url?.startsWith('http'));
if (!story) {
    throw new Error('No news story with an external URL and >5 comments to use as the link-story fixture.');
}
const ask = feeds['ask?page=1'];
const textStory = ask.find(item => !item.url?.startsWith('http')) ?? ask[0];

for (const item of new Set([story.id, textStory.id])) {
    await save(`item/${item}`, await download(`item/${item}`));
}

// The public API no longer serves /user, so the profile fixture is synthesized
// and served to both apps through request interception.
for (const user of new Set([story.user, textStory.user])) {
    await save(`user/${user}`, {
        id: user,
        created: '10 years ago',
        karma: 12345,
        about: 'Parity fixture user. <a href="https://example.com">example.com</a>',
    });
}

await writeFile(
    join(fixturesDir, 'targets.json'),
    JSON.stringify({ storyId: story.id, textStoryId: textStory.id, userId: story.user }, null, 2)
);

console.log('fixtures saved', { storyId: story.id, textStoryId: textStory.id, userId: story.user });
