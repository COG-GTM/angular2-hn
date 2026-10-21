import { isSafeHref } from '../../shared/utils';

/**
 * Angular `hasUrl` (`url.indexOf('http') === 0`), tightened: only a parseable, safe http(s) URL renders as an
 * external link. Everything else (HN-relative `item?id=N` for Ask/Show/text posts) links to `/item/:id`.
 */
export function externalHref(url: string | null | undefined): string | null {
    if (typeof url !== 'string' || url.indexOf('http') !== 0 || !isSafeHref(url)) return null;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
    } catch {
        return null;
    }
}
