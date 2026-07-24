import type { Comment as CommentModel } from '../models';

interface CommentProps {
    comment: CommentModel;
}

function Comment({ comment }: CommentProps) {
    return <div>{comment.user}</div>;
}

export default Comment;
