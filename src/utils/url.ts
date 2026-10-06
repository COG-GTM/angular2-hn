export function hasExternalUrl(url: string | null | undefined): boolean {
    return typeof url === 'string' && url.indexOf('http') === 0;
}

export function linkTargetProps(openInNewTab: boolean): { target?: string; rel?: string } {
    return openInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}
