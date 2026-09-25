export function commentCount(comments: number): string {
    if (comments > 0) {
        const label = comments === 1 ? 'comment' : 'comments';
        return `${comments} ${label}`;
    }
    return 'discuss';
}
