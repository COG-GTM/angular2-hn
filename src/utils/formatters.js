export function formatCommentCount(count) {
  if (count > 0) {
    const suffix = count === 1 ? 'comment' : 'comments';
    return `${count} ${suffix}`;
  }
  return 'discuss';
}
