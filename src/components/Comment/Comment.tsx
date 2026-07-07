import { Comment as CommentModel } from '../../models/comment';

interface CommentProps {
  comment: CommentModel;
}

// Placeholder — implemented in the item-details migration slice.
export default function Comment({ comment }: CommentProps) {
  return <div>{comment.user}</div>;
}
