/** Port of Angular's `comment` pipe: 0 → 'discuss', 1 → '1 comment', n → 'n comments'. */
export function commentLabel(count: number | null | undefined): string {
    if (typeof count === 'number' && count > 0) {
        return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}
