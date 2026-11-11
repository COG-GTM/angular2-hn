export function formatCommentCount(count: number): string {
  return count > 0 ? `${count} ${count === 1 ? 'comment' : 'comments'}` : 'discuss';
}
