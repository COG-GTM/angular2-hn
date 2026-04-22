import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../types/comment';

interface CommentProps {
    comment: CommentType;
}

export function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div>
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className="comment">
            <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                <span className="collapse" onClick={() => setCollapse((c) => !c)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                {!collapse && (
                    <div>
                        <p
                            className="comment-text"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                        <ul className="subtree">
                            {comment.comments?.map((subComment) => (
                                <li key={subComment.id}>
                                    <Comment comment={subComment} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
