export function formatCommentCount(comment: number): string {
    if (comment > 0) {
        return `${comment} ${comment === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}
