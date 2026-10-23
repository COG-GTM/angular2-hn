import type { Comment as CommentModel } from '../../types';

export interface CommentProps {
    comment: CommentModel;
}

/** PLACEHOLDER (Phase 3 replaces): port of src/app/item-details/comment (recursive). */
export function Comment({ comment }: CommentProps) {
    return <div data-testid="comment-placeholder">{comment.user}</div>;
}
