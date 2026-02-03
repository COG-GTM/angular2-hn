export const formatComment = (commentCount: number): string => {
  if (commentCount > 0) {
    const suffix = commentCount === 1 ? 'comment' : 'comments';
    return `${commentCount} ${suffix}`;
  }
  return 'discuss';
};
