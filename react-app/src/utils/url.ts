/** Stories submitted as text (Ask HN, polls, ...) have a relative url, external ones start with http. */
export function hasExternalUrl(url?: string): boolean {
    return typeof url === 'string' && url.indexOf('http') === 0;
}
