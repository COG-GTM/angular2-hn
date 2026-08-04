export function formatCommentCount(count: number | undefined): string {
    if (count !== undefined && count > 0) {
        const label = count === 1 ? 'comment' : 'comments';
        return `${count} ${label}`;
    }
    return 'discuss';
}
