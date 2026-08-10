import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Comment } from '../../shared/models/comment';
import './comment.component.scss';

export default function CommentItem({ comment }: { comment: Comment }) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="comment-block">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className="comment-block">
            <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                <span className="collapse" onClick={() => setCollapse(!collapse)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
                    <ul className="subtree">
                        {(comment.comments ?? []).map(subComment => (
                            <li key={subComment.id}>
                                <CommentItem comment={subComment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
