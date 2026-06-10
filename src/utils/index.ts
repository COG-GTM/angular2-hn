/**
 * Equivalent of the Angular `comment` pipe (src/app/shared/pipes/comment.pipe.ts).
 * Returns a human-readable comment count, or "discuss" when there are no comments.
 */
export function formatCommentCount(count: number): string {
    if (count > 0) {
        const label = count === 1 ? 'comment' : 'comments';
        return `${count} ${label}`;
    }
    return 'discuss';
}

/** Whether a story URL points to an external link (mirrors the Angular `hasUrl` getter). */
export function hasExternalUrl(url?: string): boolean {
    return !!url && url.indexOf('http') === 0;
}
