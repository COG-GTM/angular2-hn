// Shared fixture resolver used by both the React MSW mocks and the Playwright
// cross-parity route interception. Maps a node-hnapi request path to a recorded
// JSON response, or null when no fixture exists (used to exercise error states).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));

function load(name: string): unknown {
  return JSON.parse(readFileSync(join(dir, name), 'utf-8'));
}

export function resolveFixture(pathname: string, page?: string): unknown | null {
  const path = pathname.replace(/^\//, '');
  const feedMatch = path.match(/^(news|newest|show|ask|jobs)$/);
  if (feedMatch) {
    const feed = feedMatch[1];
    const p = page || '1';
    try {
      return load(`feed-${feed}-${p}.json`);
    } catch {
      return null;
    }
  }
  const itemMatch = path.match(/^item\/(\d+)$/);
  if (itemMatch) {
    try {
      return load(`item-${itemMatch[1]}.json`);
    } catch {
      return null;
    }
  }
  const userMatch = path.match(/^user\/(.+)$/);
  if (userMatch) {
    try {
      return load(`user-${userMatch[1]}.json`);
    } catch {
      return null;
    }
  }
  return null;
}
