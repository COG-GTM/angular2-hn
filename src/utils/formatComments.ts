export function formatComments(count: number): string {
  if (count > 0) {
    const word = count === 1 ? 'comment' : 'comments';
    return `${count} ${word}`;
  }
  return 'discuss';
}
