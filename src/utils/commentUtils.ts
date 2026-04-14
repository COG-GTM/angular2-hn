export function formatCommentCount(count: number): string {
  if (count > 0) {
    return `${count} comment${count === 1 ? '' : 's'}`;
  }
  return 'discuss';
}
