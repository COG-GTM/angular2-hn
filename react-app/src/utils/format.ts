import DOMPurify from 'dompurify';

/** Port of the Angular `comment` pipe. */
export function formatCommentCount(count: number): string {
    if (count > 0) {
        return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}

/** Port of the `hasUrl` getter shared by ItemComponent and ItemDetailsComponent. */
export function hasExternalUrl(url: string | undefined): url is string {
    return !!url && url.indexOf('http') === 0;
}

export function feedListStart(page: number, pageSize: number): number {
    return (page - 1) * pageSize + 1;
}

/** Stand-in for Angular's built-in [innerHTML] sanitization. */
export function sanitizeHtml(html: string | undefined): string {
    return DOMPurify.sanitize(html ?? '');
}

export function externalLinkProps(openInNewTab: boolean) {
    return openInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}
