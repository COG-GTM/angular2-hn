/** Port of Angular's `comment` pipe: `> 0` → `'1 comment'` / `'N comments'`, otherwise `'discuss'`. */
export function commentLabel(count: number | null | undefined): string {
    if (typeof count === 'number' && count > 0) {
        return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}
