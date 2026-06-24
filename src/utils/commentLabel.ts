export function commentLabel(count: number): string {
    if (count > 0) {
        const st = count === 1 ? 'comment' : 'comments';
        return `${count} ${st}`;
    }
    return 'discuss';
}
