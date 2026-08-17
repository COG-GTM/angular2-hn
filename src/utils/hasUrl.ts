export function hasUrl(url?: string): boolean {
    return !!url && url.indexOf('http') === 0;
}
