export function formatCommentCount(commentCount: number): string {
  if (commentCount > 0) {
    return `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`;
  }
  return 'discuss';
}
