/**
 * Port of Angular `CommentPipe` (`{{ count | comment }}`).
 * Formats a comment count as "discuss", "1 comment" or "N comments".
 */
export function formatCommentCount(count: number | null | undefined): string {
    if (count && count > 0) {
        const st = count === 1 ? 'comment' : 'comments';
        return `${count} ${st}`;
    }
    return 'discuss';
}
