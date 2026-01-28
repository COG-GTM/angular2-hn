/**
 * Comment interface for Hacker News comments.
 * Based on the Angular app's comment.ts model.
 * Note: comments is recursive - it's an array of Comment objects for nested replies.
 */
export interface Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted: boolean;
  comments: Comment[];
}
