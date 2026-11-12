/** Stories without an external link (e.g. Ask HN) have a relative `item?id=` url. */
export function hasExternalUrl(url: string | undefined): boolean {
    return !!url && url.indexOf('http') === 0;
}
