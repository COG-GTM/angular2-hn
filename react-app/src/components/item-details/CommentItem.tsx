import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../../models/comment';
import './CommentItem.scss';

interface CommentItemProps {
    comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
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
        <div>
            <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                <span className="collapse" onClick={() => setCollapse(!collapse)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div style={{ display: collapse ? 'none' : 'block' }}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
                    <ul className="subtree">
                        {comment.comments &&
                            comment.comments.map((subComment) => (
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
