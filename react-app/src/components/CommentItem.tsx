import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Comment } from '../models';
import '../styles/Comment.scss';

interface CommentItemProps {
    comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="comment-component">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className="comment-component">
            <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                <span className="collapse" onClick={() => setCollapse(!collapse)}>
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
                            {comment.comments && comment.comments.map((sub) => (
                                <li key={sub.id}>
                                    <CommentItem comment={sub} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
