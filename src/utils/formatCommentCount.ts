// Port of src/app/shared/pipes/comment.pipe.ts
export function formatCommentCount(count: number): string {
    if (count > 0) {
        const st = count === 1 ? 'comment' : 'comments';
        return `${count} ${st}`;
    }
    return 'discuss';
}
