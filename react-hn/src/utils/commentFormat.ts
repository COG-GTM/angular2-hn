// Port of Angular's CommentPipe (src/app/shared/pipes/comment.pipe.ts).
export function formatComments(comment: number): string {
  if (comment > 0) {
    const st = comment === 1 ? 'comment' : 'comments';
    return `${comment} ${st}`;
  }
  return 'discuss';
}
