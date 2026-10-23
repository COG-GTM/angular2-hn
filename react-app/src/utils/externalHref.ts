import { isSafeHref } from './sanitizeHtml';

/**
 * Angular's `hasUrl` (`url.indexOf('http') === 0`), tightened: returns the original `url` only when it is a
 * safe absolute http(s) URL, else `null`. `null` means "link to `/item/:id` instead" (Ask/Show/text posts have
 * HN-relative urls like `item?id=123`). The raw string is returned (not `new URL(url).href`) to keep Angular's
 * exact href.
 */
export function externalHref(url: string | null | undefined): string | null {
    if (typeof url !== 'string' || !/^http[sS]?:\/\//.test(url) || !isSafeHref(url)) return null;
    try {
        const { protocol } = new URL(url);
        return protocol === 'http:' || protocol === 'https:' ? url : null;
    } catch {
        return null;
    }
}
