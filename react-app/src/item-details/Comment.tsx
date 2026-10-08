import type { Comment as CommentModel } from '../shared/models';

// Placeholder: ported by the item details + comments workstream (src/app/item-details/comment).
export function Comment({ comment }: { comment: CommentModel }) {
    return <span>{comment.user}</span>;
}
