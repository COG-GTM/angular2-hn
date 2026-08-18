import * as fs from 'fs';
import * as path from 'path';
import { BrowserContext } from 'playwright';
import { ASK_ID, STORY_ID } from './matrix';

const FIXTURES = path.join(__dirname, 'fixtures');

const readFixture = (name: string): string => fs.readFileSync(path.join(FIXTURES, `${name}.json`), 'utf8');

/**
 * Both apps talk to the same Hacker News API host, so a single interception rule
 * serves byte-identical payloads to the Angular and the React build.
 */
export const API_GLOB = 'https://node-hnapi.herokuapp.com/**';

function fixtureFor(url: URL): string | null {
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length === 1 && ['news', 'newest', 'show', 'ask', 'jobs'].includes(segments[0])) {
        const page = url.searchParams.get('page') || '1';
        const name = `${segments[0]}-${page}`;
        return fs.existsSync(path.join(FIXTURES, `${name}.json`)) ? name : null;
    }
    if (segments[0] === 'item') {
        if (segments[1] === String(ASK_ID)) {
            return 'item-ask';
        }
        if (segments[1] === String(STORY_ID)) {
            return 'item-story';
        }
        return null;
    }
    if (segments[0] === 'user') {
        return 'user';
    }
    return null;
}

export async function mockApi(context: BrowserContext, fail: boolean): Promise<void> {
    await context.route(API_GLOB, async (route) => {
        if (fail) {
            await route.abort('failed');
            return;
        }
        const fixture = fixtureFor(new URL(route.request().url()));
        if (!fixture) {
            await route.fulfill({ status: 404, contentType: 'application/json', body: 'null' });
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: readFixture(fixture),
        });
    });
}
