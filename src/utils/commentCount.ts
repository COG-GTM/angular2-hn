/** Mirrors the Angular `comment` pipe: 0 -> "discuss", 1 -> "1 comment", n -> "n comments". */
export function commentCount(count: number): string {
    if (count > 0) {
        const noun = count === 1 ? 'comment' : 'comments';
        return `${count} ${noun}`;
    }
    return 'discuss';
}
