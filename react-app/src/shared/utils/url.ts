// `hasUrl` getter shared by the Angular item and item-details components.
export function hasExternalUrl(url: string | undefined | null): boolean {
    return typeof url === 'string' && url.indexOf('http') === 0;
}

export function listStart(page: number, pageSize = 30): number {
    return (page - 1) * pageSize + 1;
}
