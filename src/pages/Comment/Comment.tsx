import type { Comment as CommentModel } from '../../models/comment';
import './Comment.scss';

interface CommentProps {
  comment: CommentModel;
}

// TODO(child-session): port CommentComponent (collapse, nested comments).
export default function Comment({ comment }: CommentProps) {
  return <div className="comment-tree">{comment.user}</div>;
}
