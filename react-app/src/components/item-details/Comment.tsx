// PLACEHOLDER (Phase 1 scaffold) - replaced by the Phase 2B port.
import type { Comment as CommentModel } from '../../models/comment';

export interface CommentProps {
    comment: CommentModel;
}

export default function Comment({ comment }: CommentProps) {
    return <div>{comment.user}</div>;
}
