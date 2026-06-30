/**
 * Port of the Angular `comment` pipe.
 * Formats a comment count into a human readable label.
 */
export function commentLabel(comment: number): string {
  if (comment > 0) {
    const st = comment === 1 ? 'comment' : 'comments';
    return `${comment} ${st}`;
  }
  return 'discuss';
}
