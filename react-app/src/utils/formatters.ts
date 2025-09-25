export const formatCommentCount = (count: number): string => {
  if (count > 0) {
    const text = count === 1 ? 'comment' : 'comments';
    return `${count} ${text}`;
  }
  return 'discuss';
};

export const formatTimeAgo = (timeAgo: number | string): string => {
  if (typeof timeAgo === 'string') {
    return timeAgo;
  }
  return `${timeAgo} minutes ago`;
};
