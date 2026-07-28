/**
 * Formats a comment count for display, mirroring Angular's `CommentPipe`.
 * Returns "discuss" for 0, "1 comment" for one, and "N comments" otherwise.
 */
export function formatCommentCount(comment: number): string {
  if (comment > 0) {
    const label = comment === 1 ? 'comment' : 'comments';
    return `${comment} ${label}`;
  }
  return 'discuss';
}
