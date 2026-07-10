/**
 * Formats a comment count for display, mirroring the Angular `CommentPipe`.
 * Returns `discuss` for 0, `1 comment` for 1, and `N comments` otherwise.
 */
export function formatCommentCount(count: number): string {
  if (count > 0) {
    const label = count === 1 ? 'comment' : 'comments';
    return `${count} ${label}`;
  }
  return 'discuss';
}
