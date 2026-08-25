import { Comment as CommentModel } from '../models/comment';

export interface CommentProps {
    comment: CommentModel;
}

export function Comment({ comment }: CommentProps) {
    return <div>Comment: {comment.content}</div>;
}
