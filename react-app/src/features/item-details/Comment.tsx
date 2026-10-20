import type { Comment as CommentModel } from '../../shared/models';

export interface CommentProps {
    comment: CommentModel;
}

/** Placeholder — Item-details child ports Angular `item-details/comment` (recursive tree). */
export function Comment({ comment }: CommentProps) {
    return <div data-testid="comment">Comment placeholder: {comment.user}</div>;
}
