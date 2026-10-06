export function formatCommentCount(count: number | null | undefined): string {
    if (count && count > 0) {
        return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}
