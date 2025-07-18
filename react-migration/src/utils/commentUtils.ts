/**
 * Formats comment count similar to Angular CommentPipe
 * @param comment - Number of comments
 * @returns Formatted string: "1 comment", "5 comments", or "discuss" for 0
 */
export const formatCommentCount = (comment: number): string => {
  if (comment > 0) {
    const suffix = comment === 1 ? 'comment' : 'comments';
    return `${comment} ${suffix}`;
  }
  return 'discuss';
};
