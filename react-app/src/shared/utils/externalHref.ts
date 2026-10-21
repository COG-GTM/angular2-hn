import { isSafeHref } from './sanitizeHtml';

/**
 * Angular `hasUrl` (`url.indexOf('http') === 0`), tightened: only a parseable, safe, absolute `http(s)://` URL renders
 * as an external link. Everything else (HN-relative `item?id=N` for Ask/Show/text posts) links to `/item/:id`.
 * Scheme-only forms like `https:example.com` are rejected: `new URL` accepts them, but as an href the browser resolves
 * them relative to the page.
 */
const ABSOLUTE_HTTP = /^https?:\/\//;

export function externalHref(url: string | null | undefined): string | null {
    if (typeof url !== 'string' || !ABSOLUTE_HTTP.test(url) || !isSafeHref(url)) return null;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : null;
    } catch {
        return null;
    }
}
