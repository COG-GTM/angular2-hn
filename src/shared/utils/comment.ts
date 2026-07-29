export function commentLabel(comments: number): string {
    if (comments > 0) {
        return `${comments} ${comments === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}
