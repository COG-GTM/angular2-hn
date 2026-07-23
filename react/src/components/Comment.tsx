// Stub — replaced in Phase 5e with the ported recursive comment component.
import type { Comment as CommentModel } from '../models';

interface CommentProps {
    comment: CommentModel;
}

function Comment({ comment }: CommentProps) {
    return <div className="app-comment">{comment.user}</div>;
}

export default Comment;
