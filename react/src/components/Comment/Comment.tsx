import type { Comment as CommentModel } from '../../models/comment';

export function Comment({ comment }: { comment: CommentModel }) {
  return <div className="comment">{comment.content}</div>;
}

export default Comment;
