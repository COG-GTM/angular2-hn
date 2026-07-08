// Stub — replaced by the ItemDetails/Comment migration child session.
import { Comment } from '../shared/models/comment';

export function CommentItem({ comment }: { comment: Comment }) {
    return <div>{comment.user}</div>;
}
