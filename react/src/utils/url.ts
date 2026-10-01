/**
 * Port of the Angular `hasUrl` getter (feeds/item, item-details): true when
 * the story links off-site rather than to an HN self post (`item?id=…`).
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  return (url ?? '').indexOf('http') === 0;
}

/**
 * Display domain as node-hnapi reports it in `domain`: the URL host without a
 * leading `www.`; `undefined` for self posts and unparsable URLs.
 */
export function domainOf(url: string | null | undefined): string | undefined {
  if (!url || !/^https?:\/\//i.test(url)) {
    return undefined;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
