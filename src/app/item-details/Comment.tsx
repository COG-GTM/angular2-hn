import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Comment as CommentModel } from '../shared/models/comment';
import './comment/comment.component.scss';

interface CommentProps {
    comment: CommentModel;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
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
                <div hidden={collapse}>
                    <p
                        className="comment-text"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content || '') }}
                    />
                    <ul className="subtree">
                        {comment.comments &&
                            comment.comments.map((subComment) => (
                                <li key={subComment.id}>
                                    <Comment comment={subComment} />
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Comment;
