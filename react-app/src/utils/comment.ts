/** Port of the Angular `comment` pipe: renders a comment count as a label. */
export function commentLabel(count: number): string {
    if (count > 0) {
        return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}
