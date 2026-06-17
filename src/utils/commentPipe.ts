export function commentPipe(count: number): string {
  if (count > 0) {
    const label = count === 1 ? 'comment' : 'comments';
    return `${count} ${label}`;
  }
  return 'discuss';
}
