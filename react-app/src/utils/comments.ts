/**
 * Comment count formatting utilities.
 * These functions help format comment counts for display.
 */

/**
 * Formats a comment count to a human-readable string.
 * @param count - Number of comments
 * @returns Formatted comment count string
 */
export function formatCommentCount(count: number): string {
  if (count === 0) {
    return 'no comments';
  }
  if (count === 1) {
    return '1 comment';
  }
  return `${count} comments`;
}

/**
 * Formats a comment count with abbreviated numbers for large counts.
 * @param count - Number of comments
 * @returns Abbreviated comment count string (e.g., "1.2k comments")
 */
export function formatCommentCountAbbreviated(count: number): string {
  if (count === 0) {
    return 'no comments';
  }
  if (count === 1) {
    return '1 comment';
  }
  if (count < 1000) {
    return `${count} comments`;
  }
  if (count < 1000000) {
    const abbreviated = (count / 1000).toFixed(1).replace(/\.0$/, '');
    return `${abbreviated}k comments`;
  }
  const abbreviated = (count / 1000000).toFixed(1).replace(/\.0$/, '');
  return `${abbreviated}m comments`;
}
