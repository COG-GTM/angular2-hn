import type { Comment as CommentModel } from '../shared/models';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

/**
 * Foundation placeholder for the recursive comment (former `<app-comment>`).
 * Track B replaces this with the ported `CommentComponent`, rendering itself for `comment.comments`.
 */
export function Comment({ comment }: CommentProps) {
    return (
        <div className="app-comment">
            <div className="meta">{comment.user}</div>
        </div>
    );
}
