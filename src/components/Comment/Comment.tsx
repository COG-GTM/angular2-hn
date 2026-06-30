import { Comment as CommentModel } from '../../models/comment';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

// STUB — implemented by a child session.
export default function Comment({ comment }: CommentProps) {
    return <div>{comment.user}</div>;
}
