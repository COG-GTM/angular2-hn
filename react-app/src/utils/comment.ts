/** Port of the Angular `comment` pipe: `0 -> "discuss"`, `1 -> "1 comment"`, `n -> "n comments"`. */
export function formatCommentCount(count: number): string {
  if (count > 0) {
    return `${count} ${count === 1 ? 'comment' : 'comments'}`;
  }
  return 'discuss';
}
