import type { Comment as CommentModel } from '../../shared/models';

export interface CommentProps {
    comment: CommentModel;
}

/** PLACEHOLDER (Phase 2 · Item details). Recursive comment tree. */
export function Comment({ comment }: CommentProps) {
    return (
        <div className="comment placeholder" data-testid="comment-placeholder">
            <span>
                Comment placeholder by {comment.user} (#{comment.id})
            </span>
            {comment.comments?.map((child) => (
                <Comment key={child.id} comment={child} />
            ))}
        </div>
    );
}
